import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BatteryCharging,
  Circle,
  CloudRain,
  Cog,
  Compass,
  Globe,
  Home,
  Joystick,
  Pause,
  Plane,
  Radio,
  Satellite,
  SignalHigh,
  Timer,
  Wind,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VideoSection } from '@/components/VideoSection'
import { MapView, MarkerIcon } from '@/components/MapView'
import { OperationalLog } from '@/components/OperationalLog'
import { MissionProgress } from '@/components/MissionProgress'
import factoryPolygon from '../tesla.json'
import type { Feature, Polygon } from 'geojson'
import { DRONE_PHYSICS } from '@/constants'
import { calculateMapBounds } from '@/utils/map'

type TelemetryTileStatus = 'green' | 'yellow' | 'red'

type TelemetryTileProps = {
  title: string
  icon: ReactNode
  rows: Array<{ label: string; value: string }>
  status?: TelemetryTileStatus
  tooltip?: string
}

const TELEMETRY_STATUS_META: Record<
  TelemetryTileStatus,
  { dot: string }
> = {
  green: {
    dot: 'bg-green-500'
  },
  yellow: {
    dot: 'bg-yellow-500'
  },
  red: {
    dot: 'bg-red-500'
  }
}

function TelemetryTile({ title, icon, rows, status, tooltip }: TelemetryTileProps) {
  const statusMeta = status ? TELEMETRY_STATUS_META[status] : null

  return (
    <div
      title={tooltip}
      className="rounded border border-gray-200 bg-white/90 p-1.5 shadow-sm flex flex-col gap-1 transition-colors"
    >
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
          <span className="flex h-4 w-4 items-center justify-center text-gray-600">{icon}</span>
          <span className="truncate">{title}</span>
        </div>
        {statusMeta && (
          <div className="flex items-center justify-center" aria-hidden={false} role="status">
            <span className={`h-2.5 w-2.5 rounded-full ${statusMeta.dot}`} aria-hidden />
            <span className="sr-only">{status} status</span>
          </div>
        )}
      </div>
      <div className="space-y-0.5">
        {rows.map(row => (
          <div key={row.label} className="flex items-center justify-between text-[8px] text-gray-600">
            <span className="truncate uppercase tracking-wide text-gray-500">{row.label}</span>
            <span className="font-semibold text-gray-800">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Main dashboard component for mission control
 * Displays real-time drone telemetry, map visualization, video feeds, and mission status
 */
export type PhysicsLog = {
  id: string
  type: 'start' | 'bounce' | 'mode_change' | 'started_moving' | 'stopped' | 'max_speed' | 'stop'
  message: string
  timestamp: number
}

export function Dashboard() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<'manual' | 'auto'>('auto')
  const [expandedVideo, setExpandedVideo] = useState<'rgb' | 'thermal' | null>(null)
  const [physicsLogs, setPhysicsLogs] = useState<PhysicsLog[]>([])
  const addPhysicsLogRef = useRef<(type: PhysicsLog['type'], message: string) => void | undefined>(undefined)

  useEffect(() => {
    addPhysicsLogRef.current = (type: PhysicsLog['type'], message: string) => {
      const log: PhysicsLog = {
        id: `${Date.now()}-${Math.random()}`,
        type,
        message,
        timestamp: Date.now()
      }
      setPhysicsLogs(prev => [...prev, log])
      console.log('[Physics]', message)
    }
  }, [])

  // Compute factory bounds and initial center
  const { bounds, center } = useMemo(() => {
    return calculateMapBounds(factoryPolygon as unknown as Feature<Polygon>)
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

  /**
   * Physics simulation loop for drone movement
   * Implements simple inertia-based physics with velocity, acceleration, and drag
   * Supports both manual (keyboard controlled) and automatic (self-navigating) modes
   * In auto mode, drone bounces off boundaries; in manual mode, it's clamped
   */
  useEffect(() => {
    let raf = 0
    let last = performance.now()
    // Maintain motion state in refs to avoid stale closures
    let posLng = drone.longitude
    let posLat = drone.latitude
    let yaw = (drone.headingDegrees * Math.PI) / 180
    let velX = 0
    let velY = 0
    let wasMoving = false

    // Log drone start
    addPhysicsLogRef.current?.('start', `Drone simulation started (${mode} mode)`)

    const loop = (t: number) => {
      const dt = Math.min(DRONE_PHYSICS.MAX_DELTA_TIME, (t - last) / 1000) // seconds
      last = t

      // Scale per-frame constants to dt ~ 60fps baseline
      const scale = dt * DRONE_PHYSICS.FPS_BASELINE

      // Control mode: manual uses keys, auto ignores keys and moves forward with bounce
      if (mode === 'manual') {
        if (keys.current.left) yaw -= (DRONE_PHYSICS.YAW_RATE_DEG_PER_FRAME * Math.PI / 180) * scale
        if (keys.current.right) yaw += (DRONE_PHYSICS.YAW_RATE_DEG_PER_FRAME * Math.PI / 180) * scale
      }
      let thrust = 0
      if (mode === 'manual') {
        if (keys.current.up) thrust += DRONE_PHYSICS.ACCELERATION
        if (keys.current.down) thrust -= DRONE_PHYSICS.ACCELERATION
      } else {
        // In auto, gently maintain a cruising speed forward
        const desiredSpeed = DRONE_PHYSICS.MAX_SPEED * DRONE_PHYSICS.AUTO_SPEED_MULTIPLIER
        const currentSpeed = Math.hypot(velX, velY)
        const speedError = desiredSpeed - currentSpeed
        thrust = Math.max(-DRONE_PHYSICS.ACCELERATION, Math.min(DRONE_PHYSICS.ACCELERATION, speedError * DRONE_PHYSICS.AUTO_SPEED_CORRECTION))
      }

      // Map forward so that heading 0° is north (latitude+)
      const ax = Math.sin(yaw) * thrust
      const ay = Math.cos(yaw) * thrust

      velX = (velX + ax * scale) * DRONE_PHYSICS.DRAG
      velY = (velY + ay * scale) * DRONE_PHYSICS.DRAG

      const speed = Math.hypot(velX, velY)
      const isMoving = speed > 0.000001

      // Log when drone starts/stops moving
      if (isMoving && !wasMoving) {
        addPhysicsLogRef.current?.('started_moving', 'Drone started moving')
      } else if (!isMoving && wasMoving) {
        addPhysicsLogRef.current?.('stopped', 'Drone stopped')
      }
      wasMoving = isMoving

      if (speed > DRONE_PHYSICS.MAX_SPEED) {
        const s = DRONE_PHYSICS.MAX_SPEED / speed
        velX *= s
        velY *= s
        addPhysicsLogRef.current?.('max_speed', 'Drone reached max speed limit')
      }

      posLng += velX
      posLat += velY

      // Bounce on bounds in auto; clamp in manual
      if (mode === 'auto') {
        let bounced = false
        let bounceDirection = ''
        if (posLng <= bounds.minLng + DRONE_PHYSICS.BOUNDARY_MARGIN && velX < 0) {
          velX = -velX
          yaw = Math.atan2(velX, velY)
          bounced = true
          bounceDirection = 'west'
        }
        if (posLng >= bounds.maxLng - DRONE_PHYSICS.BOUNDARY_MARGIN && velX > 0) {
          velX = -velX
          yaw = Math.atan2(velX, velY)
          bounced = true
          bounceDirection = 'east'
        }
        if (posLat <= bounds.minLat + DRONE_PHYSICS.BOUNDARY_MARGIN && velY < 0) {
          velY = -velY
          yaw = Math.atan2(velX, velY)
          bounced = true
          bounceDirection = 'south'
        }
        if (posLat >= bounds.maxLat - DRONE_PHYSICS.BOUNDARY_MARGIN && velY > 0) {
          velY = -velY
          yaw = Math.atan2(velX, velY)
          bounced = true
          bounceDirection = 'north'
        }
        if (bounced) {
          addPhysicsLogRef.current?.('bounce', `Drone bounced (${bounceDirection})`)
        }
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
    return () => {
      cancelAnimationFrame(raf)
      addPhysicsLogRef.current?.('stop', 'Drone simulation stopped')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  // Track mode changes
  const prevModeRef = useRef(mode)
  useEffect(() => {
    if (prevModeRef.current !== mode) {
      addPhysicsLogRef.current?.('mode_change', `Mode changed: ${prevModeRef.current} → ${mode}`)
      prevModeRef.current = mode
    }
  }, [mode])

  const missionProgress = 0.43
  const missionName = 'Inspection A'
  const missionStages = [
    t('dashboard.start'),
    `${t('dashboard.waypoint')} 1`,
    `${t('dashboard.waypoint')} 2`,
    `${t('dashboard.waypoint')} 3`,
    t('dashboard.docking')
  ]
  const missionStageIndex = Math.min(missionStages.length - 1, Math.floor(missionProgress * missionStages.length))
  const missionCurrentStep =
    missionProgress >= 1
      ? t('dashboard.docking')
      : missionStages[Math.min(missionStages.length - 2, Math.max(1, missionStageIndex))]
  const missionEtaMinutes = missionProgress >= 1 ? null : 12

  const formatMinutes = (minutes: number | null) => {
    if (minutes === null) return t('dashboard.telemetryTiles.time.notAvailable')
    if (minutes < 1) return t('dashboard.telemetryTiles.time.lessThanMinute')
    return t('dashboard.telemetryTiles.time.minutes', { count: minutes })
  }

  const droneDocked = mode === 'manual'
  const batteryCharge = 68
  const batteryCellTemp = 31
  const etaToFullMinutes = droneDocked ? 18 : null
  const batteryStatus: TelemetryTileStatus =
    batteryCharge < 30 || batteryCellTemp < 10 || batteryCellTemp > 45
      ? 'red'
      : batteryCharge <= 60
        ? 'yellow'
        : 'green'

  const controlLatencyMs = 92
  const videoBitrateMbps = 6.4
  const linksStatus: TelemetryTileStatus =
    controlLatencyMs > 250 || videoBitrateMbps < 2
      ? 'red'
      : controlLatencyMs < 100 || videoBitrateMbps > 6
        ? 'green'
        : 'yellow'

  const altitudeMeters = 42
  const horizontalSpeed = 12.6
  const verticalSpeed = -0.4
  const gnssSatellites = 18
  const gnssHdop = 0.9
  const gnssStatus = 'FIX'

  const powerSource: 'grid' | 'ups' = droneDocked ? 'ups' : 'grid'
  const powerFault = false
  const upsLevel = 58
  const upsMinutesRemaining = 42
  const powerStatus: TelemetryTileStatus =
    powerFault || (powerSource === 'ups' && upsLevel < 20)
      ? 'red'
      : powerSource === 'ups'
        ? 'yellow'
        : 'green'

  const ethernetOnline = true
  const lteOnline = true
  const connectivityRttMs = 84
  const connectivityStatus: TelemetryTileStatus =
    (!ethernetOnline && !lteOnline) || connectivityRttMs > 250
      ? 'red'
      : connectivityRttMs >= 100
        ? 'yellow'
        : 'green'

  const rtkMode: 'FIX' | 'FLOAT' | 'NONE' = 'FIX'
  const rtkStatusColor: TelemetryTileStatus = rtkMode === 'FIX' ? 'green' : rtkMode === 'FLOAT' ? 'yellow' : 'red'
  const rtkSatellites = 15
  const rtkHdop = 1.1

  const windAverage = 6.4
  const windGust = 9.2
  const precipitation = false
  const weatherStatus: TelemetryTileStatus =
    windAverage > 12 || windGust > 12
      ? 'red'
      : windAverage >= 8 || windGust >= 8
        ? 'yellow'
        : 'green'

  const hatchState: 'closed' | 'open' | 'in_motion' = 'closed'
  const stationDocked = true
  const isCharging = true
  const chargingLevel = 76
  const chargingEtaMinutes = 28
  const mechanicsStatus: TelemetryTileStatus = hatchState === 'closed' && stationDocked && isCharging ? 'green' : 'red'

  const missionEtaDisplay =
    missionEtaMinutes === null ? t('dashboard.telemetryTiles.status.ready') : formatMinutes(missionEtaMinutes)

  const powerSourceLabel = t(`dashboard.telemetryTiles.power.values.${powerSource}`)
  const upsEtaDisplay = formatMinutes(upsMinutesRemaining)
  const upsDisplay =
    powerSource === 'ups'
      ? t('dashboard.telemetryTiles.power.values.upsActive', { level: upsLevel, eta: upsEtaDisplay })
      : t('dashboard.telemetryTiles.power.values.upsStandby', { level: upsLevel })
  const powerFaultLabel = t(`dashboard.telemetryTiles.power.values.fault.${powerFault ? 'active' : 'none'}`)

  const ethernetLabel = t(`dashboard.telemetryTiles.connectivity.values.${ethernetOnline ? 'online' : 'offline'}`)
  const lteLabel = t(`dashboard.telemetryTiles.connectivity.values.${lteOnline ? 'online' : 'offline'}`)

  const precipitationLabel = t(`common.${precipitation ? 'yes' : 'no'}`)

  const hatchLabel = t(`dashboard.telemetryTiles.dock.hatch.${hatchState}`)
  const stationDockedLabel = t(`common.${stationDocked ? 'yes' : 'no'}`)
  const chargingLabel = isCharging
    ? t('dashboard.telemetryTiles.dock.chargingActive', {
        level: chargingLevel,
        eta: formatMinutes(chargingEtaMinutes)
      })
    : t('dashboard.telemetryTiles.dock.chargingIdle')

  const batteryTooltip = t(`dashboard.telemetryTiles.battery.tooltip.${batteryStatus}`, {
    charge: batteryCharge,
    temp: batteryCellTemp
  })

  const videoBitrateDisplay = videoBitrateMbps.toFixed(1)

  let linksReasonKey: 'nominal' | 'latency' | 'bitrate' | 'offline' = 'nominal'
  if (!ethernetOnline && !lteOnline) linksReasonKey = 'offline'
  else if (controlLatencyMs > 250) linksReasonKey = 'latency'
  else if (videoBitrateMbps < 2) linksReasonKey = 'bitrate'
  else if (controlLatencyMs >= 100) linksReasonKey = 'latency'
  else if (videoBitrateMbps >= 2 && videoBitrateMbps <= 6) linksReasonKey = 'bitrate'
  const linksTooltipStatusKey = linksReasonKey === 'offline' ? 'red' : linksStatus
  const linksTooltip = t(`dashboard.telemetryTiles.links.tooltip.${linksTooltipStatusKey}.${linksReasonKey}`, {
    latency: controlLatencyMs,
    bitrate: videoBitrateDisplay
  })

  const gnssTooltip = t('dashboard.telemetryTiles.gnss.tooltip', {
    status: gnssStatus,
    satellites: gnssSatellites,
    hdop: gnssHdop.toFixed(1)
  })
  const missionTooltip =
    missionEtaMinutes === null
      ? t('dashboard.telemetryTiles.mission.tooltip.complete')
      : t('dashboard.telemetryTiles.mission.tooltip.progress', {
          name: missionName,
          percent: Math.round(missionProgress * 100),
          eta: formatMinutes(missionEtaMinutes)
        })

  const powerTooltip =
    powerStatus === 'red'
      ? t(`dashboard.telemetryTiles.power.tooltip.red.${powerFault ? 'fault' : 'lowUps'}`, {
          level: upsLevel,
          eta: upsEtaDisplay
        })
      : powerStatus === 'yellow'
        ? t('dashboard.telemetryTiles.power.tooltip.yellow', { level: upsLevel, eta: upsEtaDisplay })
        : t('dashboard.telemetryTiles.power.tooltip.green', { level: upsLevel })

  const connectivityTooltipKey = !ethernetOnline && !lteOnline
    ? 'offline'
    : connectivityRttMs > 250
      ? 'redLatency'
      : connectivityRttMs >= 100
        ? 'yellowLatency'
        : 'green'
  const connectivityTooltip = t(`dashboard.telemetryTiles.connectivity.tooltip.${connectivityTooltipKey}`, {
    latency: connectivityRttMs
  })

  const rtkTooltip = t(`dashboard.telemetryTiles.rtk.tooltip.${rtkStatusColor}`, {
    status: rtkMode,
    satellites: rtkSatellites,
    hdop: rtkHdop.toFixed(1)
  })

  const weatherTooltip = t(`dashboard.telemetryTiles.weather.tooltip.${weatherStatus}`, {
    avg: windAverage.toFixed(1),
    gust: windGust.toFixed(1),
    precipitation: precipitationLabel
  })

  const mechanicsTooltip = t(`dashboard.telemetryTiles.dock.tooltip.${mechanicsStatus}`, {
    hatch: hatchLabel,
    docked: stationDockedLabel,
    charging: chargingLabel
  })

  const isExpanded = expandedVideo !== null;

  if (isExpanded) {
    return (
      <>
          {expandedVideo === 'rgb' && (
            <VideoSection
              title={t('dashboard.rgbCamera')}
              subtitle={t('dashboard.rgbSubtitle')}
              src="/rgb.mp4"
              isExpanded={true}
              onExpand={() => setExpandedVideo(null)}
              onTakePhoto={() => { }}
              onSaveClip={() => { }}
            />
          )}
          {expandedVideo === 'thermal' && (
            <VideoSection
              title={t('dashboard.thermalCamera')}
              subtitle={t('dashboard.thermalSubtitle')}
              src="/rgb.mp4"
              filter="invert(1) sepia(1) saturate(6) hue-rotate(200deg) contrast(1.2) brightness(1.1)"
              isExpanded={true}
              onExpand={() => setExpandedVideo(null)}
              onTakePhoto={() => { }}
              onSaveClip={() => { }}
            />
          )}
        </>
    )
  }

  return (
    <>
      <div className="flex-1 relative flex flex-col">
        <VideoSection
          title={t('dashboard.rgbCamera')}
          subtitle={t('dashboard.rgbSubtitle')}
          src="/rgb.mp4"
          onExpand={() => setExpandedVideo('rgb')}
          onTakePhoto={() => { }}
          onSaveClip={() => { }}
        />
        <VideoSection
          title={t('dashboard.thermalCamera')}
          subtitle={t('dashboard.thermalSubtitle')}
          src="/rgb.mp4"
          filter="invert(1) sepia(1) saturate(6) hue-rotate(200deg) contrast(1.2) brightness(1.1)"
          onExpand={() => setExpandedVideo('thermal')}
          onTakePhoto={() => { }}
          onSaveClip={() => { }}
        />
        
        {!isExpanded && mode === 'manual' && (
          <div className="absolute left-2 bottom-2 select-none">
            <div className="bg-white/80 backdrop-blur rounded-md p-1 shadow border border-gray-200">
              <div className="grid grid-cols-3 gap-1">
                <div />
                <button
                  className="h-9 w-9 rounded bg-gray-100 hover:bg-gray-200 active:bg-gray-300 flex items-center justify-center"
                  onPointerDown={(e) => { e.preventDefault(); keys.current.up = true }}
                  onPointerUp={(e) => { e.preventDefault(); keys.current.up = false }}
                  onPointerLeave={() => { keys.current.up = false }}
                  aria-label={t('dashboard.forward')}
                  title={t('dashboard.forward')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>
                </button>
                <div />

                <button
                  className="h-9 w-9 rounded bg-gray-100 hover:bg-gray-200 active:bg-gray-300 flex items-center justify-center"
                  onPointerDown={(e) => { e.preventDefault(); keys.current.left = true }}
                  onPointerUp={(e) => { e.preventDefault(); keys.current.left = false }}
                  onPointerLeave={() => { keys.current.left = false }}
                  aria-label={t('dashboard.turnLeft')}
                  title={t('dashboard.turnLeft')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h13"/><path d="m11 5-7 7 7 7"/></svg>
                </button>
                <div className="h-9 w-9" />
                <button
                  className="h-9 w-9 rounded bg-gray-100 hover:bg-gray-200 active:bg-gray-300 flex items-center justify-center"
                  onPointerDown={(e) => { e.preventDefault(); keys.current.right = true }}
                  onPointerUp={(e) => { e.preventDefault(); keys.current.right = false }}
                  onPointerLeave={() => { keys.current.right = false }}
                  aria-label={t('dashboard.turnRight')}
                  title={t('dashboard.turnRight')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 12h13"/><path d="m13 5 7 7-7 7"/></svg>
                </button>

                <div />
                <button
                  className="h-9 w-9 rounded bg-gray-100 hover:bg-gray-200 active:bg-gray-300 flex items-center justify-center"
                  onPointerDown={(e) => { e.preventDefault(); keys.current.down = true }}
                  onPointerUp={(e) => { e.preventDefault(); keys.current.down = false }}
                  onPointerLeave={() => { keys.current.down = false }}
                  aria-label={t('dashboard.backward')}
                  title={t('dashboard.backward')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                </button>
                <div />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar - shows VideoSections or MapView when expanded */}
      <div className="w-184 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
        <div className="border-b border-gray-200 overflow-hidden relative aspect-video w-full">
          <MapView
            base={base}
            drone={drone}
            showLegend={false}
            title={t('dashboard.title')}
            subtitle={t('dashboard.subtitle')}
            physicsLogs={physicsLogs}
            onLogRemove={(id) => setPhysicsLogs(prev => prev.filter(log => log.id !== id))}
          />
        </div>

        {/* Section 3: Drone Telemetry - Scrollable */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <h3 className="text-xs font-semibold text-gray-700">{t('dashboard.telemetry')}</h3>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="inline-flex items-center gap-2" title="Wind 13 m/s > 10 m/s">
                <span className="relative flex h-6 w-6 items-center justify-center">
                  <Circle className="w-5 h-5 text-yellow-500" aria-hidden />
                  <Wind className="absolute w-3.5 h-3.5 text-yellow-500" aria-hidden />
                </span>
                <span className="text-yellow-600">GO</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <Plane className="w-3.5 h-3.5" aria-hidden />
                <span className="font-semibold">W locie</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <Timer className="w-3.5 h-3.5" aria-hidden />
                <span className="font-semibold text-gray-700">3s temu</span>
              </span>
            </div>
          </div>
          <div className="flex-1 p-2 flex flex-col gap-1.5 overflow-y-auto min-w-0">
            <div className="px-1 flex items-center gap-1.5">
              <div className="drop-shadow">
                <MarkerIcon color="#93c5fd" strokeColor="#ffffff" headingDegrees={drone.headingDegrees} size={20} />
              </div>
              <h4 className="text-[9px] font-semibold text-gray-600 uppercase tracking-wide">{t('dashboard.droneData')}</h4>
            </div>
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
              <TelemetryTile
                title={t('dashboard.telemetryTiles.battery.title')}
                status={batteryStatus}
                icon={<BatteryCharging className="h-3.5 w-3.5" aria-hidden />}
                tooltip={batteryTooltip}
                rows={[
                  { label: t('dashboard.telemetryTiles.battery.labels.charge'), value: `${batteryCharge}%` },
                  { label: t('dashboard.telemetryTiles.battery.labels.cellTemp'), value: `${batteryCellTemp}°C` },
                  { label: t('dashboard.telemetryTiles.battery.labels.etaFull'), value: formatMinutes(etaToFullMinutes) }
                ]}
              />
              <TelemetryTile
                title={t('dashboard.telemetryTiles.flight.title')}
                icon={<Compass className="h-3.5 w-3.5" aria-hidden />}
                rows={[
                  { label: t('dashboard.telemetryTiles.flight.labels.altitude'), value: `${altitudeMeters} m` },
                  {
                    label: t('dashboard.telemetryTiles.flight.labels.speedHv'),
                    value: `${horizontalSpeed.toFixed(1)} / ${verticalSpeed.toFixed(1)} m/s`
                  },
                  {
                    label: t('dashboard.telemetryTiles.flight.labels.heading'),
                    value: `${Math.round(drone.headingDegrees).toString().padStart(3, '0')}°`
                  }
                ]}
              />
              <TelemetryTile
                title={t('dashboard.telemetryTiles.links.title')}
                status={linksStatus}
                icon={<SignalHigh className="h-3.5 w-3.5" aria-hidden />}
                tooltip={linksTooltip}
                rows={[
                  { label: t('dashboard.telemetryTiles.links.labels.controlLatency'), value: `${controlLatencyMs} ms` },
                  { label: t('dashboard.telemetryTiles.links.labels.videoBitrate'), value: `${videoBitrateDisplay} Mb/s` }
                ]}
              />
              <TelemetryTile
                title={t('dashboard.telemetryTiles.gnss.title')}
                icon={<Satellite className="h-3.5 w-3.5" aria-hidden />}
                tooltip={gnssTooltip}
                rows={[
                  { label: t('dashboard.telemetryTiles.gnss.labels.status'), value: gnssStatus },
                  { label: t('dashboard.telemetryTiles.gnss.labels.satellites'), value: gnssSatellites.toString() },
                  { label: t('dashboard.telemetryTiles.gnss.labels.hdop'), value: gnssHdop.toFixed(1) }
                ]}
              />
              <TelemetryTile
                title={t('dashboard.telemetryTiles.mission.title')}
                icon={<Timer className="h-3.5 w-3.5" aria-hidden />}
                tooltip={missionTooltip}
                rows={[
                  { label: t('dashboard.telemetryTiles.mission.labels.name'), value: missionName },
                  { label: t('dashboard.telemetryTiles.mission.labels.step'), value: missionCurrentStep },
                  { label: t('dashboard.telemetryTiles.mission.labels.etaDock'), value: missionEtaDisplay }
                ]}
              />
            </div>
            <div className="px-1 flex items-center gap-1.5 pt-2">
              <div className="drop-shadow">
                <MarkerIcon color="#fca5a5" strokeColor="#ffffff" headingDegrees={0} size={20} />
              </div>
              <h4 className="text-[9px] font-semibold text-gray-600 uppercase tracking-wide">
                {t('dashboard.dockingStation')}
              </h4>
            </div>
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
              <TelemetryTile
                title={t('dashboard.telemetryTiles.power.title')}
                status={powerStatus}
                icon={<Zap className="h-3.5 w-3.5" aria-hidden />}
                tooltip={powerTooltip}
                rows={[
                  { label: t('dashboard.telemetryTiles.power.labels.source'), value: powerSourceLabel },
                  { label: t('dashboard.telemetryTiles.power.labels.ups'), value: upsDisplay },
                  { label: t('dashboard.telemetryTiles.power.labels.fault'), value: powerFaultLabel }
                ]}
              />
              <TelemetryTile
                title={t('dashboard.telemetryTiles.connectivity.title')}
                status={connectivityStatus}
                icon={<Globe className="h-3.5 w-3.5" aria-hidden />}
                tooltip={connectivityTooltip}
                rows={[
                  { label: t('dashboard.telemetryTiles.connectivity.labels.ethernet'), value: ethernetLabel },
                  { label: t('dashboard.telemetryTiles.connectivity.labels.lte'), value: lteLabel },
                  { label: t('dashboard.telemetryTiles.connectivity.labels.rtt'), value: `${connectivityRttMs} ms` }
                ]}
              />
              <TelemetryTile
                title={t('dashboard.telemetryTiles.rtk.title')}
                status={rtkStatusColor}
                icon={<Radio className="h-3.5 w-3.5" aria-hidden />}
                tooltip={rtkTooltip}
                rows={[
                  { label: t('dashboard.telemetryTiles.rtk.labels.status'), value: rtkMode },
                  { label: t('dashboard.telemetryTiles.rtk.labels.satellites'), value: rtkSatellites.toString() },
                  { label: t('dashboard.telemetryTiles.rtk.labels.hdop'), value: rtkHdop.toFixed(1) }
                ]}
              />
              <TelemetryTile
                title={t('dashboard.telemetryTiles.weather.title')}
                status={weatherStatus}
                icon={<CloudRain className="h-3.5 w-3.5" aria-hidden />}
                tooltip={weatherTooltip}
                rows={[
                  {
                    label: t('dashboard.telemetryTiles.weather.labels.wind'),
                    value: `${windAverage.toFixed(1)} / ${windGust.toFixed(1)} m/s`
                  },
                  { label: t('dashboard.telemetryTiles.weather.labels.precipitation'), value: precipitationLabel }
                ]}
              />
              <TelemetryTile
                title={t('dashboard.telemetryTiles.dock.title')}
                status={mechanicsStatus}
                icon={<Cog className="h-3.5 w-3.5" aria-hidden />}
                tooltip={mechanicsTooltip}
                rows={[
                  { label: t('dashboard.telemetryTiles.dock.labels.hatch'), value: hatchLabel },
                  { label: t('dashboard.telemetryTiles.dock.labels.docked'), value: stationDockedLabel },
                  { label: t('dashboard.telemetryTiles.dock.labels.charging'), value: chargingLabel }
                ]}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Mission Status & Controls - Fixed at bottom */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-white">
          <div className="p-2 flex flex-col gap-1.5">
            <OperationalLog missionId="current" />
            {/* Mission Status (auto) or Instructions (manual) */}
            {mode === 'auto' ? (
              <div className="bg-gray-50 p-1.5 pb-4 rounded border border-gray-200">
                <div className="flex items-center gap-1 justify-between mb-2">
                  <div className="text-[9px] text-gray-500 uppercase tracking-wide">{t('dashboard.missionStatus')}</div>
                  <div className="text-[9px] text-gray-500 uppercase tracking-wide">
                    {t('dashboard.inProgress')} ({Math.round(missionProgress * 100)}%)
                  </div>
                </div>
                {/* Progress Visualization: Start -> Waypoints -> Landing/Docking */}
                <MissionProgress
                  progress={missionProgress}
                  stages={missionStages}
                />
              </div>
            ) : (
              <div className="bg-gray-50 p-1 py-2 rounded border border-gray-200">
                <div className="text-[9px] text-gray-600 text-center">
                  {t('dashboard.manualInstructions')}
                </div>
              </div>
            )}

            {/* Control Buttons - Grouped & Larger */}
            <div className="inline-flex w-full pt-0.5 rounded-md overflow-hidden">
              <Button variant="secondary" className="h-10 text-sm flex-1 rounded-none first:rounded-l-md bg-yellow-200 hover:bg-yellow-300 text-yellow-800">
                <Pause className="w-4 h-4 mr-1.5" />
                {t('dashboard.pause')}
              </Button>
              <Button variant="secondary" className="h-10 text-sm flex-1 rounded-none bg-blue-200 hover:bg-blue-300 text-blue-800">
                <Home className="w-4 h-4 mr-1.5" />
                {t('dashboard.home')}
              </Button>
              <Button
                variant="destructive"
                className="h-10 text-sm flex-1 rounded-none last:rounded-r-md bg-red-200 hover:bg-red-300 text-red-800"
                onClick={() => setMode((m) => (m === 'manual' ? 'auto' : 'manual'))}
                title={mode === 'manual' ? t('dashboard.switchToAuto') : t('dashboard.switchToManual')}
              >
                <Joystick className="w-4 h-4 mr-1.5" />
                {mode === 'auto' ? t('dashboard.manual') : t('dashboard.auto')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

