import { useLayoutEffect, useRef, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { LANGUAGES } from '../i18n/translations';
import './LanguageToggle.css';

export function LanguageToggle() {
  const { lang, setLang, t } = useLanguage();
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const el = btnRefs.current[lang];
    if (el) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [lang]);

  return (
    <div className="language-toggle" role="group" aria-label={t('language.label')}>
      {indicator && (
        <span
          className="language-toggle-indicator"
          style={{ transform: `translateX(${indicator.left}px)`, width: `${indicator.width}px` }}
        />
      )}
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          ref={(el) => {
            btnRefs.current[code] = el;
          }}
          type="button"
          className={`language-toggle-btn${lang === code ? ' active' : ''}`}
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
