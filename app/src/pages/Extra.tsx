import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Plus, Upload, Mail, Phone, X, Trash2 } from 'lucide-react'
import {
  batches, courses as mockCourses, users, enrollments, getCourse, getUser,
  batchAttendancePct, fullName, initials,
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
    batches.map((b) => {
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
        attendancePct: b.status === 'active' ? batchAttendancePct(b.id) : null,
        course: { title: c.title, code: c.code },
        trainer: { first_name: t.firstName, last_name: t.lastName },
        learners: enrollments.filter((e) => e.batchId === b.id).length,
      }
    })

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
                      <button
                        onClick={() => removeBatch(b.id, b.batch_code)}
                        title="Delete batch"
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
    </>
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
export function Courses() {
  const [list, setList] = useState<Course[]>(mockCourses)
  const [live, setLive] = useState(false)

  useEffect(() => {
    if (!supabase) return
    supabase
      .from('courses')
      .select('*')
      .order('id')
      .then(({ data, error }) => {
        if (error || !data || !data.length) return
        setList(
          data.map((r) => ({
            id: r.id as number,
            code: r.code as string,
            title: r.title as string,
            category: r.category as string,
            totalHours: r.total_hours as number,
            modules: (r.modules ?? []) as Course['modules'],
          })),
        )
        setLive(true)
      })
  }, [])

  return (
    <div className="space-y-4">
      <LiveTag live={live} />
      <div className="grid gap-4 md:grid-cols-3">
        {list.map((c) => (
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
    users.map((u) => ({
      id: String(u.id),
      first_name: u.firstName,
      last_name: u.lastName,
      email: u.email,
      mobile: u.mobile,
      cpr: u.cpr,
      company: u.company ?? null,
      role: u.role,
    }))

  return (
    <>
      <Card className="p-5">
        <SectionTitle
          right={
            <div className="flex gap-2">
              <Button variant="ghost" className="flex items-center gap-1.5 !px-3 !py-2 !text-[12px]">
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
