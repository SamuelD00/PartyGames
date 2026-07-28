import { useEffect, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import './RevealScreen.css';
import './ForeheadCountdownScreen.css';
import './ForeheadPortraitLock.css';

const COUNTDOWN_START = 3;

interface ForeheadCountdownScreenProps {
  playerName: string;
  onDone: () => void;
}

export function ForeheadCountdownScreen({ playerName, onDone }: ForeheadCountdownScreenProps) {
  const [count, setCount] = useState(COUNTDOWN_START);
  const { t } = useLanguage();

  useEffect(() => {
    if (count <= 0) {
      onDone();
      return;
    }
    const timeout = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  return (
    <div className="screen reveal-screen forehead-countdown-screen forehead-lock-portrait">
      <p className="forehead-countdown-note">{t('foreheadCountdown.note', { name: playerName })}</p>
      <span key={count} className="forehead-countdown-number">
        {count > 0 ? count : t('foreheadCountdown.go')}
      </span>
    </div>
  );
}
