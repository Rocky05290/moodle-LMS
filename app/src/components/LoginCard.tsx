import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, GraduationCap, Users, BookOpen, ArrowRight, Lock } from 'lucide-react'
import type { Role, User } from '../data/mock'
import { users } from '../data/mock'

const ROLES: { role: Role; label: string; icon: typeof Users; demoId: number; home: string }[] = [
  { role: 'admin', label: 'Admin', icon: Users, demoId: 1, home: '/admin' },
  { role: 'trainer', label: 'Trainer', icon: BookOpen, demoId: 104, home: '/trainer' },
  { role: 'learner', label: 'Learner', icon: GraduationCap, demoId: 101, home: '/learner' },
  { role: 'auditor', label: 'Auditor', icon: ShieldCheck, demoId: 108, home: '/auditor' },
]

export default function LoginCard({ onSignIn }: { onSignIn: (u: User) => void }) {
  const [role, setRole] = useState<Role>('admin')
  const navigate = useNavigate()
  const active = ROLES.find((r) => r.role === role)!
  const demoUser = users.find((u) => u.id === active.demoId)!

  const submit = () => {
    onSignIn(demoUser)
    navigate(active.home)
  }

  return (
    <div className="w-full overflow-hidden rounded-xl bg-white shadow-2xl shadow-black/40 ring-1 ring-black/5">
      {/* navy header */}
      <div className="bg-navy-900 px-6 py-5 text-center">
        <span className="inline-flex items-center rounded-md bg-white px-3 py-1.5 shadow-sm">
          <img src="/logo.png" alt="Cordoba Training Center" className="h-6 w-auto" />
        </span>
        <p className="mt-2.5 text-[12px] font-semibold tracking-wide text-white/60">
          Sign in to your portal
        </p>
      </div>

      <div className="p-6">
        <label className="mb-2 block text-[10.5px] font-bold tracking-wide text-ink-500 uppercase">
          Select role
        </label>
        <div className="grid grid-cols-2 gap-2">
          {ROLES.map((r) => {
            const Icon = r.icon
            const on = r.role === role
            return (
              <button
                key={r.role}
                onClick={() => setRole(r.role)}
                className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2.5 text-[12.5px] font-bold transition-all ${
                  on
                    ? 'border-brand-500 bg-brand-50 text-brand-600'
                    : 'border-line bg-soft text-ink-500 hover:bg-soft2'
                }`}
              >
                <Icon size={15} />
                {r.label}
              </button>
            )
          })}
        </div>

        <div className="mt-5 space-y-3">
          <div>
            <label className="mb-1.5 block text-[10.5px] font-bold tracking-wide text-ink-500 uppercase">
              Email
            </label>
            <input
              readOnly
              value={demoUser.email}
              className="w-full rounded-md border border-line bg-soft px-3.5 py-2.5 text-[13px] outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[10.5px] font-bold tracking-wide text-ink-500 uppercase">
              Password
            </label>
            <div className="flex items-center gap-2 rounded-md border border-line bg-soft px-3.5 py-2.5 focus-within:border-brand-500">
              <Lock size={14} className="text-ink-400" />
              <input
                type="password"
                defaultValue="demo1234"
                className="w-full bg-transparent text-[13px] outline-none"
              />
            </div>
          </div>
        </div>

        <button
          onClick={submit}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-brand-500 px-4 py-3 text-[13.5px] font-bold text-white shadow-lg shadow-brand-600/25 transition-all hover:-translate-y-0.5 hover:bg-brand-600"
        >
          Continue as {active.label} <ArrowRight size={15} />
        </button>

        <div className="mt-3.5 flex items-center justify-between text-[11.5px]">
          <a href="#" className="font-semibold text-brand-600 hover:text-brand-700">
            Forgot password?
          </a>
          <span className="text-ink-400">Demo · pre-filled</span>
        </div>
      </div>
    </div>
  )
}
