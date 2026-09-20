import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Translation, translations, languageInfo } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translation) => string;
  dir: 'ltr' | 'rtl';
  languageInfo: typeof languageInfo[Language];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'ulab-language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Try to load from localStorage
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored && ['ar', 'en', 'es', 'fr', 'ko', 'zh'].includes(stored)) {
      return stored;
    }
    
    // Try to detect from browser language
    const browserLang = navigator.language.split('-')[0];
    if (['ar', 'en', 'es', 'fr', 'ko', 'zh'].includes(browserLang)) {
      return browserLang as Language;
    }
    
    // Default to Arabic
    return 'ar';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    
    // Update document direction
    document.documentElement.dir = languageInfo[lang].dir;
    document.documentElement.lang = lang;
  };

  const t = (key: keyof Translation): string => {
    return translations[language][key] || key;
  };

  const dir = languageInfo[language].dir;

  // Update document attributes on mount and language change
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language, dir]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    dir,
    languageInfo: languageInfo[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
