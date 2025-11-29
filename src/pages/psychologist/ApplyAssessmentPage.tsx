import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useI18n } from '@/i18n/I18nContext';
import { assessmentsApi, companiesApi, employeesApi, applicationsApi } from '@/db/api';
import type { Company, Employee } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Copy, Send } from 'lucide-react';

export default function ApplyAssessmentPage() {
  const { id } = useParams();
  const { profile } = useProfile();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<any>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [id, profile]);

  useEffect(() => {
    if (selectedCompany) {
      loadEmployees();
    } else {
      setEmployees([]);
      setSelectedEmployee('');
    }
  }, [selectedCompany]);

  const loadData = async () => {
    if (!profile || !id) return;

    try {
      const [assessmentData, companiesData] = await Promise.all([
        assessmentsApi.getById(id),
        companiesApi.getByPsychologist(profile.id),
      ]);

      setAssessment(assessmentData);
      setCompanies(companiesData);
    } catch (error: any) {
      toast.error('Erro ao carregar dados: ' + error.message);
    }
  };

  const loadEmployees = async () => {
    if (!selectedCompany) return;

    try {
      const data = await employeesApi.getByCompany(selectedCompany);
      setEmployees(data);
    } catch (error: any) {
      toast.error('Erro ao carregar funcionários: ' + error.message);
    }
  };

  const handleGenerate = async () => {
    if (!profile || !id) return;

    if (!selectedCompany) {
      toast.error('Selecione uma empresa');
      return;
    }

    if (!selectedEmployee) {
      toast.error('Selecione um funcionário');
      return;
    }

    setLoading(true);
    try {
      const application = await applicationsApi.create({
        assessment_id: id,
        employee_id: selectedEmployee,
        company_id: selectedCompany,
        psychologist_id: profile.id,
      });

      const link = `${window.location.origin}/assessment/${application.unique_token}`;
      setGeneratedLink(link);
      toast.success('Link gerado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao gerar link: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      toast.success(t('assessments.linkCopied'));
    }
  };

  if (!assessment) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">{t('assessments.apply')}</h1>
        <p className="text-muted-foreground mt-2">
          Gere um link único para o funcionário responder a avaliação
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{assessment.name}</CardTitle>
          <CardDescription>
            {assessment.description || 'Sem descrição'}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Selecionar Destinatário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t('assessments.selectCompany')}</Label>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma empresa" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCompany && (
            <div className="space-y-2">
              <Label>{t('assessments.selectEmployee')}</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um funcionário" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.full_name} {employee.position && `- ${employee.position}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={loading || !selectedCompany || !selectedEmployee}
            className="w-full"
          >
            <Send className="mr-2 h-4 w-4" />
            {t('assessments.generateLink')}
          </Button>
        </CardContent>
      </Card>

      {generatedLink && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>{t('assessments.uniqueLink')}</CardTitle>
            <CardDescription>
              Envie este link para o funcionário responder a avaliação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={generatedLink}
                readOnly
                className="font-mono text-sm"
              />
              <Button onClick={handleCopyLink} variant="outline">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              ⏰ Este link expira em 30 dias
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => navigate('/psychologist/assessments')}>
          {t('common.back')}
        </Button>
      </div>
    </div>
  );
}
