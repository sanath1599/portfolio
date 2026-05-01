// Persists within the Node.js process across requests (Next.js Node runtime)
const FALLBACK_MS = (1 * 60 + 59) * 60 * 1000; // 1h 59m

let nimFallbackUntil: number | null = null;

export function isNimFallbackActive(): boolean {
  if (nimFallbackUntil === null) return false;
  if (Date.now() >= nimFallbackUntil) {
    nimFallbackUntil = null;
    return false;
  }
  return true;
}

export function activateNimFallback(): void {
  nimFallbackUntil = Date.now() + FALLBACK_MS;
}
