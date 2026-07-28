import { useEffect, useState } from 'react';

function computeIsLandscape(): boolean {
  return window.innerWidth > window.innerHeight;
}

// Purely shape-based (wide vs. tall), not tied to screen.orientation.angle — angle is relative
// to whatever the device considers its "natural" orientation, which is portrait on phones but
// landscape on desktop monitors, so angle alone can't tell you which way things currently look.
export function useIsLandscape(): boolean {
  const [isLandscape, setIsLandscape] = useState(computeIsLandscape);

  useEffect(() => {
    const update = () => setIsLandscape(computeIsLandscape());
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    screen.orientation?.addEventListener?.('change', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      screen.orientation?.removeEventListener?.('change', update);
    };
  }, []);

  return isLandscape;
}
