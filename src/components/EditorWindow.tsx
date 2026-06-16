import type { ReactNode, RefObject } from 'react'
import type { TypingEngine } from '../hooks/useTypingEngine'
import { CodePane } from './CodePane'

interface EditorWindowProps {
  filename: string
  langName: string
  engine: TypingEngine
  inputRef: RefObject<HTMLInputElement>
  focused: boolean
  onFocus: () => void
  onBlur: () => void
  results: ReactNode
  /** When locked, keystrokes are ignored and the focus hint is replaced. */
  locked?: boolean
  /** Overlay shown while locked (e.g. a race countdown). */
  lockedOverlay?: ReactNode
}

export function EditorWindow({
  filename,
  langName,
  engine,
  inputRef,
  focused,
  onFocus,
  onBlur,
  results,
  locked = false,
  lockedOverlay,
}: EditorWindowProps) {
  return (
    <div className="editor">
      <div className="title-bar">
        <span className="dots" aria-hidden="true">
          <span className="dot dot-red" />
          <span className="dot dot-amber" />
          <span className="dot dot-green" />
        </span>
        <span className="filename">{filename}</span>
        <span className="lang-badge">{langName}</span>
      </div>

      <div className="editor-body">
        <div className="code-scroll">
          <CodePane
            cells={engine.cells}
            cursor={engine.cursor}
            errorAtCursor={engine.errorAtCursor}
            errorPulse={engine.errorPulse}
            activeLine={engine.activeLine}
          />
        </div>

        <input
          ref={inputRef}
          className="capture-input"
          type="text"
          value=""
          onChange={() => {}}
          onKeyDown={locked ? undefined : engine.onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label={`Type the implementation in ${filename}`}
        />

        {!focused && !engine.isComplete && !locked && (
          <div className="focus-overlay">
            <div className="focus-hint">
              <span className="focus-hint-key">Click or tap</span> to start typing
            </div>
          </div>
        )}

        {locked && lockedOverlay && <div className="lock-overlay">{lockedOverlay}</div>}

        {engine.isComplete && results && <div className="results-overlay">{results}</div>}
      </div>
    </div>
  )
}
