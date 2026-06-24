// CHANGE LOG (this file wires up Fixes 2, 3, 4, and 5):
//   - Fix 2: renders <AlgorithmInfo> for the selected algorithm above the editor.
//   - Fix 3: keeps a per-session race log + personal-best baseline in state and
//     feeds <StatsLog> (collapsible panel below the Hud). Data clears on reload.
//   - Fix 4: holds code font-size + "auto-advance on finish" settings, renders
//     <CustomizationPanel>, applies the font size to the editor, and (when the
//     toggle is on) advances to the next snippet shortly after a race ends.
//   - Fix 3 (Code Style): loads/persists CodeStylePrefs, transforms the snippet
//     (space-before-paren + naming convention) before the typing engine, and
//     forwards the auto-close-brackets setting to the engine. Switching back to
//     defaults re-derives the original snippet from snippets.ts (never mutated).
//   - Fix 5: the completion side effects now run in a single useLayoutEffect that
//     consolidates record-keeping into one `result` snapshot set BEFORE paint,
//     and the ResultsScreen is only mounted once that snapshot exists. This makes
//     the results screen render exactly once (no second-render flash from a
//     late isRecord/best update). React StrictMode is untouched.

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  ALGORITHMS,
  LANGUAGES,
  filenameFor,
  getAlgorithm,
  getLanguage,
  type LanguageId,
} from '../data/snippets'
import { bestKey, loadBests, recordBest, type Bests } from '../lib/storage'
import { loadPrefs, savePrefs, type CodeStylePrefs } from '../lib/prefs'
import { transformSnippet } from '../lib/codeStyle'
import { useTypingEngine } from '../hooks/useTypingEngine'
import { SelectorBar } from './SelectorBar'
import { AlgorithmInfo } from './AlgorithmInfo'
import { EditorWindow } from './EditorWindow'
import { Hud } from './Hud'
import { StatsLog, type SessionLogEntry } from './StatsLog'
import { Controls } from './Controls'
import { CustomizationPanel, type CodeFontSize } from './CustomizationPanel'
import { ResultsScreen } from './ResultsScreen'

interface SoloGameProps {
  /** Called with final stats when a run completes (used to offer DB submit). */
  onComplete?: (result: {
    algorithmId: string
    languageId: LanguageId
    wpm: number
    accuracy: number
    errors: number
    timeMs: number
  }) => void
}

/** Snapshot of a finished race, computed once so the results screen is stable. */
interface RaceResult {
  isRecord: boolean
  best: number | undefined
}

export function SoloGame({ onComplete }: SoloGameProps) {
  const [selectedAlgoId, setSelectedAlgoId] = useState(ALGORITHMS[0].id)
  const [selectedLangId, setSelectedLangId] = useState<LanguageId>('python')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [bests, setBests] = useState<Bests>(() => loadBests())
  const [result, setResult] = useState<RaceResult | null>(null)
  const [focused, setFocused] = useState(false)

  // Fix 3 — per-session log (cleared on reload). Personal-best baseline is
  // captured once at mount so "beats your best" stays meaningful as you play.
  const [sessionLog, setSessionLog] = useState<SessionLogEntry[]>([])
  const [personalBest] = useState<number | undefined>(() => {
    const vals = Object.values(loadBests())
    return vals.length ? Math.max(...vals) : undefined
  })

  // Fix 4 — customization settings.
  const [fontSize, setFontSize] = useState<CodeFontSize>('medium')
  const [autoAdvance, setAutoAdvance] = useState(false)

  // Fix 3 — code-style prefs (persisted to localStorage, applied immediately).
  const [prefs, setPrefs] = useState<CodeStylePrefs>(() => loadPrefs())
  const updatePrefs = useCallback((next: CodeStylePrefs) => {
    setPrefs(next)
    savePrefs(next)
  }, [])

  const inputRef = useRef<HTMLInputElement>(null)
  const recordedRef = useRef(false)
  const logIdRef = useRef(0)
  const autoAdvanceTimer = useRef<number | null>(null)

  const visibleAlgorithms = useMemo(
    () => ALGORITHMS.filter((a) => showAdvanced || !a.advanced),
    [showAdvanced],
  )

  const algo = getAlgorithm(selectedAlgoId)
  const lang = getLanguage(selectedLangId)
  const filename = filenameFor(algo, lang)
  const key = bestKey(algo.id, lang.id)
  const best = bests[key]

  // Fix 3 — apply Settings A & B to a transformed copy of the snippet (the
  // source in snippets.ts is never mutated, so 'Original' re-derives cleanly).
  const code = useMemo(
    () => transformSnippet(algo.impls[lang.id], lang.tokLang, prefs),
    [algo, lang.id, lang.tokLang, prefs],
  )

  const engine = useTypingEngine(code, lang.tokLang, { autoClose: prefs.autoCloseBrackets })

  const focusInput = useCallback(() => {
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [])

  useEffect(() => {
    focusInput()
  }, [focusInput])

  const selectAlgo = useCallback(
    (id: string) => {
      setSelectedAlgoId(id)
      focusInput()
    },
    [focusInput],
  )

  const selectLang = useCallback(
    (id: LanguageId) => {
      setSelectedLangId(id)
      focusInput()
    },
    [focusInput],
  )

  const toggleAdvanced = useCallback(
    (next: boolean) => {
      setShowAdvanced(next)
      if (!next && getAlgorithm(selectedAlgoId).advanced) {
        setSelectedAlgoId(ALGORITHMS[0].id)
      }
      focusInput()
    },
    [selectedAlgoId, focusInput],
  )

  const restart = useCallback(() => {
    engine.reset()
    focusInput()
  }, [engine, focusInput])

  const next = useCallback(() => {
    const list = visibleAlgorithms
    const idx = list.findIndex((a) => a.id === selectedAlgoId)
    const nextAlgo = list[(idx + 1) % list.length]
    setSelectedAlgoId(nextAlgo.id)
    focusInput()
  }, [visibleAlgorithms, selectedAlgoId, focusInput])

  const random = useCallback(() => {
    const list = visibleAlgorithms
    const nextAlgo = list[Math.floor(Math.random() * list.length)]
    const nextLang = LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)]
    setSelectedAlgoId(nextAlgo.id)
    setSelectedLangId(nextLang.id)
    focusInput()
  }, [visibleAlgorithms])

  // Fix 5 — record the result and build the ResultsScreen snapshot in a single
  // pre-paint effect. The screen is gated on `result` (see below), so it mounts
  // exactly once, already showing the final best/record state — no flash.
  useLayoutEffect(() => {
    if (!engine.isComplete) {
      recordedRef.current = false
      setResult(null)
      if (autoAdvanceTimer.current != null) {
        window.clearTimeout(autoAdvanceTimer.current)
        autoAdvanceTimer.current = null
      }
      return
    }
    if (recordedRef.current) return
    recordedRef.current = true

    const wpm = Math.round(engine.stats.wpm)
    const accuracy = Math.round(engine.stats.accuracy * 100)
    const rec = recordBest(bests, key, wpm)
    setBests(rec.bests)
    setResult({ isRecord: rec.isRecord, best: rec.bests[key] })

    // Fix 3 — log this race (most recent first, capped at 10).
    setSessionLog((log) =>
      [
        { id: logIdRef.current++, algoName: algo.name, langName: lang.name, wpm, accuracy },
        ...log,
      ].slice(0, 10),
    )

    onComplete?.({
      algorithmId: algo.id,
      languageId: lang.id,
      wpm,
      accuracy,
      errors: engine.stats.errors,
      timeMs: Math.round(engine.stats.elapsedMs),
    })

    // Fix 4 — optionally roll on to the next snippet after a short pause.
    if (autoAdvance) {
      autoAdvanceTimer.current = window.setTimeout(() => {
        autoAdvanceTimer.current = null
        next()
      }, 1600)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.isComplete])

  useEffect(() => {
    if (!engine.isComplete) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        next()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [engine.isComplete, next])

  return (
    <>
      <SelectorBar
        algorithms={visibleAlgorithms}
        selectedAlgoId={selectedAlgoId}
        onSelectAlgo={selectAlgo}
        languages={LANGUAGES}
        selectedLangId={selectedLangId}
        onSelectLang={selectLang}
        showAdvanced={showAdvanced}
        onToggleAdvanced={toggleAdvanced}
      />

      <AlgorithmInfo algo={algo} />

      <EditorWindow
        filename={filename}
        langName={lang.name}
        engine={engine}
        inputRef={inputRef}
        focused={focused}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        fontSize={fontSize}
        results={
          result && (
            <ResultsScreen
              algoName={algo.name}
              langName={lang.name}
              stats={engine.stats}
              best={result.best}
              isRecord={result.isRecord}
              onRetry={restart}
              onNext={next}
            />
          )
        }
      />

      <Hud stats={engine.stats} best={best} />

      <StatsLog entries={sessionLog} personalBest={personalBest} />

      <div className="action-bar">
        <Controls onRestart={restart} onNext={next} onRandom={random} />
        <CustomizationPanel
          fontSize={fontSize}
          onFontSize={setFontSize}
          autoAdvance={autoAdvance}
          onAutoAdvance={setAutoAdvance}
          prefs={prefs}
          onPrefs={updatePrefs}
          languageName={lang.name}
        />
      </div>

      <footer className="app-footer">
        Indentation is auto-skipped · best WPM saved per algorithm &amp; language
      </footer>
    </>
  )
}
