import { useWordPoolStorage } from './useWordPool';

export function useForeheadWordPool() {
  return useWordPoolStorage('impostor:foreheadwordpool');
}
