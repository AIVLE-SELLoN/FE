"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Sparkles } from "lucide-react";
import { adminInquiries } from "../page";
import { getAnswer, saveAnswer, type StoredAnswer } from "@/lib/inquiryAnswers";

type InquiryDetail = {
  title: string;
  type: string;
  date: string;
  author: string;
  content: string;
};

// 목데이터 — 실제로는 문의 상세 API에서 params.id로 받아와야 해요.
const inquiryDetails: Record<string, InquiryDetail> = {
  "124": {
    title: "A1-1 채널 연결 실패 관련 문의",
    type: "확장 오류",
    date: "2026.07.12",
    author: "홍길동",
    content:
      "지그재그 채널 연결 시 계속 인증 오류가 발생합니다. API 키를 재발급받아 다시 입력해봐도 동일한 오류[A1-1]가 표시되는데, 어떻게 해결해야 할까요?",
  },
  "123": {
    title: "상품 매핑 오류 문의",
    type: "상품관리",
    date: "2026.03.12",
    author: "김민지",
    content: "네이버 스마트스토어 상품 옵션 매핑이 누락되었습니다. 확인 부탁드립니다.",
  },
  "122": {
    title: "계정 연동 지연 현상 문의",
    type: "시스템",
    date: "2026.03.10",
    author: "박서준",
    content: "로그인 시 응답 시간이 평소보다 오래 걸립니다. 원인을 알 수 있을까요?",
  },
  "121": {
    title: "정산 내역 확인 요청",
    type: "정산/결제",
    date: "2026.03.05",
    author: "이수아",
    content: "지난달 정산 리포트 데이터 수정 요청드립니다.",
  },
  "120": {
    title: "서비스 이용 방법 문의",
    type: "기타",
    date: "2026.03.01",
    author: "정하늘",
    content: "대시보드 위젯 커스텀 기능이 있는지 궁금합니다.",
  },
};

// 124번은 원래부터 답변이 등록돼있던 데모용 초기값이에요.
// localStorage에 아직 아무 기록이 없을 때만 이 값을 기본으로 써요.
const seedAnswers: Record<string, StoredAnswer> = {
  "124": {
    date: "2026.07.13 11:30",
    body: [
      "안녕하세요, 문의 주신 내용 확인했습니다.",
      "지그재그 채널의 API 키는 발급 후 반영까지 최대 10분이 소요될 수 있어요. 재발급 후 10분 이상 지났는데도 동일한 오류가 발생한다면, API 키 앞뒤에 공백이 포함되지 않았는지 확인 후 다시 입력해 주세요.",
      "그래도 해결되지 않으면 회신 남겨주시면 직접 확인해드리겠습니다.",
    ],
  },
};

export default function AdminCsDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? "";

  const detail = inquiryDetails[id];
  const listItem = adminInquiries.find((i) => i.id === id);

  const [answerBody, setAnswerBody] = useState("");
  const [submittedAnswer, setSubmittedAnswer] = useState<StoredAnswer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // localStorage에 저장된 답변을 우선 읽고, 없으면 데모 초기값(124번)을 사용해요.
  useEffect(() => {
    const stored = getAnswer(id);
    setSubmittedAnswer(stored ?? seedAnswers[id] ?? null);
  }, [id]);

  const status: "처리중" | "완료" = submittedAnswer ? "완료" : "처리중";

  const handleSubmitAnswer = async () => {
    if (!answerBody.trim()) {
      setError("답변 내용을 입력해주세요.");
      return;
    }
    setError("");
    setSubmitting(true);
    // TODO: 실제로는 POST /inquiries/{key}/answer 호출 — 성공 시 백엔드가 상태를 CLEARED로 전환.
    // 지금은 프론트에서 localStorage에 저장하는 걸로 흉내만 냄 (중간 상태 없이 바로 완료 처리).
    await new Promise((res) => setTimeout(res, 500));
    const answer: StoredAnswer = {
      date: new Date().toISOString().slice(0, 16).replace("T", " "),
      body: answerBody.split("\n").filter((line) => line.trim().length > 0),
    };
    saveAnswer(id, answer);
    setSubmittedAnswer(answer);
    setSubmitting(false);
  };

  if (!detail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-slate-400">
        해당 문의를 찾을 수 없어요.
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
              <h1 className="text-2xl font-bold text-slate-900">{detail.title}</h1>
              <span
                className={
                  "shrink-0 rounded-full px-3 py-1 text-xs font-bold " +
                  (status === "완료" ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-600")
                }
              >
                {status === "완료" ? "답변 완료" : "답변 대기"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <span className="flex items-center gap-2">
                <span className="font-medium text-slate-600">문의 유형:</span>
                <span className="text-slate-400">{detail.type}</span>
              </span>
              <span className="h-3 w-px bg-slate-200" />
              <span className="flex items-center gap-2">
                <span className="font-medium text-slate-600">작성일:</span>
                <span className="text-slate-400">{detail.date}</span>
              </span>
              <span className="h-3 w-px bg-slate-200" />
              <span className="flex items-center gap-2">
                <span className="font-medium text-slate-600">작성자:</span>
                <span className="text-slate-400">{detail.author}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-6 pt-2">
            <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
              <p className="text-[15px] font-bold text-slate-900">문의 내용</p>
              <p className="pt-4 text-sm leading-relaxed text-slate-600">{detail.content}</p>
            </div>

            {submittedAnswer ? (
              <div className="rounded-2xl border border-indigo-100 bg-[#F9F9FF] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6344D4]">
                      <Sparkles className="h-4 w-4 text-white" />
                    </span>
                    <p className="text-base font-bold text-indigo-600">SELLoN 답변</p>
                  </div>
                  <p className="text-xs text-slate-400">{submittedAnswer.date}</p>
                </div>
                <div className="flex flex-col gap-4 pt-6">
                  {submittedAnswer.body.map((p, i) => (
                    <p key={i} className="text-sm leading-relaxed text-slate-600">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
                <p className="text-[15px] font-bold text-slate-900">답변 작성</p>
                <textarea
                  value={answerBody}
                  onChange={(e) => setAnswerBody(e.target.value)}
                  rows={6}
                  placeholder="답변 내용을 입력해주세요. 등록하면 바로 사용자에게 '완료' 상태로 노출됩니다."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {error && <p className="text-sm font-medium text-red-500">{error}</p>}
                <div className="flex justify-end">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={submitting}
                    className="rounded-xl bg-indigo-500 px-8 py-3 text-sm font-bold text-white shadow-[0_10px_15px_-3px_rgba(99,68,212,0.2)] hover:bg-indigo-600 disabled:opacity-60"
                  >
                    {submitting ? "등록 중..." : "답변 등록"}
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
