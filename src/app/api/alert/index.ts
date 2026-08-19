import { api } from '../client';
import { alertDetailResponseSchema, type AlertDetailResponse } from './types';
import {
  alertListResponseSchema,
  alertReadResponseSchema,
  type AlertListResponse,
  type AlertReadResponse,
} from './types';

export async function getAlerts(params: {
  cursor?: string;
  size?: number;
  unreadOnly?: boolean;
} = {}): Promise<AlertListResponse> {
  const data = await api.get<unknown>('/api/v1/sellon/alerts', {
    params: {
      cursor: params.cursor,
      size: params.size ?? 20,
      unreadOnly: params.unreadOnly ?? false,
    },
  });
  return alertListResponseSchema.parse(data);
}

export async function markAlertAsRead(notificationId: number): Promise<AlertReadResponse> {
  const data = await api.get<unknown>(`/api/v1/sellon/alerts/${notificationId}/read`);
  return alertReadResponseSchema.parse(data);
}

export async function getAlertDetail(notificationId: number): Promise<AlertDetailResponse> {
  const data = await api.get<unknown>(`/api/v1/sellon/alerts/${notificationId}`);
  return alertDetailResponseSchema.parse(data);
}