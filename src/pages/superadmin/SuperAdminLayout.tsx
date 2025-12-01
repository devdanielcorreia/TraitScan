import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useI18n } from '@/i18n/I18nContext';
import { useProfile } from '@/hooks/useProfile';
import { DashboardShell, type DashboardNavItem } from '@/components/layout/DashboardShell';
import { LayoutDashboard, Building2, Users2, MailPlus, CreditCard } from 'lucide-react';

interface SuperAdminLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

const NAV_ITEMS = [
  { labelKey: 'nav.dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { labelKey: 'nav.companies', path: '/admin/companies', icon: Building2 },
  { labelKey: 'nav.psychologists', path: '/admin/psychologists', icon: Users2 },
  { labelKey: 'nav.invitations', path: '/admin/invitations', icon: MailPlus },
  { labelKey: 'nav.billing', path: '/admin/billing', icon: CreditCard },
] as const;

export default function SuperAdminLayout({
  title,
  description,
  children,
}: SuperAdminLayoutProps) {
  const { t } = useI18n();
  const { profile, loading } = useProfile();

  const navItems: DashboardNavItem[] = NAV_ITEMS.map((item) => ({
    label: t(item.labelKey as any),
    path: item.path,
    icon: item.icon,
  }));

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">{t('common.loading') || 'Carregando...'}</p>
      </div>
    );
  }

  if (!profile || profile.role !== 'superadmin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <DashboardShell
      title={title}
      description={description}
      navItems={navItems}
      profile={profile}
    >
      {children}
    </DashboardShell>
  );
}
