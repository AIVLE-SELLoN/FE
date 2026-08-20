"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, ArrowRight } from "lucide-react";
import NotificationBell from "@/components/common/NotificationBell";
import { getDashboard } from "@/app/api/dashboard";
import type { ChannelSummaryItem, ActionSummaryItem, RecentAlertItem } from "@/app/api/dashboard/types";
import { ApiError } from "@/app/api/client";
import { CHANNEL_COLORS, CHANNEL_LABELS, type ChannelKey } from "@/lib/channelColors";

// 채널 색상은 공용 소스(@/lib/channelColors)만 참조 — 백엔드 channel 값("COUPANG" 등 대문자)을
// 공용 모듈의 소문자 키로 변환해서 연결한다. (channelCompare 페이지와 동일한 패턴)
function toChannelKey(channel: string): ChannelKey | null {
  const key = channel.toLowerCase();
  return key in CHANNEL_LABELS ? (key as ChannelKey) : null;
}

function channelDotColor(channel: string): string {
  const key = toChannelKey(channel);
  return key ? CHANNEL_COLORS[key] : "#9A9AA5";
}

function formatCount(n: number) {
  return `${n.toLocaleString()}건`;
}

function formatRating(rating: number | null) {
  return rating == null ? "-" : rating.toFixed(1);
}

function formatDetectedAt(iso: string | null) {
  if (!iso) return "-";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${Math.max(mins, 0)}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

export default function DashboardPage() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [channelSummary, setChannelSummary] = useState<ChannelSummaryItem[]>([]);
  const [actionSummary, setActionSummary] = useState<ActionSummaryItem[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<RecentAlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getDashboard("7D");
        if (ignore) return;
        setUnreadCount(data.unreadNotificationCount);
        setChannelSummary(data.channelSummary);
        setActionSummary(data.actionSummary);
        setRecentAlerts(data.recentAlerts);
      } catch (e) {
        if (!ignore) setError(e instanceof ApiError ? e.message : "대시보드 데이터를 불러오지 못했습니다.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex flex-1 flex-col bg-[#F8F8FC]">
        {/* Top bar */}
        <header className="flex h-[52px] items-center justify-between border-b border-slate-200 bg-white px-6">
          <span className="text-xs font-medium text-slate-900">대시보드</span>
          <NotificationBell />
        </header>

        <main className="flex flex-col gap-5 p-7">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">대시보드</h1>
            <p className="pt-1 text-xs text-slate-400">채널 전반의 현황을 한눈에 확인하세요</p>
          </div>

          <div className="flex flex-col gap-5 px-5">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Unconfirmed events banner — 실제 unreadNotificationCount가 0이면 자동으로 숨겨져요 */}
            {!loading && unreadCount > 0 && (
              <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-indigo-500/10 bg-indigo-50 p-6 shadow-[0_1px_3px_-1px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.1)] sm:flex-row sm:items-center">
                <div className="flex items-center gap-6">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-500 shadow-[0_10px_15px_-3px_rgba(99,102,241,0.2),0_4px_6px_-4px_rgba(99,102,241,0.2)]">
                    <Bell className="h-6 w-6 text-white" />
                  </span>
                  <div className="flex flex-col gap-2">
                    <p className="text-xl font-bold text-indigo-500">
                      아직 확인하지 않은 이상 징후가{" "}
                      <Link href="/alert" className="underline">
                        {unreadCount}건
                      </Link>{" "}
                      있어요.
                    </p>
                  </div>
                </div>
                <Link
                  href="/alert"
                  className="flex shrink-0 items-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-600"
                >
                  알림함 바로가기
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}

            {/* Channel summary */}
            <div>
              <div className="flex items-center gap-2.5 pb-3">
                <span className="h-4 w-0.5 rounded-full bg-indigo-500" />
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900">
                  채널별 현황 요약
                </h2>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  — CS 문의 · 주문 · 평균 평점
                </span>
              </div>

              {loading ? (
                <p className="py-8 text-center text-sm text-slate-400">불러오는 중...</p>
              ) : channelSummary.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">연동된 채널이 없어요.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
                  {channelSummary.map((ch) => (
                    <div
                      key={ch.channel}
                      className="rounded-[20px] border border-slate-100 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.07)]"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: channelDotColor(ch.channel) }}
                        />
                        <span className="text-sm font-bold text-slate-900">{ch.channelName}</span>
                        {/* 채널별 미해결 이상 건수 배지는 백엔드 집계 API가 아직 없어서 뺐어요. */}
                      </div>
                      <div className="mt-4 flex divide-x divide-slate-100">
                        <div className="flex-1 text-center">
                          <p className="text-[11px] font-medium text-slate-400">CS 문의</p>
                          <p className="pt-1 text-xl font-extrabold text-slate-900">{formatCount(ch.csCount)}</p>
                        </div>
                        <div className="flex-1 text-center">
                          <p className="text-[11px] font-medium text-slate-400">주문 건수</p>
                          <p className="pt-1 text-xl font-extrabold text-slate-900">{formatCount(ch.orderCount)}</p>
                        </div>
                        <div className="flex-1 text-center">
                          <p className="text-[11px] font-medium text-slate-400">평균 리뷰 평점</p>
                          <p className="pt-1 text-xl font-extrabold text-slate-900">{formatRating(ch.avgRating)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Now section: 조치 유형별 건수 + 최근 발생한 이상 알림 — 실제 연결 */}
            <div>
              <div className="flex items-center gap-2.5 pb-3.5 pt-2">
                <span className="h-4 w-0.5 rounded-full bg-indigo-500" />
                <h2 className="text-sm font-bold text-slate-900">지금 봐야 할 이슈</h2>
                <span className="text-xs text-slate-400">— 즉시 확인이 필요한 이상 탐지 항목</span>
              </div>

              <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[471px_1fr]">
                {/* 조치 유형별 건수 — 가로 바 리스트 */}
                <div className="rounded-[20px] border border-slate-100 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.07)]">
                  <p className="pb-5 text-[15px] font-bold text-slate-900">조치 유형별 건수</p>
                  {actionSummary.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-400">집계된 조치가 없어요.</p>
                  ) : (
                    <div className="flex flex-col gap-5">
                      {(() => {
                        const maxCount = Math.max(...actionSummary.map((a) => a.count), 1);
                        return actionSummary.map((item) => (
                          <div key={item.action}>
                            <div className="flex items-center justify-between pb-2 text-sm">
                              <span className="font-medium text-slate-700">{item.actionName}</span>
                              <span className="font-bold text-slate-900">{item.count}건</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-indigo-500"
                                style={{ width: `${(item.count / maxCount) * 100}%` }}
                              />
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                </div>

                {/* Recent alerts table */}
                <div className="overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
                    <h3 className="text-lg font-bold text-slate-900">최근 발생한 이상 알림</h3>
                    <Link
                      href="/alert"
                      className="flex items-center gap-1 text-sm font-bold text-indigo-500 hover:underline"
                    >
                      전체보기
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>

                  <div className="flex bg-slate-50/50 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    <div className="w-[42%] px-8 py-4">상품명 (채널)</div>
                    <div className="w-[38%] px-8 py-4">이상 유형</div>
                    <div className="w-[20%] px-8 py-4 text-right">상태</div>
                  </div>

                  <div>
                    {recentAlerts.length === 0 ? (
                      <p className="px-8 py-10 text-center text-sm text-slate-400">최근 발생한 이상 알림이 없어요.</p>
                    ) : (
                      recentAlerts.map((a) => (
                        <div key={a.alertCode} className="flex items-center border-b border-slate-100 px-8 py-4 last:border-b-0">
                          <div className="flex w-[42%] items-center gap-3">
                            <span
                              className="h-10 w-10 shrink-0 rounded-lg"
                              style={{ backgroundColor: channelDotColor(a.channel) + "22" }}
                            />
                            <div>
                              <p className="text-sm font-bold text-slate-900">{a.productName ?? a.productGroupId ?? "-"}</p>
                              <p className="text-xs text-slate-400">
                                {a.channelName} · {formatDetectedAt(a.detectedAt)}
                              </p>
                            </div>
                          </div>
                          <div className="w-[38%] pr-6 text-sm font-bold text-rose-600">
                            {a.mainAspect ? `${a.mainAspect} 이상` : "이상 감지"}
                          </div>
                          <div className="w-[20%] text-right">
                            <span
                              className={
                                "rounded-full px-3 py-1 text-xs font-bold " +
                                (a.alertStatus === "UNRESOLVED"
                                  ? "bg-rose-50 text-rose-600"
                                  : "bg-emerald-50 text-emerald-600")
                              }
                            >
                              {a.alertStatus === "UNRESOLVED" ? "미해결" : "해결됨"}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <div className="flex flex-col items-center gap-3 border-t border-[#E5E7EB] px-6 py-8 text-center">
          <div className="flex items-center gap-5">
            <Link href="/terms" className="text-[10px] text-[#99A1AF] hover:text-slate-500">
              서비스 이용약관
            </Link>
            <Link href="/privacy" className="text-[10px] text-[#99A1AF] hover:text-slate-500">
              개인정보처리방침
            </Link>
            <Link href="/faq" className="text-[10px] text-[#99A1AF] hover:text-slate-500">
              고객센터
            </Link>
          </div>
          <p className="text-[9px] text-[#99A1AF]">© 2026 SELLoN Inc. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
