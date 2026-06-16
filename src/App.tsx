import { useCallback, useState } from 'react'
import { isSupabaseConfigured } from './lib/supabase'
import { saveResult } from './lib/multiplayer'
import { useAuth } from './hooks/useAuth'
import { SoloGame } from './components/SoloGame'
import { MultiplayerGame } from './components/MultiplayerGame'
import { Leaderboard } from './components/Leaderboard'
import { AuthPanel } from './components/AuthPanel'

type View = 'solo' | 'multiplayer' | 'leaderboard'

export default function App() {
  const auth = useAuth()
  const [view, setView] = useState<View>('solo')
  const [authOpen, setAuthOpen] = useState(false)

  // Solo personal bests also feed the global leaderboard when signed in.
  const handleSoloComplete = useCallback(
    (r: {
      algorithmId: string
      languageId: string
      wpm: number
      accuracy: number
      errors: number
      timeMs: number
    }) => {
      if (!auth.user || !auth.username) return
      void saveResult({
        playerId: auth.user.id,
        username: auth.username,
        algorithmId: r.algorithmId,
        languageId: r.languageId,
        wpm: r.wpm,
        accuracy: r.accuracy,
        errors: r.errors,
        timeMs: r.timeMs,
      })
    },
    [auth.user, auth.username],
  )

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">&#9654;</span>
            <span className="brand-name">Code<span className="brand-accent">Racer</span></span>
          </div>
          {isSupabaseConfigured && (
            <div className="account">
              {auth.user ? (
                <>
                  <span className="account-name">@{auth.username ?? '…'}</span>
                  <button className="control-btn account-btn" onClick={() => auth.signOut()}>
                    Sign out
                  </button>
                </>
              ) : (
                <button className="control-btn account-btn" onClick={() => setAuthOpen(true)}>
                  Sign in
                </button>
              )}
            </div>
          )}
        </div>
        <p className="tagline">Type real algorithms. Beat your own speed{isSupabaseConfigured ? ' — or race a friend' : ''}.</p>

        {isSupabaseConfigured && (
          <nav className="nav-tabs">
            <button className={'nav-tab' + (view === 'solo' ? ' selected' : '')} onClick={() => setView('solo')}>
              Solo
            </button>
            <button
              className={'nav-tab' + (view === 'multiplayer' ? ' selected' : '')}
              onClick={() => setView('multiplayer')}
            >
              Multiplayer
            </button>
            <button
              className={'nav-tab' + (view === 'leaderboard' ? ' selected' : '')}
              onClick={() => setView('leaderboard')}
            >
              Leaderboard
            </button>
          </nav>
        )}
      </header>

      {view === 'solo' && <SoloGame onComplete={handleSoloComplete} />}

      {view === 'multiplayer' && (
        <MultiplayerView
          ready={auth.ready}
          userId={auth.user?.id ?? null}
          username={auth.username}
          onSignIn={() => setAuthOpen(true)}
        />
      )}

      {view === 'leaderboard' && <Leaderboard />}

      {authOpen && <AuthPanel auth={auth} onClose={() => setAuthOpen(false)} />}
    </div>
  )
}

function MultiplayerView({
  ready,
  userId,
  username,
  onSignIn,
}: {
  ready: boolean
  userId: string | null
  username: string | null
  onSignIn: () => void
}) {
  if (!ready) return <div className="notice">Loading…</div>
  if (!userId) {
    return (
      <div className="notice signin-prompt">
        <p>Sign in to race against other players and save your scores.</p>
        <button className="control-btn primary" onClick={onSignIn}>Sign in / Sign up</button>
      </div>
    )
  }
  if (!username) return <div className="notice">Loading profile…</div>
  return <MultiplayerGame userId={userId} username={username} />
}
