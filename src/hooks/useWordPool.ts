import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'impostor:wordpool';

export interface WordEntry {
  word: string;
  hint: string | null;
}

function loadEntries(): WordEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item): WordEntry | null => {
        if (typeof item === 'string') return { word: item, hint: null };
        if (item && typeof item === 'object' && typeof item.word === 'string') {
          return { word: item.word, hint: typeof item.hint === 'string' ? item.hint : null };
        }
        return null;
      })
      .filter((entry): entry is WordEntry => entry !== null);
  } catch {
    return [];
  }
}

export function useWordPool() {
  const [entries, setEntries] = useState<WordEntry[]>(() => loadEntries());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const addWord = useCallback((word: string, hint?: string) => {
    const trimmedWord = word.trim();
    if (!trimmedWord) return;
    const trimmedHint = hint?.trim() || null;
    setEntries((prev) =>
      prev.some((entry) => entry.word === trimmedWord)
        ? prev
        : [...prev, { word: trimmedWord, hint: trimmedHint }],
    );
  }, []);

  const removeWord = useCallback((word: string) => {
    setEntries((prev) => prev.filter((entry) => entry.word !== word));
  }, []);

  return { words: entries, addWord, removeWord };
}
