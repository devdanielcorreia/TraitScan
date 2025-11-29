import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import SuperAdminLayout from './SuperAdminLayout';
import { adminApi } from '@/db/api';
import type { Company } from '@/types/database';
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

interface AdminCompany extends Company {
  psychologist?: {
    id: string;
    profiles?: {
      id: string;
      full_name: string | null;
      email: string | null;
    };
  } | null;
}

const formatDate = (value: string | null) => {
  if (!value) return '--';
  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
};

export default function AdminCompaniesPage() {
  const { t } = useI18n();
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = (await adminApi.getCompanies()) as AdminCompany[];
      setCompanies(data);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleToggleStatus = async (company: AdminCompany) => {
    try {
      setUpdatingId(company.id);
      await adminApi.setCompanyActive(company.id, !company.is_active);
      toast.success(t('admin.messages.companyUpdated'));
      await loadCompanies();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <SuperAdminLayout
      title={t('companies.title')}
      description={t('admin.tables.companies.description')}
    >
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={loadCompanies} disabled={loading}>
          {t('admin.actions.refresh')}
        </Button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.tables.companies.company')}</TableHead>
              <TableHead>{t('admin.tables.companies.psychologist')}</TableHead>
              <TableHead>{t('admin.tables.companies.subscription')}</TableHead>
              <TableHead>{t('admin.tables.companies.trialEnds')}</TableHead>
              <TableHead>{t('admin.tables.companies.status')}</TableHead>
              <TableHead className="text-right">
                {t('admin.tables.companies.actions')}
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
            ) : companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {t('admin.tables.companies.empty')}
                </TableCell>
              </TableRow>
            ) : (
              companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{company.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {company.email || t('common.noData')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {company.psychologist?.profiles ? (
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {company.psychologist.profiles.full_name ||
                            t('common.noData')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {company.psychologist.profiles.email}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {t('admin.tables.companies.noPsychologist')}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {company.subscription_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(company.trial_ends_at)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={company.is_active ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {company.is_active
                        ? t('admin.status.active')
                        : t('admin.status.inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(company)}
                      disabled={updatingId === company.id}
                    >
                      {company.is_active
                        ? t('admin.actions.suspend')
                        : t('admin.actions.activate')}
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
