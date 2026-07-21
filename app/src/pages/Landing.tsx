import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, CalendarCheck, ShieldCheck, Layers, ClipboardCheck, BarChart3,
  QrCode, FileCheck2, Users, GraduationCap, Play, Check,
} from 'lucide-react'
import PublicHeader from '../components/PublicHeader'
import Reveal from '../components/Reveal'
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

export default function Landing() {
  const navigate = useNavigate()
  const goLogin = () => navigate('/login')

  return (
    <div id="top" className="min-h-full bg-white">
      <PublicHeader onSignIn={goLogin} />

      {/* ============================ HERO ============================ */}
      <section className="relative flex min-h-[92vh] items-center overflow-hidden">
        {/* background: image if present, else rich gradient */}
        <div
          className="kenburns absolute inset-0 bg-navy-900 bg-cover bg-center"
          style={{ backgroundImage: 'url(/hero.jpg)' }}
        />
        {/* gradient wash for legibility */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950/94 via-navy-900/88 to-brand-700/72" />
        {/* animated colour glows */}
        <div className="floaty pointer-events-none absolute -top-24 -left-16 h-96 w-96 rounded-full bg-brand-500/25 blur-[120px]" />
        <div
          className="floaty pointer-events-none absolute right-0 bottom-0 h-96 w-96 rounded-full bg-brand-400/18 blur-[120px]"
          style={{ animationDelay: '-3s' }}
        />
        {/* subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '54px 54px',
          }}
        />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 py-28 lg:px-8">
          <div className="max-w-3xl">
            <span
              className="rise inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[12px] font-bold text-white backdrop-blur-sm"
              style={{ animationDelay: '.05s' }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
              Tamkeen-registered training platform · Bahrain
            </span>

            <h1
              className="rise mt-6 text-[42px] leading-[1.06] font-extrabold tracking-tight text-white sm:text-[58px]"
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
              className="rise mt-6 max-w-xl text-[16px] leading-relaxed text-white/75"
              style={{ animationDelay: '.28s' }}
            >
              Cordoba runs your whole training operation — batches, signed attendance registers,
              rubric grading and audit-ready reporting — in one fast, modern system.
            </p>

            <div
              className="rise mt-9 flex flex-wrap items-center gap-3.5"
              style={{ animationDelay: '.4s' }}
            >
              <button
                onClick={goLogin}
                className="group flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-[14.5px] font-bold text-navy-900 shadow-xl shadow-black/20 transition-all hover:-translate-y-0.5 hover:bg-brand-50"
              >
                Sign in to your portal
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
              </button>
              <button className="flex items-center gap-2 rounded-xl border border-white/25 bg-white/8 px-6 py-3.5 text-[14.5px] font-bold text-white backdrop-blur-sm transition-all hover:bg-white/16">
                <Play size={15} /> Watch overview
              </button>
            </div>

            {/* trust chips */}
            <div
              className="rise mt-12 flex flex-wrap gap-x-8 gap-y-3"
              style={{ animationDelay: '.55s' }}
            >
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
          </div>
        </div>

        {/* scroll cue */}
        <div className="absolute inset-x-0 bottom-6 flex justify-center">
          <div className="floaty flex h-9 w-5 items-start justify-center rounded-full border-2 border-white/40 p-1.5">
            <span className="h-2 w-1 rounded-full bg-white/70" />
          </div>
        </div>
      </section>

      {/* ========================= INTRO STRIP ======================== */}
      <section className="border-b border-line bg-white py-16">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <Reveal>
            <p className="text-center text-[12px] font-bold tracking-[0.14em] text-brand-600 uppercase">
              One core database · five portals
            </p>
            <h2 className="mx-auto mt-3 max-w-3xl text-center text-[30px] leading-tight font-extrabold tracking-tight text-navy-900 sm:text-[38px]">
              A cloud platform built for Tamkeen-funded training providers
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-[15px] leading-relaxed text-ink-500">
              Everything a modern training centre needs — replacing spreadsheets, paper registers
              and generic LMS tools with one connected, compliant system.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ROLES.map((r, i) => {
              const Icon = r.icon
              return (
                <Reveal key={r.k} delay={i * 80}>
                  <div className="panel panel-hover h-full rounded-2xl p-5">
                    <IconTile icon={<Icon size={20} />} tone={r.tone} size={46} />
                    <div className="mt-4 text-[15px] font-extrabold text-navy-900">{r.k}</div>
                    <div className="mt-1 text-[12.5px] leading-relaxed text-ink-500">{r.v}</div>
                  </div>
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
            <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[12px] font-bold tracking-[0.14em] text-brand-600 uppercase">
                  Capabilities
                </p>
                <h2 className="mt-2 max-w-xl text-[30px] leading-tight font-extrabold tracking-tight text-navy-900 sm:text-[36px]">
                  Everything from enrolment to certificate
                </h2>
              </div>
              <button
                onClick={goLogin}
                className="flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-3 text-[13.5px] font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-navy-800"
              >
                Explore the portal <ArrowRight size={15} />
              </button>
            </div>
          </Reveal>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => {
              const Icon = f.icon
              return (
                <Reveal key={f.title} delay={(i % 3) * 90}>
                  <div className="group panel h-full rounded-2xl p-6 transition-all hover:-translate-y-1 hover:border-brand-500/25 hover:shadow-[0_18px_40px_-20px_rgba(15,27,53,0.3)]">
                    <IconTile icon={<Icon size={22} />} tone={f.tone} size={48} />
                    <h3 className="mt-5 text-[16px] font-extrabold text-navy-900">{f.title}</h3>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-ink-500">{f.desc}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ========================= CTA BAND ========================== */}
      <section className="relative overflow-hidden bg-navy-900 py-20">
        <div className="floaty pointer-events-none absolute -top-20 right-10 h-80 w-80 rounded-full bg-brand-500/25 blur-[110px]" />
        <div className="floaty pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-gold-500/12 blur-[110px]" style={{ animationDelay: '-3s' }} />
        <div className="relative z-10 mx-auto max-w-4xl px-5 text-center lg:px-8">
          <Reveal>
            <QrCode size={30} className="mx-auto text-brand-300" />
            <h2 className="mt-5 text-[32px] leading-tight font-extrabold tracking-tight text-white sm:text-[40px]">
              Ready to run every batch from one place?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] text-white/65">
              Sign in to explore the admin, trainer, learner and auditor portals.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3.5">
              <button
                onClick={goLogin}
                className="flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-[14.5px] font-bold text-navy-900 transition-all hover:-translate-y-0.5 hover:bg-brand-50"
              >
                Sign in <ArrowRight size={16} />
              </button>
              <button className="rounded-xl border border-white/25 bg-white/8 px-6 py-3.5 text-[14.5px] font-bold text-white transition-all hover:bg-white/16">
                Book a demo
              </button>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-x-7 gap-y-2 text-[12.5px] text-white/55">
              {['No spreadsheets', 'Audit-ready', 'Bahrain CPR support'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check size={13} className="text-brand-300" /> {t}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* =========================== FOOTER ========================== */}
      <footer className="border-t border-line bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-5 lg:px-8">
          <img src="/logo.png" alt="Cordoba Training Center" className="h-7 w-auto" />
          <span className="text-[12.5px] text-ink-400">
            © 2026 Cordoba Training Center · Tamkeen-ready academic &amp; compliance platform
          </span>
          <button
            onClick={goLogin}
            className="ml-auto text-[13px] font-bold text-brand-600 hover:text-brand-700"
          >
            Sign in →
          </button>
        </div>
      </footer>
    </div>
  )
}
