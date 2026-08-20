import { Bell, ArrowRight } from "lucide-react";

const channelCards = [
  {
    name: "쿠팡",
    dot: "#FF5722",
    issues: "이상 3건",
    cs: "124건",
    orders: "1,892건",
    rating: "4.6",
  },
  {
    name: "네이버",
    dot: "#03C75A",
    issues: "이상 2건",
    cs: "88건",
    orders: "941건",
    rating: "4.4",
  },
  {
    name: "지그재그",
    dot: "#FF6699",
    issues: "이상 2건",
    cs: "219건",
    orders: "2,410건",
    rating: "4.9",
  },
];

// RecommendedAction enum 라벨과 맞춘 조치 유형별 건수 (막대 리스트)
const actionTypeCounts = [
  { label: "개선안 생성", count: 3 },
  { label: "상품 자체 점검 권장", count: 2 },
  { label: "물류 점검 권장", count: 1 },
];

const notifications = [
  {
    name: "오프숄더 니트 원피스 (크림)",
    sku: "KN-OP-023-CR",
    issue: "주문 급감 (전일 대비 -85%)",
    status: "미해결",
    image:
      "https://api.builder.io/api/v1/image/assets/TEMP/4806f7d3cd818e05116b626eb306ff4adf25d982?width=44",
  },
  {
    name: "린넨 와이드 슬랙스 (네이비)",
    sku: "SL-WN-004-NV",
    issue: "CS 문의 이상 (사이즈 불만 급증)",
    status: "미해결",
    image:
      "https://api.builder.io/api/v1/image/assets/TEMP/36511fdc3bad216c27f711509b1ac3860ad1cbbd?width=44",
  },
  {
    name: "데일리 코튼 티셔츠 (화이트)",
    sku: "TS-BC-001-WT",
    issue: "품절 임박 (잔여 재고 2개)",
    status: "해결됨",
    image:
      "https://api.builder.io/api/v1/image/assets/TEMP/f4be72df5033a064c3d016e2a39f5b8d16546a18?width=44",
  },
  {
    name: "실크 리본 블라우스 (핑크)",
    sku: "BL-SR-012-PK",
    issue: "CS 폭주 (누적 5건 대기중)",
    status: "미해결",
    image:
      "https://api.builder.io/api/v1/image/assets/TEMP/db6ca0f696104d3a0fc0243978ad17f05d555129?width=44",
  },
];

export default function HeroDashboardMock() {
  const maxCount = Math.max(...actionTypeCounts.map((a) => a.count));

  return (
    <div className="w-full max-w-[640px] rounded-2xl bg-[#F8F8FC] p-3 pb-5 text-[10px] shadow-2xl shadow-indigo-200/40">
      <div className="flex flex-col gap-1.5">
        <div className="pb-2.5">
          <h3 className="text-[11px] font-extrabold tracking-tight text-[#101828]">
            대시보드
          </h3>
          <p className="pt-0.5 text-[7px] text-[#99A1AF]">
            채널 전반의 현황을 한눈에 확인하세요
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-indigo-500/10 bg-indigo-50 p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500 shadow-md shadow-indigo-500/30">
              <Bell className="h-3.5 w-3.5 text-white" />
            </span>
            <div className="flex flex-col gap-1">
              <h4 className="text-[11px] font-bold text-indigo-500 underline underline-offset-2">
                아직 확인하지 않은 알림이 7건 있어요!
              </h4>
            </div>
          </div>
          <button className="flex flex-shrink-0 items-center gap-1 rounded-md bg-indigo-500 px-2.5 py-1.5 text-[7px] font-bold text-white">
            알림함 바로가기
            <ArrowRight className="h-1.5 w-1.5" />
          </button>
        </div>

        <div className="flex flex-col gap-1 pb-1 pt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="h-2.5 w-[3px] rounded-full bg-indigo-500" />
            <span className="text-[8px] font-semibold uppercase tracking-wide text-black">
              채널별 현황 요약
            </span>
            <span className="text-[6px] font-semibold uppercase tracking-wide text-[#99A1AF]">
              — CS 문의 · 주문 · 평균 평점
            </span>
          </div>
          <div className="grid grid-cols-1 gap-1.5 pt-1.5 sm:grid-cols-3">
            {channelCards.map((c) => (
              <div
                key={c.name}
                className="rounded-lg border border-gray-100 bg-white px-2.5 py-2 shadow-sm"
              >
                <div className="flex items-center gap-1">
                  <span
                    className="h-1 w-1 flex-shrink-0 rounded-full"
                    style={{ background: c.dot }}
                  />
                  <span className="text-[8px] font-bold text-[#101828]">
                    {c.name}
                  </span>
                  <span className="ml-auto rounded-full bg-[#FFF1F2] px-1 py-0.5 text-[6px] font-bold text-[#EC003F]">
                    {c.issues}
                  </span>
                </div>
                <div className="mt-2 flex">
                  <div className="flex-1 border-r border-gray-100 pr-1 text-center">
                    <p className="text-[6px] text-[#99A1AF]">CS 문의</p>
                    <p className="mt-0.5 text-[12px] font-extrabold text-[#101828]">
                      {c.cs}
                    </p>
                  </div>
                  <div className="flex-1 border-r border-gray-100 px-1 text-center">
                    <p className="text-[6px] text-[#99A1AF]">주문 건수</p>
                    <p className="mt-0.5 text-[12px] font-extrabold text-[#101828]">
                      {c.orders}
                    </p>
                  </div>
                  <div className="flex-1 pl-1 text-center">
                    <p className="text-[6px] text-[#99A1AF]">평균 리뷰 평점</p>
                    <p className="mt-0.5 text-[12px] font-extrabold text-[#101828]">
                      {c.rating}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 py-3">
          <span className="h-2.5 w-[3px] rounded-full bg-indigo-500" />
          <span className="text-[8px] font-bold text-[#101828]">
            지금 봐야 할 이슈
          </span>
          <span className="text-[7px] text-[#99A1AF]">
            — 즉시 확인이 필요한 이상 탐지 항목
          </span>
        </div>

        <div className="flex flex-col items-start gap-2 sm:flex-row">
          {/* 조치 유형별 건수 — 가로 바 리스트 */}
          <div className="w-full flex-shrink-0 rounded-xl border border-gray-100 bg-white px-3 py-3 shadow-sm sm:w-[240px]">
            <p className="pb-2.5 text-[8px] font-bold text-[#101828]">
              조치 유형별 건수
            </p>
            <div className="flex flex-col gap-2.5">
              {actionTypeCounts.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between pb-1 text-[7px]">
                    <span className="font-medium text-[#4A5565]">
                      {item.label}
                    </span>
                    <span className="font-bold text-[#101828]">
                      {item.count}건
                    </span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full flex-1 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2.5">
              <h4 className="text-[10px] font-bold text-[#101828]">
                최근 발생한 이상 알림
              </h4>
              <span className="flex items-center gap-0.5 text-[8px] font-bold text-indigo-500">
                전체보기
                <ArrowRight className="h-1.5 w-1.5" />
              </span>
            </div>
            <div className="flex flex-col">
              {notifications.map((n, i) => (
                <div
                  key={n.sku}
                  className={`flex items-center gap-2 px-3 py-2 ${
                    i !== notifications.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <img
                    src={n.image}
                    alt={n.name}
                    className="h-5 w-5 flex-shrink-0 rounded bg-gray-100 object-cover"
                  />
                  <div className="min-w-0 flex-shrink-0 basis-[38%]">
                    <p className="truncate text-[8px] font-bold text-[#101828]">
                      {n.name}
                    </p>
                    <p className="truncate text-[7px] text-[#99A1AF]">
                      SKU: {n.sku}
                    </p>
                  </div>
                  <p className="min-w-0 flex-1 truncate text-[8px] font-bold text-[#FF2056]">
                    {n.issue}
                  </p>
                  <span
                    className={`flex-shrink-0 rounded-full px-1.5 py-0.5 text-[7px] font-bold ${
                      n.status === "해결됨"
                        ? "bg-[#D0FAE5] text-[#009966]"
                        : "bg-[#FFF1F2] text-[#EC003F]"
                    }`}
                  >
                    {n.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
