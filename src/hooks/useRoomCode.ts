// Fix 1 — Room code: one active code per user, 5-minute expiry w/ live countdown.
//
// New hook. Persists a single active room code under localStorage `coderacer_room`
// as { code, createdAt }. Behaviour:
//   - On mount, if a valid (unexpired) code exists it is surfaced automatically
//     with its remaining time; an already-expired stored code is cleared.
//   - createOrReuse() returns the existing code while it is still valid instead
//     of generating a new one; otherwise it mints a fresh 6-char uppercase
//     alphanumeric code and stores it.
//   - A 1s interval drives the countdown and is cleaned up on unmount/expiry.
//   - When the countdown hits 0:00 the code is marked expired and the
//     localStorage key is cleared so the next createOrReuse mints a new one.

import { useCallback, useEffect, useState } from 'react'

const KEY = 'coderacer_room'
const TTL_MS = 5 * 60 * 1000

interface StoredRoom {
  code: string
  createdAt: number
}

function loadStored(): StoredRoom | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as Partial<StoredRoom>
    if (p && typeof p.code === 'string' && typeof p.createdAt === 'number') {
      return { code: p.code, createdAt: p.createdAt }
    }
    return null
  } catch {
    return null
  }
}

function clearStored(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

/** 6-character uppercase alphanumeric room code. */
function generateCode(): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return code
}

export interface RoomCodeApi {
  /** Active, unexpired code or null. */
  code: string | null
  /** Milliseconds until expiry (0 when expired/none). */
  remainingMs: number
  /** True once a surfaced code has counted down to zero. */
  expired: boolean
  /** Reuse the current valid code, or mint + store a new one. */
  createOrReuse: () => void
}

export function useRoomCode(): RoomCodeApi {
  const [room, setRoom] = useState<StoredRoom | null>(() => {
    const stored = loadStored()
    if (!stored) return null
    if (Date.now() - stored.createdAt >= TTL_MS) {
      clearStored()
      return null
    }
    return stored
  })
  const [now, setNow] = useState(() => Date.now())
  const [expired, setExpired] = useState(false)

  // Tick the countdown once per second; cleans up on unmount, when there is no
  // active code, or once expired.
  useEffect(() => {
    if (!room || expired) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [room, expired])

  const remainingMs = room ? Math.max(0, TTL_MS - (now - room.createdAt)) : 0

  // Transition to expired exactly once when the timer reaches zero.
  useEffect(() => {
    if (room && !expired && remainingMs <= 0) {
      setExpired(true)
      clearStored()
    }
  }, [room, expired, remainingMs])

  const createOrReuse = useCallback(() => {
    const stored = loadStored()
    if (stored && Date.now() - stored.createdAt < TTL_MS) {
      setRoom(stored)
      setExpired(false)
      setNow(Date.now())
      return
    }
    const fresh: StoredRoom = { code: generateCode(), createdAt: Date.now() }
    try {
      localStorage.setItem(KEY, JSON.stringify(fresh))
    } catch {
      /* ignore storage failures; the code is still usable in-memory */
    }
    setRoom(fresh)
    setExpired(false)
    setNow(Date.now())
  }, [])

  return {
    code: expired ? null : room?.code ?? null,
    remainingMs,
    expired,
    createOrReuse,
  }
}

/** Format milliseconds as M:SS for the "Expires in 4:37" label. */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
