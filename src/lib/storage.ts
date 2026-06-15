// Best-WPM persistence, keyed by `${algorithmId}:${languageId}`.

const STORAGE_KEY = 'code-racer:best-wpm'

export type Bests = Record<string, number>

export function bestKey(algorithmId: string, languageId: string): string {
  return `${algorithmId}:${languageId}`
}

export function loadBests(): Bests {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as Bests) : {}
  } catch {
    return {}
  }
}

/**
 * Record a result if it beats the stored best. Returns the updated map and
 * whether a new record was set.
 */
export function recordBest(
  bests: Bests,
  key: string,
  wpm: number,
): { bests: Bests; isRecord: boolean } {
  const previous = bests[key]
  if (previous != null && wpm <= previous) {
    return { bests, isRecord: false }
  }
  const next = { ...bests, [key]: wpm }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Ignore storage failures (private mode, quota, etc.).
  }
  return { bests: next, isRecord: true }
}
