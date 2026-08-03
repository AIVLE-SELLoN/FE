"use client";

import { X } from "lucide-react";

export default function LoginRequiredModal({
  open,
  onClose,
  onLogin,
  onGoHome,
}: {
  open: boolean;
  onClose: () => void;
  onLogin: () => void;
  onGoHome: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[440px] rounded-2xl bg-white p-8 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-400 hover:text-slate-600"
          aria-label="닫기"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center gap-3 pt-2 text-center">
          <h2 className="text-lg font-bold text-slate-900">로그인이 필요한 서비스입니다</h2>
          <p className="text-sm text-slate-500">이 기능을 이용하려면 로그인이 필요합니다.</p>
        </div>

        <div className="flex items-center gap-3 pt-7">
          <button
            onClick={onLogin}
            className="flex-1 rounded-xl bg-indigo-500 py-3.5 text-sm font-bold text-white hover:bg-indigo-600"
          >
            로그인하러 가기
          </button>
          <button
            onClick={onGoHome}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            홈으로 이동
          </button>
        </div>
      </div>
    </div>
  );
}
