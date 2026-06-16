import { useCallback, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export interface AuthState {
  /** True once the initial session check has resolved. */
  ready: boolean
  user: User | null
  username: string | null
  signUp: (email: string, password: string, username: string) => Promise<{ error?: string; needsConfirm?: boolean }>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

export function useAuth(): AuthState {
  const [ready, setReady] = useState(!supabase)
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) return
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setUser(data.session?.user ?? null)
      setReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  // Resolve a display name: prefer the username set at signup, fall back to the
  // profiles row, then the email local-part.
  useEffect(() => {
    if (!supabase || !user) {
      setUsername(null)
      return
    }
    const meta = (user.user_metadata ?? {}) as { username?: string }
    if (meta.username) {
      setUsername(meta.username)
      return
    }
    let active = true
    supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (!active) return
        setUsername(data?.username ?? user.email?.split('@')[0] ?? 'player')
      })
    return () => {
      active = false
    }
  }, [user])

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      if (!supabase) return { error: 'Multiplayer is not configured.' }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: name } },
      })
      if (error) return { error: error.message }
      // No session means email confirmation is required.
      const needsConfirm = !data.session
      return { needsConfirm }
    },
    [],
  )

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'Multiplayer is not configured.' }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return {}
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }, [])

  return { ready, user, username, signUp, signIn, signOut }
}
