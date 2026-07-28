import { useEffect, useRef, useState } from 'react';
import type { TiltPermission } from '../utils/tilt';

const TILT_THRESHOLD_DEG = 22;
const REARM_ZONE_DEG = 10;
const DEBUG_UPDATE_INTERVAL_MS = 150;

function getScreenAngle(): number {
  if (typeof screen !== 'undefined' && screen.orientation && typeof screen.orientation.angle === 'number') {
    return screen.orientation.angle;
  }
  // Legacy iOS Safari fallback: window.orientation is -90/0/90/180.
  const legacy = (window as unknown as { orientation?: number }).orientation;
  if (typeof legacy === 'number') return ((legacy % 360) + 360) % 360;
  return 0;
}

// beta/gamma are reported relative to the screen's current rotation, not the phone's physical
// "up". If the OS auto-rotates mid-turn (easy to trigger by accident with this exact gesture),
// raw beta stops meaning "tilt forward/back" — this remaps whichever axis currently represents
// that physical tilt back to a single consistent value.
function getTiltValue(event: DeviceOrientationEvent, screenAngle: number): number | null {
  const { beta, gamma } = event;
  if (beta === null || gamma === null) return null;
  switch (screenAngle) {
    case 90:
      return -gamma;
    case 180:
      return -beta;
    case 270:
      return gamma;
    default:
      return beta;
  }
}

// Calibrates against whatever angle the phone happens to be at when the listener attaches
// (i.e. resting on the player's forehead), then fires once the tilt strays far enough from
// that baseline in either direction. Requires the phone to come back near-neutral before it
// can fire again, so a single tilt doesn't register twice.
//
// `active` only flips true once a real sensor reading has arrived — permission being
// "granted" just means the browser exposes the API, not that a gyroscope is actually behind
// it (e.g. plain desktop Chrome), so callers should use `active` to decide whether to surface
// tilt controls versus falling back to on-screen buttons.
//
// `debugDelta` is a throttled (not per-event) live readout of the current tilt relative to
// baseline, in degrees — exposed so the UI can show it. Without a visible signal, "tilt isn't
// working" is otherwise a black box: this makes it obvious whether the sensor is producing
// *any* data at all versus producing data that just isn't crossing the threshold.
export function useForeheadTilt(permission: TiltPermission, onTiltUp: () => void, onTiltDown: () => void) {
  const onTiltUpRef = useRef(onTiltUp);
  const onTiltDownRef = useRef(onTiltDown);
  onTiltUpRef.current = onTiltUp;
  onTiltDownRef.current = onTiltDown;
  const [active, setActive] = useState(false);
  const [debugDelta, setDebugDelta] = useState<number | null>(null);

  useEffect(() => {
    if (permission !== 'granted') {
      setActive(false);
      setDebugDelta(null);
      return;
    }

    const baselineRef = { current: null as number | null };
    const armedRef = { current: true };
    const lastDebugUpdateRef = { current: 0 };

    const recalibrate = () => {
      baselineRef.current = null;
      armedRef.current = true;
    };

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const value = getTiltValue(event, getScreenAngle());
      if (value === null) return;
      if (baselineRef.current === null) {
        baselineRef.current = value;
        setActive(true);
        setDebugDelta(0);
        return;
      }
      const delta = value - baselineRef.current;

      const now = Date.now();
      if (now - lastDebugUpdateRef.current >= DEBUG_UPDATE_INTERVAL_MS) {
        lastDebugUpdateRef.current = now;
        setDebugDelta(Math.round(delta));
      }

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
    // If the OS rotates the screen mid-turn, beta/gamma jump even with the axis remap above
    // (the compensation only corrects for orientation *at the time of each reading* — the
    // reading right at the transition is unreliable). Recalibrating on rotation keeps a stuck
    // orientation from permanently breaking tilt for the rest of the turn.
    window.addEventListener('orientationchange', recalibrate);
    screen.orientation?.addEventListener?.('change', recalibrate);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('orientationchange', recalibrate);
      screen.orientation?.removeEventListener?.('change', recalibrate);
    };
  }, [permission]);

  return { active, debugDelta };
}
