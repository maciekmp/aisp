import { useMemo, useRef, useState, useEffect } from 'react'
import Map, { NavigationControl, Source, Layer, Marker, type MapRef } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Layers } from 'lucide-react'
import controlledAreaPolygon from '../tesla.json'
import bbox from '@turf/bbox'
import type { Feature, Polygon, LineString, Point, FeatureCollection } from 'geojson'

type MarkerData = { longitude: number; latitude: number; headingDegrees?: number }

export function FactoryMap(props?: { base?: MarkerData; drone?: MarkerData }) {
  const mapRef = useRef<MapRef | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [satelliteView, setSatelliteView] = useState(false)
  const [showControlledArea, setShowControlledArea] = useState(true)
  const [showMissionPath, setShowMissionPath] = useState(true)
  const [showAlerts, setShowAlerts] = useState(true)

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
        zoom: 14
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

  function MarkerIcon({ color, strokeColor, headingDegrees }: { color: string; strokeColor: string; headingDegrees: number }) {
    // Circle radius and arrow geometry
    const r = 14 // circle radius (px)
    const gap = 4 // gap between circle and arrow (px)
    const triH = 16 // arrow height
    const triW = 14 // arrow width
    // Canvas size big enough to contain rotated arrow
    const size = 64
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
          <polygon points={points} fill={color} stroke={strokeColor} strokeWidth={3} strokeLinejoin="round" />
          <circle cx={0} cy={0} r={r} fill={color} stroke={strokeColor} strokeWidth={3} />
        </g>
      </svg>
    )
  }

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
      dragRotate={false}
      pitchWithRotate={false}
      touchPitch={false}
      onLoad={() => {
        mapRef.current?.fitBounds(bounds, { padding: 40, duration: 800 })
      }}
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

      {/* Mission Path Layer */}
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
            'line-color': '#10b981',
            'line-width': 3,
            'line-dasharray': [2, 2]
          }}
        />
      </Source>

      {/* Alerts Layer */}
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

      {/* Base station marker (centered at coordinate) */}
      <Marker longitude={baseLon} latitude={baseLat} anchor="center">
        <div title="Base Station" className="drop-shadow">
          <MarkerIcon color="#93c5fd" strokeColor="#ffffff" headingDegrees={baseHeading} />
        </div>
      </Marker>

      {/* Drone position marker (slightly offset from center) */}
      <Marker longitude={droneLon} latitude={droneLat} anchor="center">
        <div title="Drone (current)" className="drop-shadow">
          <MarkerIcon color="#fca5a5" strokeColor="#ffffff" headingDegrees={droneHeading} />
        </div>
      </Marker>
    </Map>
  )
}


