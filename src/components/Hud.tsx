// Fix 1 — Progress bar milestone markers (0 / 20 / 40 / 60 / 80 %).
//
// CHANGE LOG:
//   - Replaced the plain "Progress" number tile with a full progress bar that
//     has a filled indicator and labeled tick marks at exactly 0/20/40/60/80%.
//     No 100% tick (completion hands off to the results screen).
//   - When no race is active yet (timer not started), the bar renders in a
//     dimmed skeleton state instead of hiding the component.
//   - Scoring/stat values are unchanged; this only affects presentation.

import type { LiveStats } from '../lib/typing'

const MILESTONES = [0, 20, 40, 60, 80]

function StatTile({
  label,
  value,
  unit,
  accent,
}: {
  label: string
  value: string
  unit?: string
  accent?: boolean
}) {
  return (
    <div className={'stat-tile' + (accent ? ' accent' : '')}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {value}
        {unit && <span className="stat-unit">{unit}</span>}
      </div>
    </div>
  )
}

function ProgressBar({ progress, active }: { progress: number; active: boolean }) {
  const pct = Math.max(0, Math.min(100, Math.round(progress * 100)))
  return (
    <div className={'progress-tile' + (active ? '' : ' skeleton')}>
      <div className="stat-label">
        Progress
        <span className="progress-pct">{active ? `${pct}%` : '--'}</span>
      </div>
      <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={active ? pct : 0}>
        <div className="progress-fill" style={{ width: active ? `${pct}%` : '0%' }} />
        {MILESTONES.map((m) => (
          <span key={m} className="progress-tick" style={{ left: `${m}%` }}>
            <span className="progress-tick-mark" />
            <span className="progress-tick-label">{m}%</span>
          </span>
        ))}
      </div>
    </div>
  )
}

interface HudProps {
  stats: LiveStats
  best: number | undefined
}

export function Hud({ stats, best }: HudProps) {
  // A race is "active" once the timer has started ticking.
  const active = stats.elapsedMs > 0
  return (
    <div className="hud">
      <StatTile label="Speed" value={String(Math.round(stats.wpm))} unit="wpm" accent />
      <StatTile label="Accuracy" value={String(Math.round(stats.accuracy * 100))} unit="%" />
      <StatTile label="Time" value={(stats.elapsedMs / 1000).toFixed(1)} unit="s" />
      <StatTile label="Best" value={best != null ? String(best) : '--'} unit={best != null ? 'wpm' : undefined} />
      <ProgressBar progress={stats.progress} active={active} />
    </div>
  )
}
