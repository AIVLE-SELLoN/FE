import { z } from 'zod';

// TODO: Notion API 명세서 기준으로 실제 응답 스키마 채우기 (회원설정, 신규 분리)
export const mypageResponseSchema = z.object({});

export type MypageResponse = z.infer<typeof mypageResponseSchema>;
