"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import NotificationBell from "@/components/common/NotificationBell";
import {
  Bell,
  Search,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Sparkles,
  Loader2,
  Check,
  X as XIcon,
  Send,
  CheckCircle2,
  FileText,
  Upload,
} from "lucide-react";



type GuidelineStatus = "처리중" | "대기중" | "완료" | "확인전";

type GuidelineCandidate = {
  id: string; // ALT id, used as route param
  title: string;
  product: string;
  date: string;
  status: GuidelineStatus;
};

// 목데이터 — 실제로는 가이드라인 생성 대상 문의 목록 API에서 받아와야 해요.
const candidates: GuidelineCandidate[] = [
  {
    id: "ALT-20240720-0041",
    title: "[SELLON CS가이드] [ALT-20240720-0041] DS-UNI-2XL | 네이버 스마트스토어 - 색상 리스크 대응",
    product: "[위팬] 두산 베어스 서울 유니폼 2XL 2026",
    date: "2024-07-20",
    status: "처리중",
  },
  {
    id: "ALT-20240719-0038",
    title: "[SELLON CS가이드] [ALT-20240719-0038] DS-UNI-MG | 쿠팡 - 사이즈 리스크 대응",
    product: "[직영] 두산 베어스 망곰 유니폼",
    date: "2024-07-19",
    status: "처리중",
  },
  {
    id: "ALT-20240718-0035",
    title: "[SELLON CS가이드] [ALT-20240718-0035] VN-MUSE-B | 네이버 스마트스토어 - 색상 리스크 대응",
    product: "반스 X The Museum Visitor B",
    date: "2024-07-18",
    status: "대기중",
  },
  {
    id: "ALT-20240717-0032",
    title: "[SELLON CS가이드] [ALT-20240717-0032] SSG-CHAN-BK | 지그재그 - 색상 리스크 대응",
    product: "산산기어 Chan T-shirt 블랙",
    date: "2024-07-17",
    status: "완료",
  },
  {
    id: "ALT-20240716-0029",
    title: "[SELLON CS가이드] [ALT-20240716-0029] HM-GRTS | 쿠팡 - 색상 리스크 대응",
    product: "휴먼메이드 X 그래디 그래픽 티셔츠",
    date: "2024-07-16",
    status: "확인전",
  },
];



const STEPS = ["AI 답변 초안", "운영 MD 승인", "답변 발송", "처리 완료"];

type CsMessage = { id: string; time: string; body: string };

type CandidateDetail = {
  title: string;
  product: string;
  date: string;
  messages: CsMessage[];
};

// 목데이터 — 실제로는 params.id로 문의 상세 API를 호출해야 해요.
// "ALT-20240720-0041"에만 원본 디자인 그대로의 데이터가 있고, 나머지는 데모 데이터예요.
const detailsById: Record<string, CandidateDetail> = {
  "ALT-20240720-0041": {
    title: "[SELLON CS가이드] [ALT-20240720-0041] DS-UNI-2XL | 네이버 스마트스토어 - 색상 리스크 대응",
    product: "[위팬] 두산 베어스 서울 유니폼 2XL 2026",
    date: "2024-07-20",
    messages: [
      {
        id: "CS-20260520-000412",
        time: "2026-05-27 10:15",
        body: "화면에서 본 색상이랑 실물이 너무 달라요. 사진이 너무 밝게 보정된 것 같습니다.",
      },
      {
        id: "CS-20260520-000415",
        time: "2026-05-27 11:30",
        body: "네이비로 주문했는데 거의 블랙에 가까운 어두운 색이 왔네요. 확인 부탁드립니다.",
      },
    ],
  },
};

const fallbackDetail: CandidateDetail = {
  title: "CS 가이드라인 초안 생성",
  product: "-",
  date: "-",
  messages: [{ id: "-", time: "-", body: "해당 문의의 상세 데이터를 아직 불러오지 못했어요." }],
};



type GuidelineRow = {
  id: string;
  title: string;
  sku: string;
  period: string;
  createdAt: string;
  size: string;
  status: "최신" | "보관";
  statusHighlighted: boolean;
};

// 목데이터 — 실제로는 가이드라인 히스토리 API에서 받아와야 해요.
const guidelines: GuidelineRow[] = [
  {
    id: "g1",
    title: "[SELLON CS가이드] [ALT-20260701-0231] KN-OP-023 | 쿠팡 - 색상 리스크 대응",
    sku: "KN-OP-023-CR",
    period: "2026년 6월",
    createdAt: "2026.07.01",
    size: "2.3 MB",
    status: "최신",
    statusHighlighted: true,
  },
  {
    id: "g2",
    title: "[SELLON CS가이드] [ALT-20260701-0245] SL-WN-004 | 네이버 스마트스토어 - 사이즈 리스크 대응",
    sku: "SL-WN-004-NV",
    period: "2026년 6월",
    createdAt: "2026.07.01",
    size: "1.9 MB",
    status: "최신",
    statusHighlighted: false,
  },
  {
    id: "g3",
    title: "[SELLON CS가이드] [ALT-20260701-0258] TS-BC-001 | 지그재그 - 소재 리스크 대응",
    sku: "TS-BC-001-WT",
    period: "2026년 6월",
    createdAt: "2026.07.01",
    size: "1.6 MB",
    status: "최신",
    statusHighlighted: false,
  },
  {
    id: "g4",
    title: "[SELLON CS가이드] [ALT-20260601-0119] BL-SR-012 | 쿠팡 - 색상 리스크 대응",
    sku: "BL-SR-012-PK",
    period: "2026년 5월",
    createdAt: "2026.06.01",
    size: "2.0 MB",
    status: "보관",
    statusHighlighted: false,
  },
  {
    id: "g5",
    title: "[SELLON CS가이드] [ALT-20260601-0133] CD-OV-007 | 네이버 스마트스토어 - 사이즈 리스크 대응",
    sku: "CD-OV-007-BG",
    period: "2026년 5월",
    createdAt: "2026.06.01",
    size: "1.7 MB",
    status: "보관",
    statusHighlighted: false,
  },
];


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

  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      candidates.filter(
        (c) =>
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.product.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  const counts = useMemo(
    () => ({
      total: candidates.length,
      inProgress: candidates.filter((c) => c.status === "처리중").length,
      pending: candidates.filter((c) => c.status === "대기중").length,
      done: candidates.filter((c) => c.status === "완료").length,
    }),
    [],
  );

  const detail = detailsById[selectedGuidelineId ?? ""] ?? fallbackDetail;

  const [currentStep, setCurrentStep] = useState(1);
  const [generating, setGenerating] = useState(true);
  const [guideline, setGuideline] = useState("");
  const [approvalNote, setApprovalNote] = useState("");
  const [sending, setSending] = useState(false);

  const generateGuideline = () => {
    setGenerating(true);
    setGuideline("");
    // TODO: 백엔드 AI 가이드라인 생성 API 붙으면 이 부분을 실제 fetch 호출로 교체
    setTimeout(() => {
      setGuideline(
        `안녕하세요, 고객님. 문의 주신 색상 관련 불편을 드려 죄송합니다.\n\n` +
          `해당 상품(${detail.product})은 촬영 환경(조명)에 따라 실제 색상과 화면상 색상에 다소 차이가 있을 수 있습니다. ` +
          `현재 상세페이지 이미지의 색감 보정 정도를 재검토하고 있으며, 필요 시 원본에 가까운 사진으로 교체할 예정입니다.\n\n` +
          `받으신 상품의 색상이 명확히 잘못 배송된 경우라면 무상 교환/반품 도와드리겠습니다. 편하신 방법으로 회신 주시면 빠르게 처리하겠습니다.`,
      );
      setGenerating(false);
    }, 1400);
  };

  useEffect(() => {
    generateGuideline();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGuidelineId]);

  const handleRequestMdApproval = () => setCurrentStep(2);

  const handleApprove = () => setCurrentStep(3);

  const handleReject = () => {
    // 반려하면 사유가 다음 재생성에 반영되도록, 1단계로 돌아가서 다시 생성해요.
    setCurrentStep(1);
    generateGuideline();
    setApprovalNote("");
  };

  const handleSend = () => {
    setSending(true);
    // TODO: 백엔드 CS 솔루션 메일 발송 API 붙으면 이 부분을 실제 fetch 호출로 교체
    setTimeout(() => {
      setSending(false);
      setCurrentStep(4);
    }, 1000);
  };

  const [historyQuery, setHistoryQuery] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const filteredGuidelines = useMemo(
    () =>
      guidelines.filter(
        (g) =>
          g.title.toLowerCase().includes(historyQuery.toLowerCase()) ||
          g.sku.toLowerCase().includes(historyQuery.toLowerCase()),
      ),
    [historyQuery],
  );

  const allChecked = selected.length === filteredGuidelines.length && filteredGuidelines.length > 0;
  const toggleAll = () => setSelected(allChecked ? [] : filteredGuidelines.map((g) => g.id));
  const toggleOne = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className="flex min-h-screen bg-white">

      <div className="flex flex-1 flex-col bg-[#F7F7FA]">
        <header className="flex h-[52px] items-center gap-1.5 border-b border-slate-200 bg-white px-6 text-xs">
          <button
            onClick={() => {
              setTab("create");
              setSubView("list");
            }}
            className={tab === "create" ? "font-medium text-slate-900" : "text-slate-500 hover:text-slate-700"}
          >
            가이드라인 생성
          </button>
          <span className="text-slate-300">/</span>
          <button
            onClick={() => setTab("history")}
            className={tab === "history" ? "font-medium text-slate-900" : "text-slate-500 hover:text-slate-700"}
          >
            가이드라인 히스토리
          </button>
          <div className="ml-auto">
            <NotificationBell />
          </div>
        </header>

        {tab === "create" ? (
          subView === "list" ? (
            <main className="flex flex-col gap-6 p-5">
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-indigo-500 bg-white p-4 shadow-[0_0_0_1px_rgba(88,33,182,0.3)]">
              <p className="text-xs font-medium text-[#71717B]">전체</p>
              <p className="pt-1 text-2xl font-bold text-[#18181B]">{counts.total}</p>
            </div>
            <div className="rounded-2xl border border-[#E4E4E7] bg-white p-4">
              <p className="text-xs font-medium text-[#71717B]">처리중</p>
              <p className="pt-1 text-2xl font-bold text-[#18181B]">{counts.inProgress}</p>
            </div>
            <div className="rounded-2xl border border-[#E4E4E7] bg-white p-4">
              <p className="text-xs font-medium text-[#71717B]">대기중</p>
              <p className="pt-1 text-2xl font-bold text-[#18181B]">{counts.pending}</p>
            </div>
            <div className="rounded-2xl border border-[#E4E4E7] bg-white p-4">
              <p className="text-xs font-medium text-[#71717B]">완료</p>
              <p className="pt-1 text-2xl font-bold text-[#18181B]">{counts.done}</p>
            </div>
          </div>

          {/* List card */}
          <div className="overflow-hidden rounded-2xl border border-[#E4E4E7] bg-white shadow-[0_3px_7px_-2px_rgba(46,60,129,0.08)]">
            <div className="flex items-center justify-between border-b border-[#F4F4F5] px-5 py-4">
              <p className="text-sm font-bold text-[#18181B]">문의 사항</p>
              <div className="relative w-[224px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9F9FA9]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="제목, 고객명, 상품명 검색"
                  className="w-full rounded-[10px] border border-[#E4E4E7] bg-[#FAFAFA] py-1.5 pl-8 pr-3 text-xs text-[#18181B] placeholder:text-[#9F9FA9] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex bg-[#FAFAFA] px-5 py-2.5 text-xs font-medium text-[#71717B]">
              <span className="w-1/2">문의 제목</span>
              <span className="w-[30%]">상품</span>
              <span className="w-[20%]">접수일</span>
            </div>

            <div>
              {filtered.length === 0 && (
                <p className="px-5 py-10 text-center text-sm text-[#9F9FA9]">검색 결과가 없어요.</p>
              )}
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedGuidelineId(c.id);
                    setSubView("detail");
                  }}
                  className="flex w-full items-center gap-2 border-b border-[#F4F4F5] px-5 py-3.5 text-left last:border-b-0 hover:bg-slate-50"
                >
                  <div className="flex-1">
                    <p className="text-[13px] font-medium leading-tight text-[#3F3F47]">{c.title}</p>
                    <p className="pt-1.5 text-xs text-[#71717B]">{c.product}</p>
                    <p className="pt-1 text-xs text-[#9F9FA9]">{c.date}</p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#D4D4D8]" />
                </button>
              ))}
            </div>
          </div>
        </main>
          ) : (
            <main className="flex flex-col gap-5 p-5">
          <button
            onClick={() => setSubView("list")}
            className="flex w-fit items-center gap-1 text-xs font-medium text-[#71717B] hover:text-slate-700"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            문의 내역으로 돌아가기
          </button>

          {/* Header card with step tracker */}
          <div className="rounded-2xl border border-[#E4E4E7] bg-white p-5">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
              <div>
                <p className="text-xs text-[#9F9FA9]">{selectedGuidelineId}</p>
                <p className="max-w-[420px] pt-1 text-base font-bold text-[#18181B]">{detail.title}</p>
              </div>

              <div className="flex items-center">
                {STEPS.map((label, i) => {
                  const stepNum = i + 1;
                  const isActive = stepNum === currentStep;
                  const isDone = stepNum < currentStep;
                  return (
                    <div key={label} className="flex items-center">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={
                            "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold " +
                            (isActive
                              ? "bg-indigo-500 text-white shadow-[0_0_0_4px_rgba(88,33,182,0.2)]"
                              : isDone
                                ? "bg-indigo-500 text-white"
                                : "bg-slate-100 text-slate-400")
                          }
                        >
                          {isDone ? <Check className="h-3.5 w-3.5" /> : stepNum}
                        </span>
                        <span
                          className={
                            "text-[10px] font-medium " +
                            (isActive || isDone ? "text-indigo-500" : "text-slate-400")
                          }
                        >
                          {label}
                        </span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div
                          className={
                            "mb-4 h-0.5 w-16 px-1 " + (stepNum < currentStep ? "bg-indigo-500" : "bg-slate-200")
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-10 border-t border-[#F4F4F5] pt-3">
              <div>
                <p className="text-[10px] text-[#9F9FA9]">상품</p>
                <p className="pt-0.5 text-xs font-medium text-[#71717B]">{detail.product}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#9F9FA9]">접수일</p>
                <p className="pt-0.5 text-xs font-medium text-[#3F3F47]">{detail.date}</p>
              </div>
            </div>
          </div>

          {/* Two-column body */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[440px_1fr]">
            <div className="flex flex-col gap-3">
              <div className="rounded-2xl border border-[#E4E4E7] bg-white">
                <div className="flex items-center justify-between border-b border-[#F4F4F5] px-5 py-3.5">
                  <p className="text-sm font-bold text-[#18181B]">문의 리스트</p>
                  <p className="text-xs text-[#9F9FA9]">총 {detail.messages.length}건</p>
                </div>
                <div>
                  {detail.messages.map((m, i) => (
                    <div
                      key={m.id}
                      className={
                        "flex flex-col gap-1.5 px-5 py-4 " + (i > 0 ? "border-t border-[#F4F4F5]" : "")
                      }
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-bold text-[#18181B]">{m.id}</span>
                        <span className="text-xs text-[#9F9FA9]">{m.time}</span>
                      </div>
                      <p className="text-sm leading-relaxed text-[#3F3F47]">{m.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step-dependent action card */}
              {currentStep === 1 && (
                <div className="rounded-2xl border border-[#E4E4E7] bg-white">
                  <div className="border-b border-[#F4F4F5] px-5 py-3.5">
                    <p className="text-sm font-bold text-[#18181B]">다음 단계</p>
                  </div>
                  <div className="flex flex-col items-center gap-2 py-9">
                    <button
                      onClick={handleRequestMdApproval}
                      disabled={generating}
                      className="flex items-center gap-1.5 rounded-lg bg-indigo-500 px-4 py-2 text-[13px] font-bold text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      운영 MD 승인 요청
                    </button>
                    <p className="text-xs text-slate-400">AI 초안 검토 후 승인 요청을 보내주세요.</p>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="rounded-2xl border border-indigo-500 bg-white shadow-[0_0_0_3px_rgba(88,33,182,0.08)]">
                  <div className="flex items-center gap-2 border-b border-[#F4F4F5] px-5 py-3.5">
                    <ShieldCheck className="h-4 w-4 text-indigo-500" />
                    <p className="text-sm font-bold text-[#18181B]">운영 MD 승인</p>
                  </div>
                  <div className="flex flex-col gap-3 p-4">
                    <textarea
                      value={approvalNote}
                      onChange={(e) => setApprovalNote(e.target.value)}
                      placeholder="승인 메모 (선택)"
                      rows={3}
                      className="w-full resize-none rounded-[10px] border border-[#E4E4E7] bg-[#FAFAFA] p-3 text-xs text-[#18181B] placeholder:text-[#D4D4D8] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleReject}
                        className="flex items-center gap-1 rounded-[10px] border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
                      >
                        <XIcon className="h-3 w-3" />
                        반려
                      </button>
                      <button
                        onClick={handleApprove}
                        className="flex items-center gap-1 rounded-[10px] bg-indigo-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-600"
                      >
                        <Check className="h-3 w-3" />
                        승인
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="rounded-2xl border border-indigo-500 bg-white shadow-[0_0_0_3px_rgba(88,33,182,0.08)]">
                  <div className="flex items-center gap-2 border-b border-[#F4F4F5] px-5 py-3.5">
                    <Send className="h-4 w-4 text-indigo-500" />
                    <p className="text-sm font-bold text-[#18181B]">답변 발송</p>
                  </div>
                  <div className="flex flex-col gap-3 p-4">
                    <button
                      onClick={handleSend}
                      disabled={sending}
                      className="flex items-center justify-center gap-1.5 rounded-[10px] bg-indigo-500 py-2.5 text-xs font-bold text-white hover:bg-indigo-600 disabled:opacity-60"
                    >
                      {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      {sending ? "전송 중..." : "CS 가이드라인 메일 전송"}
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  <p className="text-sm font-bold text-emerald-700">처리 완료</p>
                  <p className="text-xs text-emerald-600">CS 솔루션 API로 답변이 전송되었습니다.</p>
                  <button
                    onClick={() => setSubView("list")}
                    className="mt-1 rounded-[10px] border border-emerald-300 px-4 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                  >
                    목록으로 돌아가기
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col rounded-2xl border border-[#E4E4E7] bg-white">
              <div className="flex items-center justify-between border-b border-[#F4F4F5] px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-indigo-500" />
                  <p className="text-sm font-bold text-[#18181B]">AI 가이드라인</p>
                </div>
                <button
                  onClick={generateGuideline}
                  disabled={generating || currentStep > 1}
                  className="flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/5 px-2.5 py-1 text-xs font-medium text-indigo-500 hover:bg-indigo-50 disabled:opacity-40"
                >
                  <Sparkles className="h-3 w-3" />
                  재생성
                </button>
              </div>
              <div className="flex flex-1 flex-col p-5">
                {generating ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                    <p className="text-sm text-slate-400">CS 문의를 분석해 답변 초안을 작성하고 있어요...</p>
                  </div>
                ) : (
                  <p className="whitespace-pre-line text-sm leading-relaxed text-[#3F3F47]">{guideline}</p>
                )}
              </div>
            </div>
          </div>
        </main>
          )
        ) : (
          <main className="flex flex-col gap-4 p-10">
          <div className="flex items-center justify-between pb-1">
            <h1 className="text-2xl font-bold text-slate-900">가이드라인 히스토리</h1>
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

          <div className="relative w-[320px]">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={historyQuery}
              onChange={(e) => setHistoryQuery(e.target.value)}
              placeholder="가이드명 또는 상품명으로 검색"
              className="w-full rounded-lg border border-slate-100 bg-slate-50 py-2.5 pl-10 pr-4 text-[13px] text-slate-700 placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="h-2 w-2 rounded-full bg-indigo-100" />
            <p className="text-[13px] font-semibold text-slate-500">
              최근 생성된 CS 가이드라인 · {filteredGuidelines.length}개
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
                <span>가이드명</span>
                <span>대상 기간</span>
                <span>생성일</span>
                <span>용량</span>
                <span>상태</span>
              </div>
            </div>

            <div>
              {filteredGuidelines.length === 0 && (
                <p className="px-6 py-10 text-center text-sm text-slate-400">검색 결과가 없습니다.</p>
              )}
              {filteredGuidelines.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center gap-4 border-b border-slate-100 px-6 py-4 last:border-b-0 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(g.id)}
                    onChange={() => toggleOne(g.id)}
                    className="h-5 w-5 rounded border-2 border-slate-300"
                  />
                  <div className="grid flex-1 grid-cols-[1fr_140px_120px_90px_80px] items-center">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-9 shrink-0 items-center justify-center rounded bg-indigo-50">
                        <FileText className="h-4 w-4 text-indigo-600" />
                      </span>
                      <div>
                        <p className="text-[15px] font-bold text-slate-900">{g.title}</p>
                        <p className="text-xs text-slate-400">{g.sku} · PDF 가이드 문서</p>
                      </div>
                    </div>
                    <span className="text-[13px] text-slate-600">{g.period}</span>
                    <span className="text-[13px] text-slate-500">{g.createdAt}</span>
                    <span className="text-[13px] font-medium text-slate-500">{g.size}</span>
                    <span>
                      <span
                        className={
                          "rounded-full px-2.5 py-1 text-[12px] font-bold " +
                          (g.statusHighlighted
                            ? "bg-indigo-50 text-indigo-600"
                            : "bg-slate-100 text-slate-500")
                        }
                      >
                        {g.status}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="pt-2 text-xs text-slate-400">
            CS 가이드라인은 생성일로부터 6개월간 자동 보관됩니다. 보관 기간 만료 시 자동 삭제됩니다.
          </p>
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

export default function CsAutomationPage() {
  return (
    <Suspense fallback={null}>
      <CsAutomationPageContent />
    </Suspense>
  );
}
