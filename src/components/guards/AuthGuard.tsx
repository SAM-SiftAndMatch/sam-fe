import type React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import * as paths from '../../routes/paths';
import { useAuthStore } from '../../stores/useAuthStore';
import LoadingScreen from '../LoadingScreen';

interface AuthGuardProps {
  children?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to={paths.PATH_LOGIN} state={{ returnTo: location.pathname }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default AuthGuard;
