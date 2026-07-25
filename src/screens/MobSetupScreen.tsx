import { useMemo, useState } from 'react';
import type { MobGameSetup, MobSetupPlayer } from '../types/mob';
import type { GameDescriptor } from '../data/games';
import { GameSelector } from '../components/GameSelector';
import { IconClose, IconHalo, IconMinus, IconMob, IconPlus } from '../components/icons';
import { useLanguage } from '../i18n/LanguageContext';
import { createId } from '../utils/id';
import './SetupScreen.css';

const TIMER_PRESETS_MIN = [0, 1, 2, 3, 5, 10];
const MIN_PLAYERS = 3;
const MIN_TOTAL_PLAYERS = MIN_PLAYERS + 1;

interface MobSetupScreenProps {
  setup: MobGameSetup;
  onChange: (setup: MobGameSetup) => void;
  onStart: () => void;
  error: string | null;
  games: GameDescriptor[];
  activeGameId: string;
  onSwitchGame: (id: string) => void;
}

function maxMobCount(n: number, detectiveEnabled: boolean, doctorEnabled: boolean): number {
  const playing = Math.max(0, n - 1); // one player is always reserved as God
  const reserved = (detectiveEnabled ? 1 : 0) + (doctorEnabled ? 1 : 0);
  const combinedMax = Math.max(1, Math.ceil(playing / 2) - 1);
  return Math.max(1, Math.min(combinedMax, playing - reserved));
}

export function MobSetupScreen({
  setup,
  onChange,
  onStart,
  error,
  games,
  activeGameId,
  onSwitchGame,
}: MobSetupScreenProps) {
  const [nameInput, setNameInput] = useState('');
  const [gameSelectorOpen, setGameSelectorOpen] = useState(false);
  const { t } = useLanguage();

  const maxMob = useMemo(
    () => maxMobCount(setup.players.length, setup.detectiveEnabled, setup.doctorEnabled),
    [setup.players.length, setup.detectiveEnabled, setup.doctorEnabled],
  );

  const addPlayer = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    const player: MobSetupPlayer = { id: createId(), name: trimmed };
    onChange({ ...setup, players: [...setup.players, player] });
    setNameInput('');
  };

  const removePlayer = (id: string) => {
    onChange({ ...setup, players: setup.players.filter((p) => p.id !== id) });
  };

  const setMobCount = (n: number) => {
    const nextMax = maxMobCount(setup.players.length, setup.detectiveEnabled, setup.doctorEnabled);
    onChange({ ...setup, mobCount: Math.min(Math.max(1, n), nextMax) });
  };

  const setDetectiveEnabled = (enabled: boolean) => {
    const nextMax = maxMobCount(setup.players.length, enabled, setup.doctorEnabled);
    onChange({ ...setup, detectiveEnabled: enabled, mobCount: Math.min(setup.mobCount, nextMax) });
  };

  const setDoctorEnabled = (enabled: boolean) => {
    const nextMax = maxMobCount(setup.players.length, setup.detectiveEnabled, enabled);
    onChange({ ...setup, doctorEnabled: enabled, mobCount: Math.min(setup.mobCount, nextMax) });
  };

  return (
    <div className="screen setup-screen">
      <header className="setup-header">
        <button
          type="button"
          className="setup-title-row setup-title-button"
          onClick={() => setGameSelectorOpen(true)}
        >
          <IconMob className="setup-logo" />
          <h1>{t('games.mob')}</h1>
        </button>
        <p className="setup-tagline">{t('mob.tagline')}</p>
      </header>

      {gameSelectorOpen && (
        <GameSelector
          games={games}
          activeId={activeGameId}
          onSelect={(id) => {
            setGameSelectorOpen(false);
            onSwitchGame(id);
          }}
          onClose={() => setGameSelectorOpen(false)}
        />
      )}

      <section className="setup-section">
        <h2>{t('setup.players')}</h2>
        <div className="player-input-row">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addPlayer();
            }}
            placeholder={t('setup.playerPlaceholder')}
            maxLength={20}
          />
          <button type="button" className="btn-primary" onClick={addPlayer} disabled={!nameInput.trim()}>
            {t('setup.add')}
          </button>
        </div>
        {setup.players.length > 0 && (
          <ul className="player-list">
            {setup.players.map((p) => {
              const isGod = setup.godId === p.id;
              return (
                <li key={p.id} className={`player-chip${isGod ? ' is-god' : ''}`}>
                  <button
                    type="button"
                    className={`icon-btn halo-btn${isGod ? ' active' : ''}`}
                    onClick={() => onChange({ ...setup, godId: isGod ? null : p.id })}
                    aria-label={t('mobSetup.toggleGod', { name: p.name })}
                    aria-pressed={isGod}
                  >
                    <IconHalo />
                  </button>
                  <span>{p.name}</span>
                  <button
                    type="button"
                    className="icon-btn danger"
                    onClick={() => removePlayer(p.id)}
                    aria-label={t('setup.removePlayer', { name: p.name })}
                  >
                    <IconClose />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {setup.players.length > 0 && <p className="setup-note">{t('mobSetup.godHint')}</p>}
        {setup.players.length < MIN_TOTAL_PLAYERS && (
          <p className="setup-note">{t('mobSetup.minPlayersNote', { min: MIN_TOTAL_PLAYERS })}</p>
        )}
      </section>

      <section className="setup-section">
        <h2>{t('mobSetup.mobCount')}</h2>
        <div className="stepper">
          <button
            type="button"
            className="icon-btn"
            onClick={() => setMobCount(setup.mobCount - 1)}
            disabled={setup.mobCount <= 1}
            aria-label={t('mobSetup.fewerMob')}
          >
            <IconMinus />
          </button>
          <span className="stepper-value">{setup.mobCount}</span>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setMobCount(setup.mobCount + 1)}
            disabled={setup.mobCount >= maxMob}
            aria-label={t('mobSetup.moreMob')}
          >
            <IconPlus />
          </button>
        </div>
        <p className="setup-note">{t('mobSetup.mobCountDescription')}</p>
      </section>

      <section className="setup-section">
        <label className="toggle-row">
          <span>
            <strong>{t('mobSetup.detectiveTitle')}</strong>
            <span className="setup-note inline">{t('mobSetup.detectiveDescription')}</span>
          </span>
          <input
            type="checkbox"
            checked={setup.detectiveEnabled}
            onChange={(e) => setDetectiveEnabled(e.target.checked)}
          />
        </label>
      </section>

      <section className="setup-section">
        <label className="toggle-row">
          <span>
            <strong>{t('mobSetup.doctorTitle')}</strong>
            <span className="setup-note inline">{t('mobSetup.doctorDescription')}</span>
          </span>
          <input
            type="checkbox"
            checked={setup.doctorEnabled}
            onChange={(e) => setDoctorEnabled(e.target.checked)}
          />
        </label>
      </section>

      <section className="setup-section">
        <h2>{t('setup.discussionTimer')}</h2>
        <div className="pill-row">
          {TIMER_PRESETS_MIN.map((min) => {
            const seconds = min === 0 ? null : min * 60;
            const active = setup.timerSeconds === seconds;
            return (
              <button
                key={min}
                type="button"
                className={`pill${active ? ' active' : ''}`}
                onClick={() => onChange({ ...setup, timerSeconds: seconds })}
              >
                {min === 0 ? t('setup.timerOff') : t('setup.timerMin', { min })}
              </button>
            );
          })}
        </div>
      </section>

      {error && <p className="setup-error">{error}</p>}

      <button type="button" className="btn-primary start-btn" onClick={onStart}>
        {t('setup.start')}
      </button>
    </div>
  );
}
