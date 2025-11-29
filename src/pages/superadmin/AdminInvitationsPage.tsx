import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import SuperAdminLayout from './SuperAdminLayout';
import { adminInvitationsApi } from '@/db/api';
import type { Invitation } from '@/types/database';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InviteForm } from '@/components/forms/InviteForm';
import { toast } from 'sonner';

export default function AdminInvitationsPage() {
  const { t } = useI18n();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const data = (await adminInvitationsApi.listInvitations()) as Invitation[];
      setInvitations(data);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar convites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const handleSubmit = async (payload: { email: string; role: Invitation['role'] }) => {
    try {
      setSubmitting(true);
      await adminInvitationsApi.createInvitation(payload);
      toast.success(t('admin.messages.invitationCreated'));
      await loadInvitations();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar convite');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SuperAdminLayout
      title={t('nav.invitations')}
      description={t('admin.tables.invitations.description')}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">{t('admin.tables.invitations.createTitle')}</h3>
          <InviteForm onSubmit={handleSubmit} pending={submitting} />
        </div>
        <div className="lg:col-span-2 rounded-xl border bg-card overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <p className="text-sm font-medium">{t('admin.tables.invitations.listTitle')}</p>
              <p className="text-xs text-muted-foreground">
                {t('admin.tables.invitations.listCaption')}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={loadInvitations} disabled={loading}>
              {t('admin.actions.refresh')}
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.tables.invitations.email')}</TableHead>
                <TableHead>{t('admin.tables.invitations.role')}</TableHead>
                <TableHead>{t('admin.tables.invitations.status')}</TableHead>
                <TableHead>{t('admin.tables.invitations.expires')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    {t('common.loading')}
                  </TableCell>
                </TableRow>
              ) : invitations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    {t('admin.tables.invitations.empty')}
                  </TableCell>
                </TableRow>
              ) : (
                invitations.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{invite.email}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(invite.created_at).toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{invite.role}</TableCell>
                    <TableCell>
                      <Badge variant={invite.status === 'pending' ? 'default' : 'secondary'}>
                        {invite.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {invite.expires_at
                        ? new Date(invite.expires_at).toLocaleDateString()
                        : t('common.noData')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
