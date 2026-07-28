import { useReducer, useState } from 'react';
import { foreheadReducer, initialForeheadGameState } from './state/foreheadReducer';
import { useForeheadWordPool } from './hooks/useForeheadWordPool';
import type { ForeheadSetup } from './types/forehead';
import type { GameDescriptor } from './data/games';
import type { TiltPermission } from './utils/tilt';
import { unlockOrientation } from './utils/orientationLock';
import { ForeheadOrientationLock } from './components/ForeheadOrientationLock';
import { ForeheadSetupScreen } from './screens/ForeheadSetupScreen';
import { ForeheadRouletteScreen } from './screens/ForeheadRouletteScreen';
import { ForeheadReadyScreen } from './screens/ForeheadReadyScreen';
import { ForeheadCountdownScreen } from './screens/ForeheadCountdownScreen';
import { ForeheadPlayScreen } from './screens/ForeheadPlayScreen';
import { ForeheadTurnResultsScreen } from './screens/ForeheadTurnResultsScreen';
import { ForeheadResultsScreen } from './screens/ForeheadResultsScreen';
import { useLanguage } from './i18n/LanguageContext';
import { pickRandom } from './utils/shuffle';

const MIN_PLAYERS = 3;

const DEFAULT_SETUP: ForeheadSetup = {
  players: [],
  timerSeconds: 60,
  turnCount: 6,
};

interface ForeheadAppProps {
  games: GameDescriptor[];
  activeGameId: string;
  onSwitchGame: (id: string) => void;
}

export function ForeheadApp({ games, activeGameId, onSwitchGame }: ForeheadAppProps) {
  const [game, dispatch] = useReducer(foreheadReducer, initialForeheadGameState);
  const { words, addWord, removeWord } = useForeheadWordPool();
  const [setup, setSetup] = useState<ForeheadSetup>(DEFAULT_SETUP);
  const [error, setError] = useState<string | null>(null);
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [tiltPermission, setTiltPermission] = useState<TiltPermission>('unsupported');
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
    const guesser = pickRandom(setup.players);
    dispatch({
      type: 'START_GAME',
      players: setup.players,
      timerSeconds: setup.timerSeconds,
      turnCount: setup.turnCount,
      guesserId: guesser.id,
      guesserName: guesser.name,
      word,
    });
  };

  const handleReadyStart = (permission: TiltPermission) => {
    setTiltPermission(permission);
    dispatch({ type: 'READY_DONE' });
  };

  const handleCorrect = () => {
    const word = pickWord(usedWords);
    dispatch({ type: 'CORRECT_WORD', nextWord: word });
  };

  const handleSkip = () => {
    const word = pickWord(usedWords);
    dispatch({ type: 'SKIP_WORD', nextWord: word });
  };

  const handleTurnContinue = () => {
    unlockOrientation();
    if (game.turn >= game.turnCount) {
      dispatch({ type: 'CONTINUE_AFTER_TURN', next: null });
      return;
    }
    const word = pickWord(usedWords);
    const guesser = pickRandom(setup.players);
    dispatch({
      type: 'CONTINUE_AFTER_TURN',
      next: { guesserId: guesser.id, guesserName: guesser.name, word },
    });
  };

  const handleEndGame = () => {
    unlockOrientation();
    dispatch({ type: 'RESET_TO_SETUP' });
    setUsedWords([]);
    setTiltPermission('unsupported');
  };

  return (
    <>
      {game.phase === 'setup' && (
        <ForeheadSetupScreen
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

      {game.phase === 'roulette' && game.guesserId !== null && (
        <ForeheadRouletteScreen
          key={game.turn}
          players={game.players}
          resultId={game.guesserId}
          turn={game.turn}
          onDone={() => dispatch({ type: 'ROULETTE_DONE' })}
        />
      )}

      {game.phase === 'ready' && game.guesserName !== null && (
        <ForeheadOrientationLock target="landscape">
          <ForeheadReadyScreen
            playerName={game.guesserName}
            turn={game.turn}
            onStart={handleReadyStart}
            onEndGame={handleEndGame}
          />
        </ForeheadOrientationLock>
      )}

      {game.phase === 'countdown' && game.guesserName !== null && (
        <ForeheadOrientationLock target="landscape">
          <ForeheadCountdownScreen
            key={game.turn}
            playerName={game.guesserName}
            onDone={() => dispatch({ type: 'COUNTDOWN_DONE' })}
          />
        </ForeheadOrientationLock>
      )}

      {game.phase === 'playing' && game.currentWord !== null && (
        <ForeheadOrientationLock target="landscape">
          <ForeheadPlayScreen
            key={game.turn}
            word={game.currentWord}
            turn={game.turn}
            timerSeconds={game.timerSeconds}
            timerRemaining={game.timerRemaining}
            correctCount={game.correctWords.length}
            tiltPermission={tiltPermission}
            onTick={() => dispatch({ type: 'TICK' })}
            onCorrect={handleCorrect}
            onSkip={handleSkip}
            onEndTurn={() => dispatch({ type: 'END_TURN' })}
          />
        </ForeheadOrientationLock>
      )}

      {game.phase === 'turnResults' && game.guesserName !== null && (
        <ForeheadOrientationLock target="portrait">
          <ForeheadTurnResultsScreen
            playerName={game.guesserName}
            turn={game.turn}
            turnCount={game.turnCount}
            correctWords={game.correctWords}
            skippedWords={game.skippedWords}
            onContinue={handleTurnContinue}
            onEndGame={handleEndGame}
          />
        </ForeheadOrientationLock>
      )}

      {game.phase === 'results' && (
        <ForeheadResultsScreen players={game.players} onPlayAgain={handleStart} onNewGame={handleEndGame} />
      )}
    </>
  );
}
