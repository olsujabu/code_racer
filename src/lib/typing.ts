// The typing engine: turns a snippet into typeable "cells" and resolves
// keystrokes against them.
//
// Mechanics (modeled on typing.io):
//   - Real code is typed character by character, including punctuation.
//   - Leading indentation is auto-skipped: it is never typed and never counts.
//   - Newlines are typed by pressing Enter.
//   - A wrong key does not advance the caret; the expected cell flashes red and
//     the player must type the correct character (or backspace).

import { tokenizeLine, type Dialect, type TokenType } from './tokenizer'

export interface Cell {
  /** The character. Newlines are represented by the literal '\n'. */
  ch: string
  type: TokenType
  /** Leading indentation whitespace — auto-skipped, never typed. */
  skip: boolean
  newline: boolean
  lineIndex: number
  index: number
}

export interface CellMeta {
  /** nonSkipPrefix[i] = count of non-skip cells in [0, i). */
  nonSkipPrefix: number[]
  totalNonSkip: number
  firstTypable: number
}

export function buildCells(code: string, dialect: Dialect): Cell[] {
  const lines = code.split('\n')
  const cells: Cell[] = []
  let index = 0

  lines.forEach((line, lineIndex) => {
    const types = tokenizeLine(line, dialect)
    let leading = 0
    while (leading < line.length && (line[leading] === ' ' || line[leading] === '\t')) {
      leading++
    }
    for (let c = 0; c < line.length; c++) {
      cells.push({
        ch: line[c],
        type: types[c],
        skip: c < leading,
        newline: false,
        lineIndex,
        index: index++,
      })
    }
    if (lineIndex < lines.length - 1) {
      cells.push({
        ch: '\n',
        type: 'plain',
        skip: false,
        newline: true,
        lineIndex,
        index: index++,
      })
    }
  })

  return cells
}

export function computeMeta(cells: Cell[]): CellMeta {
  const nonSkipPrefix: number[] = new Array(cells.length + 1).fill(0)
  for (let i = 0; i < cells.length; i++) {
    nonSkipPrefix[i + 1] = nonSkipPrefix[i] + (cells[i].skip ? 0 : 1)
  }
  let firstTypable = 0
  while (firstTypable < cells.length && cells[firstTypable].skip) firstTypable++
  return {
    nonSkipPrefix,
    totalNonSkip: nonSkipPrefix[cells.length],
    firstTypable,
  }
}

/** Next non-skip cell index strictly after `i`, or cells.length when none. */
export function nextIndex(cells: Cell[], i: number): number {
  let j = i + 1
  while (j < cells.length && cells[j].skip) j++
  return j
}

/** Previous non-skip cell index strictly before `i`, or -1 when none. */
export function prevIndex(cells: Cell[], i: number): number {
  let j = i - 1
  while (j >= 0 && cells[j].skip) j--
  return j
}

export interface EngineState {
  cursor: number
  errorAtCursor: boolean
  /** Bumped on every wrong key so the error animation can replay. */
  errorPulse: number
  totalKeystrokes: number
  correctKeystrokes: number
  startTime: number | null
  endTime: number | null
  isComplete: boolean
}

export function initialState(meta: CellMeta): EngineState {
  return {
    cursor: meta.firstTypable,
    errorAtCursor: false,
    errorPulse: 0,
    totalKeystrokes: 0,
    correctKeystrokes: 0,
    startTime: null,
    endTime: null,
    isComplete: false,
  }
}

export type KeyAction =
  | { kind: 'char'; value: string }
  | { kind: 'enter' }
  | { kind: 'backspace' }

/** Classify a keyboard event into an engine action, or null to ignore it. */
export function classifyKey(e: {
  key: string
  ctrlKey: boolean
  metaKey: boolean
  altKey: boolean
}): KeyAction | null {
  if (e.ctrlKey || e.metaKey || e.altKey) return null
  if (e.key === 'Backspace') return { kind: 'backspace' }
  if (e.key === 'Enter') return { kind: 'enter' }
  if (e.key.length === 1) return { kind: 'char', value: e.key }
  return null
}

export function applyAction(
  state: EngineState,
  action: KeyAction,
  cells: Cell[],
  now: number,
): EngineState {
  if (state.isComplete) return state

  if (action.kind === 'backspace') {
    if (state.errorAtCursor) {
      return { ...state, errorAtCursor: false }
    }
    const prev = prevIndex(cells, state.cursor)
    if (prev < 0) return state
    return { ...state, cursor: prev }
  }

  const cell = cells[state.cursor]
  if (!cell) return state

  const matches =
    action.kind === 'enter' ? cell.newline : !cell.newline && action.value === cell.ch

  const startTime = state.startTime ?? now
  const totalKeystrokes = state.totalKeystrokes + 1

  if (!matches) {
    return {
      ...state,
      startTime,
      totalKeystrokes,
      errorAtCursor: true,
      errorPulse: state.errorPulse + 1,
    }
  }

  const cursor = nextIndex(cells, state.cursor)
  const isComplete = cursor >= cells.length
  return {
    ...state,
    startTime,
    totalKeystrokes,
    correctKeystrokes: state.correctKeystrokes + 1,
    errorAtCursor: false,
    cursor,
    isComplete,
    endTime: isComplete ? now : state.endTime,
  }
}

export interface LiveStats {
  wpm: number
  accuracy: number
  elapsedMs: number
  errors: number
  progress: number
  typed: number
  total: number
}

export function computeStats(state: EngineState, meta: CellMeta, now: number): LiveStats {
  const elapsedMs = state.startTime == null ? 0 : (state.endTime ?? now) - state.startTime
  // Clamp the cursor: during a snippet swap the cursor can momentarily exceed
  // the new prefix array before state resets.
  const safeCursor = Math.max(0, Math.min(state.cursor, meta.nonSkipPrefix.length - 1))
  const typed = meta.nonSkipPrefix[safeCursor]
  const minutes = elapsedMs / 60000
  // Cap at a ceiling no human can exceed so a near-zero elapsed time (e.g. the
  // first keystroke's frame) can never flash an absurd value or break layout.
  const wpm = minutes > 0 ? Math.min(typed / 5 / minutes, 999) : 0
  const accuracy =
    state.totalKeystrokes > 0 ? state.correctKeystrokes / state.totalKeystrokes : 1
  const progress = meta.totalNonSkip > 0 ? typed / meta.totalNonSkip : 0
  return {
    wpm,
    accuracy,
    elapsedMs,
    errors: state.totalKeystrokes - state.correctKeystrokes,
    progress,
    typed,
    total: meta.totalNonSkip,
  }
}
