import { useEffect, useState } from 'react';
import type { MobSetupPlayer } from '../types/mob';
import { useLanguage } from '../i18n/LanguageContext';
import { IconHalo } from '../components/icons';
import '../screens/RevealScreen.css';
import './GodRouletteScreen.css';

interface GodRouletteScreenProps {
  players: MobSetupPlayer[];
  resultId: string;
  onDone: () => void;
}

export function GodRouletteScreen({ players, resultId, onDone }: GodRouletteScreenProps) {
  const { t } = useLanguage();
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  const resultIndex = Math.max(0, players.findIndex((p) => p.id === resultId));

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;
    const totalSteps = players.length * 3 + resultIndex;
    let delay = 90;

    const tick = (step: number) => {
      if (cancelled) return;
      setHighlightIndex(step % players.length);
      if (step >= totalSteps) {
        setFinished(true);
        return;
      }
      delay = delay * 1.09 + 6;
      timeoutId = setTimeout(() => tick(step + 1), delay);
    };

    setFinished(false);
    tick(0);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const godName = players[resultIndex]?.name ?? '';

  return (
    <div className="screen reveal-screen">
      <p className="reveal-progress">{t('godRoulette.progress')}</p>
      <div className="reveal-card card god-roulette-card">
        <IconHalo size={40} className="god-roulette-icon" />
        {!finished ? (
          <h2 className="pass-name">{players[highlightIndex]?.name}</h2>
        ) : (
          <>
            <span className="reveal-badge god-badge">{t('godRoulette.badge')}</span>
            <h2>{t('godRoulette.result', { name: godName })}</h2>
          </>
        )}
      </div>
      {finished && (
        <button type="button" className="btn-primary next-btn" onClick={onDone}>
          {t('discussion.continue')}
        </button>
      )}
    </div>
  );
}
