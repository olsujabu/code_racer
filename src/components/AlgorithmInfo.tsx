// Fix 2 — Algorithm info panel (time & space complexity).
//
// New component. Renders a compact, borderless info strip for the currently
// selected algorithm: a one-line description plus monospace time/space
// complexity values. It is a pure function of `algo`, so it updates instantly
// when the user switches algorithms in the SelectorBar. Styled to sit above the
// editor without a box that competes with it (see `.algo-info` in index.css).

import type { Algorithm } from '../data/snippets'

interface AlgorithmInfoProps {
  algo: Algorithm
}

export function AlgorithmInfo({ algo }: AlgorithmInfoProps) {
  const { timeComplexity, spaceComplexity, description } = algo.info
  return (
    <div className="algo-info">
      <p className="algo-info-desc">{description}</p>
      <div className="algo-info-metrics">
        <span className="algo-info-metric">
          <span className="algo-info-key">Time</span>
          <code className="algo-info-val">{timeComplexity}</code>
        </span>
        <span className="algo-info-metric">
          <span className="algo-info-key">Space</span>
          <code className="algo-info-val">{spaceComplexity}</code>
        </span>
      </div>
    </div>
  )
}
