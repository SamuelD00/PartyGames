import type { ForeheadGameState, ForeheadSetupPlayer } from '../types/forehead';

interface NextTurn {
  guesserId: string;
  guesserName: string;
  word: string;
}

export type ForeheadAction =
  | {
      type: 'START_GAME';
      players: ForeheadSetupPlayer[];
      timerSeconds: number | null;
      turnCount: number;
      guesserId: string;
      guesserName: string;
      word: string;
    }
  | { type: 'ROULETTE_DONE' }
  | { type: 'READY_DONE' }
  | { type: 'COUNTDOWN_DONE' }
  | { type: 'TICK' }
  | { type: 'CORRECT_WORD'; nextWord: string }
  | { type: 'SKIP_WORD'; nextWord: string }
  | { type: 'END_TURN' }
  | { type: 'CONTINUE_AFTER_TURN'; next: NextTurn | null }
  | { type: 'RESET_TO_SETUP' };

export const initialForeheadGameState: ForeheadGameState = {
  phase: 'setup',
  players: [],
  timerSeconds: 60,
  turnCount: 6,
  turn: 0,
  guesserId: null,
  guesserName: null,
  currentWord: null,
  correctWords: [],
  skippedWords: [],
  timerRemaining: null,
  timerRunning: false,
};

export function foreheadReducer(state: ForeheadGameState, action: ForeheadAction): ForeheadGameState {
  switch (action.type) {
    case 'START_GAME': {
      return {
        phase: 'roulette',
        players: action.players.map((p) => ({ id: p.id, name: p.name, score: 0 })),
        timerSeconds: action.timerSeconds,
        turnCount: action.turnCount,
        turn: 1,
        guesserId: action.guesserId,
        guesserName: action.guesserName,
        currentWord: action.word,
        correctWords: [],
        skippedWords: [],
        timerRemaining: action.timerSeconds,
        timerRunning: false,
      };
    }

    case 'ROULETTE_DONE': {
      if (state.phase !== 'roulette') return state;
      return { ...state, phase: 'ready' };
    }

    case 'READY_DONE': {
      if (state.phase !== 'ready') return state;
      return { ...state, phase: 'countdown' };
    }

    case 'COUNTDOWN_DONE': {
      if (state.phase !== 'countdown') return state;
      return {
        ...state,
        phase: 'playing',
        timerRunning: state.timerSeconds !== null && state.timerSeconds > 0,
      };
    }

    case 'TICK': {
      if (!state.timerRunning || state.timerRemaining === null) return state;
      const remaining = Math.max(0, state.timerRemaining - 1);
      if (remaining === 0) {
        return { ...state, timerRemaining: 0, timerRunning: false, phase: 'turnResults' };
      }
      return { ...state, timerRemaining: remaining };
    }

    case 'CORRECT_WORD': {
      if (state.phase !== 'playing' || state.guesserId === null) return state;
      const players = state.players.map((p) =>
        p.id === state.guesserId ? { ...p, score: p.score + 1 } : p,
      );
      return {
        ...state,
        players,
        currentWord: action.nextWord,
        correctWords: state.currentWord ? [...state.correctWords, state.currentWord] : state.correctWords,
      };
    }

    case 'SKIP_WORD': {
      if (state.phase !== 'playing') return state;
      return {
        ...state,
        currentWord: action.nextWord,
        skippedWords: state.currentWord ? [...state.skippedWords, state.currentWord] : state.skippedWords,
      };
    }

    case 'END_TURN': {
      if (state.phase !== 'playing') return state;
      return { ...state, phase: 'turnResults', timerRunning: false };
    }

    case 'CONTINUE_AFTER_TURN': {
      if (state.phase !== 'turnResults') return state;
      if (!action.next) {
        return { ...state, phase: 'results' };
      }
      return {
        ...state,
        phase: 'roulette',
        turn: state.turn + 1,
        guesserId: action.next.guesserId,
        guesserName: action.next.guesserName,
        currentWord: action.next.word,
        correctWords: [],
        skippedWords: [],
        timerRemaining: state.timerSeconds,
        timerRunning: false,
      };
    }

    case 'RESET_TO_SETUP': {
      return initialForeheadGameState;
    }

    default:
      return state;
  }
}
