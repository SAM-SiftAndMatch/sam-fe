import type { JobStatus } from './job';

export type ProjectTaskStatus =
  | 'TODO'
  | 'IN_PROGRESS'
  | 'BLOCKED'
  | 'SUBMITTED'
  | 'ACCEPTED'
  | 'REOPENED';

export interface TaskReport {
  id: string;
  reporterId: string;
  reporterName: string;
  content: string;
  evidenceUrl?: string | null;
  progress: number;
  status: ProjectTaskStatus;
  createdAt: string;
}

export interface TimelineTask {
  id: string;
  weekNumber: number;
  sortOrder: number;
  title: string;
  description?: string | null;
  status: ProjectTaskStatus;
  progress: number;
  startedAt?: string | null;
  completedAt?: string | null;
  reports: TaskReport[];
}

export interface ProjectTimeline {
  jobId: string;
  jobTitle: string;
  progress: number;
  currentWeek: number;
  totalWeeks: number;
  readyForDelivery: boolean;
  tasks: TimelineTask[];
}

export interface TaskReportRequest {
  content: string;
  evidenceUrl?: string;
  progress: number;
  status: ProjectTaskStatus;
}

export type DeliveryStatus = 'SUBMITTED' | 'REVISION_REQUESTED' | 'ACCEPTED';

export interface ProjectDelivery {
  id: string;
  jobId: string;
  submittedBy: string;
  submitterName: string;
  versionNumber: number;
  webUrl: string;
  repositoryUrl?: string | null;
  note?: string | null;
  status: DeliveryStatus;
  revisionReason?: string | null;
  submittedAt: string;
  reviewedAt?: string | null;
}

export interface DeliveryCreateRequest {
  webUrl: string;
  repositoryUrl?: string;
  note?: string;
}

export interface DeliveryRevisionRequest {
  reason: string;
}

export type QaPlanStatus = 'GENERATED' | 'FALLBACK';

export interface QaChecklistItem {
  id: string;
  sortOrder: number;
  requirementRef?: string | null;
  title: string;
  testSteps: string;
  expectedResult: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface QaPlan {
  id: string;
  deliveryId: string;
  status: QaPlanStatus;
  generatedAt: string;
  checklistItems: QaChecklistItem[];
}

export interface SandboxSettlement {
  id: string;
  contractId: string;
  deliveryId: string;
  grossAmount: number;
  freelancerPayout: number;
  platformFee: number;
  depositRefund: number;
  status: 'SIMULATED_COMPLETED';
  completedAt: string;
  sandbox: boolean;
}

export interface DeliveryAcceptance {
  delivery: ProjectDelivery;
  settlement: SandboxSettlement;
}

export interface ProjectWorkflowPanelProps {
  jobId: string;
  jobStatus: JobStatus;
  role: 'client' | 'freelancer';
  onSettlementCompleted?: () => void;
  layout?: 'compact' | 'expanded';
}
