import { useEffect, useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useI18n } from '@/i18n/I18nContext';
import { quizzesApi } from '@/db/api';
import type { Quiz } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Copy, Archive } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { PsychologistLayout } from '@/components/layout/PsychologistLayout';

export default function QuizzesPage() {
  const { profile } = useProfile();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuizzes();
  }, [profile]);

  const loadQuizzes = async () => {
    if (!profile) return;
    try {
      const data = await quizzesApi.getByPsychologist(profile.id);
      setQuizzes(data);
    } catch (error: any) {
      toast.error('Erro ao carregar quizzes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (quizId: string) => {
    if (!profile) return;
    try {
      await quizzesApi.duplicate(quizId, profile.id);
      toast.success('Quiz duplicado com sucesso');
      loadQuizzes();
    } catch (error: any) {
      toast.error('Erro ao duplicar quiz: ' + error.message);
    }
  };

  const handleArchive = async (quizId: string) => {
    try {
      await quizzesApi.archive(quizId);
      toast.success('Quiz arquivado com sucesso');
      loadQuizzes();
    } catch (error: any) {
      toast.error('Erro ao arquivar quiz: ' + error.message);
    }
  };

  const content = loading ? (
    <div className="text-center text-muted-foreground">{t('common.loading')}</div>
  ) : quizzes.length === 0 ? (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">Nenhum quiz criado ainda</p>
        <Button onClick={() => navigate('/psychologist/quizzes/create')}>
          <Plus className="mr-2 h-4 w-4" />
          {t('quizzes.create')}
        </Button>
      </CardContent>
    </Card>
  ) : (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {quizzes.map((quiz) => (
        <Card key={quiz.id}>
          <CardHeader>
            <CardTitle className="line-clamp-1">{quiz.name}</CardTitle>
            <CardDescription className="line-clamp-2">
              {quiz.description || t('common.noData')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/psychologist/quizzes/${quiz.id}/edit`)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDuplicate(quiz.id)}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleArchive(quiz.id)}>
                <Archive className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <PsychologistLayout
      title={t('quizzes.title')}
      description="Gerencie seus quizzes de avaliação psicológica"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t('quizzes.title')}</h1>
          <p className="text-sm text-muted-foreground">
            Organize seus instrumentos e mantenha-os atualizados.
          </p>
        </div>
        <Button onClick={() => navigate('/psychologist/quizzes/create')}>
          <Plus className="mr-2 h-4 w-4" />
          {t('quizzes.create')}
        </Button>
      </div>
      {content}
    </PsychologistLayout>
  );
}
