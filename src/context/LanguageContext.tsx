import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { type Lang, LANGS } from '@/lib/i18n';

type Ctx = {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  setLang: (l: Lang) => void;
};

const LanguageContext = createContext<Ctx | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('efkgou-lang') : null;
    return (saved as Lang) || 'en';
  });

  const dir = LANGS.find((l) => l.code === lang)?.dir ?? 'ltr';

  useEffect(() => {
    localStorage.setItem('efkgou-lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  return (
    <LanguageContext.Provider value={{ lang, dir, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}
