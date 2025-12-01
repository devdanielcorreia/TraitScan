import { useEffect, useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useI18n } from '@/i18n/I18nContext';
import { assessmentsApi } from '@/db/api';
import type { Assessment } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Archive } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { PsychologistLayout } from '@/components/layout/PsychologistLayout';

export default function AssessmentsPage() {
  const { profile } = useProfile();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssessments();
  }, [profile]);

  const loadAssessments = async () => {
    if (!profile) return;
    try {
      const data = await assessmentsApi.getByPsychologist(profile.id);
      setAssessments(data);
    } catch (error: any) {
      toast.error('Erro ao carregar avaliações: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (assessmentId: string) => {
    try {
      await assessmentsApi.archive(assessmentId);
      toast.success('Avaliação arquivada com sucesso');
      loadAssessments();
    } catch (error: any) {
      toast.error('Erro ao arquivar avaliação: ' + error.message);
    }
  };

  if (loading) {
    return (
      <PsychologistLayout
        title={t('assessments.title')}
        description={t('admin.tables.psychologists.description')}
      >
        <div className="text-center text-muted-foreground">{t('common.loading')}</div>
      </PsychologistLayout>
    );
  }

  return (
    <PsychologistLayout
      title={t('assessments.title')}
      description={t('admin.tables.psychologists.description')}
    >
      <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('assessments.title')}</h1>
          <p className="text-muted-foreground mt-2">
            Crie avaliações combinando múltiplos quizzes
          </p>
        </div>
        <Button onClick={() => navigate('/psychologist/assessments/create')}>
          <Plus className="mr-2 h-4 w-4" />
          {t('assessments.create')}
        </Button>
      </div>

      {assessments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              Nenhuma avaliação criada ainda
            </p>
            <Button onClick={() => navigate('/psychologist/assessments/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Avaliação
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assessments.map((assessment) => (
            <Card key={assessment.id}>
              <CardHeader>
                <CardTitle className="line-clamp-1">{assessment.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {assessment.description || 'Sem descrição'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/psychologist/assessments/${assessment.id}/edit`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/psychologist/assessments/${assessment.id}/apply`)}
                  >
                    {t('assessments.apply')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleArchive(assessment.id)}
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
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
