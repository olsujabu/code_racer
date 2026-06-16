import { useEffect, useMemo, useState } from 'react'
import { ALGORITHMS, LANGUAGES, getAlgorithm, getLanguage, type LanguageId } from '../data/snippets'
import { fetchLeaderboard, type LeaderRow } from '../lib/multiplayer'

export function Leaderboard() {
  const [algoId, setAlgoId] = useState<string>('all')
  const [langId, setLangId] = useState<string>('all')
  const [rows, setRows] = useState<LeaderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const algorithms = useMemo(() => ALGORITHMS, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    fetchLeaderboard({
      algorithmId: algoId === 'all' ? undefined : algoId,
      languageId: langId === 'all' ? undefined : langId,
    }).then(({ rows, error }) => {
      if (!active) return
      if (error) setError(error)
      setRows(rows)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [algoId, langId])

  return (
    <div className="leaderboard">
      <div className="lb-filters">
        <select value={algoId} onChange={(e) => setAlgoId(e.target.value)} className="lb-select" aria-label="Algorithm">
          <option value="all">All algorithms</option>
          {algorithms.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <select value={langId} onChange={(e) => setLangId(e.target.value)} className="lb-select" aria-label="Language">
          <option value="all">All languages</option>
          {LANGUAGES.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </div>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <div className="lb-empty">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="lb-empty">No scores yet — be the first to set one.</div>
      ) : (
        <table className="lb-table">
          <thead>
            <tr>
              <th className="lb-rank">#</th>
              <th>Player</th>
              <th>Snippet</th>
              <th className="lb-num">WPM</th>
              <th className="lb-num">Acc</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={`${r.username}-${r.created_at}-${i}`}>
                <td className="lb-rank">{i + 1}</td>
                <td className="lb-player">{r.username}</td>
                <td className="lb-snippet">
                  {getAlgorithm(r.algorithm_id).name}
                  <span className="lb-lang">{getLanguage(r.language_id as LanguageId).name}</span>
                </td>
                <td className="lb-num lb-wpm">{r.wpm}</td>
                <td className="lb-num">{r.accuracy}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
