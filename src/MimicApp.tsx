import { useReducer, useState } from 'react';
import { mimicReducer, initialMimicGameState } from './state/mimicReducer';
import { useMimicWordPool } from './hooks/useMimicWordPool';
import type { MimicSetup } from './types/mimic';
import type { GameDescriptor } from './data/games';
import { MimicSetupScreen } from './screens/MimicSetupScreen';
import { MimicRouletteScreen } from './screens/MimicRouletteScreen';
import { MimicRevealScreen } from './screens/MimicRevealScreen';
import { MimicActingScreen } from './screens/MimicActingScreen';
import { MimicGuessScreen } from './screens/MimicGuessScreen';
import { MimicResultsScreen } from './screens/MimicResultsScreen';
import { useLanguage } from './i18n/LanguageContext';
import { pickRandom } from './utils/shuffle';

const MIN_PLAYERS = 3;

const DEFAULT_SETUP: MimicSetup = {
  players: [],
  timerSeconds: 60,
  roundCount: 6,
};

interface MimicAppProps {
  games: GameDescriptor[];
  activeGameId: string;
  onSwitchGame: (id: string) => void;
}

export function MimicApp({ games, activeGameId, onSwitchGame }: MimicAppProps) {
  const [game, dispatch] = useReducer(mimicReducer, initialMimicGameState);
  const { words, addWord, removeWord } = useMimicWordPool();
  const [setup, setSetup] = useState<MimicSetup>(DEFAULT_SETUP);
  const [error, setError] = useState<string | null>(null);
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const { t } = useLanguage();

  const pickWord = (previousUsedWords: string[]) => {
    // Once every word has been used, reshuffle the whole pool back in rather than dead-ending the game.
    const unusedWords = words.filter((w) => !previousUsedWords.includes(w.word));
    const roundPool = unusedWords.length > 0 ? unusedWords : words;
    const wordEntry = pickRandom(roundPool);
    setUsedWords(unusedWords.length > 0 ? [...previousUsedWords, wordEntry.word] : [wordEntry.word]);
    return wordEntry.word;
  };

  const handleStart = () => {
    if (setup.players.length < MIN_PLAYERS) {
      setError(t('setup.errorMinPlayers'));
      return;
    }
    if (words.length === 0) {
      setError(t('setup.errorEmptyPool'));
      return;
    }
    setError(null);
    const word = pickWord([]);
    const actor = pickRandom(setup.players);
    dispatch({
      type: 'START_GAME',
      players: setup.players,
      timerSeconds: setup.timerSeconds,
      roundCount: setup.roundCount,
      actorId: actor.id,
      actorName: actor.name,
      word,
    });
  };

  const handleGuessSubmit = (guesserId: string | null) => {
    if (game.round >= game.roundCount) {
      dispatch({ type: 'SUBMIT_GUESS', guesserId, next: null });
      return;
    }
    const word = pickWord(usedWords);
    const actor = pickRandom(setup.players);
    dispatch({
      type: 'SUBMIT_GUESS',
      guesserId,
      next: { actorId: actor.id, actorName: actor.name, word },
    });
  };

  const handleEndGame = () => {
    dispatch({ type: 'RESET_TO_SETUP' });
    setUsedWords([]);
  };

  return (
    <>
      {game.phase === 'setup' && (
        <MimicSetupScreen
          setup={setup}
          onChange={(next) => {
            setSetup(next);
            setError(null);
          }}
          words={words}
          onAddWord={addWord}
          onRemoveWord={removeWord}
          onStart={handleStart}
          error={error}
          games={games}
          activeGameId={activeGameId}
          onSwitchGame={onSwitchGame}
        />
      )}

      {game.phase === 'roulette' && game.actorId !== null && (
        <MimicRouletteScreen
          key={game.round}
          players={game.players}
          resultId={game.actorId}
          round={game.round}
          onDone={() => dispatch({ type: 'ROULETTE_DONE' })}
        />
      )}

      {game.phase === 'reveal' && game.actorName !== null && game.word !== null && (
        <MimicRevealScreen
          playerName={game.actorName}
          word={game.word}
          round={game.round}
          onNext={() => dispatch({ type: 'REVEAL_DONE' })}
          onEndGame={handleEndGame}
        />
      )}

      {game.phase === 'acting' && game.actorName !== null && (
        <MimicActingScreen
          actorName={game.actorName}
          round={game.round}
          timerSeconds={game.timerSeconds}
          timerRemaining={game.timerRemaining}
          timerRunning={game.timerRunning}
          onTick={() => dispatch({ type: 'TICK' })}
          onToggleTimer={() => dispatch({ type: 'TOGGLE_TIMER' })}
          onDone={() => dispatch({ type: 'ACTING_DONE' })}
        />
      )}

      {game.phase === 'guess' && game.actorId !== null && game.actorName !== null && (
        <MimicGuessScreen
          players={game.players}
          actorId={game.actorId}
          actorName={game.actorName}
          round={game.round}
          onSubmit={handleGuessSubmit}
        />
      )}

      {game.phase === 'results' && (
        <MimicResultsScreen players={game.players} onPlayAgain={handleStart} onNewGame={handleEndGame} />
      )}
    </>
  );
}
