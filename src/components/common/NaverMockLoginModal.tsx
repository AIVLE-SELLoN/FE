"use client";

import { useState } from "react";
import { X } from "lucide-react";

// 실제 네이버 로그인 화면이 아니라, 백엔드가 아직 Mock OAuth(가짜 도메인)라서
// 그 자리를 대신하는 프론트 전용 목업 화면입니다.
// 나중에 진짜 네이버 연동이 붙으면 이 모달은 지우고 authorizationUrl로 실제 이동시키면 됩니다.
export default function NaverMockLoginModal({
  open,
  loading,
  onConfirm,
  onClose,
}: {
  open: boolean;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between pb-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-lg font-black text-white">
            N
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="pb-1 text-sm font-bold text-slate-900">네이버 로그인 (테스트용 화면)</p>
        <p className="pb-5 text-[12px] leading-relaxed text-slate-500">
          실제 네이버 로그인이 아니라, 연동 흐름을 확인하기 위한 목업 화면입니다. 아이디/비밀번호는
          검증하지 않고 아무 값이나 입력 후 로그인하면 연동이 완료됩니다.
        </p>

        <div className="flex flex-col gap-2.5">
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="아이디"
            className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            type="password"
            placeholder="비밀번호"
            className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <button
          disabled={loading}
          onClick={onConfirm}
          className="mt-5 flex w-full items-center justify-center rounded-lg bg-emerald-500 py-2.5 text-sm font-bold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "연동 처리 중..." : "로그인"}
        </button>
      </div>
    </div>
  );
}
