"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { getAllInquiries } from "@/app/api/cs";
import {
  INQUIRE_TYPE_LABEL,
  INQUIRE_TYPE_STYLE,
  INQUIRY_STATUS_LABEL,
  formatDate,
  type CsInquiry,
  type InquiryStatus,
} from "@/app/api/cs/types";
import { ApiError } from "@/app/api/client";

const STATUS_FILTERS: ("전체" | InquiryStatus)[] = ["전체", "WAITING", "DISCUSSING", "CLEARED"];
const PAGE_SIZE = 5;

export default function AdminCsListPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<CsInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"전체" | InquiryStatus>("전체");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllInquiries();
        if (!ignore) setInquiries(data);
      } catch (e) {
        if (!ignore) setError(e instanceof ApiError ? e.message : "문의 목록을 불러오지 못했습니다.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  const filtered = useMemo(
    () =>
      inquiries.filter(
        (i) =>
          i.inquireTitle.toLowerCase().includes(query.toLowerCase()) &&
          (statusFilter === "전체" || i.inquiryStatus === statusFilter)
      ),
    [inquiries, query, statusFilter]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pendingCount = inquiries.filter((i) => i.inquiryStatus !== "CLEARED").length;

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
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="rounded-2xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-50 px-6 py-4">
                <div className="flex max-w-[280px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
                  <Search className="h-3.5 w-3.5 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="문의 제목으로 검색"
                    className="w-full bg-transparent text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  {STATUS_FILTERS.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setStatusFilter(s);
                        setPage(1);
                      }}
                      className={
                        "rounded-full px-4 py-1.5 text-xs font-bold " +
                        (statusFilter === s
                          ? "bg-slate-800 text-white"
                          : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50")
                      }
                    >
                      {s === "전체" ? "전체" : INQUIRY_STATUS_LABEL[s]}
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
                  <div className="w-[130px] shrink-0 px-6 py-3">등록일</div>
                  <div className="w-[140px] shrink-0 px-6 py-3">상태</div>
                </div>

                <div className="min-w-[860px]">
                  {loading ? (
                    <p className="px-6 py-10 text-center text-sm text-slate-400">불러오는 중...</p>
                  ) : paged.length === 0 ? (
                    <p className="px-6 py-10 text-center text-sm text-slate-400">해당하는 문의가 없습니다.</p>
                  ) : (
                    paged.map((i) => {
                      const typeStyle = INQUIRE_TYPE_STYLE[i.inquireType];
                      const isCleared = i.inquiryStatus === "CLEARED";
                      return (
                        <button
                          key={i.inquireKey}
                          onClick={() => router.push(`/admin/cs/${i.inquireKey}`)}
                          className="flex w-full items-center border-b border-slate-50 px-0 py-4 text-left last:border-b-0 hover:bg-slate-50"
                        >
                          <div className="w-[70px] shrink-0 px-6 text-sm text-slate-400">{i.inquireKey}</div>
                          <div className="w-[110px] shrink-0 px-6 text-sm text-slate-600">{i.authorName}</div>
                          <div className="w-[130px] shrink-0 px-6">
                            <span
                              className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ${typeStyle.bg} ${typeStyle.text}`}
                            >
                              {INQUIRE_TYPE_LABEL[i.inquireType]}
                            </span>
                          </div>
                          <div className="min-w-[220px] flex-1 px-6">
                            <p className="text-sm font-medium text-slate-800">{i.inquireTitle}</p>
                            <p className="pt-1 text-[11px] text-slate-400">
                              {i.inquireContent.length > 40 ? i.inquireContent.slice(0, 40) + "…" : i.inquireContent}
                            </p>
                          </div>
                          <div className="w-[130px] shrink-0 whitespace-nowrap px-6 text-sm text-slate-500">
                            {formatDate(i.createdAt)}
                          </div>
                          <div className="w-[140px] shrink-0 px-6">
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
                  전체 {filtered.length}개 중 {paged.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-
                  {(page - 1) * PAGE_SIZE + paged.length} 표시
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
          </div>
        </main>
      </div>
    </div>
  );
}
