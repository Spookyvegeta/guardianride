let torchStream: MediaStream | null = null;

async function getTorchTrack(): Promise<MediaStreamTrack | null> {
  try {
    if (!torchStream) {
      torchStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
    }
    return torchStream.getVideoTracks()[0] ?? null;
  } catch {
    return null;
  }
}

export async function setFlashlight(on: boolean): Promise<void> {
  try {
    const track = await getTorchTrack();
    if (!track) return;
    await (track as any).applyConstraints({ advanced: [{ torch: on }] });
  } catch {
    // torch not supported on this device — silently fail
  }
}

export async function flashlightBurst(times = 6, intervalMs = 300): Promise<void> {
  for (let i = 0; i < times; i++) {
    await setFlashlight(i % 2 === 0);
    await new Promise(r => setTimeout(r, intervalMs));
  }
  await setFlashlight(false);
}

export function stopFlashlight(): void {
  if (torchStream) {
    torchStream.getTracks().forEach(t => t.stop());
    torchStream = null;
  }
}
