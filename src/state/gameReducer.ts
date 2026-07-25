import type { GameState, Player, SetupPlayer } from '../types/game';
import { pickRandom, shuffle } from '../utils/shuffle';

export type GameAction =
  | {
      type: 'START_GAME';
      players: SetupPlayer[];
      impostorCount: number;
      timerSeconds: number | null;
      hintEnabled: boolean;
      misterWhiteCount: number;
      secretWord: string;
      impostorHint: string | null;
    }
  | { type: 'NEXT_REVEAL' }
  | { type: 'TICK' }
  | { type: 'TOGGLE_TIMER' }
  | { type: 'PAUSE_TIMER' }
  | { type: 'ACCUSE'; playerId: string }
  | { type: 'SUBMIT_WHITE_GUESS'; guess: string }
  | { type: 'CLEAR_ACCUSATION' }
  | { type: 'RESET_TO_SETUP' };

export const initialGameState: GameState = {
  phase: 'setup',
  players: [],
  settings: { impostorCount: 1, timerSeconds: null, hintEnabled: true, misterWhiteCount: 0 },
  secretWord: null,
  impostorHint: null,
  revealOrder: [],
  startingPlayerId: null,
  revealIndex: 0,
  timerRemaining: null,
  timerRunning: false,
  pendingWhiteGuess: null,
  lastAccusation: null,
  winner: null,
};

function assignRoles(players: SetupPlayer[], impostorCount: number, misterWhiteCount: number): Player[] {
  const order = shuffle(players.map((p) => p.id));
  const impostorIds = new Set(order.slice(0, impostorCount));
  const whiteIds = new Set(order.slice(impostorCount, impostorCount + misterWhiteCount));
  return players.map((p) => ({
    id: p.id,
    name: p.name,
    role: impostorIds.has(p.id) ? 'impostor' : whiteIds.has(p.id) ? 'misterWhite' : 'crew',
    eliminated: false,
  }));
}

function checkWinner(players: Player[]): 'crew' | 'impostors' | null {
  const remainingNonCrew = players.filter((p) => p.role !== 'crew' && !p.eliminated).length;
  const remainingCrew = players.filter((p) => p.role === 'crew' && !p.eliminated).length;
  if (remainingNonCrew === 0) return 'crew';
  if (remainingNonCrew >= remainingCrew) return 'impostors';
  return null;
}

function normalizeGuess(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const players = assignRoles(action.players, action.impostorCount, action.misterWhiteCount);
      const ids = players.map((p) => p.id);
      return {
        ...initialGameState,
        phase: 'reveal',
        players,
        settings: {
          impostorCount: action.impostorCount,
          timerSeconds: action.timerSeconds,
          hintEnabled: action.hintEnabled,
          misterWhiteCount: action.misterWhiteCount,
        },
        secretWord: action.secretWord,
        impostorHint: action.hintEnabled ? action.impostorHint : null,
        revealOrder: shuffle(ids),
        startingPlayerId: pickRandom(ids),
        timerRemaining: action.timerSeconds,
      };
    }

    case 'NEXT_REVEAL': {
      const nextIndex = state.revealIndex + 1;
      if (nextIndex >= state.revealOrder.length) {
        return {
          ...state,
          phase: 'discussion',
          revealIndex: nextIndex,
          timerRunning: state.timerRemaining !== null && state.timerRemaining > 0,
        };
      }
      return { ...state, revealIndex: nextIndex };
    }

    case 'TICK': {
      if (!state.timerRunning || state.timerRemaining === null) return state;
      const remaining = Math.max(0, state.timerRemaining - 1);
      return {
        ...state,
        timerRemaining: remaining,
        timerRunning: remaining > 0,
      };
    }

    case 'TOGGLE_TIMER': {
      if (state.timerRemaining === null || state.timerRemaining <= 0) return state;
      return { ...state, timerRunning: !state.timerRunning };
    }

    case 'PAUSE_TIMER': {
      if (!state.timerRunning) return state;
      return { ...state, timerRunning: false };
    }

    case 'ACCUSE': {
      const accused = state.players.find((p) => p.id === action.playerId);
      if (!accused || accused.eliminated || state.pendingWhiteGuess) return state;

      if (accused.role === 'misterWhite') {
        return {
          ...state,
          timerRunning: false,
          pendingWhiteGuess: { playerId: accused.id, playerName: accused.name },
        };
      }

      const players = state.players.map((p) =>
        p.id === action.playerId ? { ...p, eliminated: true } : p,
      );
      const winner = checkWinner(players);

      return {
        ...state,
        players,
        timerRunning: false,
        lastAccusation: {
          playerId: accused.id,
          playerName: accused.name,
          role: accused.role,
          whiteGuessCorrect: null,
        },
        phase: winner ? 'results' : state.phase,
        winner,
      };
    }

    case 'SUBMIT_WHITE_GUESS': {
      if (!state.pendingWhiteGuess) return state;
      const { playerId, playerName } = state.pendingWhiteGuess;
      const correct = normalizeGuess(action.guess) === normalizeGuess(state.secretWord ?? '');
      const players = correct
        ? state.players
        : state.players.map((p) => (p.id === playerId ? { ...p, eliminated: true } : p));
      const winner = checkWinner(players);

      return {
        ...state,
        players,
        pendingWhiteGuess: null,
        timerRunning: false,
        lastAccusation: {
          playerId,
          playerName,
          role: 'misterWhite',
          whiteGuessCorrect: correct,
        },
        phase: winner ? 'results' : state.phase,
        winner,
      };
    }

    case 'CLEAR_ACCUSATION': {
      return { ...state, lastAccusation: null };
    }

    case 'RESET_TO_SETUP': {
      return initialGameState;
    }

    default:
      return state;
  }
}
