import type React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import * as paths from '../../routes/paths';
import { useAuthStore } from '../../stores/useAuthStore';
import LoadingScreen from '../LoadingScreen';

interface GuestGuardProps {
  children?: React.ReactNode;
}

export const GuestGuard: React.FC<GuestGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    if (user?.role === 'FREELANCER') {
      return <Navigate to={paths.PATH_FREELANCER} replace />;
    }
    return <Navigate to={paths.PATH_CLIENT_DASHBOARD} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default GuestGuard;
