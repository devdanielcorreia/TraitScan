import { useI18n } from '@/i18n/I18nContext';
import SuperAdminLayout from './SuperAdminLayout';

export default function AdminPsychologistsPage() {
  const { t } = useI18n();

  return (
    <SuperAdminLayout
      title={t('psychologists.title')}
      description="Gerencie perfis de psicólogos e promoções para administradores."
    >
      <div className="rounded-xl border bg-card p-6 text-muted-foreground">
        {t('common.loading') || 'Em breve'}: painel para auditoria de psicólogos,
        convites e mudanças de role.
      </div>
    </SuperAdminLayout>
  );
}
