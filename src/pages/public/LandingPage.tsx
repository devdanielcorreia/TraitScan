import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n/I18nContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Users, Building2, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function LandingPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(t('landing.contact.success'));
      setEmail('');
    } catch (error) {
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {t('landing.hero.title')}
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          {t('landing.hero.subtitle')}
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => navigate('/login')}>
            {t('landing.hero.cta')}
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
            {t('auth.login')}
          </Button>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          {t('landing.features.title')}
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-4" />
              <CardTitle>{t('landing.features.psychologists.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t('landing.features.psychologists.description')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Building2 className="h-12 w-12 text-primary mb-4" />
              <CardTitle>{t('landing.features.companies.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t('landing.features.companies.description')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-12 w-12 text-primary mb-4" />
              <CardTitle>{t('landing.features.reports.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t('landing.features.reports.description')}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-muted py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t('landing.pricing.title')}
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{t('landing.pricing.trial.title')}</CardTitle>
                <CardDescription className="text-3xl font-bold text-primary">
                  {t('landing.pricing.trial.duration')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {t('landing.pricing.trial.features').split(',').map((feature: string, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span>{feature.trim()}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary border-2">
              <CardHeader>
                <CardTitle className="text-2xl">{t('landing.pricing.pro.title')}</CardTitle>
                <CardDescription className="text-3xl font-bold text-primary">
                  {t('landing.pricing.pro.price')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {t('landing.pricing.pro.features').split(',').map((feature: string, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span>{feature.trim()}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            {t('landing.contact.title')}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t('landing.contact.subtitle')}
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('landing.contact.emailPlaceholder')}
              required
              disabled={submitting}
            />
            <Button type="submit" disabled={submitting}>
              {t('landing.contact.submit')}
            </Button>
          </form>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>2025 TraitScan</p>
        </div>
      </footer>
    </div>
  );
}
