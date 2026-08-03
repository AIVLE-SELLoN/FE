"use client";

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

const CHANNEL_COLORS = {
  coupang: "#D9720B",
  naver: "#1F9254",
  zigzag: "#9A9AA5",
};

// KPI 요약 — 각 지표별 3채널 값 + 코멘트
const KPI_ROWS = [
  {
    label: "총 문의 수",
    values: [
      { v: "2,340건", note: "+12% vs 전월" },
      { v: "1,580건", note: "+5% vs 전월" },
      { v: "420건", note: "데이터 부족" },
    ],
  },
  {
    label: "평균 응답 시간",
    values: [
      { v: "3.2시간", note: "업계 평균 초과" },
      { v: "1.8시간", note: "업계 최고 수준" },
      { v: "5.1시간", note: "개선 필요" },
    ],
  },
  {
    label: "1차 해결률",
    values: [
      { v: "71%", note: "중간 수준" },
      { v: "84%", note: "우수" },
      { v: "63%", note: "낮음" },
    ],
  },
  {
    label: "재문의율",
    values: [
      { v: "18%", note: "개선 여지 있음" },
      { v: "9%", note: "양호" },
      { v: "22%", note: "높음" },
    ],
  },
];

// 채널별 문의 유형 상위 3개 (쿠팡/네이버는 데이터 있음, 지그재그는 30일 기준 데이터 부족)
const ASPECT_DATA = {
  coupang: {
    label: "쿠팡",
    initial: "C",
    color: CHANNEL_COLORS.coupang,
    iconBg: "#FFD8C2",
    iconText: "#C24A0F",
    items: [
      { name: "배송 문의", pct: 62 },
      { name: "반품/교환 문의", pct: 21 },
      { name: "사이즈 문의", pct: 9 },
    ],
    footnote: "쿠팡 채널에 배송 문의가 집중되어 있어요 · 편중형 패턴 (채널 특성 요인 가능성)",
  },
  naver: {
    label: "네이버",
    initial: "N",
    color: CHANNEL_COLORS.naver,
    iconBg: "#D6F5D6",
    iconText: "#1F9254",
    items: [
      { name: "색상 문의", pct: 41 },
      { name: "배송 문의", pct: 28 },
      { name: "품질 문의", pct: 15 },
    ],
    footnote: "상대적으로 고른 분포 · 특정 유형에 쏠리지 않는 편이에요",
  },
  zigzag: {
    label: "지그재그",
    initial: "Z",
    color: CHANNEL_COLORS.zigzag,
    iconBg: "#ECECF0",
    iconText: "#9A9AA5",
    items: [],
    footnote: null,
  },
};

// 월별 문의 추이 — Figma 좌표를 역산해 근사 복원한 값 (원본에 숫자 라벨은 없었어요)
const MONTHLY_TREND = [
  { month: "1월", coupang: 314, naver: 204, zigzag: 74 },
  { month: "2월", coupang: 274, naver: 234, zigzag: 59 },
  { month: "3월", coupang: 404, naver: 189, zigzag: 84 },
  { month: "4월", coupang: 364, naver: 254, zigzag: 104 },
  { month: "5월", coupang: 434, naver: 299, zigzag: 89 },
  { month: "6월", coupang: 384, naver: 274, zigzag: 66 },
];

// 감성 분석 — 긍정/중립/부정 비율
const SENTIMENT_DATA = [
  { key: "coupang", label: "쿠팡", color: CHANNEL_COLORS.coupang, positive: 38, neutral: 35, negative: 27 },
  { key: "naver", label: "네이버", color: CHANNEL_COLORS.naver, positive: 55, neutral: 30, negative: 15 },
  { key: "zigzag", label: "지그재그", color: CHANNEL_COLORS.zigzag, positive: 42, neutral: 45, negative: 13 },
];

// 문의 유형 레이더 — 원본 SVG 폴리곤 좌표에서 정확한 수치를 복원할 수 없어 유사도 기준으로
// 근사 재구성한 데모 데이터예요. 실제 수치는 백엔드 집계로 교체하면 돼요.
const RADAR_DATA = [
  { type: "배송 문의", 쿠팡: 62, 네이버: 28, 지그재그: 35 },
  { type: "반품/교환", 쿠팡: 21, 네이버: 10, 지그재그: 15 },
  { type: "색상 문의", 쿠팡: 5, 네이버: 41, 지그재그: 20 },
  { type: "품질 문의", 쿠팡: 3, 네이버: 15, 지그재그: 12 },
  { type: "사이즈 문의", 쿠팡: 9, 네이버: 8, 지그재그: 18 },
  { type: "기타", 쿠팡: 5, 네이버: 8, 지그재그: 10 },
];

// 채널별 인사이트
const INSIGHTS = [
  {
    key: "coupang",
    label: "쿠팡",
    color: CHANNEL_COLORS.coupang,
    points: [
      "배송 문의가 전체의 62%로 집중 — 편중형 패턴",
      "재문의율 18%로 첫 응답 품질 개선 필요",
      "평균 응답 3.2시간, 빠른 응답 채널 정비 권장",
    ],
  },
  {
    key: "naver",
    label: "네이버",
    color: CHANNEL_COLORS.naver,
    points: [
      "색상·품질 문의 비중 높음 — 상품 정보 보완 효과적",
      "1차 해결률 84%로 채널 중 최고 수준",
      "긍정 감성 55%로 고객 만족도 가장 높음",
    ],
  },
  {
    key: "zigzag",
    label: "지그재그",
    color: CHANNEL_COLORS.zigzag,
    points: [
      "데이터 30일 기준 미충족 — 패턴 분석 유보",
      "재문의율 22%로 가장 높음, 모니터링 필요",
      "응답 5.1시간으로 개선 우선 채널",
    ],
  },
];

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#EDEDED] bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <h2 className="text-xl font-bold text-[#17171C]">{title}</h2>
      <p className="pt-1 text-[12px] text-[#A5A5AF]">{subtitle}</p>
      <div className="pt-6">{children}</div>
    </div>
  );
}

export default function ChannelComparisonPage() {
  return (
    <div className="flex min-h-screen bg-white">

      <div className="flex flex-1 flex-col bg-[#F8F8FC]">
        {/* Top bar */}
        <header className="flex h-[52px] items-center justify-between border-b border-slate-200 bg-white px-6">
          <span className="text-xs font-medium text-slate-900">채널 비교 분석</span>
          <NotificationBell />
        </header>

        <main className="flex flex-col gap-5 p-7">
          <h1 className="text-2xl font-bold text-slate-900">채널 비교 분석</h1>

          <div className="flex flex-col gap-6 px-5">
            {/* KPI summary */}
            <SectionCard title="채널별 핵심 지표 요약" subtitle="최근 30일 기준">
              <div className="grid grid-cols-[180px_repeat(3,1fr)] gap-4 pb-4 text-sm font-bold text-[#3A3A44]">
                <span />
                {(["coupang", "naver", "zigzag"] as const).map((k) => (
                  <span key={k} className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: CHANNEL_COLORS[k] }}
                    />
                    {ASPECT_DATA[k].label}
                  </span>
                ))}
              </div>
              <div>
                {KPI_ROWS.map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-[180px_repeat(3,1fr)] items-center gap-4 border-b border-[#F0F0F3] py-4 last:border-b-0"
                  >
                    <p className="text-[18px] font-medium text-[#52525B]">{row.label}</p>
                    {row.values.map((val, i) => (
                      <div key={i}>
                        <p
                          className="text-xl font-bold"
                          style={{
                            color: [CHANNEL_COLORS.coupang, CHANNEL_COLORS.naver, CHANNEL_COLORS.zigzag][i],
                          }}
                        >
                          {val.v}
                        </p>
                        <p className="text-xs text-[#A5A5AF]">{val.note}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Aspect distribution */}
            <SectionCard
              title="채널별 속성(Aspect) 분포 비교"
              subtitle="최근 30일 · 문의 유형 기준 상위 3개 항목"
            >
              <div className="grid grid-cols-1 divide-x divide-[#F1F1F3] md:grid-cols-3">
                {(["coupang", "naver", "zigzag"] as const).map((k) => {
                  const ch = ASPECT_DATA[k];
                  return (
                    <div key={k} className="flex flex-col px-6 first:pl-0 last:pr-0">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold"
                          style={{ backgroundColor: ch.iconBg, color: ch.iconText }}
                        >
                          {ch.initial}
                        </span>
                        <span className="text-sm font-bold text-[#17171C]">{ch.label}</span>
                      </div>

                      {ch.items.length > 0 ? (
                        <div className="flex flex-col gap-3 pt-4">
                          {ch.items.map((item, i) => (
                            <div key={item.name} className="flex items-center gap-2.5">
                              <span
                                className="w-4 text-[11px] font-bold"
                                style={{ color: i === 0 ? ch.color : "#C7C7CF" }}
                              >
                                {i + 1}
                              </span>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold text-[#3A3A44]">{item.name}</span>
                                  <span className="text-xs font-bold text-[#17171C]">{item.pct}%</span>
                                </div>
                                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#F0F0F3]">
                                  <div
                                    className="h-full rounded-full"
                                    style={{ width: `${item.pct}%`, backgroundColor: ch.color }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F7] text-[#C7C7CF]">
                            –
                          </span>
                          <p className="text-[13px] font-bold text-[#9A9AA5]">특이사항 없음</p>
                          <p className="text-center text-[12px] text-[#C0C0C8]">
                            최근 문의 데이터가
                            <br />
                            충분하지 않아요
                          </p>
                        </div>
                      )}

                      {ch.footnote && (
                        <p className="mt-4 border-t border-[#F0F0F3] pt-3 text-[12px] leading-relaxed text-[#7A7A85]">
                          {ch.footnote}
                        </p>
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
                  <LineChart data={MONTHLY_TREND} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid stroke="#F0F0F3" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#A5A5AF" }} axisLine={{ stroke: "#F0F0F3" }} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#A5A5AF" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(value, name) => [
                        `${value}건`,
                        name === "coupang" ? "쿠팡" : name === "naver" ? "네이버" : "지그재그",
                      ]}
                    />
                    <Legend
                      formatter={(value: string) =>
                        value === "coupang" ? "쿠팡" : value === "naver" ? "네이버" : "지그재그"
                      }
                    />
                    <Line type="monotone" dataKey="coupang" stroke={CHANNEL_COLORS.coupang} strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="naver" stroke={CHANNEL_COLORS.naver} strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="zigzag" stroke={CHANNEL_COLORS.zigzag} strokeWidth={2.5} strokeDasharray="6 4" dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="pt-3 text-[12px] leading-relaxed text-[#7A7A85]">
                지그재그는 표본 데이터가 부족해 점선으로 표시돼요. 데이터가 누적되면 실선으로 전환됩니다.
              </p>
            </SectionCard>

            {/* Sentiment + Radar */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <SectionCard title="채널별 감성 분석" subtitle="긍정 / 중립 / 부정 문의 비율">
                <div className="flex flex-col gap-5">
                  {SENTIMENT_DATA.map((s) => (
                    <div key={s.key}>
                      <div className="flex items-center gap-2 pb-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="text-sm font-semibold text-[#3A3A44]">{s.label}</span>
                      </div>
                      <div className="flex h-5 overflow-hidden rounded-full bg-[#F0F0F3]">
                        <div style={{ width: `${s.positive}%`, backgroundColor: s.color, opacity: 0.9 }} />
                        <div style={{ width: `${s.neutral}%`, backgroundColor: s.color, opacity: 0.35 }} />
                      </div>
                      <div className="flex gap-4 pt-2 text-xs text-[#A5A5AF]">
                        <span>긍정 {s.positive}%</span>
                        <span>중립 {s.neutral}%</span>
                        <span>부정 {s.negative}%</span>
                      </div>
                    </div>
                  ))}
                  <p className="border-t border-[#F0F0F3] pt-4 text-xs text-[#7A7A85]">
                    네이버 긍정 비율이 가장 높아 · 고객 경험 품질 우위
                  </p>
                </div>
              </SectionCard>

              <SectionCard title="문의 유형 레이더" subtitle="채널간 유형 분포 전체 비교">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={RADAR_DATA}>
                      <PolarGrid stroke="#F0F0F3" />
                      <PolarAngleAxis dataKey="type" tick={{ fontSize: 11, fill: "#7A7A85" }} />
                      <Radar name="쿠팡" dataKey="쿠팡" stroke={CHANNEL_COLORS.coupang} fill={CHANNEL_COLORS.coupang} fillOpacity={0.15} />
                      <Radar name="네이버" dataKey="네이버" stroke={CHANNEL_COLORS.naver} fill={CHANNEL_COLORS.naver} fillOpacity={0.15} />
                      <Radar name="지그재그" dataKey="지그재그" stroke={CHANNEL_COLORS.zigzag} fill={CHANNEL_COLORS.zigzag} fillOpacity={0.1} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>
            </div>

            {/* Insights */}
            <SectionCard title="채널별 주요 인사이트" subtitle="분석 기반 행동 권고사항">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {INSIGHTS.map((ch) => (
                  <div key={ch.key} className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ch.color }} />
                      <span className="text-sm font-bold text-[#17171C]">{ch.label}</span>
                    </div>
                    <ul className="flex flex-col gap-2">
                      {ch.points.map((point, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span
                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full opacity-50"
                            style={{ backgroundColor: ch.color }}
                          />
                          <span className="text-[12px] leading-relaxed text-[#52525B]">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </SectionCard>
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