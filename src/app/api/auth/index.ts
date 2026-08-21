import { api } from '../client';
import { loginResponseSchema, type LoginResponse } from './types';
import { useAuthStore } from '@/store/useAuthStore';
import { verificationTokenSchema, signupResponseSchema, findIdResponseSchema, findPasswordResponseSchema,
  FindIdResponse, FindPasswordResponse, VerificationTokenResponse, SignupResponse } from './types';

interface LoginRequest {
  email: string;
  password: string;
}

function applyTokensFromHeaders(headers: Headers) {
  const stripBearer = (v: string | null) => v?.replace(/^Bearer\s+/i, '') ?? null;
  const accessToken = stripBearer(headers.get('Authorization'));
  const refreshToken = stripBearer(headers.get('Refresh-Token'));
  if (accessToken && refreshToken) {
    useAuthStore.getState().setTokens(accessToken, refreshToken);
  }
}

export async function postLogin(req: LoginRequest): Promise<LoginResponse> {
  const { data, headers } = await api.postRaw<unknown>('/api/v1/sellon/auth/login', req);
  applyTokensFromHeaders(headers);
  return loginResponseSchema.parse(data);
}

// 시연용 원클릭 로그인 버튼 전용 - 자격 증명 없이 서버에 설정된 데모 계정으로 바로 로그인
export async function postDemoLogin(): Promise<LoginResponse> {
  const { data, headers } = await api.postRaw<unknown>('/api/v1/sellon/auth/demo-login');
  applyTokensFromHeaders(headers);
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

export async function findId(req: { companyName: string; userName: string }): Promise<FindIdResponse> {
  const data = await api.post<unknown>('/api/v1/sellon/auth/find-id', req);
  return findIdResponseSchema.parse(data);
}
 
// 비밀번호 찾기 - 가입 이메일로 임시 비밀번호를 즉시 발급/발송
// 일치하는 계정이 없으면 백엔드가 404를 내려줘요 (ApiError)
export async function findPassword(req: { email: string }): Promise<FindPasswordResponse> {
  const data = await api.post<unknown>('/api/v1/sellon/auth/find-password', req);
  return findPasswordResponseSchema.parse(data);
}