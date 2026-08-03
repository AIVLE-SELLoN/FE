import Link from "next/link";
import { AlertTriangle } from "lucide-react";

const navLinks = [
  { label: "기능", href: "#features" },
  { label: "도입 효과", href: "#testimonials" },
  { label: "문의하기", href: "#cta" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-[1512px] items-center justify-between px-6 lg:px-[120px]">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white">
              <AlertTriangle className="h-[18px] w-[18px]" strokeWidth={2.5} />
            </span>
            <span className="text-xl font-bold tracking-tight text-[#1A1F27]">
              SELLoN
            </span>
          </Link>
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
        </div>
      </div>
    </header>
  );
}
