import { z } from 'zod';

export const inquireTypeSchema = z.enum([
  'CHANNEL_CONNECTION',
  'PRODUCT_MAPPING',
  'ANOMALY_DETECTION',
  'IMPROVEMENT_PROPOSAL',
]);
export type InquireType = z.infer<typeof inquireTypeSchema>;

export const inquiryStatusSchema = z.enum(['WAITING', 'DISCUSSING', 'CLEARED']);
export type InquiryStatus = z.infer<typeof inquiryStatusSchema>;

export const csInquirySchema = z.object({
  inquireKey: z.number(),
  inquireTitle: z.string(),
  inquireContent: z.string(),
  inquireType: inquireTypeSchema,
  attachmentUrl: z.string().nullable(),
  inquireAnswer: z.string().nullable(),
  inquiryStatus: inquiryStatusSchema,
});
export type CsInquiry = z.infer<typeof csInquirySchema>;

export const faqSchema = z.object({
  faqKey: z.number(),
  faqTitle: z.string().nullable(),
  faqQuestion: z.string().nullable(),
  faqAnswer: z.string().nullable(),
});
export type Faq = z.infer<typeof faqSchema>;

export const INQUIRE_TYPE_LABEL: Record<InquireType, string> = {
  CHANNEL_CONNECTION: '채널 연동',
  PRODUCT_MAPPING: '상품 매핑',
  ANOMALY_DETECTION: '이상탐지',
  IMPROVEMENT_PROPOSAL: '개선안',
};

export const INQUIRY_STATUS_LABEL: Record<InquiryStatus, string> = {
  WAITING: '대기중',
  DISCUSSING: '답변 준비중',
  CLEARED: '답변 완료',
};

export const INQUIRE_TYPE_STYLE: Record<InquireType, { bg: string; text: string }> = {
  CHANNEL_CONNECTION: { bg: 'bg-blue-50', text: 'text-blue-600' },
  PRODUCT_MAPPING: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  ANOMALY_DETECTION: { bg: 'bg-red-50', text: 'text-red-500' },
  IMPROVEMENT_PROPOSAL: { bg: 'bg-orange-50', text: 'text-amber-600' },
};