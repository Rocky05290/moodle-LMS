import { useState } from 'react'
import { PlayCircle, Lock, CheckCircle2, Clock, Award, FileText, X, BookOpen } from 'lucide-react'
import {
  batches, getCourse, getUser, enrollments, attendancePct, averageGrade, fullName,
} from '../data/mock'
import { useLiveData, attPct, avgGradeLive, hasSupabase } from '../lib/live'
import { downloadCertificate } from '../lib/certificate'
import { Badge, Button, Card, ProgressBar, Ring, SectionTitle, Stat } from '../components/ui'
import Loading from '../components/Loading'

const LEARNER_ID = 101

type Module = {
  num: string
  title: string
  desc: string
  material?: string
  quiz?: { q: string; opts: string[]; correct: number }[]
}
type Scores = { pre: number | null; act: number | null; mid: number | null; post: number | null }
const ASSESSMENTS: { key: keyof Scores; label: string; desc: string }[] = [
  { key: 'pre', label: 'Pre-test', desc: 'Initial skills benchmark' },
  { key: 'act', label: 'Activity', desc: 'Practical task' },
  { key: 'mid', label: 'Mid-term', desc: 'Mid-course evaluation' },
  { key: 'post', label: 'Post-test', desc: 'Final certification' },
]
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
  scores: Scores
}

export default function LearnerToday() {
  const d = useLiveData()
  const [lesson, setLesson] = useState<number | null>(null)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [score, setScore] = useState<number | null>(null)
  const goLesson = (i: number | null) => {
    setLesson(i)
    setAnswers({})
    setScore(null)
  }

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
      const myGrades = batch ? d.grades.filter((g) => g.learner_id === d.me!.id && g.batch_id === batch.id) : []
      const sc = (k: string): number | null => {
        const g = myGrades.find((x) => x.assessment === k)
        return g ? Number(g.score) : null
      }
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
        scores: { pre: sc('pre'), act: sc('act'), mid: sc('mid'), post: sc('post') },
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
      scores: { pre: null, act: null, mid: null, post: null },
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
                    onClick={() => goLesson(i)}
                    className={`flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition-colors ${
                      current
                        ? 'border-brand-500/30 bg-brand-50'
                        : 'border-line bg-soft hover:border-brand-500/30 hover:bg-brand-50/50'
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

        {/* assessments */}
        <Card className="p-5">
          <SectionTitle>My Assessments</SectionTitle>
          <div className="space-y-2.5">
            {ASSESSMENTS.map((a) => {
              const s = vm!.scores[a.key]
              return (
                <div key={a.key} className="flex items-center gap-3 rounded-xl border border-line bg-soft p-3.5">
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-bold">{a.label}</div>
                    <div className="text-[11.5px] text-ink-400">{a.desc}</div>
                  </div>
                  {s == null ? <Badge tone="muted">Not taken</Badge> : <Badge tone={s >= 60 ? 'ok' : 'bad'}>{s}%</Badge>}
                </div>
              )
            })}
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

      {lesson !== null && vm.modules[lesson] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => goLesson(null)} />
          <div className="relative z-10 max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-surface p-6 shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wide text-brand-600 uppercase">
                Module {vm.modules[lesson].num} · Lesson {lesson + 1} of {vm.modules.length}
              </span>
              <button onClick={() => goLesson(null)} className="cursor-pointer text-ink-400 hover:text-navy-900">
                <X size={18} />
              </button>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <FileText size={20} />
              </div>
              <h3 className="text-[17px] leading-snug font-extrabold text-navy-900">{vm.modules[lesson].title}</h3>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-ink-600">{vm.modules[lesson].desc}</p>

            {vm.modules[lesson].material ? (
              <a
                href={vm.modules[lesson].material}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center gap-2 rounded-lg border border-brand-500/30 bg-brand-50 px-3 py-2.5 text-[12.5px] font-bold text-brand-600 transition-colors hover:bg-brand-100"
              >
                <BookOpen size={15} /> Open lesson material ↗
              </a>
            ) : (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-line bg-soft px-3 py-2.5 text-[11.5px] text-ink-500">
                <BookOpen size={14} className="flex-none text-ink-400" />
                No material attached to this lesson yet.
              </div>
            )}

            {vm.modules[lesson].quiz && vm.modules[lesson].quiz!.length > 0 && (
              <div className="mt-5 border-t border-line pt-4">
                <div className="text-[12.5px] font-extrabold text-navy-900">Quick quiz</div>
                <div className="mt-2 space-y-3">
                  {vm.modules[lesson].quiz!.map((qq, qi) => (
                    <div key={qi}>
                      <div className="text-[12.5px] font-semibold text-navy-900">
                        {qi + 1}. {qq.q}
                      </div>
                      <div className="mt-1.5 space-y-1">
                        {qq.opts.map((o, oi) => {
                          const chosen = answers[qi] === oi
                          const revealed = score != null
                          const cls = revealed
                            ? oi === qq.correct
                              ? 'border-ok-600/40 bg-ok-50 text-ok-600'
                              : chosen
                                ? 'border-bad-600/40 bg-bad-50 text-bad-600'
                                : 'border-line text-ink-500'
                            : chosen
                              ? 'border-brand-500 bg-brand-50 text-navy-900'
                              : 'border-line text-ink-600 hover:border-brand-500/40'
                          return (
                            <label key={oi} className={`flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-[12px] ${cls}`}>
                              <input
                                type="radio"
                                className="h-3 w-3 accent-brand-500"
                                disabled={revealed}
                                checked={chosen}
                                onChange={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                              />
                              {o || <span className="text-ink-400">Option {String.fromCharCode(65 + oi)}</span>}
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                {score == null ? (
                  <Button
                    onClick={() => {
                      const q = vm!.modules[lesson].quiz!
                      setScore(q.reduce((n, qq, qi) => n + (answers[qi] === qq.correct ? 1 : 0), 0))
                    }}
                    className="mt-3"
                  >
                    Submit quiz
                  </Button>
                ) : (
                  <div className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-[12.5px] font-extrabold text-brand-700">
                    You scored {score} / {vm.modules[lesson].quiz!.length} (
                    {Math.round((score / vm.modules[lesson].quiz!.length) * 100)}%)
                  </div>
                )}
              </div>
            )}

            <div className="mt-5 flex items-center justify-between">
              <Button variant="ghost" onClick={() => goLesson(Math.max(0, lesson - 1))}>
                ← Previous
              </Button>
              <span className="text-[11.5px] font-semibold text-ink-400">
                {lesson + 1} / {vm.modules.length}
              </span>
              {lesson < vm.modules.length - 1 ? (
                <Button onClick={() => goLesson(lesson + 1)}>Next →</Button>
              ) : (
                <Button onClick={() => goLesson(null)}>Finish</Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
