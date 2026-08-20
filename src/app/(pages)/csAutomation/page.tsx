"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import NotificationBell from "@/components/common/NotificationBell";
import {
  Search,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Loader2,
  Check,
  Send,
  FileText,
  Download,
  Mail,
} from "lucide-react";
import {
  getGuidelineFiles,
  downloadGuideline,
  getGuidelines,
  getGuidelineDetail,
  approveGuideline,
  sendGuidelineMail,
} from "@/app/api/csAutomation";
import type {
  GuidelineFileResponse,
  GuidelineListItemResponse,
  GuidelineDetailResponse,
} from "@/app/api/csAutomation/types";
import { ApiError } from "@/app/api/client";

// ── 이 페이지는 백엔드 실제 구조에 맞춰 다시 만들었어요 ──
// 가이드라인은 알림이 발생하면 외부 AI 서비스가 큐를 통해 "이미 완성된 PDF"로 보내주는 구조예요.
// 그래서 화면에서 AI 초안을 생성하거나(모델 호출), 문의 리스트를 따로 불러오는 API는 없고,
// 사람이 하는 건 (1) 상세에서 PDF를 확인하고 (2) 필요하면 코멘트와 함께 승인하고
// (3) CS 담당자에게 메일로 보내는 것뿐이에요. 기존의 "AI 답변 초안 → MD 승인 → 발송 → 완료"
// 4단계 마법사와 문의 리스트 패널은 대응하는 API가 없어서 걷어내고, 실제 3개 API
// (GET /guidelines, GET /guidelines/{id}, POST /guidelines/{id}/approval, POST /guidelines/{id}/mail)로
// 다시 짰어요.

function formatBytes(bytes: number | null) {
  if (bytes == null) return "-";
  const mb = bytes / (1024 * 1024);
  return mb >= 0.1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

function formatDate(iso: string | null) {
  if (!iso) return "-";
  // "2026-07-01T09:00:00" -> "2026.07.01"
  return iso.slice(0, 10).replace(/-/g, ".");
}

function formatDateTime(iso: string | null) {
  if (!iso) return "-";
  // "2026-07-01T09:00:00" -> "2026.07.01 09:00"
  return `${iso.slice(0, 10).replace(/-/g, ".")} ${iso.slice(11, 16)}`;
}

function availabilityBadge(status: "COMPLETED" | "EXPIRED") {
  return status === "COMPLETED"
    ? "bg-indigo-50 text-indigo-600"
    : "bg-amber-50 text-amber-600";
}

function CsAutomationPageContent() {
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<"create" | "history">(
    searchParams.get("tab") === "history" ? "history" : "create",
  );

  useEffect(() => {
    setTab(searchParams.get("tab") === "history" ? "history" : "create");
  }, [searchParams]);

  const [subView, setSubView] = useState<"list" | "detail">("list");
  const [selectedGuidelineId, setSelectedGuidelineId] = useState<string | null>(null);

  // ---- 가이드라인 목록 (실제 연결) ----
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<GuidelineListItemResponse[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [listCursor, setListCursor] = useState<string | null>(null);
  const [listHasNext, setListHasNext] = useState(false);
  const [listLoadingMore, setListLoadingMore] = useState(false);

  useEffect(() => {
    if (tab !== "create" || subView !== "list") return;

    let ignore = false;
    setListLoading(true);
    setListError(null);

    getGuidelines({ q: query || undefined, size: 20 })
      .then((res) => {
        if (ignore) return;
        setItems(res.content);
        setListCursor(res.nextCursor);
        setListHasNext(res.hasNext);
      })
      .catch((e) => {
        if (ignore) return;
        setListError(e instanceof ApiError ? e.message : "가이드라인 목록을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!ignore) setListLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [tab, subView, query]);

  const handleListLoadMore = async () => {
    if (!listCursor) return;
    setListLoadingMore(true);
    try {
      const res = await getGuidelines({ cursor: listCursor, q: query || undefined, size: 20 });
      setItems((prev) => [...prev, ...res.content]);
      setListCursor(res.nextCursor);
      setListHasNext(res.hasNext);
    } catch (e) {
      setListError(e instanceof ApiError ? e.message : "목록을 더 불러오지 못했습니다.");
    } finally {
      setListLoadingMore(false);
    }
  };

  // ---- 가이드라인 상세 (실제 연결) ----
  const [detail, setDetail] = useState<GuidelineDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [comment, setComment] = useState("");
  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);

  useEffect(() => {
    if (!selectedGuidelineId || subView !== "detail") return;

    let ignore = false;
    setDetailLoading(true);
    setDetailError(null);
    setSendError(null);
    setSendSuccess(false);

    getGuidelineDetail(selectedGuidelineId)
      .then((res) => {
        if (ignore) return;
        setDetail(res);
        setComment(res.comment ?? "");
      })
      .catch((e) => {
        if (ignore) return;
        setDetailError(e instanceof ApiError ? e.message : "가이드라인 상세를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!ignore) setDetailLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [selectedGuidelineId, subView]);

  const handleApprove = async () => {
    if (!selectedGuidelineId) return;
    setApproving(true);
    setApproveError(null);
    try {
      await approveGuideline(selectedGuidelineId, comment || undefined);
      setDetail((prev) => (prev ? { ...prev, approved: true, comment: comment || null } : prev));
    } catch (e) {
      setApproveError(e instanceof ApiError ? e.message : "승인에 실패했습니다.");
    } finally {
      setApproving(false);
    }
  };

  const handleSendMail = async () => {
    if (!selectedGuidelineId) return;
    setSending(true);
    setSendError(null);
    setSendSuccess(false);
    try {
      await sendGuidelineMail(selectedGuidelineId);
      setSendSuccess(true);
    } catch (e) {
      setSendError(e instanceof ApiError ? e.message : "메일 발송에 실패했습니다.");
    } finally {
      setSending(false);
    }
  };

  // ---- 가이드라인 히스토리 (실제 연결) ----
  const [historyQuery, setHistoryQuery] = useState("");
  const [files, setFiles] = useState<GuidelineFileResponse[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [filesError, setFilesError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (tab !== "history") return;

    let ignore = false;
    setFilesLoading(true);
    setFilesError(null);

    getGuidelineFiles({ q: historyQuery || undefined, size: 20 })
      .then((res) => {
        if (ignore) return;
        setFiles(res.content);
        setCursor(res.nextCursor);
        setHasNext(res.hasNext);
      })
      .catch((error) => {
        if (ignore) return;
        setFilesError(error instanceof Error ? error.message : "가이드라인 목록을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!ignore) setFilesLoading(false);
      });

    return () => {
      ignore = true;
    };
    // historyQuery가 바뀌면 처음부터 다시 조회 (디바운스 없이 바로 검색)
  }, [tab, historyQuery]);

  const handleLoadMore = async () => {
    if (!cursor) return;
    setLoadingMore(true);
    try {
      const res = await getGuidelineFiles({ cursor, q: historyQuery || undefined, size: 20 });
      setFiles((prev) => [...prev, ...res.content]);
      setCursor(res.nextCursor);
      setHasNext(res.hasNext);
    } catch (error) {
      setFilesError(error instanceof Error ? error.message : "목록을 더 불러오지 못했습니다.");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleDownload = async (guidelineId: string) => {
    setDownloadingId(guidelineId);
    try {
      const res = await downloadGuideline(guidelineId);
      window.open(res.downloadUrl, "_blank");
    } catch (error) {
      setFilesError(error instanceof Error ? error.message : "다운로드에 실패했습니다.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex flex-1 flex-col bg-[#F7F7FA]">
        <header className="flex h-[52px] items-center gap-1.5 border-b border-slate-200 bg-white px-6 text-xs">
          <button
            onClick={() => {
              setTab("create");
              setSubView("list");
            }}
            className="text-slate-500 hover:text-slate-700"
          >
            가이드라인 리포트
          </button>
          <span className="text-slate-300">{">"}</span>
          <span className="font-medium text-slate-900">
            {tab === "history" ? "가이드라인 히스토리" : "가이드라인 목록"}
          </span>
          <div className="ml-auto">
            <NotificationBell />
          </div>
        </header>

        {tab === "create" ? (
          subView === "list" ? (
            <main className="flex flex-col gap-4 p-5">
              {/* List card */}
              <div className="overflow-hidden rounded-2xl border border-[#E4E4E7] bg-white shadow-[0_3px_7px_-2px_rgba(46,60,129,0.08)]">
                <div className="flex items-center justify-between border-b border-[#F4F4F5] px-5 py-4">
                  <div>
                    <p className="text-sm font-bold text-[#18181B]">발생한 가이드라인</p>
                    <p className="pt-0.5 text-xs text-[#9F9FA9]">
                      이상 이벤트가 감지되면 자동으로 생성돼요 · 총 {items.length}건{listHasNext ? "+" : ""}
                    </p>
                  </div>
                  <div className="relative w-[224px]">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9F9FA9]" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="제목, 상품명 검색"
                      className="w-full rounded-[10px] border border-[#E4E4E7] bg-[#FAFAFA] py-1.5 pl-8 pr-3 text-xs text-[#18181B] placeholder:text-[#9F9FA9] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex bg-[#FAFAFA] px-5 py-2.5 text-xs font-medium text-[#71717B]">
                  <span className="w-1/2">가이드라인 제목</span>
                  <span className="w-[25%]">상품</span>
                  <span className="w-[15%]">감지일</span>
                  <span className="w-[10%]">상태</span>
                </div>

                <div>
                  {listLoading && (
                    <p className="px-5 py-10 text-center text-sm text-[#9F9FA9]">불러오는 중...</p>
                  )}
                  {!listLoading && listError && (
                    <p className="px-5 py-10 text-center text-sm text-red-500">{listError}</p>
                  )}
                  {!listLoading && !listError && items.length === 0 && (
                    <p className="px-5 py-10 text-center text-sm text-[#9F9FA9]">아직 생성된 가이드라인이 없어요.</p>
                  )}
                  {!listLoading &&
                    !listError &&
                    items.map((c) => (
                      <button
                        key={c.guidelineId}
                        onClick={() => {
                          setSelectedGuidelineId(c.guidelineId);
                          setSubView("detail");
                        }}
                        className="flex w-full items-center gap-2 border-b border-[#F4F4F5] px-5 py-3.5 text-left last:border-b-0 hover:bg-slate-50"
                      >
                        <div className="w-1/2 pr-2">
                          <p className="text-[13px] font-medium leading-tight text-[#3F3F47]">{c.title}</p>
                          <p className="pt-1 text-xs text-[#9F9FA9]">{c.guidelineId}</p>
                        </div>
                        <span className="w-[25%] truncate pr-2 text-xs text-[#71717B]">
                          {c.productName ?? "-"}
                        </span>
                        <span className="w-[15%] text-xs text-[#9F9FA9]">{formatDate(c.detectedAt)}</span>
                        <span className="w-[10%]">
                          <span
                            className={`rounded-full px-2 py-1 text-[11px] font-bold ${availabilityBadge(c.status)}`}
                          >
                            {c.status === "COMPLETED" ? "확인 가능" : "재생성 필요"}
                          </span>
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#D4D4D8]" />
                      </button>
                    ))}
                </div>

                {listHasNext && (
                  <div className="flex justify-center border-t border-slate-100 py-4">
                    <button
                      onClick={handleListLoadMore}
                      disabled={listLoadingMore}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                      {listLoadingMore ? "불러오는 중..." : "더 보기"}
                    </button>
                  </div>
                )}
              </div>
            </main>
          ) : (
            <main className="flex flex-col gap-5 p-5">
              <button
                onClick={() => setSubView("list")}
                className="flex w-fit items-center gap-1 text-xs font-medium text-[#71717B] hover:text-slate-700"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                목록으로 돌아가기
              </button>

              {detailLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#E4E4E7] bg-white py-20">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                  <p className="text-sm text-slate-400">불러오는 중...</p>
                </div>
              ) : detailError || !detail ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
                  {detailError ?? "가이드라인을 찾을 수 없습니다."}
                </div>
              ) : (
                <>
                  {/* Header card */}
                  <div className="rounded-2xl border border-[#E4E4E7] bg-white p-5">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div>
                        <p className="text-xs text-[#9F9FA9]">{detail.guidelineId}</p>
                        <p className="max-w-[520px] pt-1 text-base font-bold text-[#18181B]">{detail.title}</p>
                      </div>
                      <span
                        className={`w-fit rounded-full px-2.5 py-1 text-xs font-bold ${availabilityBadge(detail.status)}`}
                      >
                        {detail.status === "COMPLETED" ? "확인 가능" : "재생성 필요"}
                      </span>
                    </div>

                    <div className="mt-3 flex gap-10 border-t border-[#F4F4F5] pt-3">
                      <div>
                        <p className="text-[10px] text-[#9F9FA9]">상품</p>
                        <p className="pt-0.5 text-xs font-medium text-[#71717B]">{detail.productName ?? "-"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#9F9FA9]">감지일</p>
                        <p className="pt-0.5 text-xs font-medium text-[#3F3F47]">
                          {formatDateTime(detail.detectedAt)}
                        </p>
                      </div>
                      {detail.approved && (
                        <div>
                          <p className="text-[10px] text-[#9F9FA9]">승인 상태</p>
                          <p className="flex items-center gap-1 pt-0.5 text-xs font-bold text-indigo-500">
                            <Check className="h-3 w-3" />
                            승인됨
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
                    {/* PDF inline viewer */}
                    <div className="flex flex-col overflow-hidden rounded-2xl border border-[#E4E4E7] bg-white">
                      <div className="flex items-center gap-2 border-b border-[#F4F4F5] px-5 py-3.5">
                        <FileText className="h-4 w-4 text-indigo-500" />
                        <p className="text-sm font-bold text-[#18181B]">CS 가이드라인 PDF</p>
                      </div>
                      {detail.downloadUrl ? (
                        <iframe
                          src={detail.downloadUrl}
                          title="CS 가이드라인 PDF"
                          className="h-[600px] w-full"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 py-16 text-center">
                          <p className="text-sm text-slate-400">
                            보관 기한(7일)이 지나 파일을 다시 만들어야 해요.
                          </p>
                          <p className="text-xs text-slate-400">히스토리 탭에서 다운로드하면 자동으로 재생성돼요.</p>
                        </div>
                      )}
                    </div>

                    {/* Approval + mail actions */}
                    <div className="flex flex-col gap-3">
                      <div className="rounded-2xl border border-[#E4E4E7] bg-white">
                        <div className="flex items-center gap-2 border-b border-[#F4F4F5] px-5 py-3.5">
                          <ShieldCheck className="h-4 w-4 text-indigo-500" />
                          <p className="text-sm font-bold text-[#18181B]">
                            운영 MD 승인{detail.approved ? " (재승인)" : ""}
                          </p>
                        </div>
                        <div className="flex flex-col gap-3 p-4">
                          <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="승인 코멘트 (선택)"
                            rows={3}
                            className="w-full resize-none rounded-[10px] border border-[#E4E4E7] bg-[#FAFAFA] p-3 text-xs text-[#18181B] placeholder:text-[#D4D4D8] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          {approveError && <p className="text-xs text-red-500">{approveError}</p>}
                          <button
                            onClick={handleApprove}
                            disabled={approving}
                            className="flex items-center justify-center gap-1.5 rounded-[10px] bg-indigo-500 py-2.5 text-xs font-bold text-white hover:bg-indigo-600 disabled:opacity-60"
                          >
                            {approving ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                            {approving ? "처리 중..." : detail.approved ? "코멘트 재승인" : "승인"}
                          </button>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[#E4E4E7] bg-white">
                        <div className="flex items-center gap-2 border-b border-[#F4F4F5] px-5 py-3.5">
                          <Mail className="h-4 w-4 text-indigo-500" />
                          <p className="text-sm font-bold text-[#18181B]">CS 담당자 메일 발송</p>
                        </div>
                        <div className="flex flex-col gap-2 p-4">
                          {sendError && <p className="text-xs text-red-500">{sendError}</p>}
                          {sendSuccess && (
                            <p className="text-xs font-medium text-emerald-600">메일을 발송했어요.</p>
                          )}
                          <button
                            onClick={handleSendMail}
                            disabled={sending}
                            className="flex items-center justify-center gap-1.5 rounded-[10px] border border-indigo-200 py-2.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 disabled:opacity-60"
                          >
                            {sending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Send className="h-3.5 w-3.5" />
                            )}
                            {sending ? "발송 중..." : "메일 발송"}
                          </button>
                          <p className="text-[11px] text-slate-400">
                            마이페이지에 등록된 CS 담당자 전원에게 PDF 링크가 발송돼요.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </main>
          )
        ) : (
          <main className="flex flex-col gap-4 p-10">
            <div className="flex items-center justify-between pb-1">
              <h1 className="text-2xl font-bold text-slate-900">가이드라인 히스토리</h1>
            </div>

            <div className="relative w-[320px]">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                value={historyQuery}
                onChange={(e) => setHistoryQuery(e.target.value)}
                placeholder="파일명으로 검색"
                className="w-full rounded-lg border border-slate-100 bg-slate-50 py-2.5 pl-10 pr-4 text-[13px] text-slate-700 placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="h-2 w-2 rounded-full bg-indigo-100" />
              <p className="text-[13px] font-semibold text-slate-500">
                최근 생성된 CS 가이드라인 · {files.length}개{hasNext ? "+" : ""}
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.07)]">
              <div className="flex items-center gap-4 border-b border-slate-100 bg-slate-50 px-6 py-3">
                <div className="grid flex-1 grid-cols-[1fr_120px_90px_110px_100px] text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  <span>파일명</span>
                  <span>생성일</span>
                  <span>용량</span>
                  <span>상태</span>
                  <span>다운로드</span>
                </div>
              </div>

              <div>
                {filesLoading && (
                  <p className="px-6 py-10 text-center text-sm text-slate-400">불러오는 중...</p>
                )}
                {!filesLoading && filesError && (
                  <p className="px-6 py-10 text-center text-sm text-red-500">{filesError}</p>
                )}
                {!filesLoading && !filesError && files.length === 0 && (
                  <p className="px-6 py-10 text-center text-sm text-slate-400">검색 결과가 없습니다.</p>
                )}
                {!filesLoading &&
                  !filesError &&
                  files.map((f) => (
                    <div
                      key={f.guidelineId}
                      className="flex items-center gap-4 border-b border-slate-100 px-6 py-4 last:border-b-0 hover:bg-slate-50"
                    >
                      <div className="grid flex-1 grid-cols-[1fr_120px_90px_110px_100px] items-center">
                        <div className="flex items-center gap-3">
                          <span className="flex h-11 w-9 shrink-0 items-center justify-center rounded bg-indigo-50">
                            <FileText className="h-4 w-4 text-indigo-600" />
                          </span>
                          <div>
                            <p className="text-[15px] font-bold text-slate-900">{f.originalFileName}</p>
                            <p className="text-xs text-slate-400">{f.guidelineId} · PDF 가이드 문서</p>
                          </div>
                        </div>
                        <span className="text-[13px] text-slate-500">{formatDate(f.createdAt)}</span>
                        <span className="text-[13px] font-medium text-slate-500">{formatBytes(f.fileSizeBytes)}</span>
                        <span>
                          <span className={`rounded-full px-2.5 py-1 text-[12px] font-bold ${availabilityBadge(f.status)}`}>
                            {f.status === "COMPLETED" ? "다운로드 가능" : "재생성 필요"}
                          </span>
                        </span>
                        <button
                          onClick={() => handleDownload(f.guidelineId)}
                          disabled={downloadingId === f.guidelineId}
                          className="flex w-fit items-center gap-1.5 rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {downloadingId === f.guidelineId ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Download className="h-3 w-3" />
                          )}
                          {downloadingId === f.guidelineId ? "처리 중" : "다운로드"}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {hasNext && (
                <div className="flex justify-center border-t border-slate-100 py-4">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {loadingMore ? "불러오는 중..." : "더 보기"}
                  </button>
                </div>
              )}
            </div>

            <p className="pt-2 text-xs text-slate-400">
              CS 가이드라인은 생성일로부터 7일간 S3에 보관됩니다. 만료된 파일은 다운로드 시 자동으로 다시 생성돼요.
            </p>
          </main>
        )}

        <div className="flex flex-col items-center gap-3 border-t border-[#E5E7EB] bg-white px-6 py-8 text-center">
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
    </div>
  );
}

export default function CsAutomationPage() {
  return (
    <Suspense fallback={null}>
      <CsAutomationPageContent />
    </Suspense>
  );
}
