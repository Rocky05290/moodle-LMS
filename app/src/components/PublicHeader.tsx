import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useScrolled } from '../hooks'

const LINKS = ['Solutions', 'Product', 'Compliance', 'Pricing', 'About']

export default function PublicHeader() {
  const scrolled = useScrolled(40)
  const [open, setOpen] = useState(false)

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-line bg-white py-6 shadow-[0_4px_20px_-8px_rgba(15,27,53,0.25)]'
          : 'border-b border-transparent bg-transparent py-10'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-5 lg:px-8">
        {/* logo — always on a white chip so it reads on any background */}
        <a href="#top" className="flex items-center">
          <span className="inline-flex items-center rounded-md bg-white px-4 py-2.5 shadow-sm ring-1 ring-black/5">
            <img src="/logo.png" alt="Cordoba Training Center" className="h-12 w-auto" />
          </span>
        </a>

        {/* desktop nav — right aligned */}
        <nav className="ml-auto hidden items-center gap-1.5 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l}
              href="#top"
              className={`rounded-md px-4 py-2 text-[22.5px] font-semibold transition-colors ${
                scrolled ? 'text-ink-700 hover:bg-soft2' : 'text-white/85 hover:bg-white/10'
              }`}
            >
              {l}
            </a>
          ))}
        </nav>

        {/* mobile toggle — right aligned */}
        <button
          onClick={() => setOpen((v) => !v)}
          className={`ml-auto flex h-9 w-9 items-center justify-center rounded-md lg:hidden ${
            scrolled ? 'text-ink-700' : 'text-white'
          }`}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* mobile menu */}
      {open && (
        <div className="mx-4 mt-2 rounded-lg border border-line bg-white p-2 shadow-lg lg:hidden">
          {LINKS.map((l) => (
            <a
              key={l}
              href="#top"
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2.5 text-[13.5px] font-semibold text-ink-700 hover:bg-soft2"
            >
              {l}
            </a>
          ))}
        </div>
      )}
    </header>
  )
}
