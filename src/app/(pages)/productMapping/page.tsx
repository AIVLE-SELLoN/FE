"use client";

import { useMemo, useState } from "react";
import { Bell, Search, Package, Check, ArrowRight, SkipForward, Sparkles } from "lucide-react";
import NotificationBell from "@/components/common/NotificationBell";

type ChannelKey = "coupang" | "naver" | "zigzag";
type ProductStatus = "unprocessed" | "skipped" | "matched";

type UnmatchedProduct = {
  id: string;
  channel: ChannelKey;
  sku: string;
  name: string;
  price: string;
  status: ProductStatus;
  matchedTo?: string;
};

type Candidate = {
  id: string;
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

const initialProducts: UnmatchedProduct[] = [
  { id: "cp-1", channel: "coupang", sku: "CP-8821944", name: "[프리미엄] 무선 블루투스 이어폰 노이즈캔슬링 ANC Pro", price: "45,900원", status: "unprocessed" },
  { id: "nv-1", channel: "naver", sku: "NV-2039021", name: "여성 캐주얼 린넨 반팔 티셔츠 루즈핏 (베이지/화이트)", price: "18,500원", status: "unprocessed" },
  { id: "zz-1", channel: "zigzag", sku: "ZZ-4410023", name: "주방용 스테인리스 진공보온 텀블러 500ml 보냉보온", price: "12,000원", status: "unprocessed" },
  { id: "zz-2", channel: "zigzag", sku: "ZZ-9920211", name: "다용도 수납 선반 벽선반 조립식 5단 철제 화이트", price: "32,000원", status: "skipped" },
  { id: "cp-2", channel: "coupang", sku: "CP-5532081", name: "유아용 기저귀 팬티형 점보팩 4단계 (13~18kg) 40매", price: "24,800원", status: "unprocessed" },
  { id: "nv-2", channel: "naver", sku: "NV-1198230", name: "노트북 파우치 13인치 방수 슬림 맥북 호환", price: "15,900원", status: "unprocessed" },
  { id: "zz-3", channel: "zigzag", sku: "ZZ-8820311", name: "반려동물 고양이 스크래쳐 카펫 원통형 대형", price: "22,000원", status: "unprocessed" },
];

// 데모용 — 실제로는 백엔드가 상품별 추천 후보를 유사도 순으로 내려줘야 해요.
// 지금은 "cp-1" 상품에만 후보 데이터를 넣어뒀고, 나머지는 후보 없음 상태를 보여줘요.
const candidatesByProduct: Record<string, Candidate[]> = {
  "cp-1": [
    {
      id: "c1",
      masterSku: "SLN-0021",
      score: 94,
      name: "블루투스 무선 이어폰 ANC 노이즈캔슬링 프리미엄",
      reason: "제목 정규화 일치 (94%)",
      channels: ["naver", "zigzag"],
      best: true,
    },
    {
      id: "c2",
      masterSku: "SLN-0034",
      score: 81,
      name: "무선 이어폰 ANC Pro 블루투스 5.3",
      reason: "키워드 유사도 (81%)",
      channels: ["zigzag"],
    },
    {
      id: "c3",
      masterSku: "SLN-0055",
      score: 67,
      name: "노이즈캔슬링 이어버드 TWS 블루투스",
      reason: "카테고리 + 키워드 (67%)",
      channels: ["coupang"],
    },
  ],
};

function ChannelBadge({ channel }: { channel: ChannelKey }) {
  const meta = CHANNEL_META[channel];
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[13px] font-medium ${meta.bg} ${meta.text}`}>
      {meta.label}
    </span>
  );
}

export default function ProductMappingPage() {
  const [products, setProducts] = useState<UnmatchedProduct[]>(initialProducts);
  const [selectedId, setSelectedId] = useState<string | null>("cp-1");
  const [listQuery, setListQuery] = useState("");
  const [candidateQuery, setCandidateQuery] = useState("");
  const [baseMatchedCount] = useState(7); // 이 화면 밖에서 이미 매칭 완료된 상품 수 (더미 기준값)

  const unmatchedList = useMemo(
    () =>
      products.filter(
        (p) =>
          p.status !== "matched" &&
          (p.name.includes(listQuery) || p.sku.toLowerCase().includes(listQuery.toLowerCase())),
      ),
    [products, listQuery],
  );

  const selectedProduct = products.find((p) => p.id === selectedId) ?? null;

  const remainingCount = products.filter((p) => p.status === "unprocessed").length;
  const completedCount = products.filter((p) => p.status === "matched").length;
  const totalCount = products.length;
  const progressPct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const candidates = selectedProduct ? candidatesByProduct[selectedProduct.id] ?? [] : [];
  const filteredCandidates = candidates.filter(
    (c) =>
      c.masterSku.toLowerCase().includes(candidateQuery.toLowerCase()) ||
      c.name.includes(candidateQuery),
  );

  const selectNext = (excludeId: string) => {
    const next = products.find((p) => p.id !== excludeId && p.status === "unprocessed");
    setSelectedId(next ? next.id : null);
  };

  const handleSkip = (id: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status: "skipped" } : p)));
    selectNext(id);
  };

  const handleConnect = (id: string, masterSku: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "matched", matchedTo: masterSku } : p)),
    );
    setCandidateQuery("");
    selectNext(id);
  };

  const handleCreateGroup = (id: string) => {
    const newSku = `SLN-${Math.floor(1000 + Math.random() * 9000)}`;
    handleConnect(id, newSku);
  };

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
              <button className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm">
                미매칭
                <span className="rounded-full bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-bold text-indigo-500">
                  {remainingCount}
                </span>
              </button>
              <button className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-slate-500">
                매칭됨
                <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                  {baseMatchedCount + completedCount}
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-5 px-5">
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
              {/* Left: unmatched product list */}
              <div className="flex w-[374px] shrink-0 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_7px_-2px_rgba(46,60,129,0.08)]">
                <div className="flex items-center justify-between">
                  <h2 className="text-[15px] font-bold text-slate-900">미매칭 상품 목록</h2>
                  <span className="rounded-full bg-indigo-500/[0.08] px-2 py-0.5 text-[11px] font-semibold text-indigo-500">
                    {remainingCount}건 남음
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <Search className="h-3.5 w-3.5 text-slate-400" />
                  <input
                    value={listQuery}
                    onChange={(e) => setListQuery(e.target.value)}
                    placeholder="상품명 또는 SKU 검색"
                    className="w-full bg-transparent text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
                <div className="flex max-h-[616px] flex-col gap-1.5 overflow-y-auto">
                  {unmatchedList.length === 0 && (
                    <p className="py-8 text-center text-[12px] text-slate-400">
                      검색 결과가 없습니다.
                    </p>
                  )}
                  {unmatchedList.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedId(p.id)}
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
                              : "bg-indigo-500/[0.08] text-indigo-500")
                          }
                        >
                          {p.status === "skipped" ? "건너뜀" : "미처리"}
                        </span>
                      </div>
                      <p className="pt-1.5 text-[13px] font-medium text-slate-900">{p.name}</p>
                      <p className="pt-1 text-[12px] text-slate-400">{p.price}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right column: detail + candidates */}
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
                            onClick={() => handleCreateGroup(selectedProduct.id)}
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
                        {candidates.length === 0 && (
                          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
                            <p className="text-[13px] text-slate-400">
                              이 상품에 대한 추천 후보가 없어요.
                            </p>
                            <p className="text-[12px] text-slate-400">
                              위의 &apos;새 그룹 생성&apos;으로 새 마스터 상품을 만들 수 있어요.
                            </p>
                          </div>
                        )}
                        {filteredCandidates.map((c) => (
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
                                onClick={() => handleConnect(selectedProduct.id, c.masterSku)}
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
            </div>
          </div>
        </main>

        {/* Footer */}
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
