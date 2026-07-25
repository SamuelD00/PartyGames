import type { MimicPlayer } from '../types/mimic';
import { useLanguage } from '../i18n/LanguageContext';
import { IconSparkle } from '../components/icons';
import './ResultsScreen.css';
import './MimicResultsScreen.css';

interface MimicResultsScreenProps {
  players: MimicPlayer[];
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

export function MimicResultsScreen({ players, onPlayAgain, onNewGame }: MimicResultsScreenProps) {
  const { t, tp } = useLanguage();
  const maxScore = Math.max(0, ...players.map((p) => p.score));
  const winners = maxScore > 0 ? players.filter((p) => p.score === maxScore) : [];
  const ranked = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="screen results-screen">
      <div className="winner-banner card mimic-won">
        {winners.length > 0 &&
          CELEBRATION_SPARKLES.map((s, i) => (
            <IconSparkle
              key={i}
              className="celebration-sparkle"
              size={s.size}
              style={{ top: s.top, left: s.left, animationDelay: s.delay }}
            />
          ))}
        <span className="winner-label">
          {winners.length === 0
            ? t('mimicResults.noWinner')
            : winners.length === 1
              ? t('mimicResults.winner', { name: winners[0].name })
              : t('mimicResults.tie', { names: winners.map((w) => w.name).join(', ') })}
        </span>
      </div>

      <section className="results-section">
        <h2>{t('mimicResults.scoresTitle')}</h2>
        <ul className="roster-list">
          {ranked.map((p) => (
            <li key={p.id} className={`roster-row${p.score === maxScore && maxScore > 0 ? ' is-leader' : ''}`}>
              <span>{p.name}</span>
              <span className="roster-tag mimic-score-tag">{tp('mimicResults.points', p.score)}</span>
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
