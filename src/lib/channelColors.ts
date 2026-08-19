/**
 * 채널 브랜드 색상 단일 소스.
 *
 * 채널을 색으로 구분하는 화면(대시보드, 채널 비교 분석 등)은 여기 값만 참조합니다.
 * 페이지별로 하드코딩하면 같은 채널이 화면마다 다른 색으로 보이므로 추가 금지.
 */

export const CHANNEL_KEYS = ["coupang", "naver", "zigzag"] as const;

export type ChannelKey = (typeof CHANNEL_KEYS)[number];

/** 화면에 노출되는 채널 표시명 */
export const CHANNEL_LABELS: Record<ChannelKey, string> = {
  coupang: "쿠팡",
  naver: "네이버",
  zigzag: "지그재그",
};

/** 뱃지에 쓰는 채널 이니셜 */
export const CHANNEL_INITIALS: Record<ChannelKey, string> = {
  coupang: "C",
  naver: "N",
  zigzag: "Z",
};

/**
 * 채널 본색 — 점, 막대, 차트 선, 강조 텍스트에 사용.
 * 전부 흰 배경 기준 대비 3:1 이상이라 큰 글씨(18px 이상 bold) 색으로 써도 괜찮아요.
 */
export const CHANNEL_COLORS: Record<ChannelKey, string> = {
  coupang: "#E8442A",
  naver: "#1F9254",
  zigzag: "#F742DA",
};

/**
 * 연한 배경 + 그 위에 올리는 글자색 조합 — 이니셜 뱃지 등에 사용.
 * 본색을 그대로 배경에 쓰면 너무 진해서 별도로 둡니다.
 */
export const CHANNEL_TINTS: Record<ChannelKey, { bg: string; fg: string }> = {
  coupang: { bg: "#FFDCD2", fg: "#C0331B" },
  naver: { bg: "#D6F5D6", fg: "#1F9254" },
  zigzag: { bg: "#FCDCF6", fg: "#C22BA4" },
};
