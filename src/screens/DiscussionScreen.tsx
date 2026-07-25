import { useEffect, useRef, useState } from 'react';
import type { AccusationResult, PendingWhiteGuess, Player } from '../types/game';
import { useLanguage } from '../i18n/LanguageContext';
import { IconPause, IconPlay } from '../components/icons';
import './DiscussionScreen.css';

const URGENT_THRESHOLD = 10;

interface DiscussionScreenProps {
  players: Player[];
  startingPlayerId: string | null;
  timerSeconds: number | null;
  timerRemaining: number | null;
  timerRunning: boolean;
  pendingWhiteGuess: PendingWhiteGuess | null;
  lastAccusation: AccusationResult | null;
  onTick: () => void;
  onToggleTimer: () => void;
  onPauseTimer: () => void;
  onAccuse: (playerId: string) => void;
  onSubmitWhiteGuess: (guess: string) => void;
  onClearAccusation: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function eliminatedTagKey(role: Player['role']): string {
  if (role === 'impostor') return 'discussion.eliminatedImpostor';
  if (role === 'misterWhite') return 'discussion.eliminatedMisterWhite';
  return 'discussion.eliminated';
}

export function DiscussionScreen({
  players,
  startingPlayerId,
  timerSeconds,
  timerRemaining,
  timerRunning,
  pendingWhiteGuess,
  lastAccusation,
  onTick,
  onToggleTimer,
  onPauseTimer,
  onAccuse,
  onSubmitWhiteGuess,
  onClearAccusation,
}: DiscussionScreenProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [whiteGuessInput, setWhiteGuessInput] = useState('');
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
  const startingPlayer = players.find((p) => p.id === startingPlayerId) ?? null;

  const selectForAccusation = (id: string) => {
    onPauseTimer();
    setPendingId(id);
  };

  const confirmAccusation = () => {
    if (!pendingId) return;
    onAccuse(pendingId);
    setPendingId(null);
  };

  const submitWhiteGuess = () => {
    if (!whiteGuessInput.trim()) return;
    onSubmitWhiteGuess(whiteGuessInput);
    setWhiteGuessInput('');
  };

  let resultLabelKey = '';
  let resultBodyKey = '';
  let resultBodyParams: Record<string, string> = {};
  let resultClass = '';
  if (lastAccusation) {
    resultBodyParams = { name: lastAccusation.playerName };
    if (lastAccusation.role === 'impostor') {
      resultLabelKey = 'discussion.resultCaught';
      resultBodyKey = 'discussion.resultWasImpostor';
      resultClass = 'was-impostor';
    } else if (lastAccusation.role === 'misterWhite') {
      if (lastAccusation.whiteGuessCorrect) {
        resultLabelKey = 'discussion.resultWhiteSurvived';
        resultBodyKey = 'discussion.resultWhiteSurvivedBody';
        resultClass = 'was-white';
      } else {
        resultLabelKey = 'discussion.resultWhiteCaught';
        resultBodyKey = 'discussion.resultWasMisterWhite';
        resultClass = 'was-impostor';
      }
    } else {
      resultLabelKey = 'discussion.resultWrong';
      resultBodyKey = 'discussion.resultWasNotImpostor';
      resultClass = 'was-crew';
    }
  }

  return (
    <div className="screen discussion-screen">
      <h1 className="discussion-title">{t('discussion.title')}</h1>
      <p className="discussion-sub">{t('discussion.subtitle')}</p>

      {startingPlayer && (
        <div className="starting-player-banner card">
          <span className="starting-player-label">{t('discussion.startingPlayerLabel')}</span>
          <span className="starting-player-name">{startingPlayer.name}</span>
        </div>
      )}

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
              <button type="button" className="btn-danger accuse-btn" onClick={() => selectForAccusation(p.id)}>
                {t('discussion.accuse')}
              </button>
            </li>
          ))}
        </ul>

        {eliminatedPlayers.length > 0 && (
          <ul className="eliminated-list">
            {eliminatedPlayers.map((p) => (
              <li key={p.id} className="eliminated-row">
                <span>{p.name}</span>
                <span className="eliminated-tag">{t(eliminatedTagKey(p.role))}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {pendingPlayer && (
        <div className="modal-overlay">
          <div className="modal card">
            <h2>{t('discussion.confirmTitle', { name: pendingPlayer.name })}</h2>
            <p className="modal-body">{t('discussion.confirmBody')}</p>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setPendingId(null)}>
                {t('discussion.confirmCancel')}
              </button>
              <button type="button" className="btn-danger" onClick={confirmAccusation}>
                {t('discussion.confirmAction')}
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingWhiteGuess && (
        <div className="modal-overlay">
          <div className="modal card white-guess-modal">
            <span className="reveal-badge white-badge">{t('reveal.whiteBadge')}</span>
            <h2>{t('discussion.whiteGuessTitle')}</h2>
            <p className="modal-body">{t('discussion.whiteGuessBody', { name: pendingWhiteGuess.playerName })}</p>
            <input
              type="text"
              value={whiteGuessInput}
              onChange={(e) => setWhiteGuessInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitWhiteGuess();
              }}
              placeholder={t('discussion.whiteGuessPlaceholder')}
              maxLength={60}
              autoFocus
            />
            <button
              type="button"
              className="btn-primary"
              onClick={submitWhiteGuess}
              disabled={!whiteGuessInput.trim()}
            >
              {t('discussion.whiteGuessSubmit')}
            </button>
          </div>
        </div>
      )}

      {lastAccusation && (
        <div className="modal-overlay">
          <div className={`modal card result-modal ${resultClass}`}>
            <span className="reveal-badge">{t(resultLabelKey)}</span>
            <h2>{t(resultBodyKey, resultBodyParams)}</h2>
            <button type="button" className="btn-primary" onClick={onClearAccusation}>
              {t('discussion.continue')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
