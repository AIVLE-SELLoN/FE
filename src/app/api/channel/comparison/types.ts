import { z } from 'zod';

// GET /channels/comparison 항목 하나
export const channelComparisonItemSchema = z.object({
  usersChannelKey: z.number(),
  channelType: z.string(), // "COUPANG" | "NAVER" | "ZIGZAG"
  totalInquiryCount: z.number(),
  totalInquiryChangeRate: z.number().nullable(),
  totalInquiryComment: z.string().nullable(),
  // 아래 6개는 백엔드에서 Double(nullable)로 내려와요 — 집계할 주문/리뷰/문의가 없으면 null이 그대로 옵니다.
  inquiryRatePerOrder: z.number().nullable(),
  inquiryRateComment: z.string().nullable(),
  avgRating: z.number().nullable(),
  avgRatingComment: z.string().nullable(),
  reviewRatePerOrder: z.number().nullable(),
  reviewRateComment: z.string().nullable(),
  positiveRatio: z.number().nullable(),
  neutralRatio: z.number().nullable(),
  negativeRatio: z.number().nullable(),
  sentimentComment: z.string().nullable(),
  aspectComment: z.string().nullable(),
});
export type ChannelComparisonItem = z.infer<typeof channelComparisonItemSchema>;

// inquireType은 백엔드 InquiryType enum이 @JsonValue로 한글 라벨을 그대로 내려줌 (색상/사이즈/소재/파손/오배송/기타)
export const channelInquiryTypeItemSchema = z.object({
  inquireType: z.string(),
  inquiryCount: z.number(),
  ratio: z.number(),
});
export type ChannelInquiryTypeItem = z.infer<typeof channelInquiryTypeItemSchema>;

// GET /channels/comparison/inquiry-type-radar 항목 하나 (채널별 문의 유형 전체 분포)
export const channelInquiryTypeRadarItemSchema = z.object({
  usersChannelKey: z.number(),
  channelType: z.string(),
  distribution: channelInquiryTypeItemSchema.array(),
});
export type ChannelInquiryTypeRadarItem = z.infer<typeof channelInquiryTypeRadarItemSchema>;

export const channelMonthlyItemSchema = z.object({
  yearMonth: z.string(),
  inquiryCount: z.number(),
});
export type ChannelMonthlyItem = z.infer<typeof channelMonthlyItemSchema>;

export const channelInsightItemSchema = z.object({
  content: z.string(),
});
export type ChannelInsightItem = z.infer<typeof channelInsightItemSchema>;