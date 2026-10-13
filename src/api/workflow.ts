import { requireApiResult } from '../lib/api-error';
import apiClient from '../lib/axios';
import type { ApiResponse } from '../types/api';
import type {
  DeliveryAcceptance,
  DeliveryCreateRequest,
  DeliveryRevisionRequest,
  ProjectDelivery,
  ProjectTimeline,
  QaPlan,
  TaskReportRequest,
} from '../types/workflow';

export const workflowApi = {
  getTimeline: async (jobId: string): Promise<ProjectTimeline> => {
    const res = await apiClient.get<ApiResponse<ProjectTimeline>>(`/projects/${jobId}/timeline`);
    return requireApiResult(res.data, 'Không tải được timeline dự án');
  },

  addTaskReport: async (
    jobId: string,
    taskId: string,
    data: TaskReportRequest
  ): Promise<ProjectTimeline> => {
    const res = await apiClient.post<ApiResponse<ProjectTimeline>>(
      `/projects/${jobId}/timeline/tasks/${taskId}/reports`,
      data
    );
    return requireApiResult(res.data, 'Không gửi được báo cáo tiến độ');
  },

  getDeliveries: async (jobId: string): Promise<ProjectDelivery[]> => {
    const res = await apiClient.get<ApiResponse<ProjectDelivery[]>>(
      `/projects/${jobId}/deliveries`
    );
    return requireApiResult(res.data, 'Không tải được sản phẩm bàn giao');
  },

  submitDelivery: async (jobId: string, data: DeliveryCreateRequest): Promise<ProjectDelivery> => {
    const res = await apiClient.post<ApiResponse<ProjectDelivery>>(
      `/projects/${jobId}/deliveries`,
      data
    );
    return requireApiResult(res.data, 'Không gửi được sản phẩm bàn giao');
  },

  getQaPlan: async (jobId: string, deliveryId: string): Promise<QaPlan> => {
    const res = await apiClient.get<ApiResponse<QaPlan>>(
      `/projects/${jobId}/deliveries/${deliveryId}/qa-plan`
    );
    return requireApiResult(res.data, 'Không tải được checklist nghiệm thu');
  },

  requestDeliveryRevision: async (
    jobId: string,
    deliveryId: string,
    data: DeliveryRevisionRequest
  ): Promise<ProjectDelivery> => {
    const res = await apiClient.post<ApiResponse<ProjectDelivery>>(
      `/projects/${jobId}/deliveries/${deliveryId}/request-revision`,
      data
    );
    return requireApiResult(res.data, 'Không thể gửi yêu cầu chỉnh sửa');
  },

  acceptDelivery: async (jobId: string, deliveryId: string): Promise<DeliveryAcceptance> => {
    const res = await apiClient.post<ApiResponse<DeliveryAcceptance>>(
      `/projects/${jobId}/deliveries/${deliveryId}/accept`
    );
    return requireApiResult(res.data, 'Không thể xác nhận nghiệm thu');
  },
};

export default workflowApi;
