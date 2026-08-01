import { useEffect, useState } from 'react'

/**
 * Premium 3D intro loader shown EVERY time the landing page mounts.
 * Pure CSS 3D (no library): a rotating gold cube + orbiting rings +
 * the Cordoba logo, a progress bar, then a smooth fade-out reveal.
 */
export default function LandingLoader() {
  const [progress, setProgress] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    // animate a fake progress to 100 over ~1.6s
    let p = 0
    const tick = setInterval(() => {
      p += Math.random() * 14 + 6
      if (p >= 100) {
        p = 100
        clearInterval(tick)
        setProgress(100)
        // start the fade-out, then unmount
        setTimeout(() => setLeaving(true), 350)
        setTimeout(() => setGone(true), 1150)
      } else {
        setProgress(Math.round(p))
      }
    }, 180)
    return () => clearInterval(tick)
  }, [])

  if (gone) return null

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-navy-950 transition-opacity duration-700 ${
        leaving ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      {/* ambient gold glow */}
      <div className="pointer-events-none absolute h-[420px] w-[420px] rounded-full bg-gold-400/10 blur-[120px]" />

      {/* 3D stage */}
      <div className="ld-scene">
        {/* orbiting rings */}
        <div className="ld-ring ld-ring--a" />
        <div className="ld-ring ld-ring--b" />
        <div className="ld-ring ld-ring--c" />

        {/* spinning cube */}
        <div className="ld-cube">
          <span className="ld-face ld-face--front" />
          <span className="ld-face ld-face--back" />
          <span className="ld-face ld-face--right" />
          <span className="ld-face ld-face--left" />
          <span className="ld-face ld-face--top" />
          <span className="ld-face ld-face--bottom" />
        </div>

        {/* logo floating in front */}
        <img src="/logo.png" alt="Cordoba" className="ld-logo" />
      </div>

      {/* brand + progress */}
      <div className="relative mt-14 flex flex-col items-center">
        <div className="text-[13px] font-bold tracking-[0.3em] text-white/70 uppercase">
          Cordoba Training Center
        </div>
        <div className="mt-4 h-1 w-56 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-400 transition-[width] duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2.5 text-[11px] font-semibold tracking-widest text-gold-400 tabular-nums">
          {progress}%
        </div>
      </div>
    </div>
  )
}
