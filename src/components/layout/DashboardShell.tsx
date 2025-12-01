import { useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Profile } from '@/types/database';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';
import { useI18n } from '@/i18n/I18nContext';

export interface DashboardNavItem {
  label: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface DashboardShellProps {
  title: string;
  description?: string;
  navItems: DashboardNavItem[];
  children: ReactNode;
  profile: Profile;
}

export function DashboardShell({ title, description, navItems, children, profile }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success(t('auth.logoutSuccess'));
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || t('common.error'));
    }
  };

  const renderNav = (item: DashboardNavItem) => {
    const isActive =
      location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

    return (
      <button
        key={item.path}
        type="button"
        onClick={() => navigate(item.path)}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors w-full',
          collapsed ? 'justify-center' : 'justify-start',
          isActive
            ? 'bg-primary text-primary-foreground shadow'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
      >
        {item.icon && <item.icon className="h-4 w-4" />}
        {!collapsed && <span>{item.label}</span>}
      </button>
    );
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-muted/10">
      <aside
        className={cn(
          'border-r bg-card flex flex-col transition-[width] duration-200',
          collapsed ? 'w-20' : 'w-64',
        )}
      >
        <div className="p-4 border-b flex items-center justify-between">
          {!collapsed && (
            <div>
              <p className="text-xs uppercase text-muted-foreground">TraitScan</p>
              <p className="text-lg font-semibold">Painel</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-4 flex flex-col gap-1">
          {navItems.map(renderNav)}
        </nav>
        <div className="border-t p-4 space-y-2">
          {!collapsed && (
            <>
              <p className="text-sm font-semibold truncate">{profile.full_name ?? 'Usuário'}</p>
              <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
            </>
          )}
          <Button variant="outline" className="w-full" size={collapsed ? 'icon' : 'default'} onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">{t('auth.logout')}</span>}
          </Button>
        </div>
      </aside>
      <section className="flex-1 p-6 space-y-4">
        <div>
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
