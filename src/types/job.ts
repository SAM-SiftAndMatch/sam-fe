// Khớp BE: JobResponse.java (chú ý dùng `id`, KHÔNG phải `jobId` như ví dụ spec cũ).
export type JobStatus =
  | 'OPEN'
  | 'NEGOTIATING'
  | 'AWAITING_PAYMENT'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface JobSkill {
  id: number;
  name: string;
  /** Số năm kinh nghiệm yêu cầu (BE trả từ JobSkill.requiredYearsOfExperience) */
  yearsOfExperience: number | null;
}

export interface JobResponse {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  status: JobStatus;
  estimatedDurationMonths: number | null;
  deadline: string | null;
  srsDocumentUrl: string;
  /** Nội dung SRS Markdown (render đẹp trong app) */
  srsContent: string | null;
  riskLevel?: string | null;
  isFeatured: boolean;
  isUrgentHiring: boolean;
  requiresAiQa: boolean;
  skills: JobSkill[];
  createdAt: string;
  updatedAt: string;
}

export interface ClientDashboardProject {
  id: string;
  title: string;
  status: JobStatus;
  budgetMin: number | null;
  budgetMax: number | null;
  updatedAt: string;
  freelancerName: string | null;
}

export interface ClientDashboardOverview {
  totalPosted: number;
  inProgress: number;
  completed: number;
  recentProjects: ClientDashboardProject[];
}

export interface JobCreateRequest {
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  estimatedDurationMonths: number;
  deadline?: string;
  srsDocumentUrl: string;
  /** Nội dung SRS Markdown (tùy chọn) */
  srsContent?: string;
  isFeatured?: boolean;
  isUrgentHiring?: boolean;
  requiresAiQa?: boolean;
  clientRequestId?: string;
}

export interface JobAddonPrices {
  featuredFee: number;
  urgentFee: number;
  businessIncluded: boolean;
}

export interface JobAddonSummary {
  orderId: string | null;
  orderStatus: 'PENDING' | 'PAID' | 'PAID_UNAPPLIED' | 'CANCELLED' | null;
  featuredActive: boolean;
  urgentActive: boolean;
  featuredPending: boolean;
  urgentPending: boolean;
  featuredFee: number;
  urgentFee: number;
  totalDue: number;
  businessIncluded: boolean;
}

export interface JobAddonCheckout {
  orderId: string;
  vnpayUrl: string;
}

// Khớp BE: AiRecommendationResponse.java + SkillExperienceDto.java
export type RecommendationStatus =
  | 'AUTO_MATCHED'
  | 'CLIENT_REQUESTED'
  | 'DEV_REQUESTED'
  | 'ACCEPTED'
  | 'REJECTED';

export interface RecommendationSkill {
  skillName: string;
  yearsOfExperience: number;
}

export interface RecommendationResponse {
  id: string;
  freelancerId: string;
  fullName: string;
  headline: string;
  matchScore: number;
  aiComment: string;
  status: RecommendationStatus;
  skills: RecommendationSkill[];
}

export interface AcceptInvitationResponse {
  roomId: string;
}
