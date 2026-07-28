import { z } from 'zod';

// TODO: Notion API 명세서 기준으로 실제 응답 스키마 채우기 (월간리포트)
export const monthlyReportResponseSchema = z.object({});

export type MonthlyReportResponse = z.infer<typeof monthlyReportResponseSchema>;
