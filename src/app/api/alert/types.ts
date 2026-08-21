import { z } from 'zod';

// BE `NotificationType` enum과 맞춤
// 도메인 알림이 늘어나면 여기도 같이 추가해야 목록 파싱이 깨지지 않아요.
export const notificationTypeSchema = z.enum(['ANOMALY_DETECTED', 'MONTHLY_REPORT_GENERATED']);
export type NotificationType = z.infer<typeof notificationTypeSchema>;

export const alertSummarySchema = z.object({
  notificationId: z.number(),
  type: notificationTypeSchema,
  message: z.string(),
  notifiedAt: z.string(),
  isRead: z.boolean(),
  notificationTargetId: z.number().nullable(),
});
export type AlertSummary = z.infer<typeof alertSummarySchema>;

export const alertListResponseSchema = z.object({
  items: z.array(alertSummarySchema),
  totalCount: z.number(),
  unreadCount: z.number(),
  hasNext: z.boolean(),
  nextCursor: z.string().nullable(),
});
export type AlertListResponse = z.infer<typeof alertListResponseSchema>;

export const alertReadResponseSchema = z.object({
  notificationId: z.number(),
  isRead: z.boolean(),
  unreadCount: z.number(),
});
export type AlertReadResponse = z.infer<typeof alertReadResponseSchema>;

export const alertChannelSchema = z.enum(['COUPANG', 'NAVER', 'ZIGZAG', 'ALL']);
export type AlertChannel = z.infer<typeof alertChannelSchema>;

export const aspectSchema = z.enum(['색상', '사이즈', '소재', '파손', '오배송', '기타']);
export type Aspect = z.infer<typeof aspectSchema>;

export const verdictSchema = z.enum(['정상', '편중형', '전역형', '잠정 전역형', '구분불가']);
export type Verdict = z.infer<typeof verdictSchema>;

export const detectionConfidenceSchema = z.enum(['높음', '중간', '낮음', '해당없음']);
export type DetectionConfidence = z.infer<typeof detectionConfidenceSchema>;

export const recommendedActionSchema = z.enum([
  '개선안 생성',
  '채널 운영 요소 점검 권장',
  '물류 점검 권장',
  '운영 점검 권장',
  '상품 자체 점검 권장',
  '편중·전역 구분 불가(채널 표본 부족)',
  '기타 유형',
]);
export type RecommendedAction = z.infer<typeof recommendedActionSchema>;

export const alertStatusSchema = z.enum(['UNRESOLVED', 'RESOLVED']);
export const statsSourceSchema = z.enum(['cs', 'review']);

export const statsResponseSchema = z
  .object({
    source: statsSourceSchema,
    curRate: z.number(),
    pastRate: z.number(),
    delta: z.number(),
    bhSignificant: z.boolean(),
    curTotal: z.number(),
  })
  .nullable();

export const rootCauseResponseSchema = z
  .object({
    label: z.string().nullable(),
    count: z.number().nullable(),
    total: z.number().nullable(),
    consistent: z.boolean().nullable(),
  })
  .nullable();

export const sourceSignalsResponseSchema = z
  .object({
    cs: z.boolean().nullable(),
    review: z.boolean().nullable(),
    interpretation: z.string().nullable(),
  })
  .nullable();

// GET /alerts/{id} 응답의 alert.channelRates 항목 하나. rate는 0~1 비율(BigDecimal)로 내려와요.
export const channelRateResponseSchema = z.object({
  channel: z.string(), // 백엔드가 순수 문자열로 내려줘서 alertChannelSchema로 좁히지 않고 그대로 둠 (미리 정의 안 된 값이 와도 파싱 실패하지 않도록)
  rate: z.number().nullable(),
  excluded: z.boolean().nullable(),
  total: z.number().nullable(),
});
export type ChannelRateResponse = z.infer<typeof channelRateResponseSchema>;

export const alertResponseSchema = z
  .object({
    alertCode: z.string().nullable(),
    updatesAlertCode: z.string().nullable(),
    detectedAt: z.string().nullable(),
    productGroupId: z.string().nullable(),
    channel: alertChannelSchema.nullable(),
    mainAspect: aspectSchema.nullable(),
    verdict: verdictSchema.nullable(),
    detectionConfidence: detectionConfidenceSchema.nullable(),
    recommendedAction: recommendedActionSchema.nullable(),
    alertStatus: alertStatusSchema.nullable(),
    scopeIn: z.boolean(),
    stats: statsResponseSchema,
    rootCause: rootCauseResponseSchema,
    sourceSignals: sourceSignalsResponseSchema,
    // 상세 페이지 "채널별 비교 분석" 막대그래프에 쓰는 채널별 비율 목록
    channelRates: z.array(channelRateResponseSchema),
    // 집계 기간 (LocalDate, 예: "2026-06-24")
    windowStart: z.string().nullable(),
    windowEnd: z.string().nullable(),
  })
  .nullable();

export const alertDetailResponseSchema = z.object({
  notificationId: z.number(),
  type: notificationTypeSchema,
  message: z.string(),
  notifiedAt: z.string(),
  isRead: z.boolean(),
  notificationTargetId: z.number().nullable(),
  alert: alertResponseSchema,
});
export type AlertDetailResponse = z.infer<typeof alertDetailResponseSchema>;