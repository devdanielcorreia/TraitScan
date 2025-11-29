import { useI18n } from '@/i18n/I18nContext';
import SuperAdminLayout from './SuperAdminLayout';

export default function AdminInvitationsPage() {
  const { t } = useI18n();

  return (
    <SuperAdminLayout
      title={t('nav.invitations')}
      description="Gere links de convite e acompanhe o status dos convites enviados."
    >
      <div className="rounded-xl border bg-card p-6 text-muted-foreground">
        {t('common.loading') || 'Em breve'}: formulário para novos convites e
        tabela com status (pendente, aceito, expirado).
      </div>
    </SuperAdminLayout>
  );
}
