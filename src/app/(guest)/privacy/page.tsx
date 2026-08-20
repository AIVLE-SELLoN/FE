"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth/AuthContext";
import UserMenu from "@/components/common/UserMenu";
import { privacySections, PRIVACY_UPDATED_AT } from "@/lib/legal/content";

export default function PrivacyPage() {
  const { user, isLoading } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-slate-100">
        <div className="mx-auto flex h-20 max-w-[1512px] items-center justify-between px-6 lg:px-[120px]">
          <Link href="/" className="flex items-center">
            <Image src="/logo3.png" alt="SELLoN" width={140} height={30} priority />
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            {isLoading ? null : user ? (
              <UserMenu user={user} />
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-xl px-3 py-2.5 text-[15px] font-semibold tracking-tight text-[#101828] transition-colors hover:bg-slate-100 sm:px-5"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-1.5 rounded-xl bg-[#101828] px-4 py-2.5 text-[15px] font-semibold tracking-tight text-white transition-transform hover:scale-[1.02] sm:px-6"
                >
                  무료로 시작하기
                  <span aria-hidden>→</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[760px] flex-1 px-6 py-16 lg:py-20">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1A1F27] sm:text-4xl">
            개인정보 처리방침
          </h1>
          <p className="text-sm text-slate-400">시행일자 {PRIVACY_UPDATED_AT}</p>
        </div>

        <div className="mt-10 flex flex-col gap-8">
          {privacySections.map((section) => (
            <div key={section.heading}>
              <h2 className="text-[15px] font-bold text-slate-800">{section.heading}</h2>
              <div className="mt-2 flex flex-col gap-1.5">
                {section.body.map((line, i) => (
                  <p key={i} className="text-[14px] leading-relaxed text-slate-600">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      <div className="flex flex-col items-center gap-3 border-t border-[#E5E7EB] px-6 py-8 text-center">
        <Link href="/" className="mb-1">
          <Image src="/logo3.png" alt="SELLoN" width={110} height={24} />
        </Link>
        <div className="flex items-center gap-5">
          <Link href="/terms" className="text-[10px] text-[#99A1AF] hover:text-slate-500">
            서비스 이용약관
          </Link>
          <span className="text-[10px] font-bold text-[#99A1AF]">개인정보처리방침</span>
          <Link href="/faq" className="text-[10px] text-[#99A1AF] hover:text-slate-500">
            고객센터
          </Link>
        </div>
        <p className="text-[9px] text-[#99A1AF]">© 2026 SELLoN Inc. All rights reserved.</p>
      </div>
    </div>
  );
}
