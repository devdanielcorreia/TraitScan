import { useI18n } from '@/i18n/I18nContext';
import SuperAdminLayout from './SuperAdminLayout';

export default function AdminCompaniesPage() {
  const { t } = useI18n();

  return (
    <SuperAdminLayout
      title={t('companies.title')}
      description="Visualize empresas cadastradas e prepare o gerenciamento completo."
    >
      <div className="rounded-xl border bg-card p-6 text-muted-foreground">
        {t('common.loading') || 'Em breve'}: listagem de empresas com filtros,
        convites e ações administrativas.
      </div>
    </SuperAdminLayout>
  );
}
