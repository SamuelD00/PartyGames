import { useLanguage } from '../i18n/LanguageContext';
import { LANGUAGES } from '../i18n/translations';
import './LanguageToggle.css';

export function LanguageToggle() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div className="language-toggle" role="group" aria-label={t('language.label')}>
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
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
