import { useEffect, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useForeheadTilt } from '../hooks/useForeheadTilt';
import type { TiltPermission } from '../utils/tilt';
import { IconCheck, IconSkip } from '../components/icons';
import './RevealScreen.css';
import './DiscussionScreen.css';
import './ForeheadPlayScreen.css';

const URGENT_THRESHOLD = 10;

interface ForeheadPlayScreenProps {
  word: string;
  turn: number;
  timerSeconds: number | null;
  timerRemaining: number | null;
  correctCount: number;
  tiltPermission: TiltPermission;
  onTick: () => void;
  onCorrect: () => void;
  onSkip: () => void;
  onEndTurn: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function ForeheadPlayScreen({
  word,
  turn,
  timerSeconds,
  timerRemaining,
  correctCount,
  tiltPermission,
  onTick,
  onCorrect,
  onSkip,
  onEndTurn,
}: ForeheadPlayScreenProps) {
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;
  const { t, tp } = useLanguage();

  useEffect(() => {
    if (timerSeconds === null) return;
    const interval = setInterval(() => onTickRef.current(), 1000);
    return () => clearInterval(interval);
  }, [timerSeconds]);

  const { active: tiltActive, debugDelta, source: tiltSource } = useForeheadTilt(tiltPermission, onCorrect, onSkip);

  return (
    <div className="screen discussion-screen forehead-play-screen">
      <div className="forehead-play-header">
        <h1 className="discussion-title">{t('forehead.turnLabel', { n: turn })}</h1>
        <span className="forehead-score-tag">{tp('foreheadPlay.correctCount', correctCount)}</span>
      </div>

      {timerSeconds !== null && timerRemaining !== null && (
        <div className="timer-block card forehead-timer-block">
          <span className={`timer-value${timerRemaining > 0 && timerRemaining <= URGENT_THRESHOLD ? ' urgent' : ''}`}>
            {formatTime(timerRemaining)}
          </span>
        </div>
      )}

      <div className="forehead-word-card card">
        <span className="forehead-word">{word}</span>
      </div>

      <div className="forehead-tilt-hint">
        {tiltActive
          ? t('foreheadPlay.tiltHint')
          : tiltPermission === 'denied'
            ? t('foreheadPlay.deniedHint')
            : t('foreheadPlay.buttonHint')}
        {tiltActive && debugDelta !== null && (
          <span className="forehead-tilt-debug">
            {' '}
            ({debugDelta > 0 ? '+' : ''}
            {debugDelta}°{tiltSource === 'motion' ? ' · accel' : ''})
          </span>
        )}
      </div>

      <div className="forehead-action-row">
        <button type="button" className="forehead-action-btn skip" onClick={onSkip}>
          <IconSkip size={28} />
          {t('foreheadPlay.skip')}
        </button>
        <button type="button" className="forehead-action-btn correct" onClick={onCorrect}>
          <IconCheck size={28} />
          {t('foreheadPlay.correct')}
        </button>
      </div>

      <button type="button" className="mimic-end-link" onClick={onEndTurn}>
        {t('foreheadPlay.endTurn')}
      </button>
    </div>
  );
}
