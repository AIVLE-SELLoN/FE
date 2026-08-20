import { api } from '../client';
import {
  guidelineFileCursorPageResponseSchema,
  guidelineDownloadResponseSchema,
  guidelineListCursorPageResponseSchema,
  guidelineDetailResponseSchema,
  type GuidelineFileCursorPageResponse,
  type GuidelineDownloadResponse,
  type GuidelineListCursorPageResponse,
  type GuidelineDetailResponse,
} from './types';

// 가이드라인 파일 히스토리 조회. 커서 방식이라 offset 페이지가 아니라 "더 보기"로 이어붙인다.
export async function getGuidelineFiles(params: {
  cursor?: string | null;
  size?: number;
  q?: string;
}): Promise<GuidelineFileCursorPageResponse> {
  const query = new URLSearchParams();
  if (params.cursor) query.set('cursor', params.cursor);
  query.set('size', String(params.size ?? 20));
  if (params.q) query.set('q', params.q);

  const res = await api.get<unknown>(`/api/v1/sellon/guidelines/files?${query.toString()}`);
  return guidelineFileCursorPageResponseSchema.parse(res);
}

// 다운로드 URL 발급 (만료된 파일이면 서버가 자동으로 다시 만들어서 준다)
export async function downloadGuideline(guidelineId: string): Promise<GuidelineDownloadResponse> {
  const res = await api.post<unknown>(`/api/v1/sellon/guidelines/${guidelineId}/download`);
  return guidelineDownloadResponseSchema.parse(res);
}

// "가이드라인 생성" 탭 목록. 알림이 발생하면 외부 AI 서비스가 이미 완성된 PDF를 만들어 보내주는 구조라,
// 실제로는 "생성"이 아니라 "발생한 가이드라인 확인" 목록에 가깝다.
export async function getGuidelines(params: {
  cursor?: string | null;
  size?: number;
  q?: string;
}): Promise<GuidelineListCursorPageResponse> {
  const query = new URLSearchParams();
  if (params.cursor) query.set('cursor', params.cursor);
  query.set('size', String(params.size ?? 20));
  if (params.q) query.set('q', params.q);

  const res = await api.get<unknown>(`/api/v1/sellon/guidelines?${query.toString()}`);
  return guidelineListCursorPageResponseSchema.parse(res);
}

// 상세 페이지 단건 조회. downloadUrl은 인라인 뷰어 URL이다.
export async function getGuidelineDetail(guidelineId: string): Promise<GuidelineDetailResponse> {
  const res = await api.get<unknown>(`/api/v1/sellon/guidelines/${guidelineId}`);
  return guidelineDetailResponseSchema.parse(res);
}

// 운영 MD 승인 (코멘트 선택). 이미 승인된 건에 다시 호출하면 코멘트만 갱신된다(재승인).
export async function approveGuideline(guidelineId: string, comment?: string): Promise<void> {
  await api.post<unknown>(`/api/v1/sellon/guidelines/${guidelineId}/approval`, { comment: comment ?? null });
}

// CS 담당자에게 가이드라인 PDF 링크 메일 발송.
// 등록된 CS 담당자가 없거나(GuidelineNoCsRecipientException), 다운로드 가능한 파일이 없으면
// (GuidelineDownloadUnavailableException) 400을, 발송이 전원 실패하면 500을 던진다 — ApiError.message로 그대로 노출하면 된다.
export async function sendGuidelineMail(guidelineId: string): Promise<void> {
  await api.post<unknown>(`/api/v1/sellon/guidelines/${guidelineId}/mail`);
}