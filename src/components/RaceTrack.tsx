import type { PlayerState } from '../lib/multiplayer'

interface RaceTrackProps {
  players: PlayerState[]
  meId: string
  showWpm?: boolean
}

/** Finishers first (by finish time), then by live progress. */
export function orderPlayers(players: PlayerState[]): PlayerState[] {
  return [...players].sort((a, b) => {
    if (a.finished && b.finished) return a.finishMs - b.finishMs
    if (a.finished) return -1
    if (b.finished) return 1
    return b.progress - a.progress
  })
}

export function RaceTrack({ players, meId, showWpm = true }: RaceTrackProps) {
  const ordered = orderPlayers(players)
  let finishRank = 0

  return (
    <div className="race-track">
      {ordered.map((p) => {
        const rank = p.finished ? ++finishRank : null
        const isMe = p.id === meId
        return (
          <div key={p.id} className={'racer' + (isMe ? ' me' : '') + (p.finished ? ' done' : '')}>
            <div className="racer-head">
              <span className="racer-name">
                {rank === 1 && <span className="racer-medal" aria-hidden="true">&#127942;</span>}
                {p.username}
                {isMe && <span className="racer-you">you</span>}
              </span>
              <span className="racer-stat">
                {p.finished ? (
                  <span className="racer-final">#{rank} · {p.finishWpm} wpm</span>
                ) : (
                  showWpm && <span>{Math.round(p.wpm)} wpm</span>
                )}
              </span>
            </div>
            <div className="racer-bar">
              <div
                className="racer-fill"
                style={{ width: `${Math.round(p.progress * 100)}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
