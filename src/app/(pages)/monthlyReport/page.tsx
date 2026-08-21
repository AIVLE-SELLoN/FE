"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronRight, FileText, Download, AlertCircle, Eye, EyeOff } from "lucide-react";
import NotificationBell from "@/components/common/NotificationBell";
import { getMonthlyReports, getLatestReport } from "@/app/api/monthlyReport";
import {
  REPORT_STATUS_LABEL,
  isDownloadable,
  type ReportResponse,
} from "@/app/api/monthlyReport/types";
import { ApiError } from "@/app/api/client";

// ── 이 페이지는 백엔드 실제 구조에 맞춰 다시 만들었어요 ──
// 백엔드의 "월간 리포트"는 외부 AI 서비스가 한 달에 한 번, 회사 단위로(상품별 아님)
// PDF 리포트 하나를 만들어 전달하는 구조예요. GET /reports, /reports/latest, /reports/{reportId}
// 세 API 모두 PDF 메타데이터(reportId/reportMonth/status/noticeMessage/originalFileName/downloadUrl)만
// 내려주고, KPI 수치·항목별 감성 분포·채널 간 격차 분석 같은 구조화된 데이터는 없어요.
// 그래서 기존의 KPI 카드 / 감성 도넛 / 갭 분석 슬라이드 / jsPDF로 가짜 PDF 생성하던 부분은 전부 제거하고,
// 실제로 존재하는 "최신 리포트 1건 + 다운로드"와 "히스토리 목록"만 연결했어요.

function statusBadgeClass(status: ReportResponse["status"]) {
  if (status === "SUCCESS") return "bg-emerald-50 text-emerald-600";
  if (status === "HOLD_INSUFFICIENT_DATA") return "bg-amber-50 text-amber-600";
  return "bg-rose-50 text-rose-600";
}

function ReportCard({
  report,
  defaultViewerOpen = false,
}: {
  report: ReportResponse;
  defaultViewerOpen?: boolean;
}) {
  const viewable = isDownloadable(report.status) && !!report.downloadUrl;
  const [showViewer, setShowViewer] = useState(viewable && defaultViewerOpen);

  return (
    <div className="rounded-[20px] border border-slate-100 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.07)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50">
            <FileText className="h-5 w-5 text-indigo-500" />
          </span>
          <div>
            <p className="text-base font-bold text-slate-900">{report.reportMonth} 월간 리포트</p>
            <p className="text-xs text-slate-400">{report.reportId}</p>
          </div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusBadgeClass(report.status)}`}>
          {REPORT_STATUS_LABEL[report.status]}
        </span>
      </div>

      {report.noticeMessage && (
        <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {report.noticeMessage}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          {report.originalFileName ?? "생성된 파일 없음"}
        </p>
        {viewable ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowViewer((v) => !v)}
              className="flex items-center gap-1.5 rounded-xl border border-indigo-200 px-4 py-2 text-sm font-bold text-indigo-500 hover:bg-indigo-50"
            >
              {showViewer ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {showViewer ? "미리보기 닫기" : "미리보기"}
            </button>
            <a
              href={report.downloadUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-600"
            >
              <Download className="h-3.5 w-3.5" />
              PDF 다운로드
            </a>
          </div>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <AlertCircle className="h-3.5 w-3.5" />
            다운로드 불가
          </span>
        )}
      </div>

      {showViewer && viewable && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100">
          <iframe
            src={report.downloadUrl!}
            title={`${report.reportMonth} 월간 리포트 PDF`}
            className="h-[720px] w-full"
          />
        </div>
      )}
    </div>
  );
}

function MonthlyReportPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tab: "latest" | "history" = searchParams.get("tab") === "list" ? "history" : "latest";
  const setTab = (next: "latest" | "history") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next === "history" ? "list" : "report");
    router.push(`?${params.toString()}`);
  };

  const [latest, setLatest] = useState<ReportResponse | null>(null);
  const [latestLoading, setLatestLoading] = useState(true);
  const [latestError, setLatestError] = useState<string | null>(null);

  const [history, setHistory] = useState<ReportResponse[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadLatest() {
      setLatestLoading(true);
      setLatestError(null);
      try {
        const data = await getLatestReport();
        if (!ignore) setLatest(data);
      } catch (e) {
        if (!ignore) {
          // 아직 생성된 리포트가 하나도 없는 회사면 404가 날 수 있어요
          setLatestError(
            e instanceof ApiError ? e.message : "최신 리포트를 불러오지 못했습니다."
          );
        }
      } finally {
        if (!ignore) setLatestLoading(false);
      }
    }

    async function loadHistory() {
      setHistoryLoading(true);
      setHistoryError(null);
      try {
        const data = await getMonthlyReports();
        if (!ignore) setHistory(data);
      } catch (e) {
        if (!ignore) {
          setHistoryError(
            e instanceof ApiError ? e.message : "리포트 히스토리를 불러오지 못했습니다."
          );
        }
      } finally {
        if (!ignore) setHistoryLoading(false);
      }
    }

    loadLatest();
    loadHistory();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex flex-1 flex-col bg-[#F8F8FC]">
        <header className="flex h-[52px] items-center gap-1.5 border-b border-slate-200 bg-white px-6 text-xs">
          <button onClick={() => setTab("latest")} className="text-slate-400 hover:text-slate-600">
            월간 리포트
          </button>
          <ChevronRight className="h-3 w-3 text-slate-300" />
          <span className="font-medium text-slate-900">
            {tab === "history" ? "월간 리포트 히스토리" : "월간 리포트"}
          </span>
          <div className="ml-auto">
            <NotificationBell />
          </div>
        </header>

        <main className="flex flex-col gap-5 p-7">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">월간 리포트</h1>
            <p className="pt-1 text-xs text-slate-400">
              매월 자동 생성되는 회사 단위 리포트를 확인하세요
            </p>
          </div>

          <div className="flex gap-2 px-5">
            <button
              onClick={() => setTab("latest")}
              className={`rounded-xl px-4 py-2 text-sm font-bold ${
                tab === "latest" ? "bg-indigo-500 text-white" : "bg-white text-slate-500 border border-slate-200"
              }`}
            >
              최신 리포트
            </button>
            <button
              onClick={() => setTab("history")}
              className={`rounded-xl px-4 py-2 text-sm font-bold ${
                tab === "history" ? "bg-indigo-500 text-white" : "bg-white text-slate-500 border border-slate-200"
              }`}
            >
              히스토리
            </button>
          </div>

          <div className="px-5">
            {tab === "latest" ? (
              latestLoading ? (
                <p className="py-8 text-center text-sm text-slate-400">불러오는 중...</p>
              ) : latestError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {latestError}
                </div>
              ) : latest ? (
                <ReportCard report={latest} defaultViewerOpen />
              ) : (
                <p className="py-8 text-center text-sm text-slate-400">아직 생성된 리포트가 없어요.</p>
              )
            ) : historyLoading ? (
              <p className="py-8 text-center text-sm text-slate-400">불러오는 중...</p>
            ) : historyError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {historyError}
              </div>
            ) : history.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">리포트 이력이 없어요.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {history.map((r) => (
                  <ReportCard key={r.reportId} report={r} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function MonthlyReportPage() {
  return (
    <Suspense fallback={null}>
      <MonthlyReportPageContent />
    </Suspense>
  );
}
