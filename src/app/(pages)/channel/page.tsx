"use client";

import { useMemo, useState } from "react";
import { Plus, LogIn, CheckCircle2, AlertTriangle, RotateCw, ChevronDown, RotateCcw, Info } from "lucide-react";
import ChannelErrorModal from "@/components/common/ChannelErrorModal";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import NotificationBell from "@/components/common/NotificationBell";
import Link from "next/link";

type ChannelStatus = "connected" | "disconnected" | "error";

type ApiKeyChannel = {
  id: string;
  name: string;
  initial: string;
  iconBg: string;
  iconColor: string;
  desc: string;
  status: ChannelStatus;
  apiKeyValue?: string; // masked value or error code
};

const initialApiKeyChannels: ApiKeyChannel[] = [
  {
    id: "coupang",
    name: "Coupang",
    initial: "C",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    desc: "쿠팡 Wing API 연동",
    status: "disconnected",
  },
  {
    id: "zigzag",
    name: "지그재그",
    initial: "Z",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-500",
    desc: "카카오스타일 지그재그 연동",
    status: "disconnected",
  },
];

type SyncStatus = "success" | "failed";

type SyncLog = {
  id: string;
  channel: string;
  channelFilter: "coupang" | "zigzag" | "naver";
  initial: string;
  iconBg: string;
  iconColor: string;
  datetime: string;
  status: SyncStatus;
  detail: string;
};

const initialSyncLogs: SyncLog[] = [
  { id: "log-1", channel: "쿠팡 동기화", channelFilter: "coupang", initial: "C", iconBg: "bg-orange-50", iconColor: "text-orange-500", datetime: "2026-07-07 09:00", status: "success", detail: "상품 1,284건 반영 완료" },
  { id: "log-2", channel: "지그재그 동기화", channelFilter: "zigzag", initial: "Z", iconBg: "bg-purple-50", iconColor: "text-purple-600", datetime: "2026-07-06 21:00", status: "failed", detail: "인증 정보가 만료되어 동기화에 실패했습니다." },
  { id: "log-3", channel: "스마트스토어 동기화", channelFilter: "naver", initial: "N", iconBg: "bg-blue-50", iconColor: "text-blue-500", datetime: "2026-07-06 18:30", status: "success", detail: "상품 852건 반영 완료" },
  { id: "log-4", channel: "쿠팡 동기화", channelFilter: "coupang", initial: "C", iconBg: "bg-orange-50", iconColor: "text-orange-500", datetime: "2026-07-06 09:00", status: "success", detail: "상품 1,280건 반영 완료" },
  { id: "log-5", channel: "지그재그 동기화", channelFilter: "zigzag", initial: "Z", iconBg: "bg-purple-50", iconColor: "text-purple-600", datetime: "2026-07-05 23:15", status: "success", detail: "상품 432건 반영 완료" },
];

const FILTERS: { label: string; value: SyncLog["channelFilter"] | "all" }[] = [
  { label: "전체 채널", value: "all" },
  { label: "쿠팡", value: "coupang" },
  { label: "네이버", value: "naver" },
  { label: "지그재그", value: "zigzag" },
];

const PAGE_SIZE = 2;

export default function ChannelPage() {
  // URL은 안 바뀌고 이 상태값으로만 "채널 연동" ↔ "채널 연동 이력" 화면을 전환해요.
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const view = searchParams.get("view") === "history" ? "history" : "connect";

  const setView = (next: "connect" | "history") => {
    router.push(`${pathname}?view=${next}`);
  };

  const [channels, setChannels] = useState<ApiKeyChannel[]>(initialApiKeyChannels);
  const [naverStatus, setNaverStatus] = useState<ChannelStatus>("disconnected");
  const [errorModalChannel, setErrorModalChannel] = useState<string | null>(null);

  const handleConnect = (id: string, apiKey: string) => {
    // TODO: 백엔드 채널 연결 API 붙으면 이 부분을 실제 fetch 호출로 교체
    // 지금은 프론트 단에서만 "입력한 키로 연동 시도" 흐름을 보여주는 자리표시자예요.
    //
    // 테스트용 실패 트리거: API 키에 "FAIL"이라고 입력하면 연결 실패(error 상태)로 처리돼요.
    // 백엔드 API 붙으면 이 분기는 지우고 실제 응답의 성공/실패 여부로 바꾸면 됩니다.
    const isMockFailure = apiKey.trim().toUpperCase() === "FAIL";

    setChannels((prev) =>
      prev.map((c) =>
        c.id === id
          ? isMockFailure
            ? { ...c, status: "error", apiKeyValue: "인증 실패" }
            : { ...c, status: "connected", apiKeyValue: "•".repeat(Math.min(apiKey.length, 20)) }
          : c,
      ),
    );
  };

  const handleRetryReset = (id: string) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "disconnected", apiKeyValue: undefined } : c)),
    );
  };

  const [logs, setLogs] = useState<SyncLog[]>(initialSyncLogs);
  const [filter, setFilter] = useState<SyncLog["channelFilter"] | "all">("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);

  const filteredLogs = useMemo(
    () => (filter === "all" ? logs : logs.filter((log) => log.channelFilter === filter)),
    [logs, filter],
  );

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedLogs = filteredLogs.slice(
    (currentPage - 1) * PAGE_SIZE,
    (currentPage - 1) * PAGE_SIZE + PAGE_SIZE,
  );

  const handleFilterSelect = (value: SyncLog["channelFilter"] | "all") => {
    setFilter(value);
    setFilterOpen(false);
    setPage(1);
  };

  const handleRetry = (id: string) => {
    // TODO: 백엔드 재동기화 API 붙으면 실제 fetch 호출로 교체
    setLogs((prev) =>
      prev.map((log) =>
        log.id === id
          ? { ...log, status: "success", detail: "재시도로 동기화가 완료되었습니다." }
          : log,
      ),
    );
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

              {/* Naver — OAuth flow */}
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
                </div>

                <button
                  onClick={() => {
                    // TODO: 실제로는 네이버 OAuth 인가 URL로 리다이렉트
                    setNaverStatus((s) => (s === "disconnected" ? "connected" : "disconnected"));
                  }}
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
                {pagedLogs.length === 0 && (
                  <div className="px-6 py-10 text-center text-[12px] text-slate-400">
                    해당 채널의 동기화 이력이 없습니다.
                  </div>
                )}
                {pagedLogs.map((log) => (
                  <div
                    key={log.id}
                    className={
                      "flex items-center border-b border-slate-100 px-6 last:border-b-0 " +
                      (log.status === "failed" ? "bg-red-50/40" : "")
                    }
                  >
                    <div className="flex w-[220px] shrink-0 items-center gap-2.5 py-4">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-md ${log.iconBg} text-xs font-bold ${log.iconColor}`}
                      >
                        {log.initial}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-900">{log.channel}</span>
                    </div>
                    <div className="w-[175px] shrink-0 py-4 text-[11px] text-slate-500">
                      {log.datetime}
                    </div>
                    <div className="w-[130px] shrink-0 py-4">
                      {log.status === "success" ? (
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
                      <span
                        className={
                          "text-[11px] " + (log.status === "failed" ? "text-red-600" : "text-slate-600")
                        }
                      >
                        {log.detail}
                      </span>
                      {log.status === "failed" && (
                        <button
                          onClick={() => handleRetry(log.id)}
                          className="flex shrink-0 items-center gap-1 rounded border border-indigo-500 px-2.5 py-1 text-[9px] font-bold text-indigo-500 hover:bg-indigo-50"
                        >
                          <RotateCcw className="h-2.5 w-2.5" />
                          다시 시도
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-1.5 border-t border-slate-100 py-5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
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
                      (p === currentPage
                        ? "bg-indigo-500 font-bold text-white"
                        : "text-slate-600 hover:bg-slate-50")
                    }
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
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
            <span className="text-[10px] text-[#99A1AF]">서비스 이용약관</span>
            <span className="text-[10px] font-bold text-[#99A1AF]">개인정보처리방침</span>
            <span className="text-[10px] text-[#99A1AF]">고객센터</span>
          </div>
          <p className="text-[9px] text-[#99A1AF]">© 2026 SELLoN Inc. All rights reserved.</p>
        </div>
      </div>

      <ChannelErrorModal
        open={errorModalChannel !== null}
        reason="인증 오류 / 권한 부족"
        description="입력하신 API 키의 인증 정보가 유효하지 않거나 권한이 부족하여 연결에 실패했습니다."
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
                placeholder="API 키를 입력해주세요."
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
                    {revealKey ? apiKeyInput || channel.apiKeyValue : channel.apiKeyValue}
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
                  인증 오류가 발생했습니다. API 키가 만료되었거나 잘못되었습니다. 다시
                  확인해주세요.
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
