import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, CalendarCheck, ShieldCheck, Layers, ClipboardCheck, BarChart3,
  FileCheck2, Users, GraduationCap, Play, Check, Plus, Minus,
} from 'lucide-react'
import type { User } from '../data/mock'
import PublicHeader from '../components/PublicHeader'
import Reveal from '../components/Reveal'
import SiteFooter from '../components/SiteFooter'
import AppBgFx from '../components/AppBgFx'
import LandingLoader from '../components/LandingLoader'
import Typewriter from '../components/Typewriter'
import CountUp from '../components/CountUp'

const FEATURES = [
  { icon: Layers, title: 'Batch management', desc: 'Create batches with auto codes (CTC-CCNA-2601), schedules and contracted hours.' },
  { icon: CalendarCheck, title: 'Smart attendance', desc: 'Daily register with P / L1 / L2 / L3 / A plus rotating QR self check-in.' },
  { icon: ClipboardCheck, title: 'Rubric grading', desc: 'Criteria-based scoring, return-for-redo and instant learner notifications.' },
  { icon: BarChart3, title: 'Batch Health', desc: 'Live attendance %, grades and progress for every learner in one view.' },
  { icon: ShieldCheck, title: 'Auditor access', desc: 'Read-only compliance role with a full timestamped audit trail.' },
  { icon: FileCheck2, title: 'Tamkeen reports', desc: 'Signed attendance registers and one-click compliance report bundles.' },
]

const ROLES = [
  { icon: Users, k: 'Admin', v: 'Courses, batches, bulk import, dashboards' },
  { icon: GraduationCap, k: 'Trainer', v: 'Attendance, grading, learner progress' },
  { icon: Play, k: 'Learner', v: 'Today view, modules, submissions' },
  { icon: ShieldCheck, k: 'Auditor', v: 'Read-only verification & exports' },
]

const STATS = [
  ['5', 'Role portals', 'Admin, trainer, learner, auditor, corporate'],
  ['Sun–Thu', 'Working week', 'Bahrain schedule, Fri & Sat skipped'],
  ['100%', 'Audit-tracked', 'Every action timestamped'],
  ['1-click', 'Compliance', 'Tamkeen report bundles'],
]

const FAQS = [
  { q: 'What is Cordoba built for?', a: 'Cordoba runs a whole training operation for Tamkeen-funded providers in Bahrain — batches, attendance registers, rubric grading and audit-ready reporting — replacing spreadsheets and paper registers with one connected system.' },
  { q: 'How does attendance work?', a: 'A daily register with P / L1 / L2 / L3 / A codes, plus a rotating QR self check-in. Attendance percentage feeds Batch Health and the Tamkeen compliance reports automatically.' },
  { q: 'What are the five portals?', a: 'One core database serves five role-based portals: Admin, Trainer, Learner, Auditor and Corporate — each sees exactly what its role needs, from the same live source of truth.' },
  { q: 'Is it Tamkeen compliant?', a: 'Yes. Cordoba produces signed attendance registers and one-click compliance bundles, with a full timestamped audit trail from enrolment to certificate.' },
  { q: 'Who can access the records?', a: 'Access is role-based. Auditors get read-only verification and exports; trainers write only their own batches; admins manage everything. Every change is recorded in the audit log.' },
]

export default function Landing({ onSignIn: _onSignIn }: { onSignIn: (u: User) => void }) {
  const [openFaq, setOpenFaq] = useState(0)

  return (
    <div id="top" className="relative min-h-full bg-navy-950 text-white">
      {/* 3D intro loader — plays every time the landing page loads */}
      <LandingLoader />

      {/* interactive animated background — ONE fixed layer behind the whole page */}
      <AppBgFx />

      <PublicHeader />

      {/* ============================ HERO ============================ */}
      <section className="relative flex min-h-[92vh] items-center overflow-hidden pt-28">
        {/* background photo (Bahrain network globe) — subtle, animation + text layer over it */}
        <div
          className="kenburns pointer-events-none absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: 'url(/hero.jpg)' }}
        />
        {/* dark wash so the photo stays subtle and text/animation read clearly */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-navy-950/92 via-navy-950/70 to-navy-950/45" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-navy-950/30" />
        <div className="floaty pointer-events-none absolute -top-24 -left-16 h-96 w-96 rounded-full bg-gold-400/12 blur-[120px]" />

        <div className="relative z-10 mx-auto grid w-full items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-16 xl:px-24">
          <div>
            <span className="rise inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-[12px] font-bold text-white/85 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
              Tamkeen-registered training platform · Bahrain
            </span>

            <h1 className="mt-6 min-h-[2.2em] text-[38px] leading-[1.06] font-extrabold tracking-tight text-white sm:text-[50px]">
              <Typewriter
                speed={42}
                segments={[
                  { text: 'Training, attendance & ' },
                  { text: 'compliance', className: 'text-emerald-400' },
                  { text: ' in one platform.' },
                ]}
              />
            </h1>

            <p className="rise mt-6 max-w-lg text-[15.5px] leading-relaxed text-white/65" style={{ animationDelay: '.24s' }}>
              Cordoba runs your whole training operation — batches, signed attendance registers,
              rubric grading and audit-ready reporting — in one fast, modern system.
            </p>

            <div className="rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: '.34s' }}>
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-xl bg-gold-400 px-6 py-3.5 text-[14.5px] font-bold text-navy-950 transition-all hover:-translate-y-0.5 hover:bg-gold-300"
              >
                Get started <ArrowRight size={17} />
              </Link>
              <a
                href="#features"
                className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-6 py-3.5 text-[14.5px] font-bold text-white transition-colors hover:bg-white/[0.08]"
              >
                How it works
              </a>
            </div>
          </div>

          {/* right — role portals preview card */}
          <div className="rise hidden lg:block" style={{ animationDelay: '.2s' }}>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md">
              <div className="mb-4 text-[11px] font-bold tracking-[0.14em] text-white/40 uppercase">
                One database · five portals
              </div>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((r) => {
                  const Icon = r.icon
                  return (
                    <div key={r.k} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <Icon size={22} className="text-gold-400" strokeWidth={2.2} />
                      <div className="mt-2.5 text-[14px] font-extrabold text-white">{r.k}</div>
                      <div className="mt-1 text-[11.5px] leading-relaxed text-white/50">{r.v}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================= STAT BAND ========================= */}
      <section id="compliance" className="relative z-10 scroll-mt-24 border-y border-white/10">
        <div className="mx-auto grid grid-cols-2 divide-x divide-y divide-white/10 px-5 sm:px-8 lg:grid-cols-4 lg:divide-y-0 lg:px-16 xl:px-24">
          {STATS.map(([big, label, sub]) => (
            <div key={label} className="px-4 py-8 text-center sm:py-10">
              <div className="text-[26px] font-extrabold tracking-tight text-white sm:text-[32px]">
                <CountUp value={big} />
              </div>
              <div className="mt-1.5 text-[13.5px] font-bold text-gold-400">{label}</div>
              <div className="mt-1 text-[11.5px] text-white/45">{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ====================== PROGRAMME / CHART ===================== */}
      <section className="relative z-10 border-b border-white/10 py-20">
        <div className="mx-auto grid items-center gap-10 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:px-16 xl:px-24">
          {/* left copy */}
          <Reveal>
            <div className="[text-shadow:0_2px_18px_rgba(0,0,0,0.6)]">
              <span className="text-[11px] font-bold tracking-[0.16em] text-gold-400 uppercase">The programme</span>
              <h2 className="mt-3 text-[30px] leading-tight font-extrabold tracking-tight text-white sm:text-[38px]">
                Every batch,<br />
                <span className="text-emerald-400">tracked from day one.</span>
              </h2>
              <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-white/60">
                Attendance, grades and progress roll up into live Batch Health — so you always know
                exactly where each learner stands.
              </p>
            </div>
          </Reveal>

          {/* right — attendance chart card */}
          <Reveal delay={100}>
            <div className="rounded-2xl border border-white/10 bg-navy-950/80 p-5 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-[0.12em] text-white/45 uppercase">
                  Batch attendance · CTC-CCNA-2601
                </span>
                <span className="text-[15px] font-extrabold text-gold-400">+18.4%</span>
              </div>

              {/* self-contained SVG line chart (no library) */}
              <svg viewBox="0 0 560 220" className="w-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="fillG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#edb43d" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#edb43d" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* grid lines */}
                {[44, 88, 132, 176].map((y) => (
                  <line key={y} x1="0" y1={y} x2="560" y2={y} stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1" />
                ))}
                {/* area + line: an upward attendance trend */}
                <path
                  d="M0,180 L70,168 L140,172 L210,140 L280,150 L350,110 L420,120 L490,78 L560,62 L560,220 L0,220 Z"
                  fill="url(#fillG)"
                />
                <path
                  d="M0,180 L70,168 L140,172 L210,140 L280,150 L350,110 L420,120 L490,78 L560,62"
                  fill="none"
                  stroke="#edb43d"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {/* end dot */}
                <circle cx="560" cy="62" r="4.5" fill="#edb43d" />
              </svg>

              {/* stat strip under the chart */}
              <div className="mt-5 grid grid-cols-4 divide-x divide-white/10 rounded-xl border border-white/10 bg-white/[0.03]">
                {[
                  ['Attendance', '92%'],
                  ['Pass rate', '86%'],
                  ['Working week', 'Sun–Thu'],
                  ['Platform', 'Cordoba'],
                ].map(([k, v]) => (
                  <div key={k} className="px-3 py-3">
                    <div className="text-[9.5px] font-bold tracking-[0.1em] text-white/40 uppercase">{k}</div>
                    <div className="mt-1 text-[13px] font-extrabold text-white">
                      <CountUp value={v} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========================= INTRO STRIP ======================== */}
      <section className="relative z-10 py-20">
        {/* soft dark halo behind the text so it stays readable over the animation */}
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_70%_at_50%_50%,rgba(7,9,18,0.85),transparent_75%)]" />
        <div className="relative mx-auto px-5 sm:px-8 lg:px-16 xl:px-24">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center [text-shadow:0_2px_18px_rgba(0,0,0,0.6)]">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/25 bg-gold-400/10 px-4 py-1.5 text-[11px] font-bold tracking-[0.14em] text-gold-400 uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-gold-400" /> The platform
              </span>
              <h2 className="mt-4 text-[30px] leading-tight font-extrabold tracking-tight text-white sm:text-[40px]">
                A cloud platform built<br />
                <span className="text-emerald-400">for Tamkeen-funded providers.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-white/75">
                Everything a modern training centre needs — replacing spreadsheets, paper registers
                and generic LMS tools with one connected, compliant system.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========================== FEATURES ========================= */}
      <section id="features" className="relative z-10 scroll-mt-24 border-t border-white/10 py-20">
        <div className="mx-auto px-5 sm:px-8 lg:px-16 xl:px-24">
          <Reveal>
            <div className="mb-12 text-center [text-shadow:0_2px_18px_rgba(0,0,0,0.6)]">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-1.5 text-[11px] font-bold tracking-[0.14em] text-white/60 uppercase">
                Capabilities
              </span>
              <h2 className="mx-auto mt-3 max-w-2xl text-[28px] leading-tight font-extrabold tracking-tight text-white sm:text-[36px]">
                Everything from enrolment<br />
                <span className="text-emerald-400">to certificate.</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => {
              const Icon = f.icon
              return (
                <Reveal key={f.title} delay={(i % 3) * 80}>
                  <div className="group h-full rounded-2xl border border-white/10 bg-navy-950/85 p-6 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-gold-400/30 hover:bg-navy-900/85">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-400/12 text-gold-400">
                      <Icon size={22} strokeWidth={2} />
                    </div>
                    <h3 className="mt-5 text-[16px] font-extrabold text-white">{f.title}</h3>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-white/70">{f.desc}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============================ FAQ ============================ */}
      <section id="faq" className="relative z-10 scroll-mt-24 py-20">
        <div className="mx-auto grid gap-10 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-16 xl:px-24">
          <Reveal>
            <div className="[text-shadow:0_2px_18px_rgba(0,0,0,0.6)]">
              <h2 className="text-[30px] leading-tight font-extrabold tracking-tight text-white sm:text-[38px]">
                The questions<br />
                <span className="text-emerald-400">training centres ask.</span>
              </h2>
              <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-white/70">
                Clear answers on how Cordoba handles batches, attendance, roles and Tamkeen compliance.
              </p>
              <Link
                to="/login"
                className="mt-8 inline-flex items-center gap-2 rounded-xl border border-gold-400/30 bg-white/[0.04] px-6 py-3 text-[14px] font-bold text-gold-400 transition-colors hover:bg-white/[0.08] hover:text-gold-300"
              >
                Get started <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-navy-950/85 backdrop-blur-md">
              {FAQS.map((f, i) => {
                const open = openFaq === i
                return (
                  <div key={f.q}>
                    <button
                      onClick={() => setOpenFaq(open ? -1 : i)}
                      className="group flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.03]"
                    >
                      <span className="text-[14.5px] font-bold text-white transition-colors group-hover:text-gold-400">{f.q}</span>
                      <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full border border-white/15 text-gold-400">
                        {open ? <Minus size={13} /> : <Plus size={13} />}
                      </span>
                    </button>
                    {open && (
                      <p className="px-5 pb-5 text-[13.5px] leading-relaxed text-white/55">{f.a}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========================= CTA BAND ========================== */}
      <section id="get-started" className="relative z-10 scroll-mt-24 border-t border-white/10 py-20">
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_70%_at_50%_50%,rgba(7,9,18,0.85),transparent_75%)]" />
        <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8 [text-shadow:0_2px_18px_rgba(0,0,0,0.6)]">
          <Reveal>
            <h2 className="text-[30px] leading-tight font-extrabold tracking-tight text-white sm:text-[40px]">
              Ready to run every batch<br />
              <span className="text-emerald-400">from one place?</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] text-white/70">
              Sign in to explore the admin, trainer, learner and auditor portals.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-xl bg-gold-400 px-7 py-3.5 text-[14.5px] font-bold text-navy-950 transition-all hover:-translate-y-0.5 hover:bg-gold-300"
              >
                Get started <ArrowRight size={16} />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-x-7 gap-y-2 text-[12.5px] text-white/45">
              {['No spreadsheets', 'Audit-ready', 'Bahrain CPR support'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check size={13} className="text-gold-400" /> {t}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <div id="site-footer" className="scroll-mt-24">
        <SiteFooter />
      </div>
    </div>
  )
}
