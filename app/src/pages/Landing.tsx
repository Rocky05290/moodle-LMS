import {
  ArrowRight, CalendarCheck, ShieldCheck, Layers, ClipboardCheck, BarChart3,
  QrCode, FileCheck2, Users, GraduationCap, Play, Check,
} from 'lucide-react'
import type { User } from '../data/mock'
import PublicHeader from '../components/PublicHeader'
import Reveal from '../components/Reveal'
import Tilt from '../components/Tilt'
import SiteFooter from '../components/SiteFooter'
import LoginCard from '../components/LoginCard'
import { IconTile, type IconTone } from '../components/ui'

const FEATURES: { icon: typeof Layers; title: string; desc: string; tone: IconTone }[] = [
  { icon: Layers, title: 'Batch management', desc: 'Create batches with auto codes (CTC-CCNA-2601), schedules and contracted hours.', tone: 'blue' },
  { icon: CalendarCheck, title: 'Smart attendance', desc: 'Daily register with P / L1 / L2 / L3 / A plus rotating QR self check-in.', tone: 'emerald' },
  { icon: ClipboardCheck, title: 'Rubric grading', desc: 'Criteria-based scoring, return-for-redo and instant learner notifications.', tone: 'violet' },
  { icon: BarChart3, title: 'Batch Health', desc: 'Live attendance %, grades and progress for every learner in one view.', tone: 'sky' },
  { icon: ShieldCheck, title: 'Auditor access', desc: 'Read-only compliance role with a full timestamped audit trail.', tone: 'navy' },
  { icon: FileCheck2, title: 'Tamkeen reports', desc: 'Signed attendance registers and one-click compliance report bundles.', tone: 'amber' },
]

const ROLES: { icon: typeof Users; k: string; v: string; tone: IconTone }[] = [
  { icon: Users, k: 'Admin', v: 'Courses, batches, bulk import, dashboards', tone: 'blue' },
  { icon: GraduationCap, k: 'Trainer', v: 'Attendance, grading, learner progress', tone: 'emerald' },
  { icon: Play, k: 'Learner', v: 'Today view, modules, submissions', tone: 'sky' },
  { icon: ShieldCheck, k: 'Auditor', v: 'Read-only verification & exports', tone: 'amber' },
]

// iSAMS-style coloured outline per role
const ROLE_OUTLINE: Record<string, { border: string; text: string; hover: string }> = {
  blue: { border: 'border-brand-500', text: 'text-brand-600', hover: 'hover:bg-brand-50' },
  emerald: { border: 'border-emerald-500', text: 'text-emerald-600', hover: 'hover:bg-emerald-50' },
  sky: { border: 'border-sky-500', text: 'text-sky-600', hover: 'hover:bg-sky-50' },
  amber: { border: 'border-amber-500', text: 'text-amber-600', hover: 'hover:bg-amber-50' },
}

export default function Landing({ onSignIn }: { onSignIn: (u: User) => void }) {
  const scrollTop = () => document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div id="top" className="min-h-full bg-white">
      <PublicHeader />

      {/* ============================ HERO ============================ */}
      <section className="relative flex min-h-[92vh] items-center overflow-hidden">
        <div
          className="kenburns absolute inset-0 bg-navy-900 bg-cover bg-center"
          style={{ backgroundImage: 'url(/hero.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/92 via-navy-900/72 to-navy-900/45" />
        <div className="floaty pointer-events-none absolute -top-24 -left-16 h-96 w-96 rounded-full bg-brand-500/25 blur-[120px]" />
        <div
          className="floaty pointer-events-none absolute right-0 bottom-0 h-96 w-96 rounded-full bg-brand-400/18 blur-[120px]"
          style={{ animationDelay: '-3s' }}
        />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '54px 54px',
          }}
        />

        <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-28 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
          {/* left — marketing */}
          <div>
            <span
              className="rise inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[12px] font-bold text-white backdrop-blur-sm"
              style={{ animationDelay: '.05s' }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
              Tamkeen-registered training platform · Bahrain
            </span>

            <h1
              className="rise mt-6 text-[40px] leading-[1.07] font-extrabold tracking-tight text-white sm:text-[52px]"
              style={{ animationDelay: '.15s' }}
            >
              Training, attendance &amp;
              <br />
              <span className="bg-gradient-to-r from-brand-300 via-white to-brand-300 bg-clip-text text-transparent">
                compliance
              </span>{' '}
              in one platform.
            </h1>

            <p
              className="rise mt-6 max-w-lg text-[16px] leading-relaxed text-white/75"
              style={{ animationDelay: '.28s' }}
            >
              Cordoba runs your whole training operation — batches, signed attendance registers,
              rubric grading and audit-ready reporting — in one fast, modern system.
            </p>

            <div className="rise mt-9 flex flex-wrap gap-x-8 gap-y-3" style={{ animationDelay: '.4s' }}>
              {[
                ['5', 'role-based portals'],
                ['CTC-2601', 'batch codes'],
                ['100%', 'audit-tracked'],
              ].map(([n, l]) => (
                <div key={l}>
                  <div className="text-[22px] font-extrabold text-white">{n}</div>
                  <div className="text-[12px] font-semibold text-white/55">{l}</div>
                </div>
              ))}
            </div>

            <button className="rise mt-8 flex items-center gap-2 text-[13.5px] font-bold text-white/80 transition-colors hover:text-white" style={{ animationDelay: '.5s' }}>
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-white/10">
                <Play size={13} />
              </span>
              Watch a 2-minute overview
            </button>
          </div>

          {/* right — login card (the red-box area) */}
          <div className="rise mx-auto w-full max-w-[340px] justify-self-stretch lg:mx-0 lg:justify-self-end" style={{ animationDelay: '.2s' }}>
            <LoginCard onSignIn={onSignIn} />
          </div>
        </div>
      </section>

      {/* ========================= INTRO STRIP ======================== */}
      <section className="bg-[#4a90d9] py-16">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <Reveal>
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/15 px-4 py-1.5 text-[11px] font-bold tracking-[0.16em] text-white uppercase shadow-sm backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                One core database · five portals
              </span>
            </div>
            <h2 className="mx-auto mt-3 max-w-3xl text-center text-[32px] leading-tight font-semibold text-white sm:text-[40px]">
              A cloud platform built for Tamkeen-funded training providers
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-[15px] leading-relaxed text-white/85">
              Everything a modern training centre needs — replacing spreadsheets, paper registers
              and generic LMS tools with one connected, compliant system.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ROLES.map((r, i) => {
              const Icon = r.icon
              const c = ROLE_OUTLINE[r.tone]
              return (
                <Reveal key={r.k} delay={i * 80}>
                  <Tilt className="h-full">
                    <div
                      className={`h-full rounded-2xl border-2 bg-surface p-5 shadow-[0_10px_28px_-14px_rgba(15,27,53,0.14)] transition-all ${c.border} ${c.hover} hover:shadow-[0_22px_46px_-18px_rgba(15,27,53,0.24)]`}
                    >
                      <Icon size={28} className={c.text} strokeWidth={2.2} />
                      <div className={`mt-3 text-[16px] font-extrabold ${c.text}`}>{r.k}</div>
                      <div className="mt-1 text-[12.5px] leading-relaxed text-ink-500">{r.v}</div>
                    </div>
                  </Tilt>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ========================== FEATURES ========================= */}
      <section className="bg-canvas py-20">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <Reveal>
            <div className="mb-12 text-center">
              <div className="flex justify-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-gradient-to-r from-brand-50 to-indigo-50 px-4 py-1.5 text-[11px] font-bold tracking-[0.16em] text-brand-600 uppercase shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-brand-500 to-indigo-500" />
                  Capabilities
                </span>
              </div>
              <h2
                className="mx-auto mt-2 max-w-2xl bg-gradient-to-r from-brand-600 via-violet-500 to-fuchsia-500 bg-clip-text text-[30px] leading-tight font-extrabold tracking-tight text-transparent sm:text-[38px]"
                style={{ backgroundSize: '220% auto', animation: 'gradientPan 5s linear infinite alternate' }}
              >
                Everything from enrolment to certificate
              </h2>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={scrollTop}
                  className="group relative cursor-pointer overflow-hidden rounded-md border-2 border-brand-500 px-6 py-3 text-[13.5px] font-bold text-brand-600 transition-all hover:-translate-y-0.5 hover:text-white hover:shadow-lg hover:shadow-indigo-500/25"
                >
                  <span className="absolute inset-0 translate-y-full bg-gradient-to-r from-brand-500 via-indigo-500 to-violet-500 transition-transform duration-300 group-hover:translate-y-0" />
                  <span className="relative flex items-center gap-2">
                    Sign in to explore <ArrowRight size={15} />
                  </span>
                </button>
              </div>
            </div>
          </Reveal>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => {
              const Icon = f.icon
              return (
                <Reveal key={f.title} delay={(i % 3) * 90}>
                  <Tilt className="h-full">
                    <div className="group h-full rounded-2xl border border-line bg-surface p-6 shadow-[0_12px_30px_-14px_rgba(15,27,53,0.16),0_2px_6px_-3px_rgba(15,27,53,0.08)] transition-all hover:border-brand-500/25 hover:shadow-[0_24px_48px_-18px_rgba(15,27,53,0.3)]">
                      <IconTile icon={<Icon size={27} />} tone={f.tone} size={58} />
                      <h3 className="mt-5 text-[16px] font-extrabold text-navy-900">{f.title}</h3>
                      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-500">{f.desc}</p>
                    </div>
                  </Tilt>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ========================= CTA BAND ========================== */}
      <section className="relative overflow-hidden border-y border-line bg-gradient-to-br from-brand-50 via-white to-brand-50 py-20">
        <div className="floaty pointer-events-none absolute -top-20 right-10 h-80 w-80 rounded-full bg-brand-400/15 blur-[110px]" />
        <div className="floaty pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-gold-400/10 blur-[110px]" style={{ animationDelay: '-3s' }} />
        <div className="relative z-10 mx-auto max-w-4xl px-5 text-center lg:px-8">
          <Reveal>
            <QrCode size={54} className="mx-auto text-brand-500" />
            <h2 className="mt-5 text-[32px] leading-tight font-extrabold tracking-tight text-navy-900 sm:text-[40px]">
              Ready to run every batch from one place?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] text-ink-500">
              Sign in to explore the admin, trainer, learner and auditor portals.
            </p>
            <div className="mt-8 flex justify-center">
              <button
                onClick={scrollTop}
                className="flex w-full max-w-[340px] items-center justify-center gap-2 rounded-md bg-brand-500 px-6 py-3.5 text-[14.5px] font-bold text-white shadow-lg shadow-brand-600/25 transition-all hover:-translate-y-0.5 hover:bg-brand-600"
              >
                Sign in <ArrowRight size={16} />
              </button>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-x-7 gap-y-2 text-[12.5px] text-ink-500">
              {['No spreadsheets', 'Audit-ready', 'Bahrain CPR support'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check size={13} className="text-brand-500" /> {t}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
