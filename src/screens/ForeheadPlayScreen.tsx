import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useForeheadTilt } from '../hooks/useForeheadTilt';
import type { TiltPermission } from '../utils/tilt';
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

type Direction = 'up' | 'down';

interface CardState {
  word: string;
  key: number;
  direction: Direction | null;
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

  // The word card slides in the direction of whichever tilt triggered it — up for a correct
  // guess, down for a skip — so the tilt gesture gets visible feedback instead of the word just
  // silently swapping. pendingDirectionRef records which gesture is in flight; the effect below
  // picks it up once the parent's word prop actually changes.
  const pendingDirectionRef = useRef<Direction>('up');
  const nextKeyRef = useRef(1);
  const [current, setCurrent] = useState<CardState>({ word, key: 0, direction: null });
  const [previous, setPrevious] = useState<CardState | null>(null);

  useEffect(() => {
    if (word === current.word) return;
    const direction = pendingDirectionRef.current;
    setPrevious({ ...current, direction });
    setCurrent({ word, key: nextKeyRef.current++, direction });
    // current is captured intentionally, not tracked as a dep — this should only re-run when
    // the parent hands us a new word, not when we update our own local mirror of it below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word]);

  const handleCorrect = () => {
    pendingDirectionRef.current = 'up';
    onCorrect();
  };

  const handleSkip = () => {
    pendingDirectionRef.current = 'down';
    onSkip();
  };

  const { active: tiltActive, debugDelta, source: tiltSource } = useForeheadTilt(tiltPermission, handleCorrect, handleSkip);

  return (
    <div className="screen forehead-play-screen">
      <div className="forehead-play-layout">
        <div className="forehead-word-stack">
          {previous && (
            <div
              key={previous.key}
              className={`forehead-word-card card forehead-card-exit-${previous.direction}`}
              onAnimationEnd={() => setPrevious(null)}
            >
              <span className="forehead-word">{previous.word}</span>
            </div>
          )}
          <div
            key={current.key}
            className={`forehead-word-card card${current.direction ? ` forehead-card-enter-${current.direction}` : ''}`}
          >
            <span className="forehead-word">{current.word}</span>
          </div>
        </div>

        <div className="forehead-play-side">
          <div className="forehead-play-header">
            <h1 className="discussion-title">{t('forehead.turnLabel', { n: turn })}</h1>
            <span className="forehead-score-tag">{tp('foreheadPlay.correctCount', correctCount)}</span>
          </div>

          {timerSeconds !== null && timerRemaining !== null && (
            <div className="timer-block card forehead-timer-block">
              <span
                className={`timer-value${timerRemaining > 0 && timerRemaining <= URGENT_THRESHOLD ? ' urgent' : ''}`}
              >
                {formatTime(timerRemaining)}
              </span>
            </div>
          )}

          <div className="forehead-tilt-hint">
            {tiltActive
              ? t('foreheadPlay.tiltHint')
              : tiltPermission === 'denied'
                ? t('foreheadPlay.deniedHint')
                : t('foreheadPlay.waitingHint')}
            {tiltActive && debugDelta !== null && (
              <span className="forehead-tilt-debug">
                {' '}
                ({debugDelta > 0 ? '+' : ''}
                {debugDelta}°{tiltSource === 'motion' ? ' · accel' : ''})
              </span>
            )}
          </div>

          <button type="button" className="mimic-end-link" onClick={onEndTurn}>
            {t('foreheadPlay.endTurn')}
          </button>
        </div>
      </div>
    </div>
  );
}
