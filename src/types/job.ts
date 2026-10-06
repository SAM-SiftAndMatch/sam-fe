// Khớp BE: JobResponse.java (chú ý dùng `id`, KHÔNG phải `jobId` như ví dụ spec cũ).
export type JobStatus = 'OPEN' | 'NEGOTIATING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

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

export interface JobCreateRequest {
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  estimatedDurationMonths: number;
  srsDocumentUrl: string;
  /** Nội dung SRS Markdown (tùy chọn) */
  srsContent?: string;
  isFeatured?: boolean;
  isUrgentHiring?: boolean;
  requiresAiQa?: boolean;
}

// Khớp BE: AiRecommendationResponse.java + SkillExperienceDto.java
export type RecommendationStatus = 'PENDING' | 'INVITED' | 'ACCEPTED' | 'REJECTED';

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
