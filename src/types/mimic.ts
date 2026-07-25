export type MimicPhase = 'setup' | 'roulette' | 'reveal' | 'acting' | 'guess' | 'results';

export interface MimicSetupPlayer {
  id: string;
  name: string;
}

export interface MimicPlayer {
  id: string;
  name: string;
  score: number;
}

export interface MimicSetup {
  players: MimicSetupPlayer[];
  timerSeconds: number | null;
  roundCount: number;
}

export interface MimicGameState {
  phase: MimicPhase;
  players: MimicPlayer[];
  timerSeconds: number | null;
  roundCount: number;
  round: number;
  actorId: string | null;
  actorName: string | null;
  word: string | null;
  timerRemaining: number | null;
  timerRunning: boolean;
}
