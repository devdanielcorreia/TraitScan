import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { adminApi } from '@/db/api';
import SuperAdminLayout from './SuperAdminLayout';
import { toast } from 'sonner';

interface OverviewStats {
  companies: number;
  activeCompanies: number;
  psychologists: number;
  activePsychologists: number;
  employees: number;
  pendingInvitations: number;
}

export default function AdminDashboardPage() {
  const { t } = useI18n();
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminApi.getOverview();
        setStats(data);
      } catch (error: any) {
        toast.error(error.message || 'Falha ao carregar indicadores');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const cards = stats
    ? [
      {
        label: t('admin.cards.totalCompanies'),
        value: stats.companies,
        helper: t('admin.cards.activeCompanies', {
          value: stats.activeCompanies,
        }),
      },
      {
        label: t('admin.cards.totalPsychologists'),
        value: stats.psychologists,
        helper: t('admin.cards.activePsychologists', {
          value: stats.activePsychologists,
        }),
      },
      {
        label: t('admin.cards.employees'),
        value: stats.employees,
        helper: t('admin.cards.employeesHelper'),
      },
      {
        label: t('admin.cards.pendingInvites'),
        value: stats.pendingInvitations,
        helper: t('admin.cards.pendingInvitesHelper'),
      },
    ]
    : [];

  return (
    <SuperAdminLayout
      title={t('dashboard.overview')}
      description={t('admin.overviewDescription')}
    >
      {loading ? (
        <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          {t('common.loading')}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border bg-card p-4 shadow-sm flex flex-col gap-2"
            >
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="text-3xl font-semibold text-primary">
                {card.value}
              </p>
              <p className="text-xs text-muted-foreground">{card.helper}</p>
            </div>
          ))}
        </div>
      )}
    </SuperAdminLayout>
  );
}
