import { api } from '../client';
import { signupResponseSchema, type SignupResponse } from './types';

// TODO: 실제 엔드포인트로 교체 (Notion API 명세서 참고)
export async function postSignup(): Promise<SignupResponse> {
  const res = await api.post<unknown>('/signup');
  return signupResponseSchema.parse(res);
}
