import { api } from '../../client';
import {
  channelProductResponseSchema,
  mappingSummaryResponseSchema,
  matchCandidateResponseSchema,
  type ChannelProductResponse,
  type MappingSummaryResponse,
  type MatchCandidateResponse,
} from './types';

// 회사가 연동한 채널(쿠팡/지그재그/네이버) 전체를 합쳐서 조회한다. 채널별 usersChannelKey는 더 이상 필요 없다.
export async function getMappings(
  params: { matched?: boolean; keyword?: string } = {},
): Promise<ChannelProductResponse[]> {
  const query = new URLSearchParams();
  if (params.matched !== undefined) query.set('matched', String(params.matched));
  if (params.keyword) query.set('keyword', params.keyword);
  const qs = query.toString();

  const res = await api.get<unknown>(`/channels/product-mappings${qs ? `?${qs}` : ''}`);
  return channelProductResponseSchema.array().parse(res);
}

export async function getMappingSummary(): Promise<MappingSummaryResponse> {
  const res = await api.get<unknown>('/channels/product-mappings/summary');
  return mappingSummaryResponseSchema.parse(res);
}

// AI 서버(MatchCandidateClient) 연동 전까지는 항상 빈 배열이 온다.
export async function getCandidates(
  variantRowId: string,
  keyword?: string,
): Promise<MatchCandidateResponse[]> {
  const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';
  const res = await api.get<unknown>(`/channels/product-mappings/${variantRowId}/candidates${query}`);
  return matchCandidateResponseSchema.array().parse(res);
}

export async function connectMapping(
  variantRowId: string,
  masterProductKey: number,
): Promise<ChannelProductResponse> {
  const res = await api.patch<unknown>(`/channels/product-mappings/${variantRowId}/connect`, {
    masterProductKey,
  });
  return channelProductResponseSchema.parse(res);
}

export async function createNewGroup(
  variantRowId: string,
  productName: string,
): Promise<ChannelProductResponse> {
  const res = await api.post<unknown>(`/channels/product-mappings/${variantRowId}/new-group`, {
    productName,
  });
  return channelProductResponseSchema.parse(res);
}

export async function skipMapping(variantRowId: string): Promise<ChannelProductResponse> {
  const res = await api.patch<unknown>(`/channels/product-mappings/${variantRowId}/skip`);
  return channelProductResponseSchema.parse(res);
}