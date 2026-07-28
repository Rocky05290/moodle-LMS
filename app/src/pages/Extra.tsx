import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Plus, Upload, Mail, Phone, X, Trash2, Pencil, Network, ShieldCheck, Cloud, BookOpen, ChevronDown } from 'lucide-react'
import {
  batches, courses as mockCourses, users, enrollments, getCourse, getUser,
  batchAttendancePct,
} from '../data/mock'
import type { Course, Role } from '../data/mock'
import { supabase, hasSupabase, createAccount } from '../lib/supabase'
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

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-line bg-white p-6 shadow-2xl">
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
  const [courses, setCourses] = useState<{ id: number; code: string; title: string }[]>([])
  const [trainers, setTrainers] = useState<{ id: string; first_name: string; last_name: string }[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<BatchRow | null>(null)

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
    supabase.from('courses').select('id,code,title').order('code').then(({ data }) => data && setCourses(data as never))
    supabase
      .from('profiles')
      .select('id,first_name,last_name')
      .eq('role', 'trainer')
      .then(({ data }) => data && setTrainers(data as never))
  }
  useEffect(load, [])

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
          courses={courses.length ? courses : mockCourses.map((c) => ({ id: c.id, code: c.code, title: c.title }))}
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
  courses: { id: number; code: string; title: string }[]
  trainers: { id: string; first_name: string; last_name: string }[]
  onClose: () => void
  onDone: () => void
}) {
  const [f, setF] = useState({
    batch_code: '',
    course_id: courses[0]?.id ? String(courses[0].id) : '',
    trainer_id: '',
    start_date: '',
    end_date: '',
    start_time: '09:00',
    end_time: '13:00',
    total_hours: '48',
    status: 'upcoming',
  })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })

  const save = async () => {
    setErr('')
    if (!f.batch_code || !f.course_id || !f.start_date || !f.end_date) {
      setErr('Batch code, course, start and end dates are required.')
      return
    }
    if (!supabase) return
    setBusy(true)
    const { error } = await supabase.from('batches').insert({
      batch_code: f.batch_code,
      course_id: Number(f.course_id),
      trainer_id: f.trainer_id || null,
      start_date: f.start_date,
      end_date: f.end_date,
      start_time: f.start_time || null,
      end_time: f.end_time || null,
      total_hours: Number(f.total_hours) || 0,
      status: f.status,
    })
    setBusy(false)
    if (error) {
      setErr(error.message)
      return
    }
    onDone()
  }

  return (
    <Modal title="Create batch" onClose={onClose}>
      <div className="space-y-3">
        <div>
          <label className={labelCls}>Batch code</label>
          <input className={fieldCls} placeholder="CTC-CCNA-2604" value={f.batch_code} onChange={set('batch_code')} />
        </div>
        <div>
          <label className={labelCls}>Course</label>
          <select className={fieldCls} value={f.course_id} onChange={set('course_id')}>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Trainer</label>
          <select className={fieldCls} value={f.trainer_id} onChange={set('trainer_id')}>
            <option value="">— Unassigned —</option>
            {trainers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.first_name} {t.last_name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Start date</label>
            <input type="date" className={fieldCls} value={f.start_date} onChange={set('start_date')} />
          </div>
          <div>
            <label className={labelCls}>End date</label>
            <input type="date" className={fieldCls} value={f.end_date} onChange={set('end_date')} />
          </div>
          <div>
            <label className={labelCls}>Start time</label>
            <input type="time" className={fieldCls} value={f.start_time} onChange={set('start_time')} />
          </div>
          <div>
            <label className={labelCls}>End time</label>
            <input type="time" className={fieldCls} value={f.end_time} onChange={set('end_time')} />
          </div>
          <div>
            <label className={labelCls}>Total hours</label>
            <input type="number" className={fieldCls} value={f.total_hours} onChange={set('total_hours')} />
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select className={fieldCls} value={f.status} onChange={set('status')}>
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        {err && (
          <p className="rounded-md border border-bad-600/20 bg-bad-50 px-3 py-2 text-[12px] font-semibold text-bad-600">
            {err}
          </p>
        )}
        <div className="flex gap-2 pt-1">
          <Button onClick={save} className="flex-1" >{busy ? 'Saving…' : 'Create batch'}</Button>
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
type CourseCard = Course & { description?: string; level?: string; price?: string }

export function Courses() {
  const [list, setList] = useState<CourseCard[]>(hasSupabase ? [] : mockCourses)
  const [live, setLive] = useState(false)
  const [open, setOpen] = useState<Record<number, boolean>>({})
  const [isAdmin, setIsAdmin] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editCourse, setEditCourse] = useState<CourseCard | null>(null)

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
            modules: (r.modules ?? []) as Course['modules'],
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
              className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_10px_28px_-16px_rgba(15,27,53,0.18)] transition-all hover:-translate-y-1 hover:shadow-[0_24px_50px_-20px_rgba(15,27,53,0.28)]"
            >
              {/* banner */}
              <div className={`relative h-28 overflow-hidden bg-gradient-to-br ${cat.grad}`}>
                <cat.Icon className="absolute -right-2 -bottom-3 text-white/15" size={92} strokeWidth={1.5} />
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
                    onClick={() => setOpen((o) => ({ ...o, [c.id]: !o[c.id] }))}
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
                      onClick={() => {
                        setEditCourse(c)
                        setFormOpen(true)
                      }}
                      className="flex cursor-pointer items-center gap-1 font-bold text-ink-500 transition-colors hover:text-brand-600"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      onClick={() => delCourse(c)}
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
          onDone={() => {
            setFormOpen(false)
            load()
          }}
        />
      )}
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
  const [modules, setModules] = useState<{ num: string; title: string; desc: string }[]>(
    course?.modules?.length ? course.modules.map((m) => ({ ...m })) : [{ num: '01', title: '', desc: '' }],
  )
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })
  const setMod = (i: number, key: 'num' | 'title' | 'desc', val: string) =>
    setModules((ms) => ms.map((m, j) => (j === i ? { ...m, [key]: val } : m)))
  const addMod = () => setModules((ms) => [...ms, { num: String(ms.length + 1).padStart(2, '0'), title: '', desc: '' }])
  const removeMod = (i: number) => setModules((ms) => ms.filter((_, j) => j !== i))

  const save = async () => {
    setErr('')
    if (!f.code.trim() || !f.title.trim()) {
      setErr('Course code and title are required.')
      return
    }
    if (!supabase) return
    setBusy(true)
    const payload = {
      code: f.code.trim(),
      title: f.title.trim(),
      category: f.category,
      total_hours: Number(f.total_hours) || 0,
      level: f.level || null,
      price: f.price || null,
      description: f.description || null,
      modules: modules.filter((m) => m.title.trim()),
    }
    const { error } = editing
      ? await supabase.from('courses').update(payload).eq('id', course!.id)
      : await supabase.from('courses').insert(payload)
    setBusy(false)
    if (error) {
      setErr(
        error.message.toLowerCase().includes('column')
          ? 'Run supabase_course_details.sql once to add the price/level/description columns. (' + error.message + ')'
          : error.message,
      )
      return
    }
    onDone()
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
          <div className="space-y-2">
            {modules.map((m, i) => (
              <div key={i} className="flex gap-2 rounded-lg border border-line bg-soft p-2">
                <input
                  className="w-10 flex-none rounded border border-line bg-white px-1 text-center text-[12px] font-bold outline-none"
                  value={m.num}
                  onChange={(e) => setMod(i, 'num', e.target.value)}
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <input
                    className="w-full rounded border border-line bg-white px-2 py-1 text-[12px] font-semibold outline-none"
                    placeholder="Module title"
                    value={m.title}
                    onChange={(e) => setMod(i, 'title', e.target.value)}
                  />
                  <input
                    className="w-full rounded border border-line bg-white px-2 py-1 text-[11px] outline-none"
                    placeholder="Short description"
                    value={m.desc}
                    onChange={(e) => setMod(i, 'desc', e.target.value)}
                  />
                </div>
                <button onClick={() => removeMod(i)} className="flex-none cursor-pointer text-ink-400 hover:text-bad-600">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {err && (
          <p className="rounded-md border border-bad-600/20 bg-bad-50 px-3 py-2 text-[12px] font-semibold text-bad-600">
            {err}
          </p>
        )}
        <div className="flex gap-2 pt-1">
          <Button onClick={save} className="flex-1">
            {busy ? 'Saving…' : editing ? 'Save changes' : 'Create course'}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
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
  const [showImport, setShowImport] = useState(false)

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
  }
  useEffect(load, [])

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

  const rows: Person[] =
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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px]">
            <thead>
              <tr>
                <Th className="w-full">Name</Th>
                <Th>CPR</Th>
                <Th>Contact</Th>
                <Th>Company</Th>
                <Th>Role</Th>
                <Th className="text-right">{''}</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="hover:bg-soft">
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <Avatar text={pInit(u)} size={30} />
                      <span className="font-semibold">{pName(u)}</span>
                    </div>
                  </Td>
                  <Td className="font-mono text-[12px] text-ink-500">{u.cpr ?? '—'}</Td>
                  <Td className="text-[12px] text-ink-500">
                    <div className="flex items-center gap-1.5">
                      <Mail size={11} /> {u.email}
                    </div>
                    <div className="flex items-center gap-1.5 text-ink-400">
                      <Phone size={11} /> {u.mobile ?? '—'}
                    </div>
                  </Td>
                  <Td className="text-ink-500">{u.company ?? '—'}</Td>
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
                  <Td className="text-right pr-2">
                    {live && (
                      <button
                        onClick={() => removePerson(u.id, pName(u))}
                        title="Remove person"
                        className="cursor-pointer rounded-md p-1.5 text-ink-400 transition-colors hover:bg-bad-50 hover:text-bad-600"
                      >
                        <Trash2 size={15} />
                      </button>
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
            <input className={fieldCls} value={f.first_name} onChange={set('first_name')} />
          </div>
          <div>
            <label className={labelCls}>Last name</label>
            <input className={fieldCls} value={f.last_name} onChange={set('last_name')} />
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
            <input className={fieldCls} value={f.cpr} onChange={set('cpr')} />
          </div>
          <div>
            <label className={labelCls}>Mobile</label>
            <input className={fieldCls} value={f.mobile} onChange={set('mobile')} />
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
