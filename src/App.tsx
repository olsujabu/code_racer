import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ALGORITHMS,
  LANGUAGES,
  filenameFor,
  getAlgorithm,
  getLanguage,
  type LanguageId,
} from './data/snippets'
import { bestKey, loadBests, recordBest, type Bests } from './lib/storage'
import { useTypingEngine } from './hooks/useTypingEngine'
import { SelectorBar } from './components/SelectorBar'
import { EditorWindow } from './components/EditorWindow'
import { Hud } from './components/Hud'
import { Controls } from './components/Controls'
import { ResultsScreen } from './components/ResultsScreen'

export default function App() {
  const [selectedAlgoId, setSelectedAlgoId] = useState(ALGORITHMS[0].id)
  const [selectedLangId, setSelectedLangId] = useState<LanguageId>('python')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [bests, setBests] = useState<Bests>(() => loadBests())
  const [isRecord, setIsRecord] = useState(false)
  const [focused, setFocused] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const recordedRef = useRef(false)

  const visibleAlgorithms = useMemo(
    () => ALGORITHMS.filter((a) => showAdvanced || !a.advanced),
    [showAdvanced],
  )

  const algo = getAlgorithm(selectedAlgoId)
  const lang = getLanguage(selectedLangId)
  const code = algo.impls[lang.id]
  const filename = filenameFor(algo, lang)
  const key = bestKey(algo.id, lang.id)
  const best = bests[key]

  const engine = useTypingEngine(code, lang.tokLang)

  const focusInput = useCallback(() => {
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [])

  // Focus the editor on first mount for desktop convenience.
  useEffect(() => {
    focusInput()
  }, [focusInput])

  // Record a best score exactly once per completed run.
  useEffect(() => {
    if (!engine.isComplete) {
      recordedRef.current = false
      setIsRecord(false)
      return
    }
    if (recordedRef.current) return
    recordedRef.current = true
    const wpm = Math.round(engine.stats.wpm)
    const result = recordBest(bests, key, wpm)
    setBests(result.bests)
    setIsRecord(result.isRecord)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.isComplete])

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

  // While results are showing, Enter advances to the next snippet.
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
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">&#9654;</span>
          <span className="brand-name">Code<span className="brand-accent">Racer</span></span>
        </div>
        <p className="tagline">Type real algorithms. Beat your own speed.</p>
      </header>

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

      <EditorWindow
        filename={filename}
        langName={lang.name}
        engine={engine}
        inputRef={inputRef}
        focused={focused}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        results={
          <ResultsScreen
            algoName={algo.name}
            langName={lang.name}
            stats={engine.stats}
            best={bests[key]}
            isRecord={isRecord}
            onRetry={restart}
            onNext={next}
          />
        }
      />

      <Hud stats={engine.stats} best={best} />

      <Controls onRestart={restart} onNext={next} onRandom={random} />

      <footer className="app-footer">
        Indentation is auto-skipped · best WPM saved per algorithm &amp; language
      </footer>
    </div>
  )
}
