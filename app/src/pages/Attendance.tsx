import { useEffect, useState } from 'react'
import { QrCode, Save, Download, CalendarDays, UserPlus, X } from 'lucide-react'
import type { AttendanceCode } from '../data/mock'
import { ATTENDANCE_META } from '../data/mock'
import { supabase, hasSupabase } from '../lib/supabase'
import { downloadCSV } from '../lib/reports'
import { Avatar, Badge, Button, Card, SectionTitle, Td, Th } from '../components/ui'

const CODES: AttendanceCode[] = ['P', 'L1', 'L2', 'L3', 'A']

const codeStyle: Record<AttendanceCode, string> = {
  P: 'bg-ok-600 text-white border-ok-600',
  L1: 'bg-warn-600 text-white border-warn-600',
  L2: 'bg-warn-600 text-white border-warn-600',
  L3: 'bg-warn-600 text-white border-warn-600',
  A: 'bg-bad-600 text-white border-bad-600',
}

type BatchLite = {
  id: number
  batch_code: string
  title: string
  start_date: string
  end_date: string
  start_time: string | null
  end_time: string | null
}
type RosterRow = { enrollmentId: number; learnerId: string; name: string; cpr: string; company: string }

const nameInit = (name: string) =>
  name.split(' ').filter(Boolean).map((s) => s[0]).slice(0, 2).join('').toUpperCase()

export default function Attendance() {
  const [batchList, setBatchList] = useState<BatchLite[]>([])
  const [batchId, setBatchId] = useState<number | null>(null)
  const [date, setDate] = useState('')
  const [roster, setRoster] = useState<RosterRow[]>([])
  const [marks, setMarks] = useState<Record<string, AttendanceCode>>({})
  const [remarks, setRemarks] = useState<Record<string, string>>({})
  const [live, setLive] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const [showEnrol, setShowEnrol] = useState(false)
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState('')

  // 1) load batches once
  useEffect(() => {
    if (!supabase) return
    supabase
      .from('batches')
      .select('id,batch_code,start_date,end_date,start_time,end_time,course:courses(title)')
      .order('start_date')
      .then(({ data, error }) => {
        if (error || !data || !data.length) return
        const list: BatchLite[] = data.map((b: Record<string, unknown>) => ({
          id: b.id as number,
          batch_code: b.batch_code as string,
          title: ((b.course as { title?: string } | null)?.title as string) ?? '',
          start_date: b.start_date as string,
          end_date: b.end_date as string,
          start_time: (b.start_time as string) ?? null,
          end_time: (b.end_time as string) ?? null,
        }))
        setBatchList(list)
        setBatchId(list[0].id)
        setDate(list[0].start_date)
        setLive(true)
      })
  }, [])

  const batch = batchList.find((b) => b.id === batchId) ?? null

  // 2) load roster when batch changes
  const loadRoster = () => {
    if (!supabase || !batchId) return
    supabase
      .from('enrollments')
      .select('id, learner:profiles!learner_id(id,first_name,last_name,cpr,company)')
      .eq('batch_id', batchId)
      .then(({ data }) => {
        const r: RosterRow[] = (data ?? [])
          .map((e: Record<string, unknown>) => {
            const l = e.learner as Record<string, unknown> | null
            return {
              enrollmentId: e.id as number,
              learnerId: (l?.id as string) ?? '',
              name: `${(l?.first_name as string) ?? ''} ${(l?.last_name as string) ?? ''}`.trim(),
              cpr: (l?.cpr as string) ?? '',
              company: (l?.company as string) ?? '',
            }
          })
          .filter((x) => x.learnerId)
        setRoster(r)
      })
  }
  useEffect(loadRoster, [batchId])

  // 3) load existing marks when batch or date changes
  const loadMarks = () => {
    if (!supabase || !batchId || !date) return
    supabase
      .from('attendance')
      .select('learner_id,code,remarks')
      .eq('batch_id', batchId)
      .eq('session_date', date)
      .then(({ data }) => {
        const m: Record<string, AttendanceCode> = {}
        const rm: Record<string, string> = {}
        ;(data ?? []).forEach((a: Record<string, unknown>) => {
          m[a.learner_id as string] = a.code as AttendanceCode
          if (a.remarks) rm[a.learner_id as string] = a.remarks as string
        })
        setMarks(m)
        setRemarks(rm)
      })
  }
  useEffect(loadMarks, [batchId, date])

  const setMark = (learnerId: string, code: AttendanceCode) => {
    setSaved('')
    setMarks((m) => ({ ...m, [learnerId]: code }))
  }

  const counts = CODES.reduce<Record<string, number>>((acc, c) => {
    acc[c] = roster.filter((r) => marks[r.learnerId] === c).length
    return acc
  }, {})

  const save = async () => {
    if (!supabase || !batchId || !date) return
    const rows = roster
      .filter((r) => marks[r.learnerId])
      .map((r) => ({
        learner_id: r.learnerId,
        batch_id: batchId,
        session_date: date,
        code: marks[r.learnerId],
        remarks: remarks[r.learnerId] || null,
      }))
    if (!rows.length) {
      setSaved('Mark at least one learner before saving.')
      return
    }
    setBusy(true)
    const { data: auth } = await supabase.auth.getUser()
    const withMarker = rows.map((r) => ({ ...r, marked_by: auth.user?.id ?? null }))
    const { error } = await supabase
      .from('attendance')
      .upsert(withMarker, { onConflict: 'learner_id,batch_id,session_date' })
    setBusy(false)
    setSaved(error ? 'Save failed: ' + error.message : `✓ Saved ${rows.length} marks for ${date}.`)
    if (!error) loadMarks()
  }

  const exportCSV = () => {
    if (!roster.length) return
    downloadCSV(
      `${batch?.batch_code ?? 'attendance'}_${date}.csv`,
      ['Learner', 'CPR', 'Company', 'Attendance', 'Remarks'],
      roster.map((r) => [r.name, r.cpr || '', r.company || '', marks[r.learnerId] ?? '', remarks[r.learnerId] ?? '']),
    )
  }

  if (hasSupabase && !live && !batchList.length) {
    return (
      <Card className="p-8 text-center text-[13px] text-ink-500">
        Connecting to your database… if this stays, create a batch first on the <b>Batches</b> page.
      </Card>
    )
  }

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
              value={batchId ?? ''}
              onChange={(e) => {
                const id = Number(e.target.value)
                setBatchId(id)
                const b = batchList.find((x) => x.id === id)
                if (b) setDate(b.start_date)
                setSaved('')
              }}
              className="cursor-pointer rounded-md border border-line bg-surface px-2 py-1 text-[13.5px] font-bold text-ink-900 outline-none"
            >
              {batchList.map((b) => (
                <option key={b.id} value={b.id} className="bg-surface text-ink-900">
                  {b.batch_code}
                </option>
              ))}
            </select>
            <div className="mt-0.5 text-[11.5px] text-ink-500">
              {batch?.title} · {batch?.start_time?.slice(0, 5)}–{batch?.end_time?.slice(0, 5)}
            </div>
          </div>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2.5">
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value)
              setSaved('')
            }}
            className="cursor-pointer rounded-md border border-line bg-surface px-3 py-2.5 text-[13px] font-semibold outline-none"
          />
          <Button variant="ghost" onClick={() => setShowEnrol(true)} className="flex items-center gap-2">
            <UserPlus size={15} /> Enrol learners
          </Button>
          <Button variant="gold" onClick={() => setShowQr((v) => !v)} className="flex items-center gap-2">
            <QrCode size={15} /> QR Check-in
          </Button>
          <Button variant="ghost" onClick={exportCSV} className="flex items-center gap-2">
            <Download size={15} /> Export
          </Button>
          <Button onClick={save} className="flex items-center gap-2">
            <Save size={15} /> {busy ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </Card>

      {saved && (
        <div
          className={`rounded-lg border px-4 py-2.5 text-[12.5px] font-semibold ${
            saved.startsWith('✓')
              ? 'border-ok-600/20 bg-ok-50 text-ok-600'
              : 'border-warn-600/20 bg-warn-50 text-warn-600'
          }`}
        >
          {saved}
        </div>
      )}

      {/* QR panel */}
      {showQr && (
        <Card className="flex flex-col items-center gap-3 p-7">
          <SectionTitle>Scan to check in</SectionTitle>
          <div className="rounded-lg bg-white p-4 ring-1 ring-line">
            <div
              className="h-40 w-40"
              style={{
                backgroundImage: 'repeating-conic-gradient(#0f1b35 0% 25%, #fff 0% 50%)',
                backgroundSize: '13px 13px',
              }}
            />
          </div>
          <p className="text-[12.5px] text-ink-500">
            Code rotates every <span className="font-bold text-gold-600">15 seconds</span> · learners scan and mark
            themselves
          </p>
        </Card>
      )}

      {/* summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {CODES.map((c) => (
          <Card key={c} className="p-3.5 text-center">
            <div className="text-[22px] leading-none font-extrabold text-navy-900">{counts[c] ?? 0}</div>
            <div className="mt-1.5 text-[10.5px] font-bold tracking-wide text-ink-400 uppercase">
              {ATTENDANCE_META[c].label}
            </div>
          </Card>
        ))}
      </div>

      {/* register */}
      <Card className="p-5">
        <SectionTitle
          right={
            <div className="flex items-center gap-2">
              {hasSupabase && (
                <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-ok-600">
                  <span className="h-2 w-2 rounded-full bg-ok-600" /> Live
                </span>
              )}
              <Badge tone="muted">{roster.length} learners</Badge>
            </div>
          }
        >
          Attendance register
        </SectionTitle>

        {roster.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line2 bg-soft p-8 text-center">
            <p className="text-[13px] font-semibold text-ink-600">No learners enrolled in this batch yet.</p>
            <p className="mt-1 text-[12px] text-ink-400">
              Click <b>Enrol learners</b> above to add them, then mark attendance.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px]">
              <thead>
                <tr>
                  <Th className="w-full">Learner</Th>
                  <Th>CPR</Th>
                  <Th className="text-center">Mark</Th>
                  <Th>Remarks</Th>
                </tr>
              </thead>
              <tbody>
                {roster.map((r) => {
                  const current = marks[r.learnerId]
                  return (
                    <tr key={r.enrollmentId} className="hover:bg-soft">
                      <Td>
                        <div className="flex items-center gap-2.5">
                          <Avatar text={nameInit(r.name)} size={30} />
                          <div className="leading-tight">
                            <div className="font-semibold text-navy-900">{r.name}</div>
                            <div className="text-[11px] text-ink-400">{r.company || '—'}</div>
                          </div>
                        </div>
                      </Td>
                      <Td className="font-mono text-[12px] text-ink-500">{r.cpr || '—'}</Td>
                      <Td>
                        <div className="flex justify-center gap-1.5">
                          {CODES.map((c) => (
                            <button
                              key={c}
                              onClick={() => setMark(r.learnerId, c)}
                              title={ATTENDANCE_META[c].label}
                              className={`h-8 w-9 cursor-pointer rounded-md border text-[11.5px] font-extrabold transition-all active:scale-95 ${
                                current === c ? codeStyle[c] : 'border-line bg-soft text-ink-400 hover:bg-soft2'
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </Td>
                      <Td>
                        <input
                          value={remarks[r.learnerId] ?? ''}
                          onChange={(e) => setRemarks((rm) => ({ ...rm, [r.learnerId]: e.target.value }))}
                          placeholder="—"
                          className="w-full rounded-md border border-line bg-soft px-2.5 py-1.5 text-[12px] outline-none focus:border-brand-500"
                        />
                      </Td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-[11.5px] text-ink-400">
          Points: P = 2 · L1 = 1.5 · L2 = 1 · L3 = 0.5 · A = 0 — used for the Tamkeen attendance percentage.
        </p>
      </Card>

      {showEnrol && batchId && (
        <EnrolModal
          batchId={batchId}
          enrolledIds={roster.map((r) => r.learnerId)}
          onClose={() => setShowEnrol(false)}
          onDone={() => {
            setShowEnrol(false)
            loadRoster()
          }}
        />
      )}
    </div>
  )
}

/* --------------------------- Enrol modal -------------------------- */
function EnrolModal({
  batchId,
  enrolledIds,
  onClose,
  onDone,
}: {
  batchId: number
  enrolledIds: string[]
  onClose: () => void
  onDone: () => void
}) {
  const [learners, setLearners] = useState<{ id: string; name: string; company: string }[]>([])
  const [sel, setSel] = useState<Record<string, boolean>>({})
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!supabase) return
    supabase
      .from('profiles')
      .select('id,first_name,last_name,company')
      .eq('role', 'learner')
      .then(({ data }) =>
        setLearners(
          (data ?? []).map((p: Record<string, unknown>) => ({
            id: p.id as string,
            name: `${(p.first_name as string) ?? ''} ${(p.last_name as string) ?? ''}`.trim(),
            company: (p.company as string) ?? '',
          })),
        ),
      )
  }, [])

  const available = learners.filter((l) => !enrolledIds.includes(l.id))

  const save = async () => {
    const ids = Object.keys(sel).filter((k) => sel[k])
    if (!ids.length || !supabase) {
      onClose()
      return
    }
    setBusy(true)
    const { error } = await supabase.from('enrollments').insert(ids.map((id) => ({ learner_id: id, batch_id: batchId })))
    setBusy(false)
    if (error) {
      setErr(error.message)
      return
    }
    onDone()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-line bg-surface p-6 shadow-2xl shadow-black/50">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[16px] font-extrabold text-navy-900">Enrol learners</h3>
          <button onClick={onClose} className="cursor-pointer text-ink-400 transition-colors hover:text-navy-900">
            <X size={18} />
          </button>
        </div>

        {available.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line2 bg-soft p-6 text-center text-[12.5px] text-ink-500">
            Every learner is already enrolled. Add more people on the <b>People</b> page.
          </p>
        ) : (
          <div className="space-y-1.5">
            {available.map((l) => (
              <label
                key={l.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-line bg-soft px-3 py-2.5 transition-colors hover:border-brand-500/40"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-brand-500"
                  checked={!!sel[l.id]}
                  onChange={(e) => setSel((s) => ({ ...s, [l.id]: e.target.checked }))}
                />
                <div className="leading-tight">
                  <div className="text-[13px] font-semibold text-navy-900">{l.name}</div>
                  <div className="text-[11px] text-ink-400">{l.company || '—'}</div>
                </div>
              </label>
            ))}
          </div>
        )}

        {err && (
          <p className="mt-3 rounded-md border border-bad-600/20 bg-bad-50 px-3 py-2 text-[12px] font-semibold text-bad-600">
            {err}
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <Button onClick={save} className="flex-1">
            {busy ? 'Enrolling…' : 'Enrol selected'}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
