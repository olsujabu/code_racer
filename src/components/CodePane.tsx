// Fix 3 (Setting C): renders auto-completed bracket/quote cells with a distinct
// `.cell.auto` style so the player can see which character was skipped for them.

import { useMemo } from 'react'
import type { Cell } from '../lib/typing'

interface CodePaneProps {
  cells: Cell[]
  cursor: number
  errorAtCursor: boolean
  errorPulse: number
  activeLine: number
  /** Cell indices auto-completed by Setting C. */
  autoCells?: number[]
}

interface Line {
  lineIndex: number
  cells: Cell[]
}

function groupByLine(cells: Cell[]): Line[] {
  const lines: Line[] = []
  for (const cell of cells) {
    let line = lines[lines.length - 1]
    if (!line || line.lineIndex !== cell.lineIndex) {
      line = { lineIndex: cell.lineIndex, cells: [] }
      lines.push(line)
    }
    line.cells.push(cell)
  }
  return lines
}

export function CodePane({ cells, cursor, errorAtCursor, errorPulse, activeLine, autoCells }: CodePaneProps) {
  const lines = useMemo(() => groupByLine(cells), [cells])
  const autoSet = useMemo(() => new Set(autoCells ?? []), [autoCells])

  return (
    <div className="code-pane" aria-hidden="true">
      {lines.map((line) => (
        <div
          key={line.lineIndex}
          className={'code-line' + (line.lineIndex === activeLine ? ' active' : '')}
        >
          <span className="gutter">{line.lineIndex + 1}</span>
          <span className="line-content">
            {line.cells.map((cell) => {
              const lit = cell.index < cursor && !cell.skip
              const isCurrent = cell.index === cursor
              const isError = isCurrent && errorAtCursor

              const classes = ['cell', `tok-${cell.type}`]
              if (cell.skip) classes.push('skip')
              classes.push(lit ? 'lit' : 'dim')
              if (isCurrent) classes.push('caret')
              if (isError) classes.push('error')
              if (autoSet.has(cell.index)) classes.push('auto')

              const key = isError ? `c${cell.index}-${errorPulse}` : `c${cell.index}`
              const content = cell.newline ? ' ' : cell.ch

              return (
                <span key={key} className={classes.join(' ')}>
                  {content}
                </span>
              )
            })}
          </span>
        </div>
      ))}
    </div>
  )
}
