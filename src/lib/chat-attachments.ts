export const MAX_CHAT_ATTACHMENTS = 5;
export const CHAT_IMAGE_LIMIT = 5 * 1024 * 1024;
export const CHAT_FILE_LIMIT = 10 * 1024 * 1024;
export const CHAT_MESSAGE_LIMIT = 25 * 1024 * 1024;
export const CHAT_FILE_ACCEPT =
  '.jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip';
export const CHAT_LIMITS_LABEL = 'Tối đa 5 tệp/tin · Ảnh 5MB · File 10MB · Tổng 25MB';
const images = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp']);
const files = new Set(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv', 'zip']);
export function isChatImage(file: Pick<File, 'name'>): boolean {
  return images.has(file.name.split('.').at(-1)?.toLowerCase() || '');
}
export function validateChatFiles(selected: Array<Pick<File, 'name' | 'size'>>): string | null {
  if (selected.length > MAX_CHAT_ATTACHMENTS) return 'Mỗi tin nhắn tối đa 5 tệp.';
  let total = 0;
  for (const file of selected) {
    const extension = file.name.split('.').at(-1)?.toLowerCase() || '';
    if (!images.has(extension) && !files.has(extension))
      return 'Chỉ nhận ảnh JPG/PNG/GIF/WebP và file PDF, DOC/DOCX, XLS/XLSX, TXT, CSV, ZIP.';
    if (file.size <= 0) return `File ${file.name} đang trống.`;
    const image = isChatImage(file);
    if (file.size > (image ? CHAT_IMAGE_LIMIT : CHAT_FILE_LIMIT))
      return `${image ? 'Ảnh' : 'File'} ${file.name} vượt quá ${image ? '5' : '10'}MB.`;
    total += file.size;
  }
  return total > CHAT_MESSAGE_LIMIT ? 'Tổng file trong một tin nhắn tối đa 25MB.' : null;
}
export function chatFileSize(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.ceil(bytes / 1024))} KB`;
}
