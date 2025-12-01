import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { companiesApi } from '@/db/api';
import { supabase } from '@/db/supabase';
import type { Company } from '@/types/database';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useI18n } from '@/i18n/I18nContext';
import { toast } from 'sonner';
import { CompanyLayout } from '@/components/layout/CompanyLayout';

const statusStyles: Record<string, string> = {
  trial: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  past_due: 'bg-amber-100 text-amber-800',
  cancelled: 'bg-rose-100 text-rose-800',
  inactive: 'bg-zinc-100 text-zinc-800',
};

export default function CompanySubscriptionPage() {
  const { profile } = useProfile();
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const statusData = useMemo(() => {
    if (!company) return null;
    const key = company.subscription_status ?? 'inactive';
    return {
      key,
      tone: statusStyles[key] ?? statusStyles.inactive,
      label: t(`subscription.${key}` as const) ?? key,
    };
  }, [company, t]);

  useEffect(() => {
    const status = searchParams.get('status');
    if (!status) return;
    if (status === 'success') {
      toast.success(t('subscription.messages.success'));
    } else if (status === 'cancel') {
      toast.info(t('subscription.messages.cancel'));
    }
    const next = new URLSearchParams(searchParams);
    next.delete('status');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams, t]);

  const loadCompany = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const data = await companiesApi.getByProfileId(profile.id);
      setCompany(data);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar assinatura');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompany();
  }, [profile]);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        'create-stripe-checkout',
        {
          body: {
            successUrl: `${window.location.origin}/company/subscription?status=success`,
            cancelUrl: `${window.location.origin}/company/subscription?status=cancel`,
          },
        },
      );
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url as string;
      } else {
        throw new Error('URL inválida retornada pelo Stripe');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao iniciar checkout');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const trialEndsAt = company?.trial_ends_at
    ? new Date(company.trial_ends_at).toLocaleDateString()
    : null;

  const disabled =
    checkoutLoading || !company || company.subscription_status === 'active';

  if (!profile || profile.role !== 'company') {
    return null;
  }

  return (
    <CompanyLayout
      title={t('nav.subscription')}
      description={t('companies.subscriptionStatus')}
    >
    <div className="container max-w-4xl py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('subscription.title')}</CardTitle>
          <CardDescription>{t('subscription.currentPlan')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading || !company ? (
            <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {t('subscription.status')}
                </span>
                {statusData && (
                  <Badge className={statusData.tone}>{statusData.label}</Badge>
                )}
              </div>
              {trialEndsAt && (
                <p className="text-sm text-muted-foreground">
                  {t('subscription.trialEndsIn')}: {trialEndsAt}
                </p>
              )}
              <Separator />
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-base font-medium">
                    {company.subscription_status === 'active'
                      ? t('subscription.active')
                      : t('subscription.trial')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {company.subscription_status === 'active'
                      ? t('subscription.activeDescription')
                      : t('subscription.trialDescription')}
                  </p>
                </div>
                <Button onClick={handleCheckout} disabled={disabled}>
                  {company.subscription_status === 'active'
                    ? t('subscription.manageSubscription')
                    : t('subscription.subscribe')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {company?.subscription_status &&
        !['active', 'trial'].includes(company.subscription_status) && (
          <Card>
            <CardHeader>
              <CardTitle>{t('subscription.blockedTitle')}</CardTitle>
              <CardDescription>{t('subscription.blockedDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('subscription.blockedHelp')}
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  </CompanyLayout>
  );
}

