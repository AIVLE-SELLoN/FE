import { z } from 'zod';

// GuidelineAvailability: 파일이 아직 S3에 살아있으면 COMPLETED, 보관기한(7일) 지나서 없어졌으면 EXPIRED
// (다운로드 시 EXPIRED여도 서버가 자동 재생성해줌)
export const guidelineAvailabilitySchema = z.enum(['COMPLETED', 'EXPIRED']);
export type GuidelineAvailability = z.infer<typeof guidelineAvailabilitySchema>;

// GET /api/v1/sellon/guidelines/files 항목 하나
export const guidelineFileResponseSchema = z.object({
  guidelineId: z.string(),
  originalFileName: z.string(),
  createdAt: z.string(), // LocalDateTime, 예: "2026-07-01T09:00:00"
  fileSizeBytes: z.number().nullable(),
  status: guidelineAvailabilitySchema,
});
export type GuidelineFileResponse = z.infer<typeof guidelineFileResponseSchema>;

// 커서 페이지 공통 래퍼
export const guidelineFileCursorPageResponseSchema = z.object({
  content: z.array(guidelineFileResponseSchema),
  nextCursor: z.string().nullable(),
  hasNext: z.boolean(),
});
export type GuidelineFileCursorPageResponse = z.infer<typeof guidelineFileCursorPageResponseSchema>;

// POST /api/v1/sellon/guidelines/{guidelineId}/download 응답
export const guidelineDownloadResponseSchema = z.object({
  originalFileName: z.string(),
  downloadUrl: z.string(),
  regenerated: z.boolean(),
});
export type GuidelineDownloadResponse = z.infer<typeof guidelineDownloadResponseSchema>;

// GET /api/v1/sellon/guidelines 목록 한 줄
// 참고: 백엔드에 "처리중/대기중" 같은 워크플로 상태는 없어요. 가이드라인은 알림 발생 시
// 외부 AI 서비스가 이미 완성된 PDF로 만들어 큐로 보내주고, status는 그 PDF가 아직
// S3에 살아있는지(COMPLETED) 보관기한이 지났는지(EXPIRED)만 나타내요.
export const guidelineListItemResponseSchema = z.object({
  guidelineId: z.string(),
  title: z.string(),
  productName: z.string().nullable(),
  detectedAt: z.string().nullable(), // LocalDateTime
  status: guidelineAvailabilitySchema,
});
export type GuidelineListItemResponse = z.infer<typeof guidelineListItemResponseSchema>;

export const guidelineListCursorPageResponseSchema = z.object({
  content: z.array(guidelineListItemResponseSchema),
  nextCursor: z.string().nullable(),
  hasNext: z.boolean(),
});
export type GuidelineListCursorPageResponse = z.infer<typeof guidelineListCursorPageResponseSchema>;

// GET /api/v1/sellon/guidelines/{guidelineId} 상세
// downloadUrl은 다운로드가 아니라 PDF 인라인 뷰어 URL이에요.
// approved/comment는 운영 MD 승인 여부와 그때 남긴 코멘트 (승인 전이면 comment는 null)
export const guidelineDetailResponseSchema = z.object({
  guidelineId: z.string(),
  title: z.string(),
  productName: z.string().nullable(),
  detectedAt: z.string().nullable(),
  status: guidelineAvailabilitySchema,
  downloadUrl: z.string().nullable(),
  approved: z.boolean(),
  comment: z.string().nullable(),
});
export type GuidelineDetailResponse = z.infer<typeof guidelineDetailResponseSchema>;