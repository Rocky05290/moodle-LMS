import { Link } from 'react-router-dom'
import { CalendarCheck, ClipboardList, Users, ArrowUpRight } from 'lucide-react'
import {
  batches, getCourse, learnersInBatch, batchAttendancePct, averageGrade, attendancePct,
  fullName, initials,
} from '../data/mock'
import { useLiveData, attPct, batchAttPct, avgGradeLive, nameInitials } from '../lib/live'
import { Avatar, Badge, Card, ProgressBar, SectionTitle, Stat, Td, Th } from '../components/ui'

const TRAINER_ID = 104

type BatchVM = {
  key: string | number
  code: string
  status: string
  title: string
  att: number
  startDate: string
  endDate: string
  startTime: string
  endTime: string
}
type RowVM = { key: string | number; name: string; init: string; attendance: number; avgGrade: number | null }

export default function TrainerDashboard() {
  const d = useLiveData()

  let live: boolean
  let activeCode: string
  let mineCount: number
  let rosterCount: number
  let pending: number
  let batchVMs: BatchVM[]
  let rows: RowVM[]

  if (d.live && d.me) {
    live = true
    const mine = d.batches.filter((b) => b.trainer_id === d.me!.id)
    const active = mine.find((b) => b.status === 'active') ?? mine[0] ?? null
    const rosterEnroll = active ? d.enrollments.filter((e) => e.batch_id === active.id) : []
    rows = rosterEnroll.map((e) => {
      const u = d.profiles.find((p) => p.id === e.learner_id)
      const name = u ? `${u.first_name} ${u.last_name}` : '—'
      return {
        key: e.id,
        name,
        init: nameInitials(name),
        attendance: active ? attPct(d.attendance, e.learner_id, active.id) : 0,
        avgGrade: active ? avgGradeLive(d.grades, e.learner_id, active.id) : null,
      }
    })
    mineCount = mine.length
    rosterCount = rows.length
    pending = rows.filter((r) => r.avgGrade === null || r.avgGrade < 60).length
    activeCode = active?.batch_code ?? '—'
    batchVMs = mine.map((b) => {
      const c = d.courses.find((x) => x.id === b.course_id)
      return {
        key: b.id,
        code: b.batch_code,
        status: b.status,
        title: c?.title ?? '—',
        att: b.status === 'active' ? batchAttPct(d.attendance, b.id) : 0,
        startDate: b.start_date,
        endDate: b.end_date,
        startTime: (b.start_time ?? '').slice(0, 5),
        endTime: (b.end_time ?? '').slice(0, 5),
      }
    })
  } else {
    live = false
    const mine = batches.filter((b) => b.trainerId === TRAINER_ID)
    const active = mine.find((b) => b.status === 'active') ?? mine[0]
    rows = learnersInBatch(active.id).map((r) => ({
      key: r.id,
      name: fullName(r.user),
      init: initials(r.user),
      attendance: attendancePct(r.learnerId, active.id),
      avgGrade: averageGrade(r.learnerId, active.id),
    }))
    mineCount = mine.length
    rosterCount = rows.length
    pending = rows.filter((r) => r.avgGrade === null || r.avgGrade < 60).length
    activeCode = active.batchCode
    batchVMs = mine.map((b) => ({
      key: b.id,
      code: b.batchCode,
      status: b.status,
      title: getCourse(b.courseId).title,
      att: b.status === 'active' ? batchAttendancePct(b.id) : 0,
      startDate: b.startDate,
      endDate: b.endDate,
      startTime: b.startTime,
      endTime: b.endTime,
    }))
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={<ClipboardList size={18} />} value={mineCount} label="My Batches" />
        <Stat icon={<Users size={18} />} value={rosterCount} label="Active Learners" />
        <Stat icon={<CalendarCheck size={18} />} value={pending} label="Pending to Grade" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
        {/* my batches */}
        <Card className="p-5">
          <SectionTitle
            right={
              live ? (
                <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-ok-600">
                  <span className="h-2 w-2 rounded-full bg-ok-600" /> Live
                </span>
              ) : undefined
            }
          >
            My Batches
          </SectionTitle>
          {batchVMs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line2 bg-soft p-8 text-center">
              <p className="text-[13px] font-semibold text-ink-600">No batches assigned to you yet.</p>
              <p className="mt-1 text-[12px] text-ink-400">
                An admin assigns you as trainer when creating a batch.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {batchVMs.map((b) => (
                <div key={b.key} className="rounded-xl border border-line bg-soft p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[13.5px] font-bold">{b.code}</span>
                    <Badge tone={b.status === 'active' ? 'ok' : 'muted'}>{b.status.toUpperCase()}</Badge>
                  </div>
                  <div className="mt-1 text-[12px] text-ink-500">{b.title}</div>
                  <div className="mt-2.5 flex items-center gap-3">
                    <ProgressBar value={b.att} />
                    <span className="flex-none text-[11.5px] font-bold text-ink-500">
                      {b.status === 'active' ? `${b.att}%` : '—'}
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] text-ink-400">
                    {b.startDate} → {b.endDate} · {b.startTime}–{b.endTime}
                  </div>
                </div>
              ))}
            </div>
          )}
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
            Pending Action Items · {activeCode}
          </SectionTitle>

          {rows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line2 bg-soft p-8 text-center">
              <p className="text-[13px] font-semibold text-ink-600">No learners in your active batch yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[460px]">
                <thead>
                  <tr>
                    <Th className="w-full">Learner</Th>
                    <Th className="text-center">Attendance</Th>
                    <Th className="text-center">Avg Grade</Th>
                    <Th className="text-center">Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const needs = r.avgGrade === null || r.avgGrade < 60
                    return (
                      <tr key={r.key} className="hover:bg-soft">
                        <Td>
                          <div className="flex items-center gap-2.5">
                            <Avatar text={r.init} size={28} />
                            <span className="font-semibold">{r.name}</span>
                          </div>
                        </Td>
                        <Td className="text-center">
                          <Badge tone={r.attendance >= 80 ? 'ok' : r.attendance >= 60 ? 'warn' : 'bad'}>
                            {r.attendance}%
                          </Badge>
                        </Td>
                        <Td className="text-center font-bold">{r.avgGrade ?? '—'}</Td>
                        <Td className="text-center">
                          <Badge tone={needs ? 'warn' : 'ok'}>{needs ? 'Grade' : 'Done'}</Badge>
                        </Td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
