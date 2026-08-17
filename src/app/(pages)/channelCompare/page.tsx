"use client";

import { useEffect, useMemo, useState } from "react";
import NotificationBell from "@/components/common/NotificationBell";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend,
} from "recharts";
import {
  getChannelComparisons,
  getChannelAspects,
  getChannelInquiryTypeRadar,
  getChannelMonthly,
  getChannelInsights,
} from "@/app/api/channel/comparison";
import type {
  ChannelComparisonItem,
  ChannelInquiryTypeItem,
  ChannelMonthlyItem,
} from "@/app/api/channel/comparison/types";

// 채널 타입(백엔드 문자열) → 화면 표시용 메타데이터
const CHANNEL_META: Record<string, { label: string; initial: string; color: string; iconBg: string; iconText: string }> = {
  COUPANG: { label: "쿠팡", initial: "C", color: "#D9720B", iconBg: "#FFD8C2", iconText: "#C24A0F" },
  NAVER: { label: "네이버", initial: "N", color: "#1F9254", iconBg: "#D6F5D6", iconText: "#1F9254" },
  ZIGZAG: { label: "지그재그", initial: "Z", color: "#9A9AA5", iconBg: "#ECECF0", iconText: "#9A9AA5" },
};

function getMeta(channelType: string) {
  return CHANNEL_META[channelType] ?? { label: channelType, initial: channelType[0] ?? "?", color: "#9A9AA5", iconBg: "#ECECF0", iconText: "#9A9AA5" };
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#EDEDED] bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <h2 className="text-xl font-bold text-[#17171C]">{title}</h2>
      <p className="pt-1 text-[12px] text-[#A5A5AF]">{subtitle}</p>
      <div className="pt-6">{children}</div>
    </div>
  );
}

const KPI_FIELDS = [
  { label: "총 문의 수", value: (c: ChannelComparisonItem) => `${c.totalInquiryCount.toLocaleString()}건`, note: (c: ChannelComparisonItem) => c.totalInquiryComment },
  { label: "주문당 문의율", value: (c: ChannelComparisonItem) => `${c.inquiryRatePerOrder.toFixed(1)}%`, note: (c: ChannelComparisonItem) => c.inquiryRateComment },
  { label: "평균 평점", value: (c: ChannelComparisonItem) => c.avgRating.toFixed(1), note: (c: ChannelComparisonItem) => c.avgRatingComment },
  { label: "주문당 리뷰율", value: (c: ChannelComparisonItem) => `${c.reviewRatePerOrder.toFixed(1)}%`, note: (c: ChannelComparisonItem) => c.reviewRateComment },
];

export default function ChannelComparisonPage() {
  const [channels, setChannels] = useState<ChannelComparisonItem[]>([]);
  const [aspects, setAspects] = useState<Record<number, ChannelInquiryTypeItem[]>>({});
  const [monthly, setMonthly] = useState<Record<number, ChannelMonthlyItem[]>>({});
  const [insights, setInsights] = useState<Record<number, string[]>>({});
  const [radarRows, setRadarRows] = useState<Record<string, string | number>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  // TODO: 백엔드 연결 디버깅 끝나면 아래 mock 대신 load() 다시 호출
  const mockChannels: ChannelComparisonItem[] = [
    {
      usersChannelKey: 1, channelType: "COUPANG",
      totalInquiryCount: 2340, totalInquiryChangeRate: 12, totalInquiryComment: "+12% vs 전월",
      inquiryRatePerOrder: 8.4, inquiryRateComment: "판매 대비 문의 발생률 8.4%로 무난한 수준이에요.",
      avgRating: 3.8, avgRatingComment: "평균 평점 3.8점으로 보통 수준이에요.",
      reviewRatePerOrder: 12.1, reviewRateComment: "판매 대비 리뷰 작성률 12.1%예요.",
      positiveRatio: 38, neutralRatio: 35, negativeRatio: 27,
      sentimentComment: "긍정 비율 38%예요.",
      aspectComment: "COUPANG 채널에 배송 문의가 집중되어 있어요 · 편중형 패턴(채널 특성 요인 가능성)",
    },
    {
      usersChannelKey: 2, channelType: "NAVER",
      totalInquiryCount: 1580, totalInquiryChangeRate: 5, totalInquiryComment: "+5% vs 전월",
      inquiryRatePerOrder: 4.2, inquiryRateComment: "판매 대비 문의 발생률 4.2%로 무난한 수준이에요.",
      avgRating: 4.3, avgRatingComment: "평균 평점 4.3점 · 우수한 수준이에요.",
      reviewRatePerOrder: 18.5, reviewRateComment: "판매 대비 리뷰 작성률 18.5%예요.",
      positiveRatio: 55, neutralRatio: 30, negativeRatio: 15,
      sentimentComment: "채널 중 긍정 비율이 가장 높아요 · 고객 경험 품질 우위",
      aspectComment: "상대적으로 고른 분포 · 특정 유형에 쏠리지 않는 편이에요.",
    },
    {
      usersChannelKey: 3, channelType: "ZIGZAG",
      totalInquiryCount: 420, totalInquiryChangeRate: 0, totalInquiryComment: "데이터 부족",
      inquiryRatePerOrder: 6.1, inquiryRateComment: "판매 대비 문의 발생률 6.1%로 무난한 수준이에요.",
      avgRating: 3.4, avgRatingComment: "평균 평점 3.4점으로 보통 수준이에요.",
      reviewRatePerOrder: 7.8, reviewRateComment: "판매 대비 리뷰 작성률 7.8%예요.",
      positiveRatio: 42, neutralRatio: 45, negativeRatio: 13,
      sentimentComment: "긍정 비율 42%예요.",
      aspectComment: "최근 문의 데이터가 충분하지 않아요.",
    },
  ];

  setChannels(mockChannels);
  setAspects({
    1: [
      { inquireType: "오배송", inquiryCount: 260, ratio: 62 },
      { inquireType: "파손", inquiryCount: 88, ratio: 21 },
      { inquireType: "사이즈", inquiryCount: 38, ratio: 9 },
    ],
    2: [
      { inquireType: "색상", inquiryCount: 180, ratio: 41 },
      { inquireType: "오배송", inquiryCount: 123, ratio: 28 },
      { inquireType: "소재", inquiryCount: 66, ratio: 15 },
    ],
    3: [], // 지그재그는 데이터 부족 케이스
  });
  setMonthly({
    1: [
      { yearMonth: "2026-01", inquiryCount: 314 }, { yearMonth: "2026-02", inquiryCount: 274 },
      { yearMonth: "2026-03", inquiryCount: 404 }, { yearMonth: "2026-04", inquiryCount: 364 },
      { yearMonth: "2026-05", inquiryCount: 434 }, { yearMonth: "2026-06", inquiryCount: 384 },
    ],
    2: [
      { yearMonth: "2026-01", inquiryCount: 204 }, { yearMonth: "2026-02", inquiryCount: 234 },
      { yearMonth: "2026-03", inquiryCount: 189 }, { yearMonth: "2026-04", inquiryCount: 254 },
      { yearMonth: "2026-05", inquiryCount: 299 }, { yearMonth: "2026-06", inquiryCount: 274 },
    ],
    3: [
      { yearMonth: "2026-01", inquiryCount: 74 }, { yearMonth: "2026-02", inquiryCount: 59 },
      { yearMonth: "2026-03", inquiryCount: 84 }, { yearMonth: "2026-04", inquiryCount: 104 },
      { yearMonth: "2026-05", inquiryCount: 89 }, { yearMonth: "2026-06", inquiryCount: 66 },
    ],
  });
  setInsights({
    1: [
      "배송 문의가 전체의 62%로 집중 — 편중형 패턴",
      "판매 대비 문의 발생률이 다소 높은 편 — 상품 이슈 점검 필요",
    ],
    2: [
      "색상·품질 문의 비중 높음 — 상품 정보 보완 효과적",
      "긍정 감성 55%로 채널 중 가장 높음",
    ],
    3: ["최근 문의 데이터가 30건 미만으로 적어 패턴 분석은 유보돼요."],
  });
  setRadarRows([
    { type: "색상", 쿠팡: 5, 네이버: 41, 지그재그: 20 },
    { type: "오배송", 쿠팡: 62, 네이버: 28, 지그재그: 15 },
    { type: "사이즈", 쿠팡: 9, 네이버: 8, 지그재그: 18 },
    { type: "소재", 쿠팡: 3, 네이버: 15, 지그재그: 12 },
    { type: "파손", 쿠팡: 21, 네이버: 10, 지그재그: 10 },
    { type: "기타", 쿠팡: 5, 네이버: 8, 지그재그: 10 },
  ]);
  setLoading(false);

  // 아래는 실제 연결용 — 지금은 주석 처리
  // let cancelled = false;
  // async function load() { ... }
  // load();
  // return () => { cancelled = true; };
}, []);
  // 월별 추이: 채널별로 따로 오는 데이터를 yearMonth 기준으로 합침
  const monthlyTrend = useMemo(() => {
    const rows = new Map<string, Record<string, string | number>>();
    channels.forEach((c) => {
      const meta = getMeta(c.channelType);
      (monthly[c.usersChannelKey] ?? []).forEach((m) => {
        const row = rows.get(m.yearMonth) ?? { month: m.yearMonth };
        row[c.channelType] = m.inquiryCount;
        typeof row.month === "string" && (row.month = m.yearMonth);
        rows.set(m.yearMonth, row);
      });
      void meta;
    });
    return Array.from(rows.values()).sort((a, b) => String(a.month).localeCompare(String(b.month)));
  }, [channels, monthly]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-400">불러오는 중...</div>;
  }

  if (error) {
    return <div className="flex min-h-screen items-center justify-center text-red-500">{error}</div>;
  }

  if (channels.length === 0) {
    return <div className="flex min-h-screen items-center justify-center text-slate-400">연동된 채널이 없어요. 채널을 먼저 연동해주세요.</div>;
  }

  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex flex-1 flex-col bg-[#F8F8FC]">
        <header className="flex h-[52px] items-center justify-between border-b border-slate-200 bg-white px-6">
          <span className="text-xs font-medium text-slate-900">채널 비교 분석</span>
          <NotificationBell />
        </header>

        <main className="flex flex-col gap-5 p-7">
          <h1 className="text-2xl font-bold text-slate-900">채널 비교 분석</h1>

          <div className="flex flex-col gap-6 px-5">
            {/* KPI summary */}
            <SectionCard title="채널별 핵심 지표 요약" subtitle="최근 30일 기준">
              <div
                className="grid gap-4 pb-4 text-sm font-bold text-[#3A3A44]"
                style={{ gridTemplateColumns: `180px repeat(${channels.length}, 1fr)` }}
              >
                <span />
                {channels.map((c) => {
                  const meta = getMeta(c.channelType);
                  return (
                    <span key={c.usersChannelKey} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
                      {meta.label}
                    </span>
                  );
                })}
              </div>
              <div>
                {KPI_FIELDS.map((field) => (
                  <div
                    key={field.label}
                    className="grid items-center gap-4 border-b border-[#F0F0F3] py-4 last:border-b-0"
                    style={{ gridTemplateColumns: `180px repeat(${channels.length}, 1fr)` }}
                  >
                    <p className="text-[18px] font-medium text-[#52525B]">{field.label}</p>
                    {channels.map((c) => (
                      <div key={c.usersChannelKey}>
                        <p className="text-xl font-bold" style={{ color: getMeta(c.channelType).color }}>
                          {field.value(c)}
                        </p>
                        <p className="text-xs text-[#A5A5AF]">{field.note(c)}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Aspect distribution */}
            <SectionCard title="채널별 속성(Aspect) 분포 비교" subtitle="최근 30일 · 문의 유형 기준 상위 3개 항목">
              <div className="grid grid-cols-1 divide-x divide-[#F1F1F3] md:grid-cols-3">
                {channels.map((c) => {
                  const meta = getMeta(c.channelType);
                  const items = aspects[c.usersChannelKey] ?? [];
                  return (
                    <div key={c.usersChannelKey} className="flex flex-col px-6 first:pl-0 last:pr-0">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold"
                          style={{ backgroundColor: meta.iconBg, color: meta.iconText }}
                        >
                          {meta.initial}
                        </span>
                        <span className="text-sm font-bold text-[#17171C]">{meta.label}</span>
                      </div>

                      {items.length > 0 ? (
                        <div className="flex flex-col gap-3 pt-4">
                          {items.map((item, i) => (
                            <div key={item.inquireType} className="flex items-center gap-2.5">
                              <span className="w-4 text-[11px] font-bold" style={{ color: i === 0 ? meta.color : "#C7C7CF" }}>
                                {i + 1}
                              </span>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold text-[#3A3A44]">{item.inquireType}</span>
                                  <span className="text-xs font-bold text-[#17171C]">{item.ratio.toFixed(0)}%</span>
                                </div>
                                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#F0F0F3]">
                                  <div className="h-full rounded-full" style={{ width: `${item.ratio}%`, backgroundColor: meta.color }} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F7] text-[#C7C7CF]">–</span>
                          <p className="text-[13px] font-bold text-[#9A9AA5]">특이사항 없음</p>
                          <p className="text-center text-[12px] text-[#C0C0C8]">최근 문의 데이터가<br />충분하지 않아요</p>
                        </div>
                      )}

                      {c.aspectComment && (
                        <p className="mt-4 border-t border-[#F0F0F3] pt-3 text-[12px] leading-relaxed text-[#7A7A85]">{c.aspectComment}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            {/* Monthly trend */}
            <SectionCard title="채널별 월별 문의 추이" subtitle="최근 6개월 · 총 문의 건수 기준">
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid stroke="#F0F0F3" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#A5A5AF" }} axisLine={{ stroke: "#F0F0F3" }} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#A5A5AF" }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value, name) => [`${value}건`, getMeta(String(name)).label]} />
                    <Legend formatter={(value: string) => getMeta(value).label} />
                    {channels.map((c) => (
                      <Line
                        key={c.usersChannelKey}
                        type="monotone"
                        dataKey={c.channelType}
                        stroke={getMeta(c.channelType).color}
                        strokeWidth={2.5}
                        dot={{ r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            {/* Sentiment + Radar */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <SectionCard title="채널별 감성 분석" subtitle="긍정 / 중립 / 부정 문의 비율">
                <div className="flex flex-col gap-5">
                  {channels.map((c) => {
                    const meta = getMeta(c.channelType);
                    return (
                      <div key={c.usersChannelKey}>
                        <div className="flex items-center gap-2 pb-2">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
                          <span className="text-sm font-semibold text-[#3A3A44]">{meta.label}</span>
                        </div>
                        <div className="flex h-5 overflow-hidden rounded-full bg-[#F0F0F3]">
                          <div style={{ width: `${c.positiveRatio}%`, backgroundColor: meta.color, opacity: 0.9 }} />
                          <div style={{ width: `${c.neutralRatio}%`, backgroundColor: meta.color, opacity: 0.35 }} />
                        </div>
                        <div className="flex gap-4 pt-2 text-xs text-[#A5A5AF]">
                          <span>긍정 {c.positiveRatio.toFixed(0)}%</span>
                          <span>중립 {c.neutralRatio.toFixed(0)}%</span>
                          <span>부정 {c.negativeRatio.toFixed(0)}%</span>
                        </div>
                        {c.sentimentComment && <p className="pt-1 text-[11px] text-[#7A7A85]">{c.sentimentComment}</p>}
                      </div>
                    );
                  })}
                </div>
              </SectionCard>

              <SectionCard title="문의 유형 레이더" subtitle="채널간 유형 분포 전체 비교">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarRows}>
                      <PolarGrid stroke="#F0F0F3" />
                      <PolarAngleAxis dataKey="type" tick={{ fontSize: 11, fill: "#7A7A85" }} />
                      {channels.map((c) => {
                        const meta = getMeta(c.channelType);
                        return (
                          <Radar
                            key={c.usersChannelKey}
                            name={meta.label}
                            dataKey={meta.label}
                            stroke={meta.color}
                            fill={meta.color}
                            fillOpacity={0.15}
                          />
                        );
                      })}
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>
            </div>

            {/* Insights */}
            <SectionCard title="채널별 주요 인사이트" subtitle="분석 기반 행동 권고사항">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {channels.map((c) => {
                  const meta = getMeta(c.channelType);
                  const points = insights[c.usersChannelKey] ?? [];
                  return (
                    <div key={c.usersChannelKey} className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                        <span className="text-sm font-bold text-[#17171C]">{meta.label}</span>
                      </div>
                      <ul className="flex flex-col gap-2">
                        {points.map((point, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full opacity-50" style={{ backgroundColor: meta.color }} />
                            <span className="text-[12px] leading-relaxed text-[#52525B]">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
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