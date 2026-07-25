import { useState } from 'react';
import type { MobPlayer } from '../types/mob';
import { useLanguage } from '../i18n/LanguageContext';
import { IconHalo } from '../components/icons';
import '../screens/RevealScreen.css';
import './MobRevealScreen.css';

interface MobRevealScreenProps {
  players: MobPlayer[];
  revealOrder: string[];
  revealIndex: number;
  godName: string;
  onNext: () => void;
}

const ROLE_CONTENT: Record<MobPlayer['role'], { badge: string; title: string; body: string; badgeClass: string; cardClass: string }> = {
  mob: {
    badge: 'mobReveal.mobBadge',
    title: 'mobReveal.mobTitle',
    body: 'mobReveal.mobBody',
    badgeClass: 'mob-badge',
    cardClass: 'mob-card',
  },
  detective: {
    badge: 'mobReveal.detectiveBadge',
    title: 'mobReveal.detectiveTitle',
    body: 'mobReveal.detectiveBody',
    badgeClass: 'detective-badge',
    cardClass: 'detective-card',
  },
  doctor: {
    badge: 'mobReveal.doctorBadge',
    title: 'mobReveal.doctorTitle',
    body: 'mobReveal.doctorBody',
    badgeClass: 'doctor-badge',
    cardClass: 'doctor-card',
  },
  civilian: {
    badge: 'mobReveal.civilianBadge',
    title: 'mobReveal.civilianTitle',
    body: 'mobReveal.civilianBody',
    badgeClass: 'civilian-badge',
    cardClass: 'civilian-card',
  },
};

export function MobRevealScreen({ players, revealOrder, revealIndex, godName, onNext }: MobRevealScreenProps) {
  const [revealed, setRevealed] = useState(false);
  const [showHandoff, setShowHandoff] = useState(false);
  const { t } = useLanguage();

  if (showHandoff) {
    return (
      <div className="screen reveal-screen">
        <div className="reveal-card pass-card card god-handoff-card">
          <IconHalo size={32} className="god-handoff-icon" />
          <span className="reveal-badge god-badge">{t('mobReveal.handoffBadge')}</span>
          <p className="pass-label">{t('reveal.passTo')}</p>
          <h2 className="pass-name">{godName}</h2>
          <h3 className="handoff-title">{t('mobReveal.handoffTitle')}</h3>
          <p className="reveal-body">{t('mobReveal.handoffNote')}</p>
          <button type="button" className="btn-primary reveal-btn" onClick={onNext}>
            {t('mobReveal.handoffReady')}
          </button>
        </div>
      </div>
    );
  }

  const player = players.find((p) => p.id === revealOrder[revealIndex]);
  if (!player) return null;

  const isLast = revealIndex === revealOrder.length - 1;
  const content = ROLE_CONTENT[player.role];
  const teammates = player.role === 'mob' ? players.filter((p) => p.id !== player.id && p.role === 'mob') : [];

  const handleNext = () => {
    setRevealed(false);
    if (isLast) {
      setShowHandoff(true);
      return;
    }
    onNext();
  };

  return (
    <div className="screen reveal-screen">
      <p className="reveal-progress">{t('reveal.progress', { i: revealIndex + 1, n: revealOrder.length })}</p>

      {!revealed && (
        <div className="reveal-card pass-card card">
          <p className="pass-label">{t('reveal.passTo')}</p>
          <h2 className="pass-name">{player.name}</h2>
          <button type="button" className="btn-primary reveal-btn" onClick={() => setRevealed(true)}>
            {t('reveal.tapToReveal')}
          </button>
          <p className="reveal-warning">{t('reveal.warning')}</p>
        </div>
      )}

      {revealed && (
        <div className={`reveal-card ${content.cardClass} card`}>
          <span className={`reveal-badge ${content.badgeClass}`}>{t(content.badge)}</span>
          <h2>{t(content.title)}</h2>
          <p className="reveal-body">{t(content.body)}</p>
          {teammates.length > 0 && (
            <div className="mob-teammates">
              <span className="mob-teammates-label">{t('mobReveal.teammatesLabel')}</span>
              <span className="mob-teammates-names">{teammates.map((tm) => tm.name).join(', ')}</span>
            </div>
          )}
        </div>
      )}

      {revealed && (
        <button type="button" className="btn-secondary next-btn" onClick={handleNext}>
          {isLast ? t('reveal.nextLast') : t('reveal.next')}
        </button>
      )}
    </div>
  );
}
