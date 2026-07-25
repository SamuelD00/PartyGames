import { useCallback, useEffect, useState } from 'react';

export interface WordEntry {
  word: string;
  hint: string | null;
}

function loadEntries(storageKey: string): WordEntry[] {
  try {
    const raw = localStorage.getItem(storageKey);
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

export function useWordPoolStorage(storageKey: string) {
  const [entries, setEntries] = useState<WordEntry[]>(() => loadEntries(storageKey));

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(entries));
  }, [storageKey, entries]);

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

export function useWordPool() {
  return useWordPoolStorage('impostor:wordpool');
}
