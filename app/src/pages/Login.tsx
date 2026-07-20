import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck, GraduationCap, Users, BookOpen, ArrowRight, Lock,
  CalendarCheck, TrendingUp,
} from 'lucide-react'
import type { Role, User } from '../data/mock'
import { users } from '../data/mock'
import { Button, Card } from '../components/ui'

const ROLES: { role: Role; label: string; icon: typeof Users; demoId: number; home: string }[] = [
  { role: 'admin', label: 'Admin', icon: Users, demoId: 1, home: '/admin' },
  { role: 'trainer', label: 'Trainer', icon: BookOpen, demoId: 104, home: '/trainer' },
  { role: 'learner', label: 'Learner', icon: GraduationCap, demoId: 101, home: '/learner' },
  { role: 'auditor', label: 'Auditor', icon: ShieldCheck, demoId: 108, home: '/auditor' },
]

/* ------------------- animated 3D stage ------------------- */
function Scene3D() {
  return (
    <div className="stage3d pointer-events-none absolute inset-0 flex items-center justify-center">
      <span className="drift-slow absolute top-6 -left-10 h-56 w-56 rounded-full bg-brand-400/25 blur-[70px]" />
      <span
        className="drift-slow absolute -right-8 bottom-4 h-48 w-48 rounded-full bg-gold-500/15 blur-[70px]"
        style={{ animationDelay: '-6s' }}
      />

      <div className="sway-3d relative h-[290px] w-[290px]">
        {/* back layer — batch card */}
        <div
          className="float-slow absolute top-2 left-1/2 w-56 rounded-2xl border border-line bg-surface p-4 shadow-[0_24px_50px_-24px_rgba(15,27,53,.45)]"
          style={{ transform: 'translateX(-50%) translateZ(-90px)', animationDelay: '-2s' }}
        >
          <div className="flex items-center justify-between">
            <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-600">
              CTC-CCNA-2601
            </span>
            <span className="text-[10px] font-bold text-ink-400">48h</span>
          </div>
          <div className="mt-2.5 h-1.5 w-full rounded-full bg-soft2">
            <div className="h-full w-2/3 rounded-full bg-brand-500" />
          </div>
          <div className="mt-2 text-[10.5px] text-ink-400">12 learners · active</div>
        </div>

        {/* middle layer — attendance rows */}
        <div
          className="float-slow absolute top-1/2 left-1/2 w-64 rounded-2xl border border-line bg-surface p-4 shadow-[0_28px_60px_-24px_rgba(15,27,53,.5)]"
          style={{ transform: 'translate(-50%,-50%) translateZ(30px)' }}
        >
          <div className="mb-2.5 flex items-center gap-2">
            <CalendarCheck size={14} className="text-brand-500" />
            <span className="text-[11.5px] font-bold text-navy-900">Attendance</span>
          </div>
          {[
            ['Ali Al-Mansoori', 'P', 'bg-ok-600'],
            ['Siddika Mahmood', 'L1', 'bg-warn-600'],
            ['Jasem Al-Saffar', 'A', 'bg-bad-600'],
          ].map(([n, c, bg]) => (
            <div key={n} className="flex items-center gap-2 py-1">
              <span className="h-6 w-6 flex-none rounded-full bg-brand-50" />
              <span className="flex-1 truncate text-[10.5px] text-ink-700">{n}</span>
              <span
                className={`${bg} flex h-5 w-6 items-center justify-center rounded text-[9.5px] font-extrabold text-white`}
              >
                {c}
              </span>
            </div>
          ))}
        </div>

        {/* front layer — KPI chip */}
        <div
          className="float-slow absolute bottom-3 left-1/2 w-44 rounded-2xl border border-line bg-surface p-3.5 shadow-[0_30px_60px_-22px_rgba(15,27,53,.55)]"
          style={{ transform: 'translateX(-50%) translateZ(110px)', animationDelay: '-4s' }}
        >
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ok-50 text-ok-600">
              <TrendingUp size={15} />
            </span>
            <div className="leading-tight">
              <div className="text-[16px] font-extrabold text-navy-900">92%</div>
              <div className="text-[9.5px] font-semibold text-ink-400">Batch attendance</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

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
        {/* ------------- brand panel with 3D scene ------------- */}
        <Card reveal className="relative hidden overflow-hidden p-9 lg:flex lg:flex-col">
          <div className="relative z-10 mb-6 flex items-center gap-3">
            <img src="/logo.png" alt="Cordoba Training Center" className="h-11 w-auto" />
          </div>

          <h2 className="relative z-10 text-[29px] leading-[1.15] font-extrabold tracking-tight">
            One platform for
            <br />
            <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
              training, compliance
            </span>
            <br />
            and reporting.
          </h2>

          <div className="relative my-1 h-[290px]">
            <Scene3D />
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-3">
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

        {/* ------------------ sign-in panel ------------------ */}
        <Card reveal delay={2} className="p-8">
          <h1 className="text-[22px] font-extrabold tracking-tight">Sign in</h1>
          <p className="mt-1 text-[13px] text-ink-500">Choose your role to continue.</p>

          <div className="mt-6 grid grid-cols-2 gap-2.5">
            {ROLES.map((r) => {
              const Icon = r.icon
              const on = r.role === role
              return (
                <button
                  key={r.role}
                  onClick={() => setRole(r.role)}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] font-bold transition-all duration-200 hover:-translate-y-0.5 ${
                    on
                      ? 'border-brand-500 bg-brand-50 text-brand-600 shadow-md shadow-brand-500/15'
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
                className="w-full rounded-xl border border-line bg-soft px-3.5 py-3 text-[13.5px] outline-none transition-colors focus:border-brand-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold tracking-wide text-ink-500 uppercase">
                Password
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-line bg-soft px-3.5 py-3 transition-colors focus-within:border-brand-500">
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
