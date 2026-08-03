"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

const footerLinks = ["서비스 이용약관", "개인정보처리방침", "고객센터"];

// 데모용 — 실제로는 백엔드 로그인 API 응답으로 성공/실패를 판단해야 해요.
const DEMO_EMAIL = "demo@sellon.co.kr";
const DEMO_PASSWORD = "sellon1234!";

export default function LoginPage() {
  const router = useRouter();
  const [loginType, setLoginType] = useState<"user" | "root">("user");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberId, setRememberId] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 백엔드 로그인 API 붙으면 이 부분을 실제 fetch 호출로 교체하고,
    // 응답 상태에 따라 setLoginError / 로딩 화면 표시 여부를 결정하면 돼요.
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      setLoginError(false);
      setIsLoggingIn(true);
      // 데모용 지연 — 실제로는 API 응답을 받은 뒤 바로 이동하면 됩니다.
      setTimeout(() => {
        router.push("/channels/connect");
      }, 1400);
    } else {
      setLoginError(true);
    }
  };

  const inputClass = (hasError: boolean) =>
    "w-full rounded-xl border bg-[#F9FAFB] px-5 py-[18px] text-[15px] text-[#111111] placeholder:text-black/50 focus:outline-none focus:ring-2 " +
    (hasError
      ? "border-[#FCC4C4] focus:ring-red-400"
      : "border-[#E5E7EB] focus:ring-indigo-500");

  if (isLoggingIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F7FA]">
        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          <div className="h-[60px] w-[60px] animate-spin rounded-full border-[3.89px] border-[#E4E4E7] border-t-indigo-500" />
          <div className="text-center">
            <p className="text-[28px] font-bold text-[#18181B]">로그인하는 중...</p>
            <p className="pt-2 text-[13px] text-[#71717A]">
              잠시만 기다려 주세요. 사용자 정보를 불러오는 중입니다
            </p>
          </div>
        </div>
        <div className="flex w-full flex-col items-center gap-3 border-t border-[#E5E7EB] bg-white px-6 py-8 text-center">
          <div className="flex items-center gap-5">
            {footerLinks.map((label) => (
              <span key={label} className="text-[10px] text-[#99A1AF]">
                {label}
              </span>
            ))}
          </div>
          <p className="text-[9px] text-[#99A1AF]">© 2026 SELLoN Inc. All rights reserved.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Left: illustration */}
        <div className="flex flex-1 items-center justify-center bg-[#F8F9FD] px-6 py-12">
          <div className="flex aspect-square w-full max-w-[430px] items-center justify-center overflow-hidden rounded-3xl bg-white p-6 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]">
            <img
              src="/mascot-pencil.png"
              alt="SELLoN 로그인 일러스트"
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        {/* Right: form */}
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <h1 className="pb-10 text-[34px] font-bold text-[#111111]">로그인</h1>

            {/* Login type switch */}
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-1 rounded-xl bg-[#F5F6F8] p-1">
                <button
                  type="button"
                  onClick={() => setLoginType("user")}
                  className={
                    "flex-1 rounded-lg py-3 text-sm font-bold transition-colors " +
                    (loginType === "user"
                      ? "bg-indigo-500 text-white shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]"
                      : "text-[#767676] hover:text-slate-700")
                  }
                >
                  사용자 로그인
                </button>
                <button
                  type="button"
                  onClick={() => setLoginType("root")}
                  className={
                    "flex-1 rounded-lg py-3 text-sm font-bold transition-colors " +
                    (loginType === "root"
                      ? "bg-indigo-500 text-white shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]"
                      : "text-[#767676] hover:text-slate-700")
                  }
                >
                  root 로그인
                </button>
              </div>

              {loginError && (
                <div className="flex items-center gap-1.5 rounded-md border border-[#FCC4C4] bg-[#FEF2F2] px-2.5 py-2">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-[#DC2626]" />
                  <p className="text-[13px] font-medium text-[#DC2626]">
                    이메일 또는 비밀번호가 일치하지 않습니다. 다시 확인해 주세요.
                  </p>
                </div>
              )}
            </div>

            <form className="mt-10 flex flex-col gap-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block pb-2 text-sm font-semibold text-[#333333]">
                  이메일
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (loginError) setLoginError(false);
                  }}
                  placeholder="example@sellon.co.kr"
                  className={inputClass(loginError)}
                />
              </div>

              <div>
                <label htmlFor="password" className="block pb-2 text-sm font-semibold text-[#333333]">
                  비밀번호
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (loginError) setLoginError(false);
                    }}
                    placeholder="8자 이상 영문/숫자/특수문자 조합"
                    className={inputClass(loginError) + " pr-11"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rememberId}
                    onChange={(e) => setRememberId(e.target.checked)}
                    className="h-5 w-5 rounded border-2 border-[#E5E7EB] text-indigo-500 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-[#6B7280]">아이디 저장</span>
                </label>
                <Link href="/find-account" className="text-sm font-medium text-indigo-500 hover:underline">
                  아이디/비밀번호를 잊으셨나요?
                </Link>
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-indigo-500 py-5 text-lg font-bold text-white shadow-[0_10px_15px_-3px_rgba(79,53,161,0.13),0_4px_6px_-4px_rgba(79,53,161,0.13)] transition-transform hover:scale-[1.01]"
              >
                로그인
              </button>
            </form>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 border-t border-[#F3F4F6] pt-8 text-sm">
              <span className="whitespace-nowrap text-[#6B7280]">계정이 없으신가요?</span>
              <Link href="/signup" className="whitespace-nowrap font-bold text-indigo-500 hover:underline">
                루트 사용자 회원가입
              </Link>
              <span className="text-[#6B7280]">·</span>
              <Link href="/signup" className="whitespace-nowrap font-bold text-indigo-500 hover:underline">
                일반 사용자 회원가입
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center gap-3 border-t border-[#E5E7EB] px-6 py-8 text-center">
        <div className="flex items-center gap-5">
          {footerLinks.map((label) => (
            <span key={label} className="text-[10px] text-[#99A1AF]">
              {label}
            </span>
          ))}
        </div>
        <p className="text-[9px] text-[#99A1AF]">© 2026 SELLoN Inc. All rights reserved.</p>
      </div>
    </div>
  );
}
