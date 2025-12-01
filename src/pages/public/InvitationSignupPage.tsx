import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/db/supabase';
import { invitationsApi } from '@/db/api';
import type { Invitation } from '@/types/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/i18n/I18nContext';
import { toast } from 'sonner';

export default function InvitationSignupPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInvitation = async () => {
      if (!token) {
        setError('not_found');
        setLoading(false);
        return;
      }

      try {
        const data = await invitationsApi.getByToken(token);
        if (!data) {
          setError('not_found');
        } else if (data.status !== 'pending') {
          setError('used');
        } else if (data.expires_at && new Date(data.expires_at) < new Date()) {
          setError('expired');
        } else {
          setInvitation(data);
          setEmail(data.email ?? '');
        }
      } catch (err: any) {
        setError(err.message || 'error');
      } finally {
        setLoading(false);
      }
    };

    loadInvitation();
  }, [token]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!invitation || !token) return;
    if (!email) {
      toast.error(t('invitations.emailRequired') || 'Informe um e-mail válido');
      return;
    }
    if (password.length < 6 || password !== confirmPassword) {
      toast.error(t('invitations.passwordMismatch') || 'Senhas não conferem');
      return;
    }

    try {
      setSubmitting(true);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError || !data.user) throw signUpError;

      const { error: funcError } = await supabase.functions.invoke('accept-invite', {
        body: { token, userId: data.user.id },
      });
      if (funcError) throw funcError;

      toast.success(t('invitations.acceptInvitation'));
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Erro ao concluir cadastro');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatus = () => {
    if (loading) {
      return <p className="text-sm text-muted-foreground">{t('common.loading')}</p>;
    }

    if (error) {
      const messageKey = `invitations.errors.${error}` as const;
      return (
        <Card>
          <CardHeader>
            <CardTitle>{t('invitations.title')}</CardTitle>
            <CardDescription>{t('invitations.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t(messageKey)}</p>
          </CardContent>
        </Card>
      );
    }

    if (!invitation) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('invitations.title')}</CardTitle>
          <CardDescription>{t('invitations.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>{t('invitations.invitedName')}</Label>
              <Input value={invitation.invitee_name} readOnly disabled />
            </div>
            <div>
              <Label>{t('common.email')}</Label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div>
              <Label>{t('invitations.password')}</Label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
              />
            </div>
            <div>
              <Label>{t('invitations.confirmPassword')}</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {t('invitations.acceptInvitation')}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">{renderStatus()}</div>
    </div>
  );
}
