export type TiltPermission = 'granted' | 'denied' | 'unsupported';

interface RequestPermissionCtor {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

// Must be called synchronously from within a user-gesture event handler (e.g. a button's
// onClick) — iOS Safari rejects the permission prompt if it's requested any other way.
//
// iOS gates DeviceOrientationEvent and DeviceMotionEvent behind *separate* permission prompts.
// We use orientation as the primary tilt source and motion (raw accelerometer) as a fallback
// for phones that don't fire orientation events at all (common on budget Android devices
// without a gyroscope), so both need to be requested up front.
export async function requestTiltPermission(): Promise<TiltPermission> {
  const orientationCtor = window.DeviceOrientationEvent as unknown as RequestPermissionCtor | undefined;
  const motionCtor = window.DeviceMotionEvent as unknown as RequestPermissionCtor | undefined;

  const hasOrientationPrompt = typeof orientationCtor?.requestPermission === 'function';
  const hasMotionPrompt = typeof motionCtor?.requestPermission === 'function';

  if (!hasOrientationPrompt && !hasMotionPrompt) {
    if (typeof window.DeviceOrientationEvent !== 'undefined' || typeof window.DeviceMotionEvent !== 'undefined') {
      return 'granted';
    }
    return 'unsupported';
  }

  try {
    const [orientationResult, motionResult] = await Promise.all([
      hasOrientationPrompt ? orientationCtor!.requestPermission!() : Promise.resolve('granted' as const),
      hasMotionPrompt ? motionCtor!.requestPermission!() : Promise.resolve('granted' as const),
    ]);
    return orientationResult === 'granted' || motionResult === 'granted' ? 'granted' : 'denied';
  } catch {
    return 'denied';
  }
}
