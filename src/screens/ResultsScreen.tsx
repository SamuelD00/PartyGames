import type { Player, Winner } from '../types/game';
import { useLanguage } from '../i18n/LanguageContext';
import { IconSparkle } from '../components/icons';
import './ResultsScreen.css';

interface ResultsScreenProps {
  players: Player[];
  winner: Winner | null;
  secretWord: string | null;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

const CELEBRATION_SPARKLES = [
  { top: '-8%', left: '6%', size: 16, delay: '0s' },
  { top: '6%', left: '94%', size: 12, delay: '0.15s' },
  { top: '82%', left: '2%', size: 14, delay: '0.3s' },
  { top: '92%', left: '90%', size: 18, delay: '0.1s' },
  { top: '-12%', left: '48%', size: 13, delay: '0.25s' },
  { top: '40%', left: '99%', size: 11, delay: '0.4s' },
];

export function ResultsScreen({ players, winner, secretWord, onPlayAgain, onNewGame }: ResultsScreenProps) {
  const { t } = useLanguage();
  const crewWon = winner !== 'impostors';

  return (
    <div className="screen results-screen">
      <div className={`winner-banner card ${crewWon ? 'crew-won' : 'impostors-won'}`}>
        {crewWon &&
          CELEBRATION_SPARKLES.map((s, i) => (
            <IconSparkle
              key={i}
              className="celebration-sparkle"
              size={s.size}
              style={{ top: s.top, left: s.left, animationDelay: s.delay }}
            />
          ))}
        <span className="winner-label">{crewWon ? t('results.crewWins') : t('results.impostorsWin')}</span>
        <p className="winner-word">{t('results.wordWas', { word: secretWord ?? '' })}</p>
      </div>

      <section className="results-section">
        <h2>{t('results.roles')}</h2>
        <ul className="roster-list">
          {players.map((p) => (
            <li
              key={p.id}
              className={`roster-row ${p.role === 'impostor' ? 'was-impostor' : p.role === 'misterWhite' ? 'was-white' : ''}`}
            >
              <span>{p.name}</span>
              <span className="roster-tag">
                {p.role === 'impostor'
                  ? t('results.impostorTag')
                  : p.role === 'misterWhite'
                    ? t('results.whiteTag')
                    : t('results.crewTag')}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="results-actions">
        <button type="button" className="btn-primary" onClick={onPlayAgain}>
          {t('results.playAgain')}
        </button>
        <button type="button" className="btn-secondary" onClick={onNewGame}>
          {t('results.newGame')}
        </button>
      </div>
    </div>
  );
}
