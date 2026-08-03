"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ChevronRight,
  X,
  ShieldCheck,
  Sparkles,
  RotateCw,
  Quote,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileEdit,
  RotateCcw,
} from "lucide-react";
import NotificationBell from "@/components/common/NotificationBell";



// 목데이터 — 실제로는 인사이트 상세 API에서 받아와야 해요.
const insight = {
  product: "[쿠팡/네이버] 프리미엄 면 티셔츠 (남성)",
  createdAt: "2026-07-18",
  csEvidence:
    "최근 30일간 색상 관련 CS 문의 12건 접수. '사진과 실제 색상 달라요', '색상이 생각보다 어두워요' 등의 문의가 집중됨.",
  confidence: "높음",
  confidenceReason: "동일 패턴 CS 12건으로 통계적으로 유의미하며 유사 사례의 개선 효과도 수치로 확인됨",
  similarCase:
    "2025년 3월 유사 상품(SKU: TS-204)에서 동일 유형 CS 발생 후 색상 비교 이미지 추가로 CS 62% 감소 확인.",
  sourceQuote: "\"컬러: 네이비 블루 (모니터 환경에 따라 색상이 다르게 보일 수 있습니다)\"",
  sourceField: "색상",
};

const generatedProposal =
  "상세페이지 색상 항목에 자연광 실제 촬영 이미지와 모니터 색 보정 전/후 비교 이미지를 추가하세요.\n\n" +
  "'모니터 환경에 따라 다를 수 있습니다' 안내 문구를 첫 번째 대표 이미지 하단으로 이동하고, 실제 색상 칩(팬톤 코드 포함)을 함께 표기하면 고객 혼란을 줄일 수 있습니다.";

const suggestedDescription =
  "[상품 설명]\n프리미엄 면 티셔츠 (남성)\n\n소재\n- 면 100% (싱글 저지, 180g/m²)\n\n색상\n컬러: 네이비 블루\n※ 모니터 환경에 따라 실제 색상과 다르게 보일 수 있습니다. (실제 색상 팬톤 코드: 19-4052 TCX)\n\n사이즈 (단위: cm)\nS: 총장 66 / 가슴 96 / 어깨 43\nM: 총장 68 / 가슴 100 / 어깨 45";



type HistoryItem = {
  id: string;
  product: string;
  summary: string;
  appliedAt: string;
  reverted: boolean;
  fullProposal: string;
  before: string;
  after: string;
};

// 목데이터 — 실제로는 개선안 히스토리 API에서 받아와야 해요.
const productDescriptionBefore =
  "■ 상품명: 프리미엄 면 티셔츠 (남성)\n■ 소재\n- 면 100% (싱글 저지, 180g/m²)\n■ 색상\n컬러: 네이비 블루 (모니터 환경에 따라 색상이 다르게 보일 수 있습니다)\n■ 사이즈 (단위: cm)\nS: 총장 66 / 가슴 96 / 어깨 43\nM: 총장 68 / 가슴 100 / 어깨 45\nL: 총장 70 / 가슴 104 / 어깨 47\nXL: 총장 72 / 가슴 108 / 어깨 49\n■ 세탁 방법\n- 30°C 이하 단독 세탁\n- 건조기 사용 금지\n- 직사광선 건조 금지\n■ 배송 안내\n- 평균 배송 기간: 2~5 영업일\n- 도서/산간 지역 추가 기간 발생 가능";

const productDescriptionAfter =
  "■ 상품명: 프리미엄 면 티셔츠 (남성)\n■ 소재\n- 면 100% (싱글 저지, 180g/m²)\n■ 색상\n컬러: 네이비 블루 (모니터 환경에 따라 색상이 다르게 보일 수 있습니다)\n■ 사이즈 (단위: cm)\nS: 총장 66 / 가슴 96 / 어깨 43\nM: 총장 68 / 가슴 100 / 어깨 45\nL: 총장 70 / 가슴 104 / 어깨 47\nXL: 총장 72 / 가슴 108 / 어깨 49\n■ 세탁 방법\n- 30°C 이하 단독 세탁\n- 건조기 사용 금지\n- 직사광선 건조 금지\n■ 배송 안내\n- 평균 배송 기간: 2~5 영업일\n- 도서/산간 지역 추가 기간 발생 가능함";

const initialHistory: HistoryItem[] = [
  {
    id: "h1",
    product: "[쿠팡/네이버] 프리미엄 면 티셔츠 (남성)",
    summary:
      "상세페이지 색상 항목에 자연광 실제 촬영 이미지와 모니터 색 보정 전/후 비교 이미지를 추가하세요.",
    appliedAt: "2026. 07. 22. 오전 09:29",
    reverted: false,
    fullProposal:
      "상세페이지 색상 항목에 자연광 실제 촬영 이미지와 모니터 색 보정 전/후 비교 이미지를 추가하세요.\n\n" +
      "'모니터 환경에 따라 다를 수 있습니다' 안내 문구를 첫 번째 대표 이미지 하단으로 이동하고, 실제 색상 칩(팬톤 코드 포함)을 함께 표기하면 고객 혼란을 줄일 수 있습니다.",
    before: productDescriptionBefore,
    after: productDescriptionAfter,
  },
];


function ReportPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const view = searchParams.get("tab") === "history" ? "history" : "insight";
  const setView = (next: "insight" | "history") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next);
    router.push(`?${params.toString()}`);
  };

  const [stage, setStage] = useState<"draft" | "review">("draft");
  const [note, setNote] = useState("");
  const [applying, setApplying] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const [description, setDescription] = useState("");
  const [savedDescription, setSavedDescription] = useState<string | null>(null);

  const handleApplyProposal = () => {
    setApplying(true);
    // TODO: 백엔드 개선안 생성 API 붙으면 이 부분을 실제 fetch 호출로 교체
    setTimeout(() => {
      setApplying(false);
      setStage("review");
      setDescription(suggestedDescription); // 디자인 기준: 리뷰 단계 진입 시 AI 제안 상품설명이 바로 채워져야 함
    }, 1200);
  };

  const handleSubmitRejection = () => {
    setRejectModalOpen(false);
    setRegenerating(true);
    // TODO: 백엔드 재분석 요청 API 붙으면 반려 사유를 함께 전송하도록 교체
    setTimeout(() => setRegenerating(false), 1200);
  };

  const handleSaveDescription = () => {
    setSavedDescription(description.trim() || suggestedDescription);
  };

  const [history, setHistory] = useState<HistoryItem[]>(initialHistory);
  const [openId, setOpenId] = useState<string | null>(null);

  const openItem = history.find((h) => h.id === openId) ?? null;

  const handleRevert = (id: string) => {
    // TODO: 백엔드 되돌리기 API 붙으면 이 부분을 실제 fetch 호출로 교체
    setHistory((prev) => prev.map((h) => (h.id === id ? { ...h, reverted: true } : h)));
    setOpenId(null);
  };

  return (
    <div className="flex min-h-screen bg-white">

      <div className="flex flex-1 flex-col bg-[#F8F8FC]">
        <header className="flex h-[52px] items-center gap-1.5 border-b border-slate-200 bg-white px-6 text-xs">
          <span className="text-slate-400">개선 리포트</span>
          <ChevronRight className="h-3 w-3 text-slate-300" />
          <span className="font-medium text-slate-900">
            {view === "insight" ? "AI 인사이트 리포트" : "개선안 히스토리"}
          </span>
          <div className="ml-auto">
            <NotificationBell />
          </div>
        </header>

        {view === "insight" ? (
          stage === "draft" ? (
          <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-900">AI 인사이트 리포트</h1>
            <button
              onClick={() => setView("history")}
              className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-600"
            >
              건너뛰기
            </button>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">분석 상품</p>
                <p className="pt-1 text-base font-bold text-slate-900">{insight.product}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-400">개선안 작성일</p>
                <p className="pt-1 text-sm font-medium text-slate-500">{insight.createdAt}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
            <p className="text-sm font-bold text-slate-900">CS 문의 근거 요약</p>
            <p className="pt-2 text-sm leading-relaxed text-slate-600">{insight.csEvidence}</p>
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              <p className="text-sm font-bold text-indigo-700">확신도</p>
              <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-[11px] font-bold text-white">
                {insight.confidence}
              </span>
            </div>
            <p className="pt-2 text-sm leading-relaxed text-indigo-700">{insight.confidenceReason}</p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
            <p className="text-sm font-bold text-slate-900">유사 사례</p>
            <p className="pt-2 text-sm leading-relaxed text-slate-600">{insight.similarCase}</p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
            <p className="pb-3 text-sm font-bold text-slate-900">개선안</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="개선안을 입력하세요..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-900">근거 데이터 (상세페이지 인용)</p>
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
                <CheckCircle2 className="h-3 w-3" />
                근거 확인됨
              </span>
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 p-4">
              <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300" />
              <p className="text-sm italic text-slate-600">{insight.sourceQuote}</p>
            </div>
            <p className="pt-2 text-xs text-slate-400">출처 필드: {insight.sourceField}</p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setRejectModalOpen(true)}
              disabled={regenerating}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
            >
              <RotateCw className={"h-3.5 w-3.5 " + (regenerating ? "animate-spin" : "")} />
              {regenerating ? "재분석 중..." : "분석 재요청"}
            </button>
            <button
              onClick={handleApplyProposal}
              disabled={applying}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-600 disabled:opacity-60"
            >
              {applying && <Sparkles className="h-3.5 w-3.5 animate-pulse" />}
              {applying ? "반영 중..." : "개선안 반영하기"}
            </button>
          </div>
        </main>
          ) : (
          <main className="flex w-full flex-col gap-6 px-7 py-10">
          <h1 className="text-xl font-bold text-slate-900">개선안 반영</h1>

          <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
            <div className="flex">
              <div className="flex w-full max-w-[420px] shrink-0 flex-col gap-5 border-r border-slate-100 p-6">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900">개선안</p>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">
                      {insight.confidence}
                    </span>
                  </div>
                  <p className="whitespace-pre-line pt-2 text-sm leading-relaxed text-slate-600">
                    {generatedProposal}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">CS 문의 근거</p>
                  <p className="text-xs leading-relaxed text-slate-500">{insight.csEvidence}</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">원문 근거</p>
                    <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600">
                      {insight.sourceField}
                    </span>
                  </div>
                  <div className="border-l-2 border-indigo-100 pl-3">
                    <p className="text-xs italic leading-relaxed text-slate-500">{insight.sourceQuote}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">유사 사례</p>
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                    <p className="text-xs leading-relaxed text-slate-600">{insight.similarCase}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col">
                <div className="border-b border-slate-100 px-6 py-4">
                  <p className="text-sm font-bold text-slate-900">상품 설명</p>
                </div>

                <div className="flex-1 p-6">
                  {savedDescription ? (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                      <p className="flex items-center gap-1.5 pb-2 text-xs font-bold text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        저장 완료
                      </p>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
                        {savedDescription}
                      </p>
                      <button
                        onClick={() => {
                          setDescription(savedDescription);
                          setSavedDescription(null);
                        }}
                        className="mt-3 flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-700"
                      >
                        <FileEdit className="h-3 w-3" />
                        다시 수정하기
                      </button>
                    </div>
                  ) : (
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="상품 설명을 직접 수정하세요..."
                      className="h-full min-h-[420px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 px-7 py-3.5">
              <button
                onClick={() => setStage("draft")}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                이전으로
              </button>
              {!savedDescription ? (
                <button
                  onClick={handleSaveDescription}
                  disabled={!description.trim()}
                  className="rounded-xl bg-indigo-500 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  상품 설명 저장하기
                </button>
              ) : (
                <button
                  onClick={() => setView("history")}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-600"
                >
                  개선안 히스토리로 가기
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </main>
          )
        ) : (
          <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-6 py-10">
          <h1 className="text-xl font-bold text-slate-900">개선안 히스토리</h1>

          <div className="flex flex-col gap-3">
            {history.map((h) => (
              <button
                key={h.id}
                onClick={() => setOpenId(h.id)}
                className="flex flex-col items-start gap-2 rounded-2xl border border-slate-100 bg-white p-6 text-left shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] hover:bg-slate-50"
              >
                <div className="flex w-full items-center justify-between">
                  <p className="text-sm font-bold text-slate-900">{h.product}</p>
                  {h.reverted && (
                    <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                      <RotateCcw className="h-3 w-3" />
                      되돌리기 완료
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-slate-600">{h.summary}</p>
                <p className="text-xs text-slate-400">{h.appliedAt}</p>
              </button>
            ))}
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

{openItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
          onClick={() => setOpenId(null)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <p className="text-lg font-bold text-slate-900">개선안 반영 내역</p>
                <p className="pt-1 text-xs text-slate-400">
                  {openItem.appliedAt} · {openItem.product}
                </p>
              </div>
              <button onClick={() => setOpenId(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-sm font-bold text-slate-900">적용된 개선안</p>
              <p className="whitespace-pre-line pt-2 text-sm leading-relaxed text-slate-600">
                {openItem.fullProposal}
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="pb-2 text-xs font-bold text-slate-500">수정 전</p>
                  <p className="whitespace-pre-line text-[13px] leading-relaxed text-slate-600">
                    {openItem.before}
                  </p>
                </div>
                <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                  <p className="pb-2 text-xs font-bold text-indigo-600">수정 후</p>
                  <p className="whitespace-pre-line text-[13px] leading-relaxed text-slate-700">
                    {openItem.after}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 p-6">
              <button
                onClick={() => setOpenId(null)}
                className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                닫기
              </button>
              {!openItem.reverted && (
                <button
                  onClick={() => handleRevert(openItem.id)}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-black"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  되돌리기
                </button>
              )}
              {openItem.reverted && (
                <span className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-6 py-3 text-sm font-bold text-slate-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  이미 되돌려짐
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <RejectReasonModal
        open={rejectModalOpen}
        product={insight.product}
        onClose={() => setRejectModalOpen(false)}
        onSubmit={handleSubmitRejection}
      />
    </div>
  );
}

const REJECT_REASONS = ["개선안 방향이 상품과 맞지 않음", "근거 데이터가 부족함", "이미 반영된 내용임"];

function RejectReasonModal({
  open,
  product,
  onClose,
  onSubmit,
}: {
  open: boolean;
  product: string;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [reason, setReason] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState("");

  if (!open) return null;

  const isCustom = reason === "직접 입력";
  const canSubmit = reason && (!isCustom || customReason.trim().length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs font-semibold text-slate-400">분석 재요청</p>
        <p className="pt-1 text-base font-bold text-slate-900">{product}</p>

        <p className="pb-2 pt-5 text-sm font-bold text-slate-700">반려 사유 선택</p>
        <div className="flex flex-col gap-2">
          {[...REJECT_REASONS, "직접 입력"].map((r) => (
            <button
              key={r}
              onClick={() => setReason(r)}
              className={
                "rounded-xl border px-4 py-3 text-left text-sm font-medium " +
                (reason === r
                  ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50")
              }
            >
              {r}
            </button>
          ))}
          {isCustom && (
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              rows={3}
              placeholder="반려 사유를 입력하고 재분석을 요청합니다"
              className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}
        </div>

        <div className="flex justify-end gap-2 pt-6">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            취소
          </button>
          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            재요청 접수
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={null}>
      <ReportPageContent />
    </Suspense>
  );
}
