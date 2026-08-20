import { api } from '../client';
import { reportResponseSchema, type ReportResponse } from './types';

// 히스토리(목록) — 회사의 전체 월간 리포트 이력
export async function getMonthlyReports(): Promise<ReportResponse[]> {
  const res = await api.get<unknown>('/api/v1/sellon/reports');
  return reportResponseSchema.array().parse(res);
}

// 가장 최근 리포트 1건 — "월간 리포트" 탭에서 사용
export async function getLatestReport(): Promise<ReportResponse> {
  const res = await api.get<unknown>('/api/v1/sellon/reports/latest');
  return reportResponseSchema.parse(res);
}

// 특정 리포트 1건 조회 (히스토리에서 상세 클릭 시)
export async function getReportById(reportId: string): Promise<ReportResponse> {
  const res = await api.get<unknown>(`/api/v1/sellon/reports/${reportId}`);
  return reportResponseSchema.parse(res);
}