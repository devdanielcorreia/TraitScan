import { useEffect, useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useI18n } from '@/i18n/I18nContext';
import { applicationsApi } from '@/db/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Eye, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PsychologistLayout } from '@/components/layout/PsychologistLayout';

export default function ReportsPage() {
  const { profile } = useProfile();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, [profile]);

  const loadApplications = async () => {
    if (!profile) return;

    try {
      const data = await applicationsApi.getByPsychologist(profile.id);
      setApplications(data);
    } catch (error: any) {
      toast.error('Erro ao carregar relatórios: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      in_progress: 'default',
      completed: 'default',
      expired: 'destructive',
    };

    const labels: Record<string, string> = {
      pending: 'Pendente',
      in_progress: 'Em Andamento',
      completed: 'Concluído',
      expired: 'Expirado',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <PsychologistLayout title={t('reports.title')} description={t('reports.title')}>
        <div className="text-center text-muted-foreground">{t('common.loading')}</div>
      </PsychologistLayout>
    );
  }

  return (
    <PsychologistLayout title={t('reports.title')} description={t('reports.title')}>
      <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('reports.title')}</h1>
        <p className="text-muted-foreground mt-2">
          Visualize os resultados das avaliações aplicadas
        </p>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Nenhuma avaliação aplicada ainda
            </p>
            <Button onClick={() => navigate('/psychologist/assessments')}>
              Aplicar Avaliação
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Funcionário</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Avaliação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">
                    {app.employees?.full_name || '-'}
                  </TableCell>
                  <TableCell>{app.companies?.name || '-'}</TableCell>
                  <TableCell>{app.assessments?.name || '-'}</TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell>
                    {new Date(app.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    {app.status === 'completed' ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/psychologist/reports/${app.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Relatório
                      </Button>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Aguardando resposta
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
      </div>
    </PsychologistLayout>
  );
}
