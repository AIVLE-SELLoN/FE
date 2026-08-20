"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth/AuthContext";

const navLinks = [
  { label: "기능", href: "#features" },
  { label: "도입 효과", href: "#testimonials" },
  { label: "문의하기", href: "#cta" },
];

export default function Navbar() {
  const { user } = useAuth();
  const homeHref = user?.role === "ADMIN" ? "/admin/cs" : "/channel";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-[1512px] items-center justify-between px-6 lg:px-[120px]">
        <div className="flex items-center gap-10">
          <Image src="/logo3.png" alt="SELLoN" width={140} height={30} priority />
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[15px] font-medium tracking-tight text-slate-500 transition-colors hover:text-slate-900"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {user ? (
            <Link
              href={homeHref}
              className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-slate-100 sm:px-3"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-indigo-50 text-sm font-bold text-indigo-500">
                {user.name?.[0] ?? "?"}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block truncate text-sm font-bold leading-tight text-slate-800">
                  {user.name}
                </span>
                <span className="block truncate text-xs leading-tight text-slate-500">
                  {user.role === "ADMIN" ? "관리자 계정" : "Premium Plan"}
                </span>
              </span>
            </Link>
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
  );
}
