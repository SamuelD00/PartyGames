import { useState } from 'react';
import type { MobNightStep, MobPlayer } from '../types/mob';
import { useLanguage } from '../i18n/LanguageContext';
import './RevealScreen.css';
import './MobRevealScreen.css';
import './MobNightScreen.css';

interface MobNightScreenProps {
  players: MobPlayer[];
  nightStep: MobNightStep | null;
  round: number;
  onSubmitMob: (targetId: string) => void;
  onSubmitDoctor: (targetId: string) => void;
  onDetectiveDone: () => void;
}

export function MobNightScreen({
  players,
  nightStep,
  round,
  onSubmitMob,
  onSubmitDoctor,
  onDetectiveDone,
}: MobNightScreenProps) {
  const { t } = useLanguage();
  const [eyesClosedRound, setEyesClosedRound] = useState<number | null>(null);
  if (!nightStep) return null;

  const needsEyesClosed = eyesClosedRound !== round;

  return (
    <div className="screen reveal-screen">
      <p className="reveal-progress">{t('mobNight.roundLabel', { n: round })}</p>
      {needsEyesClosed ? (
        <EyesClosedCard onContinue={() => setEyesClosedRound(round)} />
      ) : (
        <NightStepCard
          key={nightStep}
          step={nightStep}
          players={players}
          onSubmitMob={onSubmitMob}
          onSubmitDoctor={onSubmitDoctor}
          onDetectiveDone={onDetectiveDone}
        />
      )}
    </div>
  );
}

function EyesClosedCard({ onContinue }: { onContinue: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="reveal-card card night-eyes-card">
      <p className="night-say-label">{t('mobNight.sayOutLoud')}</p>
      <h2 className="night-script-line">“{t('mobNight.eyesClosedScript')}”</h2>
      <p className="reveal-body">{t('mobNight.eyesClosedBody')}</p>
      <button type="button" className="btn-primary next-btn" onClick={onContinue}>
        {t('mobNight.eyesClosedContinue')}
      </button>
    </div>
  );
}

interface NightStepCardProps {
  step: MobNightStep;
  players: MobPlayer[];
  onSubmitMob: (targetId: string) => void;
  onSubmitDoctor: (targetId: string) => void;
  onDetectiveDone: () => void;
}

function NightStepCard({ step, players, onSubmitMob, onSubmitDoctor, onDetectiveDone }: NightStepCardProps) {
  const { t } = useLanguage();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detectiveVerdict, setDetectiveVerdict] = useState<'mob' | 'notMob' | null>(null);

  const detective = players.find((p) => p.role === 'detective' && !p.eliminated) ?? null;
  const isSingleMob = players.filter((p) => p.role === 'mob' && !p.eliminated).length <= 1;

  const targets =
    step === 'mob'
      ? players.filter((p) => !p.eliminated && p.role !== 'mob')
      : step === 'detective'
        ? players.filter((p) => !p.eliminated && p.id !== detective?.id)
        : players.filter((p) => !p.eliminated);

  const handleConfirm = () => {
    if (!selectedId) return;
    if (step === 'mob') {
      onSubmitMob(selectedId);
      return;
    }
    if (step === 'doctor') {
      onSubmitDoctor(selectedId);
      return;
    }
    const target = players.find((p) => p.id === selectedId);
    setDetectiveVerdict(target?.role === 'mob' ? 'mob' : 'notMob');
  };

  if (step === 'detective' && detectiveVerdict) {
    const target = players.find((p) => p.id === selectedId);
    return (
      <div className={`reveal-card card ${detectiveVerdict === 'mob' ? 'mob-card' : 'civilian-card'}`}>
        <span className={`reveal-badge ${detectiveVerdict === 'mob' ? 'mob-badge' : 'civilian-badge'}`}>
          {t(detectiveVerdict === 'mob' ? 'mobNight.verdictMob' : 'mobNight.verdictNotMob')}
        </span>
        <h2>{t('mobNight.detectiveVerdictTitle', { name: target?.name ?? '' })}</h2>
        <p className="reveal-body">{t('mobNight.detectiveGestureBody')}</p>
        <button type="button" className="btn-secondary next-btn" onClick={onDetectiveDone}>
          {t('mobNight.detectiveGestureContinue')}
        </button>
      </div>
    );
  }

  const badgeClass = step === 'mob' ? 'mob-badge' : step === 'detective' ? 'detective-badge' : 'doctor-badge';
  const cardClass = step === 'mob' ? 'mob-card' : step === 'detective' ? 'detective-card' : 'doctor-card';
  const badgeKey =
    step === 'mob' ? 'mobReveal.mobBadge' : step === 'detective' ? 'mobReveal.detectiveBadge' : 'mobReveal.doctorBadge';
  const scriptKey =
    step === 'mob'
      ? isSingleMob
        ? 'mobNight.mobScriptOne'
        : 'mobNight.mobScriptMany'
      : step === 'detective'
        ? 'mobNight.detectiveScript'
        : 'mobNight.doctorScript';
  const helperKey =
    step === 'mob' ? 'mobNight.mobHelper' : step === 'detective' ? 'mobNight.detectiveHelper' : 'mobNight.doctorHelper';
  const confirmKey =
    step === 'mob'
      ? isSingleMob
        ? 'mobNight.mobConfirmOne'
        : 'mobNight.mobConfirmMany'
      : step === 'detective'
        ? 'mobNight.detectiveConfirm'
        : 'mobNight.doctorConfirm';

  return (
    <div className={`reveal-card card night-act-card ${cardClass}`}>
      <span className={`reveal-badge ${badgeClass}`}>{t(badgeKey)}</span>
      <p className="night-say-label">{t('mobNight.sayOutLoud')}</p>
      <h2 className="night-script-line">“{t(scriptKey)}”</h2>
      <p className="reveal-body">{t(helperKey)}</p>
      <ul className="target-list">
        {targets.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              className={`target-row${selectedId === p.id ? ' selected' : ''}`}
              onClick={() => setSelectedId(p.id)}
            >
              {p.name}
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="btn-primary next-btn" onClick={handleConfirm} disabled={!selectedId}>
        {t(confirmKey)}
      </button>
    </div>
  );
}
