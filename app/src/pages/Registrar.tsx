import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SlidersHorizontal, CalendarDays, Users, UserPlus, Layers, CheckSquare, CalendarRange, FileDown } from 'lucide-react'
import { useLiveData, hasSupabase } from '../lib/live'
import { supabase } from '../lib/supabase'
import { People, CreateBatchForm, AddPersonForm, fieldCls, labelCls } from './Extra'
import Loading from '../components/Loading'

type Tab = 'workspace' | 'registry' | 'dossiers'
type Step = 'profile' | 'batch' | 'enroll' | 'calendar'

const TABS: { key: Tab; label: string; icon: typeof SlidersHorizontal }[] = [
  { key: 'workspace', label: 'Registrar Operations Workspace', icon: SlidersHorizontal },
  { key: 'registry', label: 'Academics & Batch Registry', icon: CalendarDays },
  { key: 'dossiers', label: 'Student & Learner Dossiers', icon: Users },
]

const STEPS: { key: Step; label: string; icon: typeof UserPlus }[] = [
  { key: 'profile', label: '1. Create Profile', icon: UserPlus },
  { key: 'batch', label: '2. Create Batch', icon: Layers },
  { key: 'enroll', label: '3. Enroll Learner', icon: CheckSquare },
  { key: 'calendar', label: '4. Publish Calendar', icon: CalendarRange },
]

/* dark card shell that matches the landing theme */
const CARD = 'glow-border rounded-lg border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm'

export default function Registrar() {
  const [tab, setTab] = useState<Tab>('workspace')

  return (
    <div className="space-y-6">
      {/* ---- top tabs ---- */}
      <div className="flex flex-wrap gap-1 border-b border-white/10">
        {TABS.map((t) => {
          const Icon = t.icon
          const active = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex cursor-pointer items-center gap-2 border-b-2 px-4 py-3 text-[13.5px] font-bold transition-colors ${
                active ? 'border-gold-400 text-gold-400' : 'border-transparent text-white/55 hover:text-white'
              }`}
            >
              <Icon size={16} /> {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'workspace' && <Workspace />}
      {tab === 'registry' && <BatchRegistry />}
      {tab === 'dossiers' && <People />}
    </div>
  )
}

/* =====================================================================
   TAB 1 — Registrar Operations Workspace (4-step action selector)
===================================================================== */
function Workspace() {
  const [step, setStep] = useState<Step>('profile')

  return (
    <div className="space-y-5">
      {/* system action selector */}
      <div className={CARD}>
        <div className="mb-3 text-[11px] font-bold tracking-[0.14em] text-white/45 uppercase">System action selector</div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => {
            const Icon = s.icon
            const active = step === s.key
            return (
              <button
                key={s.key}
                onClick={() => setStep(s.key)}
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-3.5 text-[13.5px] font-bold transition-all ${
                  active
                    ? 'border-gold-400 bg-gold-400 text-navy-950 shadow-lg shadow-gold-400/20'
                    : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-white/25 hover:text-white'
                }`}
              >
                <Icon size={16} /> {s.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* active step panel */}
      {step === 'profile' && <StepProfile />}
      {step === 'batch' && <StepBatch />}
      {step === 'enroll' && <StepEnroll />}
      {step === 'calendar' && <StepCalendar />}
    </div>
  )
}

/* ---- step 1: create profile (inline form, no modal) ---- */
function StepProfile() {
  const [msg, setMsg] = useState('')
  return (
    <div className={CARD}>
      <h3 className="mb-5 flex items-center gap-2.5 text-[16px] font-extrabold text-white">
        <UserPlus size={20} className="text-gold-400" /> Initialize New Registry Profile
      </h3>
      {msg && (
        <p className="mb-4 rounded-md border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-[12.5px] font-semibold text-emerald-300">
          {msg}
        </p>
      )}
      <AddPersonForm submitLabel="Create Profile" onDone={() => setMsg('✓ Profile created — appears in the directory immediately.')} />
    </div>
  )
}

/* ---- step 2: create batch (inline form, no modal) ---- */
function StepBatch() {
  const d = useLiveData()
  const [msg, setMsg] = useState('')
  if (hasSupabase && d.loading) return <Loading label="Loading programs…" />
  const courses = d.courses.map((c) => ({ id: c.id, code: c.code ?? '', title: c.title, total_hours: c.total_hours ?? 0 }))
  const trainers = d.profiles.filter((p) => p.role === 'trainer').map((p) => ({ id: p.id, first_name: p.first_name, last_name: p.last_name }))
  return (
    <div className={CARD}>
      <h3 className="mb-5 flex items-center gap-2.5 text-[16px] font-extrabold text-white">
        <Layers size={20} className="text-gold-400" /> Deploy Certified Training Batch
      </h3>
      {msg && (
        <p className="mb-4 rounded-md border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-[12.5px] font-semibold text-emerald-300">
          {msg}
        </p>
      )}
      <CreateBatchForm courses={courses} trainers={trainers} onDone={() => setMsg('✓ Batch deployed — visible in the Batch Registry now.')} />
    </div>
  )
}

/* ---- step 3: enroll a learner into a batch (inline) ---- */
function StepEnroll() {
  const d = useLiveData()
  const [learnerId, setLearnerId] = useState('')
  const [batchId, setBatchId] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  if (hasSupabase && d.loading) return <Loading label="Loading…" />

  const learners = d.profiles.filter((p) => p.role === 'learner')
  const enroll = async () => {
    setErr(''); setMsg('')
    if (!learnerId || !batchId) { setErr('Pick a learner candidate and a target batch.'); return }
    if (!supabase) return
    setBusy(true)
    const { error } = await supabase.from('enrollments').insert({ learner_id: learnerId, batch_id: Number(batchId) })
    setBusy(false)
    if (error) { setErr(error.message.includes('duplicate') ? 'This learner is already enrolled in that batch.' : error.message); return }
    const nm = learners.find((l) => l.id === learnerId)
    setMsg(`✓ Enrolled ${nm ? nm.first_name + ' ' + nm.last_name : 'candidate'} successfully.`)
    setLearnerId(''); setBatchId('')
  }

  return (
    <div className={CARD}>
      <h3 className="mb-5 flex items-center gap-2.5 text-[16px] font-extrabold text-white">
        <CheckSquare size={20} className="text-emerald-400" /> Enroll Learner into Target Training Batch
      </h3>
      <div className="max-w-2xl space-y-4">
        <div>
          <label className={labelCls}>Select learner candidate profile</label>
          <select className={fieldCls} value={learnerId} onChange={(e) => setLearnerId(e.target.value)}>
            <option value="">— Choose a learner —</option>
            {learners.map((l) => (
              <option key={l.id} value={l.id}>
                {l.first_name} {l.last_name}{l.cpr ? ` (CPR: ${l.cpr})` : ''}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Select target active calendar batch</label>
          <select className={fieldCls} value={batchId} onChange={(e) => setBatchId(e.target.value)}>
            <option value="">— Choose a batch —</option>
            {d.batches.map((b) => (
              <option key={b.id} value={b.id}>
                Batch [{b.batch_code}]{b.start_time ? ` (${b.start_time.slice(0, 5)} - ${b.end_time?.slice(0, 5) ?? ''})` : ''}
              </option>
            ))}
          </select>
        </div>
        {msg && <p className="rounded-md border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-[12.5px] font-semibold text-emerald-300">{msg}</p>}
        {err && <p className="rounded-md border border-red-400/25 bg-red-400/10 px-3 py-2 text-[12.5px] font-semibold text-red-300">{err}</p>}
        <button
          onClick={enroll}
          disabled={busy}
          className="rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 px-6 py-2.5 text-[13.5px] font-bold text-navy-950 transition-all hover:-translate-y-0.5 disabled:opacity-60"
        >
          {busy ? 'Enrolling…' : 'Enroll Candidate'}
        </button>
      </div>
    </div>
  )
}

/* ---- step 4: publish calendar (pick a batch → go to calendar) ---- */
function StepCalendar() {
  const d = useLiveData()
  const [batchId, setBatchId] = useState('')
  if (hasSupabase && d.loading) return <Loading label="Loading…" />
  const batch = d.batches.find((b) => String(b.id) === batchId)
  const course = batch ? d.courses.find((c) => c.id === batch.course_id) : null
  const trainer = batch ? d.profiles.find((p) => p.id === batch.trainer_id) : null

  return (
    <div className={CARD}>
      <h3 className="mb-5 flex items-center gap-2.5 text-[16px] font-extrabold text-white">
        <CalendarRange size={20} className="text-gold-400" /> Modify &amp; Publish Target Training Calendar
      </h3>
      <div className="max-w-3xl space-y-4">
        <div>
          <label className={labelCls}>Select target batch code to edit</label>
          <select className={fieldCls} value={batchId} onChange={(e) => setBatchId(e.target.value)}>
            <option value="">— Choose a batch —</option>
            {d.batches.map((b) => {
              const c = d.courses.find((cc) => cc.id === b.course_id)
              return (
                <option key={b.id} value={b.id}>
                  {b.batch_code}{c ? ` (${c.title})` : ''}
                </option>
              )
            })}
          </select>
        </div>
        {batch && (
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-3 text-[11px] font-bold tracking-[0.12em] text-white/45 uppercase">Active schedule parameters</div>
            <div className="grid gap-x-8 gap-y-2 text-[13px] text-white/80 sm:grid-cols-2">
              <div><span className="text-white/45">Trainer instructor:</span> <b>{trainer ? `${trainer.first_name} ${trainer.last_name}` : 'Unassigned'}</b></div>
              <div><span className="text-white/45">Assigned program:</span> <b>{course?.title ?? '—'}</b></div>
              <div><span className="text-white/45">Dates:</span> <b>{batch.start_date} → {batch.end_date}</b></div>
              <div><span className="text-white/45">Daily timing:</span> <b>{batch.start_time?.slice(0, 5)} – {batch.end_time?.slice(0, 5)}</b></div>
            </div>
            <a
              href="/calendar"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 px-5 py-2.5 text-[13px] font-bold text-navy-950 transition-all hover:-translate-y-0.5"
            >
              <CalendarRange size={15} /> Open &amp; publish calendar
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

/* =====================================================================
   TAB 2 — Academics & Batch Registry (cards + extract calendar doc)
===================================================================== */
function BatchRegistry() {
  const d = useLiveData()
  const [q, setQ] = useState('')
  if (hasSupabase && d.loading) return <Loading label="Loading batches…" />

  const rows = d.batches
    .map((b) => {
      const c = d.courses.find((cc) => cc.id === b.course_id)
      const t = d.profiles.find((p) => p.id === b.trainer_id)
      return { b, c, t }
    })
    .filter(({ b, c }) => {
      const hay = `${b.batch_code} ${c?.title ?? ''}`.toLowerCase()
      return hay.includes(q.trim().toLowerCase())
    })


  return (
    <div className="space-y-5">
      <div className={CARD}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[15px] font-extrabold text-white">Active Batches</div>
            <p className="mt-1 text-[12.5px] text-white/55">Search active batch programs and launch official calendar stencils for Tamkeen.</p>
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search batch code (e.g. CTC-CCNA-2601)…"
            className="w-full max-w-xs rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[13px] text-white outline-none placeholder:text-white/35 focus:border-gold-400/50 sm:w-72"
          />
        </div>
      </div>

      <div className={CARD}>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[13px] font-bold tracking-[0.1em] text-gold-400 uppercase">Ongoing &amp; scheduled tracks</span>
          <span className="rounded-md border border-white/15 bg-white/[0.04] px-3 py-1 text-[11.5px] font-bold text-white/70">Total tracks: {rows.length}</span>
        </div>
        {rows.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-white/45">No batches match your search.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rows.map(({ b, c, t }) => (
              <div key={b.id} className="flex flex-col rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-md border border-white/15 bg-white/[0.05] px-2.5 py-1 font-mono text-[11px] font-bold text-white/80">{b.batch_code}</span>
                  <span className="rounded-md border border-gold-400/30 bg-gold-400/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-gold-400 uppercase">{b.status}</span>
                </div>
                <h3 className="text-[14.5px] font-extrabold text-white">{c?.title ?? '—'}</h3>
                <p className="mt-0.5 text-[12px] text-white/55">Instructor: <b className="text-white/80">{t ? `${t.first_name} ${t.last_name}` : 'Unassigned'}</b></p>
                <div className="mt-3 space-y-1.5 rounded-lg border border-white/10 bg-white/[0.02] p-3 text-[12px]">
                  <div className="flex justify-between"><span className="text-white/45">Class interval:</span> <b className="text-white/85">{b.start_date} to {b.end_date}</b></div>
                  <div className="flex justify-between"><span className="text-white/45">Daily timing:</span> <b className="text-white/85">{b.start_time?.slice(0, 5)} - {b.end_time?.slice(0, 5)}</b></div>
                  <div className="flex justify-between"><span className="text-white/45">Total program hours:</span> <b className="text-gold-400">{b.total_hours} Hours</b></div>
                </div>
                <Link
                  to={`/calendar?batch=${b.id}`}
                  className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 px-4 py-2.5 text-[12.5px] font-bold text-navy-950 transition-all hover:-translate-y-0.5"
                >
                  <FileDown size={14} /> Extract Tamkeen Calendar Document
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
