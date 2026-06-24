// Fix 3 — Programmer customization settings (persistence).
//
// New file. Reads/writes the three "Code Style" settings under the single
// localStorage key `coderacer_prefs` as a JSON object. Loaded once at app
// startup and re-applied to every snippet load immediately (no page refresh):
//   - spaceBeforeParen (Setting A) — insert a space before call parens.
//   - naming           (Setting B) — identifier naming convention.
//   - autoCloseBrackets(Setting C) — auto-skip matching closing brackets/quotes.

export type Naming = 'original' | 'snake' | 'camel' | 'pascal' | 'kebab'

export interface CodeStylePrefs {
  spaceBeforeParen: boolean
  naming: Naming
  autoCloseBrackets: boolean
}

const KEY = 'coderacer_prefs'

const NAMINGS: Naming[] = ['original', 'snake', 'camel', 'pascal', 'kebab']

export const DEFAULT_PREFS: CodeStylePrefs = {
  spaceBeforeParen: false,
  naming: 'original',
  autoCloseBrackets: true,
}

export function loadPrefs(): CodeStylePrefs {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT_PREFS }
    const p = JSON.parse(raw) as Partial<CodeStylePrefs>
    return {
      spaceBeforeParen:
        typeof p.spaceBeforeParen === 'boolean' ? p.spaceBeforeParen : DEFAULT_PREFS.spaceBeforeParen,
      naming: p.naming && NAMINGS.includes(p.naming) ? p.naming : DEFAULT_PREFS.naming,
      autoCloseBrackets:
        typeof p.autoCloseBrackets === 'boolean' ? p.autoCloseBrackets : DEFAULT_PREFS.autoCloseBrackets,
    }
  } catch {
    return { ...DEFAULT_PREFS }
  }
}

export function savePrefs(prefs: CodeStylePrefs): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs))
  } catch {
    // Ignore storage failures (private mode, quota, etc.).
  }
}
