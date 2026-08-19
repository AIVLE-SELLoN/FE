"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, AlertTriangle } from "lucide-react";
import { getAlerts, markAlertAsRead } from "@/app/api/alert";
import type { AlertSummary } from "@/app/api/alert/types";

function timeAgo(notifiedAt: string): string {
  const diffMs = Date.now() - new Date(notifiedAt).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 2) return "어제";
  return `${days}일 전`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AlertSummary[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // 벨 뱃지용 — 마운트 시 미확인 건수만 가볍게 가져와요
  useEffect(() => {
    let ignore = false;
    getAlerts({ size: 5 })
      .then((res) => {
        if (ignore) return;
        setItems(res.items);
        setUnreadCount(res.unreadCount);
      })
      .catch(() => {
        // 뱃지 하나 못 띄운다고 화면을 막을 필요는 없어서 조용히 무시
      });
    return () => {
      ignore = true;
    };
  }, []);

  // 드롭다운을 열 때마다 최신 5건으로 새로고침
  useEffect(() => {
    if (!open) return;
    let ignore = false;
    setLoading(true);
    getAlerts({ size: 5 })
      .then((res) => {
        if (ignore) return;
        setItems(res.items);
        setUnreadCount(res.unreadCount);
      })
      .catch(() => {})
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [open]);

  const handleClickItem = (n: AlertSummary) => {
    setOpen(false);
    if (n.isRead) return;
    markAlertAsRead(n.notificationId)
      .then((res) => {
        setItems((prev) => prev.map((it) => (it.notificationId === n.notificationId ? { ...it, isRead: true } : it)));
        setUnreadCount(res.unreadCount);
      })
      .catch(() => {
        // 읽음 처리 실패해도 상세 페이지 이동 자체는 막지 않음
      });
  };

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
              {loading ? (
                <p className="px-4 py-8 text-center text-xs text-slate-400">불러오는 중...</p>
              ) : items.length === 0 ? (
                <p className="px-4 py-8 text-center text-xs text-slate-400">알림이 없어요.</p>
              ) : (
                items.map((n) => (
                  <Link
                    key={n.notificationId}
                    href={`/alert/${n.notificationId}`}
                    onClick={() => handleClickItem(n)}
                    className={`flex items-start gap-3 border-b border-slate-50 px-4 py-3 last:border-b-0 hover:bg-slate-50 ${
                      n.isRead ? "opacity-50" : ""
                    }`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50">
                      <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold leading-relaxed text-slate-900">{n.message}</p>
                      <p className="pt-1 text-[11px] text-slate-400">{timeAgo(n.notifiedAt)}</p>
                    </div>
                  </Link>
                ))
              )}
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
