import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  ALGORITHMS,
  LANGUAGES,
  filenameFor,
  getAlgorithm,
  getLanguage,
  type LanguageId,
} from '../data/snippets'
import { makeRoomCode, saveResult } from '../lib/multiplayer'
import { useRoom, type RoomApi } from '../hooks/useRoom'
import { useTypingEngine } from '../hooks/useTypingEngine'
import { EditorWindow } from './EditorWindow'
import { SelectorBar } from './SelectorBar'
import { RaceTrack, orderPlayers } from './RaceTrack'

interface Identity {
  userId: string
  username: string
}

export function MultiplayerGame({ userId, username }: Identity) {
  const [room, setRoom] = useState<{ code: string; host: boolean } | null>(null)

  if (!room) {
    return <RoomEntry onEnter={(code, host) => setRoom({ code, host })} />
  }
  return (
    <Room
      key={room.code}
      code={room.code}
      isHost={room.host}
      userId={userId}
      username={username}
      onLeave={() => setRoom(null)}
    />
  )
}

function RoomEntry({ onEnter }: { onEnter: (code: string, host: boolean) => void }) {
  const [joinCode, setJoinCode] = useState('')
  const join = (e: FormEvent) => {
    e.preventDefault()
    const code = joinCode.trim().toUpperCase()
    if (code.length >= 4) onEnter(code, false)
  }
  return (
    <div className="mp-entry">
      <div className="mp-card">
        <h2>Race a friend</h2>
        <p className="mp-sub">Create a room and share the code, or join one.</p>
        <button className="control-btn primary mp-create" onClick={() => onEnter(makeRoomCode(), true)}>
          Create a room
        </button>
        <div className="mp-or"><span>or join with a code</span></div>
        <form className="mp-join" onSubmit={join}>
          <input
            className="mp-code-input"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="CODE"
            maxLength={5}
            aria-label="Room code"
          />
          <button className="control-btn" type="submit">Join</button>
        </form>
      </div>
    </div>
  )
}

interface RoomProps extends Identity {
  code: string
  isHost: boolean
  onLeave: () => void
}

function Room({ code, isHost, userId, username, onLeave }: RoomProps) {
  const room = useRoom(code, userId, username)
  const [algoId, setAlgoId] = useState(ALGORITHMS[0].id)
  const [langId, setLangId] = useState<LanguageId>('python')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const started = room.start && room.phase !== 'lobby'

  if (!started) {
    return (
      <Lobby
        room={room}
        code={code}
        isHost={isHost}
        userId={userId}
        onLeave={onLeave}
        algoId={algoId}
        setAlgoId={setAlgoId}
        langId={langId}
        setLangId={setLangId}
        showAdvanced={showAdvanced}
        setShowAdvanced={setShowAdvanced}
      />
    )
  }

  return (
    <RaceView
      key={room.start!.raceId}
      room={room}
      code={code}
      isHost={isHost}
      userId={userId}
      username={username}
      onLeave={onLeave}
    />
  )
}

interface LobbyProps extends Pick<RoomProps, 'code' | 'isHost' | 'userId' | 'onLeave'> {
  room: RoomApi
  algoId: string
  setAlgoId: (id: string) => void
  langId: LanguageId
  setLangId: (id: LanguageId) => void
  showAdvanced: boolean
  setShowAdvanced: (v: boolean) => void
}

function Lobby({
  room,
  code,
  isHost,
  userId,
  onLeave,
  algoId,
  setAlgoId,
  langId,
  setLangId,
  showAdvanced,
  setShowAdvanced,
}: LobbyProps) {
  const [copied, setCopied] = useState(false)
  const me = room.players.find((p) => p.id === userId)
  const visibleAlgorithms = useMemo(
    () => ALGORITHMS.filter((a) => showAdvanced || !a.advanced),
    [showAdvanced],
  )
  const algo = getAlgorithm(algoId)
  const lang = getLanguage(langId)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard may be blocked; the code is on screen anyway */
    }
  }

  return (
    <div className="lobby">
      <div className="lobby-head">
        <div>
          <div className="lobby-code-label">Room code — share it</div>
          <div className="lobby-code">
            <span className="lobby-code-value">{code}</span>
            <button className="control-btn lobby-copy" onClick={copy}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
        <button className="control-btn" onClick={onLeave}>Leave</button>
      </div>

      <div className="lobby-players">
        {room.players.map((p) => (
          <div key={p.id} className={'lobby-player' + (p.ready ? ' ready' : '')}>
            <span className="lobby-player-name">
              {p.username}
              {p.id === userId && <span className="racer-you">you</span>}
            </span>
            <span className="lobby-player-status">{p.ready ? 'Ready' : 'Not ready'}</span>
          </div>
        ))}
        {room.players.length < 2 && (
          <div className="lobby-waiting">
            {room.connected ? 'Waiting for players to join…' : 'Connecting…'}
          </div>
        )}
      </div>

      <button
        className={'control-btn ready-btn' + (me?.ready ? ' on' : '')}
        onClick={() => room.setReady(!me?.ready)}
      >
        {me?.ready ? '✓ Ready' : 'Mark ready'}
      </button>

      {isHost ? (
        <div className="lobby-host">
          <div className="lobby-host-title">
            Pick the snippet · <span className="mono">{filenameFor(algo, lang)}</span>
          </div>
          <SelectorBar
            algorithms={visibleAlgorithms}
            selectedAlgoId={algoId}
            onSelectAlgo={setAlgoId}
            languages={LANGUAGES}
            selectedLangId={langId}
            onSelectLang={setLangId}
            showAdvanced={showAdvanced}
            onToggleAdvanced={setShowAdvanced}
          />
          <button
            className="control-btn primary start-btn"
            disabled={!room.connected}
            onClick={() => room.startRace(algoId, langId)}
          >
            Start race &rarr;
          </button>
        </div>
      ) : (
        <div className="lobby-waiting">Waiting for the host to start the race…</div>
      )}
    </div>
  )
}

interface RaceViewProps extends Identity {
  room: RoomApi
  code: string
  isHost: boolean
  onLeave: () => void
}

function RaceView({ room, code, isHost, userId, username, onLeave }: RaceViewProps) {
  const start = room.start!
  const algo = getAlgorithm(start.algorithmId)
  const lang = getLanguage(start.languageId)
  const engine = useTypingEngine(algo.impls[lang.id], lang.tokLang)

  const inputRef = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const savedRef = useRef(false)

  const racing = room.phase === 'racing'
  const secondsLeft = Math.max(0, Math.ceil((start.startAt - now) / 1000))

  // Tick during the countdown so the number ticks down.
  useEffect(() => {
    if (racing) return
    const id = window.setInterval(() => setNow(Date.now()), 100)
    return () => window.clearInterval(id)
  }, [racing])

  // Focus the editor the moment typing unlocks.
  useEffect(() => {
    if (racing) requestAnimationFrame(() => inputRef.current?.focus())
  }, [racing])

  // Broadcast progress as it changes.
  useEffect(() => {
    if (!racing) return
    room.sendProgress(engine.stats.progress, Math.round(engine.stats.wpm))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.stats.progress, racing])

  // On completion: report finish to the room and persist the result once.
  useEffect(() => {
    if (!engine.isComplete || savedRef.current) return
    savedRef.current = true
    const wpm = Math.round(engine.stats.wpm)
    const accuracy = Math.round(engine.stats.accuracy * 100)
    const ms = Math.round(engine.stats.elapsedMs)
    room.finish(wpm, accuracy, ms)
    void saveResult({
      playerId: userId,
      username,
      algorithmId: algo.id,
      languageId: lang.id,
      roomCode: code,
      wpm,
      accuracy,
      errors: engine.stats.errors,
      timeMs: ms,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.isComplete])

  const allFinished = room.players.length > 0 && room.players.every((p) => p.finished)

  return (
    <div className="mp-race">
      <RaceTrack players={room.players} meId={userId} />

      <EditorWindow
        filename={filenameFor(algo, lang)}
        langName={lang.name}
        engine={engine}
        inputRef={inputRef}
        focused={focused}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        results={null}
        locked={!racing}
        lockedOverlay={
          <div className="countdown">
            <div className="countdown-num">{secondsLeft > 0 ? secondsLeft : 'Go!'}</div>
            <div className="countdown-snippet">{filenameFor(algo, lang)}</div>
          </div>
        }
      />

      {allFinished && (
        <Standings
          room={room}
          isHost={isHost}
          algoId={algo.id}
          langId={lang.id}
          onLeave={onLeave}
        />
      )}
    </div>
  )
}

function Standings({
  room,
  isHost,
  algoId,
  langId,
  onLeave,
}: {
  room: RoomApi
  isHost: boolean
  algoId: string
  langId: LanguageId
  onLeave: () => void
}) {
  const ordered = orderPlayers(room.players)
  return (
    <div className="results-overlay">
      <div className="results mp-standings">
        <h2 className="standings-title">Race results</h2>
        <ol className="standings-list">
          {ordered.map((p, i) => (
            <li key={p.id} className={i === 0 ? 'winner' : ''}>
              <span className="standing-rank">{i + 1}</span>
              <span className="standing-name">{p.username}</span>
              <span className="standing-wpm">{p.finishWpm} wpm</span>
              <span className="standing-acc">{p.finishAccuracy}%</span>
            </li>
          ))}
        </ol>
        <div className="results-actions">
          {isHost ? (
            <button className="control-btn primary" onClick={() => room.startRace(algoId, langId)}>
              Race again
            </button>
          ) : (
            <span className="results-hint">Waiting for host to start a rematch…</span>
          )}
          <button className="control-btn" onClick={onLeave}>Leave room</button>
        </div>
      </div>
    </div>
  )
}
