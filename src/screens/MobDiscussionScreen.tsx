import { useEffect, useRef, useState } from 'react';
import type { DayElimination, MobPlayer, MobRole } from '../types/mob';
import { useLanguage } from '../i18n/LanguageContext';
import { IconPause, IconPlay } from '../components/icons';
import './DiscussionScreen.css';
import './MobDiscussionScreen.css';

const URGENT_THRESHOLD = 10;

interface MobDiscussionScreenProps {
  players: MobPlayer[];
  round: number;
  timerSeconds: number | null;
  timerRemaining: number | null;
  timerRunning: boolean;
  lastDayElimination: DayElimination | null;
  onTick: () => void;
  onToggleTimer: () => void;
  onPauseTimer: () => void;
  onVote: (playerId: string) => void;
  onSkipVote: () => void;
  onDayResultContinue: () => void;
}

const ROLE_TAG_KEY: Record<MobRole, string> = {
  mob: 'mobResults.mobTag',
  detective: 'mobResults.detectiveTag',
  doctor: 'mobResults.doctorTag',
  civilian: 'mobResults.civilianTag',
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function MobDiscussionScreen({
  players,
  round,
  timerSeconds,
  timerRemaining,
  timerRunning,
  lastDayElimination,
  onTick,
  onToggleTimer,
  onPauseTimer,
  onVote,
  onSkipVote,
  onDayResultContinue,
}: MobDiscussionScreenProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;
  const { t } = useLanguage();

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => onTickRef.current(), 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const activePlayers = players.filter((p) => !p.eliminated);
  const eliminatedPlayers = players.filter((p) => p.eliminated);
  const pendingPlayer = players.find((p) => p.id === pendingId) ?? null;

  const selectForVote = (id: string) => {
    onPauseTimer();
    setPendingId(id);
  };

  const confirmVote = () => {
    if (!pendingId) return;
    onVote(pendingId);
    setPendingId(null);
  };

  const isMobRole = lastDayElimination ? lastDayElimination.role === 'mob' : false;

  return (
    <div className="screen discussion-screen">
      <h1 className="discussion-title">{t('mobDiscussion.title', { n: round })}</h1>
      <p className="discussion-sub">{t('mobDiscussion.subtitle')}</p>

      {timerSeconds !== null && timerRemaining !== null && (
        <div className="timer-block card">
          <span className={`timer-value${timerRemaining > 0 && timerRemaining <= URGENT_THRESHOLD ? ' urgent' : ''}`}>
            {formatTime(timerRemaining)}
          </span>
          <button type="button" className="btn-secondary timer-btn" onClick={onToggleTimer} disabled={timerRemaining <= 0}>
            {timerRemaining <= 0 ? null : timerRunning ? <IconPause size={14} /> : <IconPlay size={14} />}
            {timerRemaining <= 0 ? t('discussion.timeUp') : timerRunning ? t('discussion.pause') : t('discussion.resume')}
          </button>
        </div>
      )}

      <section className="discussion-section">
        <h2>{t('discussion.players')}</h2>
        <ul className="accuse-list">
          {activePlayers.map((p) => (
            <li key={p.id} className="accuse-row">
              <span>{p.name}</span>
              <button type="button" className="btn-danger accuse-btn" onClick={() => selectForVote(p.id)}>
                {t('mobDiscussion.vote')}
              </button>
            </li>
          ))}
        </ul>

        {eliminatedPlayers.length > 0 && (
          <ul className="eliminated-list">
            {eliminatedPlayers.map((p) => (
              <li key={p.id} className="eliminated-row">
                <span>{p.name}</span>
                <span className="eliminated-tag">{t(ROLE_TAG_KEY[p.role])}</span>
              </li>
            ))}
          </ul>
        )}

        <button type="button" className="btn-secondary skip-vote-btn" onClick={onSkipVote}>
          {t('mobDiscussion.skipVote')}
        </button>
      </section>

      {pendingPlayer && (
        <div className="modal-overlay">
          <div className="modal card">
            <h2>{t('mobDiscussion.confirmTitle', { name: pendingPlayer.name })}</h2>
            <p className="modal-body">{t('mobDiscussion.confirmBody')}</p>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setPendingId(null)}>
                {t('discussion.confirmCancel')}
              </button>
              <button type="button" className="btn-danger" onClick={confirmVote}>
                {t('mobDiscussion.confirmAction')}
              </button>
            </div>
          </div>
        </div>
      )}

      {lastDayElimination && (
        <div className="modal-overlay">
          <div className={`modal card result-modal ${isMobRole ? 'was-mobteam' : 'was-town'}`}>
            <span className="reveal-badge">
              {t(isMobRole ? 'mobDiscussion.resultCaught' : 'mobDiscussion.resultWrong')}
            </span>
            <h2>
              {t('mobDiscussion.resultBody', {
                name: lastDayElimination.playerName,
                role: t(ROLE_TAG_KEY[lastDayElimination.role]),
              })}
            </h2>
            <button type="button" className="btn-primary" onClick={onDayResultContinue}>
              {t('discussion.continue')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
