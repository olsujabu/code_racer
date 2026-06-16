import { useCallback, useEffect, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { LanguageId } from '../data/snippets'
import type { PlayerState, RoomPhase, StartPayload } from '../lib/multiplayer'

export interface RoomApi {
  connected: boolean
  phase: RoomPhase
  start: StartPayload | null
  players: PlayerState[]
  setReady: (ready: boolean) => void
  startRace: (algorithmId: string, languageId: LanguageId) => void
  sendProgress: (progress: number, wpm: number) => void
  finish: (wpm: number, accuracy: number, ms: number) => void
}

const COUNTDOWN_MS = 4500
const PROGRESS_THROTTLE_MS = 120

function blankPlayer(id: string, username: string): PlayerState {
  return {
    id,
    username,
    ready: false,
    progress: 0,
    wpm: 0,
    finished: false,
    finishWpm: 0,
    finishAccuracy: 0,
    finishMs: 0,
  }
}

export function useRoom(code: string, userId: string, username: string): RoomApi {
  const [connected, setConnected] = useState(false)
  const [phase, setPhase] = useState<RoomPhase>('lobby')
  const [start, setStart] = useState<StartPayload | null>(null)
  const [players, setPlayers] = useState<PlayerState[]>([])

  const channelRef = useRef<RealtimeChannel | null>(null)
  const playersRef = useRef<Record<string, PlayerState>>({})
  const meRef = useRef({ ready: false, finished: false, finishWpm: 0, finishAccuracy: 0, finishMs: 0 })
  const lastSent = useRef(0)
  const countdownTimer = useRef<number | null>(null)
  const applyStartRef = useRef<(p: StartPayload) => void>(() => {})

  const flush = useCallback(() => {
    setPlayers(Object.values(playersRef.current))
  }, [])

  const ensure = useCallback((id: string, name: string) => {
    if (!playersRef.current[id]) playersRef.current[id] = blankPlayer(id, name)
    return playersRef.current[id]
  }, [])

  useEffect(() => {
    if (!supabase || !code || !userId || !username) return
    const channel = supabase.channel(`room:${code}`, {
      config: { presence: { key: userId }, broadcast: { self: false } },
    })
    channelRef.current = channel

    const applyStart = (payload: StartPayload) => {
      for (const id of Object.keys(playersRef.current)) {
        const p = playersRef.current[id]
        p.progress = 0
        p.wpm = 0
        p.finished = false
        p.finishWpm = 0
        p.finishAccuracy = 0
        p.finishMs = 0
      }
      meRef.current = { ...meRef.current, finished: false, finishWpm: 0, finishAccuracy: 0, finishMs: 0 }
      channel.track({ username, ...meRef.current })
      flush()
      setStart(payload)
      setPhase('countdown')
      if (countdownTimer.current) window.clearTimeout(countdownTimer.current)
      const delay = Math.max(0, payload.startAt - Date.now())
      countdownTimer.current = window.setTimeout(() => setPhase('racing'), delay)
    }
    applyStartRef.current = applyStart

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState() as Record<string, Array<Record<string, unknown>>>
      const present = new Set<string>()
      for (const key of Object.keys(state)) {
        const metas = state[key]
        if (!metas || metas.length === 0) continue
        present.add(key)
        // A key can briefly hold multiple presences (e.g. a client reconnects
        // mid-race), so merge across them — never let a stale entry at [0] mask
        // the latest state such as a finish.
        const finishedMeta = metas.find((m) => m.finished)
        const latest = metas[metas.length - 1]
        const meta = finishedMeta ?? latest
        const p = ensure(key, (meta.username as string) ?? 'player')
        p.username = (meta.username as string) ?? p.username
        p.ready = metas.some((m) => m.ready)
        if (finishedMeta) {
          p.finished = true
          p.progress = 1
          p.finishWpm = (finishedMeta.finishWpm as number) ?? p.finishWpm
          p.finishAccuracy = (finishedMeta.finishAccuracy as number) ?? p.finishAccuracy
          p.finishMs = (finishedMeta.finishMs as number) ?? p.finishMs
        }
      }
      for (const id of Object.keys(playersRef.current)) {
        if (!present.has(id)) delete playersRef.current[id]
      }
      flush()
    })

    channel.on('broadcast', { event: 'progress' }, ({ payload }) => {
      const { id, progress, wpm, username: name } = payload as {
        id: string
        progress: number
        wpm: number
        username: string
      }
      if (id === userId) return
      const p = ensure(id, name)
      if (!p.finished) {
        p.progress = progress
        p.wpm = wpm
      }
      flush()
    })

    channel.on('broadcast', { event: 'start' }, ({ payload }) => {
      applyStart(payload as StartPayload)
    })

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ username, ...meRef.current })
        ensure(userId, username)
        flush()
        setConnected(true)
      }
    })

    return () => {
      if (countdownTimer.current) window.clearTimeout(countdownTimer.current)
      supabase?.removeChannel(channel)
      channelRef.current = null
      playersRef.current = {}
      setConnected(false)
    }
  }, [code, userId, username, ensure, flush])

  const setReady = useCallback(
    (ready: boolean) => {
      meRef.current.ready = ready
      channelRef.current?.track({ username, ...meRef.current })
      ensure(userId, username).ready = ready
      flush()
    },
    [username, userId, ensure, flush],
  )

  const startRace = useCallback(
    (algorithmId: string, languageId: LanguageId) => {
      const payload: StartPayload = {
        algorithmId,
        languageId,
        startAt: Date.now() + COUNTDOWN_MS,
        raceId: crypto.randomUUID(),
      }
      channelRef.current?.send({ type: 'broadcast', event: 'start', payload })
      applyStartRef.current(payload)
    },
    [],
  )

  const sendProgress = useCallback(
    (progress: number, wpm: number) => {
      const me = ensure(userId, username)
      if (me.finished) return
      me.progress = progress
      me.wpm = wpm
      flush()
      const now = Date.now()
      if (now - lastSent.current < PROGRESS_THROTTLE_MS) return
      lastSent.current = now
      channelRef.current?.send({
        type: 'broadcast',
        event: 'progress',
        payload: { id: userId, username, progress, wpm },
      })
    },
    [userId, username, ensure, flush],
  )

  const finish = useCallback(
    (wpm: number, accuracy: number, ms: number) => {
      const me = ensure(userId, username)
      me.finished = true
      me.progress = 1
      me.wpm = wpm
      me.finishWpm = wpm
      me.finishAccuracy = accuracy
      me.finishMs = ms
      flush()
      meRef.current = { ...meRef.current, finished: true, finishWpm: wpm, finishAccuracy: accuracy, finishMs: ms }
      channelRef.current?.track({ username, ...meRef.current })
      channelRef.current?.send({
        type: 'broadcast',
        event: 'progress',
        payload: { id: userId, username, progress: 1, wpm },
      })
    },
    [userId, username, ensure, flush],
  )

  return { connected, phase, start, players, setReady, startRace, sendProgress, finish }
}
