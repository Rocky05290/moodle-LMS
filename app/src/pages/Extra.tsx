import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Upload, Mail, Phone, X, Trash2, Pencil, Network, ShieldCheck, Cloud, BookOpen, ChevronDown, FileText, Search } from 'lucide-react'
import {
  batches, courses as mockCourses, users, enrollments, getCourse, getUser,
  batchAttendancePct,
} from '../data/mock'
import type { Course, Role } from '../data/mock'
import { supabase, hasSupabase, createAccount } from '../lib/supabase'
import { useLiveData } from '../lib/live'
import type { CourseModule } from '../lib/live'
import Loading from '../components/Loading'
import { Avatar, Badge, Button, Card, ProgressBar, SectionTitle, Td, Th } from '../components/ui'

/* ------------------------ shared little bits ---------------------- */
const fieldCls =
  'w-full rounded-lg border border-line bg-soft px-3 py-2 text-[13px] font-medium text-navy-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15'
const labelCls = 'mb-1 block text-[11px] font-bold tracking-wide text-ink-500 uppercase'

function LiveTag({ live }: { live: boolean }) {
  if (!hasSupabase) return null
  return (
    <div className="mb-4 flex items-center gap-2 text-[12px] font-semibold">
      <span className={`h-2 w-2 rounded-full ${live ? 'bg-ok-600' : 'bg-warn-600'}`} />
      <span className={live ? 'text-ok-600' : 'text-warn-600'}>
        {live ? 'Live — loaded from your Supabase database' : 'Connecting to database…'}
      </span>
    </div>
  )
}

function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-line bg-white p-6 shadow-2xl ${
          wide ? 'max-w-2xl' : 'max-w-md'
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[16px] font-extrabold text-navy-900">{title}</h3>
          <button onClick={onClose} className="cursor-pointer text-ink-400 transition-colors hover:text-navy-900">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ----------------------------- Batches ---------------------------- */
type BatchRow = {
  id: number
  batch_code: string
  start_date: string
  end_date: string
  start_time: string | null
  end_time: string | null
  total_hours: number
  status: string
  trainer_id: string | null
  attendancePct: number | null
  course: { title: string; code: string } | null
  trainer: { first_name: string; last_name: string } | null
  learners: number
}

export function Batches() {
  const [rows, setRows] = useState<BatchRow[] | null>(null)
  const [live, setLive] = useState(false)
  const [courses, setCourses] = useState<{ id: number; code: string; title: string; total_hours: number }[]>([])
  const [trainers, setTrainers] = useState<{ id: string; first_name: string; last_name: string }[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<BatchRow | null>(null)
  const [sp] = useSearchParams()

  const load = () => {
    if (!supabase) return
    supabase
      .from('batches')
      .select('*, course:courses(title,code), trainer:profiles!trainer_id(first_name,last_name), enrollments(count)')
      .order('start_date')
      .then(({ data, error }) => {
        if (error || !data) {
          if (error) console.warn('batches load:', error.message)
          return
        }
        setRows(
          data.map((b: Record<string, unknown>) => ({
            id: b.id as number,
            batch_code: b.batch_code as string,
            start_date: b.start_date as string,
            end_date: b.end_date as string,
            start_time: (b.start_time as string) ?? null,
            end_time: (b.end_time as string) ?? null,
            total_hours: b.total_hours as number,
            status: b.status as string,
            trainer_id: (b.trainer_id as string) ?? null,
            attendancePct: null,
            course: (b.course as BatchRow['course']) ?? null,
            trainer: (b.trainer as BatchRow['trainer']) ?? null,
            learners: (b.enrollments as { count: number }[] | null)?.[0]?.count ?? 0,
          })),
        )
        setLive(true)
      })
    supabase.from('courses').select('id,code,title,total_hours').order('code').then(({ data }) => data && setCourses(data as never))
    supabase
      .from('profiles')
      .select('id,first_name,last_name')
      .eq('role', 'trainer')
      .then(({ data }) => data && setTrainers(data as never))
  }
  useEffect(load, [])
  useEffect(() => {
    if (sp.get('new')) setOpen(true)
  }, [])

  const removeBatch = async (id: number, code: string) => {
    if (!supabase) return
    if (!window.confirm(`Delete batch ${code}?\n\nThis also removes its enrolments, attendance and grades.`)) return
    const { error } = await supabase.from('batches').delete().eq('id', id)
    if (error) {
      window.alert('Could not delete: ' + error.message)
      return
    }
    load()
  }

  const display: BatchRow[] =
    rows ??
    (hasSupabase
      ? []
      : batches.map((b) => {
          const c = getCourse(b.courseId)
          const t = getUser(b.trainerId)
          return {
            id: b.id,
            batch_code: b.batchCode,
            start_date: b.startDate,
            end_date: b.endDate,
            start_time: b.startTime,
            end_time: b.endTime,
            total_hours: b.totalHours,
            status: b.status,
            trainer_id: String(b.trainerId),
            attendancePct: b.status === 'active' ? batchAttendancePct(b.id) : null,
            course: { title: c.title, code: c.code },
            trainer: { first_name: t.firstName, last_name: t.lastName },
            learners: enrollments.filter((e) => e.batchId === b.id).length,
          }
        }))

  return (
    <>
      <Card className="p-5">
        <SectionTitle
          right={
            <Button onClick={() => setOpen(true)} className="flex items-center gap-1.5 !px-3 !py-2 !text-[12px]">
              <Plus size={13} /> Create batch
            </Button>
          }
        >
          All batches
        </SectionTitle>
        <LiveTag live={live} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr>
                <Th>Batch code</Th>
                <Th className="w-full">Course</Th>
                <Th>Trainer</Th>
                <Th>Schedule</Th>
                <Th className="text-center">Learners</Th>
                <Th className="text-center">Attendance</Th>
                <Th className="text-center">Status</Th>
                <Th className="text-right">{''}</Th>
              </tr>
            </thead>
            <tbody>
              {display.map((b) => (
                <tr key={b.id} className="hover:bg-soft">
                  <Td className="font-bold whitespace-nowrap">{b.batch_code}</Td>
                  <Td className="text-ink-700">{b.course?.title ?? '—'}</Td>
                  <Td className="text-ink-500">
                    {b.trainer ? `${b.trainer.first_name} ${b.trainer.last_name}` : '—'}
                  </Td>
                  <Td className="whitespace-nowrap text-[12px] text-ink-500">
                    {b.start_date} → {b.end_date}
                    <div className="text-ink-400">
                      {b.start_time?.slice(0, 5)}–{b.end_time?.slice(0, 5)} · {b.total_hours}h
                    </div>
                  </Td>
                  <Td className="text-center">{b.learners}</Td>
                  <Td className="text-center">
                    {b.attendancePct != null ? (
                      <Badge tone="ok">{b.attendancePct}%</Badge>
                    ) : (
                      <span className="text-ink-400">—</span>
                    )}
                  </Td>
                  <Td className="text-center">
                    <Badge tone={b.status === 'active' ? 'ok' : b.status === 'completed' ? 'muted' : 'brand'}>
                      {b.status.toUpperCase()}
                    </Badge>
                  </Td>
                  <Td className="text-right pr-2">
                    {live && (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditing(b)}
                          title="Edit / assign trainer"
                          className="cursor-pointer rounded-md p-1.5 text-ink-400 transition-colors hover:bg-brand-50 hover:text-brand-600"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => removeBatch(b.id, b.batch_code)}
                          title="Delete batch"
                          className="cursor-pointer rounded-md p-1.5 text-ink-400 transition-colors hover:bg-bad-50 hover:text-bad-600"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {open && (
        <CreateBatch
          courses={courses.length ? courses : mockCourses.map((c) => ({ id: c.id, code: c.code, title: c.title, total_hours: c.totalHours }))}
          trainers={trainers}
          onClose={() => setOpen(false)}
          onDone={() => {
            setOpen(false)
            load()
          }}
        />
      )}

      {editing && (
        <EditBatch
          batch={editing}
          trainers={trainers}
          onClose={() => setEditing(null)}
          onDone={() => {
            setEditing(null)
            load()
          }}
        />
      )}
    </>
  )
}

function EditBatch({
  batch,
  trainers,
  onClose,
  onDone,
}: {
  batch: BatchRow
  trainers: { id: string; first_name: string; last_name: string }[]
  onClose: () => void
  onDone: () => void
}) {
  const [trainerId, setTrainerId] = useState(batch.trainer_id ?? '')
  const [status, setStatus] = useState(batch.status)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const save = async () => {
    if (!supabase) return
    setBusy(true)
    const { error } = await supabase
      .from('batches')
      .update({ trainer_id: trainerId || null, status })
      .eq('id', batch.id)
    setBusy(false)
    if (error) {
      setErr(error.message)
      return
    }
    onDone()
  }

  return (
    <Modal title={`Edit ${batch.batch_code}`} onClose={onClose}>
      <div className="space-y-3">
        <div>
          <label className={labelCls}>Trainer</label>
          <select className={fieldCls} value={trainerId} onChange={(e) => setTrainerId(e.target.value)}>
            <option value="">— Unassigned —</option>
            {trainers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.first_name} {t.last_name}
              </option>
            ))}
          </select>
          {trainers.length === 0 && (
            <p className="mt-1 text-[11px] text-ink-400">
              No trainers yet — add a person with role "Trainer" on the People page first.
            </p>
          )}
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <select className={fieldCls} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        {err && (
          <p className="rounded-md border border-bad-600/20 bg-bad-50 px-3 py-2 text-[12px] font-semibold text-bad-600">
            {err}
          </p>
        )}
        <div className="flex gap-2 pt-1">
          <Button onClick={save} className="flex-1">
            {busy ? 'Saving…' : 'Save changes'}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function CreateBatch({
  courses,
  trainers,
  onClose,
  onDone,
}: {
  courses: { id: number; code: string; title: string; total_hours: number }[]
  trainers: { id: string; first_name: string; last_name: string }[]
  onClose: () => void
  onDone: () => void
}) {
  const thisYear = new Date().getFullYear()
  const [f, setF] = useState({
    course_id: courses[0]?.id ? String(courses[0].id) : '',
    year: String(thisYear),
    seq: '01',
    trainer_id: '',
    start_date: '',
    end_date: '',
    start_time: '10:00',
    daily_hours: '4',
    status: 'upcoming',
  })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })

  // --- derived values (auto-calculated, like the demo) ---
  const course = courses.find((c) => String(c.id) === f.course_id)
  // program short code: first token of the course code (e.g. "CCNA" from "CCNA-101")
  const progCode = (course?.code ?? 'GEN').split(/[-\s]/)[0].toUpperCase()
  // batch code = CTC-<PROG>-<YY><SEQ>  →  CTC-CCNA-2601
  const batchCode = `CTC-${progCode}-${f.year.slice(2)}${f.seq}`

  // calculated daily end time = start + daily hours
  const dailyEnd = (() => {
    if (!f.start_time) return ''
    const [h, m] = f.start_time.split(':').map(Number)
    const end = (h * 60 + m + Number(f.daily_hours) * 60) % (24 * 60)
    return `${String(Math.floor(end / 60)).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`
  })()
  const prettyTime = (t: string) => {
    if (!t) return '—'
    const [h, m] = t.split(':').map(Number)
    const ap = h >= 12 ? 'PM' : 'AM'
    const hh = h % 12 === 0 ? 12 : h % 12
    return `${hh}:${String(m).padStart(2, '0')} ${ap}`
  }

  // total contracted hours come from the selected program
  const totalHours = course?.total_hours ?? 0
  const dailyH = Number(f.daily_hours) || 1
  // number of teaching days needed = ceil(total hours / daily hours)
  const sessionsNeeded = totalHours > 0 ? Math.ceil(totalHours / dailyH) : 0

  // auto End Date: from Start Date, count forward over WORKING days only
  // (Sun–Thu). Friday & Saturday are holidays and are skipped.
  const fmtISO = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const endDate = (() => {
    if (!f.start_date || sessionsNeeded === 0) return ''
    const d = new Date(f.start_date + 'T00:00:00')
    let counted = 0
    // walk day by day; only Sun(0)–Thu(4) count as a session day
    while (true) {
      const dow = d.getDay()
      if (dow >= 0 && dow <= 4) {
        counted++
        if (counted >= sessionsNeeded) break
      }
      d.setDate(d.getDate() + 1)
      if (counted === 0 && d.getDay() > 4) continue // skip leading Fri/Sat before first session
    }
    return fmtISO(d)
  })()

  const save = async () => {
    setErr('')
    if (!f.course_id || !f.start_date) {
      setErr('Program and start date are required.')
      return
    }
    if (!endDate) {
      setErr('This program has no total hours set — add hours to the course first.')
      return
    }
    if (!supabase) return
    setBusy(true)
    const { error } = await supabase.from('batches').insert({
      batch_code: batchCode,
      course_id: Number(f.course_id),
      trainer_id: f.trainer_id || null,
      start_date: f.start_date,
      end_date: endDate,
      start_time: f.start_time || null,
      end_time: dailyEnd || null,
      total_hours: totalHours,
      status: f.status,
    })
    setBusy(false)
    if (error) {
      setErr(error.message)
      return
    }
    onDone()
  }

  const years = [thisYear, thisYear + 1, thisYear + 2].map(String)
  const seqs = Array.from({ length: 20 }, (_, i) => String(i + 1).padStart(2, '0'))

  return (
    <Modal title="Deploy Certified Training Batch" onClose={onClose} wide>
      <div className="space-y-4">
        {/* program */}
        <div>
          <label className={labelCls}>Select registered core program</label>
          <select className={fieldCls} value={f.course_id} onChange={set('course_id')}>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* year + sequence → auto batch code */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Academic target year</label>
            <select className={fieldCls} value={f.year} onChange={set('year')}>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Sequence batch no.</label>
            <select className={fieldCls} value={f.seq} onChange={set('seq')}>
              {seqs.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Resulting batch code</label>
            <div className="flex h-[38px] items-center rounded-md border border-brand-500/25 bg-brand-50 px-3 font-mono text-[13px] font-bold text-brand-600">
              {batchCode}
            </div>
          </div>
        </div>

        {/* trainer */}
        <div>
          <label className={labelCls}>Assign lead instructor</label>
          <select className={fieldCls} value={f.trainer_id} onChange={set('trainer_id')}>
            <option value="">— Unassigned —</option>
            {trainers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.first_name} {t.last_name}
              </option>
            ))}
          </select>
        </div>

        {/* dates — End Date auto-calculates from Start Date + program hours */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Start date</label>
            <input type="date" className={fieldCls} value={f.start_date} onChange={set('start_date')} />
          </div>
          <div>
            <label className={labelCls}>End date</label>
            <input type="date" className={fieldCls} value={endDate} readOnly tabIndex={-1} />
          </div>
        </div>

        {/* daily schedule config */}
        <div>
          <label className="mb-2 block text-[11px] font-bold tracking-[0.08em] text-ink-500 uppercase">
            Daily schedule hours configuration
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Daily start</label>
              <input type="time" className={fieldCls} value={f.start_time} onChange={set('start_time')} />
            </div>
            <div>
              <label className={labelCls}>Daily class hours</label>
              <select className={fieldCls} value={f.daily_hours} onChange={set('daily_hours')}>
                {[2, 3, 4, 5, 6, 8].map((h) => (
                  <option key={h} value={h}>{h} Hours per Day</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Calculated end</label>
              <div className="flex h-[38px] items-center justify-center rounded-md border border-line bg-soft2 px-3 text-[13px] font-bold text-navy-900">
                {prettyTime(dailyEnd)}
              </div>
            </div>
          </div>
          {totalHours === 0 && (
            <p className="mt-2 text-[11.5px] font-semibold text-warn-600">
              ⚠️ This program has no total hours yet — set the course hours so the end date can calculate.
            </p>
          )}
        </div>

        {/* status */}
        <div>
          <label className={labelCls}>Status</label>
          <select className={fieldCls} value={f.status} onChange={set('status')}>
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {err && (
          <p className="rounded-md border border-bad-600/20 bg-bad-50 px-3 py-2 text-[12px] font-semibold text-bad-600">
            {err}
          </p>
        )}
        <div className="flex gap-2 pt-1">
          <Button onClick={save} className="flex-1">{busy ? 'Deploying…' : 'Deploy Certified Batch'}</Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </Modal>
  )
}

/* ----------------------------- Courses ---------------------------- */
const COURSE_CAT: Record<string, { grad: string; Icon: typeof Network }> = {
  Networking: { grad: 'from-brand-500 via-brand-600 to-indigo-700', Icon: Network },
  Cybersecurity: { grad: 'from-violet-500 via-violet-600 to-fuchsia-700', Icon: ShieldCheck },
  'Cloud Systems': { grad: 'from-sky-500 via-sky-600 to-cyan-700', Icon: Cloud },
}
const courseCat = (cat?: string) => COURSE_CAT[cat ?? ''] ?? { grad: 'from-navy-700 via-navy-800 to-navy-900', Icon: BookOpen }
const courseLevel = (h: number) => (h >= 90 ? 'Advanced' : h >= 60 ? 'Intermediate' : 'Foundation')
type CourseCard = Omit<Course, 'modules'> & {
  modules: CourseModule[]
  description?: string
  level?: string
  price?: string
}

export function Courses() {
  const [list, setList] = useState<CourseCard[]>(hasSupabase ? [] : mockCourses)
  const [live, setLive] = useState(false)
  const [open, setOpen] = useState<Record<number, boolean>>({})
  const [isAdmin, setIsAdmin] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editCourse, setEditCourse] = useState<CourseCard | null>(null)
  const [detail, setDetail] = useState<CourseCard | null>(null)

  const load = () => {
    if (!supabase) return
    supabase
      .from('courses')
      .select('*')
      .order('id')
      .then(({ data, error }) => {
        if (error || !data) return
        setList(
          data.map((r) => ({
            id: r.id as number,
            code: r.code as string,
            title: r.title as string,
            category: r.category as string,
            totalHours: r.total_hours as number,
            modules: (r.modules ?? []) as CourseModule[],
            description: (r.description as string) ?? undefined,
            level: (r.level as string) ?? undefined,
            price: (r.price as string) ?? undefined,
          })),
        )
        setLive(true)
      })
  }

  useEffect(() => {
    load()
    if (!supabase) return
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user || !supabase) return
      supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle()
        .then(({ data: p }) => setIsAdmin((p?.role as string) === 'admin'))
    })
  }, [])

  const delCourse = async (c: CourseCard) => {
    if (!supabase) return
    if (!window.confirm(`Delete course "${c.title}"?\n(Only works if no batches use it.)`)) return
    const { error } = await supabase.from('courses').delete().eq('id', c.id)
    if (error) {
      window.alert('Could not delete: ' + error.message)
      return
    }
    load()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <LiveTag live={live} />
        {isAdmin && (
          <button
            onClick={() => {
              setEditCourse(null)
              setFormOpen(true)
            }}
            className="flex flex-none cursor-pointer items-center gap-1.5 rounded-md bg-gradient-to-r from-brand-500 to-indigo-500 px-3.5 py-2 text-[12.5px] font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <Plus size={14} /> New course
          </button>
        )}
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => {
          const cat = courseCat(c.category)
          const level = c.level ?? courseLevel(c.totalHours)
          const desc =
            c.description ??
            `A verified ${c.category ?? 'certification'} track covering ${c.modules
              .map((m) => m.title)
              .slice(0, 3)
              .join(', ')}${c.modules.length > 3 ? ' and more' : ''}.`
          const expanded = !!open[c.id]
          return (
            <div
              key={c.id}
              onClick={() => setDetail(c)}
              className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_10px_28px_-16px_rgba(15,27,53,0.18)] transition-all hover:-translate-y-1 hover:border-brand-500/30 hover:shadow-[0_24px_50px_-20px_rgba(15,27,53,0.28)]"
            >
              {/* banner */}
              <div className="relative h-28 overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/hero.jpg)' }} />
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.grad} opacity-80`} />
                <cat.Icon className="absolute -right-2 -bottom-3 text-white/20" size={92} strokeWidth={1.5} />
                <span className="absolute top-3.5 left-4 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white uppercase backdrop-blur-sm">
                  {c.category ?? 'Programme'}
                </span>
                <span className="absolute top-3.5 right-4 rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-extrabold text-navy-900">
                  {c.code}
                </span>
              </div>

              {/* body */}
              <div className="flex flex-1 flex-col p-5">
                <div className="text-[10.5px] font-bold tracking-wide text-ink-400 uppercase">
                  {c.totalHours} Hours · {level}
                </div>
                <h3 className="mt-1.5 text-[16px] leading-snug font-extrabold text-navy-900">{c.title}</h3>
                <p className="mt-2 flex-1 text-[12.5px] leading-relaxed text-ink-500">{desc}</p>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div className="text-[9.5px] font-bold tracking-wide text-ink-400 uppercase">Registration Price</div>
                    <div className="text-[17px] font-extrabold text-brand-600">{c.price ?? 'Enquire'}</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setOpen((o) => ({ ...o, [c.id]: !o[c.id] }))
                    }}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg border-2 border-brand-500/30 px-3.5 py-2 text-[12px] font-bold text-brand-600 transition-all hover:border-brand-500 hover:bg-brand-50"
                  >
                    {expanded ? 'Hide syllabus' : 'Details & Syllabus'}
                    <ChevronDown size={13} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {expanded && (
                  <div className="mt-4 space-y-2 border-t border-line pt-4">
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
                )}

                {isAdmin && (
                  <div className="mt-4 flex gap-3 border-t border-line pt-3 text-[11px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditCourse(c)
                        setFormOpen(true)
                      }}
                      className="flex cursor-pointer items-center gap-1 font-bold text-ink-500 transition-colors hover:text-brand-600"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        delCourse(c)
                      }}
                      className="flex cursor-pointer items-center gap-1 font-bold text-ink-500 transition-colors hover:text-bad-600"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {formOpen && (
        <CourseForm
          course={editCourse}
          onClose={() => setFormOpen(false)}
          onDone={load}
        />
      )}

      {detail && <CourseDetail course={detail} onClose={() => setDetail(null)} />}
    </div>
  )
}

function CourseDetail({ course, onClose }: { course: CourseCard; onClose: () => void }) {
  const cat = courseCat(course.category)
  const level = course.level ?? courseLevel(course.totalHours)
  const desc =
    course.description ??
    `A verified ${course.category ?? 'certification'} track covering ${course.modules
      .map((m) => m.title)
      .slice(0, 3)
      .join(', ')}${course.modules.length > 3 ? ' and more' : ''}.`
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-line bg-white shadow-2xl">
        <div className="relative h-36 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/hero.jpg)' }} />
          <div className={`absolute inset-0 bg-gradient-to-br ${cat.grad} opacity-80`} />
          <cat.Icon className="absolute -right-3 -bottom-5 text-white/20" size={128} strokeWidth={1.5} />
          <span className="absolute top-5 left-5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold tracking-wide text-white uppercase backdrop-blur-sm">
            {course.category ?? 'Programme'}
          </span>
          <span className="absolute top-5 right-14 rounded-md bg-white/90 px-2.5 py-1 text-[12px] font-extrabold text-navy-900">
            {course.code}
          </span>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-white/20 text-white transition-colors hover:bg-white/30"
          >
            <X size={17} />
          </button>
        </div>

        <div className="p-6">
          <div className="text-[11px] font-bold tracking-wide text-ink-400 uppercase">
            {course.totalHours} Hours · {level}
          </div>
          <h2 className="mt-1 text-[22px] leading-snug font-extrabold text-navy-900">{course.title}</h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-600">{desc}</p>

          <div className="mt-4 flex flex-wrap items-center gap-6">
            <div>
              <div className="text-[9.5px] font-bold tracking-wide text-ink-400 uppercase">Registration Price</div>
              <div className="text-[18px] font-extrabold text-brand-600">{course.price ?? 'Enquire'}</div>
            </div>
            <div>
              <div className="text-[9.5px] font-bold tracking-wide text-ink-400 uppercase">Modules</div>
              <div className="text-[18px] font-extrabold text-navy-900">{course.modules.length}</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-[13px] font-extrabold text-navy-900">Syllabus</div>
            <div className="mt-2 space-y-2">
              {course.modules.map((m) => (
                <div key={m.num} className="rounded-lg border border-line bg-soft p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold text-brand-500">{m.num}</span>
                    <span className="text-[13px] font-bold text-navy-900">{m.title}</span>
                    <span className="ml-auto flex items-center gap-2">
                      {m.material && <span className="text-[10.5px] font-bold text-brand-600">📎 Material</span>}
                      {m.quiz && m.quiz.length > 0 && (
                        <span className="text-[10.5px] font-bold text-gold-600">📝 {m.quiz.length} quiz</span>
                      )}
                    </span>
                  </div>
                  {m.desc && <div className="mt-1 text-[11.5px] text-ink-400">{m.desc}</div>}
                  {m.material && (
                    <a
                      href={m.material}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 inline-block text-[11.5px] font-bold text-brand-600 hover:underline"
                    >
                      Open material ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CourseForm({ course, onClose, onDone }: { course: CourseCard | null; onClose: () => void; onDone: () => void }) {
  const editing = !!course
  const [f, setF] = useState({
    code: course?.code ?? '',
    title: course?.title ?? '',
    category: course?.category ?? 'Networking',
    total_hours: String(course?.totalHours ?? 40),
    level: course?.level ?? 'Intermediate',
    price: course?.price ?? '',
    description: course?.description ?? '',
  })
  const [modules, setModules] = useState<CourseModule[]>(
    course?.modules?.length ? course.modules.map((m) => ({ ...m })) : [{ num: '01', title: '', desc: '' }],
  )
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [uploading, setUploading] = useState<number | null>(null)
  const [savedId, setSavedId] = useState<number | null>(course?.id ?? null)
  const [saved, setSaved] = useState(false)
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => {
    setSaved(false)
    setF({ ...f, [k]: e.target.value })
  }
  const patchMod = (i: number, patch: Partial<CourseModule>) =>
    setModules((ms) => ms.map((m, j) => (j === i ? { ...m, ...patch } : m)))
  const setMod = (i: number, key: 'num' | 'title' | 'desc' | 'material', val: string) => patchMod(i, { [key]: val })
  const addMod = () => setModules((ms) => [...ms, { num: String(ms.length + 1).padStart(2, '0'), title: '', desc: '' }])
  const removeMod = (i: number) => setModules((ms) => ms.filter((_, j) => j !== i))
  const addQ = (i: number) =>
    setModules((ms) =>
      ms.map((m, j) => (j === i ? { ...m, quiz: [...(m.quiz ?? []), { q: '', opts: ['', '', '', ''], correct: 0 }] } : m)),
    )
  const removeQ = (i: number, qi: number) =>
    setModules((ms) => ms.map((m, j) => (j === i ? { ...m, quiz: (m.quiz ?? []).filter((_, k) => k !== qi) } : m)))
  const setQ = (i: number, qi: number, patch: Partial<{ q: string; correct: number }>) =>
    setModules((ms) =>
      ms.map((m, j) => (j === i ? { ...m, quiz: (m.quiz ?? []).map((qq, k) => (k === qi ? { ...qq, ...patch } : qq)) } : m)),
    )
  const setOpt = (i: number, qi: number, oi: number, val: string) =>
    setModules((ms) =>
      ms.map((m, j) =>
        j === i
          ? { ...m, quiz: (m.quiz ?? []).map((qq, k) => (k === qi ? { ...qq, opts: qq.opts.map((o, p) => (p === oi ? val : o)) } : qq)) }
          : m,
      ),
    )

  const uploadMaterial = async (i: number, file: File) => {
    if (!supabase) return
    setUploading(i)
    setErr('')
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${crypto.randomUUID()}_${safe}`
    const { error: upErr } = await supabase.storage.from('materials').upload(path, file)
    if (upErr) {
      setUploading(null)
      const msg = upErr.message.toLowerCase()
      setErr(
        msg.includes('bucket') || msg.includes('not found') || msg.includes('exist')
          ? 'File storage isn\'t set up yet — run supabase_storage.sql once to create the "materials" bucket, then try again.'
          : 'Upload failed: ' + upErr.message,
      )
      return
    }
    patchMod(i, { material: supabase.storage.from('materials').getPublicUrl(path).data.publicUrl })
    setUploading(null)
  }

  const save = async () => {
    setErr('')
    setSaved(false)
    if (!f.code.trim() || !f.title.trim()) {
      setErr('Course code and title are required.')
      return
    }
    if (!supabase) return
    setBusy(true)
    const core = {
      code: f.code.trim(),
      title: f.title.trim(),
      category: f.category,
      total_hours: Number(f.total_hours) || 0,
      modules: modules.filter((m) => m.title.trim()),
    }
    const full = { ...core, level: f.level || null, price: f.price || null, description: f.description || null }

    // update if we already have an id (editing, or a new course saved once); else insert
    const run = (payload: Record<string, unknown>) =>
      savedId != null
        ? supabase!.from('courses').update(payload).eq('id', savedId).select('id').maybeSingle()
        : supabase!.from('courses').insert(payload).select('id').single()

    let { data, error } = await run(full)
    // If the price/level/description columns don't exist yet, still save the core course.
    if (error && /column|schema|description|level|price/i.test(error.message)) {
      ;({ data, error } = await run(core))
    }
    setBusy(false)
    if (error) {
      setErr(error.message)
      return
    }
    if (data && (data as { id?: number }).id != null) setSavedId((data as { id: number }).id)
    setSaved(true)
    onDone() // refresh the list behind — the modal stays open
  }

  return (
    <Modal title={editing ? `Edit ${course!.code}` : 'New course'} onClose={onClose}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Code</label>
            <input className={fieldCls} placeholder="CCNA" value={f.code} onChange={set('code')} />
          </div>
          <div>
            <label className={labelCls}>Total hours</label>
            <input type="number" className={fieldCls} value={f.total_hours} onChange={set('total_hours')} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Title</label>
          <input className={fieldCls} placeholder="CCNA — Networking Fundamentals" value={f.title} onChange={set('title')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Category</label>
            <select className={fieldCls} value={f.category} onChange={set('category')}>
              <option>Networking</option>
              <option>Cybersecurity</option>
              <option>Cloud Systems</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Level</label>
            <select className={fieldCls} value={f.level} onChange={set('level')}>
              <option>Foundation</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>Price</label>
          <input className={fieldCls} placeholder="180 BHD" value={f.price} onChange={set('price')} />
        </div>
        <div>
          <label className={labelCls}>Description</label>
          <textarea className={`${fieldCls} min-h-[64px]`} value={f.description} onChange={set('description')} />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className={labelCls}>Modules / Syllabus</label>
            <button
              onClick={addMod}
              className="flex cursor-pointer items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700"
            >
              <Plus size={12} /> Add module
            </button>
          </div>
          <div className="space-y-2.5">
            {modules.map((m, i) => (
              <div key={i} className="space-y-1.5 rounded-lg border border-line bg-soft p-2.5">
                <div className="flex gap-2">
                  <input
                    className="w-10 flex-none rounded border border-line bg-white px-1 text-center text-[12px] font-bold outline-none"
                    value={m.num}
                    onChange={(e) => setMod(i, 'num', e.target.value)}
                  />
                  <input
                    className="min-w-0 flex-1 rounded border border-line bg-white px-2 py-1 text-[12px] font-semibold outline-none"
                    placeholder="Module title"
                    value={m.title}
                    onChange={(e) => setMod(i, 'title', e.target.value)}
                  />
                  <button onClick={() => removeMod(i)} className="flex-none cursor-pointer text-ink-400 hover:text-bad-600">
                    <Trash2 size={14} />
                  </button>
                </div>
                <input
                  className="w-full rounded border border-line bg-white px-2 py-1 text-[11px] outline-none"
                  placeholder="Short description"
                  value={m.desc}
                  onChange={(e) => setMod(i, 'desc', e.target.value)}
                />
                <div className="flex gap-1.5">
                  <input
                    className="min-w-0 flex-1 rounded border border-line bg-white px-2 py-1 text-[11px] outline-none"
                    placeholder="📎 Paste a PDF / video / slides link — or upload a file →"
                    value={m.material ?? ''}
                    onChange={(e) => setMod(i, 'material', e.target.value)}
                  />
                  <label
                    className={`flex flex-none cursor-pointer items-center gap-1 rounded border border-brand-500/30 bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-600 transition-colors hover:bg-brand-100 ${
                      uploading === i ? 'pointer-events-none opacity-60' : ''
                    }`}
                  >
                    {uploading === i ? 'Uploading…' : '📤 Upload'}
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.mp4,.mov,.webm,.ppt,.pptx,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) uploadMaterial(i, file)
                        e.target.value = ''
                      }}
                    />
                  </label>
                </div>

                <div className="rounded border border-line bg-white p-1.5">
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-[10px] font-bold tracking-wide text-ink-400 uppercase">
                      Quiz · {(m.quiz ?? []).length} question{(m.quiz ?? []).length === 1 ? '' : 's'}
                    </span>
                    <button
                      onClick={() => addQ(i)}
                      className="cursor-pointer text-[10.5px] font-bold text-brand-600 hover:text-brand-700"
                    >
                      + Add question
                    </button>
                  </div>
                  {(m.quiz ?? []).map((qq, qi) => (
                    <div key={qi} className="mt-1.5 space-y-1 rounded border border-line bg-soft p-1.5">
                      <div className="flex gap-1">
                        <input
                          className="min-w-0 flex-1 rounded border border-line bg-white px-2 py-1 text-[11.5px] font-semibold outline-none"
                          placeholder={`Question ${qi + 1}`}
                          value={qq.q}
                          onChange={(e) => setQ(i, qi, { q: e.target.value })}
                        />
                        <button onClick={() => removeQ(i, qi)} className="flex-none cursor-pointer text-ink-400 hover:text-bad-600">
                          <X size={13} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {qq.opts.map((o, oi) => (
                          <label key={oi} className="flex items-center gap-1.5" title="Tick the correct answer">
                            <input
                              type="radio"
                              className="h-3 w-3 flex-none accent-ok-600"
                              checked={qq.correct === oi}
                              onChange={() => setQ(i, qi, { correct: oi })}
                            />
                            <input
                              className="min-w-0 flex-1 rounded border border-line bg-white px-1.5 py-0.5 text-[11px] outline-none"
                              placeholder={String.fromCharCode(65 + oi)}
                              value={o}
                              onChange={(e) => setOpt(i, qi, oi, e.target.value)}
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {saved && !err && (
          <p className="rounded-md border border-ok-600/20 bg-ok-50 px-3 py-2 text-[12px] font-semibold text-ok-600">
            ✓ Saved — the course list is updated. Keep editing, or close.
          </p>
        )}
        {err && (
          <p className="rounded-md border border-bad-600/20 bg-bad-50 px-3 py-2 text-[12px] font-semibold text-bad-600">
            {err}
          </p>
        )}
        <div className="flex gap-2 pt-1">
          <Button onClick={save} className="flex-1">
            {busy ? 'Saving…' : savedId != null ? 'Save changes' : 'Create course'}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {saved ? 'Close' : 'Cancel'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

/* ------------------------------ People ---------------------------- */
type Person = {
  id: string
  first_name: string
  last_name: string
  email: string
  mobile: string | null
  cpr: string | null
  company: string | null
  role: Role
}

const pName = (p: Person) => `${p.first_name} ${p.last_name}`.trim()
const pInit = (p: Person) => ((p.first_name[0] ?? '') + (p.last_name[0] ?? '')).toUpperCase()

export function People() {
  const [people, setPeople] = useState<Person[] | null>(null)
  const [live, setLive] = useState(false)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Person | null>(null)
  const [showImport, setShowImport] = useState(false)
  const [query, setQuery] = useState('')
  const [programFilter, setProgramFilter] = useState('')
  const [batchFilter, setBatchFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  // per-learner enrolment info: learner_id -> { programs:Set, batches:Set }
  const [enrolMap, setEnrolMap] = useState<Record<string, { programs: string[]; batches: string[] }>>({})
  const [programOpts, setProgramOpts] = useState<string[]>([])
  const [batchOpts, setBatchOpts] = useState<string[]>([])
  const [sp] = useSearchParams()

  const load = () => {
    if (!supabase) return
    supabase
      .from('profiles')
      .select('*')
      .order('created_at')
      .then(({ data, error }) => {
        if (error || !data) {
          if (error) console.warn('profiles load:', error.message)
          return
        }
        setPeople(data as Person[])
        setLive(true)
      })
    // load enrolments joined to batch + course, to power Program / Batch filters
    supabase
      .from('enrollments')
      .select('learner_id, batch:batches(batch_code, course:courses(code,title))')
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, { programs: string[]; batches: string[] }> = {}
        const progs = new Set<string>()
        const batches = new Set<string>()
        for (const e of data as Record<string, unknown>[]) {
          const lid = e.learner_id as string
          const b = e.batch as { batch_code?: string; course?: { code?: string; title?: string } } | null
          const code = b?.batch_code ?? ''
          const prog = b?.course ? `${b.course.code} — ${b.course.title}` : ''
          if (!map[lid]) map[lid] = { programs: [], batches: [] }
          if (prog) { map[lid].programs.push(prog); progs.add(prog) }
          if (code) { map[lid].batches.push(code); batches.add(code) }
        }
        setEnrolMap(map)
        setProgramOpts([...progs].sort())
        setBatchOpts([...batches].sort())
      })
  }
  useEffect(load, [])
  useEffect(() => {
    if (sp.get('import')) setShowImport(true)
  }, [])

  const removePerson = async (id: string, name: string) => {
    if (!supabase) return
    if (!window.confirm(`Remove ${name} from the directory?`)) return
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    if (error) {
      window.alert('Could not delete: ' + error.message)
      return
    }
    load()
  }

  const allRows: Person[] =
    people ??
    (hasSupabase
      ? []
      : users.map((u) => ({
          id: String(u.id),
          first_name: u.firstName,
          last_name: u.lastName,
          email: u.email,
          mobile: u.mobile,
          cpr: u.cpr,
          company: u.company ?? null,
          role: u.role,
        })))

  // apply search + program + batch + profile-type filters (matches the demo directory)
  const q = query.trim().toLowerCase()
  const rows = allRows.filter((u) => {
    if (typeFilter && u.role !== typeFilter) return false
    if (programFilter && !(enrolMap[u.id]?.programs ?? []).includes(programFilter)) return false
    if (batchFilter && !(enrolMap[u.id]?.batches ?? []).includes(batchFilter)) return false
    if (q) {
      const hay = `${u.first_name} ${u.last_name} ${u.email} ${u.cpr ?? ''} ${u.mobile ?? ''} ${u.role}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  return (
    <>
      <Card className="p-5">
        <SectionTitle
          right={
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowImport(true)}
                className="flex items-center gap-1.5 !px-3 !py-2 !text-[12px]"
              >
                <Upload size={13} /> Bulk CSV import
              </Button>
              <button
                onClick={() => setOpen(true)}
                className="group relative cursor-pointer overflow-hidden rounded-md border-2 border-brand-500 px-4 py-2 text-[12px] font-bold text-brand-600 transition-all hover:-translate-y-0.5 hover:text-white hover:shadow-lg hover:shadow-indigo-500/25"
              >
                <span className="absolute inset-0 translate-y-full bg-gradient-to-r from-brand-500 via-indigo-500 to-violet-500 transition-transform duration-300 group-hover:translate-y-0" />
                <span className="relative flex items-center gap-1.5">
                  <Plus size={13} /> Add person
                </span>
              </button>
            </div>
          }
        >
          Directory
        </SectionTitle>
        <LiveTag live={live} />

        {/* ---- filter toolbar (4 filters, matches the demo directory) ---- */}
        <div className="mb-4 rounded-xl border border-line bg-soft p-3.5">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-[0.1em] text-ink-500 uppercase">Profile registry filters</span>
            <span className="rounded-full border border-brand-500/20 bg-brand-50 px-2.5 py-0.5 text-[11.5px] font-bold text-brand-600">
              {rows.length} {rows.length === 1 ? 'account registered' : 'accounts registered'}
            </span>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={labelCls}>Tapered query search</label>
              <div className="flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 focus-within:border-brand-500">
                <Search size={14} className="flex-none text-ink-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name, CPR or type…"
                  className="w-full bg-transparent text-[13px] text-ink-700 outline-none placeholder:text-ink-400"
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Filter by program</label>
              <select
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
                className={`${fieldCls} cursor-pointer`}
              >
                <option value="">All Programs</option>
                {programOpts.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Filter by batch code</label>
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className={`${fieldCls} cursor-pointer`}
              >
                <option value="">All Batches</option>
                {batchOpts.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Filter by profile type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className={`${fieldCls} cursor-pointer`}
              >
                <option value="">All Types</option>
                <option value="learner">Learner</option>
                <option value="trainer">Trainer</option>
                <option value="admin">Admin</option>
                <option value="auditor">Auditor</option>
                <option value="company">Company</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr>
                <Th>Avatar</Th>
                <Th>Profile Type</Th>
                <Th className="w-full">Name</Th>
                <Th>Contact Email</Th>
                <Th>CPR / ID</Th>
                <Th>Mobile Code</Th>
                <Th className="text-right">Action</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="hover:bg-soft">
                  {/* Avatar */}
                  <Td>
                    <Avatar text={pInit(u)} size={34} />
                  </Td>
                  {/* Profile Type */}
                  <Td>
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
                  {/* Name */}
                  <Td className="font-semibold text-navy-900">{pName(u)}</Td>
                  {/* Contact Email */}
                  <Td className="text-[12px] text-ink-500">
                    <div className="flex items-center gap-1.5">
                      <Mail size={11} /> {u.email}
                    </div>
                  </Td>
                  {/* CPR / ID */}
                  <Td className="font-mono text-[12px] text-ink-500">{u.cpr || '—'}</Td>
                  {/* Mobile Code */}
                  <Td className="text-[12px] text-ink-500">
                    <div className="flex items-center gap-1.5">
                      <Phone size={11} /> {u.mobile || '—'}
                    </div>
                  </Td>
                  {/* Action */}
                  <Td className="text-right pr-2">
                    {live && (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditing(u)}
                          title="Edit info"
                          className="cursor-pointer rounded-md p-1.5 text-ink-400 transition-colors hover:bg-brand-50 hover:text-brand-600"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => removePerson(u.id, pName(u))}
                          title="Remove person"
                          className="cursor-pointer rounded-md p-1.5 text-ink-400 transition-colors hover:bg-bad-50 hover:text-bad-600"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {open && (
        <AddPerson
          onClose={() => setOpen(false)}
          onDone={() => {
            setOpen(false)
            load()
          }}
        />
      )}

      {editing && (
        <EditPerson
          person={editing}
          onClose={() => setEditing(null)}
          onDone={() => {
            setEditing(null)
            load()
          }}
        />
      )}

      {showImport && <BulkImport onClose={() => setShowImport(false)} onRefresh={load} />}
    </>
  )
}

function AddPerson({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [f, setF] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'learner' as Role,
    cpr: '',
    mobile: '',
    company: '',
    password: 'demo1234',
  })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })

  const save = async () => {
    setErr('')
    if (!f.first_name || !f.last_name || !f.email) {
      setErr('First name, last name and email are required.')
      return
    }
    setBusy(true)
    const res = await createAccount({
      email: f.email,
      password: f.password || 'demo1234',
      firstName: f.first_name,
      lastName: f.last_name,
      role: f.role,
    })
    if (!res.ok) {
      setBusy(false)
      setErr(res.error ?? 'Could not create the account.')
      return
    }
    // attach the extra profile fields the signup trigger doesn't set
    if (res.id && supabase && (f.cpr || f.mobile || f.company)) {
      await supabase
        .from('profiles')
        .update({ cpr: f.cpr || null, mobile: f.mobile || null, company: f.company || null })
        .eq('id', res.id)
    }
    setBusy(false)
    onDone()
  }

  return (
    <Modal title="Add person" onClose={onClose}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>First name</label>
            <input className={fieldCls} placeholder="e.g. Ali" value={f.first_name} onChange={set('first_name')} />
          </div>
          <div>
            <label className={labelCls}>Last name</label>
            <input className={fieldCls} placeholder="e.g. Al-Mansoori" value={f.last_name} onChange={set('last_name')} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <input type="email" className={fieldCls} placeholder="name@company.bh" value={f.email} onChange={set('email')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Role</label>
            <select className={fieldCls} value={f.role} onChange={set('role')}>
              <option value="learner">Learner</option>
              <option value="trainer">Trainer</option>
              <option value="admin">Admin</option>
              <option value="auditor">Auditor</option>
              <option value="company">Company</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Temp password</label>
            <input className={fieldCls} value={f.password} onChange={set('password')} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>CPR (national ID)</label>
            <input className={fieldCls} placeholder="e.g. 990012345" value={f.cpr} onChange={set('cpr')} />
          </div>
          <div>
            <label className={labelCls}>Mobile</label>
            <input className={fieldCls} placeholder="e.g. +973 3900 0000" value={f.mobile} onChange={set('mobile')} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Company / sponsor</label>
          <input className={fieldCls} placeholder="Batelco, Tamkeen…" value={f.company} onChange={set('company')} />
        </div>
        {err && (
          <p className="rounded-md border border-bad-600/20 bg-bad-50 px-3 py-2 text-[12px] font-semibold text-bad-600">
            {err}
          </p>
        )}
        <p className="rounded-md border border-brand-500/15 bg-brand-50 px-3 py-2 text-[11.5px] text-ink-600">
          The account is created immediately and appears in the directory. It becomes a working login once its email is
          confirmed.
        </p>
        <div className="flex gap-2 pt-1">
          <Button onClick={save} className="flex-1">{busy ? 'Creating…' : 'Add person'}</Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </Modal>
  )
}

function EditPerson({ person, onClose, onDone }: { person: Person; onClose: () => void; onDone: () => void }) {
  const [f, setF] = useState({
    first_name: person.first_name ?? '',
    last_name: person.last_name ?? '',
    role: (person.role ?? 'learner') as Role,
    cpr: person.cpr ?? '',
    mobile: person.mobile ?? '',
    company: person.company ?? '',
  })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })

  const save = async () => {
    setErr('')
    if (!f.first_name || !f.last_name) {
      setErr('First name and last name are required.')
      return
    }
    if (!supabase) return
    setBusy(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: f.first_name,
        last_name: f.last_name,
        role: f.role,
        cpr: f.cpr || null,
        mobile: f.mobile || null,
        company: f.company || null,
      })
      .eq('id', person.id)
    setBusy(false)
    if (error) {
      setErr('Could not save: ' + error.message)
      return
    }
    onDone()
  }

  return (
    <Modal title="Edit person" onClose={onClose}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>First name</label>
            <input className={fieldCls} placeholder="e.g. Ali" value={f.first_name} onChange={set('first_name')} />
          </div>
          <div>
            <label className={labelCls}>Last name</label>
            <input className={fieldCls} placeholder="e.g. Al-Mansoori" value={f.last_name} onChange={set('last_name')} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Email (login — cannot be changed here)</label>
          <input className={`${fieldCls} cursor-not-allowed bg-soft2 text-ink-400`} value={person.email} disabled />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Role</label>
            <select className={fieldCls} value={f.role} onChange={set('role')}>
              <option value="learner">Learner</option>
              <option value="trainer">Trainer</option>
              <option value="admin">Admin</option>
              <option value="auditor">Auditor</option>
              <option value="company">Company</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Mobile</label>
            <input className={fieldCls} placeholder="e.g. +973 3900 0000" value={f.mobile} onChange={set('mobile')} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>CPR (national ID)</label>
            <input className={fieldCls} placeholder="e.g. 990012345" value={f.cpr} onChange={set('cpr')} />
          </div>
          <div>
            <label className={labelCls}>Company / sponsor</label>
            <input className={fieldCls} placeholder="Batelco, Tamkeen…" value={f.company} onChange={set('company')} />
          </div>
        </div>
        {err && (
          <p className="rounded-md border border-bad-600/20 bg-bad-50 px-3 py-2 text-[12px] font-semibold text-bad-600">
            {err}
          </p>
        )}
        <div className="flex gap-2 pt-1">
          <Button onClick={save} className="flex-1">{busy ? 'Saving…' : 'Save changes'}</Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </Modal>
  )
}

/* -------- CSV parsing + bulk import -------- */
function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = []
  let cur: string[] = []
  let field = ''
  let q = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (q) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else q = false
      } else field += ch
    } else if (ch === '"') {
      q = true
    } else if (ch === ',') {
      cur.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      cur.push(field)
      field = ''
      if (cur.some((c) => c.trim() !== '')) rows.push(cur)
      cur = []
    } else field += ch
  }
  if (field !== '' || cur.length) {
    cur.push(field)
    if (cur.some((c) => c.trim() !== '')) rows.push(cur)
  }
  if (rows.length < 2) return []
  const headers = rows[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'))
  return rows.slice(1).map((r) => {
    const o: Record<string, string> = {}
    headers.forEach((h, i) => (o[h] = (r[i] ?? '').trim()))
    return o
  })
}

function BulkImport({ onClose, onRefresh }: { onClose: () => void; onRefresh: () => void }) {
  const [rows, setRows] = useState<Record<string, string>[]>([])
  const [fileName, setFileName] = useState('')
  const [busy, setBusy] = useState(false)
  const [doneN, setDoneN] = useState(0)
  const [result, setResult] = useState<{ ok: number; fail: number; errors: string[] } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const roles = ['learner', 'trainer', 'admin', 'auditor', 'company']

  const run = async () => {
    if (busy || rows.length === 0) return
    setBusy(true)
    setDoneN(0)
    setResult(null)
    let ok = 0
    let fail = 0
    const errors: string[] = []
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i]
      const email = (r.email || '').trim()
      const first = r.first_name || r.firstname || 'New'
      const last = r.last_name || r.lastname || 'User'
      const role = roles.includes((r.role || '').toLowerCase()) ? (r.role || '').toLowerCase() : 'learner'
      if (!email) {
        fail++
        errors.push(`Row ${i + 2}: missing email`)
        setDoneN(i + 1)
        continue
      }
      const res = await createAccount({ email, password: r.password || 'demo1234', firstName: first, lastName: last, role })
      if (!res.ok) {
        fail++
        errors.push(`${email}: ${res.error}`)
        setDoneN(i + 1)
        continue
      }
      if (res.id && supabase && (r.cpr || r.mobile || r.company)) {
        await supabase
          .from('profiles')
          .update({ cpr: r.cpr || null, mobile: r.mobile || null, company: r.company || null })
          .eq('id', res.id)
      }
      ok++
      setDoneN(i + 1)
      await new Promise((rz) => setTimeout(rz, 120))
    }
    setBusy(false)
    setResult({ ok, fail, errors: errors.slice(0, 8) })
    if (ok > 0) onRefresh()
  }

  const template = () => {
    const csv =
      'first_name,last_name,email,role,cpr,mobile,company\n' +
      'Ali,Hassan,ali.hassan@example.bh,learner,900112233,39000000,Batelco\n'
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'cordoba_people_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const showImportBtn = rows.length > 0 && !result

  return (
    <Modal title="Bulk CSV import" onClose={onClose}>
      <div className="space-y-3">
        <p className="text-[12px] leading-relaxed text-ink-600">
          Upload a CSV with a header row. Columns: <b>first_name, last_name, email, role, cpr, mobile, company</b>. Role
          is learner / trainer / admin / auditor / company (defaults to learner).
        </p>
        <button onClick={template} className="cursor-pointer text-[12px] font-bold text-brand-600 hover:text-brand-700">
          ⬇ Download template CSV
        </button>

        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0]
            if (!f) return
            setFileName(f.name)
            setResult(null)
            setRows(parseCSV(await f.text()))
          }}
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-line2 bg-soft px-4 py-4 text-[12.5px] font-semibold text-ink-600 transition-colors hover:border-brand-500/50 hover:text-brand-600"
        >
          <Upload size={15} /> {fileName ? `${fileName} — ${rows.length} rows` : 'Choose a CSV file'}
        </button>

        {busy && (
          <div>
            <ProgressBar value={rows.length ? Math.round((doneN / rows.length) * 100) : 0} />
            <p className="mt-1.5 text-[11.5px] text-ink-500">
              Importing {doneN} / {rows.length}…
            </p>
          </div>
        )}

        {result && (
          <div className="rounded-lg border border-line bg-soft p-3 text-[12px]">
            <p className="font-bold text-ok-600">
              ✓ {result.ok} created
              {result.fail > 0 && <span className="text-bad-600"> · {result.fail} skipped</span>}
            </p>
            {result.errors.length > 0 && (
              <ul className="mt-1.5 space-y-0.5 text-[11px] text-ink-500">
                {result.errors.map((er, i) => (
                  <li key={i}>• {er}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          {showImportBtn && (
            <Button onClick={run} className="flex-1">
              {busy ? 'Importing…' : `Import ${rows.length} people`}
            </Button>
          )}
          <Button variant="ghost" onClick={onClose} className={showImportBtn ? '' : 'flex-1'}>
            {result ? 'Close' : 'Cancel'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

/* ---------------------------- Grading ----------------------------- */
const ASSESSMENTS: { key: string; label: string }[] = [
  { key: 'pre', label: 'Pre-test' },
  { key: 'act', label: 'Activity' },
  { key: 'mid', label: 'Mid-term' },
  { key: 'post', label: 'Post-test' },
]
const gInit = (name: string) =>
  name.split(' ').filter(Boolean).map((s) => s[0]).slice(0, 2).join('').toUpperCase()

export function Grading() {
  const [batchList, setBatchList] = useState<{ id: number; batch_code: string; title: string }[]>([])
  const [batchId, setBatchId] = useState<number | null>(null)
  const [roster, setRoster] = useState<{ enrollmentId: number; learnerId: string; name: string }[]>([])
  const [scores, setScores] = useState<Record<string, Record<string, string>>>({})
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState('')

  useEffect(() => {
    if (!supabase) return
    supabase
      .from('batches')
      .select('id,batch_code,course:courses(title)')
      .order('start_date')
      .then(({ data, error }) => {
        if (error || !data || !data.length) return
        const list = data.map((b: Record<string, unknown>) => ({
          id: b.id as number,
          batch_code: b.batch_code as string,
          title: ((b.course as { title?: string } | null)?.title as string) ?? '',
        }))
        setBatchList(list)
        setBatchId(list[0].id)
      })
  }, [])

  useEffect(() => {
    if (!supabase || !batchId) return
    supabase
      .from('enrollments')
      .select('id, learner:profiles!learner_id(id,first_name,last_name)')
      .eq('batch_id', batchId)
      .then(({ data }) => {
        setRoster(
          (data ?? [])
            .map((e: Record<string, unknown>) => {
              const l = e.learner as Record<string, unknown> | null
              return {
                enrollmentId: e.id as number,
                learnerId: (l?.id as string) ?? '',
                name: `${(l?.first_name as string) ?? ''} ${(l?.last_name as string) ?? ''}`.trim(),
              }
            })
            .filter((x) => x.learnerId),
        )
      })
    supabase
      .from('grades')
      .select('learner_id,assessment,score')
      .eq('batch_id', batchId)
      .then(({ data }) => {
        const s: Record<string, Record<string, string>> = {}
        ;(data ?? []).forEach((g: Record<string, unknown>) => {
          const lid = g.learner_id as string
          s[lid] = s[lid] ?? {}
          s[lid][g.assessment as string] = String(g.score)
        })
        setScores(s)
      })
  }, [batchId])

  const setScore = (learnerId: string, key: string, val: string) => {
    setSaved('')
    setScores((s) => ({ ...s, [learnerId]: { ...(s[learnerId] ?? {}), [key]: val } }))
  }

  const avg = (learnerId: string): number | null => {
    const vals = ASSESSMENTS.map((a) => scores[learnerId]?.[a.key])
      .filter((v) => v !== undefined && v !== '')
      .map(Number)
      .filter((n) => !Number.isNaN(n))
    if (!vals.length) return null
    return Math.round(vals.reduce((s, n) => s + n, 0) / vals.length)
  }

  const save = async () => {
    if (!supabase || !batchId) return
    const rows: { learner_id: string; batch_id: number; assessment: string; score: number }[] = []
    roster.forEach((r) => {
      ASSESSMENTS.forEach((a) => {
        const v = scores[r.learnerId]?.[a.key]
        if (v !== undefined && v !== '') {
          const n = Number(v)
          if (!Number.isNaN(n) && n >= 0 && n <= 100) {
            rows.push({ learner_id: r.learnerId, batch_id: batchId, assessment: a.key, score: n })
          }
        }
      })
    })
    if (!rows.length) {
      setSaved('Enter at least one score first.')
      return
    }
    setBusy(true)
    const { data: auth } = await supabase.auth.getUser()
    const withGrader = rows.map((r) => ({ ...r, graded_by: auth.user?.id ?? null }))
    const { error } = await supabase.from('grades').upsert(withGrader, { onConflict: 'learner_id,batch_id,assessment' })
    setBusy(false)
    setSaved(error ? 'Save failed: ' + error.message : `✓ Saved ${rows.length} scores.`)
  }

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <div className="leading-tight">
          <select
            value={batchId ?? ''}
            onChange={(e) => {
              setBatchId(Number(e.target.value))
              setSaved('')
            }}
            className="cursor-pointer rounded-md border border-line bg-surface px-2 py-1 text-[13.5px] font-bold outline-none"
          >
            {batchList.map((b) => (
              <option key={b.id} value={b.id}>
                {b.batch_code}
              </option>
            ))}
          </select>
          <div className="mt-0.5 text-[11.5px] text-ink-500">{batchList.find((b) => b.id === batchId)?.title}</div>
        </div>
        <div className="ml-auto flex items-center gap-2.5">
          {hasSupabase && (
            <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-ok-600">
              <span className="h-2 w-2 rounded-full bg-ok-600" /> Live
            </span>
          )}
          <Button onClick={save} className="flex items-center gap-2">
            {busy ? 'Saving…' : 'Save grades'}
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

      <Card className="p-5">
        <SectionTitle right={<Badge tone="muted">{roster.length} learners</Badge>}>
          Assessment scores (0–100)
        </SectionTitle>
        {roster.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line2 bg-soft p-8 text-center">
            <p className="text-[13px] font-semibold text-ink-600">No learners enrolled in this batch.</p>
            <p className="mt-1 text-[12px] text-ink-400">
              Enrol them on the <b>Attendance</b> page first.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr>
                  <Th className="w-full">Learner</Th>
                  {ASSESSMENTS.map((a) => (
                    <Th key={a.key} className="text-center">
                      {a.label}
                    </Th>
                  ))}
                  <Th className="text-center">Average</Th>
                </tr>
              </thead>
              <tbody>
                {roster.map((r) => {
                  const a = avg(r.learnerId)
                  return (
                    <tr key={r.enrollmentId} className="hover:bg-soft">
                      <Td>
                        <div className="flex items-center gap-2.5">
                          <Avatar text={gInit(r.name)} size={30} />
                          <span className="font-semibold text-navy-900">{r.name}</span>
                        </div>
                      </Td>
                      {ASSESSMENTS.map((asmt) => (
                        <Td key={asmt.key} className="text-center">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={scores[r.learnerId]?.[asmt.key] ?? ''}
                            onChange={(e) => setScore(r.learnerId, asmt.key, e.target.value)}
                            placeholder="—"
                            className="h-9 w-16 rounded-md border border-line bg-soft text-center text-[12.5px] font-semibold text-navy-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
                          />
                        </Td>
                      ))}
                      <Td className="text-center">
                        {a == null ? (
                          <span className="text-ink-400">—</span>
                        ) : (
                          <Badge tone={a >= 60 ? 'ok' : a >= 40 ? 'warn' : 'bad'}>{a}%</Badge>
                        )}
                      </Td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-4 text-[11.5px] text-ink-400">
          Pre-test · Activity · Mid-term · Post-test — scores feed the Tamkeen completion report. Pass ≥ 60%.
        </p>
      </Card>
    </div>
  )
}

/* --------------------------- MyCourse ----------------------------- */
export function MyCourse() {
  const d = useLiveData()
  const [lesson, setLesson] = useState<number | null>(null)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [score, setScore] = useState<number | null>(null)
  const openLesson = (i: number | null) => {
    setLesson(i)
    setAnswers({})
    setScore(null)
  }

  if (hasSupabase && d.loading) return <Loading label="Loading your course…" />

  let course: { code: string; title: string; totalHours: number; modules: CourseModule[] } | null = null
  let progress = 0
  if (hasSupabase && d.me) {
    const enr = d.enrollments.find((e) => e.learner_id === d.me!.id)
    const batch = enr ? d.batches.find((b) => b.id === enr.batch_id) : undefined
    const cr = batch ? d.courses.find((c) => c.id === batch.course_id) : undefined
    if (cr) course = { code: cr.code, title: cr.title, totalHours: cr.total_hours, modules: cr.modules }
    progress = enr?.progress ?? 0
  } else {
    const c = getCourse(1)
    course = { code: c.code, title: c.title, totalHours: c.totalHours, modules: c.modules }
    progress = 65
  }

  if (!course) {
    return (
      <Card className="p-10 text-center text-[13px] text-ink-500">You're not enrolled in a course yet.</Card>
    )
  }
  const modules = course.modules

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <SectionTitle right={<Badge tone="brand">{course.code}</Badge>}>{course.title}</SectionTitle>
        <ProgressBar value={progress} />
        <p className="mt-2 text-[12px] text-ink-400">
          {progress}% complete · {course.totalHours} hours total · tap a module to open it
        </p>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {modules.map((m, i) => (
          <div
            key={m.num}
            onClick={() => openLesson(i)}
            className="group cursor-pointer rounded-2xl border border-line bg-surface p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-500/30 hover:shadow-md"
          >
            <div className="flex items-center gap-2">
              <span className="text-[11.5px] font-extrabold text-brand-500">MODULE {m.num}</span>
              <span className="ml-auto flex items-center gap-2 text-[10.5px] font-bold">
                {m.material && <span className="text-brand-600">📎 Material</span>}
                {m.quiz && m.quiz.length > 0 && <span className="text-gold-600">📝 {m.quiz.length} quiz</span>}
              </span>
            </div>
            <h3 className="mt-1.5 text-[14px] font-bold transition-colors group-hover:text-brand-600">{m.title}</h3>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-500">{m.desc}</p>
          </div>
        ))}
      </div>

      {lesson !== null && modules[lesson] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm" onClick={() => openLesson(null)} />
          <div className="relative z-10 max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wide text-brand-600 uppercase">
                Module {modules[lesson].num} · Lesson {lesson + 1} of {modules.length}
              </span>
              <button onClick={() => openLesson(null)} className="cursor-pointer text-ink-400 hover:text-navy-900">
                <X size={18} />
              </button>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <FileText size={20} />
              </div>
              <h3 className="text-[17px] leading-snug font-extrabold text-navy-900">{modules[lesson].title}</h3>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-ink-600">{modules[lesson].desc}</p>

            {modules[lesson].material ? (
              <a
                href={modules[lesson].material}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center gap-2 rounded-lg border border-brand-500/30 bg-brand-50 px-3 py-2.5 text-[12.5px] font-bold text-brand-600 transition-colors hover:bg-brand-100"
              >
                <BookOpen size={15} /> Open lesson material ↗
              </a>
            ) : (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-line bg-soft px-3 py-2.5 text-[11.5px] text-ink-500">
                <BookOpen size={14} className="flex-none text-ink-400" />
                No material attached to this lesson yet.
              </div>
            )}

            {modules[lesson].quiz && modules[lesson].quiz!.length > 0 && (
              <div className="mt-5 border-t border-line pt-4">
                <div className="text-[12.5px] font-extrabold text-navy-900">Quick quiz</div>
                <div className="mt-2 space-y-3">
                  {modules[lesson].quiz!.map((qq, qi) => (
                    <div key={qi}>
                      <div className="text-[12.5px] font-semibold text-navy-900">
                        {qi + 1}. {qq.q}
                      </div>
                      <div className="mt-1.5 space-y-1">
                        {qq.opts.map((o, oi) => {
                          const chosen = answers[qi] === oi
                          const revealed = score != null
                          const cls = revealed
                            ? oi === qq.correct
                              ? 'border-ok-600/40 bg-ok-50 text-ok-600'
                              : chosen
                                ? 'border-bad-600/40 bg-bad-50 text-bad-600'
                                : 'border-line text-ink-500'
                            : chosen
                              ? 'border-brand-500 bg-brand-50 text-navy-900'
                              : 'border-line text-ink-600 hover:border-brand-500/40'
                          return (
                            <label key={oi} className={`flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-[12px] ${cls}`}>
                              <input
                                type="radio"
                                className="h-3 w-3 accent-brand-500"
                                disabled={revealed}
                                checked={chosen}
                                onChange={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                              />
                              {o || <span className="text-ink-400">Option {String.fromCharCode(65 + oi)}</span>}
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                {score == null ? (
                  <Button
                    onClick={() => {
                      const q = modules[lesson].quiz!
                      setScore(q.reduce((n, qq, qi) => n + (answers[qi] === qq.correct ? 1 : 0), 0))
                    }}
                    className="mt-3"
                  >
                    Submit quiz
                  </Button>
                ) : (
                  <div className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-[12.5px] font-extrabold text-brand-700">
                    You scored {score} / {modules[lesson].quiz!.length} (
                    {Math.round((score / modules[lesson].quiz!.length) * 100)}%)
                  </div>
                )}
              </div>
            )}

            <div className="mt-5 flex items-center justify-between">
              <Button variant="ghost" onClick={() => openLesson(Math.max(0, lesson - 1))}>
                ← Previous
              </Button>
              <span className="text-[11.5px] font-semibold text-ink-400">
                {lesson + 1} / {modules.length}
              </span>
              {lesson < modules.length - 1 ? (
                <Button onClick={() => openLesson(lesson + 1)}>Next →</Button>
              ) : (
                <Button onClick={() => openLesson(null)}>Finish</Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
