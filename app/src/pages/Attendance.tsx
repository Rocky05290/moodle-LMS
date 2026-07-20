import { useState } from 'react'
import { QrCode, Save, Download, CalendarDays } from 'lucide-react'
import type { AttendanceCode } from '../data/mock'
import {
  ATTENDANCE_META, attendanceDb, batches, getCourse, learnersInBatch,
  sessionDates, fullName, initials,
} from '../data/mock'
import { Avatar, Badge, Button, Card, SectionTitle, Td, Th } from '../components/ui'

const CODES: AttendanceCode[] = ['P', 'L1', 'L2', 'L3', 'A']

const codeStyle: Record<AttendanceCode, string> = {
  P: 'bg-ok-600 text-white border-ok-600',
  L1: 'bg-warn-600 text-white border-warn-600',
  L2: 'bg-warn-600 text-white border-warn-600',
  L3: 'bg-warn-600 text-white border-warn-600',
  A: 'bg-bad-600 text-white border-bad-600',
}

export default function Attendance() {
  const batch = batches.find((b) => b.status === 'active')!
  const course = getCourse(batch.courseId)
  const roster = learnersInBatch(batch.id)

  const [date, setDate] = useState(sessionDates[0])
  const [marks, setMarks] = useState<Record<string, AttendanceCode>>({ ...attendanceDb })
  const [showQr, setShowQr] = useState(false)

  const keyFor = (learnerId: number) => `${learnerId}_${batch.id}_${date}`
  const setMark = (learnerId: number, code: AttendanceCode) =>
    setMarks((m) => ({ ...m, [keyFor(learnerId)]: code }))

  const counts = CODES.reduce<Record<string, number>>((acc, c) => {
    acc[c] = roster.filter((r) => marks[keyFor(r.learnerId)] === c).length
    return acc
  }, {})

  return (
    <div className="space-y-5">
      {/* toolbar */}
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
            <CalendarDays size={18} />
          </div>
          <div className="leading-tight">
            <div className="text-[13.5px] font-bold">{batch.batchCode}</div>
            <div className="text-[11.5px] text-ink-400">
              {course.title} · {batch.startTime}–{batch.endTime}
            </div>
          </div>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2.5">
          <select
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="cursor-pointer rounded-xl border border-line bg-surface px-3 py-2.5 text-[13px] font-semibold outline-none"
          >
            {sessionDates.map((d) => (
              <option key={d} value={d}>
                {new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })}
              </option>
            ))}
          </select>
          <Button variant="gold" onClick={() => setShowQr((v) => !v)} className="flex items-center gap-2">
            <QrCode size={15} /> QR Check-in
          </Button>
          <Button variant="ghost" className="flex items-center gap-2">
            <Download size={15} /> Export
          </Button>
          <Button className="flex items-center gap-2">
            <Save size={15} /> Save
          </Button>
        </div>
      </Card>

      {/* QR panel */}
      {showQr && (
        <Card className="flex flex-col items-center gap-3 p-7">
          <SectionTitle>Scan to check in</SectionTitle>
          <div className="rounded-2xl bg-white p-4">
            <div
              className="h-40 w-40"
              style={{
                backgroundImage:
                  'repeating-conic-gradient(#000 0% 25%, #fff 0% 50%)',
                backgroundSize: '13px 13px',
              }}
            />
          </div>
          <p className="text-[12.5px] text-ink-500">
            Code rotates every <span className="font-bold text-gold-600">15 seconds</span> · learners
            scan and mark themselves
          </p>
        </Card>
      )}

      {/* summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {CODES.map((c) => (
          <Card key={c} className="p-3.5 text-center">
            <div className="text-[22px] leading-none font-extrabold">{counts[c] ?? 0}</div>
            <div className="mt-1.5 text-[10.5px] font-bold tracking-wide text-ink-400 uppercase">
              {ATTENDANCE_META[c].label}
            </div>
          </Card>
        ))}
      </div>

      {/* grid */}
      <Card className="p-5">
        <SectionTitle right={<Badge tone="muted">{roster.length} learners</Badge>}>
          Attendance register
        </SectionTitle>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px]">
            <thead>
              <tr>
                <Th>Learner</Th>
                <Th>CPR</Th>
                <Th className="text-center">Mark</Th>
                <Th>Remarks</Th>
              </tr>
            </thead>
            <tbody>
              {roster.map((r) => {
                const current = marks[keyFor(r.learnerId)]
                return (
                  <tr key={r.id} className="hover:bg-soft">
                    <Td>
                      <div className="flex items-center gap-2.5">
                        <Avatar text={initials(r.user)} size={30} />
                        <div className="leading-tight">
                          <div className="font-semibold">{fullName(r.user)}</div>
                          <div className="text-[11px] text-ink-400">{r.user.company}</div>
                        </div>
                      </div>
                    </Td>
                    <Td className="font-mono text-[12px] text-ink-500">{r.user.cpr}</Td>
                    <Td>
                      <div className="flex justify-center gap-1.5">
                        {CODES.map((c) => (
                          <button
                            key={c}
                            onClick={() => setMark(r.learnerId, c)}
                            title={ATTENDANCE_META[c].label}
                            className={`h-8 w-9 cursor-pointer rounded-lg border text-[11.5px] font-extrabold active:scale-95 ${
                              current === c
                                ? codeStyle[c]
                                : 'border-line2 bg-soft text-ink-400 hover:bg-soft2'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </Td>
                    <Td>
                      <input
                        placeholder="—"
                        className="w-full rounded-lg border border-line bg-soft px-2.5 py-1.5 text-[12px] outline-none focus:border-brand-500"
                      />
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-[11.5px] text-ink-400">
          Points: P = 2 · L1 = 1.5 · L2 = 1 · L3 = 0.5 · A = 0 — used for the Tamkeen attendance
          percentage.
        </p>
      </Card>
    </div>
  )
}

