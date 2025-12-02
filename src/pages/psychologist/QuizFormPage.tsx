import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useI18n } from '@/i18n/I18nContext';
import { quizzesApi, questionsApi, alternativesApi } from '@/db/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Trash2, Save } from 'lucide-react';
import { PsychologistLayout } from '@/components/layout/PsychologistLayout';

interface Alternative {
  id?: string;
  alternative_text: string;
  weight: number;
  order_number: number;
}

interface Question {
  id?: string;
  question_text: string;
  order_number: number;
  alternatives: Alternative[];
}

export default function QuizFormPage() {
  const { id } = useParams();
  const { profile } = useProfile();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (id) {
      loadQuiz();
    } else {
      initializeEmptyQuiz();
    }
  }, [id]);

  const initializeEmptyQuiz = () => {
    const emptyQuestions: Question[] = Array.from({ length: 10 }, (_, i) => ({
      question_text: '',
      order_number: i + 1,
      alternatives: Array.from({ length: 4 }, (_, j) => ({
        alternative_text: '',
        weight: j + 1,
        order_number: j + 1,
      })),
    }));
    setQuestions(emptyQuestions);
  };

  const loadQuiz = async () => {
    if (!id) return;
    try {
      const quiz = await quizzesApi.getWithQuestions(id);
      if (quiz) {
        setName(quiz.name);
        setDescription(quiz.description || '');
        setQuestions(quiz.questions);
      }
    } catch (error: any) {
      toast.error('Erro ao carregar quiz: ' + error.message);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    if (!name.trim()) {
      toast.error('Nome do quiz é obrigatório');
      return;
    }

    if (questions.length !== 10) {
      toast.error(t('quizzes.mustHave10Questions'));
      return;
    }

    for (const question of questions) {
      if (!question.question_text.trim()) {
        toast.error(`Pergunta ${question.order_number} está vazia`);
        return;
      }
      if (question.alternatives.length !== 4) {
        toast.error(t('quizzes.mustHave4Alternatives'));
        return;
      }
      for (const alt of question.alternatives) {
        if (!alt.alternative_text.trim()) {
          toast.error(`Alternativa vazia na pergunta ${question.order_number}`);
          return;
        }
        if (alt.weight < 1 || alt.weight > 4) {
          toast.error(`Peso inválido na pergunta ${question.order_number}. Use valores entre 1 e 4.`);
          return;
        }
      }
    }

    setLoading(true);
    try {
      let quizId = id;

      if (id) {
        await quizzesApi.update(id, { name, description });
      } else {
        const newQuiz = await quizzesApi.create({
          psychologist_id: profile.id,
          name,
          description,
        });
        quizId = newQuiz.id;
      }

      for (const question of questions) {
        let questionId = question.id;

        if (question.id) {
          await questionsApi.update(question.id, {
            question_text: question.question_text,
          });
        } else {
          const newQuestion = await questionsApi.create({
            quiz_id: quizId,
            question_text: question.question_text,
            order_number: question.order_number,
          });
          questionId = newQuestion.id;
        }

        for (const alt of question.alternatives) {
          if (alt.id) {
            await alternativesApi.update(alt.id, {
              alternative_text: alt.alternative_text,
              weight: alt.weight,
            });
          } else {
            await alternativesApi.create({
              question_id: questionId,
              alternative_text: alt.alternative_text,
              weight: alt.weight,
              order_number: alt.order_number,
            });
          }
        }
      }

      toast.success(id ? 'Quiz atualizado com sucesso' : 'Quiz criado com sucesso');
      navigate('/psychologist/quizzes');
    } catch (error: any) {
      toast.error('Erro ao salvar quiz: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateQuestion = (index: number, text: string) => {
    const updated = [...questions];
    updated[index].question_text = text;
    setQuestions(updated);
  };

  const updateAlternative = (qIndex: number, aIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].alternatives[aIndex].alternative_text = text;
    setQuestions(updated);
  };

  const updateAlternativeWeight = (qIndex: number, aIndex: number, value: string) => {
    const parsed = Number(value);
    const sanitized = Number.isFinite(parsed) ? Math.min(4, Math.max(1, parsed)) : 1;
    const updated = [...questions];
    updated[qIndex].alternatives[aIndex].weight = sanitized;
    setQuestions(updated);
  };

  return (
    <PsychologistLayout
      title={id ? t('quizzes.edit') : t('quizzes.create')}
      description={t('quizzes.title')}
    >
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {id ? t('quizzes.edit') : t('quizzes.create')}
        </h1>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {t('common.save')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('quizzes.quizName')}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Assertividade, Relacionamento Interpessoal"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t('common.description')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o objetivo deste quiz"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {questions.map((question, qIndex) => (
          <Card key={qIndex}>
            <CardHeader>
              <CardTitle className="text-lg">
                Pergunta {question.order_number}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('quizzes.questionText')}</Label>
                <Textarea
                  value={question.question_text}
                  onChange={(e) => updateQuestion(qIndex, e.target.value)}
                  placeholder="Digite a pergunta"
                  rows={2}
                />
              </div>

              <div className="space-y-3">
                <Label>{t('quizzes.alternatives')}</Label>
                {question.alternatives.map((alt, aIndex) => (
                  <div key={aIndex} className="flex flex-col gap-2 md:flex-row md:items-center">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Peso</Label>
                      <Input
                        type="number"
                        min={1}
                        max={4}
                        value={alt.weight}
                        onChange={(e) => updateAlternativeWeight(qIndex, aIndex, e.target.value)}
                        className="w-24"
                      />
                    </div>
                    <Input
                      value={alt.alternative_text}
                      onChange={(e) => updateAlternative(qIndex, aIndex, e.target.value)}
                      placeholder={`Alternativa ${aIndex + 1}`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate('/psychologist/quizzes')}>
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
