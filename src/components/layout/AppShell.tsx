import type { ReactNode } from 'react'
import { LayoutDashboard, Calendar, Inbox, Lock, Clock } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Page } from '../../types'

interface AppShellProps {
  children: ReactNode
  currentPage: Page
  onNavigate: (page: Page) => void
}

type NavItem = { id: Page; label: string; Icon: LucideIcon }

const NAV: NavItem[] = [
  { id: 'dashboard',   label: 'Home',     Icon: LayoutDashboard },
  { id: 'calendar',    label: 'Calendar', Icon: Calendar },
  { id: 'ingest',      label: 'Ingest',   Icon: Inbox },
  { id: 'availability',label: 'Avail',    Icon: Lock },
  { id: 'schedule',    label: 'Schedule', Icon: Clock },
]

export default function AppShell({ children, currentPage, onNavigate }: AppShellProps) {
  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-background overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background z-10">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">AF</span>
          <span className="font-semibold text-sm tracking-tight">AmIFree Scheduler</span>
        </div>
        <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-full">MVP Shell</span>
      </header>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      <nav className="border-t border-border bg-background pb-safe">
        <div className="flex">
          {NAV.map(({ id, label, Icon }) => {
            const active = currentPage === id
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors
                  ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Icon size={20} />
                {label}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
