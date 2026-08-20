import {
  Plug,
  Activity,
  GitCompareArrows,
  FileSearch,
  ShieldCheck,
  Star,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroDashboardMock from "@/components/landing/HeroDashboardMock";
import Reveal from "@/components/common/Reveal";

const stats = [
  { value: "244+", label: "연동된 브랜드 계정" },
  { value: "3개", label: "동시 모니터링 채널" },
  { value: "87%", label: "원인 파악 시간 단축" },
  { value: "4.87", suffix: "/5", label: "개선안 채택 만족도" },
];

const channels = [
  { name: "네이버 스마트스토어", badge: "N", color: "#03C75A", isText: true },
  { name: "쿠팡 윙", badge: "C", color: "#FF2D55" },
  { name: "지그재그 파트너센터", badge: "Z", color: "#FF007A" },
];

const testimonials = [
  {
    quote:
      '"네이버에서만 색상 문의가 늘고 있다는 걸 SELLoN 알림으로 먼저 알았어요. 상세페이지 사진 톤만 바꿨는데 문의가 눈에 띄게 줄었습니다."',
    name: "하윤서",
    role: "뷰티 브랜드 대표",
    image:
      "https://api.builder.io/api/v1/image/assets/TEMP/67d7b04c4795be8a009b0ce103a2a6f946c4d23a?width=96",
  },
  {
    quote:
      '"세 채널을 매일 들여다볼 여유가 없었는데, 이상 이벤트만 배지로 모아주니 확인할 것만 확인하면 됩니다. 근거까지 붙어 있어서 판단이 빨라졌어요."',
    name: "박도현",
    role: "패션 온라인 셀러",
    image:
      "https://api.builder.io/api/v1/image/assets/TEMP/bfb80e661254a4ae2ce7e1c5a7074520b842b848?width=96",
  },
  {
    quote:
      '"반려하면 왜 반려했는지만 적으면 되고, 다음 분석에 그 이유가 반영되더라고요. AI가 계속 저희 브랜드 톤을 배워가는 느낌입니다."',
    name: "한지원",
    role: "라이프스타일 브랜드 운영팀장",
    image:
      "https://api.builder.io/api/v1/image/assets/TEMP/2e851b7efc174cf0206c89452d0c634f9bd38e5a?width=96",
  },
];

const avatarImages = [
  "https://api.builder.io/api/v1/image/assets/TEMP/0ac42fae3d11b81eb7c6e1162f717677e8231db4?width=64",
  "https://api.builder.io/api/v1/image/assets/TEMP/94c3380f2fa253262888942084e0b5176c598e77?width=64",
  "https://api.builder.io/api/v1/image/assets/TEMP/85e5b4d17895e3f50ddb661f122c4a62c6215d7f?width=64",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#F8F9FC]">
        <div className="mx-auto grid max-w-[1512px] grid-cols-1 items-center gap-16 px-6 py-20 lg:grid-cols-2 lg:gap-12 lg:px-[120px] lg:py-24">
          <div className="flex flex-col items-start gap-10">
            <span className="animate-fade-up inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              <span className="text-[13px] font-bold uppercase tracking-wide text-indigo-500">
                쿠팡 · 네이버 · 지그재그 통합 모니터링
              </span>
            </span>

            <div className="flex flex-col gap-4">
              <h1 className="animate-fade-up text-4xl font-extrabold leading-[1.35] tracking-tight text-[#1A1F27] [animation-delay:100ms] sm:text-5xl">
                리뷰로 터지기 전에,
                <br />
                <span className="text-indigo-500">CS 이상 신호</span>를
                <br />
                먼저 짚어드립니다
              </h1>
              <p className="animate-fade-up pt-2 text-base leading-relaxed text-slate-500 [animation-delay:200ms] sm:text-lg">
                채널마다 흩어진 문의·반품 데이터를 한 화면에 모으고, 평소와
                다른 패턴이 보이면 원인 가설과 대응안까지 근거 문서와 함께
                제시합니다. 확인은 셀러가, 판단의 무게는 SELLoN이 나눠
                집니다.
              </p>
            </div>

            <div className="animate-fade-up flex flex-col items-start gap-4 [animation-delay:300ms]">
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className="rounded-2xl bg-[#101828] px-8 py-4 text-base font-bold tracking-tight text-white transition-transform hover:scale-[1.02] sm:text-lg"
                >
                  무료로 채널 연결하기
                </Link>
                <Link
                  href="/cs?view=inquiry"
                  className="rounded-2xl border border-slate-200 bg-white px-8 py-4 text-base font-bold tracking-tight text-[#1A1F27] transition-colors hover:bg-slate-50 sm:text-lg"
                >
                  서비스 소개서 받기
                </Link>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center">
                  {avatarImages.map((src, i) => (
                    <img
                      key={src}
                      src={src}
                      alt="User"
                      className={`h-8 w-8 rounded-full border-2 border-white object-cover ${i !== 0 ? "-ml-2" : ""}`}
                    />
                  ))}
                </div>
                <p className="text-sm font-semibold text-slate-400">
                  현재 <span className="text-slate-600">244개 브랜드</span>가
                  함께 지켜보고 있어요
                </p>
              </div>
            </div>
          </div>

          <div className="animate-fade-up flex justify-center [animation-delay:150ms] lg:justify-end">
            <HeroDashboardMock />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-100 bg-white">
        <Reveal className="mx-auto grid max-w-[1512px] grid-cols-2 px-6 py-14 sm:grid-cols-4 lg:px-[120px]">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center gap-2 px-4 py-4 sm:px-8 ${
                i !== stats.length - 1 ? "sm:border-r sm:border-slate-100" : ""
              } ${i % 2 === 0 ? "border-r border-slate-100 sm:border-r-0" : ""}`}
            >
              <div className="flex items-baseline gap-1">
                <span className="bg-indigo-500 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl lg:text-6xl">
                  {stat.value}
                </span>
                {stat.suffix && (
                  <span className="text-xl font-bold text-slate-400 sm:text-2xl">
                    {stat.suffix}
                  </span>
                )}
              </div>
              <p className="text-center text-sm font-medium text-slate-500">
                {stat.label}
              </p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-[1512px] px-6 py-24 lg:px-[120px]">
        <Reveal className="flex flex-col gap-4">
          <span className="inline-flex w-fit items-center rounded-md bg-indigo-50 px-3 py-1">
            <span className="text-[13px] font-bold text-indigo-500">
              핵심 기능
            </span>
          </span>
          <h2 className="whitespace-nowrap text-3xl font-extrabold leading-tight tracking-tight text-[#1A1F27] sm:text-4xl">
            감지부터 개선안 승인까지, 한 흐름으로 이어집니다
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Reveal className="flex flex-col gap-4 rounded-[32px] border border-slate-100 bg-white p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] lg:row-span-2">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50">
              <Plug className="h-5 w-5 text-indigo-500" />
            </span>
            <h3 className="pt-2 text-xl font-bold text-[#1A1F27] sm:text-2xl">
              채널 하나로 API 연결, 3개 채널 동시 관리
            </h3>
            <p className="pb-4 leading-relaxed text-slate-500">
              쿠팡·네이버·지그재그의 API 키를 등록하면 형식 검증부터 연결
              상태 표시까지 자동으로 처리됩니다. 실패 시 사유를 바로 안내하고
              재시도 할 수 있어요.
            </p>
            <div className="flex flex-col items-center gap-8 rounded-2xl bg-[#F8F9FC] px-6 py-8 sm:flex-row sm:justify-center">
              <div className="flex flex-col items-center gap-2">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500 shadow-lg shadow-indigo-100">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </span>
                <span className="text-xs font-bold text-[#1A1F27]">
                  SELLoN
                </span>
              </div>
              <div className="hidden h-0.5 flex-1 bg-gradient-to-r from-indigo-500 to-slate-200 sm:block" />
              <div className="flex w-full flex-col gap-3 sm:w-auto">
                {channels.map((ch) => (
                  <div
                    key={ch.name}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-2 shadow-sm"
                  >
                    <span
                      className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ background: ch.color }}
                    >
                      {ch.badge}
                    </span>
                    <span className="whitespace-nowrap text-[13px] font-semibold text-[#1A1F27]">
                      {ch.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal
            delay={60}
            className="flex flex-col gap-3 rounded-[32px] border border-slate-100 bg-white p-8 pb-12 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              <Activity className="h-[18px] w-[18px] text-emerald-500" />
            </span>
            <h3 className="pt-3 text-lg font-bold text-[#1A1F27] sm:text-xl">
              STL 기반 이상탐지
            </h3>
            <p className="leading-relaxed text-slate-500">
              트렌드·계절성을 분리한 잔차 z-score로 진짜 이상만 골라내고,
              데이터가 부족한 상품은 이동평균 방식으로 자동 전환합니다.
            </p>
          </Reveal>

          <Reveal
            delay={120}
            className="flex flex-col gap-3 rounded-[32px] border border-slate-100 bg-white p-8 pb-12 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
              <GitCompareArrows className="h-[18px] w-[18px] text-red-500" />
            </span>
            <h3 className="pt-3 text-lg font-bold text-[#1A1F27] sm:text-xl">
              채널 비교 분석
            </h3>
            <p className="leading-relaxed text-slate-500">
              같은 상품이라도 채널마다 다른 CS 분포를 비교해, 채널 문제인지
              상품 자체 문제인지 편중형·전역형으로 구분해 보여줍니다.
            </p>
          </Reveal>

          <Reveal
            delay={60}
            className="flex flex-col gap-3 rounded-[32px] border border-slate-100 bg-white p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
              <FileSearch className="h-[18px] w-[18px] text-amber-500" />
            </span>
            <h3 className="pt-3 text-lg font-bold text-[#1A1F27] sm:text-xl">
              근거 기반 AI 인사이트 리포트
            </h3>
            <p className="leading-relaxed text-slate-500">
              상세페이지 수정 이력, 과거 이상 사례를 검색해 원인 가설을
              세우고, 모든 핵심 주장에 인용 근거를 붙여 확인할 수 있게
              합니다.
            </p>
          </Reveal>

          <Reveal
            delay={120}
            className="flex flex-col gap-3 rounded-[32px] border border-slate-100 bg-white p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
              <ShieldCheck className="h-[18px] w-[18px] text-violet-500" />
            </span>
            <h3 className="pt-3 text-lg font-bold text-[#1A1F27] sm:text-xl">
              승인 전엔 아무것도 반영되지 않아요
            </h3>
            <p className="leading-relaxed text-slate-500">
              개선안은 셀러의 승인 후에만 적용됩니다. 반려하면 사유가 다음
              분석에 반영되어 같은 실수를 반복하지 않습니다.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-slate-50/50 py-24">
        <div className="mx-auto flex max-w-[1512px] flex-col gap-16 px-6 lg:px-[120px]">
          <Reveal className="flex flex-col items-center gap-4">
            <span className="inline-flex items-center rounded-md bg-white px-3 py-1 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]">
              <span className="text-[13px] font-bold text-indigo-500">
                셀러 후기
              </span>
            </span>
            <h2 className="max-w-2xl text-center text-3xl font-extrabold tracking-tight text-[#1A1F27] sm:text-4xl">
              놓쳤을 신호를, 미리 짚어준다는 것
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal
                key={t.name}
                delay={i * 80}
                className="flex flex-col gap-6 rounded-[32px] border border-slate-100 bg-white p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]"
              >
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-[15px] font-medium leading-relaxed text-[#1A1F27]">
                  {t.quote}
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="text-[15px] font-bold text-[#1A1F27]">
                      {t.name}
                    </span>
                    <span className="text-[13px] text-slate-400">
                      {t.role}
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        id="cta"
        className="bg-gradient-to-b from-violet-900/5 to-white py-32"
      >
        <Reveal className="mx-auto flex max-w-[1512px] flex-col items-center gap-6 px-6 text-center lg:px-[120px]">
          <h2 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-[#1A1F27] sm:text-4xl">
            다음 이상 신호가 오기 전에,
            <br />
            채널을 먼저 연결해두세요
          </h2>
          <p className="max-w-xl text-base text-slate-500 sm:text-lg">
            API 키 등록은 5분이면 끝나고, 첫 이상탐지 배치는 바로 다음
            주기부터 시작됩니다.
          </p>
          <div className="flex flex-col items-center gap-6 pt-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="flex items-center gap-2 rounded-2xl bg-indigo-500 px-10 py-5 text-lg font-bold text-white shadow-2xl shadow-indigo-200 transition-transform hover:scale-[1.02]"
              >
                무료로 시작하기
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/cs?view=inquiry"
                className="rounded-2xl border border-slate-200 bg-white px-10 py-5 text-lg font-bold text-[#1A1F27] transition-colors hover:bg-slate-50"
              >
                도입 문의하기
              </Link>
            </div>
            <p className="text-sm text-slate-400">
              신용카드 등록 없이 시작 · 언제든 채널 연결 해제 가능
            </p>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
