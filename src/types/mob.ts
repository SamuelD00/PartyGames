export type MobGamePhase = 'setup' | 'reveal' | 'night' | 'nightResult' | 'discussion' | 'results';

export type MobRole = 'mob' | 'detective' | 'doctor' | 'civilian';

export type MobNightStep = 'mob' | 'detective' | 'doctor';

export interface MobPlayer {
  id: string;
  name: string;
  role: MobRole;
  eliminated: boolean;
}

export interface MobSetupPlayer {
  id: string;
  name: string;
}

export interface MobSettings {
  mobCount: number;
  detectiveEnabled: boolean;
  doctorEnabled: boolean;
  timerSeconds: number | null;
}

export interface MobGameSetup {
  players: MobSetupPlayer[];
  godId: string | null;
  mobCount: number;
  detectiveEnabled: boolean;
  doctorEnabled: boolean;
  timerSeconds: number | null;
}

export interface NightDeath {
  playerId: string;
  playerName: string;
  role: MobRole;
}

export interface DayElimination {
  playerId: string;
  playerName: string;
  role: MobRole;
}

export type MobWinner = 'town' | 'mob';

export interface MobGameState {
  phase: MobGamePhase;
  players: MobPlayer[];
  godId: string;
  godName: string;
  settings: MobSettings;
  round: number;
  revealOrder: string[];
  revealIndex: number;
  nightStep: MobNightStep | null;
  nightMobTarget: string | null;
  nightDoctorTarget: string | null;
  lastNightDeath: NightDeath | null;
  timerRemaining: number | null;
  timerRunning: boolean;
  lastDayElimination: DayElimination | null;
  winner: MobWinner | null;
}
