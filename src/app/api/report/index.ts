import { api } from '../client';
import { reportResponseSchema, type ReportResponse } from './types';

// TODO: 실제 엔드포인트로 교체 (Notion API 명세서 참고)
export async function getReport(): Promise<ReportResponse> {
  const res = await api.get<unknown>('/report');
  return reportResponseSchema.parse(res);
}
