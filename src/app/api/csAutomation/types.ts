import { z } from 'zod';

// TODO: Notion API 명세서 기준으로 실제 응답 스키마 채우기 (CS가이드라인자동화)
export const csAutomationResponseSchema = z.object({});

export type CsAutomationResponse = z.infer<typeof csAutomationResponseSchema>;
