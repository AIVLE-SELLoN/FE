import { api } from '../client';
import { loginResponseSchema, type LoginResponse } from './types';
import { useAuthStore } from '@/store/useAuthStore';
import { verificationTokenSchema, signupResponseSchema, type VerificationTokenResponse, type SignupResponse } from './types';

interface LoginRequest {
  email: string;
  password: string;
}

export async function postLogin(req: LoginRequest): Promise<LoginResponse> {
  const { data, headers } = await api.postRaw<unknown>('/api/v1/sellon/auth/login', req);

  const stripBearer = (v: string | null) => v?.replace(/^Bearer\s+/i, '') ?? null;
  const accessToken = stripBearer(headers.get('Authorization'));
  const refreshToken = stripBearer(headers.get('Refresh-Token'));
  if (accessToken && refreshToken) {
    useAuthStore.getState().setTokens(accessToken, refreshToken);
  }

  return loginResponseSchema.parse(data);
}

export async function sendEmailVerification(email: string): Promise<void> {
  await api.get<void>('/api/v1/sellon/verification/email-verification', { params: { email } });
}

export async function confirmEmailVerification(email: string, code: string): Promise<VerificationTokenResponse> {
  const data = await api.get<unknown>('/api/v1/sellon/verification/email-verification/confirm', {
    params: { email, code },
  });
  return verificationTokenSchema.parse(data);
}

export async function signupRoot(req: {
  email: string; password: string; name: string; companyName: string; verificationToken: string;
}): Promise<SignupResponse> {
  const data = await api.post<unknown>('/api/v1/sellon/auth/register/root', req);
  return signupResponseSchema.parse(data);
}

export async function signupMember(req: {
  email: string; password: string; name: string; companyKey: string; verificationToken: string;
}): Promise<SignupResponse> {
  const data = await api.post<unknown>('/api/v1/sellon/auth/register/member', req);
  return signupResponseSchema.parse(data);
}