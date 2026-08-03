"use client";

import { AlertTriangle } from "lucide-react";

type ErrorStateProps = {
  title: string;
  description: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  retryLabel?: string;
  goHomeLabel?: string;
  /** 제목이 길어지는 케이스(예: CS 표본 부족 안내)를 위한 폭 조절 */
  titleMaxWidth?: string; // e.g. "600px" | "760px"
  titleSize?: "lg" | "md";
};

export default function ErrorState({
  title,
  description,
  onRetry,
  onGoHome,
  retryLabel = "다시 시도",
  goHomeLabel = "홈으로 이동",
  titleMaxWidth = "600px",
  titleSize = "lg",
}: ErrorStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <div className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full bg-red-50">
        <AlertTriangle className="h-8 w-8 text-red-600" />
      </div>

      <div className="flex flex-col items-center gap-2" style={{ maxWidth: titleMaxWidth }}>
        <h2
          className={
            "font-bold text-slate-900 " +
            (titleSize === "lg" ? "text-[28px] leading-tight" : "text-[23px] leading-snug")
          }
        >
          {title}
        </h2>
        <p className="text-[13px] text-slate-500">{description}</p>
      </div>

      {(onRetry || onGoHome) && (
        <div className="flex gap-3 pt-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-[200px] rounded-xl bg-indigo-500 py-3 text-sm font-bold text-white hover:bg-indigo-600"
            >
              {retryLabel}
            </button>
          )}
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="w-[200px] rounded-xl border border-slate-200 bg-slate-100 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200"
            >
              {goHomeLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
