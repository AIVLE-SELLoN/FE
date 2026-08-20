import { z } from 'zod';

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

export const findIdResponseSchema = z.object({
  maskedEmail: z.string(),
});
export type FindIdResponse = z.infer<typeof findIdResponseSchema>;

export const findPasswordResponseSchema = z.object({
  maskedEmail: z.string(),
});
export type FindPasswordResponse = z.infer<typeof findPasswordResponseSchema>;