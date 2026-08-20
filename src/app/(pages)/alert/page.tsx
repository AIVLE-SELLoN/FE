"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, AlertTriangle, Loader2 } from "lucide-react";
import NotificationBell from "@/components/common/NotificationBell";
import { useAuthStore } from "@/store/useAuthStore";
import { getAlerts, markAlertAsRead } from "@/app/api/alert";
import type { AlertSummary } from "@/app/api/alert/types";
import { ApiError } from "@/app/api/client";

// 시연용 상품 썸네일: 알림 목록 응답에 productGroupId 필드가 없어
// 메시지 앞머리("P001 · 쿠팡 · ...")에서 상품그룹 ID를 추출해 쓴다.
// BE가 해당 필드를 내려주게 되면 이 파싱은 제거한다.
const PRODUCT_PLACEHOLDER = "/products/placeholder.png";

function extractProductGroupId(message: string): string | null {
  return message.match(/\bP\d{3}\b/)?.[0] ?? null;
}

function handleThumbnailError(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (img.src.endsWith("placeholder.png")) return; // 플레이스홀더까지 실패하면 무한 루프 방지
  img.src = PRODUCT_PLACEHOLDER;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatDate(d: Date) {
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function getGroupLabel(notifiedAt: string): { label: string; date: string } {
  const d = new Date(notifiedAt);
  const diffDays = Math.floor((startOfDay(new Date()).getTime() - startOfDay(d).getTime()) / 86400000);
  const dateLabel = formatDate(d);
  if (diffDays === 0) return { label: "오늘", date: dateLabel };
  if (diffDays === 1) return { label: "어제", date: dateLabel };
  if (diffDays <= 7) return { label: "이번 주", date: dateLabel };
  return { label: dateLabel, date: dateLabel };
}

function timeAgo(notifiedAt: string): string {
  const diffMs = Date.now() - new Date(notifiedAt).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${Math.max(mins, 0)}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export default function AlertListPage() {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const [tab, setTab] = useState<"all" | "unread">("all");

  const [items, setItems] = useState<AlertSummary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;
    let ignore = false;

    async function load() {
      setLoading(true);
      setErrorMessage(null);
      try {
        const res = await getAlerts({ unreadOnly: tab === "unread" });
        if (ignore) return;
        setItems(res.items);
        setTotalCount(res.totalCount);
        setUnreadCount(res.unreadCount);
        setNextCursor(res.nextCursor);
        setHasNext(res.hasNext);
      } catch (e) {
        if (!ignore) setErrorMessage(e instanceof ApiError ? e.message : "알림을 불러오지 못했습니다.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [hasHydrated, tab]);

  const handleLoadMore = async () => {
    if (!nextCursor) return;
    setLoadingMore(true);
    try {
      const res = await getAlerts({ cursor: nextCursor, unreadOnly: tab === "unread" });
      setItems((prev) => [...prev, ...res.items]);
      setNextCursor(res.nextCursor);
      setHasNext(res.hasNext);
    } catch (e) {
      setErrorMessage(e instanceof ApiError ? e.message : "알림을 더 불러오지 못했습니다.");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleClickAlert = (a: AlertSummary) => {
    if (a.isRead) return;
    markAlertAsRead(a.notificationId)
      .then((res) => {
        setItems((prev) =>
          prev.map((it) => (it.notificationId === a.notificationId ? { ...it, isRead: true } : it))
        );
        setUnreadCount(res.unreadCount);
      })
      .catch(() => {
        // 읽음 처리 실패해도 상세 페이지 이동 자체는 막지 않음
      });
  };

  const groups: { label: string; date: string; items: AlertSummary[] }[] = [];
  for (const a of items) {
    const g = getGroupLabel(a.notifiedAt);
    const last = groups[groups.length - 1];
    if (last && last.label === g.label && last.date === g.date) {
      last.items.push(a);
    } else {
      groups.push({ label: g.label, date: g.date, items: [a] });
    }
  }

  if (!hasHydrated) return null;

  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex flex-1 flex-col bg-[#F8F8FC]">
        <header className="flex h-[52px] items-center justify-between border-b border-slate-200 bg-white px-6">
          <span className="text-xs font-medium text-slate-900">이상 이벤트 알림함</span>
          <NotificationBell />
        </header>

        <main className="flex flex-col gap-8 p-7">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">이상 이벤트 알림함</h1>
          </div>

          {errorMessage && (
            <div className="mx-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errorMessage}
            </div>
          )}

          {loading ? (
            <p className="px-5 text-sm text-slate-400">불러오는 중...</p>
          ) : totalCount === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex flex-col gap-5 px-5">
              <div className="flex items-center gap-8 border-b border-slate-200">
                <button
                  onClick={() => setTab("all")}
                  className={
                    "flex items-center gap-2 border-b-2 pb-4 text-sm font-bold " +
                    (tab === "all" ? "border-indigo-500 text-indigo-500" : "border-transparent text-slate-400")
                  }
                >
                  전체
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-[10px] font-bold " +
                      (tab === "all" ? "bg-indigo-500 text-white" : "bg-slate-200 text-slate-600")
                    }
                  >
                    {totalCount}
                  </span>
                </button>
                <button
                  onClick={() => setTab("unread")}
                  className={
                    "flex items-center gap-2 border-b-2 pb-4 text-sm font-medium " +
                    (tab === "unread" ? "border-indigo-500 text-indigo-500" : "border-transparent text-slate-400")
                  }
                >
                  미확인
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-[10px] font-bold " +
                      (tab === "unread" ? "bg-indigo-500 text-white" : "bg-slate-200 text-slate-600")
                    }
                  >
                    {unreadCount}
                  </span>
                </button>
              </div>

              {items.length === 0 ? (
                <p className="py-16 text-center text-sm text-slate-400">미확인 알림이 없습니다.</p>
              ) : (
                <div className="flex flex-col gap-10">
                  {groups.map((g) => (
                    <div key={g.label + g.date} className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 px-2">
                        <span className="text-sm font-bold text-slate-900">{g.label}</span>
                        <span className="text-sm text-slate-400">{g.date}</span>
                      </div>
                      <div className="flex flex-col gap-3">
                        {g.items.map((a) => {
                          // 이상탐지 알림이면서 메시지에서 상품그룹 ID가 잡힐 때만 썸네일을 보여준다.
                          // 월간 리포트 등 상품과 무관한 알림은 기존 경고 아이콘을 그대로 쓴다.
                          const productGroupId =
                            a.type === "ANOMALY_DETECTED" ? extractProductGroupId(a.message) : null;

                          return (
                          <Link
                            key={a.notificationId}
                            href={`/alert/${a.notificationId}`}
                            onClick={() => handleClickAlert(a)}
                            className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-5 text-left hover:bg-slate-50"
                          >
                            {productGroupId ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={`/products/${productGroupId}.png`}
                                onError={handleThumbnailError}
                                alt={productGroupId}
                                className="h-14 w-14 shrink-0 rounded-2xl bg-indigo-50 object-cover"
                              />
                            ) : (
                              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                <AlertTriangle className="h-6 w-6" />
                              </span>
                            )}
                            <div className="flex-1">
                              <p className="text-[15px] font-semibold text-slate-800">{a.message}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className="text-[13px] text-slate-400">{timeAgo(a.notifiedAt)}</span>
                              {!a.isRead && <span className="h-2 w-2 rounded-full bg-indigo-500" />}
                            </div>
                          </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {hasNext && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                  >
                    {loadingMore ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        이전 알림 더보기
                        <ChevronRight className="h-3 w-3" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        <div className="flex flex-col items-center gap-3 border-t border-[#E5E7EB] px-6 py-8 text-center">
          <div className="flex items-center gap-5">
            <Link href="/terms" className="text-[10px] text-[#99A1AF] hover:text-slate-500">
              서비스 이용약관
            </Link>
            <Link href="/privacy" className="text-[10px] text-[#99A1AF] hover:text-slate-500">
              개인정보처리방침
            </Link>
            <Link href="/cs?view=inquiry" className="text-[10px] text-[#99A1AF] hover:text-slate-500">
              고객센터
            </Link>
          </div>
          <p className="text-[9px] text-[#99A1AF]">© 2026 SELLoN Inc. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
      <span className="flex h-[84px] w-[84px] items-center justify-center rounded-full bg-emerald-50">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 12l2 2 4-4M12 3l7 4v5c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V7l7-4z"
            stroke="#059669"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <p className="text-center text-2xl font-bold text-[#18181B]">현재 이상 징후가 없습니다</p>
      <p className="text-center text-[13px] text-[#71717A]">
        모든 채널의 CS·반품 지표가 정상 범위 내에 있습니다
      </p>
    </div>
  );
}
