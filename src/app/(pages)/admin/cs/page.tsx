"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { getAllAnswers } from "@/lib/inquiryAnswers";

type Category = "채널연동" | "상품관리" | "시스템" | "정산/결제" | "기타";
type Status = "처리중" | "완료";

type AdminInquiry = {
  id: string;
  no: number;
  category: Category;
  title: string;
  preview: string;
  date: string;
  status: Status;
  author: string;
};

const INQUIRY_CATEGORY_STYLE: Record<Category, { bg: string; text: string }> = {
  채널연동: { bg: "bg-blue-50", text: "text-blue-600" },
  상품관리: { bg: "bg-emerald-50", text: "text-emerald-600" },
  시스템: { bg: "bg-purple-50", text: "text-purple-600" },
  "정산/결제": { bg: "bg-yellow-50", text: "text-amber-600" },
  기타: { bg: "bg-slate-100", text: "text-slate-600" },
};

// 목데이터 — 실제로는 GET /inquiries/admin(상태 필터 옵션 포함)에서 받아와야 해요.
// status는 "아직 아무도 답변 안 했을 때의 초기값"이고, 실제 표시 상태는
// localStorage(답변 등록 여부)를 반영해 화면에서 다시 계산해요.
export const adminInquiries: AdminInquiry[] = [
  { id: "124", no: 124, category: "채널연동", title: "A1-1 채널 연결 실패 관련 문의", preview: "API 인증 오류가 지속적으로 발생하고 있습니다.", date: "2026.07.12", status: "완료", author: "홍길동" },
  { id: "123", no: 123, category: "상품관리", title: "상품 매핑 오류 문의", preview: "네이버 스마트스토어 상품 옵션 매핑이 누락되었습니다.", date: "2026.03.12", status: "처리중", author: "김민지" },
  { id: "122", no: 122, category: "시스템", title: "계정 연동 지연 현상 문의", preview: "로그인 시 응답 시간이 평소보다 오래 걸립니다.", date: "2026.03.10", status: "처리중", author: "박서준" },
  { id: "121", no: 121, category: "정산/결제", title: "정산 내역 확인 요청", preview: "지난달 정산 리포트 데이터 수정 요청드립니다.", date: "2026.03.05", status: "처리중", author: "이수아" },
  { id: "120", no: 120, category: "기타", title: "서비스 이용 방법 문의", preview: "대시보드 위젯 커스텀 기능이 있는지 궁금합니다.", date: "2026.03.01", status: "처리중", author: "정하늘" },
];

const STATUS_FILTERS: ("전체" | Status)[] = ["전체", "처리중", "완료"];

export default function AdminCsListPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"전체" | Status>("전체");
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());

  // 상세 페이지에서 등록한 답변 여부를 불러와요.
  // (상세 페이지 방문 후 뒤로 돌아올 때마다 이 페이지가 새로 마운트되므로 여기서 다시 읽어옵니다.)
  useEffect(() => {
    setAnsweredIds(new Set(Object.keys(getAllAnswers())));
  }, []);

  // 124번은 데모용으로 원래부터 답변이 있던 것으로 취급 (상세 페이지의 seedAnswers와 동일)
  const effectiveStatus = (i: AdminInquiry): Status =>
    answeredIds.has(i.id) || i.id === "124" ? "완료" : "처리중";

  const withStatus = useMemo(
    () => adminInquiries.map((i) => ({ ...i, status: effectiveStatus(i) })),
    [answeredIds],
  );

  const filtered = useMemo(
    () =>
      withStatus.filter(
        (i) =>
          i.title.toLowerCase().includes(query.toLowerCase()) &&
          (statusFilter === "전체" || i.status === statusFilter),
      ),
    [withStatus, query, statusFilter],
  );

  const pendingCount = withStatus.filter((i) => i.status === "처리중").length;

  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex flex-1 flex-col bg-[#F8F8FC]">
        <header className="flex h-[52px] items-center gap-1.5 border-b border-slate-200 bg-white px-6 text-xs">
          <span className="text-slate-500">Admin</span>
          <span className="text-slate-300">{">"}</span>
          <span className="font-medium text-slate-900">CS 문의 관리</span>
        </header>

        <main className="flex flex-col gap-5 p-7">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">문의 관리</h1>
            <p className="pt-1 text-sm text-slate-500">
              전체 사용자의 1:1 문의를 확인하고 답변을 등록할 수 있습니다.{" "}
              <span className="font-semibold text-orange-600">미답변 {pendingCount}건</span>
            </p>
          </div>

          <div className="flex flex-col gap-6 px-5">
            <div className="rounded-2xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-50 px-6 py-4">
                <div className="flex max-w-[280px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
                  <Search className="h-3.5 w-3.5 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="문의 제목으로 검색"
                    className="w-full bg-transparent text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  {STATUS_FILTERS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={
                        "rounded-full px-4 py-1.5 text-xs font-bold " +
                        (statusFilter === s
                          ? "bg-slate-800 text-white"
                          : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50")
                      }
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="flex min-w-[860px] bg-white text-[11px] font-semibold text-slate-400">
                  <div className="w-[70px] shrink-0 px-6 py-3">번호</div>
                  <div className="w-[110px] shrink-0 px-6 py-3">작성자</div>
                  <div className="w-[130px] shrink-0 px-6 py-3">분류</div>
                  <div className="min-w-[220px] flex-1 px-6 py-3">문의 제목</div>
                  <div className="w-[120px] shrink-0 px-6 py-3">등록일</div>
                  <div className="w-[140px] shrink-0 px-6 py-3">상태</div>
                </div>

                <div className="min-w-[860px]">
                  {filtered.length === 0 && (
                    <p className="px-6 py-10 text-center text-sm text-slate-400">해당하는 문의가 없습니다.</p>
                  )}
                  {filtered.map((i) => {
                    const cat = INQUIRY_CATEGORY_STYLE[i.category];
                    return (
                      <button
                        key={i.id}
                        onClick={() => router.push(`/admin/cs/${i.id}`)}
                        className="flex w-full items-center border-b border-slate-50 px-0 py-4 text-left last:border-b-0 hover:bg-slate-50"
                      >
                        <div className="w-[70px] shrink-0 px-6 text-sm text-slate-400">{i.no}</div>
                        <div className="w-[110px] shrink-0 px-6 text-sm text-slate-600">{i.author}</div>
                        <div className="w-[130px] shrink-0 px-6">
                          <span
                            className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ${cat.bg} ${cat.text}`}
                          >
                            {i.category}
                          </span>
                        </div>
                        <div className="min-w-[220px] flex-1 px-6">
                          <p className="text-sm font-medium text-slate-800">{i.title}</p>
                          <p className="pt-1 text-[11px] text-slate-400">{i.preview}</p>
                        </div>
                        <div className="w-[120px] shrink-0 px-6 text-sm text-slate-500">{i.date}</div>
                        <div className="w-[140px] shrink-0 px-6">
                          <span className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-medium">
                            <span
                              className={"h-1.5 w-1.5 shrink-0 rounded-full " + (i.status === "처리중" ? "bg-orange-400" : "bg-emerald-400")}
                            />
                            <span className={i.status === "처리중" ? "text-orange-600" : "text-emerald-600"}>
                              {i.status === "처리중" ? "답변 대기" : "답변 완료"}
                            </span>
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-50 px-6 py-4">
                <p className="text-[11px] text-slate-400">전체 {adminInquiries.length}개 중 표시</p>
                <div className="flex items-center gap-1">
                  <button className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50">
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-[13px] font-semibold text-white">
                    1
                  </button>
                  <button className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
