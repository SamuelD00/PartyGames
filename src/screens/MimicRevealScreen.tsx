import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import './RevealScreen.css';
import './MimicRevealScreen.css';

interface MimicRevealScreenProps {
  playerName: string;
  word: string;
  round: number;
  onNext: () => void;
  onEndGame: () => void;
}

export function MimicRevealScreen({ playerName, word, round, onNext, onEndGame }: MimicRevealScreenProps) {
  const [revealed, setRevealed] = useState(false);
  const { t } = useLanguage();

  const handleNext = () => {
    setRevealed(false);
    onNext();
  };

  return (
    <div className="screen reveal-screen">
      <p className="reveal-progress">{t('mimic.roundLabel', { n: round })}</p>

      {!revealed && (
        <div className="reveal-card pass-card card">
          <p className="pass-label">{t('reveal.passTo')}</p>
          <h2 className="pass-name">{playerName}</h2>
          <button type="button" className="btn-primary reveal-btn" onClick={() => setRevealed(true)}>
            {t('reveal.tapToReveal')}
          </button>
          <p className="reveal-warning">{t('reveal.warning')}</p>
        </div>
      )}

      {revealed && (
        <div className="reveal-card crew-card card">
          <span className="reveal-badge crew-badge">{t('mimic.badge')}</span>
          <h2>{t('mimic.title')}</h2>
          <p className="reveal-word">{word}</p>
          <div className="hint-box mimic-facedown-box">
            <span className="hint-label">{t('mimic.faceDownLabel')}</span>
            <span className="hint-word">{t('mimic.faceDownNote')}</span>
          </div>
        </div>
      )}

      {revealed && (
        <button type="button" className="btn-primary next-btn" onClick={handleNext}>
          {t('mimic.startActing')}
        </button>
      )}

      <button type="button" className="mimic-end-link" onClick={onEndGame}>
        {t('mimic.endGame')}
      </button>
    </div>
  );
}
