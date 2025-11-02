import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react'
import './App.css'
import { Battery, Gauge, Navigation, Signal, Thermometer, Droplets, Shield, Home, Pause, Joystick, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VideoSection } from '@/components/VideoSection'
import { NavButton } from '@/components/NavButton'
import { TelemetryCard } from '@/components/TelemetryCard'
import { TelemetryHeaderItem } from '@/components/TelemetryHeaderItem'
import { MapView, MarkerIcon } from '@/components/MapView'
import bbox from '@turf/bbox'
import factoryPolygon from './tesla.json'
import type { Feature, Polygon } from 'geojson'

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
  const [mode, setMode] = useState<'manual' | 'auto'>('auto')
  const [speedMps, setSpeedMps] = useState(0)
  const [expandedVideo, setExpandedVideo] = useState<'rgb' | 'thermal' | null>(null)

  // Compute factory bounds and initial center
  const { bounds, center } = useMemo(() => {
    const [minLng, minLat, maxLng, maxLat] = bbox(factoryPolygon as unknown as Feature<Polygon>)
    return {
      bounds: { minLng, minLat, maxLng, maxLat },
      center: { longitude: (minLng + maxLng) / 2, latitude: (minLat + maxLat) / 2 }
    }
  }, [])

  // Drone state exposed to map
  const [drone, setDrone] = useState<{ longitude: number; latitude: number; headingDegrees: number }>({
    longitude: center.longitude,
    latitude: center.latitude,
    headingDegrees: 45
  })

  // Optional: base at center
  const base = useMemo(() => ({ longitude: center.longitude, latitude: center.latitude, headingDegrees: 0 }), [center.longitude, center.latitude])

  // Input tracking
  const keys = useRef({ up: false, down: false, left: false, right: false })

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (mode !== 'manual') return
      let handled = false
      if (e.key === 'ArrowUp') { keys.current.up = true; handled = true }
      if (e.key === 'ArrowDown') { keys.current.down = true; handled = true }
      if (e.key === 'ArrowLeft') { keys.current.left = true; handled = true }
      if (e.key === 'ArrowRight') { keys.current.right = true; handled = true }
      if (handled) e.preventDefault()
    }
    const onUp = (e: KeyboardEvent) => {
      if (mode !== 'manual') return
      let handled = false
      if (e.key === 'ArrowUp') { keys.current.up = false; handled = true }
      if (e.key === 'ArrowDown') { keys.current.down = false; handled = true }
      if (e.key === 'ArrowLeft') { keys.current.left = false; handled = true }
      if (e.key === 'ArrowRight') { keys.current.right = false; handled = true }
      if (handled) e.preventDefault()
    }
    // Capture phase so we process before mapbox handlers; passive false to allow preventDefault
    window.addEventListener('keydown', onDown, { capture: true, passive: false })
    window.addEventListener('keyup', onUp, { capture: true, passive: false })
    return () => {
      const removeOptions: AddEventListenerOptions = { capture: true }
      window.removeEventListener('keydown', onDown, removeOptions)
      window.removeEventListener('keyup', onUp, removeOptions)
    }
  }, [mode])

  // Physics loop with simple inertia
  useEffect(() => {
    let raf = 0
    let last = performance.now()
    // Maintain motion state in refs to avoid stale closures
    let posLng = drone.longitude
    let posLat = drone.latitude
    let yaw = (drone.headingDegrees * Math.PI) / 180
    let velX = 0
    let velY = 0

    const maxSpeed = 0.00002 // deg/frame scaled
    const accel = 0.00006
    const drag = 0.90
    const yawRateDegPerFrame = 2.0

    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000) // seconds
      last = t

      // Scale per-frame constants to dt ~ 60fps baseline
      const scale = dt * 60

      // Control mode: manual uses keys, auto ignores keys and moves forward with bounce
      if (mode === 'manual') {
        if (keys.current.left) yaw -= (yawRateDegPerFrame * Math.PI / 180) * scale
        if (keys.current.right) yaw += (yawRateDegPerFrame * Math.PI / 180) * scale
      }
      let thrust = 0
      if (mode === 'manual') {
        if (keys.current.up) thrust += accel
        if (keys.current.down) thrust -= accel
      } else {
        // In auto, gently maintain a cruising speed forward
        const desiredSpeed = maxSpeed * 0.8
        const currentSpeed = Math.hypot(velX, velY)
        const speedError = desiredSpeed - currentSpeed
        thrust = Math.max(-accel, Math.min(accel, speedError * 0.5))
      }

      // Map forward so that heading 0° is north (latitude+)
      const ax = Math.sin(yaw) * thrust
      const ay = Math.cos(yaw) * thrust

      velX = (velX + ax * scale) * drag
      velY = (velY + ay * scale) * drag

      const speed = Math.hypot(velX, velY)
      if (speed > maxSpeed) {
        const s = maxSpeed / speed
        velX *= s
        velY *= s
      }

      posLng += velX
      posLat += velY

      // Compute instantaneous speed in m/s from degree displacement over dt
      const metersPerDegLat = 111320
      const metersPerDegLon = 111320 * Math.cos(posLat * Math.PI / 180)
      const dxMeters = velX * metersPerDegLon
      const dyMeters = velY * metersPerDegLat
      const instSpeed = dt > 0 ? Math.hypot(dxMeters, dyMeters) / dt : 0
      setSpeedMps(instSpeed)

      // Bounce on bounds in auto; clamp in manual
      const margin = 1e-9
      if (mode === 'auto') {
        if (posLng <= bounds.minLng + margin && velX < 0) { velX = -velX; yaw = Math.atan2(velX, velY) }
        if (posLng >= bounds.maxLng - margin && velX > 0) { velX = -velX; yaw = Math.atan2(velX, velY) }
        if (posLat <= bounds.minLat + margin && velY < 0) { velY = -velY; yaw = Math.atan2(velX, velY) }
        if (posLat >= bounds.maxLat - margin && velY > 0) { velY = -velY; yaw = Math.atan2(velX, velY) }
        posLng = Math.min(bounds.maxLng, Math.max(bounds.minLng, posLng))
        posLat = Math.min(bounds.maxLat, Math.max(bounds.minLat, posLat))
      } else {
        posLng = Math.min(bounds.maxLng, Math.max(bounds.minLng, posLng))
        posLat = Math.min(bounds.maxLat, Math.max(bounds.minLat, posLat))
      }

      setDrone({ longitude: posLng, latitude: posLat, headingDegrees: ((yaw * 180) / Math.PI + 360) % 360 })
      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [mode])

  const isExpanded = expandedVideo !== null

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
      
      {/* Center area - shows MapView or expanded VideoSection */}
      <div className="flex-1 relative">
        {isExpanded ? (
          <div className="w-full h-full flex flex-col bg-black">
            {expandedVideo === 'rgb' ? (
              <VideoSection 
                title="RGB Camera" 
                subtitle="Visible spectrum (color)" 
                src="/rgb.mp4"
                onExpand={() => setExpandedVideo(null)}
                isExpanded={true}
                onTakePhoto={() => {}}
                onSaveClip={() => {}}
              />
            ) : (
              <VideoSection 
                title="Thermal Camera" 
                subtitle="Infrared heat visualization" 
                src="/rgb.mp4" 
                filter="invert(1) sepia(1) saturate(6) hue-rotate(200deg) contrast(1.2) brightness(1.1)"
                onExpand={() => setExpandedVideo(null)}
                isExpanded={true}
                onTakePhoto={() => {}}
                onSaveClip={() => {}}
              />
            )}
          </div>
        ) : (
          <>
            <MapView base={base} drone={drone} />
            {mode === 'manual' && (
              <div className="absolute left-2 bottom-2 select-none">
                <div className="bg-white/80 backdrop-blur rounded-md p-1 shadow border border-gray-200">
                  <div className="grid grid-cols-3 gap-1">
                    <div />
                    <button
                      className="h-9 w-9 rounded bg-gray-100 hover:bg-gray-200 active:bg-gray-300 flex items-center justify-center"
                      onPointerDown={(e) => { e.preventDefault(); keys.current.up = true }}
                      onPointerUp={(e) => { e.preventDefault(); keys.current.up = false }}
                      onPointerLeave={() => { keys.current.up = false }}
                      aria-label="Forward"
                      title="Forward"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>
                    </button>
                    <div />

                    <button
                      className="h-9 w-9 rounded bg-gray-100 hover:bg-gray-200 active:bg-gray-300 flex items-center justify-center"
                      onPointerDown={(e) => { e.preventDefault(); keys.current.left = true }}
                      onPointerUp={(e) => { e.preventDefault(); keys.current.left = false }}
                      onPointerLeave={() => { keys.current.left = false }}
                      aria-label="Turn Left"
                      title="Turn Left"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h13"/><path d="m11 5-7 7 7 7"/></svg>
                    </button>
                    <div className="h-9 w-9" />
                    <button
                      className="h-9 w-9 rounded bg-gray-100 hover:bg-gray-200 active:bg-gray-300 flex items-center justify-center"
                      onPointerDown={(e) => { e.preventDefault(); keys.current.right = true }}
                      onPointerUp={(e) => { e.preventDefault(); keys.current.right = false }}
                      onPointerLeave={() => { keys.current.right = false }}
                      aria-label="Turn Right"
                      title="Turn Right"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 12h13"/><path d="m13 5 7 7-7 7"/></svg>
                    </button>

                    <div />
                    <button
                      className="h-9 w-9 rounded bg-gray-100 hover:bg-gray-200 active:bg-gray-300 flex items-center justify-center"
                      onPointerDown={(e) => { e.preventDefault(); keys.current.down = true }}
                      onPointerUp={(e) => { e.preventDefault(); keys.current.down = false }}
                      onPointerLeave={() => { keys.current.down = false }}
                      aria-label="Backward"
                      title="Backward"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                    </button>
                    <div />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Sidebar - shows VideoSections or MapView when expanded */}
      <div className="w-[30%] border-l border-gray-200 bg-white flex flex-col overflow-hidden">
        {expandedVideo === 'rgb' ? (
          <div className="flex-1 flex flex-col border-b border-gray-200 overflow-hidden relative">
            <MapView base={base} drone={drone} showLegend={false} />
          </div>
        ) : (
          <VideoSection 
            title="RGB Camera" 
            subtitle="Visible spectrum (color)" 
            src="/rgb.mp4"
            onExpand={() => setExpandedVideo('rgb')}
            onTakePhoto={() => {}}
            onSaveClip={() => {}}
          />
        )}
        {expandedVideo === 'thermal' ? (
          <div className="flex-1 flex flex-col border-b border-gray-200 overflow-hidden relative">
            <MapView base={base} drone={drone} showLegend={false} />
          </div>
        ) : (
          <VideoSection 
            title="Thermal Camera" 
            subtitle="Infrared heat visualization" 
            src="/rgb.mp4" 
            filter="invert(1) sepia(1) saturate(6) hue-rotate(200deg) contrast(1.2) brightness(1.1)"
            onExpand={() => setExpandedVideo('thermal')}
            onTakePhoto={() => {}}
            onSaveClip={() => {}}
          />
        )}

        {/* Section 3: Drone Telemetry */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-700">Telemetry</h3>
            <div className="flex items-center gap-3">
              <TelemetryHeaderItem icon={<Battery className="w-3.5 h-3.5 text-gray-600" />} value="85%" />
              <TelemetryHeaderItem icon={<Signal className="w-3.5 h-3.5 text-green-600" />} value="Strong" />
              <TelemetryHeaderItem icon={<Navigation className="w-3.5 h-3.5 text-gray-600" />} value={`${speedMps.toFixed(1)} m/s`} />
              <TelemetryHeaderItem icon={<Gauge className="w-3.5 h-3.5 text-gray-600" />} value="42.5m" />
            </div>
          </div>
          <div className="flex-1 p-2 flex flex-col gap-1.5">
            {/* Two Main Columns */}
            <div className="grid grid-cols-3 gap-1">
              {/* Drone Data Column */}
              <div className="col-span-1 space-y-1">
                <div className="px-1 flex items-center gap-1.5">
                  <div className="drop-shadow">
                    <MarkerIcon color="#93c5fd" strokeColor="#ffffff" headingDegrees={drone.headingDegrees} size={20} />
                  </div>
                  <h4 className="text-[9px] font-semibold text-gray-600 uppercase tracking-wide">Drone Data</h4>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <TelemetryCard
                    icon={<Compass className="w-3 h-3 text-gray-600 flex-shrink-0" />}
                    label="Bearing"
                    value={`${Math.round(drone.headingDegrees).toString().padStart(3, '0')}°`}
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
                <div className="px-1 flex items-center gap-1.5">
                  <div className="drop-shadow">
                    <MarkerIcon color="#fca5a5" strokeColor="#ffffff" headingDegrees={0} size={20} />
                  </div>
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

            {/* Mission Status (auto) or Instructions (manual) */}
            {mode === 'auto' ? (
              <div className="bg-gray-50 p-1 py-2 rounded mb-1.5">
                <div className="flex items-center gap-1 justify-between mb-0.5">
                  <div className="text-[9px] text-gray-500 uppercase tracking-wide">Mission Status</div>
                  <div className="text-[9px] text-gray-500 uppercase tracking-wide">In Progress (43%)</div>
                </div>
                <div className="h-2 bg-gray-200 rounded">
                  <div className="h-2 bg-blue-500 rounded" style={{ width: '43%' }}></div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-1 py-2 rounded mb-1.5">
                <div className="text-[9px] text-gray-600 text-center">
                  Use Arrow keys to steer. Switch to Auto with the Control button.
                </div>
              </div>
            )}

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
              <Button
                variant="destructive"
                className="h-10 text-sm flex-1 rounded-none last:rounded-r-md"
                onClick={() => setMode((m) => (m === 'manual' ? 'auto' : 'manual'))}
                title={mode === 'manual' ? 'Switch to Auto' : 'Switch to Manual'}
              >
                <Joystick className="w-4 h-4 mr-1.5" />
                {mode === 'auto' ? 'Manual' : 'Auto'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
