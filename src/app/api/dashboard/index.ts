import { api } from '../client';
import { dashboardResponseSchema, type DashboardData, type DashboardPeriod } from './types';

export async function getDashboard(period: DashboardPeriod = '7D'): Promise<DashboardData> {
  const res = await api.get<unknown>(`/api/v1/sellon/dashboard?period=${period}`);
  return dashboardResponseSchema.parse(res);
}