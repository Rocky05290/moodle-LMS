import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import type { Role, User } from '../data/mock'
import { users } from '../data/mock'

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
      {/* welcome heading */}
      <h2 className="bg-gradient-to-r from-brand-600 via-indigo-500 to-violet-500 bg-clip-text text-center text-[21px] leading-tight font-extrabold tracking-tight text-transparent">
        Welcome to the CORDOBA!
      </h2>
      <p className="mt-1 text-center text-[11.5px] font-medium text-ink-400">
        Sign in to your training portal
      </p>

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
        <label className="mb-1 block text-[10.5px] font-bold tracking-wide text-ink-500 uppercase">
          Email
        </label>
        <div className="flex items-center gap-2 rounded-lg border border-brand-500/30 bg-soft px-3 py-2 transition-colors focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/15">
          <Mail size={15} className="flex-none text-brand-500" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.bh"
            className="w-full bg-transparent text-[12.5px] font-medium text-navy-900 outline-none placeholder:text-ink-400"
          />
        </div>
      </div>

      {/* password */}
      <div className="mt-2.5">
        <label className="mb-1 block text-[10.5px] font-bold tracking-wide text-ink-500 uppercase">
          Password
        </label>
        <div className="flex items-center gap-2 rounded-lg border border-brand-500/30 bg-soft px-3 py-2 transition-colors focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/15">
          <Lock size={15} className="flex-none text-brand-500" />
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

      {/* sign in — vibrant gradient */}
      <button
        onClick={submit}
        className="group relative mt-4 w-full cursor-pointer overflow-hidden rounded-lg bg-gradient-to-r from-brand-500 via-indigo-500 to-violet-500 py-3 text-[13px] font-extrabold tracking-[0.12em] text-white shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/40 active:translate-y-0"
      >
        {/* sheen */}
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        <span className="relative flex items-center justify-center gap-2">
          SIGN IN <ArrowRight size={15} />
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
        <a href="#" className="font-extrabold text-brand-600 transition-colors hover:text-brand-700">
          Create an account
        </a>
      </p>
    </div>
  )
}
