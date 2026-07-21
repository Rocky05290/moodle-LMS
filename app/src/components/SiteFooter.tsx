import { Globe, MessageCircle, Video, Mail, LifeBuoy, FileText, Code2 } from 'lucide-react'

const COMPANY = ['Home', 'Product', 'Solutions', 'Compliance', 'Pricing', 'Contact']
const RESOURCES = [
  { icon: LifeBuoy, label: 'Support' },
  { icon: FileText, label: 'Documentation' },
  { icon: Code2, label: 'Developer API' },
  { icon: Mail, label: 'Contact us' },
]
const SOCIAL = [
  { icon: Globe, label: 'Website' },
  { icon: MessageCircle, label: 'X / Twitter' },
  { icon: Video, label: 'YouTube' },
]
const TAGS = ['Attendance', 'Compliance', 'Batches', 'Grading', 'Reporting', 'Tamkeen']

export default function SiteFooter() {
  return (
    <footer className="bg-navy-950 text-white/70">
      {/* thin colour accent bar */}
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <div className="ml-auto flex h-1.5 w-64 overflow-hidden rounded-full">
          <span className="flex-1 bg-sky-400" />
          <span className="flex-1 bg-violet-400" />
          <span className="flex-1 bg-amber-400" />
          <span className="flex-1 bg-emerald-400" />
        </div>
      </div>

      {/* main */}
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] lg:px-8">
        {/* brand */}
        <div>
          <span className="inline-flex items-center rounded-md bg-white px-3 py-2 shadow-sm">
            <img src="/logo.png" alt="Cordoba Training Center" className="h-7 w-auto" />
          </span>
          <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-white/50">
            The Tamkeen-ready platform for training providers — batches, attendance, grading and
            audit-proof compliance reporting in one place.
          </p>
          <div className="mt-5 flex gap-2.5">
            {SOCIAL.map((s) => {
              const Icon = s.icon
              return (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-white/12 bg-white/5 text-white/70 transition-all hover:border-white/25 hover:bg-white/10 hover:text-white"
                >
                  <Icon size={16} />
                </a>
              )
            })}
          </div>
        </div>

        {/* company */}
        <div>
          <h4 className="text-[11px] font-bold tracking-[0.12em] text-white/40 uppercase">Company</h4>
          <ul className="mt-4 space-y-2.5">
            {COMPANY.map((c) => (
              <li key={c}>
                <a href="#" className="text-[13px] text-white/60 transition-colors hover:text-white">
                  {c}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* resources */}
        <div>
          <h4 className="text-[11px] font-bold tracking-[0.12em] text-white/40 uppercase">
            Resources
          </h4>
          <ul className="mt-4 space-y-2.5">
            {RESOURCES.map((r) => {
              const Icon = r.icon
              return (
                <li key={r.label}>
                  <a
                    href="#"
                    className="flex items-center gap-2.5 text-[13px] text-white/60 transition-colors hover:text-white"
                  >
                    <Icon size={14} className="text-white/40" />
                    {r.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </div>

        {/* insights panel */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h4 className="text-[11px] font-bold tracking-[0.12em] text-white/50 uppercase">
            Explore by topic
          </h4>
          <div className="mt-4 flex flex-wrap gap-2">
            {TAGS.map((t) => (
              <a
                key={t}
                href="#"
                className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] font-semibold text-white/60 transition-all hover:border-white/25 hover:text-white"
              >
                {t}
              </a>
            ))}
          </div>
          <div className="mt-5 border-t border-white/10 pt-4">
            <div className="text-[11px] font-bold tracking-[0.1em] text-white/40 uppercase">
              Runs on
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] font-semibold text-white/45">
              <span>Supabase</span>
              <span>·</span>
              <span>Cloudflare R2</span>
              <span>·</span>
              <span>React</span>
            </div>
          </div>
        </div>
      </div>

      {/* bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-5 lg:px-8">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {['Compliance', 'Privacy', 'Terms', 'Trademark'].map((l) => (
              <a
                key={l}
                href="#"
                className="text-[12px] font-semibold text-white/45 transition-colors hover:text-white"
              >
                {l}
              </a>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2 text-[12px] text-white/50">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_var(--color-emerald-400)]" />
            All systems operational
          </div>
          <div className="text-[12px] text-white/40">© 2026 Cordoba Training Center</div>
        </div>
      </div>
    </footer>
  )
}
