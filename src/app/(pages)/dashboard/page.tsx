"use client";

import Link from "next/link";
import { Bell, ArrowRight } from "lucide-react";
import NotificationBell from "@/components/common/NotificationBell";
import { CHANNEL_COLORS, CHANNEL_LABELS, type ChannelKey } from "@/lib/channelColors";

// ── 목데이터 — 실제로는 대시보드 요약 API에서 받아와야 해요 ──────────────

// 미확인 이상 이벤트 배너용 집계. total을 0으로 바꾸면(=모두 확인) 배너가 자동으로 사라져요.
const unresolvedSummary = {
  total: 7,
};

const channelSummary: {
  key: ChannelKey;
  issueCount: number;
  cs: string;
  orders: string;
  rating: string;
}[] = [
  { key: "coupang", issueCount: 3, cs: "124건", orders: "1,892건", rating: "4.6" },
  { key: "naver", issueCount: 2, cs: "88건", orders: "941건", rating: "4.4" },
  { key: "zigzag", issueCount: 2, cs: "219건", orders: "2,410건", rating: "4.9" },
];

// 조치 유형별 건수 — 전체 채널 합산 기준. 유형 값은 아직 확정된 enum이 아니라 시안 기준 목데이터예요.
const actionTypeSummary = [
  { key: "suggestion", name: "개선안 생성", count: 3 },
  { key: "product", name: "상품 자체 점검 권장", count: 2 },
  { key: "logistics", name: "물류 점검 권장", count: 1 },
];

const recentAlerts = [
  {
    id: "a1",
    name: "오프숄더 니트 원피스 (크림)",
    sku: "KN-OP-023-CR",
    issue: "주문 급감 (전일 대비 -85%)",
    status: "미해결" as const,
  },
  {
    id: "a2",
    name: "린넨 와이드 슬랙스 (네이비)",
    sku: "SL-WN-004-NV",
    issue: "CS 문의 이상 (사이즈 불만 급증)",
    status: "미해결" as const,
  },
  {
    id: "a3",
    name: "데일리 코튼 티셔츠 (화이트)",
    sku: "TS-BC-001-WT",
    issue: "품절 임박 (잔여 재고 2개)",
    status: "해결됨" as const,
  },
  {
    id: "a4",
    name: "실크 리본 블라우스 (핑크)",
    sku: "BL-SR-012-PK",
    issue: "CS 폭주 (누적 5건 대기중)",
    status: "미해결" as const,
  },
];

export default function DashboardPage() {
  const maxActionCount = Math.max(...actionTypeSummary.map((a) => a.count));

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
            {/* Unconfirmed events banner — 미확인 건수가 0이면 자동으로 숨겨져요 */}
            {unresolvedSummary.total > 0 && (
              <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-indigo-500/10 bg-indigo-50 p-6 shadow-[0_1px_3px_-1px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.1)] sm:flex-row sm:items-center">
                <div className="flex items-center gap-6">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-500 shadow-[0_10px_15px_-3px_rgba(99,102,241,0.2),0_4px_6px_-4px_rgba(99,102,241,0.2)]">
                    <Bell className="h-6 w-6 text-white" />
                  </span>
                  <div className="flex flex-col gap-2">
                    <p className="text-xl font-bold text-indigo-500">
                      아직 확인하지 않은 이상 징후가{" "}
                      <Link href="/alert" className="underline">
                        {unresolvedSummary.total}건
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
              <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
                {channelSummary.map((ch) => (
                  <div
                    key={ch.key}
                    className="rounded-[20px] border border-slate-100 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.07)]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CHANNEL_COLORS[ch.key] }} />
                      <span className="text-sm font-bold text-slate-900">{CHANNEL_LABELS[ch.key]}</span>
                      <span className="ml-auto rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-600">
                        이상 {ch.issueCount}건
                      </span>
                    </div>
                    <div className="mt-4 flex divide-x divide-slate-100">
                      <div className="flex-1 text-center">
                        <p className="text-[11px] font-medium text-slate-400">CS 문의</p>
                        <p className="pt-1 text-xl font-extrabold text-slate-900">{ch.cs}</p>
                      </div>
                      <div className="flex-1 text-center">
                        <p className="text-[11px] font-medium text-slate-400">주문 건수</p>
                        <p className="pt-1 text-xl font-extrabold text-slate-900">{ch.orders}</p>
                      </div>
                      <div className="flex-1 text-center">
                        <p className="text-[11px] font-medium text-slate-400">평균 리뷰 평점</p>
                        <p className="pt-1 text-xl font-extrabold text-slate-900">{ch.rating}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Now section: donut + alerts table */}
            <div>
              <div className="flex items-center gap-2.5 pb-3.5 pt-2">
                <span className="h-4 w-0.5 rounded-full bg-indigo-500" />
                <h2 className="text-sm font-bold text-slate-900">지금 봐야 할 이슈</h2>
                <span className="text-xs text-slate-400">— 즉시 확인이 필요한 이상 탐지 항목</span>
              </div>

              <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[471px_1fr]">
                {/* 조치 유형별 건수 — 막대 길이는 최대 건수 대비 비율로 그려요 */}
                <div className="overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                  <div className="border-b border-slate-100 px-8 py-6">
                    <h3 className="text-lg font-bold text-slate-900">조치 유형별 건수</h3>
                  </div>

                  <div className="flex flex-col gap-6 px-8 py-7">
                    {actionTypeSummary.map((a) => (
                      <div key={a.key}>
                        <div className="flex items-baseline justify-between pb-2.5">
                          <span className="text-sm font-bold text-slate-900">{a.name}</span>
                          <span className="text-sm font-bold text-slate-900">{a.count}건</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{ width: `${(a.count / maxActionCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
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
                    <div className="w-[42%] px-8 py-4">상품명 (SKU)</div>
                    <div className="w-[38%] px-8 py-4">이상 유형</div>
                    <div className="w-[20%] px-8 py-4 text-right">상태</div>
                  </div>

                  <div>
                    {recentAlerts.map((a) => (
                      <div key={a.id} className="flex items-center border-b border-slate-100 px-8 py-4 last:border-b-0">
                        <div className="flex w-[42%] items-center gap-3">
                          <span className="h-10 w-10 shrink-0 rounded-lg bg-slate-100" />
                          <div>
                            <p className="text-sm font-bold text-slate-900">{a.name}</p>
                            <p className="text-xs text-slate-400">SKU: {a.sku}</p>
                          </div>
                        </div>
                        <div className="w-[38%] pr-6 text-sm font-bold text-rose-600">{a.issue}</div>
                        <div className="w-[20%] text-right">
                          <span
                            className={
                              "rounded-full px-3 py-1 text-xs font-bold " +
                              (a.status === "미해결"
                                ? "bg-rose-50 text-rose-600"
                                : "bg-emerald-50 text-emerald-600")
                            }
                          >
                            {a.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <div className="flex flex-col items-center gap-3 border-t border-[#E5E7EB] px-6 py-8 text-center">
          <div className="flex items-center gap-5">
            <span className="text-[10px] text-[#99A1AF]">서비스 이용약관</span>
            <span className="text-[10px] font-bold text-[#99A1AF]">개인정보처리방침</span>
            <span className="text-[10px] text-[#99A1AF]">고객센터</span>
          </div>
          <p className="text-[9px] text-[#99A1AF]">© 2026 SELLoN Inc. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
