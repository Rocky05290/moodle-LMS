import { Plus, Upload, Mail, Phone } from 'lucide-react'
import {
  batches, courses, users, enrollments, getCourse, getUser,
  batchAttendancePct, fullName, initials,
} from '../data/mock'
import { Avatar, Badge, Button, Card, ProgressBar, SectionTitle, Td, Th } from '../components/ui'

/* ----------------------------- Batches ---------------------------- */
export function Batches() {
  return (
    <Card className="p-5">
      <SectionTitle
        right={
          <Button className="flex items-center gap-1.5 !px-3 !py-2 !text-[12px]">
            <Plus size={13} /> Create batch
          </Button>
        }
      >
        All batches
      </SectionTitle>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr>
              <Th>Batch code</Th>
              <Th>Course</Th>
              <Th>Trainer</Th>
              <Th>Schedule</Th>
              <Th className="text-center">Learners</Th>
              <Th className="text-center">Attendance</Th>
              <Th className="text-center">Status</Th>
            </tr>
          </thead>
          <tbody>
            {batches.map((b) => {
              const c = getCourse(b.courseId)
              const t = getUser(b.trainerId)
              const n = enrollments.filter((e) => e.batchId === b.id).length
              return (
                <tr key={b.id} className="hover:bg-soft">
                  <Td className="font-bold">{b.batchCode}</Td>
                  <Td className="text-ink-700">{c.title}</Td>
                  <Td className="text-ink-500">{fullName(t)}</Td>
                  <Td className="text-[12px] text-ink-500">
                    {b.startDate} → {b.endDate}
                    <div className="text-ink-400">
                      {b.startTime}–{b.endTime} · {b.totalHours}h
                    </div>
                  </Td>
                  <Td className="text-center">{n}</Td>
                  <Td className="text-center">
                    {b.status === 'active' ? (
                      <Badge tone="ok">{batchAttendancePct(b.id)}%</Badge>
                    ) : (
                      <span className="text-ink-400">—</span>
                    )}
                  </Td>
                  <Td className="text-center">
                    <Badge tone={b.status === 'active' ? 'ok' : 'muted'}>
                      {b.status.toUpperCase()}
                    </Badge>
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

/* ----------------------------- Courses ---------------------------- */
export function Courses() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {courses.map((c) => (
          <Card key={c.id} hover className="p-5">
            <div className="flex items-start justify-between gap-2">
              <Badge tone="brand">{c.code}</Badge>
              <span className="text-[11.5px] font-bold text-ink-400">{c.totalHours}h</span>
            </div>
            <h3 className="mt-3 text-[15px] leading-snug font-extrabold">{c.title}</h3>
            <p className="mt-1 text-[11.5px] text-ink-400">{c.category}</p>

            <div className="mt-4 space-y-2">
              {c.modules.map((m) => (
                <div key={m.num} className="flex gap-2.5 rounded-lg border border-line bg-soft p-2.5">
                  <span className="text-[11px] font-extrabold text-brand-500">{m.num}</span>
                  <div className="min-w-0">
                    <div className="truncate text-[12px] font-bold">{m.title}</div>
                    <div className="line-clamp-2 text-[11px] text-ink-400">{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------ People ---------------------------- */
export function People() {
  return (
    <Card className="p-5">
      <SectionTitle
        right={
          <div className="flex gap-2">
            <Button variant="ghost" className="flex items-center gap-1.5 !px-3 !py-2 !text-[12px]">
              <Upload size={13} /> Bulk CSV import
            </Button>
            <Button className="flex items-center gap-1.5 !px-3 !py-2 !text-[12px]">
              <Plus size={13} /> Add person
            </Button>
          </div>
        }
      >
        Directory
      </SectionTitle>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px]">
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>CPR</Th>
              <Th>Contact</Th>
              <Th>Company</Th>
              <Th className="text-center">Role</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-soft">
                <Td>
                  <div className="flex items-center gap-2.5">
                    <Avatar text={initials(u)} size={30} />
                    <span className="font-semibold">{fullName(u)}</span>
                  </div>
                </Td>
                <Td className="font-mono text-[12px] text-ink-500">{u.cpr}</Td>
                <Td className="text-[12px] text-ink-500">
                  <div className="flex items-center gap-1.5">
                    <Mail size={11} /> {u.email}
                  </div>
                  <div className="flex items-center gap-1.5 text-ink-400">
                    <Phone size={11} /> {u.mobile}
                  </div>
                </Td>
                <Td className="text-ink-500">{u.company ?? '—'}</Td>
                <Td className="text-center">
                  <Badge
                    tone={
                      u.role === 'admin' ? 'brand'
                      : u.role === 'trainer' ? 'ok'
                      : u.role === 'auditor' ? 'gold'
                      : 'muted'
                    }
                  >
                    {u.role.toUpperCase()}
                  </Badge>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

/* ---------------------------- Grading ----------------------------- */
export function Grading() {
  const batch = batches.find((b) => b.status === 'active')!
  const roster = enrollments.filter((e) => e.batchId === batch.id)
  const criteria = ['Threats identified', 'Mitigations described', 'Clarity & detail']

  return (
    <Card className="p-5">
      <SectionTitle right={<Badge tone="brand">{batch.batchCode}</Badge>}>
        Rubric grading — Practical Task
      </SectionTitle>
      <div className="space-y-3">
        {roster.map((e) => {
          const u = getUser(e.learnerId)
          return (
            <div key={e.id} className="rounded-xl border border-line bg-soft p-4">
              <div className="flex items-center gap-2.5">
                <Avatar text={initials(u)} size={30} />
                <span className="text-[13.5px] font-bold">{fullName(u)}</span>
                <Badge tone="warn">Awaiting grade</Badge>
              </div>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
                {criteria.map((c) => (
                  <div key={c} className="rounded-lg border border-line bg-soft p-3">
                    <div className="mb-2 text-[11.5px] font-bold text-ink-700">{c}</div>
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((p) => (
                        <button
                          key={p}
                          className="h-7 flex-1 cursor-pointer rounded-md border border-line2 bg-soft text-[11px] font-bold text-ink-500 hover:border-brand-500 hover:bg-brand-50 hover:text-white"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Button className="!px-3 !py-2 !text-[12px]">Save grade</Button>
                <Button variant="ghost" className="!px-3 !py-2 !text-[12px]">
                  Return for redo
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

/* --------------------------- MyCourse ----------------------------- */
export function MyCourse() {
  const c = getCourse(1)
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <SectionTitle right={<Badge tone="brand">{c.code}</Badge>}>{c.title}</SectionTitle>
        <ProgressBar value={65} />
        <p className="mt-2 text-[12px] text-ink-400">65% complete · {c.totalHours} hours total</p>
      </Card>
      <div className="grid gap-3 md:grid-cols-2">
        {c.modules.map((m) => (
          <Card key={m.num} hover className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-[11.5px] font-extrabold text-brand-500">MODULE {m.num}</span>
            </div>
            <h3 className="mt-1.5 text-[14px] font-bold">{m.title}</h3>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-500">{m.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}

