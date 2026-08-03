"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const REQUIRED_TERMS = [
  { id: "service", label: "[필수] 이용약관 동의" },
  { id: "privacy", label: "[필수] 개인정보 처리방침 동의" },
] as const;

const OPTIONAL_TERMS = [{ id: "marketing", label: "[선택] 마케팅 정보 수신 동의" }] as const;

const ALL_TERMS = [...REQUIRED_TERMS, ...OPTIONAL_TERMS];

export default function SignupPage() {
  const router = useRouter();

  // 이 두 state로 화면 전체(루트 폼 / 일반 폼 / 약관동의)를 전환해요. URL은 안 바뀌어요.
  const [accountType, setAccountType] = useState<"root" | "normal">("root");
  const [step, setStep] = useState<"form" | "terms">("form");

  const [codeSent, setCodeSent] = useState(false);

  const [checked, setChecked] = useState<Record<string, boolean>>({
    service: false,
    privacy: false,
    marketing: false,
  });
  const allAgreed = ALL_TERMS.every((t) => checked[t.id]);
  const requiredAgreed = REQUIRED_TERMS.every((t) => checked[t.id]);
  const toggleAll = () => {
    const next = !allAgreed;
    setChecked(Object.fromEntries(ALL_TERMS.map((t) => [t.id, next])) as Record<string, boolean>);
  };
  const toggleOne = (id: string) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("terms");
  };

  if (step === "terms") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6 py-24">
        <div className="w-full max-w-[480px]">
          <h1 className="pb-7 text-[28px] font-bold text-[#18181B]">약관 동의</h1>

          <div className="rounded-[6.67px] border-[0.28px] border-[#E4E4E7] bg-white p-6 shadow-[0_3.33px_8.33px_-2.78px_rgba(46,60,129,0.08)]">
            <label className="flex cursor-pointer items-center gap-3 pb-4">
              <input
                type="checkbox"
                checked={allAgreed}
                onChange={toggleAll}
                className="h-4 w-4 rounded-xl border border-[#B3B3B3] text-indigo-500 focus:ring-indigo-500"
              />
              <span className="text-[13px] font-bold text-[#18181B]">전체 동의</span>
            </label>

            <div className="border-t border-[#E4E4E7]" />

            <div className="flex flex-col gap-4 pt-4">
              {[...REQUIRED_TERMS, ...OPTIONAL_TERMS].map((term) => (
                <label key={term.id} className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={checked[term.id]}
                    onChange={() => toggleOne(term.id)}
                    className="mt-0.5 h-4 w-4 rounded-sm border border-[#D4D4D8] text-indigo-500 focus:ring-indigo-500"
                  />
                  <span className="text-[13px] text-[#3F3F46]">
                    {term.label}
                    <button type="button" className="ml-1.5 font-medium text-[#5821B6] hover:underline">
                      전문 보기
                    </button>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={!requiredAgreed}
            onClick={() => router.push("/channel")}
            className="mt-6 w-full rounded-xl bg-indigo-500 py-5 text-sm font-bold text-white transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
          >
            동의하고 계속하기
          </button>

          <button
            type="button"
            onClick={() => setStep("form")}
            className="mt-3 w-full text-center text-xs font-medium text-[#71717A] hover:text-slate-600"
          >
            ← 이전으로
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 border-t border-[#E5E7EB] px-6 py-8 text-center">
          <div className="flex items-center gap-5">
            <span className="text-[10px] text-[#99A1AF]">서비스 이용약관</span>
            <span className="text-[10px] font-bold text-[#99A1AF]">개인정보처리방침</span>
            <span className="text-[10px] text-[#99A1AF]">고객센터</span>
          </div>
          <p className="text-[9px] text-[#99A1AF]">© 2026 SELLoN Inc. All rights reserved.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="flex flex-1 items-center justify-center bg-[#F9F8FC] px-6 py-12">
          <div className="flex aspect-square w-full max-w-[430px] items-center justify-center overflow-hidden rounded-3xl bg-white p-6 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]">
            <img
              src="/mascot-pencil.png"
              alt="SELLoN 회원가입 일러스트"
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        <div className="flex flex-1 items-center px-6 py-12 sm:px-12 lg:px-24">
          <div className="w-full max-w-[560px]">
            <h1 className="text-[32px] font-bold text-[#18181B]">
              {accountType === "root" ? "루트 계정 가입" : "직원 계정 가입"}
            </h1>
            <p className="pt-2 text-[13px] text-[#71717A]">
              AI와 함께 설계하는 멀티셀러 플랫폼 — SELLoN 셀러 계정을 만들어보세요
            </p>

            {/* 계정 타입 전환 */}
            <div className="mt-6 flex gap-1 rounded-xl bg-[#F5F6F8] p-1">
              <button
                type="button"
                onClick={() => setAccountType("root")}
                className={
                  "flex-1 rounded-lg py-2.5 text-xs font-bold " +
                  (accountType === "root" ? "bg-indigo-500 text-white" : "text-[#767676]")
                }
              >
                루트 사용자
              </button>
              <button
                type="button"
                onClick={() => setAccountType("normal")}
                className={
                  "flex-1 rounded-lg py-2.5 text-xs font-bold " +
                  (accountType === "normal" ? "bg-indigo-500 text-white" : "text-[#767676]")
                }
              >
                일반 사용자
              </button>
            </div>

            <form className="mt-8 flex flex-col gap-6" onSubmit={handleSubmitForm}>
              <div>
                <label htmlFor="brand" className="block pb-2 text-[13px] font-medium text-[#3F3F46]">
                  {accountType === "root" ? "브랜드명" : "브랜드 고유 Key"}
                </label>
                <input
                  id="brand"
                  type="text"
                  placeholder={accountType === "root" ? "예: SELLoN" : "예: sLN-xxxxxx...."}
                  className="w-full rounded-[4.44px] border-[0.28px] border-[#E4E4E7] bg-[#FAFAFA] px-3.5 py-4 text-[13px] text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block pb-2 text-[13px] font-medium text-[#3F3F46]">
                  이메일
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="example@sellon.co.kr"
                  className="w-full rounded-[4.44px] border-[0.28px] border-[#E4E4E7] bg-[#FAFAFA] px-3.5 py-4 text-[13px] text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="password" className="block pb-2 text-[13px] font-medium text-[#3F3F46]">
                  비밀번호
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="8자 이상 영문/숫자/특수문자 조합"
                  className="w-full rounded-[4.44px] border-[0.28px] border-[#E4E4E7] bg-[#FAFAFA] px-3.5 py-4 text-[13px] text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="nickname" className="block pb-2 text-[13px] font-medium text-[#3F3F46]">
                  {accountType === "root" ? "마스터 계정 이름" : "직원 계정 닉네임"}
                </label>
                <input
                  id="nickname"
                  type="text"
                  placeholder={accountType === "root" ? "루트 사용자 이름을 작성해주세요" : "사용자 닉네임을 작성해주세요"}
                  className="w-full rounded-[4.44px] border-[0.28px] border-[#E4E4E7] bg-[#FAFAFA] px-3.5 py-4 text-[13px] text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="verificationCode" className="block pb-2 text-[13px] font-medium text-[#3F3F46]">
                  인증번호
                </label>
                <div className="flex gap-2.5">
                  <input
                    id="verificationCode"
                    type="text"
                    maxLength={6}
                    placeholder="6자리 인증번호 입력"
                    className="flex-1 rounded-[4.44px] border-[0.28px] border-[#E4E4E7] bg-[#FAFAFA] px-3.5 py-4 text-[13px] text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setCodeSent(true)}
                    className="w-[148px] shrink-0 rounded-[4.44px] bg-indigo-500 text-[11px] font-bold text-white hover:bg-indigo-600"
                  >
                    {codeSent ? "재발송" : "인증번호 발송"}
                  </button>
                </div>
                <p className="pt-2 text-[11px] text-[#A1A1AA]">
                  {codeSent
                    ? "인증번호를 발송했어요 · 유효시간 5분 · 재발송 가능"
                    : "이메일 인증 후 유효시간 5분 · 재발송 가능"}
                </p>
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-indigo-500 py-5 text-sm font-bold text-white transition-transform hover:scale-[1.01]"
              >
                회원가입
              </button>
            </form>

            <div className="mt-8 border-t border-[#E4E4E7] pt-6 text-base">
              <span className="text-[#71717A]">이미 계정이 있으신가요? </span>
              <Link href="/login" className="font-bold text-[#5821B6] hover:underline">
                로그인으로 이동
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 border-t border-[#E5E7EB] px-6 py-8 text-center">
        <div className="flex items-center gap-5">
          <span className="text-[10px] text-[#99A1AF]">서비스 이용약관</span>
          <span className="text-[10px] font-bold text-[#99A1AF]">개인정보처리방침</span>
          <span className="text-[10px] text-[#99A1AF]">고객센터</span>
        </div>
        <p className="text-[9px] text-[#99A1AF]">© 2026 SELLoN Inc. All rights reserved.</p>
      </div>
    </div>
  );
}
