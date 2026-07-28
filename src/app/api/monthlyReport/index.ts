import { api } from '../client';
import { monthlyReportResponseSchema, type MonthlyReportResponse } from './types';

// TODO: 실제 엔드포인트로 교체 (Notion API 명세서 참고)
export async function getMonthlyReport(): Promise<MonthlyReportResponse> {
  const res = await api.get<unknown>('/monthly-report');
  return monthlyReportResponseSchema.parse(res);
}
