"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
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
import { useAuthStore } from "@/store/useAuthStore";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  getProposals,
  getProposalDetail,
  acceptProposal,
  rejectProposal,
  regenerateProposal,
  getAllAcceptHistory,
  rollbackAcceptHistory,
} from "@/app/api/report";
import {
  CONFIDENCE_LABEL,
  MAIN_ASPECT_LABEL,
  type ProposalDetailResponse,
  type ProposalAcceptHistory,
} from "@/app/api/report/types";
import { getProductDescription } from "@/app/api/channel/productDescription";
import { ApiError } from "@/app/api/client";

function formatDateTime(iso: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string | null) {
  if (!iso) return "-";
  return iso.slice(0, 10);
}

function ReportPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const { user } = useAuth();
  const processedBy = user?.email ?? "";

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 인사이트(개선안 상세) 관련 상태
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [detail, setDetail] = useState<ProposalDetailResponse | null>(null);
  const [currentDescription, setCurrentDescription] = useState<string | null>(null);
  const [noPending, setNoPending] = useState(false);

  const [description, setDescription] = useState("");
  const [savedDescription, setSavedDescription] = useState<string | null>(null);

  // 히스토리 상태
  const [history, setHistory] = useState<ProposalAcceptHistory[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  // 개선안(PENDING) 하나 불러오기 — reportKey 쿼리파라미터가 있으면 그걸, 없으면 목록에서 첫 PENDING 사용
  useEffect(() => {
    if (!hasHydrated) return;
    let ignore = false;

    async function loadDetail() {
      setLoadingDetail(true);
      setErrorMessage(null);
      try {
        const reportKeyParam = searchParams.get("reportKey");
        let targetReportKey: number | null = reportKeyParam ? Number(reportKeyParam) : null;

        if (!targetReportKey) {
          const proposals = await getProposals();
          const pending = proposals.find((p) => p.hitlStatus === "PENDING");
          if (!pending) {
            if (!ignore) {
              setNoPending(true);
              setDetail(null);
              setLoadingDetail(false);
            }
            return;
          }
          targetReportKey = pending.reportKey;
        }

        const d = await getProposalDetail(targetReportKey);
        if (ignore) return;
        setDetail(d);
        setNoPending(false);

        if (d.productGroupId && d.channel) {
          try {
            const pd = await getProductDescription(d.productGroupId, d.channel);
            if (!ignore) setCurrentDescription(pd.description);
          } catch {
            if (!ignore) setCurrentDescription(null);
          }
        }
      } catch (e) {
        if (!ignore) setErrorMessage(e instanceof ApiError ? e.message : "개선안을 불러오지 못했습니다.");
      } finally {
        if (!ignore) setLoadingDetail(false);
      }
    }

    if (view === "insight") loadDetail();

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, view]);

  // 히스토리 불러오기
  useEffect(() => {
    if (!hasHydrated || view !== "history") return;

    async function loadHistory() {
      try {
        const all = await getAllAcceptHistory();
        // 승인/수정승인 건만 "적용 내역"으로 보여줌 (반려 건은 되돌리기 대상이 아니라서 제외)
        setHistory(all.filter((h) => h.hitlStatus === "APPROVED" || h.hitlStatus === "EDITED_APPROVED"));
      } catch (e) {
        setErrorMessage(e instanceof ApiError ? e.message : "히스토리를 불러오지 못했습니다.");
      }
    }

    loadHistory();
  }, [hasHydrated, view]);

  const handleApplyProposal = () => {
    if (!detail) return;
    setApplying(true);
    setStage("review");
    setDescription(detail.proposedContent ?? "");
    setApplying(false);
  };

  const handleSubmitRejection = async (reasonCode: string, reasonText: string | null) => {
    if (!detail) return;
    setRejectModalOpen(false);
    setRegenerating(true);
    setErrorMessage(null);
    try {
      await regenerateProposal(detail.reportKey, { reasonCode, reasonText, processedBy });
      // 반려 처리된 개선안은 더 이상 대상이 아니므로 다음 대기 건을 다시 불러옴
      setDetail(null);
      setStage("draft");
      const proposals = await getProposals();
      const pending = proposals.find((p) => p.hitlStatus === "PENDING");
      if (pending) {
        const d = await getProposalDetail(pending.reportKey);
        setDetail(d);
        setNoPending(false);
      } else {
        setNoPending(true);
      }
    } catch (e) {
      setErrorMessage(e instanceof ApiError ? e.message : "분석 재요청에 실패했습니다.");
    } finally {
      setRegenerating(false);
    }
  };

  const handleSaveDescription = async () => {
    if (!detail) return;
    const trimmed = description.trim();
    const isEdited = trimmed.length > 0 && trimmed !== (detail.proposedContent ?? "").trim();
    setErrorMessage(null);
    try {
      await acceptProposal(detail.reportKey, {
        improvedContent: isEdited ? trimmed : null,
        processedBy,
      });
      setSavedDescription(trimmed || detail.proposedContent || "");
    } catch (e) {
      setErrorMessage(e instanceof ApiError ? e.message : "개선안 저장에 실패했습니다.");
    }
  };

  const openItem = history.find((h) => String(h.proposalAcceptHistoryKey) === openId) ?? null;

  const handleRevert = async (historyKey: number) => {
    setErrorMessage(null);
    try {
      await rollbackAcceptHistory(historyKey);
      setHistory((prev) =>
        prev.map((h) => (h.proposalAcceptHistoryKey === historyKey ? { ...h, rolledBack: true } : h))
      );
      setOpenId(null);
    } catch (e) {
      setErrorMessage(e instanceof ApiError ? e.message : "되돌리기에 실패했습니다.");
    }
  };

  if (!hasHydrated) return null;

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

        {errorMessage && (
          <div className="mx-6 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorMessage}
          </div>
        )}

        {view === "insight" ? (
          loadingDetail ? (
            <main className="mx-auto flex flex-1 w-full max-w-3xl flex-col gap-6 px-6 py-10">
              <p className="text-sm text-slate-400">불러오는 중...</p>
            </main>
          ) : noPending || !detail ? (
            <main className="mx-auto flex flex-1 w-full max-w-3xl flex-col gap-6 px-6 py-10">
              <h1 className="text-xl font-bold text-slate-900">AI 인사이트 리포트</h1>
              <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
                <p className="text-sm font-medium text-slate-500">처리할 개선안이 없습니다.</p>
                <button
                  onClick={() => setView("history")}
                  className="mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                  개선안 히스토리 보러가기
                </button>
              </div>
            </main>
          ) : stage === "draft" ? (
            <main className="mx-auto flex flex-1 w-full max-w-3xl flex-col gap-6 px-6 py-10">
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
                    <p className="pt-1 text-base font-bold text-slate-900">
                      {detail.productGroupId ?? "-"}
                      {detail.mainAspect && (
                        <span className="ml-2 text-xs font-medium text-slate-400">
                          ({MAIN_ASPECT_LABEL[detail.mainAspect]})
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-400">개선안 작성일</p>
                    <p className="pt-1 text-sm font-medium text-slate-500">{formatDate(detail.detectedAt)}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
                <p className="text-sm font-bold text-slate-900">CS 문의 근거</p>
                {detail.evidences.length > 0 ? (
                  <ul className="mt-2 flex flex-col gap-2">
                    {detail.evidences.map((ev) => (
                      <li key={ev.inquiryId} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                        {ev.quoteText}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="pt-2 text-sm text-slate-400">등록된 근거 문의가 없습니다.</p>
                )}
              </div>

              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  <p className="text-sm font-bold text-indigo-700">확신도</p>
                  {detail.confidenceLevel && (
                    <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-[11px] font-bold text-white">
                      {CONFIDENCE_LABEL[detail.confidenceLevel]}
                    </span>
                  )}
                </div>
                <p className="pt-2 text-sm leading-relaxed text-indigo-700">
                  {detail.confidenceDescription ?? detail.rationale ?? "-"}
                </p>
              </div>

              {detail.similarCase && (
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
                  <p className="text-sm font-bold text-slate-900">유사 사례</p>
                  <p className="pt-2 text-sm leading-relaxed text-slate-600">{detail.similarCase}</p>
                </div>
              )}

              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
                <p className="pb-3 text-sm font-bold text-slate-900">메모 (선택)</p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  placeholder="검토 메모를 남길 수 있어요 (저장되지는 않아요)"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {detail.currentText && (
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">근거 데이터 (상세페이지 인용)</p>
                    {detail.detailpageGrounded && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
                        <CheckCircle2 className="h-3 w-3" />
                        근거 확인됨
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 p-4">
                    <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300" />
                    <p className="text-sm italic text-slate-600">{detail.currentText}</p>
                  </div>
                  {detail.targetField && <p className="pt-2 text-xs text-slate-400">출처 필드: {detail.targetField}</p>}
                </div>
              )}

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
            <main className="flex flex-1 w-full flex-col gap-6 px-7 py-10">
              <h1 className="text-xl font-bold text-slate-900">개선안 반영</h1>

              <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
                <div className="flex">
                  <div className="flex w-full max-w-[420px] shrink-0 flex-col gap-5 border-r border-slate-100 p-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900">개선안</p>
                        {detail.confidenceLevel && (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">
                            {CONFIDENCE_LABEL[detail.confidenceLevel]}
                          </span>
                        )}
                      </div>
                      <p className="whitespace-pre-line pt-2 text-sm leading-relaxed text-slate-600">
                        {detail.proposedContent}
                      </p>
                    </div>

                    {detail.evidences.length > 0 && (
                      <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-4">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">CS 문의 근거</p>
                        <p className="text-xs leading-relaxed text-slate-500">{detail.evidences[0].quoteText}</p>
                      </div>
                    )}

                    {detail.currentText && (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">원문 근거</p>
                          {detail.targetField && (
                            <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600">
                              {detail.targetField}
                            </span>
                          )}
                        </div>
                        <div className="border-l-2 border-indigo-100 pl-3">
                          <p className="text-xs italic leading-relaxed text-slate-500">{detail.currentText}</p>
                        </div>
                      </div>
                    )}

                    {detail.similarCase && (
                      <div className="flex flex-col gap-1.5">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">유사 사례</p>
                        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                          <p className="text-xs leading-relaxed text-slate-600">{detail.similarCase}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col">
                    <div className="border-b border-slate-100 px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">상품 설명</p>
                    </div>

                    {currentDescription && (
                      <div className="mx-6 mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="pb-1.5 text-xs font-bold text-slate-500">현재 상품 설명</p>
                        <p className="whitespace-pre-line text-xs leading-relaxed text-slate-500">
                          {currentDescription}
                        </p>
                      </div>
                    )}

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
          <main className="mx-auto flex flex-1 w-full max-w-3xl flex-col gap-5 px-6 py-10">
            <h1 className="text-xl font-bold text-slate-900">개선안 히스토리</h1>

            {history.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
                <p className="text-sm font-medium text-slate-500">아직 적용된 개선안이 없습니다.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {history.map((h) => (
                  <button
                    key={h.proposalAcceptHistoryKey}
                    onClick={() => setOpenId(String(h.proposalAcceptHistoryKey))}
                    className="flex flex-col items-start gap-2 rounded-2xl border border-slate-100 bg-white p-6 text-left shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] hover:bg-slate-50"
                  >
                    <div className="flex w-full items-center justify-between">
                      <p className="text-sm font-bold text-slate-900">{h.productGroupId ?? "-"}</p>
                      {h.rolledBack && (
                        <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                          <RotateCcw className="h-3 w-3" />
                          되돌리기 완료
                        </span>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {h.improvedContent ?? h.appliedProposedContent}
                    </p>
                    <p className="text-xs text-slate-400">{formatDateTime(h.processedAt)}</p>
                  </button>
                ))}
              </div>
            )}
          </main>
        )}

        <div className="flex flex-col items-center gap-3 border-t border-[#E5E7EB] px-6 py-8 text-center">
          <div className="flex items-center gap-5">
            <Link href="/terms" className="text-[10px] text-[#99A1AF] hover:text-slate-500">
              서비스 이용약관
            </Link>
            <Link href="/privacy" className="text-[10px] text-[#99A1AF] hover:text-slate-500">
              개인정보처리방침
            </Link>
            <Link href="/cs?view=inquiry" className="text-[10px] text-[#99A1AF] hover:text-slate-500">
              고객센터
            </Link>
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
                  {formatDateTime(openItem.processedAt)} · {openItem.productGroupId ?? "-"}
                </p>
              </div>
              <button onClick={() => setOpenId(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-sm font-bold text-slate-900">적용된 개선안</p>
              <p className="whitespace-pre-line pt-2 text-sm leading-relaxed text-slate-600">
                {openItem.improvedContent ?? openItem.appliedProposedContent}
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="pb-2 text-xs font-bold text-slate-500">수정 전</p>
                  <p className="whitespace-pre-line text-[13px] leading-relaxed text-slate-600">
                    {openItem.improvedPrevContent ?? "-"}
                  </p>
                </div>
                <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                  <p className="pb-2 text-xs font-bold text-indigo-600">수정 후</p>
                  <p className="whitespace-pre-line text-[13px] leading-relaxed text-slate-700">
                    {openItem.improvedContent ?? openItem.appliedProposedContent}
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
              {!openItem.rolledBack && (
                <button
                  onClick={() => handleRevert(openItem.proposalAcceptHistoryKey)}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-black"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  되돌리기
                </button>
              )}
              {openItem.rolledBack && (
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
        product={detail?.productGroupId ?? ""}
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
  onSubmit: (reasonCode: string, reasonText: string | null) => void;
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
            onClick={() => reason && onSubmit(reason, isCustom ? customReason : null)}
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
