import { useState } from 'react';
import { GAMES } from './data/games';
import { ImpostorApp } from './ImpostorApp';
import { MobApp } from './MobApp';
import { LanguageToggle } from './components/LanguageToggle';
import { PoweredByFooter } from './components/PoweredByFooter';

function App() {
  const [activeGameId, setActiveGameId] = useState('impostor');

  return (
    <>
      <LanguageToggle />
      <PoweredByFooter />

      {activeGameId === 'impostor' && (
        <ImpostorApp games={GAMES} activeGameId={activeGameId} onSwitchGame={setActiveGameId} />
      )}

      {activeGameId === 'mob' && (
        <MobApp games={GAMES} activeGameId={activeGameId} onSwitchGame={setActiveGameId} />
      )}
    </>
  );
}

export default App;
