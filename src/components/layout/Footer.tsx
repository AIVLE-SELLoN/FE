import Link from "next/link";

const serviceLinks = [
  { label: "기능 소개", href: "/#features" },
  { label: "가격 안내", href: "/pricing" },
  { label: "도입 사례", href: "/#testimonials" },
];
const supportLinks = [
  { label: "자주 묻는 질문", href: "/faq" },
  { label: "이용약관", href: "/terms" },
  { label: "개인정보 처리방침", href: "/privacy" },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-[1512px] px-6 py-16 lg:px-[120px] lg:py-20">
        <div className="flex flex-col gap-12 sm:flex-row sm:justify-between">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <img src="/logo3.png" alt="SELLoN" className="h-6 w-auto" />
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              AIVLE SCHOOL · AI 수도권 4반 11조
            </p>
          </div>
          <div className="flex gap-16 sm:gap-24">
            <div className="flex flex-col gap-6">
              <h4 className="text-[15px] font-bold tracking-tight text-[#1A1F27]">
                서비스
              </h4>
              <ul className="flex flex-col gap-4">
                {serviceLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-[13px] text-slate-500 hover:text-slate-700"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-6">
              <h4 className="text-[15px] font-bold tracking-tight text-[#1A1F27]">
                고객지원
              </h4>
              <ul className="flex flex-col gap-4">
                {supportLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-[13px] text-slate-500 hover:text-slate-700"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 flex items-center justify-center border-t border-[#F8F9FC] pt-8">
          <p className="text-[13px] text-slate-400">
            © 2026 SELLoN. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
