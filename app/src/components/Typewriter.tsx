import { useEffect, useState, type ReactNode } from 'react'

type Seg = { text: string; className?: string }

/**
 * Types out a sequence of text segments letter-by-letter, every time it mounts.
 * Each segment can carry its own className (e.g. a coloured accent word).
 * A blinking caret follows the text while typing.
 */
export default function Typewriter({ segments, speed = 45 }: { segments: Seg[]; speed?: number }) {
  // total characters across all segments
  const full = segments.map((s) => s.text).join('')
  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount(0)
    let i = 0
    const id = setInterval(() => {
      i++
      setCount(i)
      if (i >= full.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [full, speed])

  // render the first `count` characters, keeping per-segment styling
  const out: ReactNode[] = []
  let used = 0
  for (let s = 0; s < segments.length; s++) {
    const seg = segments[s]
    if (used >= count) break
    const take = Math.min(seg.text.length, count - used)
    const shown = seg.text.slice(0, take)
    out.push(
      <span key={s} className={seg.className}>
        {shown}
      </span>,
    )
    used += seg.text.length
  }

  const done = count >= full.length

  return (
    <>
      {out}
      <span
        className={`ml-0.5 inline-block w-[3px] -translate-y-[2px] self-stretch bg-emerald-400 align-middle ${
          done ? 'animate-pulse' : ''
        }`}
        style={{ height: '0.9em' }}
        aria-hidden="true"
      />
    </>
  )
}
