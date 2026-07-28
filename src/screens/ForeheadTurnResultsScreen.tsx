import { useLanguage } from '../i18n/LanguageContext';
import { IconCheck, IconSkip } from '../components/icons';
import './RevealScreen.css';
import './ForeheadTurnResultsScreen.css';
import './ForeheadPortraitLock.css';

interface ForeheadTurnResultsScreenProps {
  playerName: string;
  turn: number;
  turnCount: number;
  correctWords: string[];
  skippedWords: string[];
  onContinue: () => void;
  onEndGame: () => void;
}

export function ForeheadTurnResultsScreen({
  playerName,
  turn,
  turnCount,
  correctWords,
  skippedWords,
  onContinue,
  onEndGame,
}: ForeheadTurnResultsScreenProps) {
  const { t, tp } = useLanguage();
  const isLastTurn = turn >= turnCount;

  return (
    <div className="screen reveal-screen forehead-lock-portrait">
      <p className="reveal-progress">{t('forehead.turnLabel', { n: turn })}</p>

      <div className="reveal-card card forehead-ready-card">
        <span className="reveal-badge forehead-roulette-badge">{t('foreheadTurnResults.badge')}</span>
        <h2>{t('foreheadTurnResults.title', { name: playerName })}</h2>
        <p className="reveal-body">{tp('foreheadTurnResults.pointsEarned', correctWords.length)}</p>

        {(correctWords.length > 0 || skippedWords.length > 0) && (
          <ul className="forehead-word-recap">
            {correctWords.map((w, i) => (
              <li key={`c-${i}`} className="forehead-recap-row correct">
                <IconCheck size={16} />
                <span>{w}</span>
              </li>
            ))}
            {skippedWords.map((w, i) => (
              <li key={`s-${i}`} className="forehead-recap-row skipped">
                <IconSkip size={16} />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button type="button" className="btn-primary next-btn" onClick={onContinue}>
        {isLastTurn ? t('foreheadTurnResults.seeResults') : t('foreheadTurnResults.nextTurn')}
      </button>

      {!isLastTurn && (
        <button type="button" className="mimic-end-link" onClick={onEndGame}>
          {t('mimic.endGame')}
        </button>
      )}
    </div>
  );
}
