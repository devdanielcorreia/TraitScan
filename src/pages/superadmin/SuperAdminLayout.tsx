import type { ReactNode } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useI18n } from '@/i18n/I18nContext';
import { useProfile } from '@/hooks/useProfile';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';

interface SuperAdminLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

const NAV_ITEMS = [
  { labelKey: 'nav.dashboard', path: '/admin/dashboard' },
  { labelKey: 'nav.companies', path: '/admin/companies' },
  { labelKey: 'nav.psychologists', path: '/admin/psychologists' },
  { labelKey: 'nav.invitations', path: '/admin/invitations' },
  { labelKey: 'nav.billing', path: '/admin/billing' },
] as const;

export default function SuperAdminLayout({
  title,
  description,
  children,
}: SuperAdminLayoutProps) {
  const { t } = useI18n();
  const { profile, loading } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    label: t(item.labelKey as any),
  }));

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

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
    <div className="flex min-h-[calc(100vh-64px)] bg-muted/10">
      <aside className="w-64 border-r bg-card flex flex-col justify-between">
        <div>
          <div className="p-4 border-b">
            <p className="text-xs uppercase text-muted-foreground">{t('nav.admin')}</p>
            <p className="text-lg font-semibold">TraitScan</p>
          </div>
          <nav className="flex flex-col gap-1 p-2">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={cn(
                    'rounded-md px-3 py-2 text-left text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="border-t p-4 space-y-2">
          <div>
            <p className="text-sm font-semibold">{profile.full_name ?? 'Super Admin'}</p>
            <p className="text-xs text-muted-foreground">{profile.email}</p>
          </div>
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            {t('auth.logout')}
          </Button>
        </div>
      </aside>

      <section className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {children}
      </section>
    </div>
  );
}
