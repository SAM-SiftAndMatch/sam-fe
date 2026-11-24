export const MAX_CHAT_ATTACHMENTS = 5;
export const CHAT_IMAGE_LIMIT = 5 * 1024 * 1024;
export const CHAT_FILE_LIMIT = 10 * 1024 * 1024;
export const CHAT_VIDEO_LIMIT = 50 * 1024 * 1024;
export const CHAT_MESSAGE_LIMIT = 100 * 1024 * 1024;
export const CHAT_FILE_ACCEPT =
  '.jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.mp4,.webm';
export const CHAT_LIMITS_LABEL = 'Tối đa 5 tệp/tin · Ảnh 5MB · File 10MB · Video 50MB · Tổng 100MB';
const images = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp']);
const videos = new Set(['mp4', 'webm']);
const files = new Set(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv', 'zip']);
export function isChatImage(file: Pick<File, 'name'>): boolean {
  return images.has(file.name.split('.').at(-1)?.toLowerCase() || '');
}
export function validateChatFiles(selected: Array<Pick<File, 'name' | 'size'>>): string | null {
  if (selected.length > MAX_CHAT_ATTACHMENTS) return 'Mỗi tin nhắn tối đa 5 tệp.';
  let total = 0;
  for (const file of selected) {
    const extension = file.name.split('.').at(-1)?.toLowerCase() || '';
    if (!images.has(extension) && !files.has(extension) && !videos.has(extension))
      return 'Chỉ nhận ảnh JPG/PNG/GIF/WebP và video MP4/WebM, file PDF, DOC/DOCX, XLS/XLSX, TXT, CSV, ZIP.';
    if (file.size <= 0) return `File ${file.name} đang trống.`;
    const image = isChatImage(file);
    const video = videos.has(extension);
    if (file.size > (video ? CHAT_VIDEO_LIMIT : image ? CHAT_IMAGE_LIMIT : CHAT_FILE_LIMIT))
      return `${video ? 'Video' : image ? 'Ảnh' : 'File'} ${file.name} vượt quá ${video ? '50' : image ? '5' : '10'}MB.`;
    total += file.size;
  }
  return total > CHAT_MESSAGE_LIMIT ? 'Tổng file trong một tin nhắn tối đa 100MB.' : null;
}
export function chatFileSize(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.ceil(bytes / 1024))} KB`;
}
