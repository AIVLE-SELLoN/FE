import { api } from '../client';
import { csAutomationResponseSchema, type CsAutomationResponse } from './types';

// TODO: 실제 엔드포인트로 교체 (Notion API 명세서 참고)
export async function getCsAutomation(): Promise<CsAutomationResponse> {
  const res = await api.get<unknown>('/cs-automation');
  return csAutomationResponseSchema.parse(res);
}
