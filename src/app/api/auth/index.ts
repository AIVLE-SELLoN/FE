import { api } from '../client';
import { authResponseSchema, type AuthResponse } from './types';

// TODO: 실제 엔드포인트로 교체 (Notion API 명세서 참고)
export async function getAuth(): Promise<AuthResponse> {
  const res = await api.get<unknown>('/auth');
  return authResponseSchema.parse(res);
}
