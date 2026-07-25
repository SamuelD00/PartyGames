import { useState } from 'react';
import { GAMES } from './data/games';
import { ImpostorApp } from './ImpostorApp';
import { MobApp } from './MobApp';
import { MimicApp } from './MimicApp';
import { LanguageToggle } from './components/LanguageToggle';
import { ThemeToggle } from './components/ThemeToggle';
import { PoweredByFooter } from './components/PoweredByFooter';
import './App.css';

function App() {
  const [activeGameId, setActiveGameId] = useState('impostor');

  return (
    <>
      <div className="top-controls">
        <ThemeToggle />
        <LanguageToggle />
      </div>
      <PoweredByFooter />

      {activeGameId === 'impostor' && (
        <ImpostorApp games={GAMES} activeGameId={activeGameId} onSwitchGame={setActiveGameId} />
      )}

      {activeGameId === 'mob' && (
        <MobApp games={GAMES} activeGameId={activeGameId} onSwitchGame={setActiveGameId} />
      )}

      {activeGameId === 'mimic' && (
        <MimicApp games={GAMES} activeGameId={activeGameId} onSwitchGame={setActiveGameId} />
      )}
    </>
  );
}

export default App;
