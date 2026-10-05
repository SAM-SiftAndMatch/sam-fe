import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { subscriptionApi } from '../../../api/subscription';
import { useAuthStore } from '../../../stores/useAuthStore';
import type { UserSubscriptionResponse } from '../../../types/subscription';

function toMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function useMySubscriptions() {
  const { isAuthenticated } = useAuthStore();
  const [subscriptions, setSubscriptions] = useState<UserSubscriptionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setSubscriptions([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      setSubscriptions(await subscriptionApi.mySubscriptions());
    } catch (e) {
      setError(toMessage(e, 'Không tải được danh sách gói dịch vụ'));
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void load();
  }, [load]);

  return { subscriptions, isLoading, error, refetch: load };
}

export function usePurchasePackage() {
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const purchase = useCallback(async (packageId: string, projectId?: string | null) => {
    setPurchasingId(packageId);
    setError(null);
    setSuccessMessage(null);
    try {
      const result = await subscriptionApi.purchase({ packageId, projectId: projectId ?? null });
      // Có vnpayUrl = phải sang VNPay thanh toán (page tự redirect), chưa kích hoạt nên không báo thành công.
      if (!result.vnpayUrl) {
        setSuccessMessage('Mua gói thành công! Gói đã được kích hoạt.');
      }
      return result;
    } catch (e) {
      setError(toMessage(e, 'Mua gói thất bại. Vui lòng thử lại.'));
      return null;
    } finally {
      setPurchasingId(null);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  return { purchase, purchasingId, error, successMessage, clearMessages };
}
