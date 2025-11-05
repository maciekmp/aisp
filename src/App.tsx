import { type ReactElement } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './App.css'
import { Rocket, MapPin, AlertTriangle, Drone, Archive, Settings } from 'lucide-react'
import { NavButton } from '@/components/NavButton'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AlertOverlay } from '@/components/AlertOverlay'
import { Dashboard } from '@/pages/Dashboard'
import { MissionPlanner } from '@/pages/MissionPlanner'
import { AlertCenter } from '@/pages/AlertCenter'
import { FleetManagement } from '@/pages/FleetManagement'
import { Archive as ArchivePage } from '@/pages/Archive'
import { Settings as SettingsPage } from '@/pages/Settings'

type NavItem = {
  path: string
  labelKey: string
  icon: ReactElement
}

function App() {
  const { t } = useTranslation()

  const navItems: NavItem[] = [
    {
      path: '/',
      labelKey: 'nav.missionControl',
      icon: <Rocket className="w-5 h-5" />,
    },
    {
      path: '/mission-planner',
      labelKey: 'nav.missionPlanner',
      icon: <MapPin className="w-5 h-5" />,
    },
    {
      path: '/alert-center',
      labelKey: 'nav.alertCenter',
      icon: <AlertTriangle className="w-5 h-5" />,
    },
    {
      path: '/fleet',
      labelKey: 'nav.fleet',
      icon: <Drone className="w-5 h-5" />,
    },
    {
      path: '/archive',
      labelKey: 'nav.archive',
      icon: <Archive className="w-5 h-5" />,
    },
    {
      path: '/settings',
      labelKey: 'nav.settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ]

  return (
    <div className="fixed inset-0 flex">
      <nav className="w-16 bg-gray-900 text-white flex flex-col border-r border-gray-800">
        <div className="flex-1 py-4">
          {navItems.map((item) => (
            <NavButton
              key={item.path}
              to={item.path}
              label={t(item.labelKey)}
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
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </ErrorBoundary>
      </div>
      <AlertOverlay />
    </div>
  )
}

export default App
