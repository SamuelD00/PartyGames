// Best-effort supplement to the forced-rotation trick (ForeheadLandscapeLock), which does the
// real work. The Screen Orientation API is unsupported in iOS Safari entirely and often needs
// fullscreen elsewhere, so failures here are expected and silently ignored — this just lets the
// OS itself honor landscape (status bar included) on browsers where it's available.
export async function lockLandscape(): Promise<void> {
  try {
    await screen.orientation?.lock?.('landscape');
  } catch {
    // Unsupported or refused — the forced-rotation fallback still keeps it usable.
  }
}

export function unlockOrientation(): void {
  try {
    screen.orientation?.unlock?.();
  } catch {
    // No-op if unsupported.
  }
}
