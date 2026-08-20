import { z } from 'zod';
import { api } from '../client';
import {
  proposalResponseSchema,
  proposalDetailResponseSchema,
  proposalAcceptHistorySchema,
  type ProposalResponse,
  type ProposalDetailResponse,
  type ProposalAcceptHistory,
} from './types';

export async function getProposals(): Promise<ProposalResponse[]> {
  const data = await api.get<unknown>('/reports');
  return z.array(proposalResponseSchema).parse(data);
}

export async function getProposalDetail(reportKey: number): Promise<ProposalDetailResponse> {
  const data = await api.get<unknown>(`/reports/${reportKey}`);
  return proposalDetailResponseSchema.parse(data);
}

export async function acceptProposal(
  reportKey: number,
  req: { improvedContent?: string | null; processedBy: string }
): Promise<ProposalAcceptHistory> {
  const data = await api.post<unknown>(`/reports/${reportKey}/accept`, req);
  return proposalAcceptHistorySchema.parse(data);
}

export async function rejectProposal(
  reportKey: number,
  req: { reasonCode?: string | null; reasonText?: string | null; processedBy: string }
): Promise<ProposalAcceptHistory> {
  const data = await api.post<unknown>(`/reports/${reportKey}/reject`, req);
  return proposalAcceptHistorySchema.parse(data);
}

export async function regenerateProposal(
  reportKey: number,
  req: { reasonCode?: string | null; reasonText?: string | null; processedBy: string }
): Promise<ProposalAcceptHistory> {
  const data = await api.post<unknown>(`/reports/${reportKey}/regenerate`, req);
  return proposalAcceptHistorySchema.parse(data);
}

export async function getAllAcceptHistory(): Promise<ProposalAcceptHistory[]> {
  const data = await api.get<unknown>('/reports/history');
  return z.array(proposalAcceptHistorySchema).parse(data);
}

export async function rollbackAcceptHistory(historyKey: number): Promise<ProposalAcceptHistory> {
  const data = await api.post<unknown>(`/reports/${historyKey}/rollback`, {});
  return proposalAcceptHistorySchema.parse(data);
}