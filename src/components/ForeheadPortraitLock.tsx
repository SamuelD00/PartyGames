import type { CSSProperties, ReactNode } from 'react';
import { useScreenAngle } from '../hooks/useScreenAngle';
import './ForeheadPortraitLock.css';

interface ForeheadPortraitLockProps {
  children: ReactNode;
}

// Forces whatever's inside to keep rendering upright in portrait even if the OS auto-rotates
// the screen — which this game's tilt gesture triggers easily. Counter-rotates by exactly the
// angle the OS reports (screen.orientation.angle), so it's correct regardless of which way the
// phone was turned, rather than guessing a fixed direction from a `landscape` media query.
export function ForeheadPortraitLock({ children }: ForeheadPortraitLockProps) {
  const angle = useScreenAngle();

  if (angle === 0) return <>{children}</>;

  const swapped = angle === 90 || angle === 270;
  const innerStyle: CSSProperties = {
    width: swapped ? '100vh' : '100%',
    height: swapped ? '100vw' : '100%',
    transform: `rotate(${-angle}deg)`,
  };

  return (
    <div className="forehead-portrait-lock-outer">
      <div className="forehead-portrait-lock-inner" style={innerStyle}>
        {children}
      </div>
    </div>
  );
}
