import type { CSSProperties, ReactNode } from 'react';
import { useIsLandscape } from '../hooks/useIsLandscape';
import './ForeheadLandscapeLock.css';

interface ForeheadLandscapeLockProps {
  children: ReactNode;
}

// Forces landscape presentation for the pass-off/countdown/guessing screens, which are meant
// to be held sideways against your forehead. Most phones stay portrait by default and this
// gesture doesn't reliably trigger the OS's own auto-rotate, so instead of waiting on that,
// this rotates the content itself — it goes landscape the moment these screens mount,
// regardless of which way the phone is physically held.
export function ForeheadLandscapeLock({ children }: ForeheadLandscapeLockProps) {
  const isLandscape = useIsLandscape();

  if (isLandscape) return <>{children}</>;

  const innerStyle: CSSProperties = {
    width: '100vh',
    height: '100vw',
    transform: 'rotate(90deg)',
  };

  return (
    <div className="forehead-landscape-lock-outer">
      <div className="forehead-landscape-lock-inner" style={innerStyle}>
        {children}
      </div>
    </div>
  );
}
