import type { Algorithm, Language, LanguageId } from '../data/snippets'

interface SelectorBarProps {
  algorithms: Algorithm[]
  selectedAlgoId: string
  onSelectAlgo: (id: string) => void
  languages: Language[]
  selectedLangId: LanguageId
  onSelectLang: (id: LanguageId) => void
  showAdvanced: boolean
  onToggleAdvanced: (next: boolean) => void
}

export function SelectorBar({
  algorithms,
  selectedAlgoId,
  onSelectAlgo,
  languages,
  selectedLangId,
  onSelectLang,
  showAdvanced,
  onToggleAdvanced,
}: SelectorBarProps) {
  return (
    <div className="selector-bar">
      <div className="selector-row">
        <span className="selector-label">Algorithm</span>
        <div className="chips" role="tablist" aria-label="Algorithm">
          {algorithms.map((algo) => (
            <button
              key={algo.id}
              role="tab"
              aria-selected={algo.id === selectedAlgoId}
              className={'chip' + (algo.id === selectedAlgoId ? ' selected' : '')}
              onClick={() => onSelectAlgo(algo.id)}
            >
              {algo.name}
              {algo.advanced && <span className="chip-tag">adv</span>}
            </button>
          ))}
          <label className="advanced-toggle">
            <input
              type="checkbox"
              checked={showAdvanced}
              onChange={(e) => onToggleAdvanced(e.target.checked)}
            />
            <span>Advanced</span>
          </label>
        </div>
      </div>

      <div className="selector-row">
        <span className="selector-label">Language</span>
        <div className="lang-tabs" role="tablist" aria-label="Language">
          {languages.map((lang) => (
            <button
              key={lang.id}
              role="tab"
              aria-selected={lang.id === selectedLangId}
              className={'lang-tab' + (lang.id === selectedLangId ? ' selected' : '')}
              onClick={() => onSelectLang(lang.id)}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
