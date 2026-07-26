import { PlayCircle, Lock, CheckCircle2, Clock, Award } from 'lucide-react'
import {
  batches, getCourse, getUser, enrollments, attendancePct, averageGrade, fullName,
} from '../data/mock'
import { useLiveData, attPct, avgGradeLive, hasSupabase } from '../lib/live'
import { downloadCertificate } from '../lib/certificate'
import { Badge, Button, Card, ProgressBar, Ring, SectionTitle, Stat } from '../components/ui'
import Loading from '../components/Loading'

const LEARNER_ID = 101

type Module = { num: string; title: string; desc: string }
type LearnerVM = {
  firstName: string
  learnerName: string
  courseTitle: string
  batchCode: string
  startTime: string
  att: number
  avg: number | null
  progress: number
  modules: Module[]
  completedCount: number
  trainerName: string
  hours: number
  endDate: string
  cpr: string
  eligible: boolean
}

export default function LearnerToday() {
  const d = useLiveData()

  if (hasSupabase && d.loading) return <Loading label="Loading your course…" />

  let vm: LearnerVM | null = null
  let notEnrolledName = ''

  if (hasSupabase && d.me) {
    const enr = d.enrollments.find((e) => e.learner_id === d.me!.id)
    if (!enr) {
      notEnrolledName = d.me.first_name
    } else {
      const batch = d.batches.find((b) => b.id === enr.batch_id)
      const course = batch ? d.courses.find((c) => c.id === batch.course_id) : undefined
      const trainer = batch ? d.profiles.find((p) => p.id === batch.trainer_id) : undefined
      const modules = course?.modules ?? []
      const att0 = batch ? attPct(d.attendance, d.me.id, batch.id) : 0
      const avg0 = batch ? avgGradeLive(d.grades, d.me.id, batch.id) : null
      vm = {
        firstName: d.me.first_name,
        learnerName: `${d.me.first_name} ${d.me.last_name}`,
        courseTitle: course?.title ?? '—',
        batchCode: batch?.batch_code ?? '—',
        startTime: (batch?.start_time ?? '').slice(0, 5) || 'TBD',
        att: att0,
        avg: avg0,
        progress: enr.progress,
        modules,
        completedCount: Math.floor((enr.progress / 100) * modules.length),
        trainerName: trainer ? `${trainer.first_name} ${trainer.last_name}` : 'Unassigned',
        hours: batch?.total_hours ?? 0,
        endDate: batch?.end_date ?? '',
        cpr: d.me.cpr ?? '',
        eligible: att0 >= 75 && (avg0 ?? 0) >= 60,
      }
    }
  } else {
    const me = getUser(LEARNER_ID)
    const enr = enrollments.find((e) => e.learnerId === LEARNER_ID)!
    const batch = batches.find((b) => b.id === enr.batchId)!
    const course = getCourse(batch.courseId)
    const att0 = attendancePct(LEARNER_ID, batch.id)
    const avg0 = averageGrade(LEARNER_ID, batch.id)
    vm = {
      firstName: me.firstName,
      learnerName: fullName(me),
      courseTitle: course.title,
      batchCode: batch.batchCode,
      startTime: batch.startTime,
      att: att0,
      avg: avg0,
      progress: enr.progress,
      modules: course.modules,
      completedCount: Math.floor((enr.progress / 100) * course.modules.length),
      trainerName: fullName(getUser(batch.trainerId)),
      hours: batch.totalHours,
      endDate: batch.endDate,
      cpr: me.cpr ?? '',
      eligible: att0 >= 75 && (avg0 ?? 0) >= 60,
    }
  }

  if (!vm) {
    return (
      <Card className="p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
          <Clock size={24} />
        </div>
        <h2 className="mt-4 text-[18px] font-extrabold text-navy-900">
          Welcome, {notEnrolledName || 'learner'} 👋
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[13px] text-ink-500">
          You're not enrolled in a batch yet. Once an admin enrols you, your course, attendance and learning path will
          appear here.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* hero */}
      <Card className="relative overflow-hidden p-6">
        <div className="flex flex-wrap items-center gap-5">
          <Ring value={vm.progress} size={72} />
          <div className="min-w-0">
            <h2 className="text-[20px] font-extrabold tracking-tight">
              Welcome back, {vm.firstName.split(' ')[0]} 👋
            </h2>
            <p className="mt-1 text-[13px] text-ink-500">
              {vm.courseTitle} · <span className="font-semibold text-ink-700">{vm.batchCode}</span>
            </p>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2.5">
            <Badge tone="brand">Next class · {vm.startTime}</Badge>
            {vm.eligible && (
              <Button
                variant="gold"
                onClick={() =>
                  downloadCertificate({
                    learnerName: vm!.learnerName,
                    courseTitle: vm!.courseTitle,
                    batchCode: vm!.batchCode,
                    hours: vm!.hours,
                    date: vm!.endDate,
                    cpr: vm!.cpr || undefined,
                  })
                }
                className="flex items-center gap-2"
              >
                <Award size={15} /> My certificate
              </Button>
            )}
            <Button className="flex items-center gap-2">
              <PlayCircle size={15} /> Join live class
            </Button>
          </div>
        </div>
        <div className="pointer-events-none absolute -top-16 -right-16 h-52 w-52 rounded-full bg-brand-50 blur-[90px]" />
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={<Clock size={18} />} value={`${vm.att}%`} label="My Attendance" />
        <Stat icon={<Award size={18} />} value={vm.avg ?? '—'} label="Average Grade" />
        <Stat icon={<CheckCircle2 size={18} />} value={`${vm.progress}%`} label="Course Progress" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        {/* learning path */}
        <Card className="p-5">
          <SectionTitle right={<Badge tone="muted">Sequential unlock</Badge>}>Learning path</SectionTitle>

          {vm.modules.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line2 bg-soft p-6 text-center text-[12.5px] text-ink-500">
              This course has no modules defined yet.
            </p>
          ) : (
            <div className="space-y-2.5">
              {vm.modules.map((m, i) => {
                const done = i < vm!.completedCount
                const current = i === vm!.completedCount
                const locked = i > vm!.completedCount
                return (
                  <div
                    key={m.num}
                    className={`flex items-start gap-3.5 rounded-xl border p-4 ${
                      current ? 'border-brand-500/30 bg-brand-50' : 'border-line bg-soft hover:bg-soft'
                    } ${locked ? 'opacity-55' : ''}`}
                  >
                    <div
                      className={`flex h-9 w-9 flex-none items-center justify-center rounded-xl text-[12px] font-extrabold ${
                        done ? 'bg-ok-50 text-ok-600' : current ? 'bg-brand-500 text-white' : 'bg-soft text-ink-400'
                      }`}
                    >
                      {done ? <CheckCircle2 size={16} /> : locked ? <Lock size={14} /> : m.num}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[13.5px] font-bold">{m.title}</span>
                        {done && <Badge tone="ok">DONE</Badge>}
                        {current && <Badge tone="brand">IN PROGRESS</Badge>}
                      </div>
                      <p className="mt-1 text-[12px] leading-relaxed text-ink-500">{m.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* deadlines */}
        <Card className="p-5">
          <SectionTitle>What's next</SectionTitle>
          <div className="space-y-2.5">
            {[
              ['Mid Assessment', 'Due in 3 days', 'warn'],
              ['Practical Task submission', 'Due in 6 days', 'muted'],
              ['Course Evaluation Form', 'End of batch', 'muted'],
            ].map(([t, dd, tone]) => (
              <div key={t} className="flex items-center gap-3 rounded-xl border border-line bg-soft p-3.5">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-bold">{t}</div>
                  <div className="text-[11.5px] text-ink-400">{dd}</div>
                </div>
                <Badge tone={tone as 'warn' | 'muted'}>DUE</Badge>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <SectionTitle>Overall progress</SectionTitle>
            <ProgressBar value={vm.progress} />
            <p className="mt-2 text-[11.5px] text-ink-400">
              {vm.completedCount} of {vm.modules.length} modules complete · {vm.trainerName}
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
