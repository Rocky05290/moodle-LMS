import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

/* --------------------- animated number counter -------------------- */
export function useCountUp(target: number, duration = 900) {
  const [n, setN] = useState(0)
  const raf = useRef(0)
  useEffect(() => {
    const start = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      // easeOutCubic
      setN(target * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])
  return n
}

function AnimatedValue({ value }: { value: string | number }) {
  const str = String(value)
  const num = parseFloat(str.replace(/[^\d.]/g, ''))
  const isNumeric = !Number.isNaN(num)
  const n = useCountUp(isNumeric ? num : 0)
  if (!isNumeric) return <>{value}</>
  const suffix = str.replace(/[\d.,]/g, '')
  return (
    <>
      {Math.round(n)}
      {suffix}
    </>
  )
}

/* ----------------------------- Card ----------------------------- */
export function Card({
  children,
  className = '',
  hover = false,
  reveal = false,
  delay,
}: {
  children: ReactNode
  className?: string
  hover?: boolean
  reveal?: boolean
  delay?: 1 | 2 | 3 | 4 | 5 | 6
}) {
  return (
    <div
      className={`panel rounded-xl ${hover ? 'tilt3d' : ''} ${reveal ? 'reveal' : ''} ${
        delay ? `d${delay}` : ''
      } ${className}`}
    >
      {children}
    </div>
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
  delay,
}: {
  icon: ReactNode
  value: string | number
  label: string
  delta?: string
  delay?: 1 | 2 | 3 | 4 | 5 | 6
}) {
  return (
    <Card hover reveal delay={delay} className="group relative overflow-hidden p-5">
      <div className="flex items-start justify-between">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-500 transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
        {delta && <span className="text-[11.5px] font-bold text-ok-600">{delta}</span>}
      </div>
      <div className="mt-4 text-[26px] leading-none font-extrabold tracking-tight text-navy-900">
        <AnimatedValue value={value} />
      </div>
      <div className="mt-1.5 text-[12px] font-semibold text-ink-500">{label}</div>
      {/* sheen sweep on hover */}
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-brand-500/6 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
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
  const v = useCountUp(value, 1100)
  const tone = value >= 80 ? 'bg-ok-600' : value >= 50 ? 'bg-brand-500' : 'bg-bad-600'
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-soft2 ${className}`}>
      <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.min(100, v)}%` }} />
    </div>
  )
}

/* ----------------------------- Avatar --------------------------- */
export function Avatar({ text, size = 34 }: { text: string; size?: number }) {
  return (
    <span
      className="inline-flex flex-none items-center justify-center rounded-full bg-brand-50 font-bold text-brand-600 ring-1 ring-brand-500/12 transition-transform duration-200 hover:scale-110"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {text}
    </span>
  )
}

/* ---------------------------- Ring ------------------------------ */
export function Ring({ value, size = 46 }: { value: number; size?: number }) {
  const v = useCountUp(value, 1200)
  return (
    <div
      className="flex flex-none items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(var(--color-brand-500) ${v}%, var(--color-soft2) 0)`,
      }}
    >
      <div
        className="flex items-center justify-center rounded-full bg-surface font-extrabold text-navy-900"
        style={{ width: size - 9, height: size - 9, fontSize: size * 0.24 }}
      >
        {Math.round(v)}%
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
    primary: 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm hover:shadow-lg hover:shadow-brand-500/25',
    ghost: 'border border-line2 bg-surface hover:bg-soft text-ink-700',
    gold: 'bg-gold-500 hover:bg-gold-600 text-white shadow-sm hover:shadow-lg hover:shadow-gold-500/25',
  }[variant]
  return (
    <button
      type={type}
      onClick={onClick}
      className={`cursor-pointer rounded-lg px-4 py-2.5 text-[13px] font-bold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[.98] ${styles} ${className}`}
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
