// Best-effort supplement to the CSS portrait-lock trick (ForeheadPortraitLock.css), which does
// the real work. The Screen Orientation API is unsupported in iOS Safari entirely and often
// needs fullscreen elsewhere, so failures here are expected and silently ignored.
export async function lockPortrait(): Promise<void> {
  try {
    await screen.orientation?.lock?.('portrait');
  } catch {
    // Unsupported or refused — the CSS fallback still keeps the layout usable.
  }
}

export function unlockOrientation(): void {
  try {
    screen.orientation?.unlock?.();
  } catch {
    // No-op if unsupported.
  }
}
