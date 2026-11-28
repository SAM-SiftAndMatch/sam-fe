export type ProposalStatus = 'PENDING' | 'INVITED' | 'ACCEPTED' | 'REJECTED';

export interface ProposalCreateRequest {
  jobId: string;
  coverLetter?: string;
  proposedBudget: number;
  estimatedDurationDays?: number;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface ProposalResponse {
  id: string;
  jobId: string;
  jobTitle: string;
  freelancerId: string;
  freelancerName: string;
  headline?: string | null;
  freelancerBio?: string | null;
  freelancerSkills?: string[] | null;
  hourlyRate?: number | null;
  portfolioUrl?: string | null;
  githubUrl?: string | null;
  coverLetter?: string | null;
  proposedBudget: number;
  estimatedDurationDays?: number | null;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  status: ProposalStatus;
  createdAt?: string | null;
}

export interface AcceptProposalResponse {
  roomId: string;
}
