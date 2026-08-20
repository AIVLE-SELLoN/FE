import { z } from 'zod';
import { api } from '../client';
import {
  csInquirySchema,
  faqSchema,
  type CsInquiry,
  type Faq,
  type InquireType,
} from './types';

export async function createInquiry(req: {
  inquireTitle: string;
  inquireContent: string;
  inquireType: InquireType;
  attachmentUrl?: string | null;
}): Promise<CsInquiry> {
  const data = await api.post<unknown>('/inquiries', req);
  return csInquirySchema.parse(data);
}

export async function getMyInquiries(): Promise<CsInquiry[]> {
  const data = await api.get<unknown>('/inquiries');
  return z.array(csInquirySchema).parse(data);
}

// 관리자 전용(ADMIN) — 전체 사용자의 문의 목록 조회.
export async function getAllInquiries(): Promise<CsInquiry[]> {
  const data = await api.get<unknown>('/inquiries/admin');
  return z.array(csInquirySchema).parse(data);
}

export async function getInquiryDetail(inquireKey: number): Promise<CsInquiry> {
  const data = await api.get<unknown>(`/inquiries/${inquireKey}`);
  return csInquirySchema.parse(data);
}

export async function updateInquiry(
  inquireKey: number,
  req: { inquireTitle: string; inquireContent: string; inquireType: InquireType; attachmentUrl?: string | null }
): Promise<CsInquiry> {
  const data = await api.patch<unknown>(`/inquiries/${inquireKey}`, req);
  return csInquirySchema.parse(data);
}

export async function deleteInquiry(inquireKey: number): Promise<void> {
  await api.delete<void>(`/inquiries/${inquireKey}`);
}

// 아래 세 함수는 관리자 전용(ADMIN) 답변 등록/수정/삭제 API예요.
// PATCH/DELETE는 이미 답변이 등록된 문의에만 호출할 수 있어요 (없으면 400).
export async function createInquiryAnswer(
  inquireKey: number,
  req: { inquireAnswer: string }
): Promise<CsInquiry> {
  const data = await api.post<unknown>(`/inquiries/${inquireKey}/answer`, req);
  return csInquirySchema.parse(data);
}

export async function updateInquiryAnswer(
  inquireKey: number,
  req: { inquireAnswer: string }
): Promise<CsInquiry> {
  const data = await api.patch<unknown>(`/inquiries/${inquireKey}/answer`, req);
  return csInquirySchema.parse(data);
}

export async function deleteInquiryAnswer(inquireKey: number): Promise<CsInquiry> {
  const data = await api.delete<unknown>(`/inquiries/${inquireKey}/answer`);
  return csInquirySchema.parse(data);
}

export async function getFaqs(): Promise<Faq[]> {
  const data = await api.get<unknown>('/inquiries/faq');
  return z.array(faqSchema).parse(data);
}

// CS 문의 첨부파일 업로드. 이미지(jpg/jpeg/png) + pdf, 최대 10MB (FileDirectory.INQUIRY 기준).
// 반환된 fileUrl을 createInquiry/updateInquiry의 attachmentUrl로 그대로 넘기면 된다.
const fileUploadResponseSchema = z.object({ fileUrl: z.string() });

export async function uploadInquiryAttachment(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  // 주의: api.post가 body를 무조건 JSON.stringify하는 구조라면 이 호출은 깨진다.
  // client.ts가 FormData 인스턴스를 그대로 fetch에 넘기는지 확인 필요 — 안 되면 알려줘.
  const data = await api.post<unknown>('/files/inquiry', formData);
  return fileUploadResponseSchema.parse(data).fileUrl;
}