import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ArrowRight, AudioLines, Eye, EyeOff, Headphones, LockKeyhole, Mail, UserRound } from 'lucide-react'
import './AuthScreen.css'
import ecobeatsLogo from './assets/Ecobeats.png'

const USERS_KEY = 'morrow.auth.users'
const SESSION_KEY = 'morrow.auth.session'

function readUsers() {
  try {
    const value = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

async function hashPassword(password, salt) {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: encoder.encode(salt), iterations: 150000, hash: 'SHA-256' }, keyMaterial, 256)
  return Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function createSalt() {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function AuthScreen({ onAuthenticated }) {
  const screenRef = useRef(null)
  const formRef = useRef(null)
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo('.auth-art-copy > *', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out', delay: 0.15 })
      gsap.fromTo('.auth-form-panel', { x: 24, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' })
      gsap.fromTo('.auth-brand', { y: -8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: 'power2.out' })
    }, screenRef)
    return () => context.revert()
  }, [])

  useEffect(() => {
    if (!formRef.current) return
    gsap.fromTo(formRef.current, { y: 8, opacity: 0.65 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' })
  }, [mode])

  const changeMode = (nextMode) => {
    setError('')
    setMode(nextMode)
  }

  const authenticate = async (event) => {
    event.preventDefault()
    setError('')
    const normalizedEmail = email.trim().toLowerCase()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Enter a valid email address to continue.')
      return
    }
    if (password.length < 8) {
      setError('Use a password with at least 8 characters.')
      return
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Add your name so we know what to call you.')
      return
    }
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Those passwords do not match yet.')
      return
    }
    if (!crypto?.subtle || !crypto?.getRandomValues) {
      setError('Secure local sign-in is unavailable in this browser.')
      return
    }

    setSubmitting(true)
    try {
      const users = readUsers()
      const existing = users.find((user) => user.email === normalizedEmail)

      if (mode === 'signup') {
        if (existing) {
          setError('An account with this email already exists. Try signing in.')
          return
        }
        const salt = createSalt()
        const user = { name: name.trim(), email: normalizedEmail, salt, passwordHash: await hashPassword(password, salt) }
        localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]))
        localStorage.setItem(SESSION_KEY, JSON.stringify({ name: user.name, email: user.email }))
        onAuthenticated({ name: user.name, email: user.email })
        return
      }

      if (!existing || await hashPassword(password, existing.salt) !== existing.passwordHash) {
        setError('That email and password combination did not match.')
        return
      }
      const session = { name: existing.name, email: existing.email }
      if (remember) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
      else sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
      onAuthenticated(session)
    } catch {
      setError('Your browser could not save this account. Check local storage settings and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-screen" ref={screenRef}>
      <section className="auth-art" aria-label="EcoBeats music">
        <div className="auth-art-image" />
        <div className="auth-art-shade" />
        <a className="auth-brand" href="#welcome" aria-label="EcoBeats"><img src={ecobeatsLogo} alt="EcoBeats by Rutik Gharmode" /></a>
        <div className="art-index"><span>ISSUE 01</span><span>YOUR SOUND, YOUR SPACE</span></div>
        <div className="auth-art-copy">
          <span className="auth-overline"><span /> A PLACE FOR EVERY VERSION OF YOU</span>
          <h1>Find your<br />own <em>frequency.</em></h1>
          <p>Somewhere between the first note and the last light, there you are.</p>
          <div className="art-bottomline"><span><Headphones size={15} /> LISTEN CLOSELY</span><span>01 / 06</span></div>
        </div>
        <div className="sound-mark" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
      </section>

      <section className="auth-form-panel">
        <div className="form-topline"><span>YOUR LISTENING LIFE, IN TUNE</span><span className="form-status"><i /> PRIVATE SESSION</span></div>
        <div className="auth-form-content" ref={formRef}>
          <div className="auth-heading">
            <span className="auth-heading-icon"><AudioLines size={17} /></span>
            <p>{mode === 'login' ? 'WELCOME BACK' : 'START YOUR NEXT CHAPTER'}</p>
            <h2>{mode === 'login' ? <>The good part<br />starts <em>here.</em></> : <>Make room<br />for <em>more.</em></>}</h2>
            <span className="auth-subtitle">{mode === 'login' ? 'Sign in and settle back into your sound.' : 'Create an account. Bring your whole self.'}</span>
          </div>

          <div className="auth-mode-tabs" role="tablist" aria-label="Account access">
            <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'selected' : ''} onClick={() => changeMode('login')}>Sign in</button>
            <button type="button" role="tab" aria-selected={mode === 'signup'} className={mode === 'signup' ? 'selected' : ''} onClick={() => changeMode('signup')}>Create account</button>
          </div>

          <form className="auth-form" onSubmit={authenticate} noValidate>
            {mode === 'signup' && <label className="auth-field"><span>Your name</span><span className="auth-input-wrap"><UserRound size={16} /><input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="What should we call you?" required /></span></label>}
            <label className="auth-field"><span>Email address</span><span className="auth-input-wrap"><Mail size={16} /><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></span></label>
            <label className="auth-field"><span>Password</span><span className="auth-input-wrap"><LockKeyhole size={16} /><input type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" required minLength={8} /><button className="password-toggle" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></span></label>
            {mode === 'signup' && <label className="auth-field"><span>Confirm password</span><span className="auth-input-wrap"><LockKeyhole size={16} /><input type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Type it one more time" required /></span></label>}
            {mode === 'login' && <label className="remember-row"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /><span className="custom-check" /><span>Keep me signed in</span><button type="button" onClick={() => setError('For this local demo, create a new account to reset access.')}>Forgot password?</button></label>}
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? 'One moment…' : mode === 'login' ? 'Sign in to EcoBeats' : 'Create my account'}<span><ArrowRight size={17} /></span></button>
          </form>

          <p className="auth-switch">{mode === 'login' ? 'New around here?' : 'Already have an account?'} <button type="button" onClick={() => changeMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Create an account' : 'Sign in'}</button></p>
          <p className="local-note">Accounts are saved in this browser only. This demo is not a secure production authentication service.</p>
        </div>
        <footer className="auth-footer"><span>© ECOBEATS</span><span>GOOD FOR YOUR EARS <i>✳</i></span></footer>
      </section>
    </main>
  )
}

export default AuthScreen
