import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useI18n } from '@/i18n/I18nContext';
import { applicationsApi, assessmentsApi, responsesApi } from '@/db/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import type { QuizWithQuestions } from '@/types/database';

export default function TakeAssessmentPage() {
  const { token } = useParams();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<QuizWithQuestions[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (token) {
      loadAssessment();
    }
  }, [token]);

  const loadAssessment = async () => {
    if (!token) return;

    try {
      const app = await applicationsApi.getByToken(token);
      if (!app) {
        toast.error('Avaliação não encontrada');
        return;
      }

      if (app.status === 'completed') {
        setCompleted(true);
        setLoading(false);
        return;
      }

      if (app.status === 'expired' || (app.expires_at && new Date(app.expires_at) < new Date())) {
        toast.error(t('applications.assessmentExpired'));
        setLoading(false);
        return;
      }

      setApplication(app);

      const assessmentData = await assessmentsApi.getWithQuizzes(app.assessment_id);
      if (assessmentData) {
        const ordered = [...assessmentData.assessment_quizzes].sort(
          (a, b) => a.order_number - b.order_number,
        );
        setQuizzes(
          ordered.map((aq) => ({
            ...aq.quiz,
            questions: Array.isArray(aq.quiz.questions)
              ? aq.quiz.questions.map((q: any) => ({
                  ...q,
                  alternatives: Array.isArray(q.alternatives)
                    ? q.alternatives.sort((a: any, b: any) => a.order_number - b.order_number)
                    : [],
                }))
              : [],
          })),
        );
      } else {
        toast.error(t('applications.assessmentExpired'));
      }

      if (app.status === 'pending') {
        await applicationsApi.updateStatus(app.id, 'in_progress', {
          started_at: new Date().toISOString(),
        });
      }
    } catch (error: any) {
      toast.error('Erro ao carregar avaliação: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId: string, alternativeId: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: alternativeId,
    }));
  };

  const handleSubmit = async () => {
    if (!application) return;

    const currentQuiz = quizzes[currentQuizIndex];
    const unanswered = currentQuiz.questions.filter(q => !responses[q.id]);

    if (unanswered.length > 0) {
      toast.error(`Por favor, responda todas as perguntas (${unanswered.length} restantes)`);
      return;
    }

    setLoading(true);
    try {
      for (const question of currentQuiz.questions) {
        await responsesApi.upsert({
          application_id: application.id,
          question_id: question.id,
          alternative_id: responses[question.id],
        });
      }

      if (currentQuizIndex < quizzes.length - 1) {
        setCurrentQuizIndex(prev => prev + 1);
        setResponses({});
      } else {
        await applicationsApi.updateStatus(application.id, 'completed', {
          completed_at: new Date().toISOString(),
        });
        setCompleted(true);
        toast.success(t('applications.assessmentCompleted'));
      }
    } catch (error: any) {
      toast.error('Erro ao salvar respostas: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="h-16 w-16 text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              {t('applications.assessmentCompleted')}
            </h2>
            <p className="text-muted-foreground text-center">
              {t('applications.thankYou')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!application || quizzes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Avaliação não encontrada ou expirada
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuiz = quizzes[currentQuizIndex];

  return (
    <div className="min-h-screen bg-background p-4 py-8">
      <div className="container mx-auto max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{application.assessments?.name || 'Avaliação'}</CardTitle>
            <CardDescription>
              {currentQuiz.name} - {currentQuizIndex + 1} de {quizzes.length}
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="space-y-6">
          {currentQuiz.questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {index + 1}. {question.question_text}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={responses[question.id] || ''}
                  onValueChange={(value) => handleResponseChange(question.id, value)}
                >
                  {question.alternatives.map((alt) => (
                    <div key={alt.id} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted">
                      <RadioGroupItem value={alt.id} id={alt.id} />
                      <Label htmlFor={alt.id} className="flex-1 cursor-pointer">
                        {alt.alternative_text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={loading} size="lg">
            {currentQuizIndex < quizzes.length - 1 ? t('common.next') : t('common.finish')}
          </Button>
        </div>
      </div>
    </div>
  );
}
