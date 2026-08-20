import { z } from 'zod';

export const alertChannelSchema = z.enum(['COUPANG', 'NAVER', 'ZIGZAG', 'ALL']);
export type AlertChannelType = z.infer<typeof alertChannelSchema>;

export const channelSummaryItemSchema = z.object({
  channel: alertChannelSchema,
  channelName: z.string(), // 백엔드가 이미 한글 라벨("쿠팡"/"네이버"/"지그재그")로 내려줌
  csCount: z.number(),
  orderCount: z.number(),
  avgRating: z.number().nullable(),
});
export type ChannelSummaryItem = z.infer<typeof channelSummaryItemSchema>;

// 조치 유형별 건수 — 백엔드 RecommendedAction enum과 매칭
export const actionSummaryItemSchema = z.object({
  action: z.string(), // enum 이름 그대로 (예: "GENERATE_RECOMMENDATION")
  actionName: z.string(), // 한글 라벨 (예: "개선안 생성")
  count: z.number(),
});
export type ActionSummaryItem = z.infer<typeof actionSummaryItemSchema>;

export const alertStatusSchema = z.enum(['UNRESOLVED', 'RESOLVED']);
export type AlertStatusType = z.infer<typeof alertStatusSchema>;

// 최근 발생한 이상 알림 — 대시보드용 요약 (알림함의 AlertSummaryResponse와는 별개 DTO)
export const recentAlertItemSchema = z.object({
  alertCode: z.string(),
  productGroupId: z.string().nullable(),
  productName: z.string().nullable(),
  channel: alertChannelSchema,
  channelName: z.string(),
  mainAspect: z.string().nullable(), // Aspect enum, 이미 한글 라벨로 내려옴
  alertStatus: alertStatusSchema,
  detectedAt: z.string().nullable(),
});
export type RecentAlertItem = z.infer<typeof recentAlertItemSchema>;

// GET /api/v1/sellon/dashboard 응답
export const dashboardResponseSchema = z.object({
  unreadNotificationCount: z.number(),
  channelSummary: channelSummaryItemSchema.array(),
  actionSummary: actionSummaryItemSchema.array(),
  recentAlerts: recentAlertItemSchema.array(),
});
export type DashboardData = z.infer<typeof dashboardResponseSchema>;

export type DashboardPeriod = '1D' | '7D' | '30D';