"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, LogIn, CheckCircle2, AlertTriangle, RotateCw, ChevronDown, RotateCcw, Info } from "lucide-react";
import ChannelErrorModal from "@/components/common/ChannelErrorModal";
import NaverMockLoginModal from "@/components/common/NaverMockLoginModal";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import NotificationBell from "@/components/common/NotificationBell";
import Link from "next/link";
import {
  getChannels,
  connectChannel,
  disconnectChannel,
  naverAuthorize,
  naverCallback,
  getSyncLogs,
  pollSyncLogs,
} from "@/app/api/channel";
import type { ChannelSyncLogResponse } from "@/app/api/channel/types";

type ChannelStatus = "connected" | "disconnected" | "error";

type ApiKeyChannel = {
  id: string;
  channelType: "COUPANG" | "ZIGZAG";
  name: string;
  initial: string;
  iconBg: string;
  iconColor: string;
  desc: string;
  status: ChannelStatus;
  apiKeyValue?: string; // masked value
  errorMessage?: string;
};

const initialApiKeyChannels: ApiKeyChannel[] = [
  {
    id: "coupang",
    channelType: "COUPANG",
    name: "Coupang",
    initial: "C",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    desc: "쿠팡 Wing API 연동",
    status: "disconnected",
  },
  {
    id: "zigzag",
    channelType: "ZIGZAG",
    name: "지그재그",
    initial: "Z",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-500",
    desc: "카카오스타일 지그재그 연동",
    status: "disconnected",
  },
];

// 채널 연동 이력 화면에서 채널 표시용 아이콘/색상 매핑
const CHANNEL_DISPLAY: Record<string, { label: string; initial: string; iconBg: string; iconColor: string }> = {
  COUPANG: { label: "쿠팡", initial: "C", iconBg: "bg-orange-50", iconColor: "text-orange-500" },
  ZIGZAG: { label: "지그재그", initial: "Z", iconBg: "bg-purple-50", iconColor: "text-purple-600" },
  NAVER: { label: "스마트스토어", initial: "N", iconBg: "bg-blue-50", iconColor: "text-blue-500" },
};

const FILTERS: { label: string; value: "all" | "COUPANG" | "ZIGZAG" | "NAVER" }[] = [
  { label: "전체 채널", value: "all" },
  { label: "쿠팡", value: "COUPANG" },
  { label: "네이버", value: "NAVER" },
  { label: "지그재그", value: "ZIGZAG" },
];

const PAGE_SIZE = 5;

function formatDateTime(iso: string) {
  // "2026-08-18T09:00:00" -> "2026-08-18 09:00"
  return iso.replace("T", " ").slice(0, 16);
}

export default function ChannelPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const view = searchParams.get("view") === "history" ? "history" : "connect";

  const setView = (next: "connect" | "history") => {
    router.push(`${pathname}?view=${next}`);
  };

  const [channels, setChannels] = useState<ApiKeyChannel[]>(initialApiKeyChannels);
  const [naverStatus, setNaverStatus] = useState<ChannelStatus>("disconnected");
  const [naverErrorMessage, setNaverErrorMessage] = useState<string | null>(null);
  const [errorModalChannel, setErrorModalChannel] = useState<string | null>(null);

  const [naverModalOpen, setNaverModalOpen] = useState(false);
  const [naverLoading, setNaverLoading] = useState(false);
  const [naverState, setNaverState] = useState<string | null>(null);

  // 새로고침해도 연동 상태가 유지되도록, 페이지 진입 시 현재 연동 목록을 불러온다.
  useEffect(() => {
    let ignore = false;

    getChannels()
      .then((list) => {
        if (ignore) return;
        setChannels((prev) =>
          prev.map((c) => {
            const found = list.find((l) => l.channelType === c.channelType);
            if (!found) return c;
            return {
              ...c,
              status: found.connectionStatus === "CONNECTED" ? "connected" : "disconnected",
              apiKeyValue: found.connectionStatus === "CONNECTED" ? "•".repeat(16) : undefined,
            };
          }),
        );
        const naver = list.find((l) => l.channelType === "NAVER");
        if (naver) {
          setNaverStatus(naver.connectionStatus === "CONNECTED" ? "connected" : "disconnected");
        }
      })
      .catch(() => {
        // 목록 조회 실패는 화면을 막을 정도는 아니라서 기본값(미연결)으로 둔다.
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleConnect = async (id: string, apiKey: string) => {
    const target = channels.find((c) => c.id === id);
    if (!target) return;

    try {
      const response = await connectChannel(target.channelType, apiKey);
      setChannels((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                status: response.connectionStatus === "CONNECTED" ? "connected" : "disconnected",
                apiKeyValue: "•".repeat(Math.min(apiKey.length, 20)),
                errorMessage: undefined,
              }
            : c,
        ),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "연동에 실패했습니다.";
      setChannels((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "error", errorMessage: message } : c)),
      );
    }
  };

  const handleRetryReset = async (id: string) => {
    const target = channels.find((c) => c.id === id);
    if (!target) return;

    // 에러 상태였던 카드는 아직 백엔드에 CONNECTED로 남아있지 않을 수 있어 화면만 초기화한다.
    if (target.status === "error") {
      setChannels((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "disconnected", apiKeyValue: undefined, errorMessage: undefined } : c)),
      );
      return;
    }

    try {
      await disconnectChannel(target.channelType);
      setChannels((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "disconnected", apiKeyValue: undefined, errorMessage: undefined } : c)),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "연동 해제에 실패했습니다.";
      setChannels((prev) => prev.map((c) => (c.id === id ? { ...c, errorMessage: message } : c)));
    }
  };

  // 네이버: 1단계 - 인가 URL/state 발급 후, 실제 네이버로 이동하는 대신 목업 로그인 모달을 띄운다.
  const handleNaverStart = async () => {
    if (naverStatus === "connected") {
      try {
        await disconnectChannel("NAVER");
        setNaverStatus("disconnected");
      } catch (error) {
        setNaverErrorMessage(error instanceof Error ? error.message : "연동 해제에 실패했습니다.");
      }
      return;
    }
    setNaverErrorMessage(null);
    try {
      const { state } = await naverAuthorize();
      setNaverState(state);
      setNaverModalOpen(true);
    } catch (error) {
      setNaverErrorMessage(error instanceof Error ? error.message : "네이버 연동 요청에 실패했습니다.");
    }
  };

  // 네이버: 2단계 - 모달에서 "로그인" 누르면 콜백 호출
  const handleNaverConfirm = async () => {
    if (!naverState) return;
    setNaverLoading(true);
    try {
      const mockCode = `mock-${Date.now()}`;
      await naverCallback(mockCode, naverState);
      setNaverStatus("connected");
      setNaverModalOpen(false);
    } catch (error) {
      setNaverErrorMessage(error instanceof Error ? error.message : "네이버 연동에 실패했습니다.");
      setNaverModalOpen(false);
    } finally {
      setNaverLoading(false);
      setNaverState(null);
    }
  };

  // ---- 채널 연동 이력 (동기화 로그) ----
  const [logs, setLogs] = useState<ChannelSyncLogResponse[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "COUPANG" | "ZIGZAG" | "NAVER">("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1); // 화면 표시는 1-based
  const [totalPages, setTotalPages] = useState(1);
  const [pollingChannel, setPollingChannel] = useState<string | null>(null); // 지금 재확인 중인 채널

  useEffect(() => {
    if (view !== "history") return;

    let ignore = false;
    setLogsLoading(true);
    setLogsError(null);

    getSyncLogs({
      channelType: filter === "all" ? undefined : filter,
      page: page - 1,
      size: PAGE_SIZE,
    })
      .then((res) => {
        if (ignore) return;
        setLogs(res.content);
        setTotalPages(Math.max(1, res.totalPages));
      })
      .catch((error) => {
        if (ignore) return;
        setLogsError(error instanceof Error ? error.message : "동기화 이력을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!ignore) setLogsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [view, filter, page]);

  const handleFilterSelect = (value: "all" | "COUPANG" | "ZIGZAG" | "NAVER") => {
    setFilter(value);
    setFilterOpen(false);
    setPage(1);
  };

  // 개별 로그 재시도가 아니라, 해당 로그의 채널을 지금 다시 폴링하고 목록을 새로고침한다.
  const handleRetry = async (channelType: string) => {
    setPollingChannel(channelType);
    try {
      await pollSyncLogs(channelType as "COUPANG" | "ZIGZAG" | "NAVER");
      const res = await getSyncLogs({
        channelType: filter === "all" ? undefined : filter,
        page: page - 1,
        size: PAGE_SIZE,
      });
      setLogs(res.content);
      setTotalPages(Math.max(1, res.totalPages));
    } catch (error) {
      setLogsError(error instanceof Error ? error.message : "재확인에 실패했습니다.");
    } finally {
      setPollingChannel(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex flex-1 flex-col bg-[#F8F8FC]">
        <header className="flex h-[52px] items-center justify-between border-b border-slate-200 bg-white px-6">
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setView("connect")}
              className="text-slate-500 hover:text-slate-700"
            >
              채널 연동 관리
            </button>
            <span className="text-slate-300">{'>'}</span>
            <span className="font-medium text-slate-900">
              {view === "history" ? "채널 연동 이력" : "채널 연동"}
            </span>
          </div>
          <NotificationBell />
        </header>

        {view === "connect" ? (
          <main className="flex flex-1 flex-col gap-5 p-7">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">채널 연동</h1>
            <p className="pt-1.5 text-[15px] text-slate-500">
              판매 채널을 연결하여 주문과 재고를 한 곳에서 효율적으로 관리하세요.
            </p>
          </div>

          <div className="flex flex-col gap-5 px-5">
            {/* Channel cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Coupang */}
              <ChannelCard
                channel={channels[0]}
                onConnect={(apiKey) => handleConnect(channels[0].id, apiKey)}
                onRetry={() => setErrorModalChannel(channels[0].name)}
                onResetAfterError={() => handleRetryReset(channels[0].id)}
              />

              {/* Naver — mock OAuth flow */}
              <div className="relative flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_-1px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.1)]">
                <div className="flex items-start justify-between pb-6">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl font-black text-emerald-500">
                    N
                  </span>
                  <StatusBadge status={naverStatus} />
                </div>
                <div className="pb-8">
                  <h3 className="text-lg font-bold text-slate-900">Naver</h3>
                  <p className="pt-1 text-[13px] text-slate-500">네이버 스마트스토어 연동</p>
                </div>

                <div className="flex flex-1 flex-col gap-4">
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <div className="flex items-center gap-2 pb-2">
                      <LogIn className="h-3.5 w-3.5 text-blue-700" />
                      <span className="text-sm font-bold text-blue-700">간편 연결 지원</span>
                    </div>
                    <p className="text-xs leading-relaxed text-blue-600">
                      네이버 계정으로 로그인하여 스마트스토어와 연동합니다. API 키 없이 안전하게
                      연결됩니다.
                    </p>
                  </div>
                  <ul className="flex flex-col gap-2.5 text-[13px] text-slate-600">
                    <li className="flex items-center gap-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      별도 API 키 발급 불필요
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      OAuth 2.0 보안 인증
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      언제든 연동 해제 가능
                    </li>
                  </ul>
                  {naverErrorMessage && (
                    <p className="text-[12px] font-medium text-red-500">{naverErrorMessage}</p>
                  )}
                </div>

                <button
                  onClick={handleNaverStart}
                  className={
                    naverStatus === "disconnected"
                      ? "mt-8 flex items-center justify-center gap-2 rounded-xl bg-indigo-500 py-3.5 text-sm font-bold text-white hover:bg-indigo-600"
                      : "mt-8 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  }
                >
                  {naverStatus === "disconnected" ? "네이버로 로그인하여 연결" : "연동 해제"}
                </button>
              </div>

              {/* Zigzag */}
              <ChannelCard
                channel={channels[1]}
                onConnect={(apiKey) => handleConnect(channels[1].id, apiKey)}
                onRetry={() => setErrorModalChannel(channels[1].name)}
                onResetAfterError={() => handleRetryReset(channels[1].id)}
              />
            </div>

            {/* Promo banner */}
            <div className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-500 to-indigo-600 p-6 sm:flex-row sm:items-center">
              <div className="flex max-w-md flex-col gap-2.5">
                <p className="text-lg font-bold text-white">연동할 채널이 더 필요하신가요?</p>
                <p className="text-[13px] leading-relaxed text-indigo-100">
                  현재 12개 이상의 커머스 채널 연동을 준비 중입니다. 원하는 채널이 있다면
                  고객센터로 제안해 주세요.
                </p>
                <Link
                  href="/cs?view=inquiry"
                  className="mt-1 self-start rounded-lg bg-white px-5 py-2.5 text-[13px] font-bold text-indigo-900"
                >
                  채널 추가 요청하기
                </Link>
              </div>
              <div className="flex gap-3 opacity-40">
                {["W", "A", "S"].map((letter) => (
                  <span
                    key={letter}
                    className="flex h-[50px] w-[50px] items-center justify-center rounded-2xl bg-white/20 text-lg font-bold text-white"
                  >
                    {letter}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </main>
        ) : (
          <main className="flex flex-1 flex-col gap-5 p-7">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">연동 이력 · 로그</h1>
            <p className="pt-1 text-[12px] text-slate-500">
              각 채널별 API 동기화 상태와 상세 내역을 확인할 수 있습니다.
            </p>
          </div>

          <div className="flex flex-col gap-5 px-5">
            {/* History table card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_-1px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.1)]">
              <div className="flex items-center justify-between border-b border-slate-50 px-6 py-5">
                <h2 className="text-sm font-bold text-slate-900">채널 API 동기화 이력</h2>
                <div className="relative">
                  <button
                    onClick={() => setFilterOpen((v) => !v)}
                    className="flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {FILTERS.find((f) => f.value === filter)?.label}
                    <ChevronDown className="h-2.5 w-2.5 text-slate-400" />
                  </button>
                  {filterOpen && (
                    <div className="absolute right-0 top-full z-10 mt-1 w-32 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                      {FILTERS.map((f) => (
                        <button
                          key={f.value}
                          onClick={() => handleFilterSelect(f.value)}
                          className={
                            "block w-full px-3 py-2 text-left text-[11px] hover:bg-slate-50 " +
                            (filter === f.value ? "font-bold text-indigo-600" : "text-slate-700")
                          }
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Table header */}
              <div className="flex bg-slate-50/50 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                <div className="w-[220px] shrink-0 px-6 py-3">채널</div>
                <div className="w-[175px] shrink-0 px-6 py-3">일시</div>
                <div className="w-[130px] shrink-0 px-6 py-3">상태</div>
                <div className="flex-1 px-6 py-3">상세</div>
              </div>

              {/* Table rows */}
              <div>
                {logsLoading && (
                  <div className="px-6 py-10 text-center text-[12px] text-slate-400">불러오는 중...</div>
                )}
                {!logsLoading && logsError && (
                  <div className="px-6 py-10 text-center text-[12px] text-red-500">{logsError}</div>
                )}
                {!logsLoading && !logsError && logs.length === 0 && (
                  <div className="px-6 py-10 text-center text-[12px] text-slate-400">
                    해당 채널의 동기화 이력이 없습니다.
                  </div>
                )}
                {!logsLoading &&
                  !logsError &&
                  logs.map((log) => {
                    const display = CHANNEL_DISPLAY[log.channelType] ?? {
                      label: log.channelType,
                      initial: log.channelType.charAt(0),
                      iconBg: "bg-slate-50",
                      iconColor: "text-slate-500",
                    };
                    const isFailed = log.status === "FAILED";
                    const detail = isFailed
                      ? log.failReason ?? "동기화에 실패했습니다."
                      : `신규 ${log.syncedCount ?? 0}건 반영 완료`;

                    return (
                      <div
                        key={log.syncLogKey}
                        className={
                          "flex items-center border-b border-slate-100 px-6 last:border-b-0 " +
                          (isFailed ? "bg-red-50/40" : "")
                        }
                      >
                        <div className="flex w-[220px] shrink-0 items-center gap-2.5 py-4">
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-md ${display.iconBg} text-xs font-bold ${display.iconColor}`}
                          >
                            {display.initial}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-900">
                            {display.label} 동기화
                          </span>
                        </div>
                        <div className="w-[175px] shrink-0 py-4 text-[11px] text-slate-500">
                          {formatDateTime(log.syncedAt)}
                        </div>
                        <div className="w-[130px] shrink-0 py-4">
                          {log.status === "SUCCESS" ? (
                            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-600">
                              성공
                            </span>
                          ) : (
                            <span className="rounded-full bg-red-50 px-2 py-1 text-[9px] font-bold text-red-600">
                              실패
                            </span>
                          )}
                        </div>
                        <div className="flex flex-1 items-center justify-between gap-3 py-4">
                          <span className={"text-[11px] " + (isFailed ? "text-red-600" : "text-slate-600")}>
                            {detail}
                          </span>
                          {isFailed && (
                            <button
                              onClick={() => handleRetry(log.channelType)}
                              disabled={pollingChannel === log.channelType}
                              className="flex shrink-0 items-center gap-1 rounded border border-indigo-500 px-2.5 py-1 text-[9px] font-bold text-indigo-500 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <RotateCcw className="h-2.5 w-2.5" />
                              {pollingChannel === log.channelType ? "확인 중..." : "다시 시도"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-1.5 border-t border-slate-100 py-5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={
                      "flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-medium " +
                      (p === page
                        ? "bg-indigo-500 font-bold text-white"
                        : "text-slate-600 hover:bg-slate-50")
                    }
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ›
                </button>
              </div>
            </div>

            {/* Info box */}
            <div className="flex items-start gap-3 rounded-xl bg-[#F0F4FF] p-5">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-indigo-500" />
              <div>
                <p className="text-sm font-bold text-slate-900">동기화 안내</p>
                <p className="pt-1 text-[13px] leading-relaxed text-slate-600">
                  API 연동은 매일 정해진 시간에 자동으로 진행됩니다. 실패 이력이 발생할 경우
                  &apos;다시 시도&apos; 버튼을 통해 수동으로 동기화를 진행할 수 있습니다. 지속적인
                  실패가 발생할 경우 해당 채널의 API 키 또는 인증 정보를 다시 확인해 주세요.
                </p>
              </div>
            </div>
          </div>
        </main>
        )}

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

      <ChannelErrorModal
        open={errorModalChannel !== null}
        reason="인증 오류 / 권한 부족"
        description={
          channels.find((c) => c.name === errorModalChannel)?.errorMessage ??
          "입력하신 API 키의 인증 정보가 유효하지 않거나 권한이 부족하여 연결에 실패했습니다."
        }
        onRetry={() => {
          const target = channels.find((c) => c.name === errorModalChannel);
          if (target) handleRetryReset(target.id);
          setErrorModalChannel(null);
        }}
        onClose={() => setErrorModalChannel(null)}
        onContact={() => {
          router.push("/cs?view=inquiry");
          setErrorModalChannel(null);
        }}
      />

      <NaverMockLoginModal
        open={naverModalOpen}
        loading={naverLoading}
        onConfirm={handleNaverConfirm}
        onClose={() => {
          setNaverModalOpen(false);
          setNaverState(null);
        }}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: ChannelStatus }) {
  if (status === "connected") {
    return (
      <span className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-600">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        연결됨
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-red-600">
        <AlertTriangle className="h-2.5 w-2.5" />
        연결 오류
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      미연결
    </span>
  );
}

function ChannelCard({
  channel,
  onConnect,
  onRetry,
  onResetAfterError,
}: {
  channel: ApiKeyChannel;
  onConnect: (apiKey: string) => void;
  onRetry?: () => void;
  onResetAfterError?: () => void;
}) {
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [revealKey, setRevealKey] = useState(false);

  const isError = channel.status === "error";
  const isConnected = channel.status === "connected";

  return (
    <div
      className={
        "flex flex-col rounded-3xl border bg-white p-6 shadow-[0_1px_2px_-1px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.1)] " +
        (isError ? "border-red-100" : "border-slate-200")
      }
    >
      <div className="flex items-start justify-between pb-6">
        <span
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${channel.iconBg} text-2xl font-black ${channel.iconColor}`}
        >
          {channel.initial}
        </span>
        <StatusBadge status={channel.status} />
      </div>
      <div className="pb-8">
        <h3 className="text-lg font-bold text-slate-900">{channel.name}</h3>
        <p className="pt-1 text-[13px] text-slate-500">{channel.desc}</p>
      </div>

      <div className="flex flex-1 flex-col gap-4">
        {channel.status === "disconnected" ? (
          <div className="flex flex-col gap-2">
            <label htmlFor={`${channel.id}-api-key`} className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              API 키
            </label>
            <div className="relative">
              <input
                id={`${channel.id}-api-key`}
                type={revealKey ? "text" : "password"}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={
                  channel.channelType === "COUPANG"
                    ? "cp_live_로 시작하는 API 키를 입력해주세요."
                    : "zg_live_로 시작하는 API 키를 입력해주세요."
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-14 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {apiKeyInput.length > 0 && (
                <button
                  type="button"
                  onClick={() => setRevealKey((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-indigo-600"
                >
                  {revealKey ? "숨기기" : "보기"}
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <p
                className={
                  "text-[11px] font-bold uppercase tracking-wide " +
                  (isError ? "text-red-400" : "text-slate-400")
                }
              >
                API 키
              </p>
              <div className="relative">
                <div
                  className={
                    "rounded-xl border px-4 py-3 " +
                    (isError
                      ? "border-red-200 bg-red-50/30 text-red-900"
                      : "border-slate-200 bg-slate-50 text-slate-900")
                  }
                >
                  <p className="text-[13px]">
                    {isError ? channel.errorMessage : revealKey ? apiKeyInput || channel.apiKeyValue : channel.apiKeyValue}
                  </p>
                </div>
                {!isError && (
                  <button
                    onClick={() => setRevealKey((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-indigo-600"
                  >
                    {revealKey ? "숨기기" : "보기"}
                  </button>
                )}
              </div>
            </div>

            {isConnected && (
              <div className="flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <p className="text-[13px] leading-relaxed text-emerald-800">
                  연결이 성공적으로 완료되었습니다.
                  <br />
                  실시간으로 데이터를 수집 중입니다.
                </p>
              </div>
            )}

            {isError && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-4">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <p className="text-[13px] leading-relaxed text-red-700">
                  {channel.errorMessage ?? "인증 오류가 발생했습니다. API 키가 만료되었거나 잘못되었습니다. 다시 확인해주세요."}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <button
        disabled={channel.status === "disconnected" && apiKeyInput.trim().length === 0}
        onClick={() => {
          if (channel.status === "disconnected") {
            onConnect(apiKeyInput.trim());
          } else if (isError) {
            onRetry?.();
          } else {
            onResetAfterError?.();
          }
        }}
        className={
          "mt-8 flex items-center justify-center gap-2 rounded-xl border py-3.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40 " +
          (channel.status === "disconnected"
            ? "border-slate-200 bg-indigo-500 text-white hover:bg-indigo-600"
            : isError
              ? "border-red-200 bg-white text-red-600 hover:bg-red-50"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50")
        }
      >
        {channel.status === "disconnected" && <Plus className="h-3.5 w-3.5" />}
        {isError && <RotateCw className="h-3.5 w-3.5" />}
        {channel.status === "disconnected"
          ? "채널 연동하기"
          : isError
            ? "다시 연결"
            : "재연동"}
      </button>
    </div>
  );
}
