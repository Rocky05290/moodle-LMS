import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, ArrowRight, User as UserIcon } from 'lucide-react'
import type { Role, User } from '../data/mock'
import { users } from '../data/mock'
import { supabase, hasSupabase, createAccount } from '../lib/supabase'

const ROLES: { role: Role; label: string; demoId: number; home: string }[] = [
  { role: 'admin', label: 'Admin', demoId: 1, home: '/admin' },
  { role: 'trainer', label: 'Trainer', demoId: 104, home: '/trainer' },
  { role: 'learner', label: 'Learner', demoId: 101, home: '/learner' },
  { role: 'auditor', label: 'Auditor', demoId: 108, home: '/auditor' },
]

const emailFor = (demoId: number) => users.find((u) => u.id === demoId)!.email

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

export default function LoginCard({ onSignIn }: { onSignIn: (u: User) => void }) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [role, setRole] = useState<Role>('admin')
  const [email, setEmail] = useState(emailFor(1))
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
  const active = ROLES.find((r) => r.role === role)!
  const demoUser = users.find((u) => u.id === active.demoId)!

  const pickRole = (r: (typeof ROLES)[number]) => {
    setRole(r.role)
    setEmail(emailFor(r.demoId))
  }

  const submit = async () => {
    setErr('')
    setNotice('')
    // When the backend is connected, a REAL login is required — wrong
    // credentials are rejected (no bypass).
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
    // No backend connected → local demo preview only
    onSignIn(demoUser)
    navigate(active.home)
  }

  const register = async () => {
    setErr('')
    setNotice('')
    if (!suFirst || !suLast || !suEmail || !suPass) {
      setErr('Please fill in every field.')
      return
    }
    if (suPass.length < 6) {
      setErr('Password must be at least 6 characters.')
      return
    }
    if (!hasSupabase) {
      setErr('The backend is not connected yet.')
      return
    }
    setBusy(true)
    const res = await createAccount({
      email: suEmail,
      password: suPass,
      firstName: suFirst,
      lastName: suLast,
      role: 'learner',
    })
    setBusy(false)
    if (!res.ok) {
      setErr(res.error ?? 'Could not create your account.')
      return
    }
    setNotice('✓ Account created! Confirm your email, then sign in below.')
    setEmail(suEmail)
    setPassword('')
    setMode('signin')
    setSuFirst('')
    setSuLast('')
    setSuEmail('')
    setSuPass('')
  }

  const toSignup = () => {
    setErr('')
    setNotice('')
    setMode('signup')
  }
  const toSignin = () => {
    setErr('')
    setNotice('')
    setMode('signin')
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border-2 border-brand-500 bg-white p-5 shadow-2xl shadow-black/25">
      {/* heading */}
      <h2 className="bg-gradient-to-r from-brand-600 via-indigo-500 to-violet-500 bg-clip-text text-center text-[21px] leading-tight font-extrabold tracking-tight text-transparent">
        {mode === 'signin' ? 'Welcome to CORDOBA!' : 'Create your account'}
      </h2>
      <p className="mt-1 text-center text-[11.5px] font-medium text-ink-400">
        {mode === 'signin' ? 'Sign in to your training portal' : 'Register as a new learner'}
      </p>

      {notice && (
        <p className="mt-4 rounded-md border border-ok-600/20 bg-ok-50 px-3 py-2 text-center text-[12px] font-semibold text-ok-600">
          {notice}
        </p>
      )}

      {mode === 'signin' ? (
        <>
          {/* role segmented control */}
          <div className="mt-4 grid grid-cols-4 gap-1 rounded-md border border-brand-500/25 bg-soft p-1">
            {ROLES.map((r) => {
              const on = r.role === role
              return (
                <button
                  key={r.role}
                  onClick={() => pickRole(r)}
                  className={`cursor-pointer rounded py-1 text-[10.5px] font-bold tracking-wide transition-all ${
                    on ? 'bg-brand-500 text-white shadow' : 'text-ink-500 hover:text-navy-900'
                  }`}
                >
                  {r.label}
                </button>
              )
            })}
          </div>

          {/* email */}
          <div className="mt-4">
            <label className="mb-1 block text-[10.5px] font-bold tracking-wide text-ink-500 uppercase">Email</label>
            <div className="flex items-center gap-2 rounded-lg border border-brand-500/30 bg-soft px-3 py-2 transition-colors focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/15">
              <Mail size={15} className="flex-none text-brand-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder="you@company.bh"
                className="w-full bg-transparent text-[12.5px] font-medium text-navy-900 outline-none placeholder:text-ink-400"
              />
            </div>
          </div>

          {/* password */}
          <div className="mt-2.5">
            <label className="mb-1 block text-[10.5px] font-bold tracking-wide text-ink-500 uppercase">Password</label>
            <div className="flex items-center gap-2 rounded-lg border border-brand-500/30 bg-soft px-3 py-2 transition-colors focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/15">
              <Lock size={15} className="flex-none text-brand-500" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder="••••••••"
                className="w-full bg-transparent text-[12.5px] font-medium text-navy-900 outline-none placeholder:text-ink-400"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="flex-none cursor-pointer text-ink-400 transition-colors hover:text-navy-900"
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* remember / forgot */}
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <label className="flex cursor-pointer items-center gap-1.5 font-medium text-ink-600">
              <input type="checkbox" className="h-3 w-3 accent-brand-500" />
              Remember me
            </label>
            <a href="#" className="font-bold text-brand-600 transition-colors hover:text-brand-700">
              Forgot password?
            </a>
          </div>

          {err && (
            <p className="mt-4 rounded-md border border-bad-600/20 bg-bad-50 px-3 py-2 text-center text-[12px] font-semibold text-bad-600">
              {err}
            </p>
          )}

          {/* sign in */}
          <button
            onClick={submit}
            disabled={busy}
            className="group relative mt-4 w-full cursor-pointer overflow-hidden rounded-lg bg-gradient-to-r from-brand-500 via-indigo-500 to-violet-500 py-3 text-[13px] font-extrabold tracking-[0.12em] text-white shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/40 active:translate-y-0 disabled:opacity-70"
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative flex items-center justify-center gap-2">
              {busy ? 'SIGNING IN…' : 'SIGN IN'} <ArrowRight size={15} />
            </span>
          </button>

          {/* OR */}
          <div className="my-3.5 flex items-center gap-3 text-[10.5px] font-semibold text-ink-400">
            <span className="h-px flex-1 bg-navy-900/12" />
            OR
            <span className="h-px flex-1 bg-navy-900/12" />
          </div>

          {/* Microsoft 365 sign-in */}
          <button
            onClick={submit}
            className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-lg border border-brand-500/25 bg-white px-4 py-2.5 text-[12.5px] font-bold text-navy-900 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-md"
          >
            <MicrosoftIcon /> Sign in with Microsoft 365
          </button>

          {/* create account */}
          <p className="mt-4 text-center text-[11.5px] font-medium text-ink-600">
            New here?{' '}
            <button onClick={toSignup} className="cursor-pointer font-extrabold text-brand-600 transition-colors hover:text-brand-700">
              Create an account
            </button>
          </p>
        </>
      ) : (
        <>
          {/* first / last name */}
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <div>
              <label className="mb-1 block text-[10.5px] font-bold tracking-wide text-ink-500 uppercase">First name</label>
              <div className="flex items-center gap-2 rounded-lg border border-brand-500/30 bg-soft px-3 py-2 transition-colors focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/15">
                <UserIcon size={15} className="flex-none text-brand-500" />
                <input
                  value={suFirst}
                  onChange={(e) => setSuFirst(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && register()}
                  placeholder="Ali"
                  className="w-full bg-transparent text-[12.5px] font-medium text-navy-900 outline-none placeholder:text-ink-400"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[10.5px] font-bold tracking-wide text-ink-500 uppercase">Last name</label>
              <div className="flex items-center gap-2 rounded-lg border border-brand-500/30 bg-soft px-3 py-2 transition-colors focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/15">
                <input
                  value={suLast}
                  onChange={(e) => setSuLast(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && register()}
                  placeholder="Hassan"
                  className="w-full bg-transparent text-[12.5px] font-medium text-navy-900 outline-none placeholder:text-ink-400"
                />
              </div>
            </div>
          </div>

          {/* email */}
          <div className="mt-2.5">
            <label className="mb-1 block text-[10.5px] font-bold tracking-wide text-ink-500 uppercase">Email</label>
            <div className="flex items-center gap-2 rounded-lg border border-brand-500/30 bg-soft px-3 py-2 transition-colors focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/15">
              <Mail size={15} className="flex-none text-brand-500" />
              <input
                type="email"
                value={suEmail}
                onChange={(e) => setSuEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && register()}
                placeholder="you@company.bh"
                className="w-full bg-transparent text-[12.5px] font-medium text-navy-900 outline-none placeholder:text-ink-400"
              />
            </div>
          </div>

          {/* password */}
          <div className="mt-2.5">
            <label className="mb-1 block text-[10.5px] font-bold tracking-wide text-ink-500 uppercase">Password</label>
            <div className="flex items-center gap-2 rounded-lg border border-brand-500/30 bg-soft px-3 py-2 transition-colors focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/15">
              <Lock size={15} className="flex-none text-brand-500" />
              <input
                type={showPw ? 'text' : 'password'}
                value={suPass}
                onChange={(e) => setSuPass(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && register()}
                placeholder="At least 6 characters"
                className="w-full bg-transparent text-[12.5px] font-medium text-navy-900 outline-none placeholder:text-ink-400"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="flex-none cursor-pointer text-ink-400 transition-colors hover:text-navy-900"
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {err && (
            <p className="mt-4 rounded-md border border-bad-600/20 bg-bad-50 px-3 py-2 text-center text-[12px] font-semibold text-bad-600">
              {err}
            </p>
          )}

          {/* create button */}
          <button
            onClick={register}
            disabled={busy}
            className="group relative mt-4 w-full cursor-pointer overflow-hidden rounded-lg bg-gradient-to-r from-brand-500 via-indigo-500 to-violet-500 py-3 text-[13px] font-extrabold tracking-[0.12em] text-white shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/40 active:translate-y-0 disabled:opacity-70"
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative flex items-center justify-center gap-2">
              {busy ? 'CREATING…' : 'CREATE ACCOUNT'} <ArrowRight size={15} />
            </span>
          </button>

          {/* back to sign in */}
          <p className="mt-4 text-center text-[11.5px] font-medium text-ink-600">
            Already have an account?{' '}
            <button onClick={toSignin} className="cursor-pointer font-extrabold text-brand-600 transition-colors hover:text-brand-700">
              Sign in
            </button>
          </p>
        </>
      )}
    </div>
  )
}
