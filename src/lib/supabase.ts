// Supabase client. Reads credentials from Vite env vars at build time.
//
// If the env vars are absent the client is `null` and the app stays in
// solo-only mode — multiplayer, accounts and the leaderboard are simply hidden,
// so the game still runs with no configuration.

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: true, autoRefreshToken: true },
      realtime: { params: { eventsPerSecond: 20 } },
    })
  : null

// Dev-only: expose the client for quick debugging in the console.
if (import.meta.env.DEV && supabase) {
  ;(window as unknown as { supabase: SupabaseClient }).supabase = supabase
}
