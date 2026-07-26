import { jsPDF } from 'jspdf'

export type CertInfo = {
  learnerName: string
  courseTitle: string
  batchCode: string
  hours: number
  date: string // completion date, 'YYYY-MM-DD'
  cpr?: string
}

const prettyDate = (d: string) => {
  try {
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return d
  }
}

/** Generate and download a landscape A4 PDF certificate. */
export function downloadCertificate(c: CertInfo) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const cx = W / 2

  // white background
  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, W, H, 'F')

  // top accent bands (brand blue + gold)
  doc.setFillColor(31, 77, 192)
  doc.rect(0, 0, W, 10, 'F')
  doc.setFillColor(201, 138, 6)
  doc.rect(0, 10, W, 3, 'F')

  // decorative borders
  doc.setDrawColor(31, 77, 192)
  doc.setLineWidth(2.5)
  doc.rect(28, 28, W - 56, H - 56)
  doc.setDrawColor(201, 138, 6)
  doc.setLineWidth(0.8)
  doc.rect(38, 38, W - 76, H - 76)

  // brand header
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(31, 77, 192)
  doc.setFontSize(15)
  doc.text('CORDOBA TRAINING CENTER', cx, 92, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120, 130, 150)
  doc.setFontSize(9.5)
  doc.text('TAMKEEN-REGISTERED TRAINING PROVIDER  ·  KINGDOM OF BAHRAIN', cx, 108, { align: 'center' })

  // title
  doc.setFont('times', 'bold')
  doc.setTextColor(11, 20, 40)
  doc.setFontSize(34)
  doc.text('Certificate of Completion', cx, 168, { align: 'center' })

  // "this is to certify that"
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.setFontSize(12)
  doc.text('This is to certify that', cx, 206, { align: 'center' })

  // learner name
  doc.setFont('times', 'bolditalic')
  doc.setTextColor(31, 77, 192)
  doc.setFontSize(30)
  doc.text(c.learnerName, cx, 250, { align: 'center' })
  const nameW = doc.getTextWidth(c.learnerName)
  const half = Math.max(nameW / 2, 120) + 24
  doc.setDrawColor(220, 225, 235)
  doc.setLineWidth(1)
  doc.line(cx - half, 262, cx + half, 262)

  // body
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 70, 90)
  doc.setFontSize(12)
  doc.text('has successfully completed the training programme', cx, 294, { align: 'center' })

  // course title
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(11, 20, 40)
  doc.setFontSize(18)
  doc.text(c.courseTitle, cx, 324, { align: 'center' })

  // detail line
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.setFontSize(11)
  doc.text(
    `Batch ${c.batchCode}    ·    ${c.hours} training hours    ·    Completed ${prettyDate(c.date)}`,
    cx,
    350,
    { align: 'center' },
  )
  if (c.cpr) {
    doc.setFontSize(9.5)
    doc.setTextColor(140, 150, 165)
    doc.text(`CPR: ${c.cpr}`, cx, 366, { align: 'center' })
  }

  // signature lines
  const y = H - 96
  doc.setDrawColor(180, 190, 205)
  doc.setLineWidth(0.8)
  doc.line(120, y, 300, y)
  doc.line(W - 300, y, W - 120, y)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(60, 70, 90)
  doc.setFontSize(10)
  doc.text('Lead Trainer', 210, y + 16, { align: 'center' })
  doc.text('Training Director', W - 210, y + 16, { align: 'center' })

  // verification seal
  doc.setDrawColor(201, 138, 6)
  doc.setLineWidth(1.5)
  doc.circle(cx, y + 4, 27)
  doc.setLineWidth(0.6)
  doc.circle(cx, y + 4, 22)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(201, 138, 6)
  doc.text('CORDOBA', cx, y + 1, { align: 'center' })
  doc.text('VERIFIED', cx, y + 10, { align: 'center' })

  const safe = c.learnerName.replace(/[^a-z0-9]+/gi, '_')
  doc.save(`Certificate_${safe}_${c.batchCode}.pdf`)
}
