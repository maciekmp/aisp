import { type ReactElement } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import { Rocket, MapPin, AlertTriangle, Drone, Archive } from 'lucide-react'
import { NavButton } from '@/components/NavButton'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Dashboard } from '@/pages/Dashboard'
import { MissionPlanner } from '@/pages/MissionPlanner'
import { AlertCenter } from '@/pages/AlertCenter'
import { FleetManagement } from '@/pages/FleetManagement'
import { Archive as ArchivePage } from '@/pages/Archive'

type NavItem = {
  path: string
  label: string
  icon: ReactElement
}

const navItems: NavItem[] = [
  {
    path: '/',
    label: 'Mission Control',
    icon: <Rocket className="w-5 h-5" />,
  },
  {
    path: '/mission-planner',
    label: 'Mission Planner',
    icon: <MapPin className="w-5 h-5" />,
  },
  {
    path: '/alert-center',
    label: 'Alert Center',
    icon: <AlertTriangle className="w-5 h-5" />,
  },
  {
    path: '/fleet',
    label: 'Fleet & Dock',
    icon: <Drone className="w-5 h-5" />,
  },
  {
    path: '/archive',
    label: 'Archive',
    icon: <Archive className="w-5 h-5" />,
  },
]

function App() {
  return (
    <div className="fixed inset-0 flex">
      <nav className="w-16 bg-gray-900 text-white flex flex-col border-r border-gray-800">
        <div className="flex-1 py-4">
          {navItems.map((item) => (
            <NavButton
              key={item.path}
              to={item.path}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </div>
      </nav>
      
      <div className="flex-1 flex">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/mission-planner" element={<MissionPlanner />} />
            <Route path="/alert-center" element={<AlertCenter />} />
            <Route path="/fleet" element={<FleetManagement />} />
            <Route path="/archive" element={<ArchivePage />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </div>
  )
}

export default App
