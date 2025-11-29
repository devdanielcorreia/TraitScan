import type { ReactNode } from 'react';
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TakeAssessmentPage from './pages/public/TakeAssessmentPage';
import QuizzesPage from './pages/psychologist/QuizzesPage';
import QuizFormPage from './pages/psychologist/QuizFormPage';
import CompaniesPage from './pages/psychologist/CompaniesPage';
import AssessmentsPage from './pages/psychologist/AssessmentsPage';
import AssessmentFormPage from './pages/psychologist/AssessmentFormPage';
import ApplyAssessmentPage from './pages/psychologist/ApplyAssessmentPage';
import ReportsPage from './pages/psychologist/ReportsPage';
import ReportDetailPage from './pages/psychologist/ReportDetailPage';
import EmployeesPage from './pages/company/EmployeesPage';

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
];

export default routes;
