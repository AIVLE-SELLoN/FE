import { api } from '../client';
import { csResponseSchema, type CsResponse } from './types';

// TODO: 실제 엔드포인트로 교체 (Notion API 명세서 참고)
export async function getCs(): Promise<CsResponse> {
  const res = await api.get<unknown>('/cs');
  return csResponseSchema.parse(res);
}
