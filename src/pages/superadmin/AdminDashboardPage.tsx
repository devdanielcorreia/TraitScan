import { useI18n } from '@/i18n/I18nContext';
import SuperAdminLayout from './SuperAdminLayout';

export default function AdminDashboardPage() {
  const { t } = useI18n();

  return (
    <SuperAdminLayout
      title={t('dashboard.overview')}
      description="Acompanhe a saúde geral da plataforma."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[t('nav.companies'), t('nav.psychologists'), t('nav.employees')].map(
          (label) => (
            <div
              key={label}
              className="rounded-xl border bg-card p-4 shadow-sm flex flex-col gap-2"
            >
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-3xl font-semibold text-primary">--</p>
              <p className="text-xs text-muted-foreground">
                Indicador em breve
              </p>
            </div>
          ),
        )}
      </div>
    </SuperAdminLayout>
  );
}
