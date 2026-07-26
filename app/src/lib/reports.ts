import { jsPDF } from 'jspdf'

/* ------------------------------------------------------------------ */
/*  Shared drawing helpers                                            */
/* ------------------------------------------------------------------ */
type Align = 'left' | 'center' | 'right'
type Col = { header: string; width: number; align?: Align }

function pageHeader(doc: jsPDF, W: number, title: string, sub: string): number {
  doc.setFillColor(31, 77, 192)
  doc.rect(0, 0, W, 6, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(31, 77, 192)
  doc.setFontSize(13)
  doc.text('CORDOBA TRAINING CENTER', 40, 36)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120, 130, 150)
  doc.setFontSize(8.5)
  doc.text('Tamkeen-registered training provider  ·  Kingdom of Bahrain', 40, 50)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(11, 20, 40)
  doc.setFontSize(15)
  doc.text(title, 40, 80)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(90, 100, 120)
  doc.setFontSize(9.5)
  doc.text(sub, 40, 96)
  doc.setDrawColor(220, 225, 235)
  doc.setLineWidth(1)
  doc.line(40, 106, W - 40, 106)
  return 130
}

function cellX(x: number, c: Col): number {
  return c.align === 'right' ? x + c.width - 5 : c.align === 'center' ? x + c.width / 2 : x + 5
}

function drawTable(doc: jsPDF, startX: number, startY: number, cols: Col[], rows: (string | number)[][]): number {
  const totalW = cols.reduce((s, c) => s + c.width, 0)
  const rowH = 19
  let y = startY

  // header
  doc.setFillColor(238, 244, 255)
  doc.rect(startX, y - 13, totalW, 19, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(31, 77, 192)
  doc.setFontSize(8.5)
  let x = startX
  cols.forEach((c) => {
    doc.text(c.header, cellX(x, c), y - 1, { align: c.align ?? 'left' })
    x += c.width
  })
  y += 12

  // body
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(40, 50, 70)
  doc.setFontSize(8.5)
  const H = doc.internal.pageSize.getHeight()
  rows.forEach((r, i) => {
    if (y > H - 70) {
      doc.addPage()
      y = 70
    }
    if (i % 2 === 1) {
      doc.setFillColor(249, 250, 253)
      doc.rect(startX, y - 12, totalW, rowH, 'F')
    }
    let cxp = startX
    r.forEach((cell, ci) => {
      const c = cols[ci]
      doc.text(String(cell), cellX(cxp, c), y, { align: c.align ?? 'left' })
      cxp += c.width
    })
    y += rowH
  })

  doc.setDrawColor(220, 225, 235)
  doc.setLineWidth(0.6)
  doc.line(startX, y - 12, startX + totalW, y - 12)
  return y
}

/* ------------------------------------------------------------------ */
/*  1) Official attendance register                                   */
/* ------------------------------------------------------------------ */
export type RegisterInfo = {
  batchCode: string
  courseTitle: string
  dateRange: string
  trainer: string
  totalHours: number
  sessions: number
}
export type RegisterRow = {
  name: string
  cpr: string
  present: number
  late: number
  absent: number
  pct: number
  hours: number
}

export function downloadAttendanceRegister(info: RegisterInfo, rows: RegisterRow[]) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  let y = pageHeader(doc, W, 'Official Attendance Register', `${info.batchCode}  ·  ${info.courseTitle}  ·  ${info.dateRange}`)

  doc.setFontSize(9)
  doc.setTextColor(90, 100, 120)
  doc.text(
    `Trainer: ${info.trainer}      Sessions recorded: ${info.sessions}      Contracted hours: ${info.totalHours}`,
    40,
    y - 8,
  )
  y += 6

  const cols: Col[] = [
    { header: '#', width: 26, align: 'center' },
    { header: 'Learner', width: 175, align: 'left' },
    { header: 'CPR', width: 92, align: 'left' },
    { header: 'Present', width: 58, align: 'center' },
    { header: 'Late', width: 48, align: 'center' },
    { header: 'Absent', width: 54, align: 'center' },
    { header: 'Attendance', width: 74, align: 'center' },
    { header: 'Hours', width: 52, align: 'center' },
    { header: 'Signature', width: 130, align: 'left' },
  ]
  const tableRows = rows.map((r, i) => [i + 1, r.name, r.cpr || '—', r.present, r.late, r.absent, `${r.pct}%`, r.hours, ''])
  y = drawTable(doc, 40, y, cols, tableRows)

  doc.setFontSize(8)
  doc.setTextColor(120, 130, 150)
  doc.text(
    'Legend:  P = Present (2)   L1 = Late 5m (1.5)   L2 = Late 10m (1)   L3 = Late 15m (0.5)   A = Absent (0)',
    40,
    y + 10,
  )
  doc.setDrawColor(180, 190, 205)
  doc.setLineWidth(0.8)
  doc.line(W - 250, y + 44, W - 40, y + 44)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(60, 70, 90)
  doc.text('Trainer signature & date', W - 145, y + 58, { align: 'center' })

  doc.save(`Attendance_Register_${info.batchCode}.pdf`)
}

/* ------------------------------------------------------------------ */
/*  2) Tamkeen compliance report                                      */
/* ------------------------------------------------------------------ */
export type ComplianceInfo = {
  batchCode: string
  courseTitle: string
  dateRange: string
  totalHours: number
  avgAttendance: number
  eligibleCount: number
  learnerCount: number
}
export type ComplianceRow = {
  name: string
  cpr: string
  company: string
  pct: number
  avg: number | null
  hours: number
  eligible: boolean
}

export function downloadComplianceReport(info: ComplianceInfo, rows: ComplianceRow[]) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  let y = pageHeader(doc, W, 'Tamkeen Compliance Report', `${info.batchCode}  ·  ${info.courseTitle}  ·  ${info.dateRange}`)

  // summary chips
  const chips: [string, string][] = [
    ['Learners', String(info.learnerCount)],
    ['Contracted hours', String(info.totalHours)],
    ['Avg attendance', `${info.avgAttendance}%`],
    ['Certificate-eligible', `${info.eligibleCount}/${info.learnerCount}`],
  ]
  let cxp = 40
  chips.forEach(([k, v]) => {
    doc.setFillColor(247, 249, 253)
    doc.setDrawColor(224, 230, 240)
    doc.roundedRect(cxp, y - 12, 165, 40, 5, 5, 'FD')
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(120, 130, 150)
    doc.setFontSize(8)
    doc.text(k.toUpperCase(), cxp + 12, y + 2)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(31, 77, 192)
    doc.setFontSize(15)
    doc.text(v, cxp + 12, y + 20)
    cxp += 178
  })
  y += 52

  const cols: Col[] = [
    { header: '#', width: 24, align: 'center' },
    { header: 'Learner', width: 155, align: 'left' },
    { header: 'CPR', width: 84, align: 'left' },
    { header: 'Company / Sponsor', width: 130, align: 'left' },
    { header: 'Attendance', width: 74, align: 'center' },
    { header: 'Avg Grade', width: 66, align: 'center' },
    { header: 'Hours', width: 50, align: 'center' },
    { header: 'Certificate', width: 80, align: 'center' },
  ]
  const tableRows = rows.map((r, i) => [
    i + 1,
    r.name,
    r.cpr || '—',
    r.company || '—',
    `${r.pct}%`,
    r.avg ?? '—',
    r.hours,
    r.eligible ? 'ELIGIBLE' : 'PENDING',
  ])
  y = drawTable(doc, 40, y, cols, tableRows)

  doc.setFontSize(8)
  doc.setTextColor(120, 130, 150)
  doc.text('Certificate eligibility: attendance ≥ 75% and average grade ≥ 60%.', 40, y + 10)
  doc.setDrawColor(180, 190, 205)
  doc.setLineWidth(0.8)
  doc.line(W - 250, y + 44, W - 40, y + 44)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(60, 70, 90)
  doc.text('Authorised signature & stamp', W - 145, y + 58, { align: 'center' })

  doc.save(`Compliance_Report_${info.batchCode}.pdf`)
}

/* ------------------------------------------------------------------ */
/*  3) CSV export                                                     */
/* ------------------------------------------------------------------ */
export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
  const csv = [headers.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))].join('\r\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
