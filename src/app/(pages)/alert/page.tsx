"use client";

import { useState } from "react";
import { ChevronRight, Bell, ExternalLink, Sparkles } from "lucide-react";
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
const alerts: AlertItem[] = [
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

// 상세 목데이터 — 실제로는 선택된 alertId로 API 호출해서 받아와야 해요.
const demoDetail = {
  date: "2026.07.01",
  issueType: "색상 문의 급증",
  increaseRate: "180%",
  confidence: "뚜렷함",
  channelStats: [
    { name: "쿠팡", pct: 22, highlighted: false },
    { name: "네이버", pct: 68, highlighted: true },
    { name: "지그재그", pct: 15, highlighted: false },
  ],
  insight: "네이버 채널에서만 색상 문의 비율이 뚜렷하게 높음 → 편중형 패턴 (채널 특정 문제 가능성)",
  viewHistory: [
    { time: "2026.07.01 09:00", user: "user12345678", status: "최초 확인" },
    { time: "2026.07.01 09:05", user: "user29086845", status: "검토 중" },
    { time: "2026.07.01 09:06", user: "user08135098", status: "검토 중" },
  ],
  product: {
    sku: "SLN-0007",
    name: "미디 원피스",
    color: "블랙 / 아이보리",
    channel: "네이버 스마트스토어",
  },
};

export default function AlertPage() {
  // URL은 안 바뀌고 이 상태값으로만 목록 ↔ 상세를 전환해요.
  // (나중에 API 명세대로 쿼리스트링을 붙이게 되면 useSearchParams로 바꾸면 돼요)
  const [view, setView] = useState<"list" | "detail">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [aiRequested, setAiRequested] = useState(false);

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

  const openDetail = (id: string) => {
    setSelectedId(id);
    setAiRequested(false);
    setView("detail");
  };

  const detail = demoDetail; // TODO: selectedId로 실제 상세 API 조회

  return (
    <div className="flex min-h-screen bg-white">

      <div className="flex flex-1 flex-col bg-[#F8F8FC]">
        {view === "list" ? (
          <header className="flex h-[92px] items-center justify-between border-b border-slate-200 bg-white px-6">
            <span className="text-xs font-medium text-slate-900">이상 이벤트 알림함</span>
            <NotificationBell />
          </header>
        ) : (
          <header className="flex h-[92px] items-center gap-1.5 border-b border-slate-200 bg-white px-6 text-xs">
            <button onClick={() => setView("list")} className="text-slate-500 hover:text-slate-700">
              이상 이벤트 알림함
            </button>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="font-medium text-slate-900">알림 상세</span>
            <div className="ml-auto">
              <button className="relative rounded-full p-1.5 text-slate-500 hover:bg-slate-50">
                <Bell className="h-4 w-4" />
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full border border-white bg-red-500" />
              </button>
            </div>
          </header>
        )}

        {view === "list" ? (
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
                            <button
                              key={a.id}
                              onClick={() => openDetail(a.id)}
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
                            </button>
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
        ) : (
          <main className="flex flex-col gap-6 p-7">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">이상 감지 상세</h1>
              <p className="pt-1.5 text-base text-slate-500">
                {detail.date} 기준 탐지된 비정상 패턴의 상세 분석 데이터입니다.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 px-5 lg:grid-cols-[1fr_360px]">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
                <div className="flex items-center justify-between border-b border-slate-100 p-6">
                  <h2 className="text-lg font-bold text-slate-900">채널별 비교 분석</h2>
                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                    High Priority
                  </span>
                </div>

                <div className="flex flex-col gap-10 p-8">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                      <p className="text-[11px] font-semibold text-slate-500">이상 유형</p>
                      <p className="pt-1 text-lg font-bold text-slate-900">{detail.issueType}</p>
                    </div>
                    <div className="rounded-xl border border-orange-100 bg-orange-50 p-5">
                      <p className="text-[11px] font-semibold text-orange-600">증가율</p>
                      <p className="pt-1 text-xl font-bold text-orange-600">{detail.increaseRate} ↑</p>
                    </div>
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-5">
                      <p className="text-[11px] font-semibold text-indigo-600">탐지 신뢰도</p>
                      <p className="pt-1 text-xl font-bold text-indigo-600">
                        {detail.confidence}{" "}
                        <span className="text-xs font-normal text-indigo-400">(z-score 기반)</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6">
                    <p className="text-[15px] font-bold text-slate-800">
                      이 SKU의 채널별 색상 문의 비율 비교{" "}
                      <span className="text-[13px] font-normal text-slate-400">(기간: 최근 7일)</span>
                    </p>
                    <div className="flex flex-col gap-8">
                      {detail.channelStats.map((c) => (
                        <div key={c.name} className="flex flex-col gap-2">
                          <div className="flex items-end justify-between">
                            <span className="text-sm font-bold text-slate-700">{c.name}</span>
                            <span
                              className={
                                "text-sm font-bold " + (c.highlighted ? "text-orange-600" : "text-slate-400")
                              }
                            >
                              {c.pct}% 색상 문의
                            </span>
                          </div>
                          <div
                            className={
                              "overflow-hidden rounded-full bg-slate-100 " + (c.highlighted ? "h-4" : "h-3")
                            }
                          >
                            <div
                              className={"h-full rounded-full " + (c.highlighted ? "bg-orange-600" : "bg-slate-400")}
                              style={{ width: `${c.pct}%` }}
                            />
                          </div>
                          {c.highlighted && (
                            <p className="pt-1 text-[13px] font-medium text-orange-600">⚠ {detail.insight}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 border-t border-slate-100 pt-8">
                    <p className="text-sm font-bold text-slate-800">탐지 열람 이력</p>
                    <div className="overflow-hidden rounded-xl bg-slate-50">
                      <div className="flex bg-slate-100 text-[13px] font-bold text-slate-500">
                        <div className="w-[40%] px-6 py-3">열람 일시</div>
                        <div className="w-[35%] px-6 py-3">담당자 ID</div>
                        <div className="w-[25%] px-6 py-3">상태</div>
                      </div>
                      {detail.viewHistory.map((h, i) => (
                        <div key={i} className="flex border-b border-slate-100 text-[13px] last:border-b-0">
                          <div className="w-[40%] px-6 py-3 text-slate-600">{h.time}</div>
                          <div className="w-[35%] px-6 py-3 text-slate-600">{h.user}</div>
                          <div
                            className={
                              "w-[25%] px-6 py-3 " +
                              (h.status === "최초 확인" ? "font-medium text-indigo-600" : "text-slate-600")
                            }
                          >
                            {h.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
                  <div className="border-b border-slate-100 p-6">
                    <h2 className="text-[17px] font-bold text-slate-900">상품 정보</h2>
                  </div>
                  <div className="flex flex-col gap-6 p-6">
                    <div className="h-[220px] rounded-xl border border-slate-200 bg-slate-100" />
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                        <span className="text-sm text-slate-400">SKU</span>
                        <span className="text-sm font-bold text-slate-900">{detail.product.sku}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                        <span className="text-sm text-slate-400">상품명</span>
                        <span className="text-sm font-bold text-slate-900">{detail.product.name}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                        <span className="text-sm text-slate-400">색상</span>
                        <span className="text-sm font-bold text-slate-900">{detail.product.color}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">담당 채널</span>
                        <span className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          {detail.product.channel}
                        </span>
                      </div>
                    </div>
                    <button className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-black">
                      <ExternalLink className="h-3.5 w-3.5" />
                      상품 페이지 바로가기
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-4 rounded-2xl bg-indigo-500 p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                      <Sparkles className="h-5 w-5 text-white" />
                    </span>
                    <h3 className="text-lg font-bold text-white">AI 심층 분석</h3>
                  </div>
                  <p className="text-[13px] leading-relaxed text-indigo-100">
                    더 폭넓은 채널 비교가 필요하다면, AI가 전체 SKU 및 기간별 데이터를 분석하여 최적의
                    개선안을 제안해 드립니다.
                  </p>
                  <button
                    onClick={() => setAiRequested(true)}
                    disabled={aiRequested}
                    className="rounded-xl bg-white py-4 text-[15px] font-bold text-indigo-600 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {aiRequested ? "요청이 접수되었습니다" : "AI 분석 요청하기"}
                  </button>
                </div>
              </div>
            </div>
          </main>
        )}

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
