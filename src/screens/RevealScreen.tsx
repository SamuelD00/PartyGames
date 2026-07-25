import { useState } from 'react';
import type { Player } from '../types/game';
import { useLanguage } from '../i18n/LanguageContext';
import './RevealScreen.css';

interface RevealScreenProps {
  players: Player[];
  revealOrder: string[];
  revealIndex: number;
  secretWord: string | null;
  impostorHint: string | null;
  onNext: () => void;
}

export function RevealScreen({
  players,
  revealOrder,
  revealIndex,
  secretWord,
  impostorHint,
  onNext,
}: RevealScreenProps) {
  const [revealed, setRevealed] = useState(false);
  const { t } = useLanguage();
  const player = players.find((p) => p.id === revealOrder[revealIndex]);
  if (!player) return null;

  const isLast = revealIndex === revealOrder.length - 1;

  const handleNext = () => {
    setRevealed(false);
    onNext();
  };

  return (
    <div className="screen reveal-screen">
      <p className="reveal-progress">{t('reveal.progress', { i: revealIndex + 1, n: revealOrder.length })}</p>

      {!revealed && (
        <div className="reveal-card pass-card card">
          <p className="pass-label">{t('reveal.passTo')}</p>
          <h2 className="pass-name">{player.name}</h2>
          <button type="button" className="btn-primary reveal-btn" onClick={() => setRevealed(true)}>
            {t('reveal.tapToReveal')}
          </button>
          <p className="reveal-warning">{t('reveal.warning')}</p>
        </div>
      )}

      {revealed && player.role === 'impostor' && (
        <div className="reveal-card impostor-card card">
          <span className="reveal-badge impostor-badge">{t('reveal.impostorBadge')}</span>
          <h2>{t('reveal.impostorTitle')}</h2>
          <p className="reveal-body">{t('reveal.impostorBody')}</p>
          {impostorHint && (
            <div className="hint-box">
              <span className="hint-label">{t('reveal.hintLabel')}</span>
              <span className="hint-word">{impostorHint}</span>
            </div>
          )}
        </div>
      )}

      {revealed && player.role === 'misterWhite' && (
        <div className="reveal-card white-card card">
          <span className="reveal-badge white-badge">{t('reveal.whiteBadge')}</span>
          <h2>{t('reveal.whiteTitle')}</h2>
          <p className="reveal-body">{t('reveal.whiteBody')}</p>
        </div>
      )}

      {revealed && player.role === 'crew' && (
        <div className="reveal-card crew-card card">
          <span className="reveal-badge crew-badge">{t('reveal.crewBadge')}</span>
          <h2>{t('reveal.yourWord')}</h2>
          <p className="reveal-word">{secretWord}</p>
        </div>
      )}

      {revealed && (
        <button type="button" className="btn-secondary next-btn" onClick={handleNext}>
          {isLast ? t('reveal.nextLast') : t('reveal.next')}
        </button>
      )}
    </div>
  );
}
