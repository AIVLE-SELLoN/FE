import { z } from 'zod';

// TODO: Notion API 명세서 기준으로 실제 응답 스키마 채우기 (채널연동, 舊 설정 + 채널비교 통합)
export const channelResponseSchema = z.object({});

export type ChannelResponse = z.infer<typeof channelResponseSchema>;
