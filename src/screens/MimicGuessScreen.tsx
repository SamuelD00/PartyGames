import type { MimicPlayer } from '../types/mimic';
import { useLanguage } from '../i18n/LanguageContext';
import './RevealScreen.css';
import './DiscussionScreen.css';
import './MimicGuessScreen.css';

interface MimicGuessScreenProps {
  players: MimicPlayer[];
  actorId: string;
  actorName: string;
  round: number;
  onSubmit: (guesserId: string | null) => void;
}

export function MimicGuessScreen({ players, actorId, actorName, round, onSubmit }: MimicGuessScreenProps) {
  const { t } = useLanguage();
  const guessers = players.filter((p) => p.id !== actorId);

  return (
    <div className="screen discussion-screen">
      <h1 className="discussion-title">{t('mimic.roundLabel', { n: round })}</h1>
      <p className="discussion-sub">{t('mimicGuess.subtitle', { name: actorName })}</p>

      <ul className="accuse-list mimic-guess-list">
        {guessers.map((p) => (
          <li key={p.id} className="accuse-row mimic-guess-row">
            <button type="button" className="mimic-guess-btn" onClick={() => onSubmit(p.id)}>
              {p.name}
            </button>
          </li>
        ))}
      </ul>

      <button type="button" className="btn-secondary mimic-no-guess-btn" onClick={() => onSubmit(null)}>
        {t('mimicGuess.noOne')}
      </button>
    </div>
  );
}
