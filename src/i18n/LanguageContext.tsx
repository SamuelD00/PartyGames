import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { translate, type Lang } from './translations';

const STORAGE_KEY = 'impostor:lang';

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  tp: (key: string, n: number, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function loadLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'en' ? 'en' : 'es';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => loadLang());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(lang, key, params),
    [lang],
  );

  const tp = useCallback(
    (key: string, n: number, params?: Record<string, string | number>) =>
      translate(lang, `${key}.${n === 1 ? 'one' : 'other'}`, { n, ...params }),
    [lang],
  );

  return <LanguageContext.Provider value={{ lang, setLang, t, tp }}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
