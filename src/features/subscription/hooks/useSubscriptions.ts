import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useCallback, useState } from 'react';
import { subscriptionApi } from '../../../api/subscription';
import { useAuthStore } from '../../../stores/useAuthStore';

function toMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function useMySubscriptions() {
  const { user, isAuthenticated } = useAuthStore();
  const enabled = Boolean(user?.userId && isAuthenticated);
  const query = useQuery({
    queryKey: ['subscriptions', user?.userId],
    queryFn: subscriptionApi.mySubscriptions,
    enabled,
    refetchOnWindowFocus: true,
  });
  return {
    subscriptions: query.data ?? [],
    isLoading: enabled && query.isPending,
    error: query.isError ? toMessage(query.error, 'Không tải được danh sách gói dịch vụ') : null,
    refetch: query.refetch,
  };
}

export function useMySubscriptionsPage(page: number) {
  const { user, isAuthenticated } = useAuthStore();
  const enabled = Boolean(user?.userId && isAuthenticated);
  const query = useQuery({
    queryKey: ['subscriptions-page', user?.userId, page],
    queryFn: () => subscriptionApi.mySubscriptionsPage(page),
    enabled,
    refetchOnWindowFocus: true,
  });
  return {
    result: query.data ?? null,
    isLoading: enabled && query.isPending,
    error: query.isError ? toMessage(query.error, 'Không tải được gói dịch vụ') : null,
    refetch: query.refetch,
  };
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
      const returnUrl = `${window.location.origin}/payment/return`;
      const result = await subscriptionApi.purchase({
        packageId,
        projectId: projectId ?? null,
        returnUrl,
      });
      if (result.entitled) {
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
