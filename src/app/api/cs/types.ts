import { z } from 'zod';

// TODO: Notion API 명세서 기준으로 실제 응답 스키마 채우기 (고객지원)
export const csResponseSchema = z.object({});

export type CsResponse = z.infer<typeof csResponseSchema>;
