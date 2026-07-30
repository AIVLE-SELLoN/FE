"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useEffect} from "react"; 
import NotificationBell from "@/components/common/NotificationBell";
import {
  Bell,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  LifeBuoy,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  X,
  ChevronDown,
} from "lucide-react";



type Category = "채널연동" | "상품관리" | "시스템" | "정산/결제" | "기타";
type Status = "처리중" | "완료";

type Inquiry = {
  id: string;
  no: number;
  category: Category;
  title: string;
  preview: string;
  date: string;
  status: Status;
};

const INQUIRY_CATEGORY_STYLE: Record<Category, { bg: string; text: string }> = {
  채널연동: { bg: "bg-blue-50", text: "text-blue-600" },
  상품관리: { bg: "bg-emerald-50", text: "text-emerald-600" },
  시스템: { bg: "bg-purple-50", text: "text-purple-600" },
  "정산/결제": { bg: "bg-yellow-50", text: "text-amber-600" },
  기타: { bg: "bg-slate-100", text: "text-slate-600" },
};

// 목데이터 — 실제로는 문의 내역 API에서 받아와야 해요.
const inquiries: Inquiry[] = [
  { id: "124", no: 124, category: "채널연동", title: "A1-1 채널 연결 실패 관련 문의", preview: "API 인증 오류가 지속적으로 발생하고 있습니다.", date: "2026.03.15", status: "처리중" },
  { id: "123", no: 123, category: "상품관리", title: "상품 매핑 오류 문의", preview: "네이버 스마트스토어 상품 옵션 매핑이 누락되었습니다.", date: "2026.03.12", status: "완료" },
  { id: "122", no: 122, category: "시스템", title: "계정 연동 지연 현상 문의", preview: "로그인 시 응답 시간이 평소보다 오래 걸립니다.", date: "2026.03.10", status: "완료" },
  { id: "121", no: 121, category: "정산/결제", title: "정산 내역 확인 요청", preview: "지난달 정산 리포트 데이터 수정 요청드립니다.", date: "2026.03.05", status: "완료" },
  { id: "120", no: 120, category: "기타", title: "서비스 이용 방법 문의", preview: "대시보드 위젯 커스텀 기능이 있는지 궁금합니다.", date: "2026.03.01", status: "완료" },
];



type InquiryDetail = {
  title: string;
  status: "완료" | "처리중";
  type: string;
  date: string;
  author: string;
  content: string;
  answer?: { date: string; body: string[] };
};

// 목데이터 — 실제로는 문의 상세 API에서 params.id로 받아와야 해요.
// 지금은 "124"에만 원본 디자인 그대로의 데이터가 있고, 나머지는 데모 데이터로 대체돼요.
const inquiryDetails: Record<string, InquiryDetail> = {
  "124": {
    title: "A1-1 채널 연결 실패 관련 문의",
    status: "완료",
    type: "확장 오류",
    date: "2026.07.12",
    author: "홍길동",
    content:
      "지그재그 채널 연결 시 계속 인증 오류가 발생합니다. API 키를 재발급받아 다시 입력해봐도 동일한 오류[A1-1]가 표시되는데, 어떻게 해결해야 할까요?",
    answer: {
      date: "2026.07.13 11:30",
      body: [
        "안녕하세요, 문의 주신 내용 확인했습니다.",
        "지그재그 채널의 API 키는 발급 후 반영까지 최대 10분이 소요될 수 있어요. 재발급 후 10분 이상 지났는데도 동일한 오류가 발생한다면, API 키 앞뒤 공백이 포함되지 않았는지 확인 후 다시 입력해 주세요.",
        "그래도 해결되지 않으면 회신 남겨주시면 직접 확인해드리겠습니다.",
      ],
    },
  },
};

const fallbackDetail: InquiryDetail = {
  title: "문의 내역",
  status: "처리중",
  type: "일반 문의",
  date: "2026.03.01",
  author: "-",
  content: "문의 상세 내용을 불러오는 중이에요.",
};



const INQUIRY_TYPES = ["채널연동", "상품관리", "시스템", "정산/결제", "기타"];



type FaqCategory = "채널 연결" | "상품 매핑" | "이상탐지" | "개선안";

type FaqItem = {
  id: number;
  category: FaqCategory;
  question: string;
  answer: string;
};

const FAQ_CATEGORY_STYLE: Record<FaqCategory, { bg: string; text: string }> = {
  "채널 연결": { bg: "bg-indigo-50", text: "text-indigo-600" },
  "상품 매핑": { bg: "bg-violet-50", text: "text-violet-600" },
  이상탐지: { bg: "bg-red-50", text: "text-red-500" },
  개선안: { bg: "bg-orange-50", text: "text-amber-600" },
};

// 목데이터 — 질문은 원본 디자인 그대로고, 답변 본문은 디자인에 없어서
// 임시로 채워둔 데모 텍스트예요. 실제 답변으로 교체하면 돼요.
const faqItems: FaqItem[] = [
  {
    id: 1,
    category: "채널 연결",
    question: "API 키는 어디서 발급받나요?",
    answer: "각 채널의 판매자 센터(쿠팡 Wing, 네이버 스마트스토어센터, 지그재그 파트너센터)에서 API 연동 메뉴를 통해 발급받으실 수 있어요. 자세한 발급 경로는 채널 연동 페이지의 안내를 참고해주세요.",
  },
  {
    id: 2,
    category: "채널 연결",
    question: "채널 연결이 계속 실패해요, 어떻게 해야 하나요?",
    answer: "API 키를 재발급받은 직후라면 반영까지 최대 10분이 걸릴 수 있어요. 그래도 계속 실패한다면 API 키 앞뒤에 공백이 포함되지 않았는지 확인 후 다시 입력해주세요. 그래도 안 되면 1:1 문의로 알려주세요.",
  },
  {
    id: 3,
    category: "채널 연결",
    question: "연동을 해제하면 기존 데이터는 어떻게 되나요?",
    answer: "연동을 해제해도 그동안 수집된 CS·주문 데이터는 삭제되지 않고 보관돼요. 다시 연동하시면 기존 데이터와 이어서 확인하실 수 있어요.",
  },
  {
    id: 4,
    category: "상품 매핑",
    question: "옵션(사이즈/색상)이 다른 상품은 어떻게 매핑되나요?",
    answer: "옵션이 다르더라도 동일 상품으로 판단되면 하나의 마스터 SKU로 그룹핑돼요. 자동 매칭이 안 된 경우 상품 매핑 관리 페이지에서 수동으로 연결하실 수 있어요.",
  },
  {
    id: 5,
    category: "이상탐지",
    question: "이상탐지는 어떤 기준으로 작동하나요?",
    answer: "최근 추이 대비 잔차 z-score를 기반으로 이상 여부를 판단해요. 데이터가 충분하지 않은 상품은 이동평균 방식으로 자동 전환되어 오탐을 줄여요.",
  },
  {
    id: 6,
    category: "이상탐지",
    question: "오탐(잘못 잡힌 경우)이 있으면 어떻게 하나요?",
    answer: "해당 알림에서 '오탐 신고'를 남겨주시면 다음 분석 시 반영돼요. 반복적으로 오탐이 발생하는 유형은 저희 쪽에서도 모델을 조정해요.",
  },
  {
    id: 7,
    category: "개선안",
    question: "제안된 개선안의 근거를 확인할 수 있나요?",
    answer: "네, 각 개선안에는 근거가 된 CS 데이터·상세페이지 수정 이력·과거 유사 사례가 인용 형태로 함께 제공돼요.",
  },
];

const CATEGORIES: ("전체" | FaqCategory)[] = ["전체", "채널 연결", "상품 매핑", "이상탐지", "개선안"];


function CsPageContent() {
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<"list" | "detail" | "new" | "faq">(
    searchParams.get("view") === "faq" ? "faq" : "list",
  );

  useEffect(() => {
    setTab(searchParams.get("view") === "faq" ? "faq" : "list");
  }, [searchParams]);

  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);

  const [inquiryQuery, setInquiryQuery] = useState("");

  const filteredInquiries = useMemo(
    () => inquiries.filter((i) => i.title.toLowerCase().includes(inquiryQuery.toLowerCase())),
    [inquiryQuery],
  );

  const detail = inquiryDetails[selectedInquiryId ?? ""] ?? fallbackDetail;

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !type || !title || !content) {
      setError("필수 항목(*)을 모두 입력해주세요.");
      return;
    }
    setError("");
    // TODO: 백엔드 문의 접수 API 붙으면 이 부분을 실제 fetch 호출로 교체
    setSubmitted(true);
  };

  
  const [activeCategory, setActiveCategory] = useState<"전체" | FaqCategory>("전체");
  const [openId, setOpenId] = useState<number | null>(null);

  const filteredFaqs = useMemo(
    () => (activeCategory === "전체" ? faqItems : faqItems.filter((f) => f.category === activeCategory)),
    [activeCategory],
  );

  if (tab === "new" && submitted) {
    return (
      <div className="flex min-h-screen bg-white">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-[#F8F8FC]">
          <CheckCircle2 className="h-14 w-14 text-emerald-500" />
          <p className="text-xl font-bold text-slate-900">문의가 접수되었습니다</p>
          <p className="text-sm text-slate-500">담당자 확인 후 답변드릴게요.</p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setTab("list")}
              className="rounded-xl bg-indigo-500 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-600"
            >
              문의 내역 보기
            </button>
          </div>
        </div>
      </div>
        );
  }

  return (
    <div className="flex min-h-screen bg-white">

      <div className="flex flex-1 flex-col bg-[#F8F8FC]">
        <header className="flex h-[52px] items-center gap-1.5 border-b border-slate-200 bg-white px-6 text-xs">
          <button
            onClick={() => setTab("list")}
            className={tab === "list" || tab === "detail" ? "font-medium text-slate-900" : "text-slate-500 hover:text-slate-700"}
          >
            문의 내역
          </button>
          <span className="text-slate-300">/</span>
          <button
            onClick={() => setTab("new")}
            className={tab === "new" ? "font-medium text-slate-900" : "text-slate-500 hover:text-slate-700"}
          >
            새 문의 작성
          </button>
          <span className="text-slate-300">/</span>
          <button
            onClick={() => setTab("faq")}
            className={tab === "faq" ? "font-medium text-slate-900" : "text-slate-500 hover:text-slate-700"}
          >
            FAQ
          </button>
          <div className="ml-auto">
            <NotificationBell />
          </div>
        </header>

        {tab === "list" && (
          <main className="flex flex-col gap-5 p-7">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">문의 내역 관리</h1>
              <p className="pt-1 text-sm text-slate-500">
                고객센터에 접수하신 문의 내역과 답변 상태를 확인하실 수 있습니다.
              </p>
            </div>
            <button
              onClick={() => setTab("new")}
              className="flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
            >
              <Plus className="h-3.5 w-3.5" />
              새 문의 작성하기
            </button>
          </div>

          <div className="flex flex-col gap-6 px-5">
            <div className="rounded-2xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
              <div className="border-b border-slate-50 px-6 py-4">
                <div className="flex max-w-[280px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
                  <Search className="h-3.5 w-3.5 text-slate-400" />
                  <input
                    value={inquiryQuery}
                    onChange={(e) => setInquiryQuery(e.target.value)}
                    placeholder="문의 제목으로 검색"
                    className="w-full bg-transparent text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="flex min-w-[760px] bg-white text-[11px] font-semibold text-slate-400">
                  <div className="w-[80px] shrink-0 px-6 py-3">번호</div>
                  <div className="w-[150px] shrink-0 px-6 py-3">분류</div>
                  <div className="min-w-[260px] flex-1 px-6 py-3">문의 제목</div>
                  <div className="w-[130px] shrink-0 px-6 py-3">등록일</div>
                  <div className="w-[160px] shrink-0 px-6 py-3">상태</div>
                </div>

                <div className="min-w-[760px]">
                  {filteredInquiries.length === 0 && (
                    <p className="px-6 py-10 text-center text-sm text-slate-400">검색 결과가 없습니다.</p>
                  )}
                  {filteredInquiries.map((i) => {
                    const cat = INQUIRY_CATEGORY_STYLE[i.category];
                    return (
                      <button
                        key={i.id}
                        onClick={() => {
                          setSelectedInquiryId(i.id);
                          setTab("detail");
                        }}
                        className="flex w-full items-center border-b border-slate-50 px-0 py-4 text-left last:border-b-0 hover:bg-slate-50"
                      >
                        <div className="w-[80px] shrink-0 px-6 text-sm text-slate-400">{i.no}</div>
                        <div className="w-[150px] shrink-0 px-6">
                          <span
                            className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ${cat.bg} ${cat.text}`}
                          >
                            {i.category}
                          </span>
                        </div>
                        <div className="min-w-[260px] flex-1 px-6">
                          <p className="text-sm font-medium text-slate-800">{i.title}</p>
                          <p className="pt-1 text-[11px] text-slate-400">{i.preview}</p>
                        </div>
                        <div className="w-[130px] shrink-0 px-6 text-sm text-slate-500">{i.date}</div>
                        <div className="w-[160px] shrink-0 px-6">
                          <span className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-medium">
                            <span
                              className={"h-1.5 w-1.5 shrink-0 rounded-full " + (i.status === "처리중" ? "bg-orange-400" : "bg-emerald-400")}
                            />
                            <span className={i.status === "처리중" ? "text-orange-600" : "text-emerald-600"}>
                              {i.status === "처리중" ? "처리중" : "완료 · 답변 확인 가능"}
                            </span>
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-50 px-6 py-4">
                <p className="text-[11px] text-slate-400">전체 124개 중 1-5 표시</p>
                <div className="flex items-center gap-1">
                  <button className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50">
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  {[1, 2, 3, 4, 5].map((p) => (
                    <button
                      key={p}
                      className={
                        "flex h-7 w-7 items-center justify-center rounded-lg text-[13px] font-semibold " +
                        (p === 1 ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-50")
                      }
                    >
                      {p}
                    </button>
                  ))}
                  <button className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* FAQ promo */}
            <div className="flex items-center gap-5 rounded-2xl bg-indigo-500 px-7 py-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
                <LifeBuoy className="h-5 w-5 text-white" />
              </span>
              <div className="flex-1">
                <p className="text-[15px] font-semibold text-white">해결되지 않은 문제가 있나요?</p>
                <p className="text-[13px] text-indigo-100">
                  자주 묻는 질문(FAQ)에서 더 빠른 해결 방법을 찾아보실 수 있습니다.
                </p>
              </div>
              <button
                onClick={() => setTab("faq")}
                className="shrink-0 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
              >
                FAQ 바로가기
              </button>
            </div>
          </div>
        </main>
        )}
        {tab === "detail" && (
          <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-8 py-12">
          <button onClick={() => setTab("list")} className="flex w-fit items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
            <ChevronLeft className="h-3.5 w-3.5" />
            문의내역으로 돌아가기
          </button>

          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-slate-900">{detail.title}</h1>
              <span
                className={
                  "shrink-0 rounded-full px-3 py-1 text-xs font-bold " +
                  (detail.status === "완료" ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-600")
                }
              >
                {detail.status}
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

            {detail.answer ? (
              <div className="rounded-2xl border border-indigo-100 bg-[#F9F9FF] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6344D4]">
                      <Sparkles className="h-4 w-4 text-white" />
                    </span>
                    <p className="text-base font-bold text-indigo-600">SELLoN 답변</p>
                  </div>
                  <p className="text-xs text-slate-400">{detail.answer.date}</p>
                </div>
                <div className="flex flex-col gap-4 pt-6">
                  {detail.answer.body.map((p, i) => (
                    <p key={i} className="text-sm leading-relaxed text-slate-600">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
                아직 답변이 등록되지 않았어요. 답변이 등록되면 알림으로 안내드릴게요.
              </div>
            )}
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => setTab("list")}
              className="rounded-xl border border-slate-200 px-8 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              목록으로
            </button>
            <button
              onClick={() => setTab("new")}
              className="rounded-xl bg-indigo-500 px-8 py-3 text-sm font-medium text-white shadow-[0_10px_15px_-3px_rgba(99,68,212,0.2)] hover:bg-indigo-600"
            >
              추가 문의하기
            </button>
          </div>
        </main>
        )}
        {tab === "new" && (
          <main className="flex flex-col gap-8 p-7">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">1:1 문의하기</h1>
            <button
              onClick={() => setTab("list")}
              className="flex items-center gap-2 rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-600"
            >
              문의 내역 보기
            </button>
          </div>

          <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-8">
            <form
              onSubmit={handleSubmit}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]"
            >
              <div className="border-b border-slate-100 p-8">
                <h2 className="text-[22px] font-bold text-slate-900">새 문의 작성</h2>
                <p className="pt-1 text-[13px] text-slate-500">
                  궁금하신 점이나 불편한 사항을 남겨주시면 담당자가 확인 후 답변해 드립니다.
                </p>
              </div>

              <div className="flex flex-col gap-8 p-8">
                <div>
                  <label htmlFor="name" className="text-sm font-bold text-slate-700">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="성함을 입력해주세요"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="type" className="text-sm font-bold text-slate-700">
                    문의 유형 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">문의 유형을 선택해주세요</option>
                    {INQUIRY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="title" className="text-sm font-bold text-slate-700">
                    제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="문의 제목을 입력해주세요"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="content" className="text-sm font-bold text-slate-700">
                    문의 내용 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={7}
                    placeholder="자세한 문의 내용을 입력해주세요. 구체적인 상황을 적어주시면 더 정확한 답변이 가능합니다."
                    className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {error && <p className="text-sm font-medium text-red-500">{error}</p>}
              </div>

              <div className="px-8 pb-8">
                <p className="pb-2 text-sm font-bold text-slate-700">파일 첨부</p>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
                  }}
                  className={
                    "flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed p-6 text-center " +
                    (dragOver ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-slate-50")
                  }
                >
                  <UploadCloud className="h-6 w-6 text-slate-400" />
                  <p className="text-sm text-slate-500">
                    {file ? file.name : "클릭하거나 파일을 여기로 드래그하세요"}
                  </p>
                  <p className="text-xs text-slate-400">10MB 이하의 이미지, PDF 파일만 가능</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                  {file && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="mt-1 flex items-center gap-1 text-xs font-medium text-red-500"
                    >
                      <X className="h-3 w-3" />
                      제거
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 p-8">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="rounded-xl px-8 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-500 px-10 py-3 text-sm font-bold text-white shadow-[0_10px_15px_-3px_rgba(97,94,255,0.2)] hover:bg-indigo-600"
                >
                  문의 접수하기
                </button>
              </div>
            </form>

            <div className="flex items-center gap-6 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 p-8 shadow-[0_10px_15px_-3px_rgba(97,94,255,0.2)]">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/20">
                <LifeBuoy className="h-6 w-6 text-white" />
              </span>
              <div className="flex-1">
                <p className="text-lg font-bold text-white">해결되지 않은 문제가 있나요?</p>
                <p className="text-sm text-indigo-100">
                  자주 묻는 질문(FAQ)에서 더 빠른 해결 방법을 찾아보실 수 있습니다.
                </p>
              </div>
              <button
                onClick={() => setTab("faq")}
                className="shrink-0 rounded-xl bg-white px-8 py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-50"
              >
                FAQ 바로가기
              </button>
            </div>
          </div>
        </main>
        )}
        {tab === "faq" && (
          <main className="flex flex-col gap-5 p-7">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">SELLoN FAQ</h1>
            <p className="pt-2 text-sm leading-relaxed text-slate-500">
              채널 연결, 상품 매핑, 이상탐지, 개선안까지 SELLoN 이용 중 자주 묻는 질문을 모았어요.
              <br />
              찾으시는 답이 없다면 하단의{" "}
              <button onClick={() => setTab("new")} className="font-semibold text-indigo-600 underline">
                &apos;문의하기&apos;
              </button>
              를 통해 직접 문의를 남길 수 있어요.
            </p>
          </div>

          <div className="flex flex-col gap-5 px-5">
            <div className="flex flex-wrap gap-2.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={
                    "rounded-full px-5 py-2 text-xs font-semibold " +
                    (activeCategory === c
                      ? "bg-slate-800 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50")
                  }
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              {filteredFaqs.map((f) => {
                const style = FAQ_CATEGORY_STYLE[f.category];
                const isOpen = openId === f.id;
                return (
                  <div
                    key={f.id}
                    className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_1px_2px_-1px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.1)]"
                  >
                    <button
                      onClick={() => setOpenId(isOpen ? null : f.id)}
                      className="flex w-full items-center gap-5 p-5 text-left"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-500">
                        {f.id}
                      </span>
                      <div className="flex-1">
                        <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${style.bg} ${style.text}`}>
                          {f.category}
                        </span>
                        <p className="pt-1 text-[13px] font-bold text-slate-800">{f.question}</p>
                      </div>
                      <ChevronDown
                        className={"h-3.5 w-3.5 shrink-0 text-slate-300 transition-transform " + (isOpen ? "rotate-180" : "")}
                      />
                    </button>
                    {isOpen && (
                      <div className="border-t border-slate-50 px-5 py-4 pl-[68px] text-[13px] leading-relaxed text-slate-600">
                        {f.answer}
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredFaqs.length === 0 && (
                <p className="py-10 text-center text-sm text-slate-400">해당 카테고리의 FAQ가 없어요.</p>
              )}
            </div>
          </div>
        </main>
        )}

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

export default function CsPage() {
  return (
    <Suspense fallback={null}>
      <CsPageContent />
    </Suspense>
  );
}