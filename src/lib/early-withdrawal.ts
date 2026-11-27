import type { FinanceWallet, Payable } from '../api/finance';

export const EVIDENCE_LIMIT = 5 * 1024 * 1024;

export function earlyWithdrawalBlockReason(
  payable: Payable,
  wallet: Pick<FinanceWallet, 'withdrawalsEnabled' | 'minimumWithdrawal'>,
  now = Date.now()
): string | null {
  if (payable.sandbox) return 'Dự án dùng tiền mô phỏng nên chưa thể xin rút tiền thật.';
  if (payable.maintenanceOrderId) return 'Rút tiền sớm hiện áp dụng cho thù lao của dự án gốc.';
  if (payable.blocked)
    return 'Dự án đang có ticket bảo trì chặn chi. Cần xử lý xong ticket trước khi xin rút sớm.';
  const acceptedAt = Date.parse(payable.acceptedAt);
  const availableAt = Date.parse(payable.availableAt);
  if (!Number.isFinite(acceptedAt) || !Number.isFinite(availableAt) || now < acceptedAt)
    return 'Chưa xác định được thời gian bảo trì của dự án. Vui lòng tải lại trang.';
  if (now >= availableAt)
    return 'Đã hết thời gian chờ bảo trì. Bạn có thể dùng “Yêu cầu rút tiền” khi số dư khả dụng.';
  if (!wallet.withdrawalsEnabled)
    return 'SAM chưa mở chức năng chi trả ngân hàng nên chưa nhận yêu cầu rút sớm. Vui lòng liên hệ hỗ trợ.';
  if (typeof payable.canRequestEarly !== 'boolean')
    return 'Thông tin rút sớm của dự án chưa được cập nhật. Vui lòng tải lại trang hoặc liên hệ hỗ trợ.';
  if (!payable.canRequestEarly)
    return 'Khoản thù lao này chưa đủ điều kiện xin rút sớm hoặc đang được giữ cho yêu cầu khác.';
  if ((payable.earlyAvailableAmount || 0) < wallet.minimumWithdrawal) {
    const minimum = new Intl.NumberFormat('vi-VN').format(wallet.minimumWithdrawal);
    return `Thù lao có thể xin rút sớm chưa đạt mức tối thiểu ${minimum} ₫.`;
  }
  return null;
}

export function evidenceError(files: Pick<File, 'name' | 'type' | 'size'>[]): string {
  if (files.length < 1 || files.length > 5) return 'Cần chọn từ 1 đến 5 ảnh bằng chứng.';
  for (const file of files) {
    if (
      !/\.(jpe?g|png|webp)$/i.test(file.name) ||
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    )
      return 'Chỉ nhận ảnh JPG, PNG hoặc WebP.';
    if (file.size < 1 || file.size > EVIDENCE_LIMIT)
      return 'Mỗi ảnh phải có nội dung và tối đa 5 MB.';
  }
  return '';
}

export function earlyRequestError(
  reason: string,
  files: Pick<File, 'name' | 'type' | 'size'>[]
): string {
  if (!reason.trim()) return 'Nhập lý do cần rút tiền sớm.';
  if (reason.trim().length > 2000) return 'Lý do tối đa 2000 ký tự.';
  return evidenceError(files);
}
