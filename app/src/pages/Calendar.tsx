import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CalendarDays, Printer, ArrowLeft, Lightbulb } from 'lucide-react'
import { useLiveData, hasSupabase } from '../lib/live'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui'
import Loading from '../components/Loading'

const WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'] // Bahrain working week
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const pad = (n: number) => String(n).padStart(2, '0')
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const pretty = (iso: string) => {
  const [y, m, dd] = iso.split('-').map(Number)
  return `${pad(dd)}-${MONTHS[m - 1].slice(0, 3)}-${y}`
}

// weeks of a month, each row = [Sun,Mon,Tue,Wed,Thu] day numbers (null = empty)
function monthGrid(year: number, month: number): (number | null)[][] {
  const weeks: (number | null)[][] = []
  let week: (number | null)[] = [null, null, null, null, null]
  const days = new Date(year, month + 1, 0).getDate()
  for (let day = 1; day <= days; day++) {
    const dow = new Date(year, month, day).getDay() // 0 Sun .. 6 Sat
    if (dow >= 0 && dow <= 4) {
      if (dow === 0 && week.some((x) => x !== null)) {
        weeks.push(week)
        week = [null, null, null, null, null]
      }
      week[dow] = day
    }
  }
  if (week.some((x) => x !== null)) weeks.push(week)
  return weeks
}

type DayInfo = { session?: number; holiday?: string; inRange: boolean }

export default function Calendar() {
  const d = useLiveData()
  const [sp] = useSearchParams()
  const fromBatchParam = sp.get('batch')
  const [batchId, setBatchId] = useState<number | null>(fromBatchParam ? Number(fromBatchParam) : null)
  const [holidays, setHolidays] = useState<Record<string, string>>({})
  const cameFromRegistry = !!fromBatchParam

  const loadHolidays = () => {
    if (!supabase) return
    supabase
      .from('holidays')
      .select('holiday_date,name')
      .then(({ data }) => {
        const m: Record<string, string> = {}
        ;(data ?? []).forEach((h: Record<string, unknown>) => {
          m[h.holiday_date as string] = h.name as string
        })
        setHolidays(m)
      })
  }
  useEffect(loadHolidays, [])

  if (hasSupabase && d.loading) return <Loading label="Loading calendar…" />

  const batchList = d.batches
  const curId = batchId ?? batchList[0]?.id ?? null
  const batch = batchList.find((b) => b.id === curId) ?? null
  const course = batch ? d.courses.find((c) => c.id === batch.course_id) : null
  const trainer = batch ? d.profiles.find((p) => p.id === batch.trainer_id) : null

  // build the day map + list of months across the batch's range
  const dayInfo: Record<string, DayInfo> = {}
  const months: { year: number; month: number }[] = []
  let totalSessions = 0
  if (batch) {
    const [sy, sm, sd] = batch.start_date.split('-').map(Number)
    const [ey, em, ed] = batch.end_date.split('-').map(Number)
    const end = new Date(ey, em - 1, ed)
    const cur = new Date(sy, sm - 1, sd)
    const seen = new Set<string>()
    while (cur <= end) {
      const iso = toISO(cur)
      const dow = cur.getDay()
      const key = `${cur.getFullYear()}-${cur.getMonth()}`
      if (!seen.has(key)) {
        seen.add(key)
        months.push({ year: cur.getFullYear(), month: cur.getMonth() })
      }
      if (dow >= 0 && dow <= 4) {
        if (holidays[iso]) dayInfo[iso] = { holiday: holidays[iso], inRange: true }
        else {
          totalSessions++
          dayInfo[iso] = { session: totalSessions, inRange: true }
        }
      } else {
        dayInfo[iso] = { inRange: true }
      }
      cur.setDate(cur.getDate() + 1)
    }
  }

  const toggleHoliday = async (iso: string) => {
    if (!supabase) return
    if (holidays[iso]) {
      if (!window.confirm(`Remove holiday "${holidays[iso]}" on ${pretty(iso)}?`)) return
      const { error } = await supabase.from('holidays').delete().eq('holiday_date', iso)
      if (error) return window.alert('Could not update: ' + error.message)
    } else {
      const name = window.prompt(`Mark ${pretty(iso)} as a holiday — enter the name:`, 'Public Holiday')
      if (!name) return
      const { error } = await supabase.from('holidays').insert({ holiday_date: iso, name })
      if (error) return window.alert('Could not update: ' + error.message)
    }
    loadHolidays()
  }

  return (
    <div className="space-y-5">
      {/* Tamkeen exporter banner — shown when arriving from the Batch Registry */}
      {cameFromRegistry && (
        <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold-400/25 bg-gradient-to-r from-navy-900 to-navy-950 p-5 text-white">
          <div>
            <h1 className="text-[19px] font-extrabold">Tamkeen Document Exporter Engine</h1>
            <p className="mt-1 flex items-center gap-1.5 text-[12px] text-white/60">
              <Lightbulb size={13} className="text-gold-400" />
              Pro-tip: click any operational day cell below to toggle a holiday exception.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 px-4 py-2.5 text-[13px] font-bold text-navy-950 transition-all hover:-translate-y-0.5"
            >
              <Printer size={14} /> Print / Export PDF
            </button>
            <Link
              to="/admin"
              className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.05] px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-white/[0.1]"
            >
              <ArrowLeft size={14} /> Back to Registry
            </Link>
          </div>
        </div>
      )}

      {/* toolbar (hidden when printing) */}
      <Card className="no-print flex flex-wrap items-center gap-3 p-4">
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
                  {b.batch_code}
                </option>
              ))}
            </select>
            <div className="mt-0.5 text-[11.5px] text-ink-500">{course?.title}</div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3 text-[11.5px] font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-brand-500" /> Session
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-gold-400" /> Holiday
          </span>
          <button
            onClick={() => window.print()}
            className="flex cursor-pointer items-center gap-2 rounded-md bg-gradient-to-r from-brand-500 to-indigo-500 px-4 py-2 font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <Printer size={14} /> Print / Save PDF
          </button>
        </div>
      </Card>

      {!batch ? (
        <Card className="p-8 text-center text-[13px] text-ink-500">
          No batches yet — create one on the <b>Batches</b> page first.
        </Card>
      ) : (
        <Card className="print-area p-6 sm:p-8">
          {/* document header */}
          <div className="mb-6 border-b-2 border-brand-500/25 pb-4 text-center">
            <div className="text-[11px] font-bold tracking-[0.18em] text-brand-600 uppercase">
              Cordoba Training Center · Tamkeen-registered · Kingdom of Bahrain
            </div>
            <h1 className="mt-2 text-[22px] font-extrabold text-navy-900">Tentative Training Calendar</h1>
            <div className="mt-3 grid gap-x-8 gap-y-1 text-left text-[12.5px] text-ink-700 sm:grid-cols-2">
              <div>
                <b>Batch Code:</b> {batch.batch_code}
              </div>
              <div>
                <b>Training Program:</b> {course?.title ?? '—'}
              </div>
              <div>
                <b>Lead Instructor:</b> {trainer ? `${trainer.first_name} ${trainer.last_name}` : 'Unassigned'}
              </div>
              <div>
                <b>Total Sessions:</b> {totalSessions} · {batch.total_hours}h contracted
              </div>
              <div>
                <b>Start Date:</b> {pretty(batch.start_date)}
              </div>
              <div>
                <b>End Date:</b> {pretty(batch.end_date)}
              </div>
            </div>
          </div>

          {/* month grids */}
          <div className="space-y-8">
            {months.map(({ year, month }) => (
              <div key={`${year}-${month}`}>
                <h2 className="mb-2 text-[15px] font-extrabold text-brand-700">
                  {MONTHS[month]} {year}
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] table-fixed border-collapse">
                    <thead>
                      <tr>
                        {WEEK.map((w) => (
                          <th
                            key={w}
                            className="border border-line bg-soft2 py-1.5 text-[11px] font-bold tracking-wide text-ink-600 uppercase"
                          >
                            {w}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {monthGrid(year, month).map((week, wi) => (
                        <tr key={wi}>
                          {week.map((day, ci) => {
                            if (day === null) return <td key={ci} className="border border-line bg-white" />
                            const iso = toISO(new Date(year, month, day))
                            const info = dayInfo[iso]
                            const out = !info?.inRange
                            return (
                              <td
                                key={ci}
                                onClick={() => { if (info?.inRange) toggleHoliday(iso) }}
                                className={`h-16 border border-line align-top transition-colors ${
                                  out
                                    ? 'bg-white text-ink-300'
                                    : info?.holiday
                                      ? 'cursor-pointer bg-gold-100 hover:bg-gold-200'
                                      : 'cursor-pointer bg-white hover:bg-brand-50'
                                }`}
                                title={info?.inRange ? 'Click to mark / unmark a holiday' : ''}
                              >
                                <div className="p-1.5">
                                  <div className={`text-[11px] font-bold ${out ? 'text-ink-300' : 'text-ink-500'}`}>{day}</div>
                                  {info?.session && (
                                    <div className="mt-1 inline-block rounded bg-brand-500 px-1.5 py-0.5 text-[10.5px] font-bold text-white">
                                      Session {info.session}
                                    </div>
                                  )}
                                  {info?.holiday && (
                                    <div className="mt-1 text-[10px] leading-tight font-bold text-gold-600">{info.holiday}</div>
                                  )}
                                </div>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          <p className="no-print mt-6 text-[11px] text-ink-400">
            Working week is Sunday–Thursday. Sessions auto-number across working days; click any day to mark/unmark a
            holiday (sessions renumber automatically). Fridays &amp; Saturdays are excluded.
          </p>
          <div className="mt-8 flex justify-between text-[11px] text-ink-500">
            <span>Authorized · Ministry of Labour &amp; Tamkeen</span>
            <span>Cordoba Training Center</span>
          </div>
        </Card>
      )}
    </div>
  )
}
