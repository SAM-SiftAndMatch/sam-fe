export const EVIDENCE_LIMIT = 5 * 1024 * 1024;

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
