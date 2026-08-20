"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronRight, Sparkles } from "lucide-react";
import NotificationBell from "@/components/common/NotificationBell";
import { useAuthStore } from "@/store/useAuthStore";
import { getAlertDetail, markAlertAsRead } from "@/app/api/alert";
import type { AlertDetailResponse } from "@/app/api/alert/types";
import { ApiError } from "@/app/api/client";

// ── 스크린샷 디자인대로 다시 짰어요. 다만 실제로 백엔드가 안 주는 정보(상품명/색상/상품 이미지,
// AI 심층 분석 요청)는 만들어내지 않고, 있는 데이터(AlertDetailResponse.alert)로만 채웠어요.
// - "AI 심층 분석" 버튼: 대응하는 백엔드 API가 없어서 비활성 처리했어요.
// - "상품 정보"의 상품명/색상/이미지: 알림 응답에 없는 필드라 뺐고, SKU(productGroupId)와
//   담당 채널만 실제 값으로 채웠어요. "상품 페이지 바로가기"도 연결할 확실한 URL이 없어 비활성입니다.

const CHANNEL_LABEL: Record<string, string> = {
  COUPANG: "쿠팡",
  NAVER: "네이버 스마트스토어",
  ZIGZAG: "지그재그",
  ALL: "전체 채널",
};

const CHANNEL_BAR_COLOR: Record<string, string> = {
  COUPANG: "#D9720B",
  NAVER: "#1F9254",
  ZIGZAG: "#9A9AA5",
  ALL: "#6366F1",
};

// 시연용 상품 썸네일: raw DB `products` 테이블에 이미지 URL 컬럼이 없어
// `public/products/{productGroupId}.png` 정적 파일로 대신한다.
const PRODUCT_PLACEHOLDER = "/products/placeholder.png";

function handleThumbnailError(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (img.src.endsWith("placeholder.png")) return; // 플레이스홀더까지 실패하면 무한 루프 방지
  img.src = PRODUCT_PLACEHOLDER;
}

function formatDate(iso: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function formatPeriod(start: string | null, end: string | null) {
  if (!start || !end) return "";
  return `${start} ~ ${end}`;
}

// 증가율: (현재율 - 이전율) / 이전율 * 100. 이전율이 0이면 delta(%p)로 대체.
function formatGrowthRate(curRate?: number | null, pastRate?: number | null, delta?: number | null) {
  if (curRate != null && pastRate != null && pastRate !== 0) {
    return `${Math.round(((curRate - pastRate) / pastRate) * 100)}%`;
  }
  if (delta != null) return `${delta >= 0 ? "+" : ""}${Math.round(delta * 100)}%p`;
  return "-";
}

export default function AlertDetailPage() {
  const params = useParams<{ id: string }>();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const [detail, setDetail] = useState<AlertDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;
    const notificationId = Number(params.id);
    if (!notificationId) return;
    let ignore = false;

    async function load() {
      setLoading(true);
      setErrorMessage(null);
      try {
        const d = await getAlertDetail(notificationId);
        if (ignore) return;
        setDetail(d);
        if (!d.isRead) {
          markAlertAsRead(notificationId).catch(() => {});
        }
      } catch (e) {
        if (!ignore) setErrorMessage(e instanceof ApiError ? e.message : "알림 상세를 불러오지 못했습니다.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [hasHydrated, params.id]);

  if (!hasHydrated) return null;

  const alert = detail?.alert;
  const aspectLabel = alert?.mainAspect ?? "이상 징후";
  const sortedChannelRates = [...(alert?.channelRates ?? [])].sort((a, b) => (b.rate ?? 0) - (a.rate ?? 0));
  const topChannel = sortedChannelRates[0];

  // 백엔드가 편중/전역 해석 문장을 sourceSignals.interpretation으로 주면 그걸 쓰고,
  // 없으면 verdict가 "편중형"일 때만 가장 비율 높은 채널로 문장을 만들어 보여줘요.
  const insightText =
    alert?.sourceSignals?.interpretation ??
    (alert?.verdict === "편중형" && topChannel
      ? `${CHANNEL_LABEL[topChannel.channel] ?? topChannel.channel} 채널에서만 ${aspectLabel} 문의 비율이 뚜렷하게 높음 → 편중형 패턴 (채널 특정 문제 가능성)`
      : null);

  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex flex-1 flex-col bg-[#F8F8FC]">
        <header className="flex h-[52px] items-center gap-1.5 border-b border-slate-200 bg-white px-6 text-xs">
          <Link href="/alert" className="text-slate-500 hover:text-slate-700">
            이상 이벤트 알림함
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="font-medium text-slate-900">알림 상세</span>
          <div className="ml-auto">
            <NotificationBell />
          </div>
        </header>

        <main className="flex flex-col gap-6 p-7">
          {loading ? (
            <p className="px-5 text-sm text-slate-400">불러오는 중...</p>
          ) : errorMessage || !detail ? (
            <div className="mx-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errorMessage ?? "알림을 찾을 수 없습니다."}
            </div>
          ) : (
            <>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">이상 감지 상세</h1>
                <p className="pt-1.5 text-sm text-slate-500">
                  {formatDate(alert?.detectedAt ?? null)} 기준 탐지된 비정상 패턴의 상세 분석 데이터입니다.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 px-5 lg:grid-cols-[1fr_360px]">
                {/* 채널별 비교 분석 */}
                <div className="flex flex-col gap-5">
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
                    <div className="border-b border-slate-100 p-6">
                      <h2 className="text-lg font-bold text-slate-900">채널별 비교 분석</h2>
                    </div>

                    <div className="flex flex-col gap-8 p-8">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                          <p className="text-[11px] font-semibold text-slate-500">이상 유형</p>
                          <p className="pt-1 text-lg font-bold text-slate-900">{aspectLabel} 문의 급증</p>
                        </div>
                        <div className="rounded-xl border border-orange-100 bg-orange-50 p-5">
                          <p className="text-[11px] font-semibold text-orange-600">증가율</p>
                          <p className="pt-1 text-xl font-bold text-orange-600">
                            {formatGrowthRate(alert?.stats?.curRate, alert?.stats?.pastRate, alert?.stats?.delta)}
                          </p>
                        </div>
                        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-5">
                          <p className="text-[11px] font-semibold text-indigo-600">탐지 신뢰도</p>
                          <p className="pt-1 text-xl font-bold text-indigo-600">
                            {alert?.detectionConfidence ?? "-"}
                          </p>
                        </div>
                      </div>

                      {sortedChannelRates.length > 0 && (
                        <div className="flex flex-col gap-4">
                          <p className="text-[15px] font-bold text-slate-900">
                            이 SKU의 채널별 {aspectLabel} 문의 비율 비교{" "}
                            <span className="text-xs font-normal text-slate-400">
                              (기간: {formatPeriod(alert?.windowStart ?? null, alert?.windowEnd ?? null)})
                            </span>
                          </p>
                          <div className="flex flex-col gap-4">
                            {sortedChannelRates.map((cr, i) => {
                              const pct = Math.round((cr.rate ?? 0) * 100);
                              const isTop = i === 0;
                              return (
                                <div key={cr.channel}>
                                  <div className="flex items-center justify-between pb-1.5 text-sm">
                                    <span className="font-medium text-slate-700">
                                      {CHANNEL_LABEL[cr.channel] ?? cr.channel}
                                    </span>
                                    <span
                                      className="font-bold"
                                      style={{ color: isTop ? "#EA580C" : "#71717A" }}
                                    >
                                      {pct}% {aspectLabel} 문의
                                    </span>
                                  </div>
                                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                      className="h-full rounded-full"
                                      style={{
                                        width: `${pct}%`,
                                        backgroundColor: isTop ? "#EA580C" : (CHANNEL_BAR_COLOR[cr.channel] ?? "#C7C7CF"),
                                        opacity: isTop ? 1 : 0.5,
                                      }}
                                    />
                                  </div>
                                  {isTop && insightText && (
                                    <p className="pt-2 text-xs text-amber-600">⚠ {insightText}</p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI 심층 분석 — 대응 API 없어서 비활성 CTA로만 유지 */}
                  <div className="flex items-center justify-between gap-6 rounded-2xl bg-indigo-500 p-6 text-white shadow-[0_10px_25px_-5px_rgba(99,102,241,0.4)]">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                        <Sparkles className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-[15px] font-bold">AI 심층 분석</p>
                        <p className="pt-1 text-[13px] text-indigo-100">
                          더 폭넓은 채널 비교가 필요하다면, AI가 전체 SKU 및 기간별 데이터를 분석하여 최적의 개선안을 제안해 드립니다.
                        </p>
                      </div>
                    </div>
                    <button
                      disabled
                      title="아직 연결된 기능이 아니에요 (백엔드 API 준비 중)"
                      className="shrink-0 cursor-not-allowed rounded-xl bg-white/90 px-4 py-2.5 text-sm font-bold text-indigo-600 opacity-70"
                    >
                      AI 분석 요청하기
                    </button>
                  </div>
                </div>

                {/* 상품 정보 */}
                <div className="flex flex-col gap-6">
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
                    <div className="border-b border-slate-100 p-6">
                      <h2 className="text-[17px] font-bold text-slate-900">상품 정보</h2>
                    </div>

                    <div className="p-6 pb-4">
                      {alert?.productGroupId ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`/products/${alert.productGroupId}.png`}
                          onError={handleThumbnailError}
                          alt={alert.productGroupId}
                          className="aspect-square w-full rounded-2xl bg-slate-100 object-cover"
                        />
                      ) : (
                        <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-slate-100 text-xs text-slate-400">
                          이미지 없음
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 px-6 pb-6">
                      <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                        <span className="text-sm text-slate-400">SKU</span>
                        <span className="text-sm font-bold text-slate-900">{alert?.productGroupId ?? "-"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">담당 채널</span>
                        <span className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: CHANNEL_BAR_COLOR[alert?.channel ?? ""] ?? "#9A9AA5" }}
                          />
                          {alert?.channel ? CHANNEL_LABEL[alert.channel] ?? alert.channel : "-"}
                        </span>
                      </div>
                      <p className="pt-1 text-[11px] leading-relaxed text-slate-400">
                        상품명·색상은 알림 데이터에 포함돼 있지 않아 표시하지 않았어요.
                      </p>
                    </div>

                    <div className="px-6 pb-6">
                      <button
                        disabled
                        title="연결된 상품 페이지가 없어요"
                        className="w-full cursor-not-allowed rounded-xl bg-slate-200 py-3 text-sm font-bold text-slate-400"
                      >
                        상품 페이지 바로가기
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <p className="text-sm font-bold text-slate-800">권장 조치</p>
                    <p className="pt-2 text-sm text-slate-600">
                      {alert?.recommendedAction ?? "권장 조치 정보가 없습니다."}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>

        <div className="flex flex-col items-center gap-3 border-t border-[#E5E7EB] px-6 py-8 text-center">
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
