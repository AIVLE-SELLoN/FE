import { z } from 'zod';

export const mainAspectSchema = z.enum(['COLOR', 'SIZE', 'MATERIAL', 'DAMAGE', 'MISDELIVERY', 'ETC']);
export type MainAspect = z.infer<typeof mainAspectSchema>;

export const hitlStatusSchema = z.enum(['PENDING', 'APPROVED', 'EDITED_APPROVED', 'REJECTED']);
export type HitlStatus = z.infer<typeof hitlStatusSchema>;

export const confidenceLevelSchema = z.enum(['HIGH', 'MEDIUM', 'LOW']);
export type ConfidenceLevel = z.infer<typeof confidenceLevelSchema>;

export const proposalResponseSchema = z.object({
  reportKey: z.number(),
  alertId: z.string(),
  productGroupId: z.string().nullable(),
  mainAspect: mainAspectSchema.nullable(),
  hitlStatus: hitlStatusSchema,
});
export type ProposalResponse = z.infer<typeof proposalResponseSchema>;

export const proposalEvidenceSchema = z.object({
  inquiryId: z.string(),
  quoteText: z.string(),
});
export type ProposalEvidence = z.infer<typeof proposalEvidenceSchema>;

export const proposalDetailResponseSchema = z.object({
  reportKey: z.number(),
  alertId: z.string(),
  detectedAt: z.string().nullable(),
  productGroupId: z.string().nullable(),
  channel: z.string().nullable(),
  verdict: z.string().nullable(),
  mainAspect: mainAspectSchema.nullable(),
  proposalType: z.string().nullable(),
  targetField: z.string().nullable(),
  currentText: z.string().nullable(),
  rationale: z.string().nullable(),
  confidenceLevel: confidenceLevelSchema.nullable(),
  confidenceDescription: z.string().nullable(),
  cappedByDetection: z.boolean(),
  similarCase: z.string().nullable(),
  detailpageGrounded: z.boolean(),
  evaluatorPassed: z.boolean(),
  proposedContent: z.string().nullable(),
  evidences: z.array(proposalEvidenceSchema),
  hitlStatus: hitlStatusSchema,
});
export type ProposalDetailResponse = z.infer<typeof proposalDetailResponseSchema>;

export const proposalAcceptHistorySchema = z.object({
  proposalAcceptHistoryKey: z.number(),
  reportKey: z.number(),
  productGroupId: z.string().nullable(),
  hitlStatus: hitlStatusSchema,
  appliedProposedContent: z.string().nullable(),
  improvedContent: z.string().nullable(),
  improvedPrevContent: z.string().nullable(),
  rejectionReasonCode: z.string().nullable(),
  rejectionReasonText: z.string().nullable(),
  processedAt: z.string().nullable(),
  rolledBack: z.boolean(),
});
export type ProposalAcceptHistory = z.infer<typeof proposalAcceptHistorySchema>;

export const CONFIDENCE_LABEL: Record<ConfidenceLevel, string> = {
  HIGH: '높음',
  MEDIUM: '중간',
  LOW: '낮음',
};

export const MAIN_ASPECT_LABEL: Record<MainAspect, string> = {
  COLOR: '색상',
  SIZE: '사이즈',
  MATERIAL: '소재',
  DAMAGE: '파손',
  MISDELIVERY: '오배송',
  ETC: '기타',
};