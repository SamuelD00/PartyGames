import type {
  MobGameState,
  MobNightStep,
  MobPlayer,
  MobRole,
  MobSetupPlayer,
  MobWinner,
} from '../types/mob';
import { shuffle } from '../utils/shuffle';

export type MobAction =
  | {
      type: 'START_GAME';
      players: MobSetupPlayer[];
      godId: string;
      mobCount: number;
      detectiveEnabled: boolean;
      doctorEnabled: boolean;
      timerSeconds: number | null;
    }
  | { type: 'NEXT_REVEAL' }
  | { type: 'NIGHT_SUBMIT_MOB'; targetId: string }
  | { type: 'NIGHT_SUBMIT_DOCTOR'; targetId: string }
  | { type: 'NIGHT_STEP_DETECTIVE_DONE' }
  | { type: 'NIGHT_RESULT_CONTINUE' }
  | { type: 'TICK' }
  | { type: 'TOGGLE_TIMER' }
  | { type: 'PAUSE_TIMER' }
  | { type: 'DAY_VOTE'; playerId: string }
  | { type: 'DAY_SKIP_VOTE' }
  | { type: 'DAY_RESULT_CONTINUE' }
  | { type: 'RESET_TO_SETUP' };

export const initialMobGameState: MobGameState = {
  phase: 'setup',
  players: [],
  godId: '',
  godName: '',
  settings: { mobCount: 1, detectiveEnabled: true, doctorEnabled: true, timerSeconds: null },
  round: 1,
  revealOrder: [],
  revealIndex: 0,
  nightStep: null,
  nightMobTarget: null,
  nightDoctorTarget: null,
  lastNightDeath: null,
  timerRemaining: null,
  timerRunning: false,
  lastDayElimination: null,
  winner: null,
};

function isMobTeam(role: MobRole): boolean {
  return role === 'mob';
}

function assignRoles(
  players: MobSetupPlayer[],
  mobCount: number,
  detectiveEnabled: boolean,
  doctorEnabled: boolean,
): MobPlayer[] {
  const order = shuffle(players.map((p) => p.id));
  const mobIds = new Set(order.slice(0, mobCount));
  let cursor = mobCount;
  const detectiveId = detectiveEnabled ? order[cursor++] : null;
  const doctorId = doctorEnabled ? order[cursor++] : null;

  return players.map((p) => {
    let role: MobRole = 'civilian';
    if (mobIds.has(p.id)) role = 'mob';
    else if (p.id === detectiveId) role = 'detective';
    else if (p.id === doctorId) role = 'doctor';
    return { id: p.id, name: p.name, role, eliminated: false };
  });
}

function checkWinner(players: MobPlayer[]): MobWinner | null {
  const aliveMob = players.filter((p) => !p.eliminated && isMobTeam(p.role)).length;
  const aliveTown = players.filter((p) => !p.eliminated && !isMobTeam(p.role)).length;
  if (aliveMob === 0) return 'town';
  if (aliveMob >= aliveTown) return 'mob';
  return null;
}

function nightStepOrder(state: MobGameState): MobNightStep[] {
  const steps: MobNightStep[] = [];
  if (state.players.some((p) => !p.eliminated && isMobTeam(p.role))) steps.push('mob');
  if (state.settings.detectiveEnabled && state.players.some((p) => !p.eliminated && p.role === 'detective')) {
    steps.push('detective');
  }
  if (state.settings.doctorEnabled && state.players.some((p) => !p.eliminated && p.role === 'doctor')) {
    steps.push('doctor');
  }
  return steps;
}

function advanceNightStep(state: MobGameState): MobGameState {
  const order = nightStepOrder(state);
  const currentIndex = state.nightStep ? order.indexOf(state.nightStep) : -1;
  const next = order[currentIndex + 1] ?? null;
  if (next) return { ...state, nightStep: next };
  return resolveNight(state);
}

function resolveNight(state: MobGameState): MobGameState {
  const victimId = state.nightMobTarget && state.nightMobTarget !== state.nightDoctorTarget ? state.nightMobTarget : null;
  let players = state.players;
  let lastNightDeath = null;
  if (victimId) {
    const victim = state.players.find((p) => p.id === victimId);
    if (victim) {
      players = state.players.map((p) => (p.id === victimId ? { ...p, eliminated: true } : p));
      lastNightDeath = { playerId: victim.id, playerName: victim.name, role: victim.role };
    }
  }
  const winner = checkWinner(players);
  return {
    ...state,
    players,
    phase: 'nightResult',
    lastNightDeath,
    winner,
    nightStep: null,
    nightMobTarget: null,
    nightDoctorTarget: null,
  };
}

function beginNight(state: MobGameState, incrementRound: boolean): MobGameState {
  const next: MobGameState = {
    ...state,
    phase: 'night',
    round: incrementRound ? state.round + 1 : state.round,
    nightMobTarget: null,
    nightDoctorTarget: null,
    nightStep: null,
  };
  const order = nightStepOrder(next);
  return { ...next, nightStep: order[0] ?? null };
}

export function mobReducer(state: MobGameState, action: MobAction): MobGameState {
  switch (action.type) {
    case 'START_GAME': {
      const god = action.players.find((p) => p.id === action.godId);
      const playing = action.players.filter((p) => p.id !== action.godId);
      const players = assignRoles(playing, action.mobCount, action.detectiveEnabled, action.doctorEnabled);
      const ids = players.map((p) => p.id);
      return {
        ...initialMobGameState,
        phase: 'reveal',
        players,
        godId: action.godId,
        godName: god?.name ?? '',
        settings: {
          mobCount: action.mobCount,
          detectiveEnabled: action.detectiveEnabled,
          doctorEnabled: action.doctorEnabled,
          timerSeconds: action.timerSeconds,
        },
        round: 1,
        revealOrder: shuffle(ids),
        timerRemaining: action.timerSeconds,
      };
    }

    case 'NEXT_REVEAL': {
      const nextIndex = state.revealIndex + 1;
      if (nextIndex >= state.revealOrder.length) {
        return beginNight({ ...state, revealIndex: nextIndex }, false);
      }
      return { ...state, revealIndex: nextIndex };
    }

    case 'NIGHT_SUBMIT_MOB': {
      if (state.nightStep !== 'mob') return state;
      return advanceNightStep({ ...state, nightMobTarget: action.targetId });
    }

    case 'NIGHT_SUBMIT_DOCTOR': {
      if (state.nightStep !== 'doctor') return state;
      return advanceNightStep({ ...state, nightDoctorTarget: action.targetId });
    }

    case 'NIGHT_STEP_DETECTIVE_DONE': {
      if (state.nightStep !== 'detective') return state;
      return advanceNightStep(state);
    }

    case 'NIGHT_RESULT_CONTINUE': {
      if (state.winner) return { ...state, phase: 'results' };
      return {
        ...state,
        phase: 'discussion',
        timerRemaining: state.settings.timerSeconds,
        timerRunning: state.settings.timerSeconds !== null && state.settings.timerSeconds > 0,
      };
    }

    case 'TICK': {
      if (!state.timerRunning || state.timerRemaining === null) return state;
      const remaining = Math.max(0, state.timerRemaining - 1);
      return { ...state, timerRemaining: remaining, timerRunning: remaining > 0 };
    }

    case 'TOGGLE_TIMER': {
      if (state.timerRemaining === null || state.timerRemaining <= 0) return state;
      return { ...state, timerRunning: !state.timerRunning };
    }

    case 'PAUSE_TIMER': {
      if (!state.timerRunning) return state;
      return { ...state, timerRunning: false };
    }

    case 'DAY_VOTE': {
      const accused = state.players.find((p) => p.id === action.playerId);
      if (!accused || accused.eliminated) return state;
      const players = state.players.map((p) => (p.id === action.playerId ? { ...p, eliminated: true } : p));
      const winner = checkWinner(players);
      return {
        ...state,
        players,
        timerRunning: false,
        lastDayElimination: { playerId: accused.id, playerName: accused.name, role: accused.role },
        winner,
      };
    }

    case 'DAY_RESULT_CONTINUE': {
      const cleared = { ...state, lastDayElimination: null };
      if (cleared.winner) return { ...cleared, phase: 'results' };
      return beginNight(cleared, true);
    }

    case 'DAY_SKIP_VOTE': {
      return beginNight({ ...state, timerRunning: false }, true);
    }

    case 'RESET_TO_SETUP': {
      return initialMobGameState;
    }

    default:
      return state;
  }
}
