import { useState } from 'react'
import AppShell from './components/layout/AppShell'
import DashboardPage from './pages/DashboardPage'
import CalendarPage from './pages/CalendarPage'
import IngestPage from './pages/IngestPage'
import AvailabilityPage from './pages/AvailabilityPage'
import SchedulePage from './pages/SchedulePage'
import type { Page } from './types'

export default function App() {
  const [page, setPage] = useState<Page>('dashboard')

  return (
    <AppShell currentPage={page} onNavigate={setPage}>
      {page === 'dashboard'   && <DashboardPage />}
      {page === 'calendar'    && <CalendarPage />}
      {page === 'ingest'      && <IngestPage />}
      {page === 'availability' && <AvailabilityPage />}
      {page === 'schedule'    && <SchedulePage />}
    </AppShell>
  )
}
