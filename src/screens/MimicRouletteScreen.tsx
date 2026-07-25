import { useLayoutEffect, useRef, useState } from 'react';
import type { MimicPlayer } from '../types/mimic';
import { useLanguage } from '../i18n/LanguageContext';
import { IconMimic } from '../components/icons';
import { shuffle } from '../utils/shuffle';
import './RevealScreen.css';
import './GodRouletteScreen.css';
import './MimicRouletteScreen.css';

interface MimicRouletteScreenProps {
  players: MimicPlayer[];
  resultId: string;
  round: number;
  onDone: () => void;
}

const CARD_WIDTH = 128;
const CARD_GAP = 20;
const CARD_STEP = CARD_WIDTH + CARD_GAP;
const MIN_REEL_ITEMS = 80;
const TRAILING_BUFFER = 6;
const OVERSHOOT_PX = 18;
const SPIN_DURATION_MS = 8000;

type Phase = 'idle' | 'spin' | 'settle' | 'done';

function buildReel(players: MimicPlayer[], winner: MimicPlayer): { reel: MimicPlayer[]; winningIndex: number } {
  const repeats = Math.max(6, Math.ceil(MIN_REEL_ITEMS / players.length));
  const items: MimicPlayer[] = [];
  for (let i = 0; i < repeats; i++) items.push(...shuffle(players));
  const targetIndex = items.length - TRAILING_BUFFER - Math.floor(Math.random() * 3);
  items[targetIndex] = winner;
  return { reel: items, winningIndex: targetIndex };
}

interface RouletteReelProps {
  players: MimicPlayer[];
  winner: MimicPlayer;
  onLanded: () => void;
}

function RouletteReel({ players, winner, onLanded }: RouletteReelProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const targetOffsetRef = useRef(0);
  const pendingFramesRef = useRef<number[]>([]);
  const [{ reel, winningIndex }] = useState(() => buildReel(players, winner));
  const [phase, setPhase] = useState<Phase>('idle');
  const [offset, setOffset] = useState(0);

  useLayoutEffect(() => {
    const raf1 = requestAnimationFrame(() => {
      setPhase('spin');
      const raf2 = requestAnimationFrame(() => {
        const viewportWidth = viewportRef.current?.offsetWidth ?? 0;
        const target = winningIndex * CARD_STEP + CARD_WIDTH / 2 - viewportWidth / 2;
        targetOffsetRef.current = target;
        setOffset(target + OVERSHOOT_PX);
      });
      pendingFramesRef.current.push(raf2);
    });
    pendingFramesRef.current.push(raf1);
    return () => {
      pendingFramesRef.current.forEach((id) => cancelAnimationFrame(id));
      pendingFramesRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTransitionEnd = () => {
    if (phase === 'spin') {
      setPhase('settle');
      setOffset(targetOffsetRef.current);
    } else if (phase === 'settle') {
      setPhase('done');
      onLanded();
    }
  };

  const landed = phase === 'done';

  return (
    <div className="roulette-viewport" ref={viewportRef}>
      <div className="roulette-pointer" />
      <div
        className={`roulette-track phase-${phase}`}
        style={{
          transform: `translateX(${-offset}px)`,
          transitionDuration: phase === 'spin' ? `${SPIN_DURATION_MS}ms` : undefined,
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {reel.map((p, i) => (
          <div key={i} className={`roulette-card${i === winningIndex && landed ? ' winner' : ''}`}>
            <IconMimic size={26} className="roulette-card-icon" />
            <span className="roulette-card-name">{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MimicRouletteScreen({ players, resultId, round, onDone }: MimicRouletteScreenProps) {
  const { t } = useLanguage();
  const [winner] = useState<MimicPlayer>(() => players.find((p) => p.id === resultId) ?? players[0]);
  const [landed, setLanded] = useState(false);

  return (
    <div className="screen reveal-screen roulette-screen">
      <p className="reveal-progress">{t('mimicRoulette.progress', { n: round })}</p>

      <RouletteReel players={players} winner={winner} onLanded={() => setLanded(true)} />

      {landed && (
        <div className="reveal-card card mimic-roulette-card">
          <IconMimic size={40} className="mimic-roulette-icon" />
          <span className="reveal-badge mimic-roulette-badge">{t('mimicRoulette.badge')}</span>
          <h2>{t('mimicRoulette.result', { name: winner.name })}</h2>
        </div>
      )}

      {landed && (
        <button type="button" className="btn-primary next-btn" onClick={onDone}>
          {t('discussion.continue')}
        </button>
      )}
    </div>
  );
}
