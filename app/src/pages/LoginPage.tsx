import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, Check } from 'lucide-react'
import type { Role, User } from '../data/mock'
import { users } from '../data/mock'
import { supabase, hasSupabase } from '../lib/supabase'
import AppBgFx from '../components/AppBgFx'
import LandingLoader from '../components/LandingLoader'

const LOGO_GOLD =
  'brightness(0) saturate(100%) invert(72%) sepia(48%) saturate(720%) hue-rotate(2deg) brightness(94%) contrast(90%)'

// role tabs — picking one pre-fills the matching demo email
const ROLE_TABS: { role: Role; label: string; email: string }[] = [
  { role: 'admin', label: 'Admin', email: 'admin@cordoba.bh' },
  { role: 'trainer', label: 'Trainer', email: 'sayed@cordoba.bh' },
  { role: 'learner', label: 'Learner', email: 'ali@batelco.com.bh' },
  { role: 'auditor', label: 'Auditor', email: 'qa@cordoba.bh' },
]

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 23 23" className="h-[18px] w-[18px]">
      <path fill="#f25022" d="M1 1h10v10H1z" />
      <path fill="#7fba00" d="M12 1h10v10H12z" />
      <path fill="#00a4ef" d="M1 12h10v10H1z" />
      <path fill="#ffb900" d="M12 12h10v10H12z" />
    </svg>
  )
}

const BENEFITS = [
  { t: 'One database, five portals', d: 'Admin, trainer, learner, auditor and corporate — every role reads from the same live source of truth.' },
  { t: 'Attendance & grading, live', d: 'Daily registers, rubric grades and batch health tracked in real time, so you always know where each learner stands.' },
  { t: 'Tamkeen-ready compliance', d: 'Signed attendance registers and one-click compliance bundles, audit-tracked from enrolment to certificate.' },
]

/**
 * Dedicated split-screen login page (FundedRight-style):
 *  left  = sign-in / create-account form (gold CTA)
 *  right = dark benefits panel with a stat strip
 * Fully responsive: the right panel hides on small screens.
 */
export default function LoginPage({ onSignIn }: { onSignIn: (u: User) => void }) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [role, setRole] = useState<Role>('admin')
  const [email, setEmail] = useState('admin@cordoba.bh')
  const [password, setPassword] = useState('demo1234')
  const [showPw, setShowPw] = useState(false)
  const [err, setErr] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  // sign-up fields
  const [suFirst, setSuFirst] = useState('')
  const [suLast, setSuLast] = useState('')
  const [suEmail, setSuEmail] = useState('')
  const [suPass, setSuPass] = useState('')

  const navigate = useNavigate()

  const submit = async () => {
    setErr('')
    setNotice('')
    if (hasSupabase && supabase) {
      setBusy(true)
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error || !data.user) {
        setBusy(false)
        setErr('Invalid email or password.')
        return
      }
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle()
      setBusy(false)
      const r = (prof?.role ?? 'learner') as Role
      onSignIn({
        id: 0,
        firstName: (prof?.first_name as string) ?? '',
        lastName: (prof?.last_name as string) ?? '',
        email: data.user.email ?? email,
        mobile: (prof?.mobile as string) ?? '',
        cpr: (prof?.cpr as string) ?? '',
        role: r,
        company: (prof?.company as string) ?? undefined,
      })
      navigate('/' + r)
      return
    }
    // No backend connected → local demo preview
    const demo = users.find((u) => u.email === email) ?? users[0]
    onSignIn(demo)
    navigate('/' + demo.role)
  }

  const signInMicrosoft = async () => {
    setErr('')
    if (!hasSupabase || !supabase) { setErr('Backend not connected.'); return }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: { scopes: 'email openid profile', redirectTo: window.location.origin },
    })
    if (error) setErr(error.message)
  }

  const register = async () => {
    setErr('')
    setNotice('')
    if (!suFirst || !suLast || !suEmail || !suPass) { setErr('Please fill in every field.'); return }
    if (suPass.length < 6) { setErr('Password must be at least 6 characters.'); return }
    if (!hasSupabase || !supabase) { setErr('The backend is not connected yet.'); return }
    setBusy(true)
    const { error } = await supabase.auth.signUp({
      email: suEmail,
      password: suPass,
      options: { data: { first_name: suFirst, last_name: suLast, role: 'learner' } },
    })
    setBusy(false)
    if (error) { setErr(error.message); return }
    setNotice('✓ Account created! Confirm your email, then sign in.')
    setEmail(suEmail)
    setPassword('')
    setMode('signin')
    setSuFirst(''); setSuLast(''); setSuEmail(''); setSuPass('')
  }

  const field =
    'w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-[14px] text-white outline-none transition-colors placeholder:text-white/35 focus:border-gold-400/60 focus:bg-white/[0.06]'
  const label = 'mb-1.5 block text-[13px] font-bold text-white'

  return (
    <div className="relative grid min-h-screen bg-navy-950 lg:grid-cols-2">
      {/* 3D intro loader */}
      <LandingLoader />

      {/* interactive animated background behind everything */}
      <AppBgFx />

      {/* ---------------- left: form ---------------- */}
      <div className="relative z-10 flex flex-col bg-navy-950/70 px-5 py-8 backdrop-blur-sm sm:px-10 lg:px-14 xl:px-20">
        <div className="mb-10 flex items-center justify-between">
          <img src="/logo.png" alt="Cordoba" className="h-10 w-auto" style={{ filter: LOGO_GOLD }} />
          <Link to="/" className="flex items-center gap-1.5 text-[13px] font-semibold text-white/60 hover:text-white">
            <ArrowLeft size={15} /> Back to site
          </Link>
        </div>

        <div className="my-auto w-full max-w-md">
          <h1 className="text-[34px] leading-tight font-extrabold tracking-tight text-white sm:text-[40px]">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-2 text-[14px] text-white/55">
            {mode === 'signin'
              ? 'Sign in to reach your dashboard, batches and reports.'
              : 'Register as a new learner to get started.'}
          </p>

          {notice && (
            <p className="mt-6 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-[13px] font-semibold text-emerald-300">
              {notice}
            </p>
          )}
          {err && (
            <p className="mt-6 rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-[13px] font-semibold text-red-300">
              {err}
            </p>
          )}

          {mode === 'signin' ? (
            <div className="mt-8 space-y-4">
              {/* role selection — pick the portal you're signing into */}
              <div className="grid grid-cols-4 gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] p-1.5">
                {ROLE_TABS.map((t) => (
                  <button
                    key={t.role}
                    onClick={() => { setRole(t.role); setEmail(t.email); setErr('') }}
                    className={`rounded-lg py-2 text-[12.5px] font-bold transition-colors ${
                      role === t.role ? 'bg-gold-400 text-navy-950' : 'text-white/60 hover:bg-white/8 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <button
                onClick={signInMicrosoft}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/12 bg-white/[0.04] py-3 text-[14px] font-semibold text-white transition-colors hover:bg-white/[0.08]"
              >
                <MicrosoftIcon /> Continue with Microsoft 365
              </button>

              <div className="flex items-center gap-3 py-1 text-[12px] text-white/35">
                <span className="h-px flex-1 bg-white/10" /> or continue with email <span className="h-px flex-1 bg-white/10" />
              </div>

              <div>
                <label className={label}>Email address</label>
                <input className={field} type="email" placeholder="you@cordoba.bh" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-[13px] font-bold text-white">Password</label>
                  <button className="text-[12.5px] font-semibold text-gold-400 hover:text-gold-300">Forgot password?</button>
                </div>
                <div className="relative">
                  <input
                    className={field + ' pr-11'}
                    type={showPw ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submit()}
                  />
                  <button
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-white/40 hover:text-white/70"
                    aria-label="Toggle password"
                  >
                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-[13px] text-white/70">
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-gold-400" />
                Keep me signed in on this device
              </label>

              <button
                onClick={submit}
                disabled={busy}
                className="w-full rounded-xl bg-gold-400 py-3.5 text-[14px] font-bold tracking-wide text-navy-950 uppercase transition-all hover:-translate-y-0.5 hover:bg-gold-300 disabled:opacity-60"
              >
                {busy ? 'Signing in…' : 'Sign in'}
              </button>

              <p className="pt-1 text-center text-[13px] text-white/55">
                Don't have an account?{' '}
                <button onClick={() => { setMode('signup'); setErr(''); setNotice('') }} className="font-bold text-white underline underline-offset-2 hover:text-gold-400">
                  Create one
                </button>
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>First name</label>
                  <input className={field} placeholder="Ali" value={suFirst} onChange={(e) => setSuFirst(e.target.value)} />
                </div>
                <div>
                  <label className={label}>Last name</label>
                  <input className={field} placeholder="Al-Mansoori" value={suLast} onChange={(e) => setSuLast(e.target.value)} />
                </div>
              </div>
              <div>
                <label className={label}>Email address</label>
                <input className={field} type="email" placeholder="you@cordoba.bh" value={suEmail} onChange={(e) => setSuEmail(e.target.value)} />
              </div>
              <div>
                <label className={label}>Password</label>
                <input className={field} type="password" placeholder="At least 6 characters" value={suPass} onChange={(e) => setSuPass(e.target.value)} />
              </div>
              <button
                onClick={register}
                disabled={busy}
                className="w-full rounded-xl bg-gold-400 py-3.5 text-[14px] font-bold tracking-wide text-navy-950 uppercase transition-all hover:-translate-y-0.5 hover:bg-gold-300 disabled:opacity-60"
              >
                {busy ? 'Creating…' : 'Create account'}
              </button>
              <p className="pt-1 text-center text-[13px] text-white/55">
                Already have an account?{' '}
                <button onClick={() => { setMode('signin'); setErr(''); setNotice('') }} className="font-bold text-white underline underline-offset-2 hover:text-gold-400">
                  Sign in
                </button>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ---------------- right: benefits panel ---------------- */}
      <div className="relative z-10 hidden overflow-hidden border-l border-white/10 bg-gradient-to-br from-navy-900 to-navy-950 px-14 py-16 lg:flex lg:flex-col xl:px-20">
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gold-400/10 blur-[120px]" />
        <div className="relative my-auto max-w-lg">
          <h2 className="text-[32px] leading-tight font-extrabold tracking-tight text-white">
            Pick up exactly<br />where you left off.
          </h2>

          <div className="mt-10 space-y-7">
            {BENEFITS.map((b) => (
              <div key={b.t} className="flex gap-4">
                <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-gold-400/15 text-gold-400">
                  <Check size={14} strokeWidth={3} />
                </span>
                <div>
                  <div className="text-[15px] font-bold text-white">{b.t}</div>
                  <div className="mt-1 text-[13.5px] leading-relaxed text-white/55">{b.d}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03]">
            {[
              ['Portals', '5 roles'],
              ['Working week', 'Sun–Thu'],
              ['Compliance', 'Tamkeen'],
            ].map(([k, v]) => (
              <div key={k} className="px-5 py-4">
                <div className="text-[10.5px] font-bold tracking-[0.12em] text-white/40 uppercase">{k}</div>
                <div className="mt-1 text-[16px] font-extrabold text-white">{v}</div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-[12px] leading-relaxed text-white/35">
            Cordoba Training Center · Tamkeen-registered · Kingdom of Bahrain. Accounts become working logins once
            their email is confirmed.
          </p>
        </div>
      </div>
    </div>
  )
}
