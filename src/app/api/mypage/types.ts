import { z } from 'zod';

export const editableSchema = z.object({
  email: z.boolean(),
  brandName: z.boolean(),
});

export const recipientSchema = z.object({
  recipientId: z.number().nullable(),
  department: z.enum(['OPERATIONS', 'CS']),
  email: z.string(),
});
export type Recipient = z.infer<typeof recipientSchema>;

export const reportSettingSchema = z.object({
  enabled: z.boolean(),
  sendDay: z.number(),
  sendTime: z.string(), // "HH:mm:ss"
  recipients: z.array(recipientSchema),
});
export type ReportSetting = z.infer<typeof reportSettingSchema>;

export const myPageResponseSchema = z.object({
  email: z.string(),
  name: z.string(),
  brandName: z.string(),
  role: z.enum(['ROOT', 'MEMBER', 'ADMIN']),
  companyKey: z.string().nullable(),
  companyKeyIssued: z.boolean(),
  editable: editableSchema,
  reportSetting: reportSettingSchema,
  profileImageUrl: z.string().nullable(),
});
export type MyPageResponse = z.infer<typeof myPageResponseSchema>;

export const companyKeyResponseSchema = z.object({ companyKey: z.string() });
export type CompanyKeyResponse = z.infer<typeof companyKeyResponseSchema>;

export const presignedUrlResponseSchema = z.object({
  presignedUrl: z.string(),
  objectKey: z.string(),
  contentType: z.string(),
  expiresInSeconds: z.number(),
});
export type PresignedUrlResponse = z.infer<typeof presignedUrlResponseSchema>;