import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Language, languageInfo } from '../i18n/translations';
import { Globe, Check } from 'lucide-react';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages: Language[] = ['ar', 'en'];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#111118] border border-[#2a2a3a] hover:border-indigo-500/50 transition-colors"
        aria-label={languageInfo[language].nativeName}
      >
        <Globe className="w-4 h-4 text-[#94a3b8]" />
        <span className="inline-flex h-5 min-w-6 items-center justify-center rounded border border-white/[0.08] bg-white/[0.03] px-1 text-[9px] font-bold tracking-[0.08em] text-[#aab7d0]">{language.toUpperCase()}</span>
        <span className="text-sm text-[#94a3b8] hidden sm:inline">{languageInfo[language].nativeName}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 right-0 z-50 min-w-[180px] bg-[#111118] border border-[#2a2a3a] rounded-lg shadow-xl overflow-hidden">
            {languages.map((lang) => {
              const info = languageInfo[lang];
              const isSelected = language === lang;
              
              return (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#252530] transition-colors ${
                    isSelected ? 'bg-indigo-500/10' : ''
                  }`}
                >
                  <span className="inline-flex h-7 min-w-8 items-center justify-center rounded border border-white/[0.08] bg-white/[0.03] px-1 text-[10px] font-bold tracking-[0.08em] text-[#aab7d0]">{lang.toUpperCase()}</span>
                  <div className="flex-1 text-start">
                    <div className="text-sm font-medium text-white">{info.nativeName}</div>
                    <div className="text-xs text-[#94a3b8]">{info.name}</div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-indigo-400" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
