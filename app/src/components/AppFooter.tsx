/**
 * Compact single-row footer for the logged-in app pages (NOT the landing).
 * Just a status dot and the copyright — keeps app screens tall for content
 * instead of a big marketing footer.
 */
export default function AppFooter() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-navy-950">
      <div className="mx-auto flex max-w-full flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4 lg:px-7">
        <span className="flex items-center gap-2 text-[12px] text-white/50">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_var(--color-emerald-400,#34d399)]" />
          All systems operational
        </span>
        <span className="ml-auto text-[12px] text-white/40">© 2026 Cordoba Training Center</span>
      </div>
    </footer>
  )
}
