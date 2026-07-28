import { z } from 'zod';

// TODO: Notion API 명세서 기준으로 실제 응답 스키마 채우기 (로그인)
export const loginResponseSchema = z.object({});

export type LoginResponse = z.infer<typeof loginResponseSchema>;
