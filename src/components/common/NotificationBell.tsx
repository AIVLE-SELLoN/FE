"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, AlertTriangle, TrendingDown, MessageSquare, Package } from "lucide-react";

type AnomalySeverity = "high" | "medium";
type AnomalyType = "cs" | "return" | "inventory" | "sales";

type AnomalyNotification = {
  id: string;
  type: AnomalyType;
  channel: string;
  title: string;
  detail: string;
  time: string;
  severity: AnomalySeverity;
};

// 목데이터 — 실제로는 이상 이벤트 탐지 API(오케스트레이터 에이전트 결과)에서 받아와야 해요.
const notifications: AnomalyNotification[] = [
  {
    id: "n1",
    type: "cs",
    channel: "쿠팡",
    title: "CS 문의량 급증 감지",
    detail: "최근 24시간 CS 문의가 평소 대비 3.2배 증가했어요.",
    time: "10분 전",
    severity: "high",
  },
  {
    id: "n2",
    type: "return",
    channel: "네이버",
    title: "반품률 이상 탐지",
    detail: "'프리미엄 면 티셔츠' 반품률이 전주 대비 18%p 상승했어요.",
    time: "42분 전",
    severity: "high",
  },
  {
    id: "n3",
    type: "sales",
    channel: "지그재그",
    title: "채널 간 CS 유형 분포 격차",
    detail: "색상 관련 CS 비중이 다른 채널 대비 눈에 띄게 높아요.",
    time: "1시간 전",
    severity: "medium",
  },
  {
    id: "n4",
    type: "inventory",
    channel: "쿠팡",
    title: "재고 소진 임박",
    detail: "'베이직 니트 가디건' 재고가 3일 내 소진될 것으로 예상돼요.",
    time: "3시간 전",
    severity: "medium",
  },
  {
    id: "n5",
    type: "cs",
    channel: "네이버",
    title: "동일 유형 CS 반복 접수",
    detail: "사이즈 불만 CS가 동일 상품에서 5건 연속 접수됐어요.",
    time: "어제",
    severity: "medium",
  },
];

const TYPE_ICON: Record<AnomalyType, typeof AlertTriangle> = {
  cs: MessageSquare,
  return: TrendingDown,
  inventory: Package,
  sales: AlertTriangle,
};

const SEVERITY_STYLE: Record<AnomalySeverity, { bg: string; text: string }> = {
  high: { bg: "bg-red-50", text: "text-red-500" },
  medium: { bg: "bg-amber-50", text: "text-amber-600" },
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const wrapRef = useRef<HTMLDivElement>(null);

  const READ_IDS_STORAGE_KEY = "sellon_read_notification_ids";

  // 읽음 처리한 알림 ID를 로컬 스토리지에서 복원
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(READ_IDS_STORAGE_KEY);
      if (stored) setReadIds(new Set(JSON.parse(stored)));
    } catch {
      // 스토리지 접근 실패 시 무시하고 전부 안읽음으로 취급
    }
  }, []);

  const markAsRead = (id: string) => {
    setReadIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      try {
        window.localStorage.setItem(READ_IDS_STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {
        // 저장 실패해도 화면 상태는 그대로 유지
      }
      return next;
    });
  };

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;
  const hasUnread = unreadCount > 0;

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-1.5 text-slate-500 hover:bg-slate-50"
        aria-label="이상 이벤트 알림"
        aria-expanded={open}
      >
        <Bell className="h-4 w-4" />
        {hasUnread && (
          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full border border-white bg-red-500" />
        )}
      </button>

      {/* 클릭 시에만 표시되는 드롭다운 */}
      {open && (
        <div className="absolute right-0 top-full z-50 pt-2">
          <div className="flex w-[340px] flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-bold text-slate-900">이상 이벤트 알림</p>
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-500">
                {unreadCount}건
              </span>
            </div>

            <div className="flex max-h-[320px] flex-col overflow-y-auto">
              {notifications.map((n) => {
                const Icon = TYPE_ICON[n.type];
                const style = SEVERITY_STYLE[n.severity];
                const isRead = readIds.has(n.id);
                return (
                  <Link
                    key={n.id}
                    href={`/alert/${n.id}`}
                    onClick={() => {
                      markAsRead(n.id);
                      setOpen(false);
                    }}
                    className={`flex items-start gap-3 border-b border-slate-50 px-4 py-3 last:border-b-0 hover:bg-slate-50 ${
                      isRead ? "opacity-50" : ""
                    }`}
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style.bg}`}>
                      <Icon className={`h-3.5 w-3.5 ${style.text}`} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                          {n.channel}
                        </span>
                        <p className="truncate text-[13px] font-bold text-slate-900">{n.title}</p>
                      </div>
                      <p className="pt-1 text-xs leading-relaxed text-slate-500">{n.detail}</p>
                      <p className="pt-1 text-[11px] text-slate-400">{n.time}</p>
                    </div>
                  </Link>
                );
              })}
            </div>

            <Link
              href="/alert"
              onClick={() => setOpen(false)}
              className="border-t border-slate-100 px-4 py-2.5 text-center text-xs font-bold text-indigo-600 hover:bg-slate-50"
            >
              전체 알림 보기
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
