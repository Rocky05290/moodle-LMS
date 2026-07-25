import { Layers, Users, CalendarCheck, Trophy, Plus, Upload, Sparkles, ArrowRight } from 'lucide-react'
import {
  batches, courses, users, enrollments, getCourse, getUser, learnersInBatch,
  attendancePct, batchAttendancePct, averageGrade, fullName, initials,
} from '../data/mock'
import { Avatar, Badge, Button, Card, IconTile, type IconTone, ProgressBar, Ring, SectionTitle, Stat, Td, Th } from '../components/ui'

const CARD_TONES: IconTone[] = ['blue', 'violet', 'amber', 'sky', 'emerald', 'navy']

export default function AdminDashboard() {
  const learners = users.filter((u) => u.role === 'learner')
  const activeBatch = batches.find((b) => b.status === 'active')!
  const roster = learnersInBatch(activeBatch.id)

  const passRate = Math.round(
    (roster.filter((r) => (averageGrade(r.learnerId, activeBatch.id) ?? 0) >= 60).length /
      roster.length) * 100,
  )

  return (
    <div className="space-y-5">
      {/* ---------------- hero band ---------------- */}
      <Card className="relative overflow-hidden border-navy-900/10 bg-gradient-to-br from-navy-800 to-navy-900 p-6">
        <div className="relative z-10 flex flex-wrap items-center gap-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Sparkles size={13} className="text-brand-400" />
              <span className="text-[10.5px] font-bold tracking-[0.14em] text-white/45 uppercase">
                Welcome back
              </span>
            </div>
            <h2 className="mt-1.5 text-[24px] font-extrabold tracking-tight text-white">
              Ankit Srivastav
            </h2>
            <p className="mt-1 text-[13px] text-white/55">
              {batches.length} batches running · {learners.length} learners in training ·{' '}
              <span className="font-semibold text-brand-400">{activeBatch.batchCode}</span> active
              today
            </p>
          </div>

          <div className="ml-auto flex flex-wrap gap-2.5">
            <Button variant="gold" className="flex items-center gap-1.5">
              <Plus size={14} /> Create batch
            </Button>
            <button className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/25 bg-white/12 px-4 py-2.5 text-[13px] font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20">
              <Upload size={14} /> Import learners
            </button>
          </div>
        </div>

        <span className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-brand-400/25 blur-[90px]" />
        <span className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-gold-500/12 blur-[90px]" />
      </Card>

      {/* ---------------- KPIs ---------------- */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={<Layers size={18} />} value={batches.length} label="Active Batches" tone="blue" delta="▲ 1" />
        <Stat icon={<Users size={18} />} value={learners.length} label="Enrolled Learners" tone="violet" delta="▲ 3" />
        <Stat icon={<CalendarCheck size={18} />} value={`${batchAttendancePct(activeBatch.id)}%`} label="Avg Attendance" tone="emerald" delta="▲ 4%" />
        <Stat icon={<Trophy size={18} />} value={`${passRate}%`} label="Pass Rate" tone="amber" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        {/* ---------------- Batch Health ---------------- */}
        <Card className="p-5">
          <SectionTitle right={<Badge tone="brand">{activeBatch.batchCode}</Badge>}>
            Batch Health
          </SectionTitle>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px]">
              <thead>
                <tr>
                  <Th>Learner</Th>
                  <Th>Company</Th>
                  <Th className="text-center">Attendance</Th>
                  <Th className="text-center">Avg Grade</Th>
                  <Th>Progress</Th>
                </tr>
              </thead>
              <tbody>
                {roster.map((r) => {
                  const att = attendancePct(r.learnerId, activeBatch.id)
                  const avg = averageGrade(r.learnerId, activeBatch.id)
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-brand-50/60"
                    >
                      <Td>
                        <div className="flex items-center gap-2.5">
                          <Avatar text={initials(r.user)} size={28} />
                          <span className="font-semibold text-navy-900">{fullName(r.user)}</span>
                        </div>
                      </Td>
                      <Td className="text-ink-500">{r.user.company ?? '—'}</Td>
                      <Td className="text-center">
                        <Badge tone={att >= 80 ? 'ok' : att >= 60 ? 'warn' : 'bad'}>{att}%</Badge>
                      </Td>
                      <Td className="text-center font-bold text-navy-900">{avg ?? '—'}</Td>
                      <Td>
                        <div className="flex items-center gap-2.5">
                          <ProgressBar value={r.progress} className="w-24" />
                          <span className="text-[11.5px] font-semibold text-ink-500">
                            {r.progress}%
                          </span>
                        </div>
                      </Td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ---------------- Batches ---------------- */}
        <Card className="p-5">
          <SectionTitle
            right={
              <Button variant="ghost" className="flex items-center gap-1.5 !px-3 !py-1.5 !text-[12px]">
                <Plus size={13} /> New
              </Button>
            }
          >
            Batches
          </SectionTitle>

          <div className="space-y-2.5">
            {batches.map((b) => {
              const course = getCourse(b.courseId)
              const trainer = getUser(b.trainerId)
              const count = enrollments.filter((e) => e.batchId === b.id).length
              return (
                <div
                  key={b.id}
                  className="group flex items-center gap-3.5 rounded-xl border border-line bg-soft p-3.5 hover:border-brand-500/25 hover:bg-surface hover:shadow-md"
                >
                  <Ring value={b.status === 'active' ? batchAttendancePct(b.id) : 0} size={42} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[13.5px] font-bold text-navy-900">
                        {b.batchCode}
                      </span>
                      <Badge tone={b.status === 'active' ? 'ok' : 'muted'}>
                        {b.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="mt-0.5 truncate text-[11.5px] text-ink-500">
                      {course.title} · {fullName(trainer)}
                    </div>
                    <div className="mt-1 text-[11px] text-ink-400">
                      {b.startDate} → {b.endDate} · {b.totalHours}h · {count} learners
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* ---------------- Course inventory ---------------- */}
      <Card className="p-5">
        <SectionTitle right={<Badge tone="muted">{courses.length} courses</Badge>}>
          Master Course Inventory
        </SectionTitle>
        <div className="grid gap-4 md:grid-cols-3">
          {courses.map((c, i) => (
            <div
              key={c.id}
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
