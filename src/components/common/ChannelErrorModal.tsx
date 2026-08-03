"use client";

import { AlertTriangle } from "lucide-react";

export default function ChannelErrorModal({
  open,
  reason,
  description,
  onRetry,
  onClose,
  onContact,
}: {
  open: boolean;
  reason: string;
  description: string;
  onRetry: () => void;
  onClose: () => void;
  onContact?: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[520px] overflow-hidden rounded-3xl bg-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Illustration */}
        <div className="relative flex h-[228px] items-center justify-center bg-[#FFF5F5]">
          <div className="absolute h-[163px] w-[163px] rounded-full bg-[#FFE4E4] opacity-60" />
          <div className="absolute h-[122px] w-[122px] rounded-full bg-[#FFD1D1] opacity-40" />
          <div className="relative flex h-[78px] w-[78px] items-center justify-center rounded-2xl bg-[#FF4D4D] shadow-[0_16px_33px_rgba(255,77,77,0.3)]">
            <AlertTriangle className="h-8 w-8 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col items-center gap-3.5 p-10">
          <h2 className="text-center text-2xl font-bold text-[#1A1D1F]">채널 연결 실패</h2>
          <span className="rounded-full bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-600">
            실패 사유: {reason}
          </span>
          <p className="max-w-[342px] pt-1.5 text-center text-sm leading-relaxed text-slate-500">
            {description}
          </p>

          <div className="flex w-full items-center justify-between pt-10">
            <button
              type="button"
              onClick={onContact}
              className="px-3.5 py-1.5 text-sm font-bold text-slate-400 hover:text-slate-600"
            >
              문의하기
            </button>
            <button
              type="button"
              onClick={onRetry}
              className="rounded-xl bg-indigo-500 px-8 py-4 text-[15px] font-bold text-white shadow-[0_10px_20px_rgba(99,91,255,0.24)] hover:bg-indigo-600"
            >
              재시도
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
