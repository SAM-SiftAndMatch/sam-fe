import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Họ và tên không được để trống')
    .max(255, 'Họ và tên không được vượt quá 255 ký tự'),
  email: z.string().min(1, 'Email không được để trống').email('Email không đúng định dạng'),
  password: z
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(100, 'Mật khẩu không được vượt quá 100 ký tự'),
  accountType: z.enum(['CLIENT', 'FREELANCER'] as const, {
    message: 'Vui lòng chọn loại tài khoản',
  }),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: 'Bạn phải đồng ý với Điều khoản Dịch vụ và Chính sách Bảo mật',
  }),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
