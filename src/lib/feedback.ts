import type { FeedbackStatus } from '../api/feedback';
import { extractApiResponse, getApiErrorMessage } from './api-error';

export const feedbackStatusLabels: Record<FeedbackStatus, string> = {
  NEW: 'Mới tiếp nhận',
  IN_PROGRESS: 'Đang xem xét',
  RESOLVED: 'Đã xử lý',
};
export const feedbackRoleLabels = {
  CLIENT: 'Khách hàng',
  FREELANCER: 'Freelancer',
  ADMIN: 'Quản trị viên',
};
export const ratingLabels = [
  '',
  'Rất không hài lòng',
  'Chưa hài lòng',
  'Bình thường',
  'Hài lòng',
  'Rất hài lòng',
];

export function feedbackValidation(rating: number, comment: string): string {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return 'Vui lòng chọn đánh giá từ 1 đến 5 sao.';
  if (comment.length > 2000) return 'Nhận xét tối đa 2000 ký tự.';
  return '';
}

export function feedbackError(cause: unknown, fallback: string): string {
  return getApiErrorMessage(extractApiResponse(cause), fallback);
}

export function feedbackFilters(params: URLSearchParams): URLSearchParams {
  const result = new URLSearchParams();
  const rating = params.get('rating') ?? '';
  if (/^[1-5]$/.test(rating)) result.set('rating', rating);
  const status = params.get('status') ?? '';
  if (Object.hasOwn(feedbackStatusLabels, status)) result.set('status', status);
  const q = params.get('q')?.trim().slice(0, 100);
  if (q) result.set('q', q);
  const page = Number(params.get('page') ?? 0);
  result.set('page', String(Number.isInteger(page) && page >= 0 && page <= 100000 ? page : 0));
  result.set('size', '20');
  return result;
}

export function feedbackDate(value: string): string {
  if (Number.isNaN(Date.parse(value))) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value));
}
