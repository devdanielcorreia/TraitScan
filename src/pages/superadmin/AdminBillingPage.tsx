import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import SuperAdminLayout from './SuperAdminLayout';
import { adminApi } from '@/db/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

type BillingSummary = {
  counts: Record<string, number>;
  expiringTrials: Array<{ id: string; name: string; trial_ends_at: string | null; subscription_status: string | null }>;
};

const statusOrder: Array<{ key: string; tone: string }> = [
  { key: 'trial', tone: 'border-blue-200 bg-blue-50 text-blue-900' },
  { key: 'active', tone: 'border-green-200 bg-green-50 text-green-900' },
  { key: 'past_due', tone: 'border-amber-200 bg-amber-50 text-amber-900' },
  { key: 'cancelled', tone: 'border-rose-200 bg-rose-50 text-rose-900' },
  { key: 'inactive', tone: 'border-zinc-200 bg-zinc-50 text-zinc-900' },
];

export default function AdminBillingPage() {
  const { t } = useI18n();
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getBillingSummary();
      setSummary(data);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar faturamento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  return (
    <SuperAdminLayout
      title={t('nav.billing')}
      description={t('admin.billing.overview')}
    >
      <div className="flex items-center justify-end mb-4">
        <Button variant="outline" size="sm" onClick={loadSummary} disabled={loading}>
          {t('admin.actions.refresh')}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mb-6">
        {statusOrder.map(({ key, tone }) => (
          <Card key={key} className={tone}>
            <CardHeader className="pb-2">
              <CardDescription className="uppercase text-xs">
                {t(`subscription.${key}` as const) ?? key}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">
                {summary ? summary.counts[key] ?? 0 : '--'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('admin.billing.revenueTitle')}</CardTitle>
          <CardDescription>{t('admin.billing.revenueSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('admin.billing.revenuePlaceholder')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.billing.expiringTitle')}</CardTitle>
          <CardDescription>{t('admin.billing.expiringSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
          ) : summary && summary.expiringTrials.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.tables.companies.company')}</TableHead>
                  <TableHead>{t('admin.tables.companies.status')}</TableHead>
                  <TableHead>{t('admin.billing.expiringWhen')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.expiringTrials.map((trial) => (
                  <TableRow key={trial.id}>
                    <TableCell>{trial.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {t(`subscription.${trial.subscription_status}` as const) ?? trial.subscription_status}
                      </Badge>
                    </TableCell>
                    <TableCell>{trial.trial_ends_at ? formatDate(trial.trial_ends_at) : '--'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('admin.billing.expiringEmpty')}
            </p>
          )}
        </CardContent>
      </Card>
    </SuperAdminLayout>
  );
}
