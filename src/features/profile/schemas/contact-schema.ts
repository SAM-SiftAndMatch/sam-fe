import { z } from 'zod';
export const contactFields = {
  contractName: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập họ tên trên hợp đồng')
    .max(255, 'Họ tên tối đa 255 ký tự'),
  contactEmail: z
    .string()
    .trim()
    .email('Email liên hệ không hợp lệ')
    .max(255, 'Email tối đa 255 ký tự'),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+?[0-9][0-9 ()-]{7,19}$/, 'Số điện thoại không hợp lệ'),
  acceptedTerms: z
    .boolean()
    .refine((value) => value, 'Bạn phải chấp nhận điều khoản và chính sách bảo mật'),
};
