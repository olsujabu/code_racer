import type { LiveStats } from '../lib/typing'

interface ResultsScreenProps {
  algoName: string
  langName: string
  stats: LiveStats
  best: number | undefined
  isRecord: boolean
  onRetry: () => void
  onNext: () => void
}

export function ResultsScreen({
  algoName,
  langName,
  stats,
  best,
  isRecord,
  onRetry,
  onNext,
}: ResultsScreenProps) {
  return (
    <div className="results">
      <div className="results-head">
        <span className="results-snippet">
          {algoName} <span className="results-lang">· {langName}</span>
        </span>
        {isRecord && <span className="results-record">New best!</span>}
      </div>

      <div className="results-wpm">
        <span className="results-wpm-number">{Math.round(stats.wpm)}</span>
        <span className="results-wpm-unit">wpm</span>
      </div>

      <div className="results-tiles">
        <div className="results-tile">
          <div className="results-tile-label">Accuracy</div>
          <div className="results-tile-value">{Math.round(stats.accuracy * 100)}%</div>
        </div>
        <div className="results-tile">
          <div className="results-tile-label">Time</div>
          <div className="results-tile-value">{(stats.elapsedMs / 1000).toFixed(1)}s</div>
        </div>
        <div className="results-tile">
          <div className="results-tile-label">Errors</div>
          <div className="results-tile-value">{stats.errors}</div>
        </div>
        <div className="results-tile">
          <div className="results-tile-label">Best</div>
          <div className="results-tile-value">{best != null ? best : '--'}</div>
        </div>
      </div>

      <div className="results-actions">
        <button className="control-btn" onClick={onRetry}>
          Try again
        </button>
        <button className="control-btn primary" onClick={onNext}>
          Next <span className="control-icon" aria-hidden="true">&#8594;</span>
        </button>
      </div>
      <div className="results-hint">
        Press <kbd>Enter</kbd> for next
      </div>
    </div>
  )
}
