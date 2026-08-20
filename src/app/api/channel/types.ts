import { z } from 'zod';

// GET /channels/naver/authorize, POST /channels/connect 응답에 쓰이는 연동 상태값
export const connectionStatusSchema = z.enum(['CONNECTED', 'DISCONNECTED', 'PENDING']);
export type ConnectionStatus = z.infer<typeof connectionStatusSchema>;

// POST /channels/connect, GET /channels/naver/callback 공통 응답
export const channelConnectionResponseSchema = z.object({
  usersChannelKey: z.number(),
  channelType: z.string(), // "COUPANG" | "ZIGZAG" | "NAVER"
  connectionStatus: connectionStatusSchema,
});
export type ChannelConnectionResponse = z.infer<typeof channelConnectionResponseSchema>;

// GET /channels/naver/authorize 응답 (실제 네이버 붙기 전까지는 authorizationUrl이 목업 도메인)
export const naverAuthorizeResponseSchema = z.object({
  authorizationUrl: z.string(),
  state: z.string(),
});
export type NaverAuthorizeResponse = z.infer<typeof naverAuthorizeResponseSchema>;

// GET /channels/sync-logs 항목 하나
export const syncStatusSchema = z.enum(['SUCCESS', 'FAILED']);
export type SyncStatus = z.infer<typeof syncStatusSchema>;

export const channelSyncLogResponseSchema = z.object({
  syncLogKey: z.number(),
  channelType: z.string(), // "COUPANG" | "ZIGZAG" | "NAVER"
  syncedAt: z.string(), // LocalDateTime, 예: "2026-08-18T09:00:00"
  status: syncStatusSchema,
  syncedCount: z.number().nullable(),
  failReason: z.string().nullable(),
});
export type ChannelSyncLogResponse = z.infer<typeof channelSyncLogResponseSchema>;

// Spring Data Page<T> 공통 래퍼 (필요한 필드만)
export const syncLogPageResponseSchema = z.object({
  content: z.array(channelSyncLogResponseSchema),
  totalPages: z.number(),
  totalElements: z.number(),
  number: z.number(), // 현재 페이지, 0-based
  size: z.number(),
  first: z.boolean(),
  last: z.boolean(),
});
export type SyncLogPageResponse = z.infer<typeof syncLogPageResponseSchema>;