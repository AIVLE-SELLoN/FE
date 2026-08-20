"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import NotificationBell from "@/components/common/NotificationBell";
import {
  CHANNEL_COLORS,
  CHANNEL_INITIALS,
  CHANNEL_LABELS,
  CHANNEL_TINTS,
  type ChannelKey,
} from "@/lib/channelColors";
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
  refreshAllChannelComparisons,
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

// 채널 색상/라벨은 공용 소스(@/lib/channelColors)만 참조 — 페이지별로 하드코딩하지 않음.
// 백엔드 channelType은 "COUPANG"처럼 대문자로 오고, 공용 모듈은 "coupang"처럼 소문자 키를 쓰기 때문에
// 여기서만 소문자로 변환해서 연결한다.
function toChannelKey(channelType: string): ChannelKey | null {
  const key = channelType.toLowerCase();
  return key in CHANNEL_LABELS ? (key as ChannelKey) : null;
}

function getMeta(channelType: string) {
  const key = toChannelKey(channelType);
  if (key) {
    return {
      label: CHANNEL_LABELS[key],
      initial: CHANNEL_INITIALS[key],
      color: CHANNEL_COLORS[key],
      iconBg: CHANNEL_TINTS[key].bg,
      iconText: CHANNEL_TINTS[key].fg,
    };
  }
  // 공용 모듈에 없는 채널(향후 확장 대비)은 중립 회색으로 대체
  return {
    label: channelType,
    initial: channelType[0] ?? "?",
    color: "#9A9AA5",
    iconBg: "#ECECF0",
    iconText: "#9A9AA5",
  };
}

function SectionCard({
  title,
  subtitle,
  children,
  contentClassName = "pt-6",
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  /** 제목과 본문 사이 간격. 차트처럼 자체 여백을 가진 내용은 줄여서 넘기면 돼요 */
  contentClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#EDEDED] bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <h2 className="text-xl font-bold text-[#17171C]">{title}</h2>
      <p className="pt-1 text-[12px] text-[#A5A5AF]">{subtitle}</p>
      <div className={contentClassName}>{children}</div>
    </div>
  );
}

// 집계할 데이터(주문/리뷰/문의)가 없으면 백엔드가 null을 내려줘요. 그때는 "-"로 표시합니다.
const KPI_FIELDS = [
  { label: "총 문의 수", value: (c: ChannelComparisonItem) => `${c.totalInquiryCount.toLocaleString()}건`, note: (c: ChannelComparisonItem) => c.totalInquiryComment },
  { label: "주문당 문의율", value: (c: ChannelComparisonItem) => c.inquiryRatePerOrder != null ? `${c.inquiryRatePerOrder.toFixed(1)}%` : "-", note: (c: ChannelComparisonItem) => c.inquiryRateComment },
  { label: "평균 평점", value: (c: ChannelComparisonItem) => c.avgRating != null ? c.avgRating.toFixed(1) : "-", note: (c: ChannelComparisonItem) => c.avgRatingComment },
  { label: "주문당 리뷰율", value: (c: ChannelComparisonItem) => c.reviewRatePerOrder != null ? `${c.reviewRatePerOrder.toFixed(1)}%` : "-", note: (c: ChannelComparisonItem) => c.reviewRateComment },
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
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        // 조회 API들이 스냅샷 테이블을 읽는 구조라, 매 진입 시 전체 채널 스냅샷부터 새로 계산해둔다.
        await refreshAllChannelComparisons();

        // 채널 목록 + 채널별 문의 유형 전체 분포(레이더용)는 한 번에 조회
        const [channelList, radarData] = await Promise.all([
          getChannelComparisons(),
          getChannelInquiryTypeRadar(),
        ]);
        if (cancelled) return;

        // 채널별 상세(속성 top3, 월별 추이, 인사이트)는 채널마다 따로 조회해서 합침
        const perChannel = await Promise.all(
          channelList.map(async (c) => {
            const [aspectList, monthlyList, insightList] = await Promise.all([
              getChannelAspects(c.usersChannelKey),
              getChannelMonthly(c.usersChannelKey),
              getChannelInsights(c.usersChannelKey),
            ]);
            return { usersChannelKey: c.usersChannelKey, aspectList, monthlyList, insightList };
          }),
        );
        if (cancelled) return;

        const aspectsMap: Record<number, ChannelInquiryTypeItem[]> = {};
        const monthlyMap: Record<number, ChannelMonthlyItem[]> = {};
        const insightsMap: Record<number, string[]> = {};
        perChannel.forEach((p) => {
          aspectsMap[p.usersChannelKey] = p.aspectList;
          monthlyMap[p.usersChannelKey] = p.monthlyList;
          insightsMap[p.usersChannelKey] = p.insightList;
        });

        // 레이더 차트는 recharts 구조상 "유형" 단위 행 + 채널별 라벨 컬럼으로 재구성해야 함
        const radarMap = new Map<string, Record<string, string | number>>();
        radarData.forEach((r) => {
          const meta = getMeta(r.channelType);
          r.distribution.forEach((d) => {
            const row = radarMap.get(d.inquireType) ?? { type: d.inquireType };
            row[meta.label] = d.ratio;
            radarMap.set(d.inquireType, row);
          });
        });

        setChannels(channelList);
        setAspects(aspectsMap);
        setMonthly(monthlyMap);
        setInsights(insightsMap);
        setRadarRows(Array.from(radarMap.values()));
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "채널 비교 데이터를 불러오지 못했습니다.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
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
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white">
        <div className="h-[60px] w-[60px] animate-spin rounded-full border-[3.89px] border-[#E4E4E7] border-t-indigo-500" />
        <div className="text-center">
          <p className="text-[28px] font-bold text-[#18181B]">불러오는 중...</p>
          <p className="pt-2 text-[13px] text-[#71717A]">잠시만 기다려 주세요. 채널 비교 데이터를 불러오는 중입니다</p>
        </div>
      </div>
    );
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
                        {c.positiveRatio == null && c.neutralRatio == null && c.negativeRatio == null ? (
                          <p className="py-1 text-xs text-[#C0C0C8]">감성 분석에 쓸 문의 데이터가 충분하지 않아요</p>
                        ) : (
                          <>
                            <div className="flex h-5 overflow-hidden rounded-full bg-[#F0F0F3]">
                              <div style={{ width: `${c.positiveRatio ?? 0}%`, backgroundColor: meta.color, opacity: 0.9 }} />
                              <div style={{ width: `${c.neutralRatio ?? 0}%`, backgroundColor: meta.color, opacity: 0.35 }} />
                            </div>
                            <div className="flex gap-4 pt-2 text-xs text-[#A5A5AF]">
                              <span>긍정 {c.positiveRatio != null ? c.positiveRatio.toFixed(0) : "-"}%</span>
                              <span>중립 {c.neutralRatio != null ? c.neutralRatio.toFixed(0) : "-"}%</span>
                              <span>부정 {c.negativeRatio != null ? c.negativeRatio.toFixed(0) : "-"}%</span>
                            </div>
                          </>
                        )}
                        {c.sentimentComment && <p className="pt-1 text-[11px] text-[#7A7A85]">{c.sentimentComment}</p>}
                      </div>
                    );
                  })}
                </div>
              </SectionCard>

              <SectionCard
                title="문의 유형 레이더"
                subtitle="채널간 유형 분포 전체 비교"
                contentClassName="pt-1"
              >
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarRows} outerRadius="75%">
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
                      <Legend iconType="square" iconSize={10} wrapperStyle={{ paddingTop: 48 }} />
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
