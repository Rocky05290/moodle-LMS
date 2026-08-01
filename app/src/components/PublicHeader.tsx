import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useScrolled } from '../hooks'

const LINKS = [
  { label: 'Home', href: '#top' },
  { label: 'Capabilities', href: '#features' },
  { label: 'Compliance', href: '#compliance' },
  { label: 'FAQ', href: '#faq' },
]

/**
 * Dark public header (FundedRight-style):
 *  - a slim announcement bar pinned to the very top
 *  - a floating rounded "pill" navbar with centred links + Log in / CTA
 * Fully responsive: the pill collapses to a hamburger menu on small screens.
 */
export default function PublicHeader() {
  const scrolled = useScrolled(30)
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed inset-x-0 top-0 z-50">
      {/* announcement bar */}
      <div className="bg-black/90 py-2 text-center text-[10.5px] font-bold tracking-[0.12em] text-white/70 uppercase backdrop-blur sm:text-[11.5px]">
        <span className="mx-2">
          One core database · <span className="text-gold-400">Five role portals</span>
        </span>
        <span className="mx-2 hidden sm:inline">/</span>
        <span className="mx-2 hidden sm:inline">
          <span className="text-gold-400">Tamkeen</span>-ready compliance
        </span>
        <span className="mx-2 hidden md:inline">/</span>
        <span className="mx-2 hidden md:inline">Kingdom of Bahrain</span>
      </div>

      {/* floating pill navbar */}
      <div className="px-3 pt-3 sm:px-5 sm:pt-4">
        <nav
          className={`mx-auto flex max-w-6xl items-center gap-4 rounded-full border px-4 py-2.5 transition-all sm:px-6 ${
            scrolled
              ? 'border-white/10 bg-navy-950/85 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.7)] backdrop-blur-xl'
              : 'border-white/10 bg-white/[0.04] backdrop-blur-md'
          }`}
        >
          {/* logo */}
          <a href="#top" className="flex items-center">
            <img
              src="/logo.png"
              alt="Cordoba Training Center"
              className="h-8 w-auto brightness-0 invert sm:h-9"
            />
          </a>

          {/* desktop links — centred */}
          <div className="mx-auto hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="rounded-full px-4 py-2 text-[13px] font-semibold text-white/70 transition-colors hover:bg-white/8 hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* right actions */}
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Link
              to="/login"
              className="hidden rounded-full border border-white/20 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-white/8 sm:inline-flex"
            >
              Log in
            </Link>
            <Link
              to="/login"
              className="rounded-full bg-gold-400 px-4 py-2 text-[13px] font-bold text-navy-950 transition-all hover:-translate-y-0.5 hover:bg-gold-300 sm:px-5"
            >
              Get started
            </Link>

            {/* mobile toggle */}
            <button
              onClick={() => setOpen((v) => !v)}
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-full text-white lg:hidden"
              aria-label="Menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* mobile menu */}
        {open && (
          <div className="mx-auto mt-2 max-w-6xl rounded-2xl border border-white/10 bg-navy-950/95 p-2 backdrop-blur-xl lg:hidden">
            {LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-2.5 text-[14px] font-semibold text-white/80 hover:bg-white/8 hover:text-white"
              >
                {l.label}
              </a>
            ))}
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="mt-1 block rounded-xl px-4 py-2.5 text-[14px] font-semibold text-gold-400 hover:bg-white/8 sm:hidden"
            >
              Log in
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
