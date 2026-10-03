export interface FreelancerSkillRequest {
  skillId: number;
  yearsOfExperience: number;
}

export interface FreelancerProfileRequest {
  headline: string;
  bio?: string | null;
  hourlyRate?: number | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  skills: FreelancerSkillRequest[];
}

export interface FreelancerSkillResponse {
  skillId: number;
  skillName: string;
  yearsOfExperience: number;
}

export interface FreelancerProfileResponse {
  id?: string | null;
  userId: string;
  fullName: string;
  email: string;
  headline?: string | null;
  bio?: string | null;
  hourlyRate?: number | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  skills: FreelancerSkillResponse[];
}

export interface SkillOption {
  id: number;
  name: string;
  category?: string;
}

export const PREDEFINED_SKILLS: SkillOption[] = [
  { id: 1, name: 'Java', category: 'Backend' },
  { id: 2, name: 'Spring Boot', category: 'Backend' },
  { id: 3, name: 'React', category: 'Frontend' },
  { id: 4, name: 'TypeScript', category: 'Frontend / Language' },
  { id: 5, name: 'Figma', category: 'Design / UI/UX' },
  { id: 6, name: 'Node.js', category: 'Backend' },
  { id: 7, name: 'PostgreSQL', category: 'Database' },
  { id: 8, name: 'Docker', category: 'DevOps' },
  { id: 9, name: 'Next.js', category: 'Frontend' },
  { id: 10, name: 'Tailwind CSS', category: 'Frontend' },
];
