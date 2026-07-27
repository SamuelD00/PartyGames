export type TiltPermission = 'granted' | 'denied' | 'unsupported';

interface DeviceOrientationEventWithPermission {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

// Must be called synchronously from within a user-gesture event handler (e.g. a button's
// onClick) — iOS Safari rejects the permission prompt if it's requested any other way.
export async function requestTiltPermission(): Promise<TiltPermission> {
  const ctor = window.DeviceOrientationEvent as unknown as DeviceOrientationEventWithPermission | undefined;
  if (typeof ctor?.requestPermission === 'function') {
    try {
      const result = await ctor.requestPermission();
      return result === 'granted' ? 'granted' : 'denied';
    } catch {
      return 'denied';
    }
  }
  if (typeof window.DeviceOrientationEvent !== 'undefined') return 'granted';
  return 'unsupported';
}
