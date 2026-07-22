import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Zap, Mail, Lock } from 'lucide-react'
import type { Role, User } from '../data/mock'
import { users } from '../data/mock'

const ROLES: { role: Role; label: string; demoId: number; home: string }[] = [
  { role: 'admin', label: 'Admin', demoId: 1, home: '/admin' },
  { role: 'trainer', label: 'Trainer', demoId: 104, home: '/trainer' },
  { role: 'learner', label: 'Learner', demoId: 101, home: '/learner' },
  { role: 'auditor', label: 'Auditor', demoId: 108, home: '/auditor' },
]

const emailFor = (demoId: number) => users.find((u) => u.id === demoId)!.email

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C39 39.2 44 34 44 24c0-1.3-.1-2.7-.4-3.9z" />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 384 512" className="h-5 w-5 text-navy-900" fill="currentColor">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zM262.1 104.5c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  )
}

export default function LoginCard({ onSignIn }: { onSignIn: (u: User) => void }) {
  const [role, setRole] = useState<Role>('admin')
  const [email, setEmail] = useState(emailFor(1))
  const [password, setPassword] = useState('demo1234')
  const [showPw, setShowPw] = useState(false)
  const navigate = useNavigate()
  const active = ROLES.find((r) => r.role === role)!
  const demoUser = users.find((u) => u.id === active.demoId)!

  const pickRole = (r: (typeof ROLES)[number]) => {
    setRole(r.role)
    setEmail(emailFor(r.demoId))
  }

  const submit = () => {
    onSignIn(demoUser)
    navigate(active.home)
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border-2 border-brand-500 bg-white p-5 shadow-2xl shadow-black/25">
      {/* icon */}
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/30">
        <Zap size={18} className="text-white" fill="currentColor" />
      </div>
      <p className="mt-2 text-center text-[12px] font-semibold text-ink-500">Access your account</p>

      {/* role segmented control */}
      <div className="mt-4 grid grid-cols-4 gap-1 rounded-md border border-brand-500/25 bg-soft p-1">
        {ROLES.map((r) => {
          const on = r.role === role
          return (
            <button
              key={r.role}
              onClick={() => pickRole(r)}
              className={`cursor-pointer rounded py-1 text-[10.5px] font-bold transition-all ${
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
        <label className="mb-1 block text-[10.5px] font-semibold text-ink-500">Email</label>
        <div className="flex items-center gap-2 rounded-lg border border-brand-500/30 bg-soft px-3 py-2 transition-colors focus-within:border-brand-500">
          <Mail size={15} className="flex-none text-brand-500" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.bh"
            className="w-full bg-transparent text-[12.5px] text-navy-900 outline-none placeholder:text-ink-400"
          />
        </div>
      </div>

      {/* password */}
      <div className="mt-2.5">
        <label className="mb-1 block text-[10.5px] font-semibold text-ink-500">Password</label>
        <div className="flex items-center gap-2 rounded-lg border border-brand-500/30 bg-soft px-3 py-2 transition-colors focus-within:border-brand-500">
          <Lock size={15} className="flex-none text-brand-500" />
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-transparent text-[12.5px] text-navy-900 outline-none placeholder:text-ink-400"
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

      {/* keep signed / forgot */}
      <div className="mt-3 flex items-center justify-between text-[11px]">
        <label className="flex cursor-pointer items-center gap-1.5 text-ink-600">
          <input type="checkbox" className="h-3 w-3 accent-brand-500" />
          Keep me signed in
        </label>
        <a href="#" className="font-semibold text-brand-600 transition-colors hover:text-brand-700">
          Forgot password?
        </a>
      </div>

      {/* sign in */}
      <button
        onClick={submit}
        className="mt-4 w-full cursor-pointer rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 py-2.5 text-[12.5px] font-extrabold tracking-wide text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
      >
        SIGN IN
      </button>

      {/* OR */}
      <div className="my-3.5 flex items-center gap-3 text-[10.5px] font-semibold text-ink-400">
        <span className="h-px flex-1 bg-navy-900/12" />
        OR
        <span className="h-px flex-1 bg-navy-900/12" />
      </div>

      {/* social — icon only, one row */}
      <div className="flex gap-2.5">
        <button
          onClick={submit}
          aria-label="Continue with Google"
          className="flex flex-1 cursor-pointer items-center justify-center rounded-lg border border-brand-500/25 bg-white py-2.5 transition-all hover:bg-soft"
        >
          <GoogleIcon />
        </button>
        <button
          onClick={submit}
          aria-label="Continue with Apple"
          className="flex flex-1 cursor-pointer items-center justify-center rounded-lg border border-brand-500/25 bg-white py-2.5 transition-all hover:bg-soft"
        >
          <AppleIcon />
        </button>
      </div>

      {/* create account */}
      <p className="mt-4 text-center text-[11.5px] text-ink-600">
        New here?{' '}
        <a href="#" className="font-bold text-brand-600 transition-colors hover:text-brand-700">
          Create an account
        </a>
      </p>
    </div>
  )
}
