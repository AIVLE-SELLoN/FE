import { api } from '../../client';
import {
  channelComparisonItemSchema,
  channelInquiryTypeItemSchema,
  channelInquiryTypeRadarItemSchema,
  channelMonthlyItemSchema,
  channelInsightItemSchema,
  type ChannelComparisonItem,
  type ChannelInquiryTypeItem,
  type ChannelInquiryTypeRadarItem,
  type ChannelMonthlyItem,
} from './types';

// 회사가 연동한 채널 전부의 비교분석 스냅샷을 새로 계산해서 저장한다.
// 아래 조회 API들은 실시간 계산이 아니라 이 스냅샷을 읽는 구조라, 화면 진입 시 먼저 호출해야 최신/전체 채널이 보인다.
export async function refreshAllChannelComparisons(): Promise<void> {
  await api.post<unknown>('/channels/comparison/refresh');
}

export async function getChannelComparisons(): Promise<ChannelComparisonItem[]> {
  const res = await api.get<unknown>('/channels/comparison');
  return channelComparisonItemSchema.array().parse(res);
}

export async function getChannelAspects(
  usersChannelKey: number,
  limit = 3,
): Promise<ChannelInquiryTypeItem[]> {
  const res = await api.get<unknown>(`/channels/comparison/${usersChannelKey}/aspects?limit=${limit}`);
  return channelInquiryTypeItemSchema.array().parse(res);
}

export async function getChannelInquiryTypeRadar(): Promise<ChannelInquiryTypeRadarItem[]> {
  const res = await api.get<unknown>('/channels/comparison/inquiry-type-radar');
  return channelInquiryTypeRadarItemSchema.array().parse(res);
}

export async function getChannelMonthly(usersChannelKey: number): Promise<ChannelMonthlyItem[]> {
  const res = await api.get<unknown>(`/channels/comparison/${usersChannelKey}/monthly`);
  return channelMonthlyItemSchema.array().parse(res);
}

// 화면은 문자열 목록만 필요해서 content만 뽑아서 반환한다.
export async function getChannelInsights(usersChannelKey: number): Promise<string[]> {
  const res = await api.get<unknown>(`/channels/comparison/${usersChannelKey}/insights`);
  return channelInsightItemSchema.array().parse(res).map((i) => i.content);
}

// 수동 새로고침 트리거 (배치/스케줄러 대체용, 지금은 버튼 등에서 호출 가능)
export async function refreshChannelComparison(usersChannelKey: number): Promise<void> {
  await api.post<unknown>(`/channels/comparison/${usersChannelKey}/refresh`);
}