import { z } from 'zod';

// TODO: Notion API 명세서 기준으로 실제 응답 스키마 채우기 (이상알림)
export const alertResponseSchema = z.object({});

export type AlertResponse = z.infer<typeof alertResponseSchema>;
