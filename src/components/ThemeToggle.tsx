import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { IconMoon, IconSun } from './icons';
import './ThemeToggle.css';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <button
      type="button"
      className="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label={t(theme === 'dark' ? 'theme.switchToLight' : 'theme.switchToDark')}
    >
      <span className="theme-toggle-icons">
        <IconSun size={16} className={`theme-toggle-icon sun${theme === 'dark' ? ' visible' : ''}`} />
        <IconMoon size={16} className={`theme-toggle-icon moon${theme === 'light' ? ' visible' : ''}`} />
      </span>
    </button>
  );
}
