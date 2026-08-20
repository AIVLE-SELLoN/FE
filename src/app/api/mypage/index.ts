import { api } from '../client';
import {
  myPageResponseSchema, companyKeyResponseSchema, presignedUrlResponseSchema,
  type MyPageResponse, type CompanyKeyResponse, type PresignedUrlResponse, type Recipient,
} from './types';

export async function getMyPage(): Promise<MyPageResponse> {
  const data = await api.get<unknown>('/api/v1/sellon/my-page');
  return myPageResponseSchema.parse(data);
}

export interface MyPageUpdateRequest {
  email?: string;
  verificationToken?: string;
  brandName?: string;
  reportSetting?: {
    enabled: boolean;
    sendDay: number;
    sendTime: string;
    recipients: Recipient[];
  };
}

export async function updateMyPage(req: MyPageUpdateRequest): Promise<MyPageResponse> {
  const data = await api.patch<unknown>('/api/v1/sellon/my-page', req);
  return myPageResponseSchema.parse(data);
}

export async function getCompanyKey(): Promise<CompanyKeyResponse> {
  const data = await api.get<unknown>('/api/v1/sellon/my-page/company-key');
  return companyKeyResponseSchema.parse(data);
}

export async function issueCompanyKey(): Promise<CompanyKeyResponse> {
  const data = await api.post<unknown>('/api/v1/sellon/my-page/company-key');
  return companyKeyResponseSchema.parse(data);
}

export async function getProfileImagePresignedUrl(fileName: string, fileSize: number): Promise<PresignedUrlResponse> {
  const data = await api.post<unknown>('/api/v1/sellon/my-page/profile-image/presigned-url', { fileName, fileSize });
  return presignedUrlResponseSchema.parse(data);
}

export async function uploadToPresignedUrl(url: string, file: File, contentType: string): Promise<void> {
  const res = await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': contentType } });
  if (!res.ok) throw new Error('이미지 업로드에 실패했습니다.');
}

export async function completeProfileImageUpload(objectKey: string): Promise<MyPageResponse> {
  const data = await api.patch<unknown>('/api/v1/sellon/my-page/profile-image', { objectKey });
  return myPageResponseSchema.parse(data);
}

export async function removeProfileImage(): Promise<MyPageResponse> {
  const data = await api.delete<unknown>('/api/v1/sellon/my-page/profile-image');
  return myPageResponseSchema.parse(data);
}

export async function withdrawAccount(): Promise<void> {
  await api.delete<void>('/users/me');
}