"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import NotificationBell from "@/components/common/NotificationBell";
import {
  Bell,
  Mail,
  Download,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  X,
  Loader2,
  CheckCircle2,
  FileText,
  Upload,
} from "lucide-react";
import ProductSelect from "@/components/common/ProductSelect";

const kpiCards = [
  {
    label: "Total VOC Insight",
    value: "125,000",
    unit: "건",
    trend: "전월 대비 12.4% 증가",
    trendUp: true,
    tone: "default" as const,
  },
  {
    label: "Critical Risks",
    value: "03",
    unit: "건",
    trend: "즉시 대응 필요 (미처리)",
    trendUp: false,
    tone: "danger" as const,
  },
  {
    label: "Avg Response Time",
    value: "14.2",
    unit: "시간",
    trend: "전월 대비 2.1h 단축",
    trendUp: true,
    tone: "default" as const,
  },
  {
    label: "Brand Sentiment",
    value: "88.4",
    unit: "%",
    trend: "최근 3개월 중 최고치",
    trendUp: true,
    tone: "highlight" as const,
  },
];

type AspectCard = {
  id: string;
  name: string;
  feedbackCount: string;
  badge: "Risk" | "Stable";
  negativePct: number;
  positivePct: number;
  neutralPct: number;
  insight: string;
  insightTone: "danger" | "neutral";
  actionLabel: string;
  detailStats: { label: string; value: string }[];
};

const aspectCards: AspectCard[] = [
  {
    id: "color",
    name: "색상 (Color)",
    feedbackCount: "총 4,500건의 피드백",
    badge: "Risk",
    positivePct: 75,
    neutralPct: 12,
    negativePct: 13,
    insight: '전월 대비 부정 의견이 8%p 급증했습니다. "상세 페이지의 색상보다 어둡다"는 의견이 주를 이룹니다.',
    insightTone: "danger",
    actionLabel: "AI 개선 가이드 생성",
    detailStats: [
      { label: "전월 부정 비율", value: "5%" },
      { label: "이번 달 부정 비율", value: "13%" },
      { label: "최다 언급 키워드", value: "\"실물보다 어두움\"" },
    ],
  },
  {
    id: "size",
    name: "사이즈 (Size)",
    feedbackCount: "총 6,200건의 피드백",
    badge: "Stable",
    positivePct: 60,
    neutralPct: 15,
    negativePct: 25,
    insight: '부정 의견이 전월 대비 2%p 감소하며 안정적인 추세를 보이고 있습니다. "정사이즈"라는 피드백이 많습니다.',
    insightTone: "neutral",
    actionLabel: "상세 데이터 확인",
    detailStats: [
      { label: "전월 부정 비율", value: "27%" },
      { label: "이번 달 부정 비율", value: "25%" },
      { label: "최다 언급 키워드", value: "\"정사이즈예요\"" },
    ],
  },
  {
    id: "material",
    name: "소재 (Material)",
    feedbackCount: "총 1,800건의 피드백",
    badge: "Stable",
    positivePct: 80,
    neutralPct: 10,
    negativePct: 10,
    insight: '소재 만족도가 매우 높습니다. "세탁 후에도 변형이 없다"는 긍정 피드백이 전체의 40%를 차지합니다.',
    insightTone: "neutral",
    actionLabel: "상세 데이터 확인",
    detailStats: [
      { label: "전월 부정 비율", value: "11%" },
      { label: "이번 달 부정 비율", value: "10%" },
      { label: "최다 언급 키워드", value: "\"세탁 후 변형 없음\"" },
    ],
  },
];

type GapSlide = {
  pair: string;
  score: number; // 0 ~ 1
  headline: string;
  subline: string;
  badge: "CRISIS DETECTED" | "CAUTION" | "STABLE";
  causes?: string[];
  actions?: string[];
};

const gapSlides: GapSlide[] = [
  {
    pair: "쿠팡 vs 네이버",
    score: 0.54,
    headline: "채널 간 의견 불일치 발생 (주의 단계)",
    subline: "쿠팡 채널의 상세 사진 색감 보정 이슈로 인한 평판 하락 감지",
    badge: "CRISIS DETECTED",
    causes: [
      "쿠팡 입점 상품의 상세 페이지 썸네일 색상이 실물보다 과도하게 밝게 보정됨",
      '네이버 구매 고객 대비 쿠팡 구매 고객의 "색상 불만족" 키워드 4.2배 높음',
    ],
    actions: [
      "쿠팡 상세 페이지 메인 이미지를 네이버와 동일한 원본 중심 이미지로 교체",
      '"실제 색상과 가장 유사합니다" 문구가 포함된 비교 컷 추가 배치 권고',
    ],
  },
  {
    pair: "쿠팡 vs 지그재그",
    score: 0.31,
    headline: "경미한 의견 차이 감지 (관찰 단계)",
    subline: "지그재그 대비 쿠팡의 사이즈 문의 비율이 다소 높음",
    badge: "CAUTION",
    causes: ["쿠팡 사이즈 표기 방식이 지그재그와 다르게 표준화되어 있지 않음"],
    actions: ["두 채널의 사이즈 표를 동일한 기준으로 통일해 게재하는 것을 권장"],
  },
  {
    pair: "네이버 vs 지그재그",
    score: 0.12,
    headline: "채널 간 평판 격차 안정적",
    subline: "두 채널 간 고객 의견 분포가 유사하게 유지되고 있음",
    badge: "STABLE",
    causes: ["뚜렷한 격차 원인 없음 — 두 채널 모두 고른 만족도 유지 중"],
    actions: ["현재 운영 방식을 유지하며 정기 모니터링만 지속하면 충분함"],
  },
];

function DonutStat({ negativePct }: { negativePct: number }) {
  const circumference = 2 * Math.PI * 56; // r=56 within 128 box
  const negLen = (negativePct / 100) * circumference;
  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
        <circle cx="64" cy="64" r="56" fill="none" stroke="#D1D5DC" strokeWidth="16" />
        <circle
          cx="64"
          cy="64"
          r="56"
          fill="none"
          stroke="#EC003F"
          strokeWidth="16"
          strokeDasharray={`${negLen} ${circumference - negLen}`}
        />
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


function MonthlyReportPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const view = searchParams.get("tab") === "list" ? "list" : "report";

  const setView = (next: "report" | "list") => {
    router.push(`${pathname}?tab=${next}`);
  };

  const [productId, setProductId] = useState("P001");
  const [slideIndex, setSlideIndex] = useState(0);
  const slide = gapSlides[slideIndex];

  const [downloading, setDownloading] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [aiModalCardId, setAiModalCardId] = useState<string | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const nextSlide = () => setSlideIndex((i) => (i + 1) % gapSlides.length);
  const prevSlide = () => setSlideIndex((i) => (i - 1 + gapSlides.length) % gapSlides.length);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const product = productId;
    let y = 20;
    doc.setFontSize(18);
    doc.text("SELLoN 월간 리포트", 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`상품: ${product} · 생성일: ${new Date().toISOString().slice(0, 10)}`, 14, y);
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
      doc.text(`- ${a.name} (${a.feedbackCount}): 긍정 ${a.positivePct}% / 중립 ${a.neutralPct}% / 부정 ${a.negativePct}%`, 16, y);
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
    gapSlides.forEach((s) => {
      doc.text(`- ${s.pair}: Score ${s.score.toFixed(2)} (${s.badge})`, 16, y);
      y += 6;
    });

    doc.save(`sellon-monthly-report-${product}.pdf`);
    setDownloading(false);
  };

  const [selected, setSelected] = useState<string[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allChecked = selected.length === reports.length;
  const toggleAll = () => setSelected(allChecked ? [] : reports.map((r) => r.id));
  const toggleOne = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className="flex min-h-screen bg-white">

      <div className="flex flex-1 flex-col bg-[#F7F7FA]">
        <header className="flex h-[52px] items-center gap-1.5 border-b border-slate-200 bg-white px-6 text-xs">
          <button
            onClick={() => setView("report")}
            className={view === "report" ? "font-medium text-slate-900" : "text-slate-500 hover:text-slate-700"}
          >
            월간 리포트
          </button>
          <span className="text-slate-300">/</span>
          <button
            onClick={() => setView("list")}
            className={view === "list" ? "font-medium text-slate-900" : "text-slate-500 hover:text-slate-700"}
          >
            월간 리포트 목록
          </button>
          <div className="ml-auto">
            <NotificationBell />
          </div>
        </header>

        {view === "report" ? (
          <main className="flex flex-col gap-5 p-7">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">월간 리포트</h1>
            <div className="flex gap-3">
              <button
                onClick={() => setEmailModalOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <Mail className="h-3.5 w-3.5 text-indigo-500" />
                이메일 전송
              </button>
              <button
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-2.5 text-sm font-bold text-white shadow-[0_10px_15px_-3px_#E0E7FF] hover:bg-indigo-600 disabled:opacity-60"
              >
                {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                {downloading ? "생성 중..." : "리포트 다운로드 (PDF)"}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-5 px-5">
            <ProductSelect value={productId} onChange={setProductId} />

            {/* KPI cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {kpiCards.map((k) => (
                <div
                  key={k.label}
                  className={
                    "relative overflow-hidden rounded-3xl p-7 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] " +
                    (k.tone === "highlight" ? "bg-indigo-500" : "border border-slate-100 bg-white")
                  }
                >
                  <p
                    className={
                      "text-[11.5px] font-bold uppercase tracking-wide " +
                      (k.tone === "highlight" ? "text-indigo-100" : "text-slate-400")
                    }
                  >
                    {k.label}
                  </p>
                  <p className="pt-1 text-4xl font-black">
                    <span className={k.tone === "highlight" ? "text-white" : k.tone === "danger" ? "text-rose-600" : "text-slate-900"}>
                      {k.value}
                    </span>{" "}
                    <span
                      className={
                        "text-sm font-bold uppercase " +
                        (k.tone === "highlight" ? "text-indigo-200" : k.tone === "danger" ? "text-rose-400" : "text-slate-500")
                      }
                    >
                      {k.unit}
                    </span>
                  </p>
                  <p
                    className={
                      "pt-1.5 text-xs font-bold " +
                      (k.tone === "highlight"
                        ? "text-indigo-100"
                        : k.tone === "danger"
                          ? "text-rose-600"
                          : "text-emerald-600")
                    }
                  >
                    {k.trend}
                  </p>
                </div>
              ))}
            </div>

            {/* Sentiment by aspect */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900">항목별 고객 감성 분포</h2>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />긍정
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-slate-200" />중립
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-rose-600" />부정
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {aspectCards.map((a) => (
                  <div
                    key={a.name}
                    className={
                      "flex flex-col gap-6 rounded-[32px] bg-white p-8 " +
                      (a.badge === "Risk"
                        ? "shadow-[0_4px_6px_-4px_rgba(254,240,241,0.5),0_10px_15px_-3px_rgba(254,240,241,0.5)] outline outline-2 outline-rose-100"
                        : "shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] outline outline-1 outline-slate-100")
                    }
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-lg font-bold text-slate-900">{a.name}</p>
                        <p className="text-xs text-slate-400">{a.feedbackCount}</p>
                      </div>
                      <span
                        className={
                          "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide " +
                          (a.badge === "Risk" ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-700")
                        }
                      >
                        {a.badge}
                      </span>
                    </div>

                    <div className="flex items-center justify-center gap-6">
                      <DonutStat negativePct={a.negativePct} />
                      <div className="flex flex-col gap-3">
                        <span className="flex items-center gap-2 text-sm text-slate-700">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          좋아요 {a.positivePct}%
                        </span>
                        <span className="flex items-center gap-2 text-sm text-slate-700">
                          <span className="h-2 w-2 rounded-full bg-slate-300" />
                          보통 {a.neutralPct}%
                        </span>
                        <span className="flex items-center gap-2 text-sm text-slate-700">
                          <span className="h-2 w-2 rounded-full bg-rose-600" />
                          별로예요 {a.negativePct}%
                        </span>
                      </div>
                    </div>

                    <div
                      className={
                        "rounded-2xl p-4 text-xs font-bold leading-relaxed " +
                        (a.insightTone === "danger" ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-500")
                      }
                    >
                      {a.insightTone === "danger" && "⚠ "}
                      {a.insight}
                    </div>

                    {expandedCardId === a.id && (
                      <div className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-white p-4">
                        {a.detailStats.map((s) => (
                          <div key={s.label} className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">{s.label}</span>
                            <span className="font-bold text-slate-700">{s.value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() =>
                        a.badge === "Risk"
                          ? setAiModalCardId(a.id)
                          : setExpandedCardId((cur) => (cur === a.id ? null : a.id))
                      }
                      className={
                        "rounded-2xl py-3.5 text-sm font-bold " +
                        (a.badge === "Risk"
                          ? "bg-slate-900 text-white hover:bg-black"
                          : "border border-slate-200 text-slate-700 hover:bg-slate-50")
                      }
                    >
                      {a.badge === "Risk"
                        ? a.actionLabel
                        : expandedCardId === a.id
                          ? "접기"
                          : a.actionLabel}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Channel reputation gap carousel */}
            <div className="relative rounded-[40px] border border-slate-100 bg-white p-10 shadow-[0_20px_25px_-5px_rgba(243,244,246,0.5),0_8px_10px_-6px_rgba(243,244,246,0.5)]">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">채널 간 평판 격차 분석</h2>
                  <p className="pt-1.5 text-sm text-slate-500">
                    쿠팡 vs 네이버 스마트스토어 평판 차이 (JSD Matrix)
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={
                      "rounded-full px-4 py-1.5 text-xs font-black " +
                      (slide.badge === "STABLE"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700")
                    }
                  >
                    {slide.badge}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">
                    마지막 업데이트: 2026.06.30 23:59
                  </span>
                </div>
              </div>

              {/* Gauge */}
              <div className="pt-14">
                <div className="flex justify-between pb-2 text-[10px] font-black">
                  <div>
                    <p className="text-slate-400">SAFETY ZONE</p>
                    <p className="text-emerald-600">안전 (0.0)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400">DANGER ZONE</p>
                    <p className="text-rose-600">위험 (0.6+)</p>
                  </div>
                </div>
                <div className="relative h-24 overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500">
                  <div
                    className="absolute top-0 h-full w-[3px] bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)]"
                    style={{ left: `${slide.score * 100}%` }}
                  />
                  <div className="flex h-full flex-col justify-center gap-1 px-6">
                    <p className="text-lg font-black text-white">{slide.headline}</p>
                    <p className="text-[13px] font-bold text-white/90">{slide.subline}</p>
                  </div>
                  <span
                    className="absolute top-3 -translate-x-1/2 rounded-xl bg-white px-4 py-1.5 text-xs font-black text-slate-900 shadow"
                    style={{ left: `${slide.score * 100}%` }}
                  >
                    <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-amber-400" />
                    Score {slide.score.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3">
                  <p className="text-[15px] font-black text-slate-900">{slide.pair}</p>
                  <span
                    className={
                      "rounded-full px-3 py-1 text-[10px] font-black " +
                      (slide.badge === "STABLE"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700")
                    }
                  >
                    {slide.badge}
                  </span>
                </div>
              </div>

              {/* Causes / actions */}
              <div className="grid grid-cols-1 gap-8 pt-10 lg:grid-cols-2">
                <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-6">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-indigo-600" />
                    <p className="text-sm font-black text-slate-900">원인 분석 결과</p>
                  </div>
                  <ul className="flex flex-col gap-3">
                    {(slide.causes ?? []).map((c, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs font-bold text-slate-600">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-100 bg-white text-[10px] font-bold text-indigo-600">
                          {i + 1}
                        </span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <p className="text-sm font-black text-slate-900">권장 조치 사항</p>
                  </div>
                  <ul className="flex flex-col gap-3">
                    {(slide.actions ?? []).map((a, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs font-bold text-slate-600">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-100 bg-white text-[10px] font-bold text-amber-500">
                          !
                        </span>
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Carousel controls */}
              <button
                onClick={prevSlide}
                className="absolute left-6 top-[240px] flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:bg-slate-50"
              >
                <ChevronLeft className="h-4 w-4 text-slate-600" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-6 top-[240px] flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:bg-slate-50"
              >
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </button>
              <div className="flex justify-center gap-2 pt-6">
                {gapSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlideIndex(i)}
                    className={"h-2 w-2 rounded-full " + (i === slideIndex ? "bg-indigo-600" : "bg-slate-200")}
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
        ) : (
          <main className="flex flex-col gap-6 p-7">
          <div className="flex items-center justify-between pr-10">
            <h1 className="text-2xl font-bold text-slate-900">월별 리포트 목록</h1>
            <button
              onClick={() => fileInputRef.current?.click()}
              className={
                "flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold " +
                (uploadedFile ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-400 hover:bg-slate-200")
              }
            >
              <Upload className="h-3.5 w-3.5" />
              {uploadedFile ? uploadedFile.name : "파일을 선택하세요"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setUploadedFile(e.target.files?.[0] ?? null)}
            />
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

      {emailModalOpen && <EmailSendModal onClose={() => setEmailModalOpen(false)} />}
      {aiModalCardId && (
        <AiGuideModal
          card={aspectCards.find((a) => a.id === aiModalCardId)!}
          onClose={() => setAiModalCardId(null)}
        />
      )}
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

function EmailSendModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 백엔드 이메일 발송 API 붙으면 이 부분을 실제 fetch 호출로 교체
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-[420px] rounded-2xl bg-white p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">리포트 이메일 전송</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            <p className="text-sm font-bold text-slate-900">전송 완료</p>
            <p className="text-xs text-slate-500">{email}로 리포트를 보냈어요.</p>
            <button
              onClick={onClose}
              className="mt-3 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-black"
            >
              닫기
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex flex-col gap-4">
            <div>
              <label htmlFor="report-email" className="mb-1.5 block text-xs font-semibold text-slate-600">
                받는 사람 이메일
              </label>
              <input
                id="report-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@sellon.co.kr"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-500 py-3 text-sm font-bold text-white hover:bg-indigo-600 disabled:opacity-60"
            >
              {sending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {sending ? "전송 중..." : "전송하기"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function AiGuideModal({ card, onClose }: { card: AspectCard; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [guide, setGuide] = useState<string[]>([]);

  useEffect(() => {
    // TODO: 백엔드 AI 가이드 생성 API 붙으면 이 부분을 실제 fetch 호출로 교체
    const timer = setTimeout(() => {
      setGuide([
        `${card.name} 상세 페이지의 메인 이미지를 원본 색감 그대로 재촬영해 교체하세요.`,
        `"실제 색상과 가장 유사합니다" 문구가 포함된 비교 컷을 상세페이지 상단에 추가하세요.`,
        `조명 환경(자연광/실내광)별로 촬영한 이미지를 함께 노출해 오차 범위를 안내하세요.`,
      ]);
      setLoading(false);
    }, 1400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-[480px] rounded-2xl bg-white p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Sparkles className="h-4.5 w-4.5 text-indigo-500" />
            AI 개선 가이드 · {card.name}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <Loader2 className="h-7 w-7 animate-spin text-indigo-500" />
            <p className="text-sm text-slate-500">피드백 데이터를 분석해 가이드를 만들고 있어요...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <ul className="flex flex-col gap-3">
              {guide.map((g, i) => (
                <li key={i} className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                    {i + 1}
                  </span>
                  {g}
                </li>
              ))}
            </ul>
            <button
              onClick={onClose}
              className="rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-black"
            >
              확인했어요
            </button>
          </div>
        )}
      </div>
    </div>
  );
}