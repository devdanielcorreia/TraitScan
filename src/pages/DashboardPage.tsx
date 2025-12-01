import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useI18n } from '@/i18n/I18nContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { companiesApi, employeesApi, quizzesApi, assessmentsApi, applicationsApi } from '@/db/api';
import { Users, Building2, FileText, ClipboardList, TrendingUp } from 'lucide-react';
import { PsychologistLayout } from '@/components/layout/PsychologistLayout';
import { CompanyLayout } from '@/components/layout/CompanyLayout';

export default function DashboardPage() {
  const { profile, loading } = useProfile();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    psychologists: 0,
    companies: 0,
    employees: 0,
    quizzes: 0,
    assessments: 0,
    applications: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (profile?.role === 'superadmin') {
      navigate('/admin/dashboard', { replace: true });
      return;
    }
    loadStats();
  }, [profile, navigate]);

  const loadStats = async () => {
    if (!profile) return;

    try {
      if (profile.role === 'psychologist') {
        const [companies, quizzes, assessments, applications] = await Promise.all([
          companiesApi.getByPsychologist(profile.id),
          quizzesApi.getByPsychologist(profile.id),
          assessmentsApi.getByPsychologist(profile.id),
          applicationsApi.getByPsychologist(profile.id),
        ]);
        setStats({
          psychologists: 0,
          companies: companies.length,
          employees: 0,
          quizzes: quizzes.length,
          assessments: assessments.length,
          applications: applications.length,
        });
      } else if (profile.role === 'company') {
        const company = await companiesApi.getByProfileId(profile.id);
        if (company) {
          const [employees, applications] = await Promise.all([
            employeesApi.getByCompany(company.id),
            applicationsApi.getByCompany(company.id),
          ]);
          setStats((prev) => ({
            ...prev,
            employees: employees.length,
            applications: applications.length,
          }));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  if (loading || statsLoading) {
    return (
      <div className="p-6 text-center text-muted-foreground">{t('common.loading')}</div>
    );
  }

  const cards = (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {profile?.role === 'psychologist' && (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('nav.companies')}</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.companies}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('nav.quizzes')}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.quizzes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('nav.assessments')}</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.assessments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('applications.title')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.applications}</div>
            </CardContent>
          </Card>
        </>
      )}

      {profile?.role === 'company' && (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('nav.employees')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.employees}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('applications.title')}</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.applications}</div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );

  const overview = (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.overview')}</CardTitle>
        <CardDescription>{t('admin.overviewDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {profile?.role === 'psychologist'
            ? t('admin.tables.psychologists.description')
            : t('admin.tables.companies.description')}
        </p>
      </CardContent>
    </Card>
  );

  const body = (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('dashboard.welcome')}</h1>
        <p className="text-muted-foreground mt-2">{profile?.full_name || profile?.email}</p>
      </div>
      {cards}
      {overview}
    </div>
  );

  if (profile?.role === 'psychologist') {
    return (
      <PsychologistLayout title={t('nav.dashboard')} description={t('dashboard.overview')}>
        {body}
      </PsychologistLayout>
    );
  }

  if (profile?.role === 'company') {
    return (
      <CompanyLayout title={t('nav.dashboard')} description={t('dashboard.overview')}>
        {body}
      </CompanyLayout>
    );
  }

  return body;
}
