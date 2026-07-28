import { api } from '../client';
import { alertResponseSchema, type AlertResponse } from './types';

// TODO: 실제 엔드포인트로 교체 (Notion API 명세서 참고)
export async function getAlert(): Promise<AlertResponse> {
  const res = await api.get<unknown>('/alert');
  return alertResponseSchema.parse(res);
}
