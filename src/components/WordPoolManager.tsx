import { useState } from 'react';
import type { WordEntry } from '../hooks/useWordPool';
import { useLanguage } from '../i18n/LanguageContext';
import { IconClose } from './icons';
import './WordPoolManager.css';

interface WordPoolManagerProps {
  words: WordEntry[];
  onAdd: (word: string, hint?: string) => void;
  onRemove: (word: string) => void;
  hintEnabled?: boolean;
}

export function WordPoolManager({ words, onAdd, onRemove, hintEnabled = true }: WordPoolManagerProps) {
  const [wordInput, setWordInput] = useState('');
  const [hintInput, setHintInput] = useState('');
  const [revealed, setRevealed] = useState(false);
  const { t, tp } = useLanguage();

  const handleAdd = () => {
    if (!wordInput.trim()) return;
    onAdd(wordInput, hintInput);
    setWordInput('');
    setHintInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div className="wordpool-manager">
      <div className="pool-input-row">
        <input
          type="text"
          value={wordInput}
          onChange={(e) => setWordInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('pool.addPlaceholder')}
          maxLength={60}
        />
        <button type="button" className="btn-primary" onClick={handleAdd} disabled={!wordInput.trim()}>
          {t('setup.add')}
        </button>
      </div>
      {hintEnabled && (
        <input
          type="text"
          className="pool-hint-input"
          value={hintInput}
          onChange={(e) => setHintInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('pool.hintPlaceholder')}
          maxLength={60}
        />
      )}

      <div className="pool-status-row">
        <span className="pool-count">{tp('pool.count', words.length)}</span>
        <button
          type="button"
          className="btn-secondary pool-toggle"
          onClick={() => setRevealed((r) => !r)}
          disabled={words.length === 0}
        >
          {revealed ? t('pool.hide') : t('pool.show')}
        </button>
      </div>

      {words.length === 0 && <p className="pool-empty">{t('pool.empty')}</p>}

      {revealed && words.length > 0 && (
        <ul className="pool-word-list">
          {words.map((entry) => (
            <li key={entry.word} className="pool-word-chip">
              <span className="pool-word-text">
                {entry.word}
                {hintEnabled && entry.hint && <span className="pool-word-hint"> · {entry.hint}</span>}
              </span>
              <button
                type="button"
                className="icon-btn danger"
                onClick={() => onRemove(entry.word)}
                aria-label={t('pool.remove', { word: entry.word })}
              >
                <IconClose />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
