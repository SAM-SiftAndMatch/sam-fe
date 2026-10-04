import { z } from 'zod';

export const clientProfileSchema = z.object({
  companyName: z
    .string()
    .min(1, 'Tên công ty không được để trống')
    .max(255, 'Tên công ty không được vượt quá 255 ký tự'),
  industry: z.string().max(255, 'Lĩnh vực không được vượt quá 255 ký tự').optional(),
  websiteUrl: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.trim() === '' || /^https?:\/\//i.test(val),
      'Đường dẫn website phải bắt đầu bằng http:// hoặc https://'
    ),
  description: z.string().max(2000, 'Mô tả không được vượt quá 2000 ký tự').optional(),
});

export type ClientProfileFormData = z.infer<typeof clientProfileSchema>;
