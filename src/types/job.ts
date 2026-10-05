// Khớp BE: JobResponse.java (chú ý dùng `id`, KHÔNG phải `jobId` như ví dụ spec cũ).
export type JobStatus = 'OPEN' | 'NEGOTIATING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface JobSkill {
  id: number;
  name: string;
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
  deadline: string;
  srsDocumentUrl: string;
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
  deadline: string;
  srsDocumentUrl: string;
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
