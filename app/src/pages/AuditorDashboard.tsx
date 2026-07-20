import { ShieldCheck, FileDown, Search, Lock, FileCheck2 } from 'lucide-react'
import {
  batches, getCourse, learnersInBatch, attendancePct, averageGrade,
  batchAttendancePct, fullName, initials,
} from '../data/mock'
import { Avatar, Badge, Button, Card, SectionTitle, Stat, Td, Th } from '../components/ui'

const AUDIT_LOG = [
  { t: '2026-08-06 14:22', who: 'Eng. Sayed Al-Alawi', what: 'Changed grade for Jasem Al-Saffar', detail: 'Mid: 55 → 61', reason: 'Re-mark after redo submission' },
  { t: '2026-08-06 09:05', who: 'Eng. Sayed Al-Alawi', what: 'Attendance submitted', detail: 'CTC-CCNA-2601 · 06 Aug', reason: 'Daily register' },
  { t: '2026-08-05 16:40', who: 'Ankit Srivastav', what: 'Enrolled learner', detail: 'Ali Al-Mansoori → CTC-CCNA-2601', reason: 'Batch intake' },
  { t: '2026-08-02 08:58', who: 'Ankit Srivastav', what: 'Created batch', detail: 'CTC-CCNA-2601', reason: 'Tamkeen cycle 2601' },
]

export default function AuditorDashboard() {
  const batch = batches.find((b) => b.status === 'active')!
  const course = getCourse(batch.courseId)
  const roster = learnersInBatch(batch.id)

  return (
    <div className="space-y-6">
      {/* read-only banner */}
      <Card className="flex flex-wrap items-center gap-3 border-gold-500/25 bg-gold-100 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-100 text-gold-600">
          <Lock size={17} />
        </div>
        <div className="min-w-0">
          <div className="text-[13.5px] font-bold">Read-only compliance access</div>
          <div className="text-[12px] text-ink-500">
            You can view and export records. Editing is disabled at the database level.
          </div>
        </div>
        <Button variant="gold" className="ml-auto flex items-center gap-2">
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
        <Badge tone="brand">{batch.batchCode}</Badge>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={<ShieldCheck size={18} />} value={roster.length} label="Records in Batch" />
        <Stat icon={<FileCheck2 size={18} />} value={`${batchAttendancePct(batch.id)}%`} label="Batch Attendance" />
        <Stat icon={<FileDown size={18} />} value={batch.totalHours} label="Contracted Hours" />
      </div>

      {/* verification table */}
      <Card className="p-5">
        <SectionTitle right={<Badge tone="muted">{course.title}</Badge>}>
          Learner verification
        </SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr>
                <Th>Learner</Th>
                <Th>CPR</Th>
                <Th className="text-center">Attendance</Th>
                <Th className="text-center">Avg Grade</Th>
                <Th className="text-center">Certificate</Th>
              </tr>
            </thead>
            <tbody>
              {roster.map((r) => {
                const att = attendancePct(r.learnerId, batch.id)
                const avg = averageGrade(r.learnerId, batch.id)
                const eligible = att >= 75 && (avg ?? 0) >= 60
                return (
                  <tr key={r.id} className="hover:bg-soft">
                    <Td>
                      <div className="flex items-center gap-2.5">
                        <Avatar text={initials(r.user)} size={28} />
                        <div className="leading-tight">
                          <div className="font-semibold">{fullName(r.user)}</div>
                          <div className="text-[11px] text-ink-400">{r.user.company}</div>
                        </div>
                      </div>
                    </Td>
                    <Td className="font-mono text-[12px] text-ink-500">{r.user.cpr}</Td>
                    <Td className="text-center">
                      <Badge tone={att >= 75 ? 'ok' : 'bad'}>{att}%</Badge>
                    </Td>
                    <Td className="text-center font-bold">{avg ?? '—'}</Td>
                    <Td className="text-center">
                      <Badge tone={eligible ? 'ok' : 'muted'}>
                        {eligible ? 'ELIGIBLE' : 'PENDING'}
                      </Badge>
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* audit trail */}
      <Card className="p-5">
        <SectionTitle right={<Badge tone="gold">TIMESTAMPED</Badge>}>Audit trail</SectionTitle>
        <div className="space-y-2.5">
          {AUDIT_LOG.map((l, i) => (
            <div
              key={i}
              className="flex flex-wrap items-start gap-3 rounded-xl border border-line bg-soft p-3.5"
            >
              <span className="font-mono text-[11.5px] text-ink-400">{l.t}</span>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-bold">{l.what}</div>
                <div className="text-[12px] text-ink-500">
                  {l.detail} · <span className="text-ink-400">by {l.who}</span>
                </div>
                <div className="mt-0.5 text-[11.5px] text-ink-400 italic">Reason: {l.reason}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

