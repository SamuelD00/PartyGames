import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { GameDescriptor } from '../data/games';
import { useLanguage } from '../i18n/LanguageContext';
import { IconClose } from './icons';
import './GameSelector.css';

interface GameSelectorProps {
  games: GameDescriptor[];
  activeId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export function GameSelector({ games, activeId, onSelect, onClose }: GameSelectorProps) {
  const { t } = useLanguage();
  const activeGame = games.find((game) => game.id === activeId) ?? games[0];
  const ActiveIcon = activeGame.icon;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div className="game-selector-overlay" onClick={onClose}>
      <div className="game-selector-panel" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="icon-btn game-selector-close"
          onClick={onClose}
          aria-label={t('gameSelector.closeLabel')}
        >
          <IconClose />
        </button>

        <div className="game-selector-title-row">
          <ActiveIcon className="game-selector-logo" />
          <h1>{t(activeGame.nameKey)}</h1>
        </div>
        <p className="game-selector-subtitle">{t('gameSelector.subtitle')}</p>

        <div className="game-selector-list">
          {games.map((game) => {
            const Icon = game.icon;
            const isActive = game.id === activeGame.id;
            return (
              <button
                type="button"
                key={game.id}
                className={`game-card${isActive ? ' active' : ''}`}
                onClick={() => onSelect(game.id)}
              >
                <span className="game-card-icon">
                  <Icon size={28} />
                </span>
                <span className="game-card-name">{t(game.nameKey)}</span>
                {isActive && <span className="game-card-tag">{t('gameSelector.current')}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}
