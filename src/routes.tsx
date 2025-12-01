import type { ReactNode } from 'react';
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TakeAssessmentPage from './pages/public/TakeAssessmentPage';
import InvitationSignupPage from './pages/public/InvitationSignupPage';
import QuizzesPage from './pages/psychologist/QuizzesPage';
import QuizFormPage from './pages/psychologist/QuizFormPage';
import CompaniesPage from './pages/psychologist/CompaniesPage';
import AssessmentsPage from './pages/psychologist/AssessmentsPage';
import AssessmentFormPage from './pages/psychologist/AssessmentFormPage';
import ApplyAssessmentPage from './pages/psychologist/ApplyAssessmentPage';
import ReportsPage from './pages/psychologist/ReportsPage';
import ReportDetailPage from './pages/psychologist/ReportDetailPage';
import EmployeesPage from './pages/company/EmployeesPage';
import CompanySubscriptionPage from './pages/company/SubscriptionPage';
import AdminDashboardPage from './pages/superadmin/AdminDashboardPage';
import AdminCompaniesPage from './pages/superadmin/AdminCompaniesPage';
import AdminPsychologistsPage from './pages/superadmin/AdminPsychologistsPage';
import AdminInvitationsPage from './pages/superadmin/AdminInvitationsPage';
import AdminBillingPage from './pages/superadmin/AdminBillingPage';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Landing',
    path: '/',
    element: <LandingPage />,
    visible: false,
  },
  {
    name: 'Login',
    path: '/login',
    element: <LoginPage />,
    visible: false,
  },
  {
    name: 'Take Assessment',
    path: '/assessment/:token',
    element: <TakeAssessmentPage />,
    visible: false,
  },
  {
    name: 'Invitation Signup',
    path: '/invite/:token',
    element: <InvitationSignupPage />,
    visible: false,
  },
  {
    name: 'Dashboard',
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    name: 'Quizzes',
    path: '/psychologist/quizzes',
    element: <QuizzesPage />,
  },
  {
    name: 'Create Quiz',
    path: '/psychologist/quizzes/create',
    element: <QuizFormPage />,
    visible: false,
  },
  {
    name: 'Edit Quiz',
    path: '/psychologist/quizzes/:id/edit',
    element: <QuizFormPage />,
    visible: false,
  },
  {
    name: 'Companies',
    path: '/psychologist/companies',
    element: <CompaniesPage />,
  },
  {
    name: 'Assessments',
    path: '/psychologist/assessments',
    element: <AssessmentsPage />,
  },
  {
    name: 'Create Assessment',
    path: '/psychologist/assessments/create',
    element: <AssessmentFormPage />,
    visible: false,
  },
  {
    name: 'Edit Assessment',
    path: '/psychologist/assessments/:id/edit',
    element: <AssessmentFormPage />,
    visible: false,
  },
  {
    name: 'Apply Assessment',
    path: '/psychologist/assessments/:id/apply',
    element: <ApplyAssessmentPage />,
    visible: false,
  },
  {
    name: 'Reports',
    path: '/psychologist/reports',
    element: <ReportsPage />,
  },
  {
    name: 'Report Detail',
    path: '/psychologist/reports/:id',
    element: <ReportDetailPage />,
    visible: false,
  },
  {
    name: 'Employees',
    path: '/company/employees',
    element: <EmployeesPage />,
  },
  {
    name: 'Company Subscription',
    path: '/company/subscription',
    element: <CompanySubscriptionPage />,
  },
  {
    name: 'Admin Dashboard',
    path: '/admin/dashboard',
    element: <AdminDashboardPage />,
  },
  {
    name: 'Admin Companies',
    path: '/admin/companies',
    element: <AdminCompaniesPage />,
  },
  {
    name: 'Admin Psychologists',
    path: '/admin/psychologists',
    element: <AdminPsychologistsPage />,
  },
  {
    name: 'Admin Invitations',
    path: '/admin/invitations',
    element: <AdminInvitationsPage />,
  },
  {
    name: 'Admin Billing',
    path: '/admin/billing',
    element: <AdminBillingPage />,
  },
];

export default routes;
