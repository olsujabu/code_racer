import { supabase } from './supabase'
import type { LanguageId } from '../data/snippets'

export type RoomPhase = 'lobby' | 'countdown' | 'racing'

export interface PlayerState {
  id: string
  username: string
  ready: boolean
  /** 0..1 of the snippet typed correctly. */
  progress: number
  wpm: number
  finished: boolean
  finishWpm: number
  finishAccuracy: number
  finishMs: number
}

export interface StartPayload {
  algorithmId: string
  languageId: LanguageId
  /** Epoch ms when typing unlocks (shared countdown target). */
  startAt: number
  /** Identifies a distinct race so engines reset on a rematch. */
  raceId: string
}

/** Unambiguous room code (no 0/O/1/I/L). */
export function makeRoomCode(): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 5; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return code
}

export interface SaveResultInput {
  playerId: string
  username: string
  algorithmId: string
  languageId: string
  roomCode?: string | null
  wpm: number
  accuracy: number
  errors: number
  timeMs: number
}

export async function saveResult(r: SaveResultInput): Promise<{ error?: string }> {
  if (!supabase) return { error: 'not configured' }
  const { error } = await supabase.from('match_results').insert({
    player_id: r.playerId,
    username: r.username,
    algorithm_id: r.algorithmId,
    language_id: r.languageId,
    room_code: r.roomCode ?? null,
    wpm: r.wpm,
    accuracy: r.accuracy,
    errors: r.errors,
    time_ms: r.timeMs,
  })
  return error ? { error: error.message } : {}
}

export interface LeaderRow {
  username: string
  algorithm_id: string
  language_id: string
  wpm: number
  accuracy: number
  created_at: string
}

export async function fetchLeaderboard(
  filter: { algorithmId?: string; languageId?: string },
  limit = 25,
): Promise<{ rows: LeaderRow[]; error?: string }> {
  if (!supabase) return { rows: [] }
  let query = supabase
    .from('match_results')
    .select('username, algorithm_id, language_id, wpm, accuracy, created_at')
    .order('wpm', { ascending: false })
    .limit(limit)
  if (filter.algorithmId) query = query.eq('algorithm_id', filter.algorithmId)
  if (filter.languageId) query = query.eq('language_id', filter.languageId)
  const { data, error } = await query
  return { rows: (data as LeaderRow[]) ?? [], error: error?.message }
}
