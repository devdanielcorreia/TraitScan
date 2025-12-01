import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useI18n } from '@/i18n/I18nContext';
import { assessmentsApi, quizzesApi } from '@/db/api';
import type { Quiz } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Save, X } from 'lucide-react';
import { PsychologistLayout } from '@/components/layout/PsychologistLayout';

export default function AssessmentFormPage() {
  const { id } = useParams();
  const { profile } = useProfile();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizzes, setSelectedQuizzes] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [id, profile]);

  const loadData = async () => {
    if (!profile) return;

    try {
      const quizzes = await quizzesApi.getByPsychologist(profile.id);
      setAvailableQuizzes(quizzes);

      if (id) {
        const assessment = await assessmentsApi.getWithQuizzes(id);
        if (assessment) {
          setName(assessment.name);
          setDescription(assessment.description || '');
          setSelectedQuizzes(assessment.assessment_quizzes.map(aq => aq.quiz_id));
        }
      }
    } catch (error: any) {
      toast.error('Erro ao carregar dados: ' + error.message);
    }
  };

  const handleToggleQuiz = (quizId: string) => {
    setSelectedQuizzes(prev => 
      prev.includes(quizId)
        ? prev.filter(id => id !== quizId)
        : [...prev, quizId]
    );
  };

  const handleSave = async () => {
    if (!profile) return;

    if (!name.trim()) {
      toast.error('Nome da avaliação é obrigatório');
      return;
    }

    if (selectedQuizzes.length === 0) {
      toast.error('Selecione pelo menos um quiz');
      return;
    }

    setLoading(true);
    try {
      let assessmentId = id;

      if (id) {
        await assessmentsApi.update(id, { name, description });
        
        const current = await assessmentsApi.getWithQuizzes(id);
        if (current) {
          for (const aq of current.assessment_quizzes) {
            await assessmentsApi.removeQuiz(id, aq.quiz_id);
          }
        }
      } else {
        const newAssessment = await assessmentsApi.create({
          psychologist_id: profile.id,
          name,
          description,
        });
        assessmentId = newAssessment.id;
      }

      for (let i = 0; i < selectedQuizzes.length; i++) {
        await assessmentsApi.addQuiz(assessmentId!, selectedQuizzes[i], i + 1);
      }

      toast.success(id ? 'Avaliação atualizada com sucesso' : 'Avaliação criada com sucesso');
      navigate('/psychologist/assessments');
    } catch (error: any) {
      toast.error('Erro ao salvar avaliação: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PsychologistLayout
      title={id ? t('assessments.edit') : t('assessments.create')}
      description={t('assessments.title')}
    >
      <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {id ? t('assessments.edit') : t('assessments.create')}
        </h1>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {t('common.save')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Avaliação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('assessments.assessmentName')}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Perfil de Colaboração, Avaliação Comportamental"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t('common.description')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o objetivo desta avaliação"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('assessments.selectQuizzes')}</CardTitle>
        </CardHeader>
        <CardContent>
          {availableQuizzes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Você precisa criar quizzes antes de criar uma avaliação
              </p>
              <Button onClick={() => navigate('/psychologist/quizzes/create')}>
                Criar Quiz
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {availableQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted cursor-pointer"
                  onClick={() => handleToggleQuiz(quiz.id)}
                >
                  <Checkbox
                    checked={selectedQuizzes.includes(quiz.id)}
                    onCheckedChange={() => handleToggleQuiz(quiz.id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{quiz.name}</p>
                    {quiz.description && (
                      <p className="text-sm text-muted-foreground">{quiz.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedQuizzes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quizzes Selecionados ({selectedQuizzes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedQuizzes.map((quizId, index) => {
                const quiz = availableQuizzes.find(q => q.id === quizId);
                return quiz ? (
                  <div key={quizId} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span>
                      {index + 1}. {quiz.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleQuiz(quizId)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate('/psychologist/assessments')}>
          {t('common.cancel')}
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {t('common.save')}
        </Button>
      </div>
    </div>
  </PsychologistLayout>
  );
}
