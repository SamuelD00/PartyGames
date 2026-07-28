import { useEffect, useState } from 'react';

function getScreenAngle(): number {
  if (typeof screen !== 'undefined' && screen.orientation && typeof screen.orientation.angle === 'number') {
    return screen.orientation.angle;
  }
  // Legacy iOS Safari fallback: window.orientation is -90/0/90/180.
  const legacy = (window as unknown as { orientation?: number }).orientation;
  if (typeof legacy === 'number') return ((legacy % 360) + 360) % 360;
  return 0;
}

// Tracks the OS's current screen rotation (0/90/180/270) so UI can compensate when the device
// auto-rotates out from under a portrait-only screen.
export function useScreenAngle(): number {
  const [angle, setAngle] = useState(getScreenAngle);

  useEffect(() => {
    const update = () => setAngle(getScreenAngle());
    window.addEventListener('orientationchange', update);
    window.addEventListener('resize', update);
    screen.orientation?.addEventListener?.('change', update);
    return () => {
      window.removeEventListener('orientationchange', update);
      window.removeEventListener('resize', update);
      screen.orientation?.removeEventListener?.('change', update);
    };
  }, []);

  return angle;
}
