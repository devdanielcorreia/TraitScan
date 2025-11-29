import { useI18n } from '@/i18n/I18nContext';
import SuperAdminLayout from './SuperAdminLayout';

export default function AdminBillingPage() {
  const { t } = useI18n();

  return (
    <SuperAdminLayout
      title={t('nav.billing')}
      description="Resumo financeiro e integrações com Stripe."
    >
      <div className="rounded-xl border bg-card p-6 text-muted-foreground">
        {t('common.loading') || 'Em breve'}: gráficos de faturamento, status de
        assinaturas e ações de cobrança.
      </div>
    </SuperAdminLayout>
  );
}
