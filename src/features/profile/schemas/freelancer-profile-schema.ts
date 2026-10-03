import { z } from 'zod';

export const freelancerSkillSchema = z.object({
  skillId: z.number(),
  skillName: z.string().optional(),
  yearsOfExperience: z.number().min(0, 'Số năm kinh nghiệm không được âm'),
});

export const freelancerProfileSchema = z.object({
  headline: z
    .string()
    .min(1, 'Tiêu đề nghề nghiệp không được để trống')
    .max(255, 'Tiêu đề không được vượt quá 255 ký tự'),
  bio: z.string().optional(),
  hourlyRate: z.number().min(0, 'Mức giá không được âm').optional().nullable(),
  githubUrl: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.trim() === '' || /^https?:\/\//i.test(val),
      'Đường dẫn GitHub phải bắt đầu bằng http:// hoặc https://'
    ),
  portfolioUrl: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.trim() === '' || /^https?:\/\//i.test(val),
      'Đường dẫn Portfolio phải bắt đầu bằng http:// hoặc https://'
    ),
  skills: z.array(freelancerSkillSchema),
});

export type FreelancerProfileFormData = z.infer<typeof freelancerProfileSchema>;
export type FreelancerSkillItem = z.infer<typeof freelancerSkillSchema>;
