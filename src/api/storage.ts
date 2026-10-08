import { requireApiResult } from '../lib/api-error';
import apiClient from '../lib/axios';
import type { ApiResponse } from '../types/api';

// Tải file qua BE (tránh lỗi ACL khi bấm link Cloudinary trực tiếp) — bấm là tải về máy
export const storageApi = {
  uploadFile: async (file: File): Promise<string> => {
    const form = new FormData();
    form.append('file', file);
    const res = await apiClient.post<ApiResponse<string>>('/storage/upload-file', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return requireApiResult(res.data, 'Failed to upload file');
  },

  download: async (url: string, filename?: string | null): Promise<void> => {
    const res = await apiClient.get('/storage/download', {
      params: { url },
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename || 'proposal.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
  },
};

export default storageApi;
