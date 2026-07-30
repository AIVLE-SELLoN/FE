import { AlertTriangle, Instagram, Youtube, Facebook } from "lucide-react";

const serviceLinks = ["기능 소개", "가격 안내", "도입 사례"];
const supportLinks = ["문의하기", "이용약관", "개인정보 처리방침"];

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-[1512px] px-6 py-16 lg:px-[120px] lg:py-20">
        <div className="flex flex-col gap-12 sm:flex-row sm:justify-between">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-indigo-500 text-white">
                <AlertTriangle className="h-[10px] w-[10px]" strokeWidth={3} />
              </span>
              <span className="text-lg font-bold tracking-tight text-[#1A1F27]">
                SELLoN
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              사업자등록번호 000-00-00000 · 대표 김세론
              <br />
              서울특별시 성동구 성수동
            </p>
          </div>
          <div className="flex gap-16 sm:gap-24">
            <div className="flex flex-col gap-6">
              <h4 className="text-[15px] font-bold tracking-tight text-[#1A1F27]">
                서비스
              </h4>
              <ul className="flex flex-col gap-4">
                {serviceLinks.map((item) => (
                  <li
                    key={item}
                    className="text-[13px] text-slate-500 hover:text-slate-700"
                  >
                    {item}
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
                  <li
                    key={item}
                    className="text-[13px] text-slate-500 hover:text-slate-700"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col-reverse items-center justify-between gap-6 border-t border-[#F8F9FC] pt-8 sm:flex-row">
          <p className="text-[13px] text-slate-400">
            © 2026 SELLoN. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <Facebook className="h-[18px] w-[18px]" />
            <Instagram className="h-[18px] w-[18px]" />
            <Youtube className="h-[18px] w-[18px]" />
          </div>
        </div>
      </div>
    </footer>
  );
}
