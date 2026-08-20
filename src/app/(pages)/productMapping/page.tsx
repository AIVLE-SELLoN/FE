"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Package, Check, ArrowRight, SkipForward, Sparkles, X } from "lucide-react";
import NotificationBell from "@/components/common/NotificationBell";
import {
  getMappings,
  getMappingSummary,
  getCandidates,
  connectMapping,
  createNewGroup,
  skipMapping,
} from "@/app/api/channel/productMapping";
import type { ChannelProductResponse, MatchCandidateResponse } from "@/app/api/channel/productMapping/types";

type ChannelKey = "coupang" | "naver" | "zigzag";
type ProductStatus = "unprocessed" | "skipped" | "matched";
type Tab = "unmatched" | "matched";

type UnmatchedProduct = {
  id: string; // variantRowId
  channel: ChannelKey;
  sku: string;
  name: string;
  price: string;
  status: ProductStatus;
  matchedTo?: string;
};

type Candidate = {
  id: string;
  masterProductKey: number;
  masterSku: string;
  score: number;
  name: string;
  reason: string;
  channels: ChannelKey[];
  best?: boolean;
};

const CHANNEL_META: Record<ChannelKey, { label: string; bg: string; text: string }> = {
  coupang: { label: "쿠팡", bg: "bg-orange-50", text: "text-orange-700" },
  naver: { label: "네이버", bg: "bg-emerald-50", text: "text-emerald-700" },
  zigzag: { label: "지그재그", bg: "bg-purple-50", text: "text-indigo-500" },
};

function toChannelKey(channelType: string): ChannelKey {
  const lower = channelType.toLowerCase();
  if (lower === "coupang" || lower === "naver" || lower === "zigzag") return lower;
  return "coupang"; // 알 수 없는 값 방어용 기본값
}

function toStatus(mappingStatus: ChannelProductResponse["mappingStatus"]): ProductStatus {
  if (mappingStatus === "SKIPPED") return "skipped";
  if (mappingStatus === "UNMATCHED") return "unprocessed";
  return "matched";
}

function formatPrice(price: number | null) {
  return price == null ? "-" : `${price.toLocaleString("ko-KR")}원`;
}

function toUnmatchedProduct(p: ChannelProductResponse): UnmatchedProduct {
  return {
    id: p.variantRowId,
    channel: toChannelKey(p.channelType),
    sku: p.channelProductId,
    name: p.productName,
    price: formatPrice(p.price),
    status: toStatus(p.mappingStatus),
    matchedTo: p.productGroupId ?? undefined,
  };
}

function toCandidate(c: MatchCandidateResponse): Candidate {
  return {
    id: String(c.masterProductKey),
    masterProductKey: c.masterProductKey,
    masterSku: c.productGroupId,
    score: Math.round(c.similarityScore),
    name: c.productName,
    reason: c.reason,
    channels: c.channels.map(toChannelKey),
    best: c.topRecommendation,
  };
}

function ChannelBadge({ channel }: { channel: ChannelKey }) {
  const meta = CHANNEL_META[channel];
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[13px] font-medium ${meta.bg} ${meta.text}`}>
      {meta.label}
    </span>
  );
}

// 검색창에 채널명(한글/영문)을 그대로 입력하면 상품명 검색 대신 해당 채널만 필터링한다.
const CHANNEL_SEARCH_ALIASES: Record<string, ChannelKey> = {
  "쿠팡": "coupang",
  coupang: "coupang",
  "지그재그": "zigzag",
  zigzag: "zigzag",
  "네이버": "naver",
  naver: "naver",
};

function detectChannelFilter(query: string): ChannelKey | null {
  const trimmed = query.trim().toLowerCase();
  return CHANNEL_SEARCH_ALIASES[trimmed] ?? null;
}

export default function ProductMappingPage() {
  const [tab, setTab] = useState<Tab>("unmatched");

  const [products, setProducts] = useState<UnmatchedProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  const [summary, setSummary] = useState({ unmatchedCount: 0, matchedCount: 0, totalCount: 0 });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [listQuery, setListQuery] = useState("");
  const [candidateQuery, setCandidateQuery] = useState("");

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);

  const [actionError, setActionError] = useState<string | null>(null);
  const [newGroupOpen, setNewGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupSaving, setNewGroupSaving] = useState(false);

  // 목록 + 요약 로드 (탭 바뀔 때마다 다시 조회)
  useEffect(() => {
    let ignore = false;
    setProductsLoading(true);
    setProductsError(null);

    const channelFilter = detectChannelFilter(listQuery);

    Promise.all([
      getMappings({
        matched: tab === "matched",
        keyword: channelFilter ? undefined : listQuery || undefined,
      }),
      getMappingSummary(),
    ])
      .then(([mappings, summaryRes]) => {
        if (ignore) return;
        const mapped = mappings.map(toUnmatchedProduct);
        const visible = channelFilter ? mapped.filter((p) => p.channel === channelFilter) : mapped;
        setProducts(visible);
        setSummary(summaryRes);
        if (tab === "unmatched") {
          const stillThere = visible.some((p) => p.id === selectedId);
          if (!stillThere) {
            setSelectedId(visible.length > 0 ? visible[0].id : null);
          }
        } else {
          setSelectedId(null);
        }
      })
      .catch((error) => {
        if (ignore) return;
        setProductsError(error instanceof Error ? error.message : "상품 목록을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!ignore) setProductsLoading(false);
      });

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, listQuery]);

  const selectedProduct = products.find((p) => p.id === selectedId) ?? null;

  // 후보 로드 (선택된 상품이나 검색어 바뀔 때) — AI 서버 연동 전까지는 항상 빈 배열이 온다.
  useEffect(() => {
    if (tab !== "unmatched" || !selectedProduct) {
      setCandidates([]);
      return;
    }
    let ignore = false;
    setCandidatesLoading(true);

    getCandidates(selectedProduct.id, candidateQuery || undefined)
      .then((res) => {
        if (ignore) return;
        setCandidates(res.map(toCandidate));
      })
      .catch(() => {
        if (!ignore) setCandidates([]);
      })
      .finally(() => {
        if (!ignore) setCandidatesLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [tab, selectedProduct, candidateQuery]);

  const remainingCount = summary.unmatchedCount;
  const completedCount = summary.matchedCount;
  const totalCount = summary.totalCount;
  const progressPct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const selectNext = (excludeId: string) => {
    const next = products.find((p) => p.id !== excludeId && p.status === "unprocessed");
    setSelectedId(next ? next.id : null);
  };

  const refetchAfterAction = async () => {
    const channelFilter = detectChannelFilter(listQuery);
    const [mappings, summaryRes] = await Promise.all([
      getMappings({
        matched: tab === "matched",
        keyword: channelFilter ? undefined : listQuery || undefined,
      }),
      getMappingSummary(),
    ]);
    const mapped = mappings.map(toUnmatchedProduct);
    setProducts(channelFilter ? mapped.filter((p) => p.channel === channelFilter) : mapped);
    setSummary(summaryRes);
  };

  const handleSkip = async (id: string) => {
    setActionError(null);
    try {
      await skipMapping(id);
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status: "skipped" } : p)));
      selectNext(id);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "건너뛰기에 실패했습니다.");
    }
  };

  const handleConnect = async (id: string, masterProductKey: number) => {
    setActionError(null);
    try {
      await connectMapping(id, masterProductKey);
      setCandidateQuery("");
      selectNext(id);
      await refetchAfterAction();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "연결에 실패했습니다.");
    }
  };

  const openNewGroup = () => {
    setNewGroupName("");
    setNewGroupOpen(true);
  };

  const handleCreateGroup = async () => {
    if (!selectedProduct || !newGroupName.trim()) return;
    setNewGroupSaving(true);
    setActionError(null);
    try {
      await createNewGroup(selectedProduct.id, newGroupName.trim());
      setNewGroupOpen(false);
      selectNext(selectedProduct.id);
      await refetchAfterAction();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "새 그룹 생성에 실패했습니다.");
    } finally {
      setNewGroupSaving(false);
    }
  };

  const filteredCandidates = candidates.filter(
    (c) =>
      c.masterSku.toLowerCase().includes(candidateQuery.toLowerCase()) ||
      c.name.includes(candidateQuery),
  );

  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex flex-1 flex-col bg-[#F8F8FC]">
        {/* Top bar */}
        <header className="flex h-[52px] items-center justify-between border-b border-slate-200 bg-white px-6">
          <span className="text-xs font-medium text-slate-900">상품 매핑 확인</span>
          <NotificationBell />
        </header>

        <main className="flex flex-1 flex-col gap-5 p-7">
          {/* Header row: title + tabs */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">상품 매핑 확인</h1>
            <div className="flex gap-0.5 rounded-xl bg-slate-100 p-1">
              <button
                onClick={() => setTab("unmatched")}
                className={
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold " +
                  (tab === "unmatched" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")
                }
              >
                미매칭
                <span className="rounded-full bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-bold text-indigo-500">
                  {summary.unmatchedCount}
                </span>
              </button>
              <button
                onClick={() => setTab("matched")}
                className={
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold " +
                  (tab === "matched" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")
                }
              >
                매칭됨
                <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                  {summary.matchedCount}
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-5 px-5">
            {actionError && (
              <p className="rounded-lg bg-red-50 px-4 py-2.5 text-[13px] font-medium text-red-600">
                {actionError}
              </p>
            )}

            {/* Progress card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_7px_-2px_rgba(46,60,129,0.08)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white">
                    <Package className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="text-[15px] font-bold text-slate-900">미매칭 항목 수동 연결</p>
                    <p className="pt-0.5 text-[13px] text-slate-500">
                      바코드와 판매처 SKU가 없어 자동 매칭에 실패한 상품을 직접 연결하세요.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[13px] text-slate-400">전체 진행률</p>
                  <p className="text-2xl font-bold text-indigo-500">{progressPct}%</p>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="mt-3 flex gap-4 text-[13px]">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  <span className="text-slate-500">미처리</span>
                  <span className="font-bold text-slate-900">{remainingCount}건</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  <span className="text-slate-500">완료</span>
                  <span className="font-bold text-slate-900">{completedCount}건</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                  <span className="text-slate-500">전체</span>
                  <span className="font-bold text-slate-900">{totalCount}건</span>
                </span>
              </div>
            </div>

            <div className="flex flex-1 gap-4">
              {/* Left: product list (미매칭 or 매칭됨, 탭에 따라) */}
              <div className="flex w-[374px] shrink-0 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_7px_-2px_rgba(46,60,129,0.08)]">
                <div className="flex items-center justify-between">
                  <h2 className="text-[15px] font-bold text-slate-900">
                    {tab === "unmatched" ? "미매칭 상품 목록" : "매칭 완료 상품 목록"}
                  </h2>
                  <span className="rounded-full bg-indigo-500/[0.08] px-2 py-0.5 text-[11px] font-semibold text-indigo-500">
                    {products.length}건
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <Search className="h-3.5 w-3.5 text-slate-400" />
                  <input
                    value={listQuery}
                    onChange={(e) => setListQuery(e.target.value)}
                    placeholder="상품명, SKU 또는 채널명 검색"
                    className="w-full bg-transparent text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
                <div className="flex max-h-[616px] flex-col gap-1.5 overflow-y-auto">
                  {productsLoading && (
                    <p className="py-8 text-center text-[12px] text-slate-400">불러오는 중...</p>
                  )}
                  {!productsLoading && productsError && (
                    <p className="py-8 text-center text-[12px] text-red-500">{productsError}</p>
                  )}
                  {!productsLoading && !productsError && products.length === 0 && (
                    <p className="py-8 text-center text-[12px] text-slate-400">
                      검색 결과가 없습니다.
                    </p>
                  )}
                  {!productsLoading &&
                    !productsError &&
                    products.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => tab === "unmatched" && setSelectedId(p.id)}
                        className={
                          "rounded-lg p-3 text-left transition-colors " +
                          (p.id === selectedId
                            ? "border border-indigo-500 bg-indigo-500/[0.04] ring-2 ring-indigo-500/15"
                            : "border border-slate-200 bg-white hover:bg-slate-50")
                        }
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-1.5">
                            <ChannelBadge channel={p.channel} />
                            <span className="font-mono text-[11px] text-slate-400">{p.sku}</span>
                          </div>
                          <span
                            className={
                              "rounded-full px-2 py-0.5 text-[11px] font-semibold " +
                              (p.status === "skipped"
                                ? "bg-slate-100 text-slate-500"
                                : p.status === "matched"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-indigo-500/[0.08] text-indigo-500")
                            }
                          >
                            {p.status === "skipped" ? "건너뜀" : p.status === "matched" ? "매칭됨" : "미처리"}
                          </span>
                        </div>
                        <p className="pt-1.5 text-[13px] font-medium text-slate-900">{p.name}</p>
                        <p className="pt-1 text-[12px] text-slate-400">{p.price}</p>
                        {tab === "matched" && p.matchedTo && (
                          <p className="pt-1 font-mono text-[11px] text-indigo-500">→ {p.matchedTo}</p>
                        )}
                      </button>
                    ))}
                </div>
              </div>

              {/* Right column: detail + candidates (미매칭 탭에서만) */}
              {tab === "matched" ? (
                <div className="flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[13px] text-slate-400">
                  왼쪽 목록에서 매칭 완료된 상품을 확인하세요.
                </div>
              ) : (
                <div className="flex flex-1 flex-col gap-3">
                  {!selectedProduct ? (
                    <div className="flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[13px] text-slate-400">
                      미매칭 상품이 모두 처리됐어요. 왼쪽 목록에서 다른 항목을 선택해주세요.
                    </div>
                  ) : (
                    <>
                      {/* Selected product detail */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_7px_-2px_rgba(46,60,129,0.08)]">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex flex-1 flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                선택된 미매칭 상품
                              </span>
                              <span className="rounded-full bg-indigo-500/[0.08] px-2 py-0.5 text-[11px] font-semibold text-indigo-500">
                                {selectedProduct.status === "skipped" ? "건너뜀" : "미처리"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ChannelBadge channel={selectedProduct.channel} />
                              <span className="font-mono text-[13px] text-slate-400">
                                {selectedProduct.sku}
                              </span>
                            </div>
                            <p className="text-[17px] font-bold text-slate-900">{selectedProduct.name}</p>
                            <p className="text-[15px] font-medium text-slate-600">{selectedProduct.price}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSkip(selectedProduct.id)}
                              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-[13px] font-medium text-slate-500 hover:bg-slate-50"
                            >
                              <SkipForward className="h-3.5 w-3.5" />
                              건너뜀
                            </button>
                            <button
                              onClick={openNewGroup}
                              className="flex items-center gap-1.5 rounded-lg border border-indigo-500 px-3.5 py-2 text-[13px] font-medium text-indigo-500 hover:bg-indigo-50"
                            >
                              새 그룹 생성
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Candidates */}
                      <div className="flex flex-1 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_7px_-2px_rgba(46,60,129,0.08)]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4.5 w-4.5 text-indigo-500" />
                            <h2 className="text-[15px] font-bold text-slate-900">추천 매칭 후보</h2>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                              {candidates.length}건
                            </span>
                          </div>
                          <p className="text-[12px] text-slate-400">제목 유사도 기반으로 정렬됨</p>
                        </div>

                        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                          <Search className="h-3.5 w-3.5 text-slate-400" />
                          <input
                            value={candidateQuery}
                            onChange={(e) => setCandidateQuery(e.target.value)}
                            placeholder="그룹명 또는 마스터 SKU로 검색"
                            className="w-full bg-transparent text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
                          />
                        </div>

                        <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
                          {candidatesLoading && (
                            <p className="py-8 text-center text-[12px] text-slate-400">불러오는 중...</p>
                          )}
                          {!candidatesLoading && candidates.length === 0 && (
                            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
                              <p className="text-[13px] text-slate-400">
                                이 상품에 대한 추천 후보가 없어요.
                              </p>
                              <p className="text-[12px] text-slate-400">
                                위의 &apos;새 그룹 생성&apos;으로 새 마스터 상품을 만들 수 있어요.
                              </p>
                            </div>
                          )}
                          {!candidatesLoading &&
                            filteredCandidates.map((c) => (
                              <div
                                key={c.id}
                                className={
                                  "rounded-xl p-4 " +
                                  (c.best
                                    ? "border border-indigo-500/30 bg-indigo-500/[0.03]"
                                    : "border border-slate-200 bg-white")
                                }
                              >
                                {c.best && (
                                  <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-indigo-500">
                                    <Sparkles className="h-3 w-3" />
                                    최고 추천
                                  </div>
                                )}
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex flex-1 flex-col gap-1.5">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-[12px] text-indigo-500">
                                        {c.masterSku}
                                      </span>
                                      <span
                                        className={
                                          "flex items-center gap-1 rounded-full px-2 py-0.5 text-[13px] font-semibold " +
                                          (c.score >= 90
                                            ? "bg-emerald-50 text-emerald-700"
                                            : c.score >= 75
                                              ? "bg-amber-50 text-amber-700"
                                              : "bg-slate-100 text-slate-500")
                                        }
                                      >
                                        {c.score}%
                                      </span>
                                    </div>
                                    <p className="text-[15px] font-medium text-slate-900">{c.name}</p>
                                    <p className="text-[12px] text-slate-400">{c.reason}</p>
                                    <div className="flex gap-1">
                                      {c.channels.map((ch) => (
                                        <ChannelBadge key={ch} channel={ch} />
                                      ))}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleConnect(selectedProduct.id, c.masterProductKey)}
                                    className={
                                      "flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-bold " +
                                      (c.best
                                        ? "bg-indigo-500 text-white hover:bg-indigo-600"
                                        : "border border-indigo-500 text-indigo-500 hover:bg-indigo-50")
                                    }
                                  >
                                    연결
                                    <ArrowRight className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <div className="flex flex-col items-center gap-3 border-t border-[#E5E7EB] px-6 py-8 text-center">
          <div className="flex items-center gap-5">
            <Link href="/terms" className="text-[10px] text-[#99A1AF] hover:text-slate-500">
              서비스 이용약관
            </Link>
            <Link href="/privacy" className="text-[10px] text-[#99A1AF] hover:text-slate-500">
              개인정보처리방침
            </Link>
            <Link href="/faq" className="text-[10px] text-[#99A1AF] hover:text-slate-500">
              고객센터
            </Link>
          </div>
          <p className="text-[9px] text-[#99A1AF]">© 2026 SELLoN Inc. All rights reserved.</p>
        </div>
      </div>

      {/* New group modal — 실제 API가 productName을 요구해서 최소한으로 추가한 입력창 */}
      {newGroupOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setNewGroupOpen(false)}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4">
              <p className="text-sm font-bold text-slate-900">새 마스터 상품 그룹 생성</p>
              <button onClick={() => setNewGroupOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="pb-3 text-[12px] text-slate-500">
              이 상품을 새로운 마스터 상품으로 등록합니다. 상품명을 입력해주세요.
            </p>
            <input
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="예: 무선 블루투스 이어폰 ANC Pro"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              disabled={newGroupSaving || !newGroupName.trim()}
              onClick={handleCreateGroup}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-500 py-2.5 text-sm font-bold text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" />
              {newGroupSaving ? "생성 중..." : "그룹 생성하고 연결"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
