import type { LiveStats } from '../lib/typing'

interface HudProps {
  stats: LiveStats
  best: number | undefined
}

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

export function Hud({ stats, best }: HudProps) {
  return (
    <div className="hud">
      <StatTile label="Speed" value={String(Math.round(stats.wpm))} unit="wpm" accent />
      <StatTile label="Accuracy" value={String(Math.round(stats.accuracy * 100))} unit="%" />
      <StatTile label="Time" value={(stats.elapsedMs / 1000).toFixed(1)} unit="s" />
      <StatTile label="Progress" value={String(Math.round(stats.progress * 100))} unit="%" />
      <StatTile label="Best" value={best != null ? String(best) : '--'} unit={best != null ? 'wpm' : undefined} />
    </div>
  )
}
