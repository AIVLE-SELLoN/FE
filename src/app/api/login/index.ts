import { api } from '../client';
import { loginResponseSchema, type LoginResponse } from './types';

// TODO: 실제 엔드포인트로 교체 (Notion API 명세서 참고)
export async function postLogin(): Promise<LoginResponse> {
  const res = await api.post<unknown>('/login');
  return loginResponseSchema.parse(res);
}
