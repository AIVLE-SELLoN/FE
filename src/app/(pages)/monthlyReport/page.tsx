"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import NotificationBell from "@/components/common/NotificationBell";
import { Download, Loader2, FileText, Lightbulb } from "lucide-react";
import ErrorState from "@/components/common/ErrorState";

// 리포트 대상 상품 — 화면 전체가 PDF로 렌더되는 구조라 선택 UI 없이 이름만 표기해요.
const PRODUCTS: Record<string, string> = {
  P001: "미디 원피스",
  P002: "린넨 셔츠",
  P003: "슬림 슬랙스",
  P004: "오버핏 가디건",
};

const kpiCards = [
  {
    label: "Total VOC Insight",
    value: "125,000",
    unit: "건",
    trend: "전월 대비 12.4% 증가",
    tone: "default" as const,
  },
  {
    label: "Brand Sentiment",
    value: "88.4",
    unit: "%",
    trend: "최근 3개월 중 최고치",
    tone: "highlight" as const,
  },
];

type AspectCard = {
  id: string;
  name: string;
  feedbackCount: string;
  positivePct: number;
  neutralPct: number;
  negativePct: number;
  /** 화면에는 노출하지 않고 PDF 본문에만 들어가는 요약 문구예요. */
  insight: string;
};

const aspectCards: AspectCard[] = [
  {
    id: "color",
    name: "색상 (Color)",
    feedbackCount: "총 4,500건의 피드백",
    positivePct: 75,
    neutralPct: 12,
    negativePct: 13,
    insight: "전월 대비 부정 의견이 8%p 급증했습니다. 상세 페이지의 색상보다 어둡다는 의견이 주를 이룹니다.",
  },
  {
    id: "size",
    name: "사이즈 (Size)",
    feedbackCount: "총 6,200건의 피드백",
    positivePct: 60,
    neutralPct: 15,
    negativePct: 25,
    insight: "부정 의견이 전월 대비 2%p 감소하며 안정적인 추세를 보이고 있습니다. 정사이즈라는 피드백이 많습니다.",
  },
  {
    id: "material",
    name: "소재 (Material)",
    feedbackCount: "총 1,800건의 피드백",
    positivePct: 80,
    neutralPct: 10,
    negativePct: 10,
    insight: "소재 만족도가 매우 높습니다. 세탁 후에도 변형이 없다는 긍정 피드백이 전체의 40%를 차지합니다.",
  },
];

type GapBlock = {
  pair: string;
  score: number; // 0 ~ 1
  causes: string[];
  actions: string[];
};

// 3쌍을 세로로 모두 나열해요. (기존에는 캐러셀이었지만 PDF로 렌더되므로 전개형으로 변경)
const gapBlocks: GapBlock[] = [
  {
    pair: "쿠팡 vs 네이버",
    score: 0.54,
    causes: [
      "쿠팡 입점 상품의 상세 페이지 썸네일 색상이 실물보다 과도하게 밝게 보정됨",
      "네이버 대비 쿠팡 구매 고객의 색상 불만족 키워드 4.2배 높음",
    ],
    actions: [
      "쿠팡 상세 페이지 메인 이미지를 네이버와 동일한 원본 중심 이미지로 교체",
      "실제 색상과 가장 유사합니다 문구 포함 비교 컷 추가 배치 권고",
    ],
  },
  {
    pair: "네이버 vs 지그재그",
    score: 0.12,
    causes: [
      "두 채널 간 고객 의견 분포가 유사하게 유지되고 있음",
      "네이버와 지그재그 간 브랜드 인식 격차 미미, 특이사항 없음",
    ],
    actions: [
      "현 수준 유지 및 지속적인 콘텐츠 품질 관리 권장",
      "분기별 정기 모니터링 지속 및 이상 신호 선제 감지 체계 유지",
    ],
  },
  {
    pair: "지그재그 vs 쿠팡",
    score: 0.31,
    causes: [
      "지그재그 대비 쿠팡의 사이즈 관련 문의 및 부정 리뷰 비율 다소 높음",
      "채널 간 사이즈 가이드 정보의 세부 표기 방식 불일치 감지",
    ],
    actions: [
      "쿠팡 상품 상세 페이지 내 사이즈 가이드 표기 방식 보강 검토",
      "쿠팡-지그재그 간 스펙 정보 및 사이즈 차트 통일화 작업 추진",
    ],
  },
];

/**
 * 긍정/중립/부정 3분할 도넛.
 * 12시 방향에서 시계 방향으로 부정 → 긍정 → 중립 순서로 그려요.
 */
function DonutStat({
  positivePct,
  neutralPct,
  negativePct,
}: {
  positivePct: number;
  neutralPct: number;
  negativePct: number;
}) {
  const radius = 56; // 128 박스 기준
  const circumference = 2 * Math.PI * radius;

  let cursor = 0;
  const arcs = [
    { pct: negativePct, color: "#EC003F" },
    { pct: positivePct, color: "#00BC7D" },
    { pct: neutralPct, color: "#D1D5DC" },
  ].map((seg) => {
    const length = (seg.pct / 100) * circumference;
    const arc = { ...seg, length, offset: cursor };
    cursor += length;
    return arc;
  });

  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
        {arcs.map((arc) => (
          <circle
            key={arc.color}
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke={arc.color}
            strokeWidth="16"
            strokeDasharray={`${arc.length} ${circumference - arc.length}`}
            strokeDashoffset={-arc.offset}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[11px] text-slate-400">부정</span>
        <span className="text-[22px] font-black text-slate-900">{negativePct}%</span>
      </div>
    </div>
  );
}

type ReportRow = {
  id: string;
  title: string;
  period: string;
  createdAt: string;
  size: string;
  status: "최신" | "보관";
};

// 목데이터 — 실제로는 리포트 목록 API에서 받아와야 해요.
const reports: ReportRow[] = [
  { id: "r-2026-06", title: "2026.06 월간 성과 리포트", period: "2026년 6월", createdAt: "2026.07.01", size: "4.2 MB", status: "최신" },
  { id: "r-2026-05", title: "2026.05 월간 성과 리포트", period: "2026년 5월", createdAt: "2026.06.01", size: "3.9 MB", status: "보관" },
  { id: "r-2026-04", title: "2026.04 월간 성과 리포트", period: "2026년 4월", createdAt: "2026.05.01", size: "4.1 MB", status: "보관" },
  { id: "r-2026-03", title: "2026.03 월간 성과 리포트", period: "2026년 3월", createdAt: "2026.04.01", size: "3.7 MB", status: "보관" },
  { id: "r-2026-02", title: "2026.02 월간 성과 리포트", period: "2026년 2월", createdAt: "2026.03.01", size: "3.5 MB", status: "보관" },
  { id: "r-2026-01", title: "2026.01 월간 성과 리포트", period: "2026년 1월", createdAt: "2026.02.01", size: "3.8 MB", status: "보관" },
];

// TODO: 실제로는 상품별 월간 CS 표본 수량을 API에서 받아와 임계치와 비교해야 해요.
// 지금은 목데이터로 특정 상품만 표본 부족 상태로 취급합니다.
const LOW_CS_SAMPLE_PRODUCT_IDS = new Set(["P003"]);

function MonthlyReportPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const view = searchParams.get("tab") === "list" ? "list" : "report";

  const setView = (next: "report" | "list") => {
    router.push(`${pathname}?tab=${next}`);
  };

  // TODO: 어떤 상품의 리포트를 볼지는 리포트 목록에서 넘겨받도록 연결해야 해요.
  const [productId] = useState("P001");
  const hasLowCsSample = LOW_CS_SAMPLE_PRODUCT_IDS.has(productId);

  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(18);
    doc.text("SELLoN 월간 리포트", 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`상품: ${productId} · 생성일: ${new Date().toISOString().slice(0, 10)}`, 14, y);
    y += 12;

    doc.setFontSize(13);
    doc.text("핵심 지표", 14, y);
    y += 7;
    doc.setFontSize(10);
    kpiCards.forEach((k) => {
      doc.text(`- ${k.label}: ${k.value}${k.unit} (${k.trend})`, 16, y);
      y += 6;
    });
    y += 6;

    doc.setFontSize(13);
    doc.text("항목별 고객 감성 분포", 14, y);
    y += 7;
    doc.setFontSize(10);
    aspectCards.forEach((a) => {
      const ratio = `긍정 ${a.positivePct}% / 중립 ${a.neutralPct}% / 부정 ${a.negativePct}%`;
      doc.text(`- ${a.name} (${a.feedbackCount}): ${ratio}`, 16, y);
      y += 6;
      const lines = doc.splitTextToSize(a.insight, 170);
      doc.text(lines, 18, y);
      y += lines.length * 5 + 3;
    });
    y += 4;

    doc.setFontSize(13);
    doc.text("채널 간 평판 격차 분석", 14, y);
    y += 7;
    doc.setFontSize(10);
    gapBlocks.forEach((s) => {
      doc.text(`- ${s.pair}: Score ${s.score.toFixed(2)}`, 16, y);
      y += 6;
    });

    doc.save(`sellon-monthly-report-${productId}.pdf`);
    setDownloading(false);
  };

  const [selected, setSelected] = useState<string[]>([]);
  const [downloadingSelected, setDownloadingSelected] = useState(false);

  const allChecked = selected.length === reports.length;
  const toggleAll = () => setSelected(allChecked ? [] : reports.map((r) => r.id));
  const toggleOne = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleDownloadSelected = async () => {
    if (selected.length === 0) return;
    setDownloadingSelected(true);
    // TODO: 실제로는 선택된 리포트 id들을 백엔드에 넘겨 파일(또는 zip)을 받아와야 해요.
    await new Promise((res) => setTimeout(res, 800));
    setDownloadingSelected(false);
  };

  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex flex-1 flex-col bg-[#F7F7FA]">
        <header className="flex h-[52px] items-center gap-1.5 border-b border-slate-200 bg-white px-6 text-xs">
          <button onClick={() => setView("report")} className="text-slate-500 hover:text-slate-700">
            월간 리포트
          </button>
          <span className="text-slate-300">{" > "}</span>
          <button onClick={() => setView("list")} className="font-bold text-slate-900">
            {view === "list" ? "월간 리포트 목록" : "월간 리포트"}
          </button>
          <div className="ml-auto">
            <NotificationBell />
          </div>
        </header>

        {view === "report" ? (
          <main className="flex flex-col gap-5 p-7">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-900">월간 리포트</h1>
              {!hasLowCsSample && (
                <button
                  onClick={handleDownloadPdf}
                  disabled={downloading}
                  className="flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-2.5 text-sm font-bold text-white shadow-[0_10px_15px_-3px_#E0E7FF] hover:bg-indigo-600 disabled:opacity-60"
                >
                  {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                  {downloading ? "생성 중..." : "리포트 다운로드 (PDF)"}
                </button>
              )}
            </div>

            <div className="px-5">
              {hasLowCsSample ? (
                <ErrorState
                  title="해당 상품은 월간 CS 표본 수량 부족으로 인하여 보고서 작성이 보류되었습니다."
                  description="데이터가 누적되면 분석이 시작됩니다."
                  titleMaxWidth="760px"
                  titleSize="md"
                  onRetry={() => window.location.reload()}
                  onGoHome={() => router.push("/")}
                />
              ) : (
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_2fr]">
                  {/* 좌측: 상품 요약 + 항목별 감성 분포 */}
                  <div className="flex flex-col gap-5">
                    <p className="text-lg font-bold text-slate-400">
                      {PRODUCTS[productId]} ({productId})
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      {kpiCards.map((k) => {
                        const highlight = k.tone === "highlight";
                        return (
                          <div
                            key={k.label}
                            className={
                              "relative overflow-hidden rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] " +
                              (highlight ? "bg-indigo-500" : "border border-slate-100 bg-white")
                            }
                          >
                            {/* 우상단 원형 장식 */}
                            <span
                              className={
                                "pointer-events-none absolute -right-5 -top-3 h-24 w-24 rounded-full " +
                                (highlight ? "bg-white/15" : "bg-slate-50")
                              }
                            />
                            <p
                              className={
                                "relative text-[11.5px] font-bold uppercase tracking-wide " +
                                (highlight ? "text-indigo-100" : "text-slate-400")
                              }
                            >
                              {k.label}
                            </p>
                            <p className="relative pt-2 text-3xl font-black">
                              <span className={highlight ? "text-white" : "text-slate-900"}>{k.value}</span>{" "}
                              <span
                                className={
                                  "text-sm font-bold uppercase " +
                                  (highlight ? "text-indigo-200" : "text-slate-500")
                                }
                              >
                                {k.unit}
                              </span>
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    <h2 className="text-lg font-bold text-slate-900">항목별 고객 감성 분포</h2>

                    {/* 남는 세로 공간을 카드 3장이 균등하게 나눠 가져요 (우측 카드와 하단 정렬) */}
                    <div className="flex flex-1 flex-col gap-5">
                      {aspectCards.map((a) => (
                        <div
                          key={a.id}
                          className="flex flex-1 flex-col rounded-[24px] border border-slate-100 bg-white p-7 shadow-[0_1px_3px_rgba(0,0,0,0.07)]"
                        >
                          <p className="text-lg font-bold text-slate-900">{a.name}</p>
                          <p className="pt-1 text-xs text-slate-400">{a.feedbackCount}</p>

                          <div className="flex flex-1 items-center justify-between gap-5 pt-6">
                            <div className="flex flex-col gap-3">
                              <span className="flex items-center gap-2 text-sm text-slate-700">
                                <span className="h-2 w-2 rounded-full bg-[#00BC7D]" />
                                좋아요 {a.positivePct}%
                              </span>
                              <span className="flex items-center gap-2 text-sm text-slate-700">
                                <span className="h-2 w-2 rounded-full bg-[#D1D5DC]" />
                                보통 {a.neutralPct}%
                              </span>
                              <span className="flex items-center gap-2 text-sm text-slate-700">
                                <span className="h-2 w-2 rounded-full bg-[#EC003F]" />
                                별로예요 {a.negativePct}%
                              </span>
                            </div>
                            <DonutStat
                              positivePct={a.positivePct}
                              neutralPct={a.neutralPct}
                              negativePct={a.negativePct}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 우측: 채널 간 평판 격차 분석 */}
                  {/* lg 이상에서만 mt-12 — 좌측 상품명 한 줄(28px) + gap-5(20px)만큼 내려서
                      TOTAL VOC INSIGHT 카드 상단과 높이를 맞춥니다. */}
                  <div className="rounded-[32px] border border-slate-100 bg-white p-9 shadow-[0_1px_3px_rgba(0,0,0,0.07)] lg:mt-12">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-black text-slate-900">채널 간 평판 격차 분석</h2>
                        <p className="pt-1.5 text-sm text-slate-500">채널 간 평판 차이</p>
                      </div>
                      <div className="text-right text-[11px] font-bold leading-relaxed text-slate-400">
                        <p>마지막 업데이트</p>
                        <p>2026.06.30 23:59</p>
                      </div>
                    </div>

                    <div className="flex flex-col divide-y divide-slate-100">
                      {gapBlocks.map((b) => (
                        <div key={b.pair} className="flex flex-col gap-5 py-8 last:pb-0">
                          <p className="text-lg font-black text-slate-900">{b.pair}</p>

                          {/* 게이지 — 마커와 점수 배지 위치는 score(0~1)를 그대로 % 로 씁니다 */}
                          <div className="relative pt-7">
                            <span
                              className="absolute top-0 -translate-x-1/2 whitespace-nowrap rounded-xl bg-white px-3.5 py-1.5 text-xs font-black text-slate-900 shadow-[0_2px_10px_rgba(0,0,0,0.14)]"
                              style={{ left: `${b.score * 100}%` }}
                            >
                              <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-amber-400" />
                              Score {b.score.toFixed(2)}
                            </span>

                            <div className="relative h-[88px] overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500">
                              <div
                                className="absolute top-0 h-full w-[3px] bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)]"
                                style={{ left: `${b.score * 100}%` }}
                              />
                              <div className="relative flex h-full items-center justify-between px-6">
                                <div className="text-[10px] font-black leading-tight text-white">
                                  <p className="opacity-80">SAFETY ZONE</p>
                                  <p className="pt-0.5 text-[13px]">안전 (0.0)</p>
                                </div>
                                <div className="text-right text-[10px] font-black leading-tight text-white">
                                  <p className="opacity-80">DANGER ZONE</p>
                                  <p className="pt-0.5 text-[13px]">위험 (0.6+)</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                            <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5">
                              <p className="text-sm font-black text-slate-900">원인 분석 결과</p>
                              <ul className="flex flex-col gap-3">
                                {b.causes.map((c, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2.5 text-xs font-bold leading-relaxed text-slate-600"
                                  >
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-100 bg-white text-[10px] font-bold text-indigo-600">
                                      {i + 1}
                                    </span>
                                    {c}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5">
                              <p className="flex items-center gap-2 text-sm font-black text-slate-900">
                                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                                권장 조치 사항
                              </p>
                              <ul className="flex flex-col gap-3">
                                {b.actions.map((a, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2.5 text-xs font-bold leading-relaxed text-slate-600"
                                  >
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-100 bg-white text-[10px] font-bold text-amber-500">
                                      !
                                    </span>
                                    {a}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        ) : (
          <main className="flex flex-col gap-6 p-7">
            <div className="flex items-center justify-between pr-10">
              <h1 className="text-2xl font-bold text-slate-900">월별 리포트 목록</h1>
              <button
                onClick={handleDownloadSelected}
                disabled={selected.length === 0 || downloadingSelected}
                className={
                  "flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold " +
                  (selected.length > 0
                    ? "bg-indigo-500 text-white hover:bg-indigo-600"
                    : "cursor-not-allowed bg-slate-100 text-slate-400")
                }
              >
                {downloadingSelected ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                {downloadingSelected
                  ? "다운로드 중..."
                  : selected.length > 0
                    ? `선택 항목 다운로드 (${selected.length})`
                    : "파일을 선택하세요"}
              </button>
            </div>

            <div className="flex flex-col gap-4 px-5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-100" />
                <p className="text-[13px] font-semibold text-slate-500">
                  최근 6개월 보관 리포트 · {reports.length}개
                </p>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.07)]">
                <div className="flex items-center gap-4 border-b border-slate-100 bg-slate-50 px-6 py-3">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                    className="h-[18px] w-[18px] rounded border-2 border-slate-300"
                  />
                  <div className="grid flex-1 grid-cols-[1fr_140px_120px_90px_80px] text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    <span>리포트명</span>
                    <span>대상 기간</span>
                    <span>생성일</span>
                    <span>용량</span>
                    <span>상태</span>
                  </div>
                </div>

                <div>
                  {reports.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center gap-4 border-b border-slate-100 px-6 py-4 last:border-b-0 hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(r.id)}
                        onChange={() => toggleOne(r.id)}
                        className="h-5 w-5 rounded border-2 border-slate-300"
                      />
                      <div className="grid flex-1 grid-cols-[1fr_140px_120px_90px_80px] items-center">
                        <div className="flex items-center gap-3">
                          <span className="flex h-11 w-9 items-center justify-center rounded bg-indigo-50">
                            <FileText className="h-4 w-4 text-indigo-600" />
                          </span>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{r.title}</p>
                            <p className="text-xs text-slate-400">PDF 문서</p>
                          </div>
                        </div>
                        <span className="text-[13px] text-slate-600">{r.period}</span>
                        <span className="text-[13px] text-slate-500">{r.createdAt}</span>
                        <span className="text-[13px] font-medium text-slate-500">{r.size}</span>
                        <span>
                          <span
                            className={
                              "rounded-full px-2.5 py-1 text-[11px] font-bold " +
                              (r.status === "최신"
                                ? "bg-indigo-50 text-indigo-600"
                                : "bg-slate-100 text-slate-500")
                            }
                          >
                            {r.status}
                          </span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="pt-2 text-xs text-slate-400">
                월간 리포트는 생성일로부터 <span className="font-semibold text-slate-500">6개월간</span> 자동
                보관됩니다. 보관 기간 만료 시 자동 삭제됩니다.
              </p>
            </div>
          </main>
        )}

        <div className="flex flex-col items-center gap-3 border-t border-[#E5E7EB] bg-white px-6 py-8 text-center">
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

export default function MonthlyReportPage() {
  return (
    <Suspense fallback={null}>
      <MonthlyReportPageContent />
    </Suspense>
  );
}
