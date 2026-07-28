import { z } from 'zod';

// TODO: Notion API 명세서 기준으로 실제 응답 스키마 채우기 (대시보드)
export const dashboardResponseSchema = z.object({});

export type DashboardResponse = z.infer<typeof dashboardResponseSchema>;
