import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { useProfile } from '@/hooks/useProfile';
import { DashboardShell, type DashboardNavItem } from '@/components/layout/DashboardShell';

interface RoleLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function CompanyLayout({ title, description, children }: RoleLayoutProps) {
  const { t } = useI18n();
  const { profile, loading } = useProfile();

  const navItems: DashboardNavItem[] = [
    { label: t('nav.dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { label: t('nav.employees'), path: '/company/employees', icon: Users },
    { label: t('nav.subscription'), path: '/company/subscription', icon: CreditCard },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  if (!profile || profile.role !== 'company') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <DashboardShell title={title} description={description} navItems={navItems} profile={profile}>
      {children}
    </DashboardShell>
  );
}
