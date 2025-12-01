import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, RequireAuth } from 'miaoda-auth-react';
import { supabase } from '@/db/supabase';
import { ThemeProvider } from 'next-themes';
import { I18nProvider } from '@/i18n/I18nContext';
import { Toaster } from 'sonner';
import Header from '@/components/layout/Header';
import routes from './routes';

const App = () => {
  return (
    <Router>
      <ThemeProvider attribute="class" defaultTheme="light">
        <I18nProvider>
          <AuthProvider client={supabase}>
            <Toaster position="top-right" richColors />
            <RequireAuth whiteList={["/", "/login", "/assessment/*", "/invite/*", "/forgot-password", "/reset-password"]}>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow">
                  <Routes>
                    {routes.map((route, index) => (
                      <Route
                        key={index}
                        path={route.path}
                        element={route.element}
                      />
                    ))}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </div>
            </RequireAuth>
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
