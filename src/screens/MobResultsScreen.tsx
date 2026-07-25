import type { MobPlayer, MobRole, MobWinner } from '../types/mob';
import { useLanguage } from '../i18n/LanguageContext';
import { IconSparkle } from '../components/icons';
import './ResultsScreen.css';
import './MobResultsScreen.css';

interface MobResultsScreenProps {
  players: MobPlayer[];
  godName: string;
  winner: MobWinner | null;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

const ROLE_TAG_KEY: Record<MobRole, string> = {
  mob: 'mobResults.mobTag',
  detective: 'mobResults.detectiveTag',
  doctor: 'mobResults.doctorTag',
  civilian: 'mobResults.civilianTag',
};

const CELEBRATION_SPARKLES = [
  { top: '-8%', left: '6%', size: 16, delay: '0s' },
  { top: '6%', left: '94%', size: 12, delay: '0.15s' },
  { top: '82%', left: '2%', size: 14, delay: '0.3s' },
  { top: '92%', left: '90%', size: 18, delay: '0.1s' },
  { top: '-12%', left: '48%', size: 13, delay: '0.25s' },
  { top: '40%', left: '99%', size: 11, delay: '0.4s' },
];

export function MobResultsScreen({ players, godName, winner, onPlayAgain, onNewGame }: MobResultsScreenProps) {
  const { t } = useLanguage();
  const townWon = winner !== 'mob';
  const isMobTeam = (role: MobRole) => role === 'mob';

  return (
    <div className="screen results-screen">
      <div className={`winner-banner card ${townWon ? 'town-won' : 'mob-won'}`}>
        {townWon &&
          CELEBRATION_SPARKLES.map((s, i) => (
            <IconSparkle
              key={i}
              className="celebration-sparkle"
              size={s.size}
              style={{ top: s.top, left: s.left, animationDelay: s.delay }}
            />
          ))}
        <span className="winner-label">{townWon ? t('mobResults.townWins') : t('mobResults.mobWins')}</span>
      </div>

      {godName && <p className="results-hosted-by">{t('mobResults.hostedBy', { name: godName })}</p>}

      <section className="results-section">
        <h2>{t('results.roles')}</h2>
        <ul className="roster-list">
          {players.map((p) => (
            <li key={p.id} className={`roster-row ${isMobTeam(p.role) ? 'was-mobteam' : ''}`}>
              <span>{p.name}</span>
              <span className="roster-tag">{t(ROLE_TAG_KEY[p.role])}</span>
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
