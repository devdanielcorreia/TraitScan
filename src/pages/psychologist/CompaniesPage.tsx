import { useEffect, useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useI18n } from '@/i18n/I18nContext';
import { companiesApi } from '@/db/api';
import type { Company } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { PsychologistLayout } from '@/components/layout/PsychologistLayout';

export default function CompaniesPage() {
  const { profile } = useProfile();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

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

  const handleCreate = async () => {
    if (!profile) return;
    if (!formData.name.trim()) {
      toast.error('Nome da empresa é obrigatório');
      return;
    }

    try {
      await companiesApi.create({
        ...formData,
        psychologist_id: profile.id,
      });
      toast.success('Empresa criada com sucesso');
      setDialogOpen(false);
      setFormData({ name: '', email: '', phone: '', address: '' });
      loadCompanies();
    } catch (error: any) {
      toast.error('Erro ao criar empresa: ' + error.message);
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('companies.title')}</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie as empresas que você atende
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('companies.create')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('companies.create')}</DialogTitle>
              <DialogDescription>
                Cadastre uma nova empresa para aplicar avaliações
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('companies.companyName')}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome da empresa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('companies.contactEmail')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="contato@empresa.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t('companies.contactPhone')}</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t('common.address')}</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Endereço completo"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleCreate}>
                {t('common.create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {companies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Nenhuma empresa cadastrada ainda
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Primeira Empresa
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Card key={company.id} className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => navigate(`/psychologist/companies/${company.id}/employees`)}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {company.name}
                </CardTitle>
                <CardDescription>
                  {company.email || 'Sem e-mail cadastrado'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  {company.phone && (
                    <p className="text-muted-foreground">📞 {company.phone}</p>
                  )}
                  <p className={`font-medium ${
                    company.subscription_status === 'active' ? 'text-green-600' :
                    company.subscription_status === 'trial' ? 'text-blue-600' :
                    'text-red-600'
                  }`}>
                    Status: {company.subscription_status}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
    </PsychologistLayout>
  );
}
