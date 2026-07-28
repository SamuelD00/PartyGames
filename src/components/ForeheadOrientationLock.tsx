import type { CSSProperties, ReactNode } from 'react';
import { useIsLandscape } from '../hooks/useIsLandscape';
import './ForeheadOrientationLock.css';

interface ForeheadOrientationLockProps {
  target: 'portrait' | 'landscape';
  children: ReactNode;
}

// Forces a specific presentation regardless of which way the phone is physically held, by
// rotating the content itself rather than waiting on (or fighting) the OS's own auto-rotate.
//
// Landscape is used for the pass-off/countdown/guessing screens, which are meant to be held
// sideways against your forehead — this gesture doesn't reliably trigger real auto-rotate, so
// it goes landscape the moment those screens mount instead of waiting for it.
//
// Portrait is used once the turn ends (time's up or manually ended): flipping back signals
// clearly that the round is over and it's safe to look at the phone normally again, without
// requiring the player to physically turn it back themselves first.
export function ForeheadOrientationLock({ target, children }: ForeheadOrientationLockProps) {
  const isLandscape = useIsLandscape();
  const needsRotation = target === 'landscape' ? !isLandscape : isLandscape;

  if (!needsRotation) return <>{children}</>;

  const innerStyle: CSSProperties = {
    width: '100vh',
    height: '100vw',
    transform: 'rotate(90deg)',
  };

  return (
    <div className="forehead-orientation-lock-outer">
      <div className="forehead-orientation-lock-inner" style={innerStyle}>
        {children}
      </div>
    </div>
  );
}
