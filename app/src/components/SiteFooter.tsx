import {
  Globe, MessageCircle, Video, CalendarCheck, ClipboardCheck, BarChart3, FileCheck2, ShieldCheck,
} from 'lucide-react'

const PLATFORM = [
  'Admin Dashboard',
  'Trainer Portal',
  'Learner Portal',
  'Auditor Access',
  'Batch Management',
  'Course Inventory',
]

const FEATURES = [
  { icon: CalendarCheck, label: 'Attendance & QR check-in' },
  { icon: ClipboardCheck, label: 'Rubric grading' },
  { icon: BarChart3, label: 'Batch Health reports' },
  { icon: FileCheck2, label: 'Tamkeen compliance' },
  { icon: ShieldCheck, label: 'Audit trail' },
]

const SOCIAL = [
  { icon: Globe, label: 'Website' },
  { icon: MessageCircle, label: 'X / Twitter' },
  { icon: Video, label: 'YouTube' },
]

export default function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-navy-950 text-[#c2c0c7]">
      {/* thin gold accent bar */}
      <div className="mx-auto px-5 lg:px-16 xl:px-24">
        <div className="ml-auto flex h-1.5 w-64 overflow-hidden rounded-full opacity-80">
          <span className="flex-1 bg-gold-400" />
          <span className="flex-1 bg-gold-500" />
        </div>
      </div>

      {/* main */}
      <div className="mx-auto grid gap-8 px-5 py-9 lg:grid-cols-[1.7fr_1fr_1.1fr] lg:px-16 xl:px-24">
        {/* brand */}
        <div>
          <img
            src="/logo.png"
            alt="Cordoba Training Center"
            className="h-9 w-auto"
            style={{
              filter:
                'brightness(0) saturate(100%) invert(78%) sepia(38%) saturate(560%) hue-rotate(96deg) brightness(94%) contrast(90%)',
            }}
          />
          <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-[#c2c0c7]/75">
            The Tamkeen-ready platform for training providers — attendance, grading and audit-proof
            compliance in one place.
          </p>
          <div className="mt-4 flex gap-2.5">
            {SOCIAL.map((s) => {
              const Icon = s.icon
              return (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-white/12 bg-white/5 text-[#c2c0c7] transition-all hover:border-white/25 hover:bg-white/10 hover:text-gold-400"
                >
                  <Icon size={16} />
                </a>
              )
            })}
          </div>
        </div>

        {/* platform */}
        <div>
          <h4 className="text-[11px] font-bold tracking-[0.12em] text-[#c2c0c7]/55 uppercase">
            Platform
          </h4>
          <ul className="mt-3 space-y-2">
            {PLATFORM.map((c) => (
              <li key={c}>
                <a href="#" className="text-[13px] text-[#c2c0c7]/85 transition-colors hover:text-gold-400">
                  {c}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* features */}
        <div>
          <h4 className="text-[11px] font-bold tracking-[0.12em] text-[#c2c0c7]/55 uppercase">
            Features
          </h4>
          <ul className="mt-3 space-y-2">
            {FEATURES.map((r) => {
              const Icon = r.icon
              return (
                <li key={r.label}>
                  <a
                    href="#"
                    className="flex items-center gap-2.5 text-[13px] text-[#c2c0c7]/85 transition-colors hover:text-gold-400"
                  >
                    <Icon size={14} className="text-[#c2c0c7]/55" />
                    {r.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </div>

      </div>

      {/* bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4 lg:px-16 xl:px-24">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {['Compliance', 'Privacy', 'Terms', 'Trademark'].map((l) => (
              <a
                key={l}
                href="#"
                className="text-[12px] font-semibold text-[#c2c0c7] transition-colors hover:text-gold-400"
              >
                {l}
              </a>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2 text-[12px] text-[#c2c0c7]">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_var(--color-emerald-400)]" />
            All systems operational
          </div>
          <div className="text-[12px] text-[#c2c0c7]">© 2026 Cordoba Training Center</div>
        </div>
      </div>
    </footer>
  )
}
