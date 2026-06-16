import { useState, type FormEvent } from 'react'
import type { AuthState } from '../hooks/useAuth'

interface AuthPanelProps {
  auth: AuthState
  onClose: () => void
}

export function AuthPanel({ auth, onClose }: AuthPanelProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setBusy(true)
    try {
      if (mode === 'signup') {
        if (username.trim().length < 2) {
          setError('Pick a username (2+ characters).')
          return
        }
        const res = await auth.signUp(email.trim(), password, username.trim())
        if (res.error) setError(res.error)
        else if (res.needsConfirm) setInfo('Account created — check your email to confirm, then sign in.')
        else onClose()
      } else {
        const res = await auth.signIn(email.trim(), password)
        if (res.error) setError(res.error)
        else onClose()
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{mode === 'signin' ? 'Sign in' : 'Create account'}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">&#10005;</button>
        </div>

        <div className="seg-tabs">
          <button
            className={'seg-tab' + (mode === 'signin' ? ' selected' : '')}
            onClick={() => { setMode('signin'); setError(null); setInfo(null) }}
          >
            Sign in
          </button>
          <button
            className={'seg-tab' + (mode === 'signup' ? ' selected' : '')}
            onClick={() => { setMode('signup'); setError(null); setInfo(null) }}
          >
            Sign up
          </button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {mode === 'signup' && (
            <label className="field">
              <span>Username</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="speedtyper"
                maxLength={20}
                autoComplete="username"
              />
            </label>
          )}
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </label>

          {error && <div className="form-error">{error}</div>}
          {info && <div className="form-info">{info}</div>}

          <button className="control-btn primary auth-submit" type="submit" disabled={busy}>
            {busy ? 'Working…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
