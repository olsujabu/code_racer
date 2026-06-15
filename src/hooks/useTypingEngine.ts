import { useCallback, useEffect, useMemo, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { Dialect } from '../lib/tokenizer'
import {
  applyAction,
  buildCells,
  classifyKey,
  computeMeta,
  computeStats,
  initialState,
  type Cell,
  type LiveStats,
} from '../lib/typing'

export interface TypingEngine {
  cells: Cell[]
  cursor: number
  errorAtCursor: boolean
  errorPulse: number
  isComplete: boolean
  stats: LiveStats
  activeLine: number
  onKeyDown: (e: ReactKeyboardEvent) => void
  reset: () => void
}

export function useTypingEngine(code: string, dialect: Dialect): TypingEngine {
  const cells = useMemo(() => buildCells(code, dialect), [code, dialect])
  const meta = useMemo(() => computeMeta(cells), [cells])

  const [state, setState] = useState(() => initialState(meta))

  // Reset synchronously when the snippet (and thus its cell meta) changes, so a
  // stale cursor never indexes into the new snippet's data mid-render.
  const [trackedMeta, setTrackedMeta] = useState(meta)
  if (trackedMeta !== meta) {
    setTrackedMeta(meta)
    setState(initialState(meta))
  }

  // Tick to drive the live timer/WPM while a run is in progress.
  const [, setTick] = useState(0)
  useEffect(() => {
    if (state.startTime == null || state.isComplete) return
    const id = window.setInterval(() => setTick((t) => t + 1), 100)
    return () => window.clearInterval(id)
  }, [state.startTime, state.isComplete])

  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent) => {
      // Keep Tab inside the editor and stop Space from scrolling the page.
      if (e.key === 'Tab') {
        e.preventDefault()
        return
      }
      const action = classifyKey(e)
      if (!action) return
      e.preventDefault()
      setState((prev) => applyAction(prev, action, cells, performance.now()))
    },
    [cells],
  )

  const reset = useCallback(() => setState(initialState(meta)), [meta])

  const stats = computeStats(state, meta, performance.now())
  const activeLine =
    state.cursor < cells.length ? cells[state.cursor].lineIndex : cells[cells.length - 1]?.lineIndex ?? 0

  return {
    cells,
    cursor: state.cursor,
    errorAtCursor: state.errorAtCursor,
    errorPulse: state.errorPulse,
    isComplete: state.isComplete,
    stats,
    activeLine,
    onKeyDown,
    reset,
  }
}
