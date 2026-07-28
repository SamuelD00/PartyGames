import { useEffect, useRef, useState } from 'react';
import type { TiltPermission } from '../utils/tilt';

const TILT_THRESHOLD_DEG = 32;
const REARM_ZONE_DEG = 12;
// A reading past the threshold only counts once it's held continuously for this long — a quick
// flick or incidental jostle crosses the threshold for a single frame all the time, but a
// deliberate "yes"/"no" tilt is a held motion. Requiring the hold is what actually makes the
// gesture feel commit-to-trigger rather than easy to set off by accident.
const COMMIT_HOLD_MS = 180;
// After a tilt registers, ignore further tilts for this long — the bounce-back from the
// gesture that just fired (or overshoot into the opposite direction) would otherwise often
// trigger the next word immediately, which reads as the game "eating" a guess.
const TRIGGER_COOLDOWN_MS = 500;
// Slowly pulls the baseline toward wherever the phone is actually resting, but only while it's
// already near-neutral (never mid-gesture) — otherwise a turn spent gradually lowering your arm
// makes "up" easier to trigger than "down" by the end, which is what actually reads as the
// tilt being unreliable/confusing rather than a clean, consistent threshold.
const BASELINE_DRIFT_ALPHA = 0.03;
const DEBUG_UPDATE_INTERVAL_MS = 150;
// How long to wait for a real deviceorientation/deviceorientationabsolute reading before
// falling back to raw accelerometer data. Orientation events are smoother (OS-fused) so we
// prefer them, but budget Android phones without a gyroscope often never fire them at all.
const ORIENTATION_GRACE_MS = 1000;
const MOTION_SMOOTHING_ALPHA = 0.2;

type TiltSource = 'orientation' | 'motion';

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
function getOrientationTiltValue(event: DeviceOrientationEvent, screenAngle: number): number | null {
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

// Fallback for phones that never fire deviceorientation (typically: no gyroscope, so Chrome's
// fused "game rotation vector" sensor doesn't exist on that device). Every phone has a plain
// accelerometer, so we derive an equivalent tilt angle straight from the gravity vector instead
// — noisier than fused orientation, but universally available.
function getMotionTiltValue(event: DeviceMotionEvent, screenAngle: number): number | null {
  const g = event.accelerationIncludingGravity;
  if (!g || g.x === null || g.y === null || g.z === null) return null;
  const { x, y, z } = g;
  let a: number;
  switch (screenAngle) {
    case 90:
      a = -x;
      break;
    case 180:
      a = -y;
      break;
    case 270:
      a = x;
      break;
    default:
      a = y;
      break;
  }
  return Math.atan2(a, z) * (180 / Math.PI);
}

// Calibrates against whatever angle the phone happens to be at when the listener attaches
// (i.e. resting on the player's forehead), then fires once the tilt strays far enough from
// that baseline in either direction *and stays there* for COMMIT_HOLD_MS — a held, deliberate
// tilt, not a momentary spike. Requires the phone to come back near-neutral (and the cooldown
// to elapse) before it can fire again, so a single tilt doesn't register twice.
//
// Tries deviceorientation / deviceorientationabsolute first (smooth, OS-fused) and falls back
// to raw accelerometer data (devicemotion) if neither produces a reading within a short grace
// period — whichever source answers first is locked in for the rest of the turn so the two
// don't fight each other.
//
// `active` only flips true once a real sensor reading has arrived — permission being
// "granted" just means the browser exposes the API, not that a sensor is actually behind it
// (e.g. plain desktop Chrome), so callers should use `active` to decide whether to surface
// tilt controls versus falling back to on-screen buttons.
//
// `debugDelta` is a throttled (not per-event) live readout of the current tilt relative to
// baseline, in degrees — exposed so the UI can show it. Without a visible signal, "tilt isn't
// working" is otherwise a black box: this makes it obvious whether a sensor is producing *any*
// data at all versus producing data that just isn't crossing the threshold.
export function useForeheadTilt(permission: TiltPermission, onTiltUp: () => void, onTiltDown: () => void) {
  const onTiltUpRef = useRef(onTiltUp);
  const onTiltDownRef = useRef(onTiltDown);
  onTiltUpRef.current = onTiltUp;
  onTiltDownRef.current = onTiltDown;
  const [active, setActive] = useState(false);
  const [debugDelta, setDebugDelta] = useState<number | null>(null);
  const [source, setSource] = useState<TiltSource | null>(null);

  useEffect(() => {
    if (permission !== 'granted') {
      setActive(false);
      setDebugDelta(null);
      setSource(null);
      return;
    }

    const sourceRef = { current: null as TiltSource | null };
    const baselineRef = { current: null as number | null };
    const smoothedMotionRef = { current: null as number | null };
    const armedRef = { current: true };
    const lastDebugUpdateRef = { current: 0 };
    const lastTriggerAtRef = { current: 0 };
    const motionAllowedRef = { current: false };
    const pendingRef = { current: null as { direction: 'up' | 'down'; since: number } | null };

    const recalibrate = () => {
      baselineRef.current = null;
      smoothedMotionRef.current = null;
      armedRef.current = true;
      lastTriggerAtRef.current = 0;
      pendingRef.current = null;
    };

    const graceTimeout = window.setTimeout(() => {
      motionAllowedRef.current = true;
    }, ORIENTATION_GRACE_MS);

    const applyValue = (value: number) => {
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
        const direction: 'up' | 'down' | null =
          delta >= TILT_THRESHOLD_DEG ? 'up' : delta <= -TILT_THRESHOLD_DEG ? 'down' : null;

        if (direction === null) {
          pendingRef.current = null;
          if (Math.abs(delta) <= REARM_ZONE_DEG) {
            baselineRef.current += BASELINE_DRIFT_ALPHA * delta;
          }
        } else if (pendingRef.current?.direction !== direction) {
          pendingRef.current = { direction, since: now };
        } else if (now - pendingRef.current.since >= COMMIT_HOLD_MS) {
          armedRef.current = false;
          lastTriggerAtRef.current = now;
          pendingRef.current = null;
          (direction === 'up' ? onTiltUpRef : onTiltDownRef).current();
        }
      } else if (Math.abs(delta) <= REARM_ZONE_DEG && now - lastTriggerAtRef.current >= TRIGGER_COOLDOWN_MS) {
        armedRef.current = true;
      }
    };

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (sourceRef.current === 'motion') return;
      const value = getOrientationTiltValue(event, getScreenAngle());
      if (value === null) return;
      if (sourceRef.current === null) {
        sourceRef.current = 'orientation';
        setSource('orientation');
        window.clearTimeout(graceTimeout);
      }
      applyValue(value);
    };

    const handleMotion = (event: DeviceMotionEvent) => {
      if (sourceRef.current === 'orientation') return;
      if (sourceRef.current === null && !motionAllowedRef.current) return;
      const raw = getMotionTiltValue(event, getScreenAngle());
      if (raw === null) return;
      smoothedMotionRef.current =
        smoothedMotionRef.current === null
          ? raw
          : smoothedMotionRef.current + MOTION_SMOOTHING_ALPHA * (raw - smoothedMotionRef.current);
      if (sourceRef.current === null) {
        sourceRef.current = 'motion';
        setSource('motion');
      }
      applyValue(smoothedMotionRef.current);
    };

    window.addEventListener('deviceorientation', handleOrientation);
    // Some Android/Chrome builds only ever fire the "absolute" variant.
    window.addEventListener('deviceorientationabsolute', handleOrientation as EventListener);
    window.addEventListener('devicemotion', handleMotion);
    // If the OS rotates the screen mid-turn, beta/gamma jump even with the axis remap above
    // (the compensation only corrects for orientation *at the time of each reading* — the
    // reading right at the transition is unreliable). Recalibrating on rotation keeps a stuck
    // orientation from permanently breaking tilt for the rest of the turn.
    window.addEventListener('orientationchange', recalibrate);
    screen.orientation?.addEventListener?.('change', recalibrate);

    return () => {
      window.clearTimeout(graceTimeout);
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('deviceorientationabsolute', handleOrientation as EventListener);
      window.removeEventListener('devicemotion', handleMotion);
      window.removeEventListener('orientationchange', recalibrate);
      screen.orientation?.removeEventListener?.('change', recalibrate);
    };
  }, [permission]);

  return { active, debugDelta, source };
}
