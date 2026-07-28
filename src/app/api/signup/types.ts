import { z } from 'zod';

// TODO: Notion API 명세서 기준으로 실제 응답 스키마 채우기 (회원가입)
export const signupResponseSchema = z.object({});

export type SignupResponse = z.infer<typeof signupResponseSchema>;
