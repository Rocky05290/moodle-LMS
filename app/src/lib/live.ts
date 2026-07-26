import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { ATTENDANCE_META } from '../data/mock'
import type { AttendanceCode } from '../data/mock'

/**
 * Central live-data hook for the dashboards.
 *
 * Fetches every operational table once, then exposes the raw rows plus a
 * `live` flag (true when the database actually has batches). Pure helper
 * functions below turn those rows into the same attendance / grade metrics
 * the mock data used, so a dashboard can compute either from live or mock.
 */

export type ProfileRow = {
  id: string
  first_name: string
  last_name: string
  company: string | null
  cpr: string | null
  role: string
}
export type CourseRow = {
  id: number
  code: string
  title: string
  category: string | null
  total_hours: number
  modules: { num: string; title: string; desc: string }[]
}
export type BatchRow = {
  id: number
  batch_code: string
  course_id: number
  trainer_id: string | null
  start_date: string
  end_date: string
  start_time: string | null
  end_time: string | null
  total_hours: number
  status: string
}
export type EnrollRow = { id: number; learner_id: string; batch_id: number; progress: number }
export type AttRow = { learner_id: string; batch_id: number; code: AttendanceCode }
export type GradeRow = { learner_id: string; batch_id: number; score: number }

export type LiveData = {
  live: boolean
  loading: boolean
  me: ProfileRow | null
  profiles: ProfileRow[]
  courses: CourseRow[]
  batches: BatchRow[]
  enrollments: EnrollRow[]
  attendance: AttRow[]
  grades: GradeRow[]
}

const EMPTY: LiveData = {
  live: false,
  loading: true,
  me: null,
  profiles: [],
  courses: [],
  batches: [],
  enrollments: [],
  attendance: [],
  grades: [],
}

export function useLiveData(): LiveData {
  const [state, setState] = useState<LiveData>(EMPTY)

  useEffect(() => {
    let cancelled = false
    if (!supabase) {
      setState((s) => ({ ...s, loading: false }))
      return
    }
    const sb = supabase
    ;(async () => {
      const [auth, p, c, b, e, a, g] = await Promise.all([
        sb.auth.getUser(),
        sb.from('profiles').select('id,first_name,last_name,company,cpr,role'),
        sb.from('courses').select('id,code,title,category,total_hours,modules').order('id'),
        sb
          .from('batches')
          .select('id,batch_code,course_id,trainer_id,start_date,end_date,start_time,end_time,total_hours,status')
          .order('start_date'),
        sb.from('enrollments').select('id,learner_id,batch_id,progress'),
        sb.from('attendance').select('learner_id,batch_id,code'),
        sb.from('grades').select('learner_id,batch_id,score'),
      ])
      if (cancelled) return
      const profiles = (p.data ?? []) as ProfileRow[]
      const batches = (b.data ?? []) as BatchRow[]
      const meId = auth.data.user?.id
      setState({
        live: batches.length > 0,
        loading: false,
        me: profiles.find((x) => x.id === meId) ?? null,
        profiles,
        courses: (c.data ?? []) as CourseRow[],
        batches,
        enrollments: (e.data ?? []) as EnrollRow[],
        attendance: (a.data ?? []) as AttRow[],
        grades: (g.data ?? []) as GradeRow[],
      })
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return state
}

/* ------------------------- pure metric helpers ------------------------- */
export const nameInitials = (name: string) =>
  name.split(' ').filter(Boolean).map((s) => s[0]).slice(0, 2).join('').toUpperCase()

export function attPct(att: AttRow[], learnerId: string, batchId: number): number {
  const rows = att.filter((r) => r.learner_id === learnerId && r.batch_id === batchId)
  if (!rows.length) return 0
  const earned = rows.reduce((s, r) => s + (ATTENDANCE_META[r.code]?.points ?? 0), 0)
  return Math.round((earned / (rows.length * 2)) * 100)
}

export function batchAttPct(att: AttRow[], batchId: number): number {
  const rows = att.filter((r) => r.batch_id === batchId)
  if (!rows.length) return 0
  const earned = rows.reduce((s, r) => s + (ATTENDANCE_META[r.code]?.points ?? 0), 0)
  return Math.round((earned / (rows.length * 2)) * 100)
}

export function avgGradeLive(grades: GradeRow[], learnerId: string, batchId: number): number | null {
  const rows = grades.filter((r) => r.learner_id === learnerId && r.batch_id === batchId)
  if (!rows.length) return null
  return Math.round(rows.reduce((s, r) => s + Number(r.score), 0) / rows.length)
}
