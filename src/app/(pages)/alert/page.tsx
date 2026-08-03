"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import NotificationBell from "@/components/common/NotificationBell";

type AlertItem = {
  id: string;
  group: string;
  groupDate: string;
  channelInitial: string;
  channelBg: string;
  channelText: string;
  title: string;
  description: string;
  timeAgo: string;
  unread: boolean;
};

// 목데이터 — 실제로는 알림 목록 API에서 받아와야 해요.
// alerts 배열을 []로 비우면 "현재 이상 징후가 없습니다" 빈 상태가 자동으로 떠요.
export const alerts: AlertItem[] = [
  {
    id: "today-1",
    group: "오늘",
    groupDate: "2026.07.01",
    channelInitial: "쿠",
    channelBg: "#FFF7ED",
    channelText: "#FF6900",
    title: "미디 원피스 · 쿠팡 · 색상 문의 180% 증가",
    description: "z ≥ 3 · 뚜렷한 이상 신호가 감지되었습니다. 상세 내용을 확인하세요.",
    timeAgo: "3시간 전",
    unread: true,
  },
  {
    id: "yesterday-1",
    group: "어제",
    groupDate: "2026.06.30",
    channelInitial: "네",
    channelBg: "#ECFDF5",
    channelText: "#00BC7D",
    title: "니트 가디건 · 네이버 · 색상 문의",
    description: "z-score 2.3 · 경계선 케이스입니다. 주의 깊은 모니터링이 필요합니다.",
    timeAgo: "하루 전",
    unread: true,
  },
  {
    id: "week-1",
    group: "이번 주",
    groupDate: "2026.06.28 - 2026.07.05",
    channelInitial: "리",
    channelBg: "#FAF5FF",
    channelText: "#9333EA",
    title: "월간 운영 리포트가 도착했습니다",
    description: "7월 채널 운영 리포트를 확인하고 성과를 분석해보세요.",
    timeAgo: "1일 전",
    unread: true,
  },
  {
    id: "week-2",
    group: "이번 주",
    groupDate: "2026.06.28 - 2026.07.05",
    channelInitial: "완",
    channelBg: "#ECFDF5",
    channelText: "#059669",
    title: "리포트가 정상적으로 전송되었습니다",
    description: "요청하신 채널 비교 리포트가 이메일로 전송 완료되었습니다.",
    timeAgo: "2일 전",
    unread: false,
  },
];

export default function AlertListPage() {
  const [tab, setTab] = useState<"all" | "unread">("all");

  const filtered = tab === "all" ? alerts : alerts.filter((a) => a.unread);
  const unreadCount = alerts.filter((a) => a.unread).length;

  const groups: { label: string; date: string; items: AlertItem[] }[] = [];
  for (const a of filtered) {
    const last = groups[groups.length - 1];
    if (last && last.label === a.group) {
      last.items.push(a);
    } else {
      groups.push({ label: a.group, date: a.groupDate, items: [a] });
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex flex-1 flex-col bg-[#F8F8FC]">
        <header className="flex h-[92px] items-center justify-between border-b border-slate-200 bg-white px-6">
          <span className="text-xs font-medium text-slate-900">이상 이벤트 알림함</span>
          <NotificationBell />
        </header>

        <main className="flex flex-col gap-8 p-7">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">이상 이벤트 알림함</h1>
          </div>

          {alerts.length === 0 ? (
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
                    {alerts.length}
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

              {filtered.length === 0 ? (
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
                        {g.items.map((a) => (
                          <Link
                            key={a.id}
                            href={`/alert/${a.id}`}
                            className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-5 text-left hover:bg-slate-50"
                          >
                            <span
                              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-bold"
                              style={{ backgroundColor: a.channelBg, color: a.channelText }}
                            >
                              {a.channelInitial}
                            </span>
                            <div className="flex-1">
                              <p className="text-[15px] font-semibold text-slate-800">{a.title}</p>
                              <p className="pt-1 text-[13px] text-slate-500">{a.description}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className="text-[13px] text-slate-400">{a.timeAgo}</span>
                              {a.unread && <span className="h-2 w-2 rounded-full bg-indigo-500" />}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-center pt-2">
                <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  이전 알림 더보기
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </main>

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
      <p className="text-center text-xs text-[#A1A1AA]">마지막 갱신: 2026-07-15 14:32</p>
    </div>
  );
}
