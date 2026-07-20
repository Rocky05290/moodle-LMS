import { Link } from 'react-router-dom'
import { CalendarCheck, ClipboardList, Users, ArrowUpRight } from 'lucide-react'
import {
  batches, getCourse, learnersInBatch, batchAttendancePct, averageGrade,
  fullName, initials,
} from '../data/mock'
import { Avatar, Badge, Card, ProgressBar, SectionTitle, Stat, Td, Th } from '../components/ui'

const TRAINER_ID = 104

export default function TrainerDashboard() {
  const mine = batches.filter((b) => b.trainerId === TRAINER_ID)
  const active = mine.find((b) => b.status === 'active') ?? mine[0]
  const roster = learnersInBatch(active.id)
  const pending = 5

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={<ClipboardList size={18} />} value={mine.length} label="My Batches" />
        <Stat icon={<Users size={18} />} value={roster.length} label="Active Learners" />
        <Stat icon={<CalendarCheck size={18} />} value={pending} label="Pending to Grade" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
        {/* my batches */}
        <Card className="p-5">
          <SectionTitle>My Batches</SectionTitle>
          <div className="space-y-2.5">
            {mine.map((b) => {
              const c = getCourse(b.courseId)
              return (
                <div key={b.id} className="rounded-xl border border-line bg-soft p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[13.5px] font-bold">{b.batchCode}</span>
                    <Badge tone={b.status === 'active' ? 'ok' : 'muted'}>
                      {b.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="mt-1 text-[12px] text-ink-500">{c.title}</div>
                  <div className="mt-2.5 flex items-center gap-3">
                    <ProgressBar value={b.status === 'active' ? batchAttendancePct(b.id) : 0} />
                    <span className="flex-none text-[11.5px] font-bold text-ink-500">
                      {b.status === 'active' ? `${batchAttendancePct(b.id)}%` : '—'}
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] text-ink-400">
                    {b.startDate} → {b.endDate} · {b.startTime}–{b.endTime}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* action items */}
        <Card className="p-5">
          <SectionTitle
            right={
              <Link
                to="/attendance"
                className="flex items-center gap-1 text-[12px] font-bold text-brand-500 hover:text-brand-400"
              >
                Take attendance <ArrowUpRight size={13} />
              </Link>
            }
          >
            Pending Action Items
          </SectionTitle>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[460px]">
              <thead>
                <tr>
                  <Th>Learner</Th>
                  <Th className="text-center">Attendance</Th>
                  <Th className="text-center">Avg Grade</Th>
                  <Th className="text-center">Action</Th>
                </tr>
              </thead>
              <tbody>
                {roster.map((r) => {
                  const avg = averageGrade(r.learnerId, active.id)
                  const needs = avg === null || avg < 60
                  return (
                    <tr key={r.id} className="hover:bg-soft">
                      <Td>
                        <div className="flex items-center gap-2.5">
                          <Avatar text={initials(r.user)} size={28} />
                          <span className="font-semibold">{fullName(r.user)}</span>
                        </div>
                      </Td>
                      <Td className="text-center text-ink-700">{r.progress}%</Td>
                      <Td className="text-center font-bold">{avg ?? '—'}</Td>
                      <Td className="text-center">
                        <Badge tone={needs ? 'warn' : 'ok'}>{needs ? 'Grade' : 'Done'}</Badge>
                      </Td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

