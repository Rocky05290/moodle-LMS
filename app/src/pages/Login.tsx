import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, GraduationCap, Users, BookOpen, ArrowRight, Lock, Check } from 'lucide-react'
import type { Role, User } from '../data/mock'
import { users } from '../data/mock'
import { Button, Card } from '../components/ui'

const ROLES: { role: Role; label: string; icon: typeof Users; demoId: number; home: string }[] = [
  { role: 'admin', label: 'Admin', icon: Users, demoId: 1, home: '/admin' },
  { role: 'trainer', label: 'Trainer', icon: BookOpen, demoId: 104, home: '/trainer' },
  { role: 'learner', label: 'Learner', icon: GraduationCap, demoId: 101, home: '/learner' },
  { role: 'auditor', label: 'Auditor', icon: ShieldCheck, demoId: 108, home: '/auditor' },
]

const POINTS = [
  'Batch management with Tamkeen-ready attendance registers',
  'Rubric grading, evaluations and learner progress tracking',
  'Read-only auditor access with a full timestamped audit trail',
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
    <div className="flex min-h-full items-center justify-center p-5">
      <div className="grid w-full max-w-5xl items-stretch gap-6 lg:grid-cols-[1.05fr_1fr]">
        {/* ---------------- brand panel ---------------- */}
        <Card className="hidden p-9 lg:flex lg:flex-col">
          <img src="/logo.png" alt="Cordoba Training Center" className="h-11 w-auto self-start" />

          <h2 className="mt-9 text-[30px] leading-[1.18] font-extrabold tracking-tight text-navy-900">
            One platform for training,
            <br />
            compliance and reporting.
          </h2>

          <p className="mt-4 max-w-md text-[13.5px] leading-relaxed text-ink-500">
            Everything a Tamkeen-registered training provider needs — batches, attendance,
            assessment and audit-ready reporting in one system.
          </p>

          <ul className="mt-7 space-y-3">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <Check size={12} strokeWidth={3} />
                </span>
                <span className="text-[13px] leading-relaxed text-ink-700">{p}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto grid grid-cols-3 gap-3 pt-9">
            {[
              ['Batches', 'CTC-CCNA-2601'],
              ['Attendance', 'P · L1 · L2 · L3'],
              ['Audit trail', 'Timestamped'],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-line bg-soft p-3">
                <div className="text-[10px] font-bold tracking-[0.07em] text-ink-400 uppercase">
                  {k}
                </div>
                <div className="mt-1 text-[11.5px] font-bold text-ink-700">{v}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* ---------------- sign-in panel ---------------- */}
        <Card className="p-8">
          <img src="/logo.png" alt="Cordoba Training Center" className="mb-7 h-9 w-auto lg:hidden" />

          <h1 className="text-[22px] font-extrabold tracking-tight text-navy-900">Sign in</h1>
          <p className="mt-1 text-[13px] text-ink-500">Choose your role to continue.</p>

          <div className="mt-6 grid grid-cols-2 gap-2.5">
            {ROLES.map((r) => {
              const Icon = r.icon
              const on = r.role === role
              return (
                <button
                  key={r.role}
                  onClick={() => setRole(r.role)}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3.5 py-3 text-[13px] font-bold ${
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

          <Button onClick={submit} className="mt-6 flex w-full items-center justify-center gap-2">
            Continue as {active.label} <ArrowRight size={15} />
          </Button>

          <p className="mt-4 text-center text-[11.5px] text-ink-400">
            Demo preview — credentials are pre-filled for each role.
          </p>
        </Card>
      </div>
    </div>
  )
}
