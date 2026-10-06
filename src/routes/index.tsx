import type React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import { useAuthStore } from '../stores/useAuthStore';
import * as paths from './paths';

// Guards
import AuthGuard from '../components/guards/AuthGuard';
import GuestGuard from '../components/guards/GuestGuard';
import RoleGuard from '../components/guards/RoleGuard';

// Pages
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import RoleSelectionPage from '../pages/RoleSelectionPage';

import ClientDashboardPage from '../pages/ClientDashboardPage';
import ClientLandingPage from '../pages/ClientLandingPage';
import ClientPricingPage from '../pages/ClientPricingPage';

import AIBriefPage from '../pages/AIBriefPage';
import ClientPaymentPage from '../pages/ClientPaymentPage';
import ClientProfilePage from '../pages/ClientProfilePage';
import ClientProjectDetailPage from '../pages/ClientProjectDetailPage';
import ClientProjectListPage from '../pages/ClientProjectListPage';
import ConfirmProjectPage from '../pages/ConfirmProjectPage';
import PostProjectPage from '../pages/PostProjectPage';
import SuccessProjectPage from '../pages/SuccessProjectPage';
import VnpayReturnPage from '../pages/VnpayReturnPage';

import FreelancerPage from '../pages/FreelancerPage';
import FreelancerPricingPage from '../pages/FreelancerPricingPage';

import ApplyJobPage from '../pages/ApplyJobPage';
import CreateFreelancerProfilePage from '../pages/CreateFreelancerProfilePage';
import FindFreelancerPage from '../pages/FindFreelancerPage';
import FreelancerApplicationsPage from '../pages/FreelancerApplicationsPage';
import FreelancerEarningsPage from '../pages/FreelancerEarningsPage';
import FreelancerJobsPage from '../pages/FreelancerJobsPage';
import FreelancerProjectDetailPage from '../pages/FreelancerProjectDetailPage';
import FreelancerProjectListPage from '../pages/FreelancerProjectListPage';
import JobDetailPage from '../pages/JobDetailPage';
import SuccessApplicationPage from '../pages/SuccessApplicationPage';
import WorkspacePage from '../pages/WorkspacePage';
import WorkspacesPage from '../pages/WorkspacesPage';

const RootRoute: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    if (user?.role === 'FREELANCER') {
      return <Navigate to={paths.PATH_FREELANCER} replace />;
    }
    if (user?.role === 'CLIENT') {
      return <Navigate to={paths.PATH_CLIENT_DASHBOARD} replace />;
    }
  }

  return <ClientLandingPage />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Guest only routes (redirect to dashboard if authenticated) */}
      <Route element={<GuestGuard />}>
        <Route path={paths.PATH_LOGIN} element={<LoginPage />} />
        <Route path={paths.PATH_REGISTER} element={<RegisterPage />} />
        <Route path={paths.PATH_ROLE_SELECTION} element={<RoleSelectionPage />} />
      </Route>

      {/* Public routes */}
      <Route path={paths.PATH_HOME} element={<RootRoute />} />
      <Route path={paths.PATH_HOME_ALT} element={<RootRoute />} />
      <Route path={paths.PATH_CLIENT_PRICING} element={<ClientPricingPage />} />
      <Route path={paths.PATH_FREELANCER} element={<FreelancerPage />} />
      <Route path={paths.PATH_FREELANCER_PRICING} element={<FreelancerPricingPage />} />
      <Route path={paths.PATH_JOB_DETAIL} element={<JobDetailPage />} />

      {/* Client protected routes */}
      <Route element={<RoleGuard allowedRoles={['CLIENT']} />}>
        <Route path={paths.PATH_CLIENT_DASHBOARD} element={<ClientDashboardPage />} />
        <Route path={paths.PATH_CLIENT_POST_PROJECT} element={<PostProjectPage />} />
        <Route path={paths.PATH_CLIENT_AI_BRIEF} element={<AIBriefPage />} />
        <Route path={paths.PATH_CLIENT_CONFIRM_PROJECT} element={<ConfirmProjectPage />} />
        <Route path={paths.PATH_CLIENT_SUCCESS_PROJECT} element={<SuccessProjectPage />} />
        <Route path={paths.PATH_CLIENT_PROJECTS} element={<ClientProjectListPage />} />
        <Route path={paths.PATH_CLIENT_PROJECT_DETAIL} element={<ClientProjectDetailPage />} />
        <Route path={paths.PATH_CLIENT_PAYMENT} element={<ClientPaymentPage />} />
        <Route path={paths.PATH_CLIENT_PAYMENT_RETURN} element={<VnpayReturnPage />} />
        <Route path={paths.PATH_CLIENT_FIND_FREELANCER} element={<FindFreelancerPage />} />
        <Route path={paths.PATH_CLIENT_PROFILE} element={<ClientProfilePage />} />
      </Route>

      {/* Freelancer protected routes */}
      <Route element={<RoleGuard allowedRoles={['FREELANCER']} />}>
        <Route path={paths.PATH_FREELANCER_JOBS} element={<FreelancerJobsPage />} />
        <Route
          path={paths.PATH_FREELANCER_CREATE_PROFILE}
          element={<CreateFreelancerProfilePage />}
        />
        <Route path={paths.PATH_FREELANCER_APPLICATIONS} element={<FreelancerApplicationsPage />} />
        <Route path={paths.PATH_FREELANCER_PROJECTS} element={<FreelancerProjectListPage />} />
        <Route
          path={paths.PATH_FREELANCER_PROJECT_DETAIL}
          element={<FreelancerProjectDetailPage />}
        />
        <Route path={paths.PATH_FREELANCER_EARNINGS} element={<FreelancerEarningsPage />} />
        <Route path={paths.PATH_JOB_APPLY} element={<ApplyJobPage />} />
        <Route path={paths.PATH_JOB_APPLY_SUCCESS} element={<SuccessApplicationPage />} />
      </Route>

      {/* Authenticated routes (any role) */}
      <Route element={<AuthGuard />}>
        <Route path={paths.PATH_WORKSPACES} element={<WorkspacesPage />} />
        <Route path={paths.PATH_WORKSPACE} element={<WorkspacePage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
