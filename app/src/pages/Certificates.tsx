import { useState } from 'react'
import { Award, Download } from 'lucide-react'
import {
  batches as mockBatches, getCourse, learnersInBatch, attendancePct, averageGrade,
  fullName, initials,
} from '../data/mock'
import { useLiveData, attPct, avgGradeLive, nameInitials, hasSupabase } from '../lib/live'
import { downloadCertificate } from '../lib/certificate'
import { Avatar, Badge, Card, SectionTitle, Td, Th } from '../components/ui'
import Loading from '../components/Loading'

type RowVM = {
  key: string | number
  name: string
  init: string
  cpr: string
  att: number
  avg: number | null
  eligible: boolean
}
type BatchLite = { id: number; code: string; title: string; end: string; hours: number }

export default function Certificates() {
  const d = useLiveData()
  const [batchId, setBatchId] = useState<number | null>(null)

  if (hasSupabase && d.loading) return <Loading label="Loading certificates…" />

  const batchList: BatchLite[] = hasSupabase
    ? d.batches.map((b) => ({
        id: b.id,
        code: b.batch_code,
        title: d.courses.find((c) => c.id === b.course_id)?.title ?? '—',
        end: b.end_date,
        hours: b.total_hours,
      }))
    : mockBatches.map((b) => ({
        id: b.id,
        code: b.batchCode,
        title: getCourse(b.courseId).title,
        end: b.endDate,
        hours: b.totalHours,
      }))

  const curId = batchId ?? batchList[0]?.id ?? null
  const cur = batchList.find((b) => b.id === curId) ?? null

  let rows: RowVM[] = []
  if (cur) {
    if (hasSupabase) {
      rows = d.enrollments
        .filter((e) => e.batch_id === cur.id)
        .map((e) => {
          const u = d.profiles.find((p) => p.id === e.learner_id)
          const name = u ? `${u.first_name} ${u.last_name}` : '—'
          const att = attPct(d.attendance, e.learner_id, cur.id)
          const avg = avgGradeLive(d.grades, e.learner_id, cur.id)
          return { key: e.id, name, init: nameInitials(name), cpr: u?.cpr ?? '', att, avg, eligible: att >= 75 && (avg ?? 0) >= 60 }
        })
    } else {
      rows = learnersInBatch(cur.id).map((r) => {
        const att = attendancePct(r.learnerId, cur.id)
        const avg = averageGrade(r.learnerId, cur.id)
        return {
          key: r.id,
          name: fullName(r.user),
          init: initials(r.user),
          cpr: r.user.cpr ?? '',
          att,
          avg,
          eligible: att >= 75 && (avg ?? 0) >= 60,
        }
      })
    }
  }

  const eligibleCount = rows.filter((r) => r.eligible).length

  const issue = (r: RowVM) => {
    if (!cur) return
    downloadCertificate({
      learnerName: r.name,
      courseTitle: cur.title,
      batchCode: cur.code,
      hours: cur.hours,
      date: cur.end,
      cpr: r.cpr || undefined,
    })
  }

  return (
    <div className="space-y-5">
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-500">
            <Award size={18} />
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
            <div className="mt-0.5 text-[11.5px] text-ink-500">{cur?.title}</div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2.5">
          {hasSupabase && (
            <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-ok-600">
              <span className="h-2 w-2 rounded-full bg-ok-600" /> Live
            </span>
          )}
          <Badge tone="ok">{eligibleCount} eligible</Badge>
        </div>
      </Card>

      <Card className="p-5">
        <SectionTitle right={<Badge tone="muted">{rows.length} learners</Badge>}>
          Certificate eligibility
        </SectionTitle>

        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line2 bg-soft p-8 text-center">
            <p className="text-[13px] font-semibold text-ink-600">No learners enrolled in this batch yet.</p>
            <p className="mt-1 text-[12px] text-ink-400">Enrol learners and record attendance & grades first.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px]">
              <thead>
                <tr>
                  <Th className="w-full">Learner</Th>
                  <Th className="text-center">Attendance</Th>
                  <Th className="text-center">Avg Grade</Th>
                  <Th className="text-center">Status</Th>
                  <Th className="text-right">Certificate</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.key} className="hover:bg-soft">
                    <Td>
                      <div className="flex items-center gap-2.5">
                        <Avatar text={r.init} size={28} />
                        <span className="font-semibold text-navy-900">{r.name}</span>
                      </div>
                    </Td>
                    <Td className="text-center">
                      <Badge tone={r.att >= 75 ? 'ok' : 'bad'}>{r.att}%</Badge>
                    </Td>
                    <Td className="text-center font-bold text-navy-900">{r.avg ?? '—'}</Td>
                    <Td className="text-center">
                      <Badge tone={r.eligible ? 'ok' : 'muted'}>{r.eligible ? 'ELIGIBLE' : 'PENDING'}</Badge>
                    </Td>
                    <Td className="text-right">
                      {r.eligible ? (
                        <button
                          onClick={() => issue(r)}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-gradient-to-r from-brand-500 to-indigo-500 px-3 py-1.5 text-[11.5px] font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <Download size={13} /> PDF
                        </button>
                      ) : (
                        <span className="text-[11.5px] text-ink-400">—</span>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-[11.5px] text-ink-400">
          A learner qualifies for a certificate at <b>≥ 75% attendance</b> and <b>≥ 60% average grade</b>. Certificates
          download as print-ready PDF.
        </p>
      </Card>
    </div>
  )
}
