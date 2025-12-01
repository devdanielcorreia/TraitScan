import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { LayoutDashboard, ListChecks, ClipboardList, Building2, FileText, Shield } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { useProfile } from '@/hooks/useProfile';
import { DashboardShell, type DashboardNavItem } from '@/components/layout/DashboardShell';

interface RoleLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function PsychologistLayout({ title, description, children }: RoleLayoutProps) {
  const { t } = useI18n();
  const { profile, loading } = useProfile();

  const navItems: DashboardNavItem[] = [
    { label: t('nav.dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { label: t('nav.quizzes'), path: '/psychologist/quizzes', icon: ListChecks },
    { label: t('nav.assessments'), path: '/psychologist/assessments', icon: ClipboardList },
    { label: t('nav.companies'), path: '/psychologist/companies', icon: Building2 },
    { label: t('nav.reports'), path: '/psychologist/reports', icon: FileText },
    { label: t('nav.admin'), path: '/admin/dashboard', icon: Shield },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  if (!profile || profile.role !== 'psychologist') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <DashboardShell title={title} description={description} navItems={navItems} profile={profile}>
      {children}
    </DashboardShell>
  );
}
