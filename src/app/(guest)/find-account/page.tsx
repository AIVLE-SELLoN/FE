"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, Mail, X } from "lucide-react";
import { findId, findPassword } from "@/app/api/auth";
import { ApiError } from "@/app/api/client";

const footerLinks = [
  { label: "서비스 이용약관", href: "/terms" },
  { label: "개인정보처리방침", href: "/privacy" },
  { label: "고객센터", href: "/faq" },
];

function FoundIdModal({ email, onClose }: { email: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45" onClick={onClose}>
      <div
        className="w-full max-w-[440px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_48px_-12px_rgba(0,0,0,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-indigo-400" />
        <div className="relative flex flex-col items-center gap-6 px-8 py-7">
          <button
            onClick={onClose}
            aria-label="닫기"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#A1A1AA] hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
          </button>

          <span className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-indigo-50">
            <CheckCircle className="h-7 w-7 text-indigo-500" strokeWidth={2} />
          </span>

          <div className="text-center">
            <p className="text-[18px] font-bold text-[#18181B]">아이디 찾기 완료</p>
            <p className="pt-1 text-[13px] font-medium text-[#71717A]">
              입력하신 정보와 일치하는 아이디를 찾았습니다
            </p>
          </div>

          <div className="w-full rounded-xl border border-[#DDD6FE] bg-[#F5F3FF] px-6 py-5 text-center">
            <p className="text-xs font-medium tracking-wide text-[#7C6FCD]">가입하신 이메일</p>
            <p className="pt-1 text-[22px] font-bold text-indigo-600">{email}</p>
          </div>

          <p className="text-center text-xs text-[#A1A1AA]">
            개인정보 보호를 위해 이메일 일부가 마스킹 처리되었습니다.
          </p>

          <div className="flex w-full flex-col gap-2.5">
            <Link
              href="/login"
              className="flex h-[52px] w-full items-center justify-center rounded-xl bg-indigo-500 text-sm font-bold text-white hover:bg-indigo-600"
            >
              로그인하기
            </Link>
            <button
              onClick={onClose}
              className="flex h-[52px] w-full items-center justify-center rounded-xl bg-[#F4F4F5] text-sm font-medium text-[#52525B] hover:bg-slate-200"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PasswordResetModal({ email, onClose }: { email: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45" onClick={onClose}>
      <div
        className="w-full max-w-[440px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_48px_-12px_rgba(0,0,0,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-indigo-400" />
        <div className="relative flex flex-col items-center gap-6 px-8 py-7">
          <button
            onClick={onClose}
            aria-label="닫기"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#A1A1AA] hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
          </button>

          <span className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-indigo-50">
            <Mail className="h-6 w-6 text-indigo-500" strokeWidth={2} />
          </span>

          <div className="text-center">
            <p className="text-[18px] font-bold text-[#18181B]">임시 비밀번호 발급 완료</p>
            <p className="pt-1 text-[13px] font-medium text-[#71717A]">
              입력하신 이메일로 임시 비밀번호를 발송했습니다
            </p>
          </div>

          <div className="w-full rounded-xl border border-[#DDD6FE] bg-[#F5F3FF] px-6 py-5 text-center">
            <p className="text-xs font-medium tracking-wide text-[#7C6FCD]">가입하신 이메일</p>
            <p className="pt-1 text-[22px] font-bold text-indigo-600">{email}</p>
          </div>

          <p className="text-center text-xs text-[#A1A1AA]">
            개인정보 보호를 위해 이메일 일부가 마스킹 처리되었습니다.
          </p>

          <div className="flex w-full flex-col gap-2.5">
            <Link
              href="/login"
              className="flex h-[52px] w-full items-center justify-center rounded-xl bg-indigo-500 text-sm font-bold text-white hover:bg-indigo-600"
            >
              로그인하러 가기
            </Link>
            <button
              onClick={onClose}
              className="flex h-[52px] w-full items-center justify-center rounded-xl bg-[#F4F4F5] text-sm font-medium text-[#52525B] hover:bg-slate-200"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FindAccountPage() {
  const [tab, setTab] = useState<"id" | "password">("id");
  const [company, setCompany] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [foundEmail, setFoundEmail] = useState<string | null>(null);
  const [tempPasswordEmail, setTempPasswordEmail] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [idLoading, setIdLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleFindId = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotFound(false);
    setIdLoading(true);
    try {
      const { maskedEmail } = await findId({ companyName: company, userName });
      setFoundEmail(maskedEmail);
    } catch (error) {
      // 백엔드는 일치하는 계정이 없으면 404를 내려줘요
      setNotFound(true);
    } finally {
      setIdLoading(false);
    }
  };

  const handleFindPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordLoading(true);
    try {
      const { maskedEmail } = await findPassword({ email });
      setTempPasswordEmail(maskedEmail);
    } catch (error) {
      setPasswordError(
        error instanceof ApiError
          ? error.message
          : "일치하는 계정을 찾을 수 없어요. 이메일을 다시 확인해주세요."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Left: illustration */}
        <div className="flex flex-1 items-center justify-center bg-[#F9F8FC] px-6 py-12">
          <div className="flex aspect-square w-full max-w-[430px] items-center justify-center overflow-hidden rounded-3xl bg-white p-6 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]">
            <img
              src="/mascot-pencil.png"
              alt="SELLoN 계정 찾기 일러스트"
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        {/* Right: form */}
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-[560px]">
            <h1 className="text-[28px] font-bold text-[#18181B]">아이디 / 비밀번호 찾기</h1>

            <div className="mt-8 flex flex-col gap-1.5">
              <div className="flex gap-0.5 rounded-xl bg-[#F4F4F5] p-1">
                <button
                  type="button"
                  onClick={() => setTab("id")}
                  className={
                    "flex-1 rounded-lg py-3 text-sm font-bold transition-colors " +
                    (tab === "id"
                      ? "bg-indigo-500 text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                      : "text-[#71717A]")
                  }
                >
                  아이디 찾기
                </button>
                <button
                  type="button"
                  onClick={() => setTab("password")}
                  className={
                    "flex-1 rounded-lg py-3 text-sm font-bold transition-colors " +
                    (tab === "password"
                      ? "bg-indigo-500 text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                      : "text-[#71717A]")
                  }
                >
                  비밀번호 찾기
                </button>
              </div>
              <p className="px-1 pt-1 text-[13px] font-medium text-[#71717A]">
                계정 정보를 잊으셨나요? 아래에서 찾아보세요
              </p>
              <p className="px-1 text-xs font-medium text-[#71717A]">
                {tab === "id"
                  ? "가입 시 등록한 회사명과 사용자 이름을 입력해 주세요"
                  : "가입 시 등록한 이메일을 입력하면 임시 비밀번호를 발급해 드립니다"}
              </p>
            </div>

            {tab === "id" ? (
              <form className="mt-6 flex flex-col gap-4" onSubmit={handleFindId}>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="company" className="text-[13px] font-medium text-[#3F3F46]">
                    회사명
                  </label>
                  <input
                    id="company"
                    type="text"
                    value={company}
                    onChange={(e) => {
                      setCompany(e.target.value);
                      setNotFound(false);
                    }}
                    placeholder="예: 마르디 메크르디"
                    className="rounded-[4.44px] border-[0.28px] border-[#E4E4E7] bg-[#FAFAFA] px-4 py-4 text-[13px] text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="userName" className="text-[13px] font-medium text-[#3F3F46]">
                    사용자 이름
                  </label>
                  <input
                    id="userName"
                    type="text"
                    value={userName}
                    onChange={(e) => {
                      setUserName(e.target.value);
                      setNotFound(false);
                    }}
                    placeholder="가입 시 등록한 이름 입력"
                    className="rounded-[4.44px] border-[0.28px] border-[#E4E4E7] bg-[#FAFAFA] px-4 py-4 text-[13px] text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {notFound && (
                  <p className="text-[13px] font-medium text-red-500">
                    일치하는 계정을 찾을 수 없어요. 회사명과 이름을 다시 확인해주세요.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={idLoading}
                  className="mt-3 flex w-full items-center justify-center rounded-xl bg-indigo-500 py-3 text-sm font-bold text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {idLoading ? "조회 중..." : "아이디 찾기"}
                </button>
              </form>
            ) : (
              <form className="mt-6 flex flex-col gap-1.5" onSubmit={handleFindPassword}>
                <label htmlFor="pwEmail" className="text-[13px] font-medium text-[#3F3F46]">
                  이메일
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="pwEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@sellon.com"
                    className="w-full max-w-[400px] rounded-[4.44px] border-[0.28px] border-[#E4E4E7] bg-[#FAFAFA] px-4 py-4 text-[13px] text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="shrink-0 whitespace-nowrap rounded-[4.44px] bg-indigo-500 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {passwordLoading ? "발급 중..." : "임시 비밀번호 발급"}
                  </button>
                </div>
                {passwordError && (
                  <p className="pt-1 text-[13px] font-medium text-red-500">{passwordError}</p>
                )}
              </form>
            )}

            <div className="mt-10 border-t border-[#E3E3E8] pt-6 text-center">
              <Link href="/login" className="text-[13px] font-medium text-indigo-500 hover:underline">
                로그인으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center gap-3 border-t border-[#E5E7EB] px-6 py-8 text-center">
        <div className="flex items-center gap-5">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[10px] text-[#99A1AF] hover:text-slate-500"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <p className="text-[9px] text-[#99A1AF]">© 2026 SELLoN Inc. All rights reserved.</p>
      </div>

      {foundEmail && <FoundIdModal email={foundEmail} onClose={() => setFoundEmail(null)} />}
      {tempPasswordEmail && (
        <PasswordResetModal email={tempPasswordEmail} onClose={() => setTempPasswordEmail(null)} />
      )}
    </div>
  );
}
