import { api } from '../client';
import { landingResponseSchema, type LandingResponse } from './types';

// TODO: 실제 엔드포인트로 교체 (Notion API 명세서 참고)
export async function getLanding(): Promise<LandingResponse> {
  const res = await api.get<unknown>('/landing');
  return landingResponseSchema.parse(res);
}
