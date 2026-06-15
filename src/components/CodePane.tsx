import { useMemo } from 'react'
import type { Cell } from '../lib/typing'

interface CodePaneProps {
  cells: Cell[]
  cursor: number
  errorAtCursor: boolean
  errorPulse: number
  activeLine: number
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

export function CodePane({ cells, cursor, errorAtCursor, errorPulse, activeLine }: CodePaneProps) {
  const lines = useMemo(() => groupByLine(cells), [cells])

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
