import { assertApiSuccess, requireApiResult } from '../lib/api-error';
import apiClient from '../lib/axios';
import type { ApiResponse } from '../types/api';

export type AiTestStatus = 'NEVER' | 'OK' | 'FAIL';

export interface RuntimeStatus {
  cryptoConfigured: boolean;
  envFallbackKeyMasked: string | null;
  envFallbackModel: string | null;
  activeDbKeys: number;
  activeDbModels: number;
}

export interface AiKeyItem {
  id: number;
  label: string | null;
  keyMasked: string;
  active: boolean;
  priority: number;
  failCount: number;
  lastTestAt: string | null;
  lastTestStatus: AiTestStatus;
  lastTestMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AiModelItem {
  id: number;
  modelName: string;
  displayName: string | null;
  active: boolean;
  priority: number;
  lastTestAt: string | null;
  lastTestStatus: AiTestStatus;
  lastTestMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AiTestResult {
  ok: boolean;
  statusCode: number | null;
  latencyMs: number;
  modelUsed: string;
  message: string;
}

export interface BatchModelTestItem {
  modelId: number;
  modelName: string;
  result: AiTestResult;
}

export interface BatchTestModelsResponse {
  total: number;
  passed: number;
  failed: number;
  items: BatchModelTestItem[];
}

export const adminAiApi = {
  runtime: async () =>
    requireApiResult(
      (await apiClient.get<ApiResponse<RuntimeStatus>>('/admin/ai/runtime')).data,
      'Không tải được trạng thái cấu hình AI.'
    ),

  listKeys: async () =>
    requireApiResult(
      (await apiClient.get<ApiResponse<AiKeyItem[]>>('/admin/ai/keys')).data,
      'Không tải được danh sách API key.'
    ),

  createKey: async (input: {
    label?: string;
    apiKey: string;
    priority?: number;
    active?: boolean;
  }) =>
    requireApiResult(
      (await apiClient.post<ApiResponse<AiKeyItem>>('/admin/ai/keys', input)).data,
      'Không thêm được API key.'
    ),

  updateKey: async (id: number, input: { label?: string; priority?: number; active?: boolean }) =>
    requireApiResult(
      (await apiClient.patch<ApiResponse<AiKeyItem>>(`/admin/ai/keys/${id}`, input)).data,
      'Không cập nhật được API key.'
    ),

  deleteKey: async (id: number) => {
    const res = (await apiClient.delete<ApiResponse<null>>(`/admin/ai/keys/${id}`)).data;
    assertApiSuccess(res, 'Không xóa được API key.');
  },

  testSavedKey: async (id: number, modelName?: string) =>
    requireApiResult(
      (
        await apiClient.post<ApiResponse<AiTestResult>>(`/admin/ai/keys/${id}/test`, {
          modelName: modelName || undefined,
        })
      ).data,
      'Không test được API key.'
    ),

  testDraftKey: async (input: { apiKey: string; modelName?: string }) =>
    requireApiResult(
      (await apiClient.post<ApiResponse<AiTestResult>>('/admin/ai/keys/test-draft', input)).data,
      'Không test thử được API key.'
    ),

  listModels: async () =>
    requireApiResult(
      (await apiClient.get<ApiResponse<AiModelItem[]>>('/admin/ai/models')).data,
      'Không tải được danh sách model AI.'
    ),

  createModel: async (input: {
    modelName: string;
    displayName?: string;
    priority?: number;
    active?: boolean;
  }) =>
    requireApiResult(
      (await apiClient.post<ApiResponse<AiModelItem>>('/admin/ai/models', input)).data,
      'Không thêm được model AI.'
    ),

  updateModel: async (
    id: number,
    input: { displayName?: string; priority?: number; active?: boolean }
  ) =>
    requireApiResult(
      (await apiClient.patch<ApiResponse<AiModelItem>>(`/admin/ai/models/${id}`, input)).data,
      'Không cập nhật được model AI.'
    ),

  deleteModel: async (id: number) => {
    const res = (await apiClient.delete<ApiResponse<null>>(`/admin/ai/models/${id}`)).data;
    assertApiSuccess(res, 'Không xóa được model AI.');
  },

  testSavedModel: async (id: number, keyId?: number) =>
    requireApiResult(
      (
        await apiClient.post<ApiResponse<AiTestResult>>(`/admin/ai/models/${id}/test`, {
          keyId: keyId ?? undefined,
        })
      ).data,
      'Không test được model AI.'
    ),

  testDraftModel: async (input: { modelName: string; keyId?: number }) =>
    requireApiResult(
      (await apiClient.post<ApiResponse<AiTestResult>>('/admin/ai/models/test-draft', input)).data,
      'Không test thử được model AI.'
    ),

  testModelsBatch: async (input: { modelIds?: number[]; keyId?: number }) =>
    requireApiResult(
      (
        await apiClient.post<ApiResponse<BatchTestModelsResponse>>(
          '/admin/ai/models/test-batch',
          input
        )
      ).data,
      'Không test hàng loạt được các model AI.'
    ),
};
