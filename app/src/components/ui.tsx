import type { ReactNode } from 'react'

/* ----------------------------- Card ----------------------------- */
export function Card({
  children,
  className = '',
  hover = false,
}: {
  children: ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <div className={`panel rounded-xl ${hover ? 'panel-hover' : ''} ${className}`}>{children}</div>
  )
}

/* -------------------------- SectionTitle ------------------------- */
export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-[13.5px] font-bold tracking-tight text-navy-900">{children}</h2>
      {right}
    </div>
  )
}

/* ----------------------------- Stat ----------------------------- */
export function Stat({
  icon,
  value,
  label,
  delta,
}: {
  icon: ReactNode
  value: string | number
  label: string
  delta?: string
  delay?: 1 | 2 | 3 | 4 | 5 | 6
}) {
  return (
    <Card hover className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-500">
          {icon}
        </div>
        {delta && <span className="text-[11.5px] font-bold text-ok-600">{delta}</span>}
      </div>
      <div className="mt-4 text-[26px] leading-none font-extrabold tracking-tight text-navy-900">
        {value}
      </div>
      <div className="mt-1.5 text-[12px] font-semibold text-ink-500">{label}</div>
    </Card>
  )
}

/* ----------------------------- Badge ---------------------------- */
type Tone = 'ok' | 'warn' | 'bad' | 'brand' | 'gold' | 'muted'

const toneMap: Record<Tone, string> = {
  ok: 'bg-ok-50 text-ok-600 border-ok-600/15',
  warn: 'bg-warn-50 text-warn-600 border-warn-600/15',
  bad: 'bg-bad-50 text-bad-600 border-bad-600/15',
  brand: 'bg-brand-50 text-brand-600 border-brand-500/15',
  gold: 'bg-gold-100 text-gold-600 border-gold-500/20',
  muted: 'bg-soft2 text-ink-500 border-line',
}

export function Badge({ children, tone = 'muted' }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold ${toneMap[tone]}`}
    >
      {children}
    </span>
  )
}

/* --------------------------- ProgressBar ------------------------ */
export function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  const tone = value >= 80 ? 'bg-ok-600' : value >= 50 ? 'bg-brand-500' : 'bg-bad-600'
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-soft2 ${className}`}>
      <div
        className={`h-full rounded-full ${tone}`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}

/* ----------------------------- Avatar --------------------------- */
export function Avatar({ text, size = 34 }: { text: string; size?: number }) {
  return (
    <span
      className="inline-flex flex-none items-center justify-center rounded-full bg-brand-50 font-bold text-brand-600 ring-1 ring-brand-500/12"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {text}
    </span>
  )
}

/* ---------------------------- Ring ------------------------------ */
export function Ring({ value, size = 46 }: { value: number; size?: number }) {
  return (
    <div
      className="flex flex-none items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(var(--color-brand-500) ${value}%, var(--color-soft2) 0)`,
      }}
    >
      <div
        className="flex items-center justify-center rounded-full bg-surface font-extrabold text-navy-900"
        style={{ width: size - 9, height: size - 9, fontSize: size * 0.24 }}
      >
        {value}%
      </div>
    </div>
  )
}

/* ---------------------------- Button ---------------------------- */
export function Button({
  children,
  onClick,
  variant = 'primary',
  className = '',
  type = 'button',
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'ghost' | 'gold'
  className?: string
  type?: 'button' | 'submit'
}) {
  const styles = {
    primary: 'bg-brand-500 hover:bg-brand-600 text-white',
    ghost: 'border border-line2 bg-surface hover:bg-soft text-ink-700',
    gold: 'bg-gold-500 hover:bg-gold-600 text-white',
  }[variant]
  return (
    <button
      type={type}
      onClick={onClick}
      className={`cursor-pointer rounded-lg px-4 py-2.5 text-[13px] font-bold ${styles} ${className}`}
    >
      {children}
    </button>
  )
}

/* ----------------------------- Table ---------------------------- */
export function Th({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <th
      className={`border-b border-line bg-soft px-3 py-2.5 text-left text-[11px] font-bold tracking-wide text-ink-500 uppercase ${className}`}
    >
      {children}
    </th>
  )
}

export function Td({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <td className={`border-b border-line px-3 py-3 text-[13px] text-ink-700 ${className}`}>
      {children}
    </td>
  )
}
