import { useEffect, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { IconPause, IconPlay } from '../components/icons';
import './RevealScreen.css';
import './DiscussionScreen.css';
import './MimicActingScreen.css';

const URGENT_THRESHOLD = 10;

interface MimicActingScreenProps {
  actorName: string;
  round: number;
  timerSeconds: number | null;
  timerRemaining: number | null;
  timerRunning: boolean;
  onTick: () => void;
  onToggleTimer: () => void;
  onDone: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function MimicActingScreen({
  actorName,
  round,
  timerSeconds,
  timerRemaining,
  timerRunning,
  onTick,
  onToggleTimer,
  onDone,
}: MimicActingScreenProps) {
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;
  const { t } = useLanguage();

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => onTickRef.current(), 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  return (
    <div className="screen discussion-screen">
      <h1 className="discussion-title">{t('mimic.roundLabel', { n: round })}</h1>
      <p className="discussion-sub">{t('mimicActing.subtitle', { name: actorName })}</p>

      {timerSeconds !== null && timerRemaining !== null && (
        <div className="timer-block card">
          <span className={`timer-value${timerRemaining > 0 && timerRemaining <= URGENT_THRESHOLD ? ' urgent' : ''}`}>
            {formatTime(timerRemaining)}
          </span>
          <button
            type="button"
            className="btn-secondary timer-btn"
            onClick={onToggleTimer}
            disabled={timerRemaining <= 0}
          >
            {timerRemaining <= 0 ? null : timerRunning ? <IconPause size={14} /> : <IconPlay size={14} />}
            {timerRemaining <= 0 ? t('discussion.timeUp') : timerRunning ? t('discussion.pause') : t('discussion.resume')}
          </button>
        </div>
      )}

      <button type="button" className="btn-primary next-btn mimic-acting-done-btn" onClick={onDone}>
        {t('mimicActing.finish')}
      </button>
    </div>
  );
}
