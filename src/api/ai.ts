import { requireApiResult } from '../lib/api-error';
import apiClient from '../lib/axios';
import type { AiChatRequest, AiChatResponse, AiQuestion } from '../types/ai';
import type { ApiResponse } from '../types/api';

export const aiApi = {
  // AI-01: Lấy danh sách câu hỏi khởi động buổi phân tích BA (chỉ CLIENT)
  getBaseQuestions: async (): Promise<AiQuestion[]> => {
    const res = await apiClient.get<ApiResponse<AiQuestion[]>>('/ai/base-questions');
    return requireApiResult(res.data, 'Failed to fetch base questions');
  },

  // AI-02: Chat với AI Business Analyst để sinh tài liệu SRS
  chatWithAiBa: async (data: AiChatRequest): Promise<AiChatResponse> => {
    const res = await apiClient.post<ApiResponse<AiChatResponse>>('/ai/ba-chat', data);
    return requireApiResult(res.data, 'Failed to send message to AI BA');
  },

  // AI-03: Chat với AI Risk Assessor để đàm phán SRS/budget/deadline
  chatWithAiRisk: async (data: AiChatRequest): Promise<AiChatResponse> => {
    const res = await apiClient.post<ApiResponse<AiChatResponse>>('/ai/risk-chat', data);
    return requireApiResult(res.data, 'Failed to send message to AI Risk Assessor');
  },
};

export default aiApi;
