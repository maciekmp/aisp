import { useMemo, useRef, useState, useEffect } from 'react'
import Map, { NavigationControl, Source, Layer, Marker, type MapRef } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Layers, HelpCircle, X } from 'lucide-react'
import controlledAreaPolygon from '../tesla.json'
import bbox from '@turf/bbox'
import type { Feature, Polygon, LineString, Point, FeatureCollection } from 'geojson'
import type { MarkerData } from '@/types'
import { MAP_CONFIG, DRONE_TRACE } from '@/constants'

/**
 * Renders a marker icon with directional arrow indicator
 * @param color - Fill color for the marker circle and arrow
 * @param strokeColor - Stroke color for the marker outline
 * @param headingDegrees - Heading angle in degrees (0-360, where 0 is north)
 * @param size - Icon size in pixels (default: 64)
 */
export function MarkerIcon({ color, strokeColor, headingDegrees, size = 64 }: { color: string; strokeColor: string; headingDegrees: number; size?: number }) {
  // Scale based on size parameter
  const scale = size / 64
  const r = 14 * scale // circle radius (px)
  const gap = 4 * scale // gap between circle and arrow (px)
  const triH = 16 * scale // arrow height
  const triW = 14 * scale // arrow width
  const cx = size / 2
  const cy = size / 2
  // Triangle points in local coords where (0,0) is circle center; pointing up initially
  const baseY = -(r + gap)
  const tipY = baseY - triH
  const halfW = triW / 2
  const points = `${0},${tipY} ${halfW},${baseY} ${-halfW},${baseY}`
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <g transform={`translate(${cx}, ${cy}) rotate(${headingDegrees})`}>
        <polygon points={points} fill={color} stroke={strokeColor} strokeWidth={3 * scale} strokeLinejoin="round" />
        <circle cx={0} cy={0} r={r} fill={color} stroke={strokeColor} strokeWidth={3 * scale} />
      </g>
    </svg>
  )
}

/**
 * Interactive map view component with drone tracking, waypoints, and mission visualization
 * @param props - Map view configuration
 * @param props.base - Base station marker position and heading
 * @param props.drone - Drone marker position and heading
 * @param props.showLegend - Whether to show the map legend (default: true)
 * @param props.onClick - Callback when map is clicked (receives lng/lat coordinates)
 */
export function MapView(props?: { base?: MarkerData; drone?: MarkerData; showLegend?: boolean; onClick?: (event: { lngLat: { lng: number; lat: number } }) => void }) {
  const mapRef = useRef<MapRef | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLegendOpen, setIsLegendOpen] = useState(false)
  const showLegend = props?.showLegend !== false // default to true if not specified
  const [satelliteView, setSatelliteView] = useState(false)
  const [showControlledArea, setShowControlledArea] = useState(true)
  const [showMissionPath, setShowMissionPath] = useState(true)
  const [showDroneTrace, setShowDroneTrace] = useState(true)
  const [showAlerts, setShowAlerts] = useState(true)
  const [droneTrace, setDroneTrace] = useState<[number, number][]>([])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined

  const { bounds, initialViewState, controlledAreaFeature } = useMemo(() => {
    const feature = controlledAreaPolygon as unknown as Feature<Polygon>
    const [minLng, minLat, maxLng, maxLat] = bbox(feature)
    return {
      bounds: [[minLng, minLat], [maxLng, maxLat]] as [[number, number], [number, number]],
      initialViewState: {
        longitude: (minLng + maxLng) / 2,
        latitude: (minLat + maxLat) / 2,
        zoom: MAP_CONFIG.DEFAULT_ZOOM
      },
      controlledAreaFeature: feature
    }
  }, [])

  // Placeholder mission path (example LineString)
  const missionPath = useMemo<FeatureCollection<LineString>>(() => {
    const centerLng = initialViewState.longitude
    const centerLat = initialViewState.latitude
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [centerLng - 0.002, centerLat - 0.002],
              [centerLng - 0.001, centerLat - 0.001],
              [centerLng, centerLat],
              [centerLng + 0.001, centerLat + 0.001],
              [centerLng + 0.002, centerLat + 0.002],
              [centerLng + 0.002, centerLat + 0.003],
            ]
          },
          properties: {}
        }
      ]
    }
  }, [initialViewState.longitude, initialViewState.latitude])

  // Placeholder alerts (example Points)
  const alerts = useMemo<FeatureCollection<Point>>(() => {
    const centerLng = initialViewState.longitude
    const centerLat = initialViewState.latitude
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [centerLng + 0.001, centerLat + 0.0015]
          },
          properties: { type: 'warning', message: 'Obstacle detected' }
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [centerLng - 0.0015, centerLat + 0.002]
          },
          properties: { type: 'error', message: 'Restricted zone' }
        }
      ]
    }
  }, [initialViewState.longitude, initialViewState.latitude])

  // Positions and headings (defaults if not provided)
  const baseLon = props?.base?.longitude ?? initialViewState.longitude
  const baseLat = props?.base?.latitude ?? initialViewState.latitude
  const baseHeading = props?.base?.headingDegrees ?? 0

  const droneLon = props?.drone?.longitude ?? (initialViewState.longitude + 0.0015)
  const droneLat = props?.drone?.latitude ?? (initialViewState.latitude + 0.001)
  const droneHeading = props?.drone?.headingDegrees ?? 45

  // Track drone trace path
  useEffect(() => {
    if (props?.drone) {
      setDroneTrace((prev) => {
        const newPoint: [number, number] = [props.drone!.longitude, props.drone!.latitude]
        // Initialize with first point or add if moved significantly (avoid duplicate points)
        if (prev.length === 0) {
          return [newPoint]
        }
        const lastPoint = prev[prev.length - 1]
        if (Math.abs(lastPoint[0] - newPoint[0]) > DRONE_TRACE.MIN_DISTANCE_THRESHOLD ||
            Math.abs(lastPoint[1] - newPoint[1]) > DRONE_TRACE.MIN_DISTANCE_THRESHOLD) {
          const updated = [...prev, newPoint]
          // Limit trace to max points, keeping the most recent
          return updated.length > DRONE_TRACE.MAX_TRACE_POINTS 
            ? updated.slice(-DRONE_TRACE.MAX_TRACE_POINTS)
            : updated
        }
        return prev
      })
    }
  }, [props?.drone])

  // Drone trace as LineString
  const droneTracePath = useMemo<FeatureCollection<LineString>>(() => {
    if (droneTrace.length < 2) {
      return {
        type: 'FeatureCollection',
        features: []
      }
    }
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: droneTrace
          },
          properties: {}
        }
      ]
    }
  }, [droneTrace])

  if (!mapboxToken) {
    return (
      <div className="fixed inset-0 flex items-center justify-center font-sans">
        <div>
          <p><strong>Missing VITE_MAPBOX_TOKEN</strong></p>
          <p>Add it to a .env file and restart Vite.</p>
        </div>
      </div>
    )
  }

  const mapStyle = satelliteView 
    ? "mapbox://styles/mapbox/satellite-v9" 
    : "mapbox://styles/mapbox/light-v11"

  return (
    <Map
      ref={mapRef}
      initialViewState={initialViewState}
      mapStyle={mapStyle}
      mapboxAccessToken={mapboxToken}
      style={{ width: '100%', height: '100%' }}
      keyboard={false}
      dragRotate={false}
      pitchWithRotate={false}
      touchPitch={false}
      onLoad={() => {
        mapRef.current?.fitBounds(bounds, { padding: MAP_CONFIG.BOUNDS_PADDING, duration: MAP_CONFIG.BOUNDS_ANIMATION_DURATION })
      }}
      onClick={props?.onClick}
    >
      <NavigationControl position="top-right" showCompass={false} />
      
      {/* Layer Toggle Dropdown */}
      <div ref={dropdownRef} className="absolute top-0 right-0 z-10" style={{ marginTop: '80px', marginRight: '10px' }}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 w-7 h-7 flex items-center justify-center transition-colors"
          title="Map Layers"
          aria-label="Toggle map layers"
        >
          <Layers className="w-4 h-4 text-gray-700" />
        </button>
        
        {isDropdownOpen && (
          <div className="absolute top-full right-0 mt-1 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-2 w-48">
            <div className="text-xs font-semibold text-gray-700 px-2 py-1.5 border-b border-gray-200 mb-1">
              Map Layers
            </div>
            <div className="space-y-1">
              <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={satelliteView}
                  onChange={(e) => setSatelliteView(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Satellite View</span>
              </label>
              <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={showControlledArea}
                  onChange={(e) => setShowControlledArea(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Controlled Area</span>
              </label>
              <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={showMissionPath}
                  onChange={(e) => setShowMissionPath(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Mission Path</span>
              </label>
              <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDroneTrace}
                  onChange={(e) => setShowDroneTrace(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Drone Trace</span>
              </label>
              <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAlerts}
                  onChange={(e) => setShowAlerts(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Alerts</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Controlled Area Layer */}
      <Source id="controlledArea" type="geojson" data={controlledAreaFeature}>
        <Layer
          id="controlledArea-fill"
          type="fill"
          layout={{ visibility: showControlledArea ? 'visible' : 'none' }}
          paint={{ 'fill-color': '#3b82f6', 'fill-opacity': 0.25 }}
        />
        <Layer
          id="controlledArea-outline"
          type="line"
          layout={{ visibility: showControlledArea ? 'visible' : 'none' }}
          paint={{ 'line-color': '#1d4ed8', 'line-width': 2 }}
        />
      </Source>

      {/* Base station marker (rendered first, so drone appears above it) */}
      <Marker longitude={baseLon} latitude={baseLat} anchor="center">
        <div title="Base Station" className="drop-shadow">
          <MarkerIcon color="#fca5a5" strokeColor="#ffffff" headingDegrees={baseHeading} />
        </div>
      </Marker>

      {/* Mission Path Layer (planned route - canvas layer) */}
      <Source id="missionPath" type="geojson" data={missionPath}>
        <Layer
          id="missionPath-line"
          type="line"
          layout={{ 
            visibility: showMissionPath ? 'visible' : 'none',
            'line-join': 'round',
            'line-cap': 'round'
          }}
          paint={{ 
            'line-color': '#6b7280',
            'line-width': 3,
            'line-dasharray': [2, 2]
          }}
        />
      </Source>

      {/* Drone Trace Layer (actual path traveled - green line) */}
      <Source id="droneTrace" type="geojson" data={droneTracePath}>
        <Layer
          id="droneTrace-line"
          type="line"
          layout={{ 
            visibility: showDroneTrace ? 'visible' : 'none',
            'line-join': 'round',
            'line-cap': 'round'
          }}
          paint={{ 
            'line-color': '#10b981',
            'line-width': 2
          }}
        />
      </Source>

      {/* Alerts Layer (canvas layer) */}
      <Source id="alerts" type="geojson" data={alerts}>
        <Layer
          id="alerts-circle"
          type="circle"
          layout={{ visibility: showAlerts ? 'visible' : 'none' }}
          paint={{
            'circle-radius': 8,
            'circle-color': [
              'match',
              ['get', 'type'],
              'error',
              '#ef4444',
              'warning',
              '#f59e0b',
              '#3b82f6'
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }}
        />
      </Source>

      {/* Drone position marker (rendered last, so it appears above base and path) */}
      <Marker longitude={droneLon} latitude={droneLat} anchor="center">
        <div title="Drone (current)" className="drop-shadow">
          <MarkerIcon color="#93c5fd" strokeColor="#ffffff" headingDegrees={droneHeading} />
        </div>
      </Marker>

      {/* Help Button with Legend Panel */}
      {showLegend && (
        <>
          <div className="absolute bottom-6 right-2 z-10">
            <button
              onClick={() => setIsLegendOpen(!isLegendOpen)}
              className="bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 w-7 h-7 flex items-center justify-center transition-colors"
              title="Map Legend"
              aria-label="Toggle map legend"
            >
              <HelpCircle className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          {/* Legend Panel - Slides from bottom */}
          <div
            className={`absolute bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg transition-transform duration-300 ease-in-out ${
              isLegendOpen ? 'translate-y-0' : 'translate-y-full'
            }`}
            style={{ maxHeight: '50%' }}
          >
        <div className="p-4 overflow-y-auto" style={{ maxHeight: '50vh' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Map Legend</h3>
            <button
              onClick={() => setIsLegendOpen(false)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label="Close legend"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Markers */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Markers</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 flex items-center justify-center drop-shadow">
                    <MarkerIcon color="#fca5a5" strokeColor="#ffffff" headingDegrees={0} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">Base Station</div>
                    <div className="text-xs text-gray-500">Fixed ground control point</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 flex items-center justify-center drop-shadow">
                    <MarkerIcon color="#93c5fd" strokeColor="#ffffff" headingDegrees={45} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">Drone</div>
                    <div className="text-xs text-gray-500">Current position and heading</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Layers */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Layers</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded border-2 border-blue-600" style={{ backgroundColor: 'rgba(59, 130, 246, 0.25)' }}></div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">Controlled Area</div>
                    <div className="text-xs text-gray-500">Designated operation zone</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-1 bg-gray-500" style={{ backgroundImage: 'repeating-linear-gradient(to right, #6b7280 0, #6b7280 4px, transparent 4px, transparent 8px)' }}></div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">Mission Path</div>
                    <div className="text-xs text-gray-500">Planned flight route</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-1 bg-green-500"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">Drone Trace</div>
                    <div className="text-xs text-gray-500">Actual path traveled</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">Alert (Error)</div>
                    <div className="text-xs text-gray-500">Critical issues or restrictions</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">Alert (Warning)</div>
                    <div className="text-xs text-gray-500">Cautionary notifications</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
          </div>
        </>
      )}
    </Map>
  )
}

