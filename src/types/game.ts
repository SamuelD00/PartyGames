export type GamePhase = 'setup' | 'reveal' | 'discussion' | 'results';

export type PlayerRole = 'crew' | 'impostor' | 'misterWhite';

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  eliminated: boolean;
}

export interface GameSettings {
  impostorCount: number;
  timerSeconds: number | null;
  hintEnabled: boolean;
  misterWhiteCount: number;
}

export interface SetupPlayer {
  id: string;
  name: string;
}

export interface GameSetup {
  players: SetupPlayer[];
  impostorCount: number;
  timerSeconds: number | null;
  hintEnabled: boolean;
  misterWhiteCount: number;
}

export interface AccusationResult {
  playerId: string;
  playerName: string;
  role: PlayerRole;
  /** Only set when the accused player was Mister White: whether their word guess was correct. */
  whiteGuessCorrect: boolean | null;
}

export interface PendingWhiteGuess {
  playerId: string;
  playerName: string;
}

export type Winner = 'crew' | 'impostors';

export interface GameState {
  phase: GamePhase;
  players: Player[];
  settings: GameSettings;
  secretWord: string | null;
  impostorHint: string | null;
  revealOrder: string[];
  startingPlayerId: string | null;
  revealIndex: number;
  timerRemaining: number | null;
  timerRunning: boolean;
  pendingWhiteGuess: PendingWhiteGuess | null;
  lastAccusation: AccusationResult | null;
  winner: Winner | null;
}
