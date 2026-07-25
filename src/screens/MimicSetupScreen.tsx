import { useState } from 'react';
import type { MimicSetup, MimicSetupPlayer } from '../types/mimic';
import type { WordEntry } from '../hooks/useWordPool';
import type { GameDescriptor } from '../data/games';
import { WordPoolManager } from '../components/WordPoolManager';
import { GameSelector } from '../components/GameSelector';
import { IconClose, IconMimic, IconMinus, IconPlus } from '../components/icons';
import { useLanguage } from '../i18n/LanguageContext';
import { createId } from '../utils/id';
import './SetupScreen.css';

const MIN_PLAYERS = 3;
const TIMER_PRESETS_MIN = [0, 1, 2, 3, 5, 10];
const MIN_ROUNDS = 1;
const MAX_ROUNDS = 20;

interface MimicSetupScreenProps {
  setup: MimicSetup;
  onChange: (setup: MimicSetup) => void;
  words: WordEntry[];
  onAddWord: (word: string, hint?: string) => void;
  onRemoveWord: (word: string) => void;
  onStart: () => void;
  error: string | null;
  games: GameDescriptor[];
  activeGameId: string;
  onSwitchGame: (id: string) => void;
}

export function MimicSetupScreen({
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
}: MimicSetupScreenProps) {
  const [nameInput, setNameInput] = useState('');
  const [gameSelectorOpen, setGameSelectorOpen] = useState(false);
  const { t, tp } = useLanguage();

  const addPlayer = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    const player: MimicSetupPlayer = { id: createId(), name: trimmed };
    onChange({ ...setup, players: [...setup.players, player] });
    setNameInput('');
  };

  const removePlayer = (id: string) => {
    onChange({ ...setup, players: setup.players.filter((p) => p.id !== id) });
  };

  const setRoundCount = (n: number) => {
    onChange({ ...setup, roundCount: Math.min(Math.max(MIN_ROUNDS, n), MAX_ROUNDS) });
  };

  return (
    <div className="screen setup-screen">
      <header className="setup-header">
        <button
          type="button"
          className="setup-title-row setup-title-button"
          onClick={() => setGameSelectorOpen(true)}
        >
          <IconMimic className="setup-logo" />
          <h1>{t('games.mimic')}</h1>
        </button>
        <p className="setup-tagline">{t('mimic.tagline')}</p>
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
        <WordPoolManager words={words} onAdd={onAddWord} onRemove={onRemoveWord} hintEnabled={false} />
      </section>

      <section className="setup-section">
        <h2>{t('mimicSetup.roundsTitle')}</h2>
        <div className="stepper">
          <button
            type="button"
            className="icon-btn"
            onClick={() => setRoundCount(setup.roundCount - 1)}
            disabled={setup.roundCount <= MIN_ROUNDS}
            aria-label={t('mimicSetup.fewerRounds')}
          >
            <IconMinus />
          </button>
          <span className="stepper-value">{setup.roundCount}</span>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setRoundCount(setup.roundCount + 1)}
            disabled={setup.roundCount >= MAX_ROUNDS}
            aria-label={t('mimicSetup.moreRounds')}
          >
            <IconPlus />
          </button>
        </div>
        <p className="setup-note">{t('mimicSetup.roundsDescription')}</p>
      </section>

      <section className="setup-section">
        <h2>{t('mimicSetup.timerTitle')}</h2>
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

      {words.length > 0 && (
        <p className="setup-footnote">{t('setup.footnote', { words: tp('pool.count', words.length) })}</p>
      )}
    </div>
  );
}
