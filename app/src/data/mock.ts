/* ------------------------------------------------------------------
   Mock data — mirrors the client's demo data model exactly.
   Later this file is replaced by Supabase queries (same shapes).
------------------------------------------------------------------- */

export type Role = 'admin' | 'trainer' | 'learner' | 'auditor' | 'company'
export type AttendanceCode = 'P' | 'L1' | 'L2' | 'L3' | 'A'

export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  mobile: string
  cpr: string
  role: Role
  company?: string
}

export interface CourseModule {
  num: string
  title: string
  desc: string
}

export interface Course {
  id: number
  title: string
  code: string
  category: string
  totalHours: number
  modules: CourseModule[]
}

export interface Batch {
  id: number
  courseId: number
  batchCode: string
  trainerId: number
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  totalHours: number
  status: 'upcoming' | 'active' | 'completed'
}

export interface Enrollment {
  id: number
  learnerId: number
  batchId: number
  progress: number
}

export const ATTENDANCE_META: Record<AttendanceCode, { label: string; points: number; tone: string }> = {
  P: { label: 'Present', points: 2, tone: 'ok' },
  L1: { label: 'Late 5 min', points: 1.5, tone: 'warn' },
  L2: { label: 'Late 10 min', points: 1, tone: 'warn' },
  L3: { label: 'Late 15 min', points: 0.5, tone: 'warn' },
  A: { label: 'Absent', points: 0, tone: 'bad' },
}

export const users: User[] = [
  { id: 1, firstName: 'Ankit', lastName: 'Srivastav', email: 'admin@cordoba.bh', mobile: '39000001', cpr: '800112233', role: 'admin' },
  { id: 101, firstName: 'Ali', lastName: 'Al-Mansoori', email: 'ali@batelco.com.bh', mobile: '39441122', cpr: '961234567', role: 'learner', company: 'Batelco' },
  { id: 102, firstName: 'Siddika', lastName: 'Mahmood', email: 'siddika@batelco.com.bh', mobile: '39665544', cpr: '981254321', role: 'learner', company: 'Batelco' },
  { id: 103, firstName: 'Jasem', lastName: 'Al-Saffar', email: 'jasem.saffar@outlook.com', mobile: '33112233', cpr: '951234987', role: 'learner', company: 'Private' },
  { id: 104, firstName: 'Eng. Sayed', lastName: 'Al-Alawi', email: 'sayed@cordoba.bh', mobile: '36551100', cpr: '850123456', role: 'trainer' },
  { id: 105, firstName: 'Dr. Fatima', lastName: 'Al-Hashimi', email: 'fatima@cordoba.bh', mobile: '36778899', cpr: '820987654', role: 'trainer' },
  { id: 106, firstName: 'Anshuman', lastName: 'Prasad', email: 'anshuman@cordoba.bh', mobile: '36112233', cpr: '810556677', role: 'trainer' },
  { id: 107, firstName: 'Alba Corporate', lastName: 'Department', email: 'hr@alba.com.bh', mobile: '17831111', cpr: 'Alba-CR99', role: 'company', company: 'Alba' },
  { id: 108, firstName: 'Noor', lastName: 'Al-Khalifa', email: 'qa@cordoba.bh', mobile: '36445566', cpr: '870334455', role: 'auditor' },
]

export const courses: Course[] = [
  {
    id: 1, title: 'CCNA — Networking Fundamentals', code: 'CCNA', category: 'Networking', totalHours: 48,
    modules: [
      { num: '01', title: 'Network Fundamentals', desc: 'Topologies, OSI & TCP/IP models, media types.' },
      { num: '02', title: 'Routing & Switching', desc: 'VLANs, static & dynamic routing, spanning tree.' },
      { num: '03', title: 'IP Services & Security', desc: 'DHCP, NAT, ACLs, device hardening.' },
      { num: '04', title: 'Automation & Diagnostics', desc: 'Troubleshooting workflow, network automation basics.' },
    ],
  },
  {
    id: 2, title: 'CCNP Enterprise', code: 'CCNP', category: 'Networking', totalHours: 80,
    modules: [
      { num: '01', title: 'Advanced Routing', desc: 'OSPF, EIGRP and BGP at enterprise scale.' },
      { num: '02', title: 'Enterprise Design', desc: 'Campus architecture, redundancy and QoS.' },
      { num: '03', title: 'Secure Access', desc: 'Identity, segmentation and policy enforcement.' },
    ],
  },
  {
    id: 3, title: 'CyberOps Associate', code: 'SEC', category: 'Cybersecurity', totalHours: 96,
    modules: [
      { num: '01', title: 'Security Operations Foundations', desc: 'SOC roles, CIA triad, threat landscape.' },
      { num: '02', title: 'Network Defence & Monitoring', desc: 'Packet analysis, IDS/IPS, SIEM correlation.' },
      { num: '03', title: 'Endpoint Security & Cryptography', desc: 'OS hardening, keys, certificates.' },
      { num: '04', title: 'Forensics & Incident Response', desc: 'Log collection, malware analysis, post-mortem.' },
    ],
  },
]

export const batches: Batch[] = [
  { id: 1001, courseId: 1, batchCode: 'CTC-CCNA-2601', trainerId: 104, startDate: '2026-08-02', endDate: '2026-08-19', startTime: '10:00', endTime: '14:00', totalHours: 48, status: 'active' },
  { id: 1002, courseId: 3, batchCode: 'CTC-SEC-2602', trainerId: 105, startDate: '2026-09-01', endDate: '2026-10-02', startTime: '09:00', endTime: '13:00', totalHours: 96, status: 'upcoming' },
  { id: 1003, courseId: 2, batchCode: 'CTC-CCNP-2603', trainerId: 104, startDate: '2026-10-15', endDate: '2026-11-23', startTime: '17:00', endTime: '20:00', totalHours: 80, status: 'upcoming' },
]

export const enrollments: Enrollment[] = [
  { id: 501, learnerId: 101, batchId: 1001, progress: 65 },
  { id: 502, learnerId: 102, batchId: 1001, progress: 100 },
  { id: 503, learnerId: 103, batchId: 1001, progress: 45 },
]

/** key: `${learnerId}_${batchId}_${YYYY-MM-DD}` */
export const attendanceDb: Record<string, AttendanceCode> = {
  '101_1001_2026-08-02': 'P',
  '101_1001_2026-08-03': 'L1',
  '101_1001_2026-08-04': 'P',
  '101_1001_2026-08-05': 'L2',
  '101_1001_2026-08-06': 'P',
  '102_1001_2026-08-02': 'P',
  '102_1001_2026-08-03': 'P',
  '102_1001_2026-08-04': 'P',
  '102_1001_2026-08-05': 'P',
  '102_1001_2026-08-06': 'P',
  '103_1001_2026-08-02': 'P',
  '103_1001_2026-08-03': 'A',
  '103_1001_2026-08-04': 'P',
  '103_1001_2026-08-05': 'L3',
  '103_1001_2026-08-06': 'A',
}

/** key: `${learnerId}_${batchId}_${pre|act|mid|post}` */
export const gradebook: Record<string, number> = {
  '101_1001_pre': 80, '101_1001_act': 90, '101_1001_mid': 75,
  '102_1001_pre': 88, '102_1001_act': 94, '102_1001_mid': 91, '102_1001_post': 93,
  '103_1001_pre': 65, '103_1001_act': 58, '103_1001_mid': 61,
}

export const holidays: Record<string, string> = {
  '2026-05-01': 'Labour Day',
  '2026-12-16': 'National Day',
}

export const sessionDates = ['2026-08-02', '2026-08-03', '2026-08-04', '2026-08-05', '2026-08-06']

/* ---------------------------- helpers ---------------------------- */

export const fullName = (u: User) => `${u.firstName} ${u.lastName}`
export const initials = (u: User) =>
  `${u.firstName.replace(/[^A-Za-z]/g, '').charAt(0)}${u.lastName.charAt(0)}`.toUpperCase()

export const getUser = (id: number) => users.find((u) => u.id === id)!
export const getCourse = (id: number) => courses.find((c) => c.id === id)!
export const getBatch = (id: number) => batches.find((b) => b.id === id)!

export const learnersInBatch = (batchId: number) =>
  enrollments.filter((e) => e.batchId === batchId).map((e) => ({ ...e, user: getUser(e.learnerId) }))

/** Attendance percentage for one learner in one batch (points based). */
export function attendancePct(learnerId: number, batchId: number) {
  const marks = sessionDates
    .map((d) => attendanceDb[`${learnerId}_${batchId}_${d}`])
    .filter(Boolean) as AttendanceCode[]
  if (!marks.length) return 0
  const earned = marks.reduce((s, m) => s + ATTENDANCE_META[m].points, 0)
  return Math.round((earned / (marks.length * 2)) * 100)
}

/** Overall attendance across a batch. */
export function batchAttendancePct(batchId: number) {
  const rows = learnersInBatch(batchId)
  if (!rows.length) return 0
  return Math.round(rows.reduce((s, r) => s + attendancePct(r.learnerId, batchId), 0) / rows.length)
}

/** Average of all recorded grades for a learner in a batch. */
export function averageGrade(learnerId: number, batchId: number) {
  const keys = ['pre', 'act', 'mid', 'post']
    .map((k) => gradebook[`${learnerId}_${batchId}_${k}`])
    .filter((v) => typeof v === 'number') as number[]
  if (!keys.length) return null
  return Math.round(keys.reduce((a, b) => a + b, 0) / keys.length)
}
