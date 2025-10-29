import { useState, type ReactElement } from 'react'
import './App.css'
import { Battery, Gauge, Navigation, Signal, Thermometer, Droplets, Shield, Home, Pause, Joystick, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VideoSection } from '@/components/VideoSection'
import { NavButton } from '@/components/NavButton'
import { TelemetryCard } from '@/components/TelemetryCard'
import { TelemetryHeaderItem } from '@/components/TelemetryHeaderItem'
import { FactoryMap } from '@/components/FactoryMap'

type NavItem = {
  id: string
  label: string
  icon: ReactElement
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'events',
    label: 'Events',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

function App() {
  const [activeNav, setActiveNav] = useState('dashboard')

  return (
    <div className="fixed inset-0 flex">
      <nav className="w-16 bg-gray-900 text-white flex flex-col border-r border-gray-800">
        <div className="flex-1 py-4">
          {navItems.map((item) => (
            <NavButton
              key={item.id}
              id={item.id}
              label={item.label}
              icon={item.icon}
              isActive={activeNav === item.id}
              onClick={() => setActiveNav(item.id)}
            />
          ))}
        </div>
      </nav>
      <div className="flex-1">
        <FactoryMap />
      </div>
      <div className="w-[30%] border-l border-gray-200 bg-white flex flex-col overflow-hidden">
        <VideoSection title="RGB Camera" subtitle="Visible spectrum (color)" src="/rgb.mp4" />
        <VideoSection title="Thermal Camera" subtitle="Infrared heat visualization" src="/rgb.mp4" filter="invert(1) sepia(1) saturate(6) hue-rotate(200deg) contrast(1.2) brightness(1.1)" />

        {/* Section 3: Drone Telemetry */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-700">Telemetry</h3>
            <div className="flex items-center gap-3">
              <TelemetryHeaderItem icon={<Battery className="w-3.5 h-3.5 text-gray-600" />} value="85%" />
              <TelemetryHeaderItem icon={<Signal className="w-3.5 h-3.5 text-green-600" />} value="Strong" />
              <TelemetryHeaderItem icon={<Navigation className="w-3.5 h-3.5 text-gray-600" />} value="12.3 m/s" />
              <TelemetryHeaderItem icon={<Gauge className="w-3.5 h-3.5 text-gray-600" />} value="42.5m" />
            </div>
          </div>
          <div className="flex-1 p-2 flex flex-col gap-1.5">
            {/* Two Main Columns */}
            <div className="grid grid-cols-3 gap-1">
              {/* Drone Data Column */}
              <div className="col-span-1 space-y-1">
                <div className="px-1">
                  <h4 className="text-[9px] font-semibold text-gray-600 uppercase tracking-wide">Drone Data</h4>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <TelemetryCard
                    icon={<Compass className="w-3 h-3 text-gray-600 flex-shrink-0" />}
                    label="Bearing"
                    value="045°"
                    valueColor="text-gray-600"
                  />
                  <TelemetryCard
                    icon={<Shield className="w-3 h-3 text-gray-600 flex-shrink-0" />}
                    label="Flap"
                    value="Closed"
                    valueColor="text-gray-600"
                  />
                </div>
              </div>

              {/* Docking Station Column */}
              <div className=" col-span-2 space-y-1">
                <div className="px-1">
                  <h4 className="text-[9px] font-semibold text-gray-600 uppercase tracking-wide">Docking Station</h4>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  <TelemetryCard
                    icon={<Thermometer className="w-3 h-3 text-gray-600 flex-shrink-0" />}
                    label="Temp"
                    value="22°C"
                    valueColor="text-gray-600"
                  />
                  <TelemetryCard
                    icon={<Droplets className="w-3 h-3 text-gray-600 flex-shrink-0" />}
                    label="Humidity"
                    value="45%"
                    valueColor="text-gray-600"
                  />
                  <TelemetryCard
                    icon={<Shield className="w-3 h-3 text-green-600 flex-shrink-0" />}
                    label="Flood"
                    value="OK"
                    valueColor="text-green-600"
                  />
                  <TelemetryCard
                    icon={<div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></div>}
                    label="Docking"
                    value="Not Confirmed"
                    valueColor="text-red-600"
                  />
                </div>
              </div>
            </div>

            {/* Mission Status */}
            <div className="bg-gray-50 p-1 py-2 rounded mb-1.5">
              <div className="flex items-center gap-1 justify-between mb-0.5">
                <div className="text-[9px] text-gray-500 uppercase tracking-wide">Mission Status</div>
                <div className="text-[9px] text-gray-500 uppercase tracking-wide">In Progress (43%)</div>
              </div>
              <div className="h-2 bg-gray-200 rounded">
                <div className="h-2 bg-blue-500 rounded" style={{ width: '43%' }}></div>
              </div>
            </div>

            {/* Control Buttons - Grouped & Larger */}
            <div className="inline-flex w-full pt-0.5 rounded-md overflow-hidden">
              <Button variant="secondary" className="h-10 text-sm flex-1 rounded-none first:rounded-l-md">
                <Pause className="w-4 h-4 mr-1.5" />
                Pause
              </Button>
              <Button variant="secondary" className="h-10 text-sm flex-1 rounded-none">
                <Home className="w-4 h-4 mr-1.5" />
                Home
              </Button>
              <Button variant="destructive" className="h-10 text-sm flex-1 rounded-none last:rounded-r-md">
                <Joystick className="w-4 h-4 mr-1.5" />
                Control
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
