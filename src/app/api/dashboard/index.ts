import { api } from '../client';
import { dashboardResponseSchema, type DashboardResponse } from './types';

// TODO: 실제 엔드포인트로 교체 (Notion API 명세서 참고)
export async function getDashboard(): Promise<DashboardResponse> {
  const res = await api.get<unknown>('/dashboard');
  return dashboardResponseSchema.parse(res);
}
