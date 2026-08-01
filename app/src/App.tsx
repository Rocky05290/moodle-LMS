import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import type { Role, User } from './data/mock'
import { supabase } from './lib/supabase'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import TrainerDashboard from './pages/TrainerDashboard'
import LearnerToday from './pages/LearnerToday'
import AuditorDashboard from './pages/AuditorDashboard'
import Attendance from './pages/Attendance'
import Certificates from './pages/Certificates'
import Reports from './pages/Reports'
import Calendar from './pages/Calendar'
import { Batches, Courses, People, Grading, MyCourse } from './pages/Extra'

const META: Record<string, { title: string; subtitle?: string }> = {
  '/admin': { title: 'Dashboard', subtitle: 'Overview of every batch, learner and trainer' },
  '/batches': { title: 'Batches', subtitle: 'Create and manage training batches' },
  '/courses': { title: 'Master Course Inventory', subtitle: 'Courses, modules and contracted hours' },
  '/people': { title: 'People', subtitle: 'Learners, trainers, corporates and auditors' },
  '/trainer': { title: 'My Batches', subtitle: 'Your active batches and pending actions' },
  '/attendance': { title: 'Attendance Register', subtitle: 'Daily marking · P / L1 / L2 / L3 / A' },
  '/grading': { title: 'Grading', subtitle: 'Rubric-based assessment and redo workflow' },
  '/learner': { title: 'Today', subtitle: "What's next in your training" },
  '/mycourse': { title: 'My Course', subtitle: 'Modules and learning path' },
  '/auditor': { title: 'Compliance', subtitle: 'Read-only verification and export' },
  '/audit-log': { title: 'Audit Log', subtitle: 'Every change, timestamped' },
  '/certificates': { title: 'Certificates', subtitle: 'Issue completion certificates as PDF' },
  '/reports': { title: 'Tamkeen Reports', subtitle: 'Attendance registers and compliance bundles' },
  '/calendar': { title: 'Training Calendar', subtitle: 'Tamkeen session schedule · Sun–Thu working week' },
}

function Shell({
  user,
  onSignOut,
  children,
}: {
  user: User
  onSignOut: () => void
  children: ReactNode
}) {
  const { pathname } = useLocation()
  const meta = META[pathname] ?? { title: 'Cordoba' }
  return (
    <Layout user={user} onSignOut={onSignOut} title={meta.title} subtitle={meta.subtitle}>
      {children}
    </Layout>
  )
}

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-brand-500/25 border-t-brand-500" />
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(!supabase)

  // Restore a real Supabase session on page load (so refresh keeps you signed in).
  // authReady stays false until this resolves, so guarded routes wait instead of
  // bouncing to the dashboard/login before the session is known.
  useEffect(() => {
    if (!supabase) return
    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        const s = data.session
        if (s) {
          const { data: prof } = await supabase!
            .from('profiles')
            .select('*')
            .eq('id', s.user.id)
            .maybeSingle()
          if (prof) {
            setUser({
              id: 0,
              firstName: prof.first_name,
              lastName: prof.last_name,
              email: s.user.email ?? prof.email,
              mobile: prof.mobile ?? '',
              cpr: prof.cpr ?? '',
              role: prof.role as Role,
              company: prof.company ?? undefined,
            })
          }
        }
        setAuthReady(true)
      })
      .catch(() => setAuthReady(true))
  }, [])

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut()
    setUser(null)
  }

  const guard = (el: ReactNode) =>
    !authReady ? (
      <FullScreenLoader />
    ) : user ? (
      <Shell user={user} onSignOut={signOut}>
        {el}
      </Shell>
    ) : (
      <Navigate to="/" replace />
    )

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to={`/${user.role}`} replace /> : <Landing onSignIn={setUser} />}
        />
        <Route
          path="/login"
          element={user ? <Navigate to={`/${user.role}`} replace /> : <LoginPage onSignIn={setUser} />}
        />

        <Route path="/admin" element={guard(<AdminDashboard />)} />
        <Route path="/batches" element={guard(<Batches />)} />
        <Route path="/courses" element={guard(<Courses />)} />
        <Route path="/people" element={guard(<People />)} />
        <Route path="/certificates" element={guard(<Certificates />)} />
        <Route path="/reports" element={guard(<Reports />)} />
        <Route path="/calendar" element={guard(<Calendar />)} />

        <Route path="/trainer" element={guard(<TrainerDashboard />)} />
        <Route path="/attendance" element={guard(<Attendance />)} />
        <Route path="/grading" element={guard(<Grading />)} />

        <Route path="/learner" element={guard(<LearnerToday />)} />
        <Route path="/mycourse" element={guard(<MyCourse />)} />

        <Route path="/auditor" element={guard(<AuditorDashboard />)} />
        <Route path="/audit-log" element={guard(<AuditorDashboard />)} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
