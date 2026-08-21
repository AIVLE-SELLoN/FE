"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Sparkles, Paperclip } from "lucide-react";
import {
  getInquiryDetail,
  createInquiryAnswer,
  updateInquiryAnswer,
  deleteInquiryAnswer,
} from "@/app/api/cs";
import {
  INQUIRE_TYPE_LABEL,
  INQUIRY_STATUS_LABEL,
  formatDateTime,
  type CsInquiry,
} from "@/app/api/cs/types";
import { ApiError } from "@/app/api/client";

export default function AdminCsDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? "";
  const inquireKey = Number(id);

  const [inquiry, setInquiry] = useState<CsInquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [answerBody, setAnswerBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const loadDetail = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getInquiryDetail(inquireKey);
      setInquiry(data);
    } catch (e) {
      setLoadError(e instanceof ApiError ? e.message : "문의를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isFinite(inquireKey)) return;
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inquireKey]);

  const isAnswered = !!inquiry?.inquireAnswer;

  const handleSubmitAnswer = async () => {
    if (!answerBody.trim()) {
      setError("답변 내용을 입력해주세요.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const updated = await createInquiryAnswer(inquireKey, { inquireAnswer: answerBody });
      setInquiry(updated);
      setAnswerBody("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "답변 등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = () => {
    setAnswerBody(inquiry?.inquireAnswer ?? "");
    setError("");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setAnswerBody("");
    setError("");
  };

  const handleUpdateAnswer = async () => {
    if (!answerBody.trim()) {
      setError("답변 내용을 입력해주세요.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const updated = await updateInquiryAnswer(inquireKey, { inquireAnswer: answerBody });
      setInquiry(updated);
      setIsEditing(false);
      setAnswerBody("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "답변 수정에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnswer = async () => {
    if (!window.confirm("등록된 답변을 철회하시겠어요? 문의는 다시 답변 대기 상태로 돌아갑니다.")) return;
    setError("");
    setSubmitting(true);
    try {
      await deleteInquiryAnswer(inquireKey);
      setInquiry((prev) => (prev ? { ...prev, inquireAnswer: null, inquiryStatus: "WAITING" } : prev));
      setAnswerBody("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "답변 철회에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-slate-400">
        불러오는 중...
      </div>
    );
  }

  if (loadError || !inquiry) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white text-sm text-slate-400">
        <p>{loadError ?? "해당 문의를 찾을 수 없어요."}</p>
        <button onClick={() => router.push("/admin/cs")} className="text-indigo-500 hover:underline">
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex flex-1 flex-col bg-[#F8F8FC]">
        <header className="flex h-[52px] items-center gap-1.5 border-b border-slate-200 bg-white px-6 text-xs">
          <button onClick={() => router.push("/admin/cs")} className="text-slate-500 hover:text-slate-700">
            Admin
          </button>
          <span className="text-slate-300">{">"}</span>
          <button onClick={() => router.push("/admin/cs")} className="text-slate-500 hover:text-slate-700">
            CS 문의 관리
          </button>
          <span className="text-slate-300">{">"}</span>
          <span className="font-medium text-slate-900">문의 상세</span>
        </header>

        <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-8 py-12">
          <button
            onClick={() => router.push("/admin/cs")}
            className="flex w-fit items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            목록으로 돌아가기
          </button>

          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-slate-900">{inquiry.inquireTitle}</h1>
              <span
                className={
                  "shrink-0 rounded-full px-3 py-1 text-xs font-bold " +
                  (isAnswered ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-600")
                }
              >
                {INQUIRY_STATUS_LABEL[inquiry.inquiryStatus]}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <span className="flex items-center gap-2">
                <span className="font-medium text-slate-600">문의 유형:</span>
                <span className="text-slate-400">{INQUIRE_TYPE_LABEL[inquiry.inquireType]}</span>
              </span>
              <span className="h-3 w-px bg-slate-200" />
              <span className="flex items-center gap-2">
                <span className="font-medium text-slate-600">작성자:</span>
                <span className="text-slate-400">{inquiry.authorName}</span>
              </span>
              <span className="h-3 w-px bg-slate-200" />
              <span className="flex items-center gap-2">
                <span className="font-medium text-slate-600">등록일:</span>
                <span className="text-slate-400">{formatDateTime(inquiry.createdAt)}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-6 pt-2">
            <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
              <p className="text-[15px] font-bold text-slate-900">문의 내용</p>
              <p className="whitespace-pre-line pt-4 text-sm leading-relaxed text-slate-600">{inquiry.inquireContent}</p>
              {inquiry.attachmentUrl && (
                <a
                  href={inquiry.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 flex w-fit items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                >
                  <Paperclip className="h-3.5 w-3.5" />
                  첨부파일 보기
                </a>
              )}
            </div>

            {isAnswered && !isEditing ? (
              <div className="rounded-2xl border border-indigo-100 bg-[#F9F9FF] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6344D4]">
                      <Sparkles className="h-4 w-4 text-white" />
                    </span>
                    <p className="text-base font-bold text-indigo-600">SELLoN 답변</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={startEditing}
                      disabled={submitting}
                      className="text-xs font-semibold text-indigo-500 hover:underline disabled:opacity-50"
                    >
                      수정
                    </button>
                    <button
                      onClick={handleDeleteAnswer}
                      disabled={submitting}
                      className="text-xs font-semibold text-red-500 hover:underline disabled:opacity-50"
                    >
                      삭제
                    </button>
                  </div>
                </div>
                <p className="whitespace-pre-line pt-6 text-sm leading-relaxed text-slate-600">
                  {inquiry.inquireAnswer}
                </p>
                {error && <p className="pt-4 text-sm font-medium text-red-500">{error}</p>}
              </div>
            ) : (
              <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
                <p className="text-[15px] font-bold text-slate-900">{isEditing ? "답변 수정" : "답변 작성"}</p>
                <textarea
                  value={answerBody}
                  onChange={(e) => setAnswerBody(e.target.value)}
                  rows={6}
                  placeholder="답변 내용을 입력해주세요. 등록하면 바로 사용자에게 '답변 완료' 상태로 노출됩니다."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {error && <p className="text-sm font-medium text-red-500">{error}</p>}
                <div className="flex justify-end gap-2">
                  {isEditing && (
                    <button
                      onClick={cancelEditing}
                      disabled={submitting}
                      className="rounded-xl border border-slate-200 px-8 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                      취소
                    </button>
                  )}
                  <button
                    onClick={isEditing ? handleUpdateAnswer : handleSubmitAnswer}
                    disabled={submitting}
                    className="rounded-xl bg-indigo-500 px-8 py-3 text-sm font-bold text-white shadow-[0_10px_15px_-3px_rgba(99,68,212,0.2)] hover:bg-indigo-600 disabled:opacity-60"
                  >
                    {submitting ? "처리 중..." : isEditing ? "수정 완료" : "답변 등록"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
