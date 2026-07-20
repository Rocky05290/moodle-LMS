import { PlayCircle, Lock, CheckCircle2, Clock, Award } from 'lucide-react'
import {
  batches, getCourse, getUser, enrollments, attendancePct, averageGrade, fullName,
} from '../data/mock'
import { Badge, Button, Card, ProgressBar, Ring, SectionTitle, Stat } from '../components/ui'

const LEARNER_ID = 101

export default function LearnerToday() {
  const me = getUser(LEARNER_ID)
  const enr = enrollments.find((e) => e.learnerId === LEARNER_ID)!
  const batch = batches.find((b) => b.id === enr.batchId)!
  const course = getCourse(batch.courseId)
  const att = attendancePct(LEARNER_ID, batch.id)
  const avg = averageGrade(LEARNER_ID, batch.id)

  // sequential unlock: a module unlocks when the previous is complete
  const completedCount = Math.floor((enr.progress / 100) * course.modules.length)

  return (
    <div className="space-y-6">
      {/* hero */}
      <Card className="relative overflow-hidden p-6">
        <div className="flex flex-wrap items-center gap-5">
          <Ring value={enr.progress} size={72} />
          <div className="min-w-0">
            <h2 className="text-[20px] font-extrabold tracking-tight">
              Welcome back, {me.firstName.split(' ')[0]} 👋
            </h2>
            <p className="mt-1 text-[13px] text-ink-500">
              {course.title} · <span className="font-semibold text-ink-700">{batch.batchCode}</span>
            </p>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2.5">
            <Badge tone="brand">Next class · {batch.startTime}</Badge>
            <Button className="flex items-center gap-2">
              <PlayCircle size={15} /> Join live class
            </Button>
          </div>
        </div>
        <div className="pointer-events-none absolute -top-16 -right-16 h-52 w-52 rounded-full bg-brand-50 blur-[90px]" />
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={<Clock size={18} />} value={`${att}%`} label="My Attendance" />
        <Stat icon={<Award size={18} />} value={avg ?? '—'} label="Average Grade" />
        <Stat icon={<CheckCircle2 size={18} />} value={`${enr.progress}%`} label="Course Progress" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        {/* learning path */}
        <Card className="p-5">
          <SectionTitle right={<Badge tone="muted">Sequential unlock</Badge>}>
            Learning path
          </SectionTitle>

          <div className="space-y-2.5">
            {course.modules.map((m, i) => {
              const done = i < completedCount
              const current = i === completedCount
              const locked = i > completedCount
              return (
                <div
                  key={m.num}
                  className={`flex items-start gap-3.5 rounded-xl border p-4 ${
                    current
                      ? 'border-brand-500/30 bg-brand-50'
                      : 'border-line bg-soft hover:bg-soft'
                  } ${locked ? 'opacity-55' : ''}`}
                >
                  <div
                    className={`flex h-9 w-9 flex-none items-center justify-center rounded-xl text-[12px] font-extrabold ${
                      done
                        ? 'bg-ok-50 text-ok-600'
                        : current
                          ? 'bg-brand-500 text-white'
                          : 'bg-soft text-ink-400'
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
        </Card>

        {/* deadlines */}
        <Card className="p-5">
          <SectionTitle>What's next</SectionTitle>
          <div className="space-y-2.5">
            {[
              ['Mid Assessment', 'Due in 3 days', 'warn'],
              ['Practical Task submission', 'Due in 6 days', 'muted'],
              ['Course Evaluation Form', 'End of batch', 'muted'],
            ].map(([t, d, tone]) => (
              <div
                key={t}
                className="flex items-center gap-3 rounded-xl border border-line bg-soft p-3.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-bold">{t}</div>
                  <div className="text-[11.5px] text-ink-400">{d}</div>
                </div>
                <Badge tone={tone as 'warn' | 'muted'}>DUE</Badge>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <SectionTitle>Overall progress</SectionTitle>
            <ProgressBar value={enr.progress} />
            <p className="mt-2 text-[11.5px] text-ink-400">
              {completedCount} of {course.modules.length} modules complete ·{' '}
              {fullName(getUser(batch.trainerId))}
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

