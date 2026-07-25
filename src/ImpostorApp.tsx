import { useReducer, useState } from 'react';
import { gameReducer, initialGameState } from './state/gameReducer';
import { useWordPool } from './hooks/useWordPool';
import type { GameSetup } from './types/game';
import type { GameDescriptor } from './data/games';
import { SetupScreen } from './screens/SetupScreen';
import { RevealScreen } from './screens/RevealScreen';
import { DiscussionScreen } from './screens/DiscussionScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { useLanguage } from './i18n/LanguageContext';
import { pickRandom } from './utils/shuffle';

const DEFAULT_SETUP: GameSetup = {
  players: [],
  impostorCount: 1,
  timerSeconds: null,
  hintEnabled: true,
  misterWhiteCount: 0,
};

interface ImpostorAppProps {
  games: GameDescriptor[];
  activeGameId: string;
  onSwitchGame: (id: string) => void;
}

export function ImpostorApp({ games, activeGameId, onSwitchGame }: ImpostorAppProps) {
  const [game, dispatch] = useReducer(gameReducer, initialGameState);
  const { words, addWord, removeWord } = useWordPool();
  const [setup, setSetup] = useState<GameSetup>(DEFAULT_SETUP);
  const [error, setError] = useState<string | null>(null);
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const { t } = useLanguage();

  const startGame = () => {
    if (setup.players.length < 3) {
      setError(t('setup.errorMinPlayers'));
      return;
    }
    if (words.length === 0) {
      setError(t('setup.errorEmptyPool'));
      return;
    }

    // Once every word has been used, reshuffle the whole pool back in rather than dead-ending the game.
    const unusedWords = words.filter((w) => !usedWords.includes(w.word));
    const roundPool = unusedWords.length > 0 ? unusedWords : words;

    const secretEntry = pickRandom(roundPool);
    const secretWord = secretEntry.word;
    let impostorHint: string | null = null;
    if (setup.hintEnabled) {
      if (secretEntry.hint) {
        impostorHint = secretEntry.hint;
      } else {
        const decoyPool = words.map((w) => w.word).filter((w) => w !== secretWord);
        impostorHint = decoyPool.length > 0 ? pickRandom(decoyPool) : null;
      }
    }

    setUsedWords(unusedWords.length > 0 ? [...usedWords, secretWord] : [secretWord]);
    setError(null);
    dispatch({
      type: 'START_GAME',
      players: setup.players,
      impostorCount: setup.impostorCount,
      timerSeconds: setup.timerSeconds,
      hintEnabled: setup.hintEnabled,
      misterWhiteCount: setup.misterWhiteCount,
      secretWord,
      impostorHint,
    });
  };

  return (
    <>
      {game.phase === 'setup' && (
        <SetupScreen
          setup={setup}
          onChange={(next) => {
            setSetup(next);
            setError(null);
          }}
          words={words}
          onAddWord={addWord}
          onRemoveWord={removeWord}
          onStart={startGame}
          error={error}
          games={games}
          activeGameId={activeGameId}
          onSwitchGame={onSwitchGame}
        />
      )}

      {game.phase === 'reveal' && (
        <RevealScreen
          players={game.players}
          revealOrder={game.revealOrder}
          revealIndex={game.revealIndex}
          secretWord={game.secretWord}
          impostorHint={game.impostorHint}
          onNext={() => dispatch({ type: 'NEXT_REVEAL' })}
        />
      )}

      {game.phase === 'discussion' && (
        <DiscussionScreen
          players={game.players}
          startingPlayerId={game.startingPlayerId}
          timerSeconds={game.settings.timerSeconds}
          timerRemaining={game.timerRemaining}
          timerRunning={game.timerRunning}
          pendingWhiteGuess={game.pendingWhiteGuess}
          lastAccusation={game.lastAccusation}
          onTick={() => dispatch({ type: 'TICK' })}
          onToggleTimer={() => dispatch({ type: 'TOGGLE_TIMER' })}
          onPauseTimer={() => dispatch({ type: 'PAUSE_TIMER' })}
          onAccuse={(playerId) => dispatch({ type: 'ACCUSE', playerId })}
          onSubmitWhiteGuess={(guess) => dispatch({ type: 'SUBMIT_WHITE_GUESS', guess })}
          onClearAccusation={() => dispatch({ type: 'CLEAR_ACCUSATION' })}
        />
      )}

      {game.phase === 'results' && (
        <ResultsScreen
          players={game.players}
          winner={game.winner}
          secretWord={game.secretWord}
          onPlayAgain={startGame}
          onNewGame={() => {
            dispatch({ type: 'RESET_TO_SETUP' });
            setUsedWords([]);
          }}
        />
      )}
    </>
  );
}
