import { useEffect, useRef, useState } from 'react'

/**
 * Animates a number from 0 up to its target every time it scrolls into view.
 * Accepts values like "5", "100%", "1-click", "Sun–Thu" — only the leading
 * number is counted; any prefix/suffix text is preserved.
 */
export default function CountUp({ value, duration = 1600 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(value)

  // split "100%" -> { num: 100, suffix: "%" }, or "Sun–Thu" -> num: null
  const match = value.match(/^(\d+)(.*)$/)
  const target = match ? Number(match[1]) : null
  const suffix = match ? match[2] : ''

  useEffect(() => {
    // if there's no leading number, just show the text as-is
    if (target === null) {
      setDisplay(value)
      return
    }
    const el = ref.current
    if (!el) return

    let raf = 0
    let started = false
    const run = (startTs: number) => {
      const step = (ts: number) => {
        const t = Math.min(1, (ts - startTs) / duration)
        // ease-out so it slows toward the end
        const eased = 1 - Math.pow(1 - t, 3)
        setDisplay(`${Math.round(eased * target)}${suffix}`)
        if (t < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    }

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started) {
            started = true
            setDisplay(`0${suffix}`)
            requestAnimationFrame((ts) => run(ts))
            obs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [value, target, suffix, duration])

  return <span ref={ref}>{display}</span>
}
