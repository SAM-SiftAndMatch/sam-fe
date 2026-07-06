import { Route, Routes } from 'react-router-dom';
import * as paths from './paths';

// Pages
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import RoleSelectionPage from '../pages/RoleSelectionPage';

import ClientDashboardPage from '../pages/ClientDashboardPage';
import ClientLandingPage from '../pages/ClientLandingPage';
import ClientPricingPage from '../pages/ClientPricingPage';

import AIBriefPage from '../pages/AIBriefPage';
import ConfirmProjectPage from '../pages/ConfirmProjectPage';
import PostProjectPage from '../pages/PostProjectPage';
import SuccessProjectPage from '../pages/SuccessProjectPage';

import FreelancerPage from '../pages/FreelancerPage';
import FreelancerPricingPage from '../pages/FreelancerPricingPage';

import ApplyJobPage from '../pages/ApplyJobPage';
import JobDetailPage from '../pages/JobDetailPage';
import WorkspacePage from '../pages/WorkspacePage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path={paths.PATH_LOGIN} element={<LoginPage />} />
      <Route path={paths.PATH_REGISTER} element={<RegisterPage />} />
      <Route path={paths.PATH_ROLE_SELECTION} element={<RoleSelectionPage />} />

      <Route path={paths.PATH_HOME} element={<ClientLandingPage />} />
      <Route path={paths.PATH_HOME_ALT} element={<ClientLandingPage />} />
      <Route path={paths.PATH_CLIENT_DASHBOARD} element={<ClientDashboardPage />} />
      <Route path={paths.PATH_CLIENT_PRICING} element={<ClientPricingPage />} />

      <Route path={paths.PATH_CLIENT_POST_PROJECT} element={<PostProjectPage />} />
      <Route path={paths.PATH_CLIENT_AI_BRIEF} element={<AIBriefPage />} />
      <Route path={paths.PATH_CLIENT_CONFIRM_PROJECT} element={<ConfirmProjectPage />} />
      <Route path={paths.PATH_CLIENT_SUCCESS_PROJECT} element={<SuccessProjectPage />} />

      <Route path={paths.PATH_FREELANCER} element={<FreelancerPage />} />
      <Route path={paths.PATH_FREELANCER_PRICING} element={<FreelancerPricingPage />} />

      <Route path={paths.PATH_JOB_DETAIL} element={<JobDetailPage />} />
      <Route path={paths.PATH_JOB_APPLY} element={<ApplyJobPage />} />
      <Route path={paths.PATH_WORKSPACE} element={<WorkspacePage />} />
    </Routes>
  );
};

export default AppRoutes;
