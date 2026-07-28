import { z } from 'zod';

// TODO: Notion API 명세서 기준으로 실제 응답 스키마 채우기 (랜딩페이지)
export const landingResponseSchema = z.object({});

export type LandingResponse = z.infer<typeof landingResponseSchema>;
