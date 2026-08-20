"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

type FaqItem = {
  id: number;
  question: string;
  answer: string;
};

const faqItems: FaqItem[] = [
  {
    id: 1,
    question: "SELLoN은 어떤 서비스인가요?",
    answer:
      "채널마다 흩어진 문의·반품 데이터를 한 화면에 모으고, 평소와 다른 이상 신호가 보이면 원인 가설과 대응안을 근거 문서와 함께 제시하는 CS 모니터링 서비스예요. 리뷰나 불만이 커지기 전에 미리 짚어드리는 게 목표예요.",
  },
  {
    id: 2,
    question: "어떤 판매 채널을 연동할 수 있나요?",
    answer: "현재 쿠팡 윙, 네이버 스마트스토어센터, 지그재그 파트너센터 세 채널을 동시에 연동하고 모니터링할 수 있어요.",
  },
  {
    id: 3,
    question: "무료로 이용할 수 있나요?",
    answer: "네, 신용카드 등록 없이 무료로 채널을 연결하고 시작할 수 있어요. 채널 연결은 언제든 해제할 수 있습니다.",
  },
  {
    id: 4,
    question: "채널 연결(API 키 등록)이 어렵지는 않나요?",
    answer:
      "각 채널에서 발급받은 API 키를 등록하면 형식 검증부터 연결 상태 표시까지 자동으로 처리돼요. 등록은 보통 5분 이내로 끝나고, 연결에 실패하면 사유를 바로 안내해드려요.",
  },
  {
    id: 5,
    question: "이상탐지는 어떤 원리로 동작하나요?",
    answer:
      "트렌드와 계절성을 분리한 통계 기반 분석으로 평소와 다른 진짜 이상 신호만 골라내요. 데이터가 아직 부족한 신규 상품은 이동평균 방식으로 자동 전환해 판단해요.",
  },
  {
    id: 6,
    question: "AI가 제안한 개선안이 제 동의 없이 바로 반영되나요?",
    answer:
      "아니요, 개선안은 셀러가 직접 승인해야만 적용돼요. 반려하면 그 사유가 다음 분석에 반영되어 같은 제안이 반복되지 않도록 학습돼요.",
  },
  {
    id: 7,
    question: "회원가입은 어떻게 하나요?",
    answer: "가입 페이지에서 이메일 등 기본 정보만 입력하면 바로 시작할 수 있어요.",
  },
  {
    id: 8,
    question: "아이디나 비밀번호를 잊어버렸어요.",
    answer: "아이디/비밀번호 찾기 페이지에서 가입 시 등록한 정보로 아이디 확인 또는 임시 비밀번호 발급을 받을 수 있어요.",
  },
  {
    id: 9,
    question: "여기서 답을 못 찾았어요. 더 궁금한 게 있으면 어떻게 문의하나요?",
    answer:
      "회원가입 후 로그인하시면 고객지원 메뉴에서 1:1 문의를 남기실 수 있고, 담당자가 확인 후 답변드려요.",
  },
];

export default function FaqPage() {
  const [openIds, setOpenIds] = useState<Set<number>>(new Set([1]));

  const toggleOpen = (id: number) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-slate-100">
        <div className="mx-auto flex h-20 max-w-[1512px] items-center justify-between px-6 lg:px-[120px]">
          <Link href="/" className="flex items-center">
            <Image src="/logo3.png" alt="SELLoN" width={140} height={36} />
          </Link>
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

      <main className="mx-auto w-full max-w-[840px] flex-1 px-6 py-16 lg:py-20">
        <div className="flex flex-col gap-3">
          <span className="inline-flex w-fit items-center rounded-md bg-indigo-50 px-3 py-1">
            <span className="text-[13px] font-bold text-indigo-500">자주 묻는 질문</span>
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1A1F27] sm:text-4xl">
            SELLoN이 궁금하신가요?
          </h1>
          <p className="text-[15px] leading-relaxed text-slate-500">
            가입 전 자주 묻는 질문들을 모았어요. 찾으시는 답이 없다면 가입 후 1:1 문의로 남겨주세요.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-2">
          {faqItems.map((f) => {
            const isOpen = openIds.has(f.id);
            return (
              <div
                key={f.id}
                className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_1px_2px_-1px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.1)]"
              >
                <button
                  onClick={() => toggleOpen(f.id)}
                  className="flex w-full items-center gap-5 p-5 text-left"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-500">
                    {f.id}
                  </span>
                  <p className="flex-1 text-[14px] font-bold text-slate-800">{f.question}</p>
                  <ChevronDown
                    className={
                      "h-3.5 w-3.5 shrink-0 text-slate-300 transition-transform " +
                      (isOpen ? "rotate-180" : "")
                    }
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-slate-50 px-5 py-4 pl-[68px] text-[13px] leading-relaxed text-slate-600">
                    {f.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl bg-[#F8F9FC] px-8 py-10 text-center">
          <p className="text-base font-bold text-[#1A1F27]">아직 궁금한 점이 남아있나요?</p>
          <p className="text-sm text-slate-500">지금 바로 무료로 채널을 연결하고 SELLoN을 직접 경험해보세요.</p>
          <Link
            href="/signup"
            className="mt-2 rounded-xl bg-indigo-500 px-8 py-3.5 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
          >
            무료로 시작하기
          </Link>
        </div>
      </main>

      <div className="flex flex-col items-center gap-3 border-t border-[#E5E7EB] px-6 py-8 text-center">
        <div className="flex items-center gap-5">
          <Link href="/terms" className="text-[10px] text-[#99A1AF] hover:text-slate-500">
            서비스 이용약관
          </Link>
          <Link href="/privacy" className="text-[10px] text-[#99A1AF] hover:text-slate-500">
            개인정보처리방침
          </Link>
          <span className="text-[10px] font-bold text-[#99A1AF]">고객센터</span>
        </div>
        <p className="text-[9px] text-[#99A1AF]">© 2026 SELLoN Inc. All rights reserved.</p>
      </div>
    </div>
  );
}
