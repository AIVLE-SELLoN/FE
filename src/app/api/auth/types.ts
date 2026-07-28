import { z } from 'zod';

// TODO: Notion API 명세서 기준으로 실제 응답 스키마 채우기 (인증)
export const authResponseSchema = z.object({});

export type AuthResponse = z.infer<typeof authResponseSchema>;
