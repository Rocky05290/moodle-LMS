import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, GraduationCap, Users, BookOpen, ArrowRight, Lock, ArrowLeft } from 'lucide-react'
import type { Role, User } from '../data/mock'
import { users } from '../data/mock'

const ROLES: { role: Role; label: string; icon: typeof Users; demoId: number; home: string }[] = [
  { role: 'admin', label: 'Admin', icon: Users, demoId: 1, home: '/admin' },
  { role: 'trainer', label: 'Trainer', icon: BookOpen, demoId: 104, home: '/trainer' },
  { role: 'learner', label: 'Learner', icon: GraduationCap, demoId: 101, home: '/learner' },
  { role: 'auditor', label: 'Auditor', icon: ShieldCheck, demoId: 108, home: '/auditor' },
]

export default function Login({ onSignIn }: { onSignIn: (u: User) => void }) {
  const [role, setRole] = useState<Role>('admin')
  const navigate = useNavigate()
  const active = ROLES.find((r) => r.role === role)!
  const demoUser = users.find((u) => u.id === active.demoId)!

  const submit = () => {
    onSignIn(demoUser)
    navigate(active.home)
  }

  return (
    <div className="relative flex min-h-full items-center justify-center overflow-hidden p-5">
      {/* animated navy backdrop */}
      <div
        className="kenburns absolute inset-0 bg-navy-900 bg-cover bg-center"
        style={{ backgroundImage: 'url(/hero.jpg)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-navy-950/95 via-navy-900/92 to-brand-700/80" />
      <div className="floaty pointer-events-none absolute -top-24 -left-16 h-96 w-96 rounded-full bg-brand-500/25 blur-[120px]" />
      <div
        className="floaty pointer-events-none absolute right-0 bottom-0 h-96 w-96 rounded-full bg-brand-400/16 blur-[120px]"
        style={{ animationDelay: '-3s' }}
      />

      {/* back to site */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-5 left-5 z-10 flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-[12.5px] font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/16"
      >
        <ArrowLeft size={14} /> Back to site
      </button>

      {/* card */}
      <div className="rise relative z-10 w-full max-w-md">
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/40">
          {/* navy header */}
          <div className="relative bg-navy-900 px-8 py-7 text-center">
            <span className="relative z-10 inline-flex items-center rounded-lg bg-white px-3 py-2 shadow-sm">
              <img src="/logo.png" alt="Cordoba Training Center" className="h-7 w-auto" />
            </span>
            <p className="relative z-10 mt-3 text-[12.5px] font-semibold tracking-wide text-white/60">
              Sign in to your portal
            </p>
            {/* shimmer */}
            <span className="pointer-events-none absolute inset-0 overflow-hidden">
              <span
                className="absolute top-0 left-0 h-full w-16 bg-white/10"
                style={{ animation: 'shine 4.5s ease-in-out infinite' }}
              />
            </span>
          </div>

          <div className="p-8">
            <label className="mb-2 block text-[11px] font-bold tracking-wide text-ink-500 uppercase">
              Select role
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {ROLES.map((r) => {
                const Icon = r.icon
                const on = r.role === role
                return (
                  <button
                    key={r.role}
                    onClick={() => setRole(r.role)}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3.5 py-3 text-[13px] font-bold transition-all ${
                      on
                        ? 'border-brand-500 bg-brand-50 text-brand-600'
                        : 'border-line bg-soft text-ink-500 hover:bg-soft2'
                    }`}
                  >
                    <Icon size={16} />
                    {r.label}
                  </button>
                )
              })}
            </div>

            <div className="mt-6 space-y-3">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold tracking-wide text-ink-500 uppercase">
                  Email
                </label>
                <input
                  readOnly
                  value={demoUser.email}
                  className="w-full rounded-lg border border-line bg-soft px-3.5 py-3 text-[13.5px] outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-bold tracking-wide text-ink-500 uppercase">
                  Password
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-line bg-soft px-3.5 py-3 focus-within:border-brand-500">
                  <Lock size={14} className="text-ink-400" />
                  <input
                    type="password"
                    defaultValue="demo1234"
                    className="w-full bg-transparent text-[13.5px] outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={submit}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3.5 text-[14px] font-bold text-white shadow-lg shadow-brand-600/25 transition-all hover:-translate-y-0.5 hover:bg-brand-600"
            >
              Continue as {active.label} <ArrowRight size={16} />
            </button>

            <div className="mt-4 flex items-center justify-between text-[12px]">
              <a href="#" className="font-semibold text-brand-600 hover:text-brand-700">
                Forgot password?
              </a>
              <span className="text-ink-400">Demo · credentials pre-filled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
