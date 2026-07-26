import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, FileDown, Search, Lock, FileCheck2 } from 'lucide-react'
import {
  batches, getCourse, learnersInBatch, attendancePct, averageGrade,
  batchAttendancePct, fullName, initials,
} from '../data/mock'
import { useLiveData, attPct, batchAttPct, avgGradeLive, nameInitials, hasSupabase } from '../lib/live'
import { supabase } from '../lib/supabase'
import { Avatar, Badge, Button, Card, IconTile, SectionTitle, Stat, Td, Th } from '../components/ui'
import Loading from '../components/Loading'

const SAMPLE_LOG = [
  { t: '2026-08-06 14:22', who: 'Eng. Sayed Al-Alawi', what: 'Changed grade for Jasem Al-Saffar', detail: 'Mid: 55 → 61', reason: 'Re-mark after redo submission' },
  { t: '2026-08-06 09:05', who: 'Eng. Sayed Al-Alawi', what: 'Attendance submitted', detail: 'CTC-CCNA-2601 · 06 Aug', reason: 'Daily register' },
  { t: '2026-08-05 16:40', who: 'Ankit Srivastav', what: 'Enrolled learner', detail: 'Ali Al-Mansoori → CTC-CCNA-2601', reason: 'Batch intake' },
  { t: '2026-08-02 08:58', who: 'Ankit Srivastav', what: 'Created batch', detail: 'CTC-CCNA-2601', reason: 'Tamkeen cycle 2601' },
]

type AudRow = {
  key: string | number
  name: string
  init: string
  cpr: string
  company: string
  att: number
  avg: number | null
  eligible: boolean
}
type LogRow = { t: string; who: string; what: string; detail: string; reason: string }

export default function AuditorDashboard() {
  const d = useLiveData()
  const navigate = useNavigate()
  const [log, setLog] = useState<LogRow[] | null>(null)

  // live audit trail (falls back to the sample if the log is empty)
  useEffect(() => {
    if (!supabase) return
    supabase
      .from('audit_log')
      .select('created_at,action,detail,reason,actor:profiles!actor_id(first_name,last_name)')
      .order('created_at', { ascending: false })
      .limit(12)
      .then(({ data }) => {
        if (!data || !data.length) return
        setLog(
          data.map((r: Record<string, unknown>) => {
            const a = r.actor as { first_name?: string; last_name?: string } | null
            return {
              t: String(r.created_at).replace('T', ' ').slice(0, 16),
              who: a ? `${a.first_name ?? ''} ${a.last_name ?? ''}`.trim() : 'System',
              what: (r.action as string) ?? '',
              detail: (r.detail as string) ?? '',
              reason: (r.reason as string) ?? '',
            }
          }),
        )
      })
  }, [])

  if (hasSupabase && d.loading) return <Loading label="Loading compliance data…" />

  let live: boolean
  let batchCode: string
  let courseTitle: string
  let contractedHours: number
  let batchAtt: number
  let rows: AudRow[]

  if (hasSupabase) {
    live = true
    const batch = d.batches.find((b) => b.status === 'active') ?? d.batches[0] ?? null
    const course = batch ? d.courses.find((c) => c.id === batch.course_id) : undefined
    const rosterEnroll = batch ? d.enrollments.filter((e) => e.batch_id === batch.id) : []
    rows = rosterEnroll.map((e) => {
      const u = d.profiles.find((p) => p.id === e.learner_id)
      const name = u ? `${u.first_name} ${u.last_name}` : '—'
      const att = batch ? attPct(d.attendance, e.learner_id, batch.id) : 0
      const avg = batch ? avgGradeLive(d.grades, e.learner_id, batch.id) : null
      return {
        key: e.id,
        name,
        init: nameInitials(name),
        cpr: u?.cpr ?? '—',
        company: u?.company ?? '—',
        att,
        avg,
        eligible: att >= 75 && (avg ?? 0) >= 60,
      }
    })
    batchCode = batch?.batch_code ?? '—'
    courseTitle = course?.title ?? '—'
    contractedHours = batch?.total_hours ?? 0
    batchAtt = batch ? batchAttPct(d.attendance, batch.id) : 0
  } else {
    live = false
    const batch = batches.find((b) => b.status === 'active')!
    const course = getCourse(batch.courseId)
    rows = learnersInBatch(batch.id).map((r) => {
      const att = attendancePct(r.learnerId, batch.id)
      const avg = averageGrade(r.learnerId, batch.id)
      return {
        key: r.id,
        name: fullName(r.user),
        init: initials(r.user),
        cpr: r.user.cpr ?? '—',
        company: r.user.company ?? '—',
        att,
        avg,
        eligible: att >= 75 && (avg ?? 0) >= 60,
      }
    })
    batchCode = batch.batchCode
    courseTitle = course.title
    contractedHours = batch.totalHours
    batchAtt = batchAttendancePct(batch.id)
  }

  const trail: LogRow[] = log ?? SAMPLE_LOG

  return (
    <div className="space-y-6">
      {/* read-only banner */}
      <Card className="flex flex-wrap items-center gap-3 border-gold-500/25 bg-gold-100 p-4">
        <IconTile icon={<Lock size={17} />} tone="amber" size={40} />
        <div className="min-w-0">
          <div className="text-[13.5px] font-bold">Read-only compliance access</div>
          <div className="text-[12px] text-ink-500">
            You can view and export records. Editing is disabled at the database level.
          </div>
        </div>
        <Button variant="gold" onClick={() => navigate('/reports')} className="ml-auto flex items-center gap-2">
          <FileDown size={15} /> Compliance Report Bundle
        </Button>
      </Card>

      {/* search */}
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <div className="flex flex-1 items-center gap-2.5 rounded-xl border border-line bg-soft px-3.5 py-2.5">
          <Search size={15} className="text-ink-400" />
          <input
            placeholder="Search by batch code (CTC-CCNA-2601) or learner name…"
            className="w-full bg-transparent text-[13px] outline-none placeholder:text-ink-400"
          />
        </div>
        {live && (
          <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-ok-600">
            <span className="h-2 w-2 rounded-full bg-ok-600" /> Live
          </span>
        )}
        <Badge tone="brand">{batchCode}</Badge>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={<ShieldCheck size={18} />} value={rows.length} label="Records in Batch" tone="navy" />
        <Stat icon={<FileCheck2 size={18} />} value={`${batchAtt}%`} label="Batch Attendance" tone="emerald" />
        <Stat icon={<FileDown size={18} />} value={contractedHours} label="Contracted Hours" tone="amber" />
      </div>

      {/* verification table */}
      <Card className="p-5">
        <SectionTitle right={<Badge tone="muted">{courseTitle}</Badge>}>Learner verification</SectionTitle>
        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line2 bg-soft p-8 text-center">
            <p className="text-[13px] font-semibold text-ink-600">No learners enrolled in this batch yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr>
                  <Th className="w-full">Learner</Th>
                  <Th>CPR</Th>
                  <Th className="text-center">Attendance</Th>
                  <Th className="text-center">Avg Grade</Th>
                  <Th className="text-center">Certificate</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.key} className="hover:bg-soft">
                    <Td>
                      <div className="flex items-center gap-2.5">
                        <Avatar text={r.init} size={28} />
                        <div className="leading-tight">
                          <div className="font-semibold">{r.name}</div>
                          <div className="text-[11px] text-ink-400">{r.company}</div>
                        </div>
                      </div>
                    </Td>
                    <Td className="font-mono text-[12px] text-ink-500">{r.cpr}</Td>
                    <Td className="text-center">
                      <Badge tone={r.att >= 75 ? 'ok' : 'bad'}>{r.att}%</Badge>
                    </Td>
                    <Td className="text-center font-bold">{r.avg ?? '—'}</Td>
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

      {/* audit trail */}
      <Card className="p-5">
        <SectionTitle right={<Badge tone="gold">TIMESTAMPED</Badge>}>Audit trail</SectionTitle>
        <div className="space-y-2.5">
          {trail.map((l, i) => (
            <div key={i} className="flex flex-wrap items-start gap-3 rounded-xl border border-line bg-soft p-3.5">
              <span className="font-mono text-[11.5px] text-ink-400">{l.t}</span>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-bold">{l.what}</div>
                <div className="text-[12px] text-ink-500">
                  {l.detail} · <span className="text-ink-400">by {l.who}</span>
                </div>
                {l.reason && <div className="mt-0.5 text-[11.5px] text-ink-400 italic">Reason: {l.reason}</div>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
