// Fix 3 — Live stats / log panel with lined layout.
//
// New component. A collapsible "Stats & Log" panel that sits flush below the Hud
// (its toggle button is styled to butt against the bottom of the Hud bar). It is
// collapsed by default. When expanded it shows two columns:
//   - Left: the session log (most recent first, max 10 lines) rendered as
//     terminal-style monospace lines with a subtle left border.
//   - Right: aggregate session stats (races, avg/best WPM, avg accuracy). The
//     best WPM is highlighted when it beats the stored personal best.
// All data lives in the parent's component state (cleared on reload); this
// component only renders what it is given.

import { useState } from 'react'

export interface SessionLogEntry {
  id: number
  algoName: string
  langName: string
  wpm: number
  /** Whole-number percent, e.g. 97. */
  accuracy: number
}

interface StatsLogProps {
  entries: SessionLogEntry[]
  /** Stored personal best (max across saved bests) to compare against. */
  personalBest: number | undefined
}

function average(nums: number[]): number {
  if (nums.length === 0) return 0
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

export function StatsLog({ entries, personalBest }: StatsLogProps) {
  const [open, setOpen] = useState(false)

  const races = entries.length
  const avgWpm = Math.round(average(entries.map((e) => e.wpm)))
  const bestWpm = entries.reduce((m, e) => Math.max(m, e.wpm), 0)
  const avgAcc = Math.round(average(entries.map((e) => e.accuracy)))
  const beatsRecord = races > 0 && (personalBest == null || bestWpm > personalBest)

  return (
    <div className={'stats-log' + (open ? ' open' : '')}>
      <button
        className="stats-log-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="stats-log-toggle-label">Stats &amp; Log</span>
        <span className="stats-log-count">{races} race{races === 1 ? '' : 's'}</span>
        <span className="stats-log-caret" aria-hidden="true">{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <div className="stats-log-body">
          <div className="stats-log-col stats-log-session">
            <div className="stats-log-col-title">Session log</div>
            {races === 0 ? (
              <p className="stats-log-empty">No races yet — finish one to log it here.</p>
            ) : (
              <ul className="stats-log-lines">
                {entries.map((e) => (
                  <li key={e.id} className="stats-log-line">
                    <span className="stats-log-line-algo">{e.algoName}</span>
                    <span className="stats-log-line-lang">{e.langName}</span>
                    <span className="stats-log-line-sep">—</span>
                    <span className="stats-log-line-wpm">{e.wpm} wpm</span>
                    <span className="stats-log-line-acc">{e.accuracy}%</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="stats-log-col stats-log-aggregate">
            <div className="stats-log-col-title">This session</div>
            <dl className="stats-log-aggrid">
              <dt>Races completed</dt>
              <dd>{races}</dd>
              <dt>Average WPM</dt>
              <dd>{avgWpm}</dd>
              <dt>Best WPM</dt>
              <dd className={beatsRecord ? 'stats-log-best' : undefined}>
                {bestWpm}
                {beatsRecord && <span className="stats-log-best-tag">PB</span>}
              </dd>
              <dt>Average accuracy</dt>
              <dd>{avgAcc}%</dd>
            </dl>
          </div>
        </div>
      )}
    </div>
  )
}
