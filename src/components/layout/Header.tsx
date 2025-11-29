import { useNavigate } from 'react-router-dom';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/I18nContext';
import { useTheme } from 'next-themes';
import { Moon, Sun, LogOut, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useAuth } from 'miaoda-auth-react';
import { useProfile } from '@/hooks/useProfile';

export default function Header() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useI18n();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { profile } = useProfile();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success(t('auth.logoutSuccess'));
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold text-primary">TraitScan</h1>
          {user && profile && (
            <nav className="hidden md:flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
              >
                {t('nav.dashboard')}
              </Button>
              {profile.role === 'superadmin' && (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/admin/psychologists')}
                  >
                    {t('nav.psychologists')}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/admin/companies')}
                  >
                    {t('nav.companies')}
                  </Button>
                </>
              )}
              {profile.role === 'psychologist' && (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/psychologist/quizzes')}
                  >
                    {t('nav.quizzes')}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/psychologist/assessments')}
                  >
                    {t('nav.assessments')}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/psychologist/companies')}
                  >
                    {t('nav.companies')}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/psychologist/reports')}
                  >
                    {t('nav.reports')}
                  </Button>
                </>
              )}
              {profile.role === 'company' && (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/company/employees')}
                  >
                    {t('nav.employees')}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/company/reports')}
                  >
                    {t('nav.reports')}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/company/subscription')}
                  >
                    {t('nav.subscription')}
                  </Button>
                </>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('pt')}>
                🇧🇷 Português {language === 'pt' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('en')}>
                🇺🇸 English {language === 'en' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('es')}>
                🇪🇸 Español {language === 'es' && '✓'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {user && (
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
