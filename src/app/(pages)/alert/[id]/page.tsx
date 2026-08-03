"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronRight, ExternalLink, Sparkles } from "lucide-react";
import NotificationBell from "@/components/common/NotificationBell";

// 상세 목데이터 — 실제로는 params.id로 API 호출해서 받아와야 해요.
// 지금은 어떤 id로 들어와도 동일한 데모 데이터를 보여줍니다.
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

export default function AlertDetailPage() {
  const params = useParams<{ id: string }>();
  const [aiRequested, setAiRequested] = useState(false);

  const detail = demoDetail; // TODO: params.id로 실제 상세 API 조회

  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex flex-1 flex-col bg-[#F8F8FC]">
        <header className="flex h-[92px] items-center gap-1.5 border-b border-slate-200 bg-white px-6 text-xs">
          <Link href="/alert" className="text-slate-500 hover:text-slate-700">
            이상 이벤트 알림함
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="font-medium text-slate-900">알림 상세</span>
          <div className="ml-auto">
            <NotificationBell />
          </div>
        </header>

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
