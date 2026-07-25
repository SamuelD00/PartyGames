import { useWordPoolStorage } from './useWordPool';

export function useMimicWordPool() {
  return useWordPoolStorage('impostor:mimicwordpool');
}
