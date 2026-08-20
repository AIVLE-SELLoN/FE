import { api } from '../client';
import {
  channelConnectionResponseSchema,
  naverAuthorizeResponseSchema,
  syncLogPageResponseSchema,
  type ChannelConnectionResponse,
  type NaverAuthorizeResponse,
  type SyncLogPageResponse,
} from './types';

// 현재 회사가 연동한 채널 목록 (새로고침해도 상태 유지하려고 페이지 진입 시 호출)
export async function getChannels(): Promise<ChannelConnectionResponse[]> {
  const res = await api.get<unknown>('/channels');
  return channelConnectionResponseSchema.array().parse(res);
}

// 쿠팡/지그재그 - API 키로 연동
// channelType: "COUPANG" | "ZIGZAG", channelCode: 쿠팡은 "cp_live_"+영숫자12자 이상, 지그재그는 "zg_live_"+영숫자12자 이상
// ROOT 계정이 아니면 403, 키 형식이 안 맞으면 400이 온다.
export async function connectChannel(
  channelType: 'COUPANG' | 'ZIGZAG',
  channelCode: string,
): Promise<ChannelConnectionResponse> {
  const res = await api.post<unknown>('/channels/connect', { channelType, channelCode });
  return channelConnectionResponseSchema.parse(res);
}

// 연동 해제 (ROOT 전용). 행을 지우진 않고 DISCONNECTED로 바뀐다.
export async function disconnectChannel(channelType: 'COUPANG' | 'ZIGZAG' | 'NAVER'): Promise<void> {
  await api.delete<unknown>(`/channels/${channelType}`);
}

// 네이버 - 1단계: 인가 URL + state 발급 (ROOT 전용)
// 실제 네이버 붙기 전까지 authorizationUrl은 목업 도메인이라 프론트에서 그 주소로 이동시키지 않는다.
export async function naverAuthorize(): Promise<NaverAuthorizeResponse> {
  const res = await api.get<unknown>('/channels/naver/authorize');
  return naverAuthorizeResponseSchema.parse(res);
}

// 네이버 - 2단계: 목업 로그인 화면에서 "로그인" 누르면 호출. code는 목업이라 아무 문자열이나 상관없다.
export async function naverCallback(code: string, state: string): Promise<ChannelConnectionResponse> {
  const res = await api.get<unknown>(
    `/channels/naver/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
  );
  return channelConnectionResponseSchema.parse(res);
}

// 채널 연동 이력(동기화 로그) 조회. page는 0-based(Spring 기준).
export async function getSyncLogs(params: {
  channelType?: 'COUPANG' | 'ZIGZAG' | 'NAVER';
  page?: number;
  size?: number;
}): Promise<SyncLogPageResponse> {
  const query = new URLSearchParams();
  if (params.channelType) query.set('channelType', params.channelType);
  query.set('page', String(params.page ?? 0));
  query.set('size', String(params.size ?? 10));

  const res = await api.get<unknown>(`/channels/sync-logs?${query.toString()}`);
  return syncLogPageResponseSchema.parse(res);
}

// 자정 폴링을 안 기다리고 지금 바로 동기화 확인. channelType 없으면 연동된 채널 전부.
export async function pollSyncLogs(channelType?: 'COUPANG' | 'ZIGZAG' | 'NAVER'): Promise<void> {
  const query = channelType ? `?channelType=${channelType}` : '';
  await api.post<unknown>(`/channels/sync-logs/poll${query}`);
}