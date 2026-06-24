// Fix 4 — Customization panel: toggle button + auto-open on first visit.
//
// New component. A gear button (with a one-time "Customize" hint label) that
// opens a slide-in dropdown containing:
//   - a font-size selector (small / medium / large) applied to the code pane, and
//   - an "auto-advance to next snippet on finish" toggle (default: off).
// State for the actual settings lives in the parent (SoloGame); this component
// owns only its open/closed and first-visit presentation state.
//
// First-visit behaviour: if the `coderacer_customization_seen` localStorage flag
// is absent, the panel auto-opens for 3 seconds then closes, and the hint label
// is shown. The flag is then set so every later visit starts closed with no hint.
//
// CHANGE LOG (Fix 3 — Code Style settings):
//   - Added a "Code Style" section bound to the persisted CodeStylePrefs:
//     Setting A (space before parens), Setting B (naming convention), and
//     Setting C (auto-close brackets), with an inline kebab-case warning.

import { useEffect, useState } from 'react'
import type { CodeStylePrefs, Naming } from '../lib/prefs'

export type CodeFontSize = 'small' | 'medium' | 'large'

const SEEN_KEY = 'coderacer_customization_seen'

const FONT_OPTIONS: { id: CodeFontSize; label: string }[] = [
  { id: 'small', label: 'Small' },
  { id: 'medium', label: 'Medium' },
  { id: 'large', label: 'Large' },
]

const NAMING_OPTIONS: { id: Naming; label: string }[] = [
  { id: 'original', label: 'Original' },
  { id: 'snake', label: 'snake_case' },
  { id: 'camel', label: 'camelCase' },
  { id: 'pascal', label: 'PascalCase' },
  { id: 'kebab', label: 'kebab-case' },
]

interface CustomizationPanelProps {
  fontSize: CodeFontSize
  onFontSize: (size: CodeFontSize) => void
  autoAdvance: boolean
  onAutoAdvance: (next: boolean) => void
  prefs: CodeStylePrefs
  onPrefs: (next: CodeStylePrefs) => void
  /** Current language display name (for the kebab-case warning). */
  languageName: string
}

export function CustomizationPanel({
  fontSize,
  onFontSize,
  autoAdvance,
  onAutoAdvance,
  prefs,
  onPrefs,
  languageName,
}: CustomizationPanelProps) {
  const [open, setOpen] = useState(false)
  // Hint is shown only until the user has seen the panel once.
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    let seen = false
    try {
      seen = localStorage.getItem(SEEN_KEY) === '1'
    } catch {
      seen = false
    }
    if (seen) return

    // First visit: reveal the panel briefly so new users discover it, then mark
    // it seen so this never happens again.
    setShowHint(true)
    setOpen(true)
    try {
      localStorage.setItem(SEEN_KEY, '1')
    } catch {
      // Ignore storage failures (private mode, quota, etc.).
    }
    const closeId = window.setTimeout(() => setOpen(false), 3000)
    const hintId = window.setTimeout(() => setShowHint(false), 4000)
    return () => {
      window.clearTimeout(closeId)
      window.clearTimeout(hintId)
    }
  }, [])

  return (
    <div className={'customize' + (open ? ' open' : '')}>
      {showHint && !open && <span className="customize-hint">Customize</span>}
      <button
        className="customize-gear"
        onClick={() => {
          setShowHint(false)
          setOpen((v) => !v)
        }}
        aria-expanded={open}
        aria-label="Customization settings"
        title="Customization"
      >
        <span aria-hidden="true">&#9881;</span>
      </button>

      {open && (
        <div className="customize-panel" role="dialog" aria-label="Customization">
          <div className="customize-section">
            <span className="customize-section-label">Code font size</span>
            <div className="customize-fonts">
              {FONT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  className={'customize-font' + (fontSize === opt.id ? ' selected' : '')}
                  aria-pressed={fontSize === opt.id}
                  onClick={() => onFontSize(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <label className="customize-toggle">
            <input
              type="checkbox"
              checked={autoAdvance}
              onChange={(e) => onAutoAdvance(e.target.checked)}
            />
            <span>Auto-advance to next snippet on finish</span>
          </label>

          <div className="customize-divider" />

          <div className="customize-section">
            <span className="customize-section-label">Code style</span>

            {/* Setting A */}
            <label className="customize-toggle">
              <input
                type="checkbox"
                checked={prefs.spaceBeforeParen}
                onChange={(e) => onPrefs({ ...prefs, spaceBeforeParen: e.target.checked })}
              />
              <span>Space before ( )</span>
            </label>

            {/* Setting B */}
            <span className="customize-sub-label">Naming convention</span>
            <div className="customize-naming">
              {NAMING_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  className={'customize-naming-opt' + (prefs.naming === opt.id ? ' selected' : '')}
                  aria-pressed={prefs.naming === opt.id}
                  onClick={() => onPrefs({ ...prefs, naming: opt.id })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {prefs.naming === 'kebab' && (
              <p className="customize-warn">
                Kebab-case is not valid in {languageName} — for practice only.
              </p>
            )}

            {/* Setting C */}
            <label className="customize-toggle">
              <input
                type="checkbox"
                checked={prefs.autoCloseBrackets}
                onChange={(e) => onPrefs({ ...prefs, autoCloseBrackets: e.target.checked })}
              />
              <span>Auto-close brackets</span>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}
