import { useEffect, useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useI18n } from '@/i18n/I18nContext';
import { adminInvitationsApi, companiesApi } from '@/db/api';
import type { Company } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { PsychologistLayout } from '@/components/layout/PsychologistLayout';

export default function CompaniesPage() {
  const { profile } = useProfile();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [generating, setGenerating] = useState(false);
  const baseInviteUrl = import.meta.env.VITE_APP_BASE_URL ?? window.location.origin;

  useEffect(() => {
    loadCompanies();
  }, [profile]);

  const loadCompanies = async () => {
    if (!profile) return;
    try {
      const data = await companiesApi.getByPsychologist(profile.id);
      setCompanies(data);
    } catch (error: any) {
      toast.error('Erro ao carregar empresas: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvite = async () => {
    if (!profile) return;
    if (!inviteName.trim()) {
      toast.error('Informe o nome da empresa');
      return;
    }

    try {
      setGenerating(true);
      const data = await adminInvitationsApi.createInvitation({
        name: inviteName.trim(),
        email: inviteEmail.trim() || undefined,
        role: 'company',
        invitedBy: profile.id,
      });
      if (data?.token) {
        const link = `${baseInviteUrl}/invite/${data.token}`;
        setInviteLink(link);
        toast.success(t('admin.messages.invitationCreated'));
      }
      setInviteName('');
      setInviteEmail('');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao gerar convite');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    toast.success(t('admin.tables.invitations.copySuccess'));
  };

  if (loading) {
    return (
      <PsychologistLayout
        title={t('companies.title')}
        description={t('admin.tables.companies.description')}
      >
        <div className="text-center text-muted-foreground">{t('common.loading')}</div>
      </PsychologistLayout>
    );
  }

  return (
    <PsychologistLayout
      title={t('companies.title')}
      description={t('admin.tables.companies.description')}
    >
      <div className="container mx-auto p-6 space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Gerar convite para empresa</CardTitle>
              <CardDescription>
                Convide empresas para criarem sua conta e acessarem as avaliações.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nome da empresa</Label>
                <Input
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Empresa Exemplo"
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail (opcional)</Label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="contato@empresa.com"
                />
              </div>
              <Button className="w-full" onClick={handleGenerateInvite} disabled={generating}>
                {generating ? 'Gerando...' : 'Gerar convite'}
              </Button>
              {inviteLink && (
                <div className="space-y-2">
                  <Label>Link gerado</Label>
                  <div className="flex gap-2">
                    <Input value={inviteLink} readOnly />
                    <Button type="button" variant="outline" size="icon" onClick={handleCopyLink}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Empresas atendidas</CardTitle>
              <CardDescription>Selecione uma empresa para visualizar colaboradores.</CardDescription>
            </CardHeader>
            <CardContent>
              {companies.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Nenhuma empresa cadastrada ainda. Utilize o convite ao lado para iniciar um cadastro.
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-auto pr-2">
                  {companies.map((company) => (
                    <button
                      key={company.id}
                      type="button"
                      onClick={() => navigate(`/psychologist/companies/${company.id}/employees`)}
                      className="w-full rounded-lg border p-4 text-left hover:border-primary"
                    >
                      <p className="font-semibold">{company.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {company.email || 'Sem e-mail cadastrado'}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {companies.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <Card
                key={company.id}
                className="cursor-pointer hover:border-primary"
                onClick={() => navigate(`/psychologist/companies/${company.id}/employees`)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {company.name}
                  </CardTitle>
                  <CardDescription>{company.email || 'Sem e-mail cadastrado'}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PsychologistLayout>
  );
}
