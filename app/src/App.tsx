import { useState } from 'react'
import type { ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import type { User } from './data/mock'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import AdminDashboard from './pages/AdminDashboard'
import TrainerDashboard from './pages/TrainerDashboard'
import LearnerToday from './pages/LearnerToday'
import AuditorDashboard from './pages/AuditorDashboard'
import Attendance from './pages/Attendance'
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

export default function App() {
  const [user, setUser] = useState<User | null>(null)

  const guard = (el: ReactNode) =>
    user ? (
      <Shell user={user} onSignOut={() => setUser(null)}>
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
        <Route path="/login" element={<Navigate to="/" replace />} />

        <Route path="/admin" element={guard(<AdminDashboard />)} />
        <Route path="/batches" element={guard(<Batches />)} />
        <Route path="/courses" element={guard(<Courses />)} />
        <Route path="/people" element={guard(<People />)} />

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
