import { useMemo, useState } from 'react';
import type { GameSetup, SetupPlayer } from '../types/game';
import type { WordEntry } from '../hooks/useWordPool';
import type { GameDescriptor } from '../data/games';
import { WordPoolManager } from '../components/WordPoolManager';
import { GameSelector } from '../components/GameSelector';
import { IconClose, IconDisguise, IconMinus, IconPlus } from '../components/icons';
import { useLanguage } from '../i18n/LanguageContext';
import { createId } from '../utils/id';
import './SetupScreen.css';

const TIMER_PRESETS_MIN = [0, 1, 2, 3, 5, 10];
const MIN_PLAYERS = 3;

interface SetupScreenProps {
  setup: GameSetup;
  onChange: (setup: GameSetup) => void;
  words: WordEntry[];
  onAddWord: (word: string, hint?: string) => void;
  onRemoveWord: (word: string) => void;
  onStart: () => void;
  error: string | null;
  games: GameDescriptor[];
  activeGameId: string;
  onSwitchGame: (id: string) => void;
}

export function SetupScreen({
  setup,
  onChange,
  words,
  onAddWord,
  onRemoveWord,
  onStart,
  error,
  games,
  activeGameId,
  onSwitchGame,
}: SetupScreenProps) {
  const [nameInput, setNameInput] = useState('');
  const [gameSelectorOpen, setGameSelectorOpen] = useState(false);
  const { t, tp } = useLanguage();

  const specialRoleMax = (n: number, otherCount: number, minSelf: number) => {
    const combinedMax = Math.max(1, Math.ceil(n / 2) - 1);
    return Math.max(minSelf, Math.min(combinedMax - otherCount, n - 1 - otherCount));
  };

  const maxImpostors = useMemo(
    () => specialRoleMax(setup.players.length, setup.misterWhiteCount, 1),
    [setup.players.length, setup.misterWhiteCount],
  );

  const maxMisterWhite = useMemo(
    () => specialRoleMax(setup.players.length, setup.impostorCount, 0),
    [setup.players.length, setup.impostorCount],
  );

  const addPlayer = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    const player: SetupPlayer = { id: createId(), name: trimmed };
    onChange({ ...setup, players: [...setup.players, player] });
    setNameInput('');
  };

  const removePlayer = (id: string) => {
    onChange({ ...setup, players: setup.players.filter((p) => p.id !== id) });
  };

  const setImpostorCount = (n: number) => {
    const nextImpostorCount = Math.min(Math.max(1, n), maxImpostors);
    const nextMaxMisterWhite = specialRoleMax(setup.players.length, nextImpostorCount, 0);
    onChange({
      ...setup,
      impostorCount: nextImpostorCount,
      misterWhiteCount: Math.min(setup.misterWhiteCount, nextMaxMisterWhite),
    });
  };

  const setMisterWhiteCount = (n: number) => {
    const nextMisterWhiteCount = Math.min(Math.max(0, n), maxMisterWhite);
    const nextMaxImpostors = specialRoleMax(setup.players.length, nextMisterWhiteCount, 1);
    onChange({
      ...setup,
      misterWhiteCount: nextMisterWhiteCount,
      impostorCount: Math.min(setup.impostorCount, nextMaxImpostors),
    });
  };

  return (
    <div className="screen setup-screen">
      <header className="setup-header">
        <button
          type="button"
          className="setup-title-row setup-title-button"
          onClick={() => setGameSelectorOpen(true)}
        >
          <IconDisguise className="setup-logo" />
          <h1>Impostor</h1>
        </button>
        <p className="setup-tagline">{t('app.tagline')}</p>
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
            {setup.players.map((p) => (
              <li key={p.id} className="player-chip">
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
            ))}
          </ul>
        )}
        {setup.players.length < MIN_PLAYERS && (
          <p className="setup-note">{t('setup.minPlayers', { min: MIN_PLAYERS })}</p>
        )}
      </section>

      <section className="setup-section">
        <h2>{t('setup.wordPool')}</h2>
        <WordPoolManager words={words} onAdd={onAddWord} onRemove={onRemoveWord} />
      </section>

      <section className="setup-section">
        <h2>{t('setup.impostors')}</h2>
        <div className="stepper">
          <button
            type="button"
            className="icon-btn"
            onClick={() => setImpostorCount(setup.impostorCount - 1)}
            disabled={setup.impostorCount <= 1}
            aria-label={t('setup.fewerImpostors')}
          >
            <IconMinus />
          </button>
          <span className="stepper-value">{setup.impostorCount}</span>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setImpostorCount(setup.impostorCount + 1)}
            disabled={setup.impostorCount >= maxImpostors}
            aria-label={t('setup.moreImpostors')}
          >
            <IconPlus />
          </button>
        </div>
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

      <section className="setup-section">
        <label className="toggle-row">
          <span>
            <strong>{t('setup.hintTitle')}</strong>
            <span className="setup-note inline">{t('setup.hintDescription')}</span>
          </span>
          <input
            type="checkbox"
            checked={setup.hintEnabled}
            onChange={(e) => onChange({ ...setup, hintEnabled: e.target.checked })}
          />
        </label>
      </section>

      <section className="setup-section">
        <h2>{t('setup.misterWhiteTitle')}</h2>
        <div className="stepper">
          <button
            type="button"
            className="icon-btn"
            onClick={() => setMisterWhiteCount(setup.misterWhiteCount - 1)}
            disabled={setup.misterWhiteCount <= 0}
            aria-label={t('setup.fewerMisterWhite')}
          >
            <IconMinus />
          </button>
          <span className="stepper-value">{setup.misterWhiteCount}</span>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setMisterWhiteCount(setup.misterWhiteCount + 1)}
            disabled={setup.misterWhiteCount >= maxMisterWhite}
            aria-label={t('setup.moreMisterWhite')}
          >
            <IconPlus />
          </button>
        </div>
        <p className="setup-note">{t('setup.misterWhiteDescription')}</p>
      </section>

      {error && <p className="setup-error">{error}</p>}

      <button type="button" className="btn-primary start-btn" onClick={onStart}>
        {t('setup.start')}
      </button>

      {words.length > 0 && (
        <p className="setup-footnote">{t('setup.footnote', { words: tp('pool.count', words.length) })}</p>
      )}
    </div>
  );
}
