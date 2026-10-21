import type { AiChatResponse } from './ai';

export type DraftFlow = 'AI' | 'MANUAL';
export type DraftPhase =
  | 'brief'
  | 'ba-chat'
  | 'srs-review'
  | 'risk-chat'
  | 'completed'
  | 'confirm'
  | 'info'
  | 'budget'
  | 'addons'
  | 'review';

export interface ProjectDraftTurn {
  id: string;
  clientMessageId: string;
  phase: 'BA' | 'RISK';
  userMessage: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  aiResponse: AiChatResponse | null;
  createdAt: string;
}

export interface ProjectDraftSummary {
  id: string;
  flowType: DraftFlow;
  phase: DraftPhase;
  progressStep: number;
  progressPercent: number;
  title: string | null;
  brief: string | null;
  updatedAt: string;
}

export interface ProjectDraft extends ProjectDraftSummary {
  status: 'EDITING' | 'PUBLISHED' | 'DELETED';
  state: Record<string, unknown>;
  srsContent: string | null;
  srsDocumentUrl: string | null;
  exactBudgetVnd: number | null;
  durationMonths: number | null;
  publishedJobId: string | null;
  version: number;
  editRevision: number;
  turns: ProjectDraftTurn[];
}
