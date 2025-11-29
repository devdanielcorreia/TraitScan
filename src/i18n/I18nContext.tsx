import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { translations, type Language } from './translations';
import { profilesApi } from '@/db/api';
import { supabase } from '@/db/supabase';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('pt');

  useEffect(() => {
    const loadLanguage = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const profile = await profilesApi.getCurrentProfile();
        if (profile?.language) {
          setLanguageState(profile.language as Language);
        }
      } else {
        const savedLang = localStorage.getItem('language') as Language;
        if (savedLang && ['pt', 'en', 'es'].includes(savedLang)) {
          setLanguageState(savedLang);
        }
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await profilesApi.updateProfile(user.id, { language: lang });
    }
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
};
