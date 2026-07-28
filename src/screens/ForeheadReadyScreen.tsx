import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { requestTiltPermission, type TiltPermission } from '../utils/tilt';
import { lockLandscape } from '../utils/orientationLock';
import './RevealScreen.css';
import './ForeheadReadyScreen.css';

interface ForeheadReadyScreenProps {
  playerName: string;
  turn: number;
  onStart: (permission: TiltPermission) => void;
  onEndGame: () => void;
}

export function ForeheadReadyScreen({ playerName, turn, onStart, onEndGame }: ForeheadReadyScreenProps) {
  const [requesting, setRequesting] = useState(false);
  const { t } = useLanguage();

  const handleStart = async () => {
    setRequesting(true);
    void lockLandscape();
    const permission = await requestTiltPermission();
    onStart(permission);
  };

  return (
    <div className="screen reveal-screen">
      <p className="reveal-progress">{t('forehead.turnLabel', { n: turn })}</p>

      <div className="reveal-card card forehead-ready-card">
        <span className="reveal-badge forehead-roulette-badge">{t('foreheadReady.badge')}</span>
        <h2 className="pass-name">{playerName}</h2>
        <p className="reveal-body">{t('foreheadReady.instructions', { name: playerName })}</p>
        <div className="hint-box forehead-tip-box">
          <span className="hint-label">{t('foreheadReady.tipLabel')}</span>
          <span className="hint-word">{t('foreheadReady.tipBody')}</span>
        </div>
      </div>

      <button type="button" className="btn-primary next-btn" onClick={handleStart} disabled={requesting}>
        {t('foreheadReady.start')}
      </button>

      <button type="button" className="mimic-end-link" onClick={onEndGame}>
        {t('mimic.endGame')}
      </button>
    </div>
  );
}
