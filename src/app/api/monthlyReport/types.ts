import { z } from 'zod';

// 백엔드 ReportStatus enum과 그대로 맞춤
export const reportStatusSchema = z.enum([
  'SUCCESS',
  'HOLD_INSUFFICIENT_DATA',
  'FAILED_VALIDATION',
  'FAILED_SIZE_EXCEEDED',
  'FAILED_ERROR',
]);
export type ReportStatus = z.infer<typeof reportStatusSchema>;

export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  SUCCESS: '생성 완료',
  HOLD_INSUFFICIENT_DATA: '데이터 부족으로 보류',
  FAILED_VALIDATION: '검증 실패',
  FAILED_SIZE_EXCEEDED: '용량 초과 실패',
  FAILED_ERROR: '생성 실패',
};

// SUCCESS일 때만 downloadUrl/originalFileName이 유효하다고 가정 (그 외 상태는 PDF 자체가 없음)
export function isDownloadable(status: ReportStatus): boolean {
  return status === 'SUCCESS';
}

// GET /api/v1/sellon/reports, /reports/latest, /reports/{reportId} 공통 응답 (ReportResponse.java)
export const reportResponseSchema = z.object({
  id: z.number(),
  reportId: z.string(),
  reportMonth: z.string(), // 예: "2026-08"
  status: reportStatusSchema,
  noticeMessage: z.string().nullable(),
  originalFileName: z.string().nullable(),
  downloadUrl: z.string().nullable(),
});
export type ReportResponse = z.infer<typeof reportResponseSchema>;