import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, Layers, Users, CalendarCheck, ClipboardCheck,
  ShieldCheck, FileBarChart, LogOut, Bell, Search, HelpCircle, ChevronRight, Award, FileText, CalendarRange,
} from 'lucide-react'
import type { Role, User } from '../data/mock'
import { fullName, initials } from '../data/mock'
import { Badge } from './ui'
import SiteFooter from './SiteFooter'
import AppBgFx from './AppBgFx'

const NAV: Record<Role, { to: string; label: string; icon: ReactNode }[]> = {
  admin: [
    { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={17} /> },
    { to: '/batches', label: 'Batches', icon: <Layers size={17} /> },
    { to: '/courses', label: 'Courses', icon: <BookOpen size={17} /> },
    { to: '/people', label: 'People', icon: <Users size={17} /> },
    { to: '/certificates', label: 'Certificates', icon: <Award size={17} /> },
    { to: '/calendar', label: 'Training Calendar', icon: <CalendarRange size={17} /> },
    { to: '/reports', label: 'Tamkeen Reports', icon: <FileText size={17} /> },
  ],
  trainer: [
    { to: '/trainer', label: 'My Batches', icon: <LayoutDashboard size={17} /> },
    { to: '/attendance', label: 'Attendance', icon: <CalendarCheck size={17} /> },
    { to: '/grading', label: 'Grading', icon: <ClipboardCheck size={17} /> },
    { to: '/calendar', label: 'Training Calendar', icon: <CalendarRange size={17} /> },
  ],
  learner: [
    { to: '/learner', label: 'Today', icon: <LayoutDashboard size={17} /> },
    { to: '/mycourse', label: 'My Course', icon: <BookOpen size={17} /> },
  ],
  auditor: [
    { to: '/auditor', label: 'Compliance', icon: <ShieldCheck size={17} /> },
    { to: '/certificates', label: 'Certificates', icon: <Award size={17} /> },
    { to: '/calendar', label: 'Training Calendar', icon: <CalendarRange size={17} /> },
    { to: '/reports', label: 'Tamkeen Reports', icon: <FileText size={17} /> },
    { to: '/audit-log', label: 'Audit Log', icon: <FileBarChart size={17} /> },
  ],
  company: [{ to: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={17} /> }],
}

const ROLE_LABEL: Record<Role, string> = {
  admin: 'Administrator',
  trainer: 'Trainer',
  learner: 'Learner',
  auditor: 'Auditor / QA',
  company: 'Corporate',
}

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
  const items = NAV[user.role]

  return (
    <div className="app-bg flex min-h-full">
      {/* interactive animated background (demo look) — click to burst, move to repel */}
      <AppBgFx />

      {/* ------------------------- Sidebar ------------------------- */}
      <aside className="sticky top-0 z-10 hidden h-screen w-[244px] flex-none flex-col bg-gradient-to-b from-navy-800 to-navy-900 p-4 lg:flex">
        {/* logo */}
        <div className="mb-7 px-2 pt-1">
          <img
            src="/logo.png"
            alt="Cordoba Training Center"
            className="h-9 w-auto brightness-0 invert"
          />
        </div>

        <div className="mb-2 flex items-center gap-2 px-3">
          <span className="h-1 w-1 rounded-full bg-brand-400" />
          <span className="text-[10px] font-bold tracking-[0.12em] text-white/40 uppercase">
            {ROLE_LABEL[user.role]}
          </span>
        </div>

        <nav className="flex flex-col gap-0.5">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-lg py-2.5 pr-3 pl-4 text-[13.5px] font-semibold ${
                  isActive
                    ? 'bg-white/12 text-white shadow-sm'
                    : 'text-white/55 hover:bg-white/6 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`absolute top-1/2 left-0 h-5 -translate-y-1/2 rounded-r bg-brand-400 ${
                      isActive ? 'w-1 opacity-100' : 'w-0 opacity-0'
                    }`}
                  />
                  {it.icon}
                  {it.label}
                  {isActive && <ChevronRight size={14} className="ml-auto opacity-50" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-3">
          <div className="mb-1 flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-white/6">
            <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-brand-400/25 text-[11px] font-bold text-white ring-1 ring-white/15">
              {initials(user)}
            </span>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-[12.5px] font-semibold text-white">{fullName(user)}</div>
              <div className="truncate text-[10.5px] text-white/45">{user.email}</div>
            </div>
          </div>
          <button
            onClick={() => {
              onSignOut()
              navigate('/')
            }}
            className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold text-white/55 hover:bg-white/6 hover:text-white"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* -------------------------- Main --------------------------- */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        {/* topbar */}
        <header className="sticky top-0 z-20 border-b border-white/10 bg-navy-950/55 px-5 py-3.5 backdrop-blur-xl lg:px-7">
          <div className="flex items-center gap-4">
            {/* mobile logo */}
            <img src="/logo.png" alt="Cordoba" className="h-6 w-auto lg:hidden" />

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
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-[12px] font-bold text-brand-600 ring-1 ring-brand-500/12 lg:hidden">
                {initials(user)}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 py-6 lg:px-7">{children}</main>

        <SiteFooter />
      </div>
    </div>
  )
}
