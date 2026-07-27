import { useEffect, useRef, useState } from 'react';
import type { TiltPermission } from '../utils/tilt';

const TILT_THRESHOLD_DEG = 28;
const REARM_ZONE_DEG = 12;

// Calibrates against whatever angle the phone happens to be at when the listener attaches
// (i.e. resting on the player's forehead), then fires once the tilt strays far enough from
// that baseline in either direction. Requires the phone to come back near-neutral before it
// can fire again, so a single tilt doesn't register twice.
//
// `active` only flips true once a real sensor reading has arrived — permission being
// "granted" just means the browser exposes the API, not that a gyroscope is actually behind
// it (e.g. plain desktop Chrome), so callers should use `active` to decide whether to surface
// tilt controls versus falling back to on-screen buttons.
export function useForeheadTilt(permission: TiltPermission, onTiltUp: () => void, onTiltDown: () => void) {
  const onTiltUpRef = useRef(onTiltUp);
  const onTiltDownRef = useRef(onTiltDown);
  onTiltUpRef.current = onTiltUp;
  onTiltDownRef.current = onTiltDown;
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (permission !== 'granted') {
      setActive(false);
      return;
    }

    const baselineRef = { current: null as number | null };
    const armedRef = { current: true };

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta === null) return;
      if (baselineRef.current === null) {
        baselineRef.current = event.beta;
        setActive(true);
        return;
      }
      const delta = event.beta - baselineRef.current;

      if (armedRef.current) {
        if (delta >= TILT_THRESHOLD_DEG) {
          armedRef.current = false;
          onTiltUpRef.current();
        } else if (delta <= -TILT_THRESHOLD_DEG) {
          armedRef.current = false;
          onTiltDownRef.current();
        }
      } else if (Math.abs(delta) <= REARM_ZONE_DEG) {
        armedRef.current = true;
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [permission]);

  return { active };
}
