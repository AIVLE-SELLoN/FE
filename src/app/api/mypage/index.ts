import { api } from '../client';
import { mypageResponseSchema, type MypageResponse } from './types';

// TODO: 실제 엔드포인트로 교체 (Notion API 명세서 참고)
export async function getMypage(): Promise<MypageResponse> {
  const res = await api.get<unknown>('/mypage');
  return mypageResponseSchema.parse(res);
}
