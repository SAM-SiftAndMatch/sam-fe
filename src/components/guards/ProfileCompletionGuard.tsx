import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { profileApi } from '../../api/profile';
import { isParticipationProfileComplete } from '../../lib/participation-policy';
import { PATH_CLIENT_PROFILE, PATH_FREELANCER_CREATE_PROFILE } from '../../routes/paths';
import { useAuthStore } from '../../stores/useAuthStore';
import type { ContractContactResponse } from '../../types/profile';
import AppHeader from '../AppHeader';
import LoadingScreen from '../LoadingScreen';

export default function ProfileCompletionGuard({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const profile = useQuery<ContractContactResponse>({
    queryKey: ['participation-profile', user?.userId],
    queryFn: () =>
      user?.role === 'CLIENT' ? profileApi.getClientProfile() : profileApi.getFreelancerProfile(),
    enabled: Boolean(user && user.role !== 'ADMIN'),
    staleTime: 0,
  });
  if (!user || user.role === 'ADMIN') return <>{children}</>;
  if (profile.isPending) return <LoadingScreen />;
  if (profile.isError)
    return (
      <div className="min-h-screen bg-slate-50">
        <AppHeader />
        <main className="mx-auto max-w-3xl p-8">
          <p role="alert">Không tải được hồ sơ để kiểm tra thông tin hợp đồng.</p>
          <button
            type="button"
            onClick={() => void profile.refetch()}
            className="mt-4 rounded-xl bg-blue-700 px-5 py-3 text-white"
          >
            Thử lại
          </button>
        </main>
      </div>
    );
  if (!isParticipationProfileComplete(profile.data))
    return (
      <Navigate
        replace
        to={user.role === 'CLIENT' ? PATH_CLIENT_PROFILE : PATH_FREELANCER_CREATE_PROFILE}
        state={{ returnTo: location.pathname + location.search, returnState: location.state }}
      />
    );
  return <>{children}</>;
}
