import { useNavigate } from 'react-router-dom'
import { Layers, Users, CalendarCheck, Trophy, Plus, Upload, Sparkles, ArrowRight } from 'lucide-react'
import {
  batches, courses, users, enrollments, getCourse, getUser, learnersInBatch,
  attendancePct, batchAttendancePct, averageGrade, fullName, initials,
} from '../data/mock'
import { useLiveData, attPct, batchAttPct, avgGradeLive, hasSupabase } from '../lib/live'
import { Avatar, Badge, Button, Card, IconTile, type IconTone, ProgressBar, Ring, SectionTitle, Stat, Td, Th } from '../components/ui'
import Loading from '../components/Loading'

const CARD_TONES: IconTone[] = ['blue', 'violet', 'amber', 'sky', 'emerald', 'navy']

type RosterVM = { key: string | number; name: string; init: string; company: string | null; attendance: number; avgGrade: number | null; progress: number }
type BatchVM = { key: string | number; code: string; status: string; courseTitle: string; trainerName: string; count: number; ring: number; startDate: string; endDate: string; totalHours: number }
type CourseVM = { id: number; code: string; title: string; category: string; totalHours: number; modules: { num: string; title: string; desc: string }[] }
type DashVM = {
  live: boolean
  name: string
  batchesCount: number
  learnersCount: number
  coursesCount: number
  activeCode: string
  avgAttendance: number
  passRate: number
  roster: RosterVM[]
  batchList: BatchVM[]
  courses: CourseVM[]
}

const nm = (name: string) =>
  name.split(' ').filter(Boolean).map((s) => s[0]).slice(0, 2).join('').toUpperCase()

export default function AdminDashboard() {
  const d = useLiveData()
  const navigate = useNavigate()

  if (hasSupabase && d.loading) return <Loading label="Loading dashboard…" />

  let vm: DashVM
  if (hasSupabase) {
    const liveLearners = d.profiles.filter((p) => p.role === 'learner')
    const active = d.batches.find((b) => b.status === 'active') ?? d.batches[0]
    const courseById = (id: number) => d.courses.find((c) => c.id === id)
    const profById = (id: string | null) => d.profiles.find((p) => p.id === id)
    const rosterEnroll = active ? d.enrollments.filter((e) => e.batch_id === active.id) : []
    const roster: RosterVM[] = rosterEnroll.map((e) => {
      const u = profById(e.learner_id)
      const name = u ? `${u.first_name} ${u.last_name}` : '—'
      return {
        key: e.id,
        name,
        init: nm(name),
        company: u?.company ?? null,
        attendance: active ? attPct(d.attendance, e.learner_id, active.id) : 0,
        avgGrade: active ? avgGradeLive(d.grades, e.learner_id, active.id) : null,
        progress: e.progress,
      }
    })
    const passRate = roster.length
      ? Math.round((roster.filter((r) => (r.avgGrade ?? 0) >= 60).length / roster.length) * 100)
      : 0
    vm = {
      live: true,
      name: d.me ? `${d.me.first_name} ${d.me.last_name}` : 'Admin',
      batchesCount: d.batches.length,
      learnersCount: liveLearners.length,
      coursesCount: d.courses.length,
      activeCode: active?.batch_code ?? '—',
      avgAttendance: active ? batchAttPct(d.attendance, active.id) : 0,
      passRate,
      roster,
      batchList: d.batches.map((b) => {
        const c = courseById(b.course_id)
        const t = profById(b.trainer_id)
        return {
          key: b.id,
          code: b.batch_code,
          status: b.status,
          courseTitle: c?.title ?? '—',
          trainerName: t ? `${t.first_name} ${t.last_name}` : 'Unassigned',
          count: d.enrollments.filter((e) => e.batch_id === b.id).length,
          ring: b.status === 'active' ? batchAttPct(d.attendance, b.id) : 0,
          startDate: b.start_date,
          endDate: b.end_date,
          totalHours: b.total_hours,
        }
      }),
      courses: d.courses.map((c) => ({
        id: c.id,
        code: c.code,
        title: c.title,
        category: c.category ?? '',
        totalHours: c.total_hours,
        modules: c.modules ?? [],
      })),
    }
  } else {
    const learners = users.filter((u) => u.role === 'learner')
    const active = batches.find((b) => b.status === 'active')!
    const roster: RosterVM[] = learnersInBatch(active.id).map((r) => ({
      key: r.id,
      name: fullName(r.user),
      init: initials(r.user),
      company: r.user.company ?? null,
      attendance: attendancePct(r.learnerId, active.id),
      avgGrade: averageGrade(r.learnerId, active.id),
      progress: r.progress,
    }))
    const passRate = Math.round((roster.filter((r) => (r.avgGrade ?? 0) >= 60).length / roster.length) * 100)
    vm = {
      live: false,
      name: 'Ankit Srivastav',
      batchesCount: batches.length,
      learnersCount: learners.length,
      coursesCount: courses.length,
      activeCode: active.batchCode,
      avgAttendance: batchAttendancePct(active.id),
      passRate,
      roster,
      batchList: batches.map((b) => ({
        key: b.id,
        code: b.batchCode,
        status: b.status,
        courseTitle: getCourse(b.courseId).title,
        trainerName: fullName(getUser(b.trainerId)),
        count: enrollments.filter((e) => e.batchId === b.id).length,
        ring: b.status === 'active' ? batchAttendancePct(b.id) : 0,
        startDate: b.startDate,
        endDate: b.endDate,
        totalHours: b.totalHours,
      })),
      courses: courses.map((c) => ({
        id: c.id,
        code: c.code,
        title: c.title,
        category: c.category,
        totalHours: c.totalHours,
        modules: c.modules,
      })),
    }
  }

  return (
    <div className="space-y-5">
      {/* ---------------- hero band ---------------- */}
      <Card className="relative overflow-hidden border-navy-900/10 bg-gradient-to-br from-navy-800 to-navy-900 p-6">
        <div className="relative z-10 flex flex-wrap items-center gap-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Sparkles size={13} className="text-brand-400" />
              <span className="text-[10.5px] font-bold tracking-[0.14em] text-white/45 uppercase">Welcome back</span>
              <span
                className={`ml-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold tracking-wide uppercase ${
                  vm.live ? 'bg-ok-600/20 text-ok-600' : 'bg-white/10 text-white/50'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${vm.live ? 'bg-ok-600' : 'bg-white/40'}`} />
                {vm.live ? 'Live data' : 'Sample data'}
              </span>
            </div>
            <h2 className="mt-1.5 text-[24px] font-extrabold tracking-tight text-white">{vm.name}</h2>
            <p className="mt-1 text-[13px] text-white/55">
              {vm.batchesCount} batches running · {vm.learnersCount} learners in training ·{' '}
              <span className="font-semibold text-brand-400">{vm.activeCode}</span> active today
            </p>
          </div>

          <div className="ml-auto flex flex-wrap gap-2.5">
            <Button variant="gold" onClick={() => navigate('/batches?new=1')} className="flex items-center gap-1.5">
              <Plus size={14} /> Create batch
            </Button>
            <button
              onClick={() => navigate('/people?import=1')}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/25 bg-white/12 px-4 py-2.5 text-[13px] font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <Upload size={14} /> Import learners
            </button>
          </div>
        </div>

        <span className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-brand-400/25 blur-[90px]" />
        <span className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-gold-500/12 blur-[90px]" />
      </Card>

      {/* ---------------- KPIs ---------------- */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <button
          onClick={() => navigate('/batches')}
          className="block w-full cursor-pointer text-left transition-transform hover:-translate-y-0.5"
        >
          <Stat icon={<Layers size={18} />} value={vm.batchesCount} label="Active Batches" tone="blue" />
        </button>
        <button
          onClick={() => navigate('/people')}
          className="block w-full cursor-pointer text-left transition-transform hover:-translate-y-0.5"
        >
          <Stat icon={<Users size={18} />} value={vm.learnersCount} label="Enrolled Learners" tone="violet" />
        </button>
        <button
          onClick={() => navigate('/attendance')}
          className="block w-full cursor-pointer text-left transition-transform hover:-translate-y-0.5"
        >
          <Stat icon={<CalendarCheck size={18} />} value={`${vm.avgAttendance}%`} label="Avg Attendance" tone="emerald" />
        </button>
        <button
          onClick={() => navigate('/grading')}
          className="block w-full cursor-pointer text-left transition-transform hover:-translate-y-0.5"
        >
          <Stat icon={<Trophy size={18} />} value={`${vm.passRate}%`} label="Pass Rate" tone="amber" />
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        {/* ---------------- Batch Health ---------------- */}
        <Card className="p-5">
          <SectionTitle right={<Badge tone="brand">{vm.activeCode}</Badge>}>Batch Health</SectionTitle>

          {vm.roster.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line2 bg-soft p-8 text-center">
              <p className="text-[13px] font-semibold text-ink-600">No learners enrolled in the active batch yet.</p>
              <p className="mt-1 text-[12px] text-ink-400">Enrol learners on the Attendance page to see their health here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[540px]">
                <thead>
                  <tr>
                    <Th className="w-full">Learner</Th>
                    <Th>Company</Th>
                    <Th className="text-center">Attendance</Th>
                    <Th className="text-center">Avg Grade</Th>
                    <Th>Progress</Th>
                  </tr>
                </thead>
                <tbody>
                  {vm.roster.map((r) => (
                    <tr key={r.key} className="hover:bg-brand-50/60">
                      <Td>
                        <div className="flex items-center gap-2.5">
                          <Avatar text={r.init} size={28} />
                          <span className="font-semibold text-navy-900">{r.name}</span>
                        </div>
                      </Td>
                      <Td className="text-ink-500">{r.company ?? '—'}</Td>
                      <Td className="text-center">
                        <Badge tone={r.attendance >= 80 ? 'ok' : r.attendance >= 60 ? 'warn' : 'bad'}>
                          {r.attendance}%
                        </Badge>
                      </Td>
                      <Td className="text-center font-bold text-navy-900">{r.avgGrade ?? '—'}</Td>
                      <Td>
                        <div className="flex items-center gap-2.5">
                          <ProgressBar value={r.progress} className="w-24" />
                          <span className="text-[11.5px] font-semibold text-ink-500">{r.progress}%</span>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* ---------------- Batches ---------------- */}
        <Card className="p-5">
          <SectionTitle>Batches</SectionTitle>

          <div className="space-y-2.5">
            {vm.batchList.map((b) => (
              <div
                key={b.key}
                className="group flex items-center gap-3.5 rounded-xl border border-line bg-soft p-3.5 hover:border-brand-500/25 hover:bg-surface hover:shadow-md"
              >
                <Ring value={b.ring} size={42} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[13.5px] font-bold text-navy-900">{b.code}</span>
                    <Badge tone={b.status === 'active' ? 'ok' : 'muted'}>{b.status.toUpperCase()}</Badge>
                  </div>
                  <div className="mt-0.5 truncate text-[11.5px] text-ink-500">
                    {b.courseTitle} · {b.trainerName}
                  </div>
                  <div className="mt-1 text-[11px] text-ink-400">
                    {b.startDate} → {b.endDate} · {b.totalHours}h · {b.count} learners
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ---------------- Course inventory ---------------- */}
      <Card className="p-5">
        <SectionTitle right={<Badge tone="muted">{vm.coursesCount} courses</Badge>}>Master Course Inventory</SectionTitle>
        <div className="grid gap-4 md:grid-cols-3">
          {vm.courses.map((c, i) => (
            <div
              key={c.id}
              onClick={() => navigate('/courses')}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-line bg-surface p-5 shadow-[0_10px_28px_-16px_rgba(15,27,53,0.18)] transition-all hover:-translate-y-1 hover:border-brand-500/30 hover:shadow-[0_24px_50px_-20px_rgba(15,27,53,0.32)]"
            >
              {/* decorative gradient glow on hover */}
              <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-brand-400/25 via-violet-400/15 to-transparent opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative flex items-start justify-between">
                <IconTile icon={<Layers size={22} />} tone={CARD_TONES[i % CARD_TONES.length]} size={46} />
                <span className="rounded-full bg-soft px-2.5 py-1 text-[11px] font-extrabold text-ink-500 ring-1 ring-line">
                  {c.totalHours}h
                </span>
              </div>

              <div className="relative mt-4 flex items-center gap-2">
                <Badge tone="brand">{c.code}</Badge>
                <span className="text-[11px] font-semibold text-ink-400">{c.category}</span>
              </div>

              <h3 className="relative mt-2 text-[15px] leading-snug font-extrabold text-navy-900 transition-colors group-hover:text-brand-600">
                {c.title}
              </h3>
              <p className="relative mt-1.5 line-clamp-2 text-[11.5px] leading-relaxed text-ink-400">
                {c.modules.map((m) => m.title).join(' · ')}
              </p>

              <div className="relative mt-4 flex items-center justify-between border-t border-line pt-3">
                <span className="text-[11.5px] font-semibold text-ink-400">{c.modules.length} modules</span>
                <span className="flex translate-x-1 items-center gap-1 text-[11.5px] font-bold text-brand-600 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                  View <ArrowRight size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
