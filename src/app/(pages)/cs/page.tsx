"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import NotificationBell from "@/components/common/NotificationBell";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  LifeBuoy,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  Paperclip,
  X,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  createInquiry,
  getMyInquiries,
  getInquiryDetail,
  updateInquiry,
  deleteInquiry,
  uploadInquiryAttachment,
} from "@/app/api/cs";
import {
  INQUIRE_TYPE_LABEL,
  INQUIRE_TYPE_STYLE,
  INQUIRY_STATUS_LABEL,
  type CsInquiry,
  type InquireType,
} from "@/app/api/cs/types";
import { ApiError } from "@/app/api/client";

const INQUIRY_TYPES: InquireType[] = [
  "CHANNEL_CONNECTION",
  "PRODUCT_MAPPING",
  "ANOMALY_DETECTION",
  "IMPROVEMENT_PROPOSAL",
];

const PAGE_SIZE = 5;

function preview(content: string, len = 40) {
  return content.length > len ? content.slice(0, len) + "…" : content;
}

// FAQ는 백엔드 연결 없이 프론트 고정값으로 둬요.
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

const faqItems: FaqItem[] = [
  { id: 1, category: "채널 연결", question: "API 키는 어디서 발급받나요?", answer: "각 채널의 판매자 센터(쿠팡 Wing, 네이버 스마트스토어센터, 지그재그 파트너센터)에서 API 연동 메뉴를 통해 발급받으실 수 있어요. 자세한 발급 경로는 채널 연동 페이지의 안내를 참고해주세요." },
  { id: 2, category: "채널 연결", question: "채널 연결이 계속 실패해요, 어떻게 해야 하나요?", answer: "API 키를 재발급받은 직후라면 반영까지 최대 10분이 걸릴 수 있어요. 그래도 계속 실패한다면 API 키 앞뒤에 공백이 포함되지 않았는지 확인 후 다시 입력해주세요. 그래도 안 되면 1:1 문의로 알려주세요." },
  { id: 3, category: "채널 연결", question: "연동을 해제하면 기존 데이터는 어떻게 되나요?", answer: "연동을 해제해도 그동안 수집된 CS·주문 데이터는 삭제되지 않고 보관돼요. 다시 연동하시면 기존 데이터와 이어서 확인하실 수 있어요." },
  { id: 4, category: "채널 연결", question: "여러 채널을 동시에 연동할 수 있나요?", answer: "네, 쿠팡·네이버·지그재그를 동시에 연동하실 수 있어요. 채널별로 개별 API 키를 입력하시면 각 채널의 데이터가 독립적으로 수집되고, 대시보드에서 한 화면에 모아 확인하실 수 있어요." },
  { id: 5, category: "채널 연결", question: "채널 연동 후 데이터는 언제부터 보이나요?", answer: "연동이 완료되면 바로 데이터 수집이 시작돼요. 다만 이상탐지·비교분석 같은 분석 결과는 일정 기간의 데이터가 쌓여야 정확도가 올라가기 때문에, 연동 직후보다는 며칠 지난 뒤부터 더 유의미한 인사이트를 보실 수 있어요." },
  { id: 6, category: "상품 매핑", question: "옵션(사이즈/색상)이 다른 상품은 어떻게 매핑되나요?", answer: "옵션이 다르더라도 동일 상품으로 판단되면 하나의 마스터 SKU로 그룹핑돼요. 자동 매칭이 안 된 경우 상품 매핑 관리 페이지에서 수동으로 연결하실 수 있어요." },
  { id: 7, category: "상품 매핑", question: "자동 매핑이 잘못된 것 같으면 수정할 수 있나요?", answer: "네, 상품 매핑 관리 페이지에서 자동 매칭된 그룹을 직접 확인하고 언제든 연결을 해제하거나 다른 상품으로 다시 연결하실 수 있어요." },
  { id: 8, category: "이상탐지", question: "이상탐지는 어떤 기준으로 작동하나요?", answer: "상품 속성·채널별 최근 7일 부정 비율을 직전 28일과 비교해요. 최근 문의가 10건 이상인 대상 중 Fisher 단측 검정, 상품별 BH-FDR 보정, 최소 3%p 상승 조건을 모두 통과한 경우만 알림을 생성하며, 표본이 부족하면 판정을 보류해요." },
  { id: 9, category: "이상탐지", question: "오탐(잘못 잡힌 경우)이 있으면 어떻게 하나요?", answer: "해당 알림에서 '오탐 신고'를 남겨주시면 다음 분석 시 반영돼요. 반복적으로 오탐이 발생하는 유형은 저희 쪽에서도 모델을 조정해요." },
  { id: 10, category: "이상탐지", question: "이상 알림은 얼마나 자주 오나요?", answer: "이상탐지는 하루 한 번 전체 상품을 대상으로 실행돼요. 동일한 상품·유형·채널 조합의 알림은 한 번 뜨면 7일 동안은 반복해서 오지 않고, 해당 알림을 처리(승인/반려)하시면 그때부터 다시 감지가 시작돼요." },
  { id: 11, category: "개선안", question: "제안된 개선안의 근거를 확인할 수 있나요?", answer: "네, 각 개선안에는 근거가 된 CS 데이터·상세페이지 수정 이력·과거 유사 사례가 인용 형태로 함께 제공돼요." },
  { id: 12, category: "개선안", question: "개선안을 반영하면 상품 설명이 자동으로 바뀌나요?", answer: "아니요, 자동으로 반영되지는 않아요. 제안된 개선안을 참고해서 상품 설명을 직접 수정하신 뒤 저장하시면 그 변경 내역이 개선안 히스토리에 남아요." },
  { id: 13, category: "개선안", question: "개선안을 반려하면 어떻게 되나요?", answer: "반려하시면 반려 사유가 저장되고, 원하실 경우 그 사유를 바탕으로 분석을 다시 요청하실 수 있어요. 반려 이력은 이후 개선안을 생성할 때 참고 자료로 함께 활용돼요." },
];

const CATEGORIES: ("전체" | FaqCategory)[] = ["전체", "채널 연결", "상품 매핑", "이상탐지", "개선안"];

function CsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  const [tab, setTab] = useState<"list" | "detail" | "new" | "faq">(
    searchParams.get("view") === "faq" ? "faq" : "list"
  );

  useEffect(() => {
    setTab(searchParams.get("view") === "faq" ? "faq" : "list");
  }, [searchParams]);

  const goToFaq = () => {
    setTab("faq");
    router.push(`${pathname}?view=faq`, { scroll: false });
  };
  const goToInquiryList = () => {
    setTab("list");
    router.push(`${pathname}?view=inquiry`, { scroll: false });
  };

  // 목록
  const [inquiries, setInquiries] = useState<CsInquiry[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [inquiryQuery, setInquiryQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!hasHydrated || tab !== "list") return;
    let ignore = false;

    async function load() {
      setLoadingList(true);
      setListError(null);
      try {
        const data = await getMyInquiries();
        if (!ignore) setInquiries(data);
      } catch (e) {
        if (!ignore) setListError(e instanceof ApiError ? e.message : "문의 목록을 불러오지 못했습니다.");
      } finally {
        if (!ignore) setLoadingList(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [hasHydrated, tab]);

  const filteredInquiries = useMemo(
    () => inquiries.filter((i) => i.inquireTitle.toLowerCase().includes(inquiryQuery.toLowerCase())),
    [inquiries, inquiryQuery]
  );
  const totalPages = Math.max(1, Math.ceil(filteredInquiries.length / PAGE_SIZE));
  const pagedInquiries = filteredInquiries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // 상세
  const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(null);
  const [detail, setDetail] = useState<CsInquiry | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const openDetail = async (inquireKey: number) => {
    setSelectedInquiryId(inquireKey);
    setTab("detail");
    setLoadingDetail(true);
    setDetailError(null);
    try {
      const d = await getInquiryDetail(inquireKey);
      setDetail(d);
    } catch (e) {
      setDetailError(e instanceof ApiError ? e.message : "문의 상세를 불러오지 못했습니다.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDeleteInquiry = async () => {
    if (!selectedInquiryId) return;
    try {
      await deleteInquiry(selectedInquiryId);
      setInquiries((prev) => prev.filter((i) => i.inquireKey !== selectedInquiryId));
      setDeleteConfirmOpen(false);
      goToInquiryList();
    } catch (e) {
      setDetailError(e instanceof ApiError ? e.message : "삭제하지 못했습니다.");
      setDeleteConfirmOpen(false);
    }
  };

  const goToEditInquiry = (i: CsInquiry) => {
    setEditingInquiryId(i.inquireKey);
    setInquireType(i.inquireType);
    setTitle(i.inquireTitle);
    setContent(i.inquireContent);
    setExistingAttachmentUrl(i.attachmentUrl);
    setAttachmentFile(null);
    setFormError("");
    setTab("new");
  };

  // 작성/수정 폼
  const [editingInquiryId, setEditingInquiryId] = useState<number | null>(null);
  const [inquireType, setInquireType] = useState<InquireType | "">("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [existingAttachmentUrl, setExistingAttachmentUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  const resetForm = () => {
    setEditingInquiryId(null);
    setInquireType("");
    setTitle("");
    setContent("");
    setAttachmentFile(null);
    setExistingAttachmentUrl(null);
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquireType || !title || !content) {
      setFormError("필수 항목(*)을 모두 입력해주세요.");
      return;
    }
    setFormError("");
    setSubmitting(true);
    try {
      let attachmentUrl = existingAttachmentUrl;
      if (attachmentFile) {
        setUploadingAttachment(true);
        try {
          attachmentUrl = await uploadInquiryAttachment(attachmentFile);
        } finally {
          setUploadingAttachment(false);
        }
      }

      if (editingInquiryId) {
        await updateInquiry(editingInquiryId, {
          inquireTitle: title,
          inquireContent: content,
          inquireType,
          attachmentUrl,
        });
      } else {
        await createInquiry({
          inquireTitle: title,
          inquireContent: content,
          inquireType,
          attachmentUrl,
        });
      }
      setSubmitted(true);
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : "제출하지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  // FAQ (고정값)
  const [activeCategory, setActiveCategory] = useState<"전체" | FaqCategory>("전체");
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());

  const filteredFaqs = useMemo(
    () => (activeCategory === "전체" ? faqItems : faqItems.filter((f) => f.category === activeCategory)),
    [activeCategory]
  );

  if (!hasHydrated) return null;

  if (tab === "new" && submitted) {
    return (
      <div className="flex min-h-screen bg-white">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-[#F8F8FC]">
          <CheckCircle2 className="h-14 w-14 text-emerald-500" />
          <p className="text-xl font-bold text-slate-900">
            {editingInquiryId ? "문의가 수정되었습니다" : "문의가 접수되었습니다"}
          </p>
          <p className="text-sm text-slate-500">담당자 확인 후 답변드릴게요.</p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => {
                setSubmitted(false);
                resetForm();
                goToInquiryList();
              }}
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
          <button onClick={goToInquiryList} className="text-slate-500 hover:text-slate-700">
            CS 문의
          </button>
          <span className="text-slate-300">{">"}</span>
          {tab === "faq" ? (
            <span className="font-medium text-slate-900">FAQ</span>
          ) : (
            <>
              <button onClick={goToInquiryList} className="text-slate-500 hover:text-slate-700">
                1:1 문의
              </button>
              <span className="text-slate-300">{">"}</span>
              <span className="font-medium text-slate-900">{tab === "new" ? "새 문의 작성" : "문의 내역"}</span>
            </>
          )}
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
                onClick={() => {
                  resetForm();
                  setTab("new");
                }}
                className="flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
              >
                <Plus className="h-3.5 w-3.5" />
                새 문의 작성하기
              </button>
            </div>

            <div className="flex flex-col gap-6 px-5">
              {listError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {listError}
                </div>
              )}

              <div className="rounded-2xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
                <div className="border-b border-slate-50 px-6 py-4">
                  <div className="flex max-w-[280px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
                    <Search className="h-3.5 w-3.5 text-slate-400" />
                    <input
                      value={inquiryQuery}
                      onChange={(e) => {
                        setInquiryQuery(e.target.value);
                        setPage(1);
                      }}
                      placeholder="문의 제목으로 검색"
                      className="w-full bg-transparent text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <div className="flex min-w-[680px] bg-white text-[11px] font-semibold text-slate-400">
                    <div className="w-[80px] shrink-0 px-6 py-3">번호</div>
                    <div className="w-[150px] shrink-0 px-6 py-3">분류</div>
                    <div className="min-w-[260px] flex-1 px-6 py-3">문의 제목</div>
                    <div className="w-[160px] shrink-0 px-6 py-3">상태</div>
                  </div>

                  <div className="min-w-[680px]">
                    {loadingList ? (
                      <p className="px-6 py-10 text-center text-sm text-slate-400">불러오는 중...</p>
                    ) : pagedInquiries.length === 0 ? (
                      <p className="px-6 py-10 text-center text-sm text-slate-400">검색 결과가 없습니다.</p>
                    ) : (
                      pagedInquiries.map((i, idx) => {
                        const style = INQUIRE_TYPE_STYLE[i.inquireType];
                        const isCleared = i.inquiryStatus === "CLEARED";
                        return (
                          <button
                            key={i.inquireKey}
                            onClick={() => openDetail(i.inquireKey)}
                            className="flex w-full items-center border-b border-slate-50 px-0 py-4 text-left last:border-b-0 hover:bg-slate-50"
                          >
                            <div className="w-[80px] shrink-0 px-6 text-sm text-slate-400">
                              {filteredInquiries.length - ((page - 1) * PAGE_SIZE + idx)}
                            </div>
                            <div className="w-[150px] shrink-0 px-6">
                              <span
                                className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ${style.bg} ${style.text}`}
                              >
                                {INQUIRE_TYPE_LABEL[i.inquireType]}
                              </span>
                            </div>
                            <div className="min-w-[260px] flex-1 px-6">
                              <p className="text-sm font-medium text-slate-800">{i.inquireTitle}</p>
                              <p className="pt-1 text-[11px] text-slate-400">{preview(i.inquireContent)}</p>
                            </div>
                            <div className="w-[160px] shrink-0 px-6">
                              <span className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-medium">
                                <span
                                  className={"h-1.5 w-1.5 shrink-0 rounded-full " + (isCleared ? "bg-emerald-400" : "bg-orange-400")}
                                />
                                <span className={isCleared ? "text-emerald-600" : "text-orange-600"}>
                                  {INQUIRY_STATUS_LABEL[i.inquiryStatus]}
                                </span>
                              </span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-50 px-6 py-4">
                  <p className="text-[11px] text-slate-400">
                    전체 {filteredInquiries.length}개 중 {pagedInquiries.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-
                    {(page - 1) * PAGE_SIZE + pagedInquiries.length} 표시
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-40"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={
                          "flex h-7 w-7 items-center justify-center rounded-lg text-[13px] font-semibold " +
                          (p === page ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-50")
                        }
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-40"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

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
                  onClick={goToFaq}
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
            <button onClick={goToInquiryList} className="flex w-fit items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
              <ChevronLeft className="h-3.5 w-3.5" />
              문의내역으로 돌아가기
            </button>

            {loadingDetail ? (
              <p className="text-sm text-slate-400">불러오는 중...</p>
            ) : detailError || !detail ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {detailError ?? "문의를 찾을 수 없습니다."}
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl font-bold text-slate-900">{detail.inquireTitle}</h1>
                    <span
                      className={
                        "shrink-0 rounded-full px-3 py-1 text-xs font-bold " +
                        (detail.inquiryStatus === "CLEARED"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-orange-50 text-orange-600")
                      }
                    >
                      {INQUIRY_STATUS_LABEL[detail.inquiryStatus]}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <span className="flex items-center gap-2">
                      <span className="font-medium text-slate-600">문의 유형:</span>
                      <span className="text-slate-400">{INQUIRE_TYPE_LABEL[detail.inquireType]}</span>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-6 pt-2">
                  <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
                    <p className="text-[15px] font-bold text-slate-900">문의 내용</p>
                    <p className="pt-4 text-sm leading-relaxed text-slate-600">{detail.inquireContent}</p>
                    {detail.attachmentUrl && (
                      <a
                        href={detail.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 flex w-fit items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                      >
                        <Paperclip className="h-3.5 w-3.5" />
                        첨부파일 보기
                      </a>
                    )}
                  </div>

                  {detail.inquireAnswer ? (
                    <div className="rounded-2xl border border-indigo-100 bg-[#F9F9FF] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6344D4]">
                          <Sparkles className="h-4 w-4 text-white" />
                        </span>
                        <p className="text-base font-bold text-indigo-600">SELLoN 답변</p>
                      </div>
                      <p className="pt-6 text-sm leading-relaxed text-slate-600">{detail.inquireAnswer}</p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
                      아직 답변이 등록되지 않았어요. 답변이 등록되면 알림으로 안내드릴게요.
                    </div>
                  )}
                </div>

                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={goToInquiryList}
                    className="rounded-xl border border-slate-200 px-8 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    목록으로
                  </button>
                  {detail.inquiryStatus === "WAITING" && (
                    <>
                      <button
                        onClick={() => goToEditInquiry(detail)}
                        className="rounded-xl border border-slate-200 px-8 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => setDeleteConfirmOpen(true)}
                        className="rounded-xl border border-red-200 px-8 py-3 text-sm font-medium text-red-500 hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      resetForm();
                      setTab("new");
                    }}
                    className="rounded-xl bg-indigo-500 px-8 py-3 text-sm font-medium text-white shadow-[0_10px_15px_-3px_rgba(99,68,212,0.2)] hover:bg-indigo-600"
                  >
                    추가 문의하기
                  </button>
                </div>

                {deleteConfirmOpen && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                    onClick={() => setDeleteConfirmOpen(false)}
                  >
                    <div className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-xl" onClick={(e) => e.stopPropagation()}>
                      <p className="text-base font-bold text-slate-900">문의를 삭제할까요?</p>
                      <p className="pt-2 text-sm text-slate-500">삭제한 문의는 다시 볼 수 없어요.</p>
                      <div className="flex justify-end gap-2 pt-6">
                        <button
                          onClick={() => setDeleteConfirmOpen(false)}
                          className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100"
                        >
                          취소
                        </button>
                        <button
                          onClick={handleDeleteInquiry}
                          className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-600"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        )}

        {tab === "new" && (
          <main className="flex flex-col gap-8 p-7">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-900">
                {editingInquiryId ? "문의 수정하기" : "1:1 문의하기"}
              </h1>
              <button
                onClick={() => {
                  resetForm();
                  goToInquiryList();
                }}
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
                  <h2 className="text-[22px] font-bold text-slate-900">
                    {editingInquiryId ? "문의 내용 수정" : "새 문의 작성"}
                  </h2>
                  <p className="pt-1 text-[13px] text-slate-500">
                    {editingInquiryId
                      ? "아직 답변 전인 문의만 수정할 수 있어요."
                      : "궁금하신 점이나 불편한 사항을 남겨주시면 담당자가 확인 후 답변해 드립니다."}
                  </p>
                </div>

                <div className="flex flex-col gap-8 p-8">
                  <div>
                    <label htmlFor="type" className="text-sm font-bold text-slate-700">
                      문의 유형 <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="type"
                      value={inquireType}
                      onChange={(e) => setInquireType(e.target.value as InquireType)}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">문의 유형을 선택해주세요</option>
                      {INQUIRY_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {INQUIRE_TYPE_LABEL[t]}
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

                  <div>
                    <label className="text-sm font-bold text-slate-700">파일 첨부</label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files?.[0] ?? null;
                        if (file) {
                          setAttachmentFile(file);
                          setExistingAttachmentUrl(null);
                        }
                      }}
                      className={
                        "mt-2 flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-10 text-center transition-colors " +
                        (isDragging ? "border-indigo-400 bg-indigo-50/50" : "border-slate-200 bg-slate-50 hover:bg-slate-100")
                      }
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null;
                          setAttachmentFile(file);
                          if (file) setExistingAttachmentUrl(null);
                        }}
                      />
                      {attachmentFile ? (
                        <div
                          className="flex items-center gap-2 text-sm font-medium text-slate-700"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Paperclip className="h-4 w-4 text-indigo-500" />
                          {attachmentFile.name}
                          <button
                            type="button"
                            onClick={() => setAttachmentFile(null)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : existingAttachmentUrl ? (
                        <div
                          className="flex items-center gap-2 text-sm font-medium text-slate-700"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Paperclip className="h-4 w-4 text-indigo-500" />
                          기존 첨부파일 유지됨
                          <button
                            type="button"
                            onClick={() => setExistingAttachmentUrl(null)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-slate-400">클릭하거나 파일을 여기로 드래그하세요</p>
                          <p className="text-xs text-slate-300">10MB 이하의 이미지, PDF 파일만 가능</p>
                        </>
                      )}
                    </div>
                  </div>

                  {formError && <p className="text-sm font-medium text-red-500">{formError}</p>}
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
                    disabled={submitting}
                    className="rounded-xl bg-indigo-500 px-10 py-3 text-sm font-bold text-white shadow-[0_10px_15px_-3px_rgba(97,94,255,0.2)] hover:bg-indigo-600 disabled:opacity-60"
                  >
                    {submitting
                      ? uploadingAttachment
                        ? "파일 업로드 중..."
                        : "처리 중..."
                      : editingInquiryId
                        ? "수정 완료"
                        : "문의 접수하기"}
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
                  onClick={goToFaq}
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
                찾으시는 답이 없다면 {" "}
                <button
                  onClick={() => {
                    resetForm();
                    setTab("new");
                  }}
                  className="font-semibold text-indigo-600 underline"
                >
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
                  const isOpen = openIds.has(f.id);
                  const toggleOpen = () => {
                    setOpenIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(f.id)) next.delete(f.id);
                      else next.add(f.id);
                      return next;
                    });
                  };
                  return (
                    <div
                      key={f.id}
                      className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_1px_2px_-1px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.1)]"
                    >
                      <button onClick={toggleOpen} className="flex w-full items-center gap-5 p-5 text-left">
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
