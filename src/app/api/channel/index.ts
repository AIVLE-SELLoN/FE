import { api } from '../client';
import { channelResponseSchema, type ChannelResponse } from './types';

// TODO: 실제 엔드포인트로 교체 (Notion API 명세서 참고)
export async function getChannel(): Promise<ChannelResponse> {
  const res = await api.get<unknown>('/channel');
  return channelResponseSchema.parse(res);
}
