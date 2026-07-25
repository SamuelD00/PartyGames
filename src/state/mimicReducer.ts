import type { MimicGameState, MimicSetupPlayer } from '../types/mimic';

interface NextRound {
  actorId: string;
  actorName: string;
  word: string;
}

export type MimicAction =
  | {
      type: 'START_GAME';
      players: MimicSetupPlayer[];
      timerSeconds: number | null;
      roundCount: number;
      actorId: string;
      actorName: string;
      word: string;
    }
  | { type: 'ROULETTE_DONE' }
  | { type: 'REVEAL_DONE' }
  | { type: 'TICK' }
  | { type: 'TOGGLE_TIMER' }
  | { type: 'PAUSE_TIMER' }
  | { type: 'ACTING_DONE' }
  | { type: 'SUBMIT_GUESS'; guesserId: string | null; next: NextRound | null }
  | { type: 'RESET_TO_SETUP' };

export const initialMimicGameState: MimicGameState = {
  phase: 'setup',
  players: [],
  timerSeconds: null,
  roundCount: 6,
  round: 0,
  actorId: null,
  actorName: null,
  word: null,
  timerRemaining: null,
  timerRunning: false,
};

export function mimicReducer(state: MimicGameState, action: MimicAction): MimicGameState {
  switch (action.type) {
    case 'START_GAME': {
      return {
        phase: 'roulette',
        players: action.players.map((p) => ({ id: p.id, name: p.name, score: 0 })),
        timerSeconds: action.timerSeconds,
        roundCount: action.roundCount,
        round: 1,
        actorId: action.actorId,
        actorName: action.actorName,
        word: action.word,
        timerRemaining: action.timerSeconds,
        timerRunning: false,
      };
    }

    case 'ROULETTE_DONE': {
      if (state.phase !== 'roulette') return state;
      return { ...state, phase: 'reveal' };
    }

    case 'REVEAL_DONE': {
      if (state.phase !== 'reveal') return state;
      return {
        ...state,
        phase: 'acting',
        timerRunning: state.timerSeconds !== null && state.timerSeconds > 0,
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

    case 'ACTING_DONE': {
      if (state.phase !== 'acting') return state;
      return { ...state, phase: 'guess', timerRunning: false };
    }

    case 'SUBMIT_GUESS': {
      const players = action.guesserId
        ? state.players.map((p) => (p.id === action.guesserId ? { ...p, score: p.score + 1 } : p))
        : state.players;

      if (!action.next) {
        return { ...state, players, phase: 'results' };
      }

      return {
        ...state,
        players,
        phase: 'roulette',
        round: state.round + 1,
        actorId: action.next.actorId,
        actorName: action.next.actorName,
        word: action.next.word,
        timerRemaining: state.timerSeconds,
        timerRunning: false,
      };
    }

    case 'RESET_TO_SETUP': {
      return initialMimicGameState;
    }

    default:
      return state;
  }
}
