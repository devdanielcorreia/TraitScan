import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n/I18nContext';
import { applicationsApi, responsesApi } from '@/db/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { PsychologistLayout } from '@/components/layout/PsychologistLayout';

interface QuizScore {
  quiz_id: string;
  quiz_name: string;
  total_score: number;
  max_score: number;
  percentage: number;
}

export default function ReportDetailPage() {
  const { id } = useParams();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [application, setApplication] = useState<any>(null);
  const [scores, setScores] = useState<QuizScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    if (!id) return;

    try {
      const app = await applicationsApi.getById(id);
      if (!app) {
        toast.error('Relatório não encontrado');
        return;
      }

      setApplication(app);

      const responses = await responsesApi.getByApplication(id);
      
      const quizScores: Record<string, QuizScore> = {};

      for (const response of responses) {
        const quizId = response.questions?.quiz_id;
        const quizName = response.questions?.quizzes?.name || 'Quiz';
        const weight = response.alternatives?.weight || 0;

        if (!quizId) continue;

        if (!quizScores[quizId]) {
          quizScores[quizId] = {
            quiz_id: quizId,
            quiz_name: quizName,
            total_score: 0,
            max_score: 0,
            percentage: 0,
          };
        }

        quizScores[quizId].total_score += weight;
        quizScores[quizId].max_score += 4;
      }

      const scoresArray = Object.values(quizScores).map(score => ({
        ...score,
        percentage: (score.total_score / score.max_score) * 100,
      }));

      setScores(scoresArray);
    } catch (error: any) {
      toast.error('Erro ao carregar relatório: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getInterpretation = (percentage: number): string => {
    if (percentage >= 80) return 'Muito Alto - Característica fortemente presente';
    if (percentage >= 60) return 'Alto - Característica presente';
    if (percentage >= 40) return 'Moderado - Característica equilibrada';
    if (percentage >= 20) return 'Baixo - Característica pouco presente';
    return 'Muito Baixo - Característica ausente ou mínima';
  };

  const getColorClass = (percentage: number): string => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    if (percentage >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <PsychologistLayout title={t('reports.title')} description={t('reports.title')}>
        <div className="text-center text-muted-foreground">{t('common.loading')}</div>
      </PsychologistLayout>
    );
  }

  if (!application) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Relatório não encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PsychologistLayout title={t('reports.detailedReport')} description={application.companies?.name || ''}>
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/psychologist/reports')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{t('reports.detailedReport')}</h1>
          <p className="text-muted-foreground mt-1">
            {application.employees?.full_name} - {application.companies?.name}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{application.assessments?.name}</CardTitle>
          <CardDescription>
            Concluído em: {application.completed_at 
              ? new Date(application.completed_at).toLocaleString('pt-BR')
              : '-'}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Resultados por Quiz</h2>
        
        {scores.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Nenhuma resposta registrada
              </p>
            </CardContent>
          </Card>
        ) : (
          scores.map((score) => (
            <Card key={score.quiz_id}>
              <CardHeader>
                <CardTitle className="text-xl">{score.quiz_name}</CardTitle>
                <CardDescription>
                  Pontuação: {score.total_score} de {score.max_score} pontos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Percentual</span>
                    <span className={`font-bold ${getColorClass(score.percentage)}`}>
                      {score.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={score.percentage} className="h-3" />
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Interpretação:</p>
                  <p className={`text-sm ${getColorClass(score.percentage)}`}>
                    {getInterpretation(score.percentage)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Adicionais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Funcionário:</span>
            <span className="font-medium">{application.employees?.full_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cargo:</span>
            <span className="font-medium">{application.employees?.position || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Departamento:</span>
            <span className="font-medium">{application.employees?.department || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Empresa:</span>
            <span className="font-medium">{application.companies?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Data de Início:</span>
            <span className="font-medium">
              {application.started_at 
                ? new Date(application.started_at).toLocaleString('pt-BR')
                : '-'}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => navigate('/psychologist/reports')}>
          {t('common.back')}
        </Button>
      </div>
    </div>
  </PsychologistLayout>
  );
}
