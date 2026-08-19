import { z } from 'zod';

// TODO: Notion API 명세서 기준으로 실제 응답 스키마 채우기 (인증)
export const authResponseSchema = z.object({});

export type AuthResponse = z.infer<typeof authResponseSchema>;

export const loginResponseSchema = z.object({
  userId: z.number(),
  email: z.string(),
  name: z.string(),
  role: z.enum(['ROOT', 'MEMBER', 'ADMIN']),
  companyKey: z.string().nullable(),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;


export const verificationTokenSchema = z.object({
  verificationToken: z.string(),
});
export type VerificationTokenResponse = z.infer<typeof verificationTokenSchema>;

export const signupResponseSchema = z.object({
  userId: z.number(),
  email: z.string(),
  role: z.enum(['ROOT', 'MEMBER', 'ADMIN']),
  companyKey: z.string().nullable(),
});
export type SignupResponse = z.infer<typeof signupResponseSchema>;