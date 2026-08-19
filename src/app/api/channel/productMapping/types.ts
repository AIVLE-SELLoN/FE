import { z } from 'zod';

export const mappingStatusSchema = z.enum([
  'AUTO_MATCHED',
  'NORMALIZED_MATCHED',
  'UNMATCHED',
  'MANUAL_CONFIRMED',
  'SKIPPED',
]);
export type MappingStatus = z.infer<typeof mappingStatusSchema>;

export const mappingMethodSchema = z.enum(['DIRECTION', 'EMBEDDING', 'RULE', 'MANUAL']);
export type MappingMethod = z.infer<typeof mappingMethodSchema>;

// GET /channels/{usersChannelKey}/product-mappings 항목 하나
export const channelProductResponseSchema = z.object({
  variantRowId: z.string(),
  channelType: z.string(), // "COUPANG" | "NAVER" | "ZIGZAG"
  channelProductId: z.string(),
  productName: z.string(),
  optionName: z.string().nullable(),
  price: z.number().nullable(),
  productGroupId: z.string().nullable(),
  mappingMethod: mappingMethodSchema.nullable(),
  mappingStatus: mappingStatusSchema,
});
export type ChannelProductResponse = z.infer<typeof channelProductResponseSchema>;

// GET /channels/{usersChannelKey}/product-mappings/summary
export const mappingSummaryResponseSchema = z.object({
  unmatchedCount: z.number(),
  matchedCount: z.number(),
  totalCount: z.number(),
});
export type MappingSummaryResponse = z.infer<typeof mappingSummaryResponseSchema>;

// GET /channels/{usersChannelKey}/product-mappings/{variantRowId}/candidates
// 지금은 MockMatchCandidateClient가 항상 빈 배열을 줘서 AI 서버 연동 전까지는 실제로 안 채워짐
export const matchCandidateResponseSchema = z.object({
  masterProductKey: z.number(),
  productGroupId: z.string(),
  productName: z.string(),
  similarityScore: z.number(),
  topRecommendation: z.boolean(),
  reason: z.string(),
  channels: z.array(z.string()),
});
export type MatchCandidateResponse = z.infer<typeof matchCandidateResponseSchema>;