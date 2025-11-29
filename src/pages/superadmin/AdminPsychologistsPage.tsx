import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import SuperAdminLayout from './SuperAdminLayout';
import { adminApi } from '@/db/api';
import type { UserRole } from '@/types/database';
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
import { toast } from 'sonner';

interface AdminPsychologist {
  id: string;
  license_number: string | null;
  specialization: string | null;
  is_active: boolean | null;
  profiles: {
    id: string;
    full_name: string | null;
    email: string | null;
    role: UserRole;
  } | null;
}

export default function AdminPsychologistsPage() {
  const { t } = useI18n();
  const [psychologists, setPsychologists] = useState<AdminPsychologist[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);

  const loadPsychologists = async () => {
    try {
      setLoading(true);
      const data = (await adminApi.getPsychologists()) as AdminPsychologist[];
      setPsychologists(data);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar psicólogos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPsychologists();
  }, []);

  const handleToggleStatus = async (entry: AdminPsychologist) => {
    try {
      setUpdatingId(entry.id);
      await adminApi.setPsychologistActive(entry.id, !entry.is_active);
      toast.success(t('admin.messages.psychologistUpdated'));
      await loadPsychologists();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleRole = async (entry: AdminPsychologist) => {
    if (!entry.profiles) return;
    const nextRole: UserRole =
      entry.profiles.role === 'superadmin' ? 'psychologist' : 'superadmin';
    try {
      setRoleUpdatingId(entry.id);
      await adminApi.updatePsychologistRole(entry.profiles.id, nextRole);
      toast.success(t('admin.messages.roleUpdated'));
      await loadPsychologists();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar role');
    } finally {
      setRoleUpdatingId(null);
    }
  };

  return (
    <SuperAdminLayout
      title={t('psychologists.title')}
      description={t('admin.tables.psychologists.description')}
    >
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={loadPsychologists} disabled={loading}>
          {t('admin.actions.refresh')}
        </Button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.tables.psychologists.name')}</TableHead>
              <TableHead>{t('admin.tables.psychologists.email')}</TableHead>
              <TableHead>{t('admin.tables.psychologists.license')}</TableHead>
              <TableHead>{t('admin.tables.psychologists.status')}</TableHead>
              <TableHead>{t('admin.tables.psychologists.role')}</TableHead>
              <TableHead className="text-right">
                {t('admin.tables.psychologists.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : psychologists.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {t('admin.tables.psychologists.empty')}
                </TableCell>
              </TableRow>
            ) : (
              psychologists.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    {entry.profiles?.full_name || t('common.noData')}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {entry.profiles?.email || t('common.noData')}
                  </TableCell>
                  <TableCell className="text-sm">
                    {entry.license_number || '--'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={entry.is_active ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {entry.is_active
                        ? t('admin.status.active')
                        : t('admin.status.inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {entry.profiles?.role ?? '---'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(entry)}
                      disabled={updatingId === entry.id}
                    >
                      {entry.is_active
                        ? t('admin.actions.suspend')
                        : t('admin.actions.activate')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleRole(entry)}
                      disabled={roleUpdatingId === entry.id}
                    >
                      {entry.profiles?.role === 'superadmin'
                        ? t('admin.actions.demote')
                        : t('admin.actions.promote')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </SuperAdminLayout>
  );
}
