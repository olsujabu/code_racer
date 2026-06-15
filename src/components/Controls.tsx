interface ControlsProps {
  onRestart: () => void
  onNext: () => void
  onRandom: () => void
}

export function Controls({ onRestart, onNext, onRandom }: ControlsProps) {
  return (
    <div className="controls">
      <button className="control-btn" onClick={onRestart}>
        <span className="control-icon" aria-hidden="true">&#8635;</span>
        Restart
      </button>
      <button className="control-btn" onClick={onRandom}>
        <span className="control-icon" aria-hidden="true">&#10042;</span>
        Random
      </button>
      <button className="control-btn primary" onClick={onNext}>
        Next
        <span className="control-icon" aria-hidden="true">&#8594;</span>
      </button>
    </div>
  )
}
