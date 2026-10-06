import type React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import * as paths from '../../routes/paths';
import { useAuthStore } from '../../stores/useAuthStore';
import type { UserRole } from '../../types/auth';
import LoadingScreen from '../LoadingScreen';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to={paths.PATH_LOGIN} state={{ returnTo: location.pathname }} replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    if (user?.role === 'FREELANCER') {
      return <Navigate to={paths.PATH_FREELANCER} replace />;
    }
    if (user?.role === 'CLIENT') {
      return <Navigate to={paths.PATH_CLIENT_DASHBOARD} replace />;
    }
    return <Navigate to={paths.PATH_HOME} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default RoleGuard;
