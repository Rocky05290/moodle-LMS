import { useState } from 'react'
import { FileText, ShieldCheck, Sheet, CalendarDays } from 'lucide-react'
import { useLiveData, attPct, avgGradeLive, hasSupabase } from '../lib/live'
import {
  batches as mockBatches, getCourse, getUser, learnersInBatch, attendancePct, averageGrade, fullName,
} from '../data/mock'
import {
  downloadAttendanceRegister, downloadComplianceReport, downloadCSV,
} from '../lib/reports'
import { Badge, Button, Card, SectionTitle, Td, Th } from '../components/ui'
import Loading from '../components/Loading'

type RowVM = {
  key: string | number
  name: string
  cpr: string
  company: string
  present: number
  late: number
  absent: number
  pct: number
  avg: number | null
  hours: number
  eligible: boolean
}
type BatchLite = {
  id: number
  code: string
  title: string
  trainer: string
  dateRange: string
  hours: number
}

const LATE = ['L1', 'L2', 'L3']

export default function Reports() {
  const d = useLiveData()
  const [batchId, setBatchId] = useState<number | null>(null)

  if (hasSupabase && d.loading) return <Loading label="Loading report data…" />

  const batchList: BatchLite[] = hasSupabase
    ? d.batches.map((b) => {
        const t = d.profiles.find((p) => p.id === b.trainer_id)
        return {
          id: b.id,
          code: b.batch_code,
          title: d.courses.find((c) => c.id === b.course_id)?.title ?? '—',
          trainer: t ? `${t.first_name} ${t.last_name}` : 'Unassigned',
          dateRange: `${b.start_date} → ${b.end_date}`,
          hours: b.total_hours,
        }
      })
    : mockBatches.map((b) => ({
        id: b.id,
        code: b.batchCode,
        title: getCourse(b.courseId).title,
        trainer: fullName(getUser(b.trainerId)),
        dateRange: `${b.startDate} → ${b.endDate}`,
        hours: b.totalHours,
      }))

  const curId = batchId ?? batchList[0]?.id ?? null
  const cur = batchList.find((b) => b.id === curId) ?? null

  let rows: RowVM[] = []
  let sessions = 0
  if (cur) {
    if (hasSupabase) {
      const att = d.attendance.filter((a) => a.batch_id === cur.id)
      sessions = new Set(att.map((a) => a.session_date)).size
      rows = d.enrollments
        .filter((e) => e.batch_id === cur.id)
        .map((e) => {
          const u = d.profiles.find((p) => p.id === e.learner_id)
          const name = u ? `${u.first_name} ${u.last_name}` : '—'
          const mine = att.filter((a) => a.learner_id === e.learner_id)
          const present = mine.filter((a) => a.code === 'P').length
          const late = mine.filter((a) => LATE.includes(a.code)).length
          const absent = mine.filter((a) => a.code === 'A').length
          const pct = attPct(d.attendance, e.learner_id, cur.id)
          const avg = avgGradeLive(d.grades, e.learner_id, cur.id)
          return {
            key: e.id,
            name,
            cpr: u?.cpr ?? '',
            company: u?.company ?? '',
            present,
            late,
            absent,
            pct,
            avg,
            hours: Math.round((pct / 100) * cur.hours),
            eligible: pct >= 75 && (avg ?? 0) >= 60,
          }
        })
    } else {
      sessions = 5
      rows = learnersInBatch(cur.id).map((r) => {
        const pct = attendancePct(r.learnerId, cur.id)
        const avg = averageGrade(r.learnerId, cur.id)
        const present = Math.round((pct / 100) * sessions)
        return {
          key: r.id,
          name: fullName(r.user),
          cpr: r.user.cpr ?? '',
          company: r.user.company ?? '',
          present,
          late: Math.max(0, sessions - present - (pct < 50 ? 1 : 0)),
          absent: pct < 50 ? 1 : 0,
          pct,
          avg,
          hours: Math.round((pct / 100) * cur.hours),
          eligible: pct >= 75 && (avg ?? 0) >= 60,
        }
      })
    }
  }

  const eligibleCount = rows.filter((r) => r.eligible).length
  const avgAttendance = rows.length ? Math.round(rows.reduce((s, r) => s + r.pct, 0) / rows.length) : 0

  const genRegister = () => {
    if (!cur) return
    downloadAttendanceRegister(
      { batchCode: cur.code, courseTitle: cur.title, dateRange: cur.dateRange, trainer: cur.trainer, totalHours: cur.hours, sessions },
      rows.map((r) => ({ name: r.name, cpr: r.cpr, present: r.present, late: r.late, absent: r.absent, pct: r.pct, hours: r.hours })),
    )
  }
  const genCompliance = () => {
    if (!cur) return
    downloadComplianceReport(
      {
        batchCode: cur.code,
        courseTitle: cur.title,
        dateRange: cur.dateRange,
        totalHours: cur.hours,
        avgAttendance,
        eligibleCount,
        learnerCount: rows.length,
      },
      rows.map((r) => ({ name: r.name, cpr: r.cpr, company: r.company, pct: r.pct, avg: r.avg, hours: r.hours, eligible: r.eligible })),
    )
  }
  const genCSV = () => {
    if (!cur) return
    downloadCSV(
      `${cur.code}_report.csv`,
      ['Learner', 'CPR', 'Company', 'Present', 'Late', 'Absent', 'Attendance %', 'Avg Grade', 'Hours', 'Certificate'],
      rows.map((r) => [r.name, r.cpr, r.company, r.present, r.late, r.absent, r.pct, r.avg ?? '', r.hours, r.eligible ? 'Eligible' : 'Pending']),
    )
  }

  const disabled = rows.length === 0

  return (
    <div className="space-y-5">
      {/* toolbar */}
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-500">
            <CalendarDays size={18} />
          </div>
          <div className="leading-tight">
            <select
              value={curId ?? ''}
              onChange={(e) => setBatchId(Number(e.target.value))}
              className="cursor-pointer rounded-md border border-line bg-surface px-2 py-1 text-[13.5px] font-bold outline-none"
            >
              {batchList.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.code}
                </option>
              ))}
            </select>
            <div className="mt-0.5 text-[11.5px] text-ink-500">
              {cur?.title} · {cur?.dateRange}
            </div>
          </div>
        </div>
        {hasSupabase && (
          <span className="ml-auto flex items-center gap-1.5 text-[11.5px] font-semibold text-ok-600">
            <span className="h-2 w-2 rounded-full bg-ok-600" /> Live
          </span>
        )}
      </Card>

      {/* export cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: <FileText size={20} />, title: 'Attendance Register', desc: 'Signed daily register — present / late / absent, hours and signature column.', action: genRegister, cta: 'Generate PDF' },
          { icon: <ShieldCheck size={20} />, title: 'Compliance Report', desc: 'Full Tamkeen bundle — CPR, sponsor, attendance, grades and certificate status.', action: genCompliance, cta: 'Generate PDF' },
          { icon: <Sheet size={20} />, title: 'Spreadsheet (CSV)', desc: 'Raw data for Excel / Tamkeen upload — every learner, every metric.', action: genCSV, cta: 'Export CSV' },
        ].map((c) => (
          <Card key={c.title} className="flex flex-col p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-500 text-white shadow-md shadow-indigo-500/25">
              {c.icon}
            </div>
            <h3 className="mt-4 text-[15px] font-extrabold text-navy-900">{c.title}</h3>
            <p className="mt-1 flex-1 text-[12px] leading-relaxed text-ink-500">{c.desc}</p>
            <Button onClick={c.action} className="mt-4 w-full justify-center" >
              {disabled ? 'No data yet' : c.cta}
            </Button>
          </Card>
        ))}
      </div>

      {/* preview */}
      <Card className="p-5">
        <SectionTitle
          right={
            <div className="flex items-center gap-2">
              <Badge tone="ok">{eligibleCount} eligible</Badge>
              <Badge tone="muted">{rows.length} learners</Badge>
            </div>
          }
        >
          Report preview · {cur?.code}
        </SectionTitle>
        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line2 bg-soft p-8 text-center">
            <p className="text-[13px] font-semibold text-ink-600">No learners enrolled in this batch yet.</p>
            <p className="mt-1 text-[12px] text-ink-400">Enrol learners and record attendance & grades to build a report.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr>
                  <Th className="w-full">Learner</Th>
                  <Th>CPR</Th>
                  <Th className="text-center">Present</Th>
                  <Th className="text-center">Late</Th>
                  <Th className="text-center">Absent</Th>
                  <Th className="text-center">Attendance</Th>
                  <Th className="text-center">Avg</Th>
                  <Th className="text-center">Hours</Th>
                  <Th className="text-center">Certificate</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.key} className="hover:bg-soft">
                    <Td className="font-semibold text-navy-900">{r.name}</Td>
                    <Td className="font-mono text-[12px] text-ink-500">{r.cpr || '—'}</Td>
                    <Td className="text-center font-bold text-ok-600">{r.present}</Td>
                    <Td className="text-center font-bold text-warn-600">{r.late}</Td>
                    <Td className="text-center font-bold text-bad-600">{r.absent}</Td>
                    <Td className="text-center">
                      <Badge tone={r.pct >= 75 ? 'ok' : 'bad'}>{r.pct}%</Badge>
                    </Td>
                    <Td className="text-center font-bold text-navy-900">{r.avg ?? '—'}</Td>
                    <Td className="text-center text-ink-700">{r.hours}</Td>
                    <Td className="text-center">
                      <Badge tone={r.eligible ? 'ok' : 'muted'}>{r.eligible ? 'ELIGIBLE' : 'PENDING'}</Badge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
