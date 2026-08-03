import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Bell, Search, HelpCircle, ChevronDown } from 'lucide-react'
import type { User } from '../data/mock'
import { fullName, initials } from '../data/mock'
import { Badge } from './ui'
import AppFooter from './AppFooter'
import AppBgFx from './AppBgFx'
import LandingLoader from './LandingLoader'

export default function Layout({
  user,
  onSignOut,
  title,
  subtitle,
  children,
}: {
  user: User
  onSignOut: () => void
  title: string
  subtitle?: string
  children: ReactNode
}) {
  const navigate = useNavigate()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <div className="app-bg flex min-h-full">
      {/* 3D intro loader — plays once per session when entering the app (not on every click) */}
      <LandingLoader once="app-loaded" />

      {/* interactive animated background (demo look) — click to burst, move to repel */}
      <AppBgFx />

      {/* -------------------------- Main --------------------------- */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        {/* topbar */}
        <header className="sticky top-0 z-20 border-b border-white/10 bg-navy-950/55 px-5 py-3.5 backdrop-blur-xl lg:px-7">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Cordoba Training Center" className="h-7 w-auto brightness-0 invert" />

            <div className="min-w-0">
              <h1 className="truncate text-[18px] font-bold tracking-tight text-white">
                {title}
              </h1>
              {subtitle && <p className="mt-0.5 truncate text-[12.5px] text-white/55">{subtitle}</p>}
            </div>

            <div className="ml-auto flex items-center gap-2.5">
              <div className="hidden items-center gap-2.5 rounded-full border border-white/12 bg-white/5 px-4 py-2.5 transition-all focus-within:border-brand-400 focus-within:bg-white/10 md:flex">
                <Search size={15} className="text-white/40" />
                <input
                  placeholder="Search batch or learner…"
                  className="w-56 bg-transparent text-[12.5px] text-white/85 outline-none placeholder:text-white/40"
                />
              </div>
              {user.role === 'auditor' && <Badge tone="gold">READ-ONLY</Badge>}
              <button className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-white/12 bg-white/5 text-white/60 hover:border-white/25 hover:text-white">
                <Bell size={16} />
                <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-bad-600" />
              </button>
              <button className="hidden h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-white/12 bg-white/5 text-white/60 hover:border-white/25 hover:text-white sm:flex">
                <HelpCircle size={16} />
              </button>

              {/* user menu — avatar + name, click to reveal Sign out */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/12 bg-white/5 py-1.5 pr-2.5 pl-1.5 transition-colors hover:border-white/25 hover:bg-white/10"
                >
                  <span className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-brand-400/25 text-[11px] font-bold text-white ring-1 ring-white/15">
                    {initials(user)}
                  </span>
                  <span className="hidden min-w-0 text-left leading-tight sm:block">
                    <span className="block truncate text-[12px] font-semibold text-white">{fullName(user)}</span>
                  </span>
                  <ChevronDown size={14} className={`text-white/40 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} aria-hidden="true" />
                    <div className="absolute top-full right-0 z-20 mt-2 w-56 overflow-hidden rounded-lg border border-white/10 bg-navy-950 shadow-2xl shadow-black/50">
                      <div className="border-b border-white/10 px-3.5 py-3">
                        <div className="truncate text-[13px] font-semibold text-white">{fullName(user)}</div>
                        <div className="truncate text-[11.5px] text-white/45">{user.email}</div>
                      </div>
                      <button
                        onClick={() => {
                          onSignOut()
                          navigate('/')
                        }}
                        className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-semibold text-white/70 transition-colors hover:bg-white/6 hover:text-white"
                      >
                        <LogOut size={15} /> Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 py-6 lg:px-7">{children}</main>

        <AppFooter />
      </div>
    </div>
  )
}
