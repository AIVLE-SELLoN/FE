import { z } from 'zod';

// TODO: Notion API 명세서 기준으로 실제 응답 스키마 채우기 (개선리포트, 舊 인사이트리포트 + 개선안 통합)
export const reportResponseSchema = z.object({});

export type ReportResponse = z.infer<typeof reportResponseSchema>;
