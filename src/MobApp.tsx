import { useReducer, useState } from 'react';
import { mobReducer, initialMobGameState } from './state/mobReducer';
import type { MobGameSetup } from './types/mob';
import type { GameDescriptor } from './data/games';
import { MobSetupScreen } from './screens/MobSetupScreen';
import { GodRouletteScreen } from './screens/GodRouletteScreen';
import { MobRevealScreen } from './screens/MobRevealScreen';
import { MobNightScreen } from './screens/MobNightScreen';
import { MobNightResultScreen } from './screens/MobNightResultScreen';
import { MobDiscussionScreen } from './screens/MobDiscussionScreen';
import { MobResultsScreen } from './screens/MobResultsScreen';
import { useLanguage } from './i18n/LanguageContext';
import { pickRandom } from './utils/shuffle';

const MIN_TOTAL_PLAYERS = 4;

const DEFAULT_SETUP: MobGameSetup = {
  players: [],
  godId: null,
  mobCount: 1,
  detectiveEnabled: true,
  doctorEnabled: true,
  timerSeconds: null,
};

interface MobAppProps {
  games: GameDescriptor[];
  activeGameId: string;
  onSwitchGame: (id: string) => void;
}

export function MobApp({ games, activeGameId, onSwitchGame }: MobAppProps) {
  const [game, dispatch] = useReducer(mobReducer, initialMobGameState);
  const [setup, setSetup] = useState<MobGameSetup>(DEFAULT_SETUP);
  const [error, setError] = useState<string | null>(null);
  const [pendingGodRoll, setPendingGodRoll] = useState<{ godId: string } | null>(null);
  const { t } = useLanguage();

  const launchGame = (godId: string) => {
    dispatch({
      type: 'START_GAME',
      players: setup.players,
      godId,
      mobCount: setup.mobCount,
      detectiveEnabled: setup.detectiveEnabled,
      doctorEnabled: setup.doctorEnabled,
      timerSeconds: setup.timerSeconds,
    });
  };

  const startGame = () => {
    if (setup.players.length < MIN_TOTAL_PLAYERS) {
      setError(t('mobSetup.errorMinPlayers', { min: MIN_TOTAL_PLAYERS }));
      return;
    }
    setError(null);
    if (setup.godId) {
      launchGame(setup.godId);
      return;
    }
    setPendingGodRoll({ godId: pickRandom(setup.players).id });
  };

  return (
    <>
      {game.phase === 'setup' && !pendingGodRoll && (
        <MobSetupScreen
          setup={setup}
          onChange={(next) => {
            setSetup(next);
            setError(null);
          }}
          onStart={startGame}
          error={error}
          games={games}
          activeGameId={activeGameId}
          onSwitchGame={onSwitchGame}
        />
      )}

      {game.phase === 'setup' && pendingGodRoll && (
        <GodRouletteScreen
          players={setup.players}
          resultId={pendingGodRoll.godId}
          onDone={() => {
            const godId = pendingGodRoll.godId;
            setPendingGodRoll(null);
            launchGame(godId);
          }}
        />
      )}

      {game.phase === 'reveal' && (
        <MobRevealScreen
          players={game.players}
          revealOrder={game.revealOrder}
          revealIndex={game.revealIndex}
          godName={game.godName}
          onNext={() => dispatch({ type: 'NEXT_REVEAL' })}
        />
      )}

      {game.phase === 'night' && (
        <MobNightScreen
          players={game.players}
          nightStep={game.nightStep}
          round={game.round}
          onSubmitMob={(targetId) => dispatch({ type: 'NIGHT_SUBMIT_MOB', targetId })}
          onSubmitDoctor={(targetId) => dispatch({ type: 'NIGHT_SUBMIT_DOCTOR', targetId })}
          onDetectiveDone={() => dispatch({ type: 'NIGHT_STEP_DETECTIVE_DONE' })}
        />
      )}

      {game.phase === 'nightResult' && (
        <MobNightResultScreen
          round={game.round}
          death={game.lastNightDeath}
          onContinue={() => dispatch({ type: 'NIGHT_RESULT_CONTINUE' })}
        />
      )}

      {game.phase === 'discussion' && (
        <MobDiscussionScreen
          players={game.players}
          round={game.round}
          timerSeconds={game.settings.timerSeconds}
          timerRemaining={game.timerRemaining}
          timerRunning={game.timerRunning}
          lastDayElimination={game.lastDayElimination}
          onTick={() => dispatch({ type: 'TICK' })}
          onToggleTimer={() => dispatch({ type: 'TOGGLE_TIMER' })}
          onPauseTimer={() => dispatch({ type: 'PAUSE_TIMER' })}
          onVote={(playerId) => dispatch({ type: 'DAY_VOTE', playerId })}
          onSkipVote={() => dispatch({ type: 'DAY_SKIP_VOTE' })}
          onDayResultContinue={() => dispatch({ type: 'DAY_RESULT_CONTINUE' })}
        />
      )}

      {game.phase === 'results' && (
        <MobResultsScreen
          players={game.players}
          godName={game.godName}
          winner={game.winner}
          onPlayAgain={startGame}
          onNewGame={() => dispatch({ type: 'RESET_TO_SETUP' })}
        />
      )}
    </>
  );
}
