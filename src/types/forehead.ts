export type ForeheadPhase = 'setup' | 'roulette' | 'ready' | 'countdown' | 'playing' | 'turnResults' | 'results';

export interface ForeheadSetupPlayer {
  id: string;
  name: string;
}

export interface ForeheadPlayer {
  id: string;
  name: string;
  score: number;
}

export interface ForeheadSetup {
  players: ForeheadSetupPlayer[];
  timerSeconds: number | null;
  turnCount: number;
}

export interface ForeheadGameState {
  phase: ForeheadPhase;
  players: ForeheadPlayer[];
  timerSeconds: number | null;
  turnCount: number;
  turn: number;
  guesserId: string | null;
  guesserName: string | null;
  currentWord: string | null;
  correctWords: string[];
  skippedWords: string[];
  timerRemaining: number | null;
  timerRunning: boolean;
}
