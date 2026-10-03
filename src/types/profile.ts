export interface FreelancerSkillRequest {
  skillId?: number | null;
  skillName?: string | null;
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
}

export const FALLBACK_SKILLS: SkillOption[] = [
  { id: 1, name: 'Java' },
  { id: 2, name: 'Spring Boot' },
  { id: 3, name: 'React' },
  { id: 4, name: 'TypeScript' },
  { id: 5, name: 'Figma' },
  { id: 6, name: 'Node.js' },
  { id: 7, name: 'PostgreSQL' },
  { id: 8, name: 'Docker' },
  { id: 9, name: 'Next.js' },
  { id: 10, name: 'Tailwind CSS' },
  { id: 11, name: 'Python' },
  { id: 12, name: 'Vue.js' },
  { id: 13, name: 'Flutter' },
  { id: 14, name: 'Golang' },
];

export const PREDEFINED_SKILLS = FALLBACK_SKILLS;
