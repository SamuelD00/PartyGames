import type { NightDeath } from '../types/mob';
import { useLanguage } from '../i18n/LanguageContext';
import './RevealScreen.css';
import './MobRevealScreen.css';
import './MobNightScreen.css';

interface MobNightResultScreenProps {
  round: number;
  death: NightDeath | null;
  onContinue: () => void;
}

const ROLE_BADGE_KEY: Record<NightDeath['role'], string> = {
  mob: 'mobReveal.mobBadge',
  detective: 'mobReveal.detectiveBadge',
  doctor: 'mobReveal.doctorBadge',
  civilian: 'mobReveal.civilianBadge',
};

export function MobNightResultScreen({ round, death, onContinue }: MobNightResultScreenProps) {
  const { t } = useLanguage();

  return (
    <div className="screen reveal-screen">
      <p className="reveal-progress">{t('mobNight.roundLabel', { n: round })}</p>

      <div className={`reveal-card card ${death ? 'mob-card' : 'civilian-card'}`}>
        <p className="night-say-label">{t('mobNight.sayOutLoud')}</p>
        <p className="night-script-line">“{t('mobNightResult.openEyesScript')}”</p>
        <span className={`reveal-badge ${death ? 'mob-badge' : 'civilian-badge'}`}>
          {t(death ? 'mobNightResult.deathBadge' : 'mobNightResult.peaceBadge')}
        </span>
        {death ? (
          <>
            <h2>{t('mobNightResult.deathTitle', { name: death.playerName })}</h2>
            <p className="reveal-body">{t('mobNightResult.deathBody', { role: t(ROLE_BADGE_KEY[death.role]) })}</p>
          </>
        ) : (
          <h2>{t('mobNightResult.peaceTitle')}</h2>
        )}
      </div>

      <button type="button" className="btn-primary next-btn" onClick={onContinue}>
        {t('discussion.continue')}
      </button>
    </div>
  );
}
