import { api } from '../../client';
export * from './types';
import type {
  ChannelComparisonItem,
  ChannelInquiryTypeItem,
  ChannelInquiryTypeRadarItem,
  ChannelMonthlyItem,
  ChannelInsightItem,
} from './types';

export function getChannelComparisons() {
  return api.get<ChannelComparisonItem[]>('/channels/comparison');
}

export function getChannelAspects(usersChannelKey: number, limit = 3) {
  return api.get<ChannelInquiryTypeItem[]>(
    `/channels/comparison/${usersChannelKey}/aspects`,
    { params: { limit } },
  );
}

export function getChannelInquiryTypeRadar() {
  return api.get<ChannelInquiryTypeRadarItem[]>('/channels/comparison/inquiry-type-radar');
}

export function getChannelMonthly(usersChannelKey: number) {
  return api.get<ChannelMonthlyItem[]>(`/channels/comparison/${usersChannelKey}/monthly`);
}

export function getChannelInsights(usersChannelKey: number) {
  return api.get<ChannelInsightItem[]>(`/channels/comparison/${usersChannelKey}/insights`);
}