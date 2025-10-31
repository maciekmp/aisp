import { useMemo, useRef } from 'react'
import Map, { NavigationControl, Source, Layer, Marker, type MapRef } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import factoryPolygon from '../tesla.json'
import bbox from '@turf/bbox'
import type { Feature, Polygon } from 'geojson'

type MarkerData = { longitude: number; latitude: number; headingDegrees?: number }

export function FactoryMap(props?: { base?: MarkerData; drone?: MarkerData }) {
  const mapRef = useRef<MapRef | null>(null)

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined

  const { bounds, initialViewState } = useMemo(() => {
    const feature = factoryPolygon as unknown as Feature<Polygon>
    const [minLng, minLat, maxLng, maxLat] = bbox(feature)
    return {
      bounds: [[minLng, minLat], [maxLng, maxLat]] as [[number, number], [number, number]],
      initialViewState: {
        longitude: (minLng + maxLng) / 2,
        latitude: (minLat + maxLat) / 2,
        zoom: 14
      }
    }
  }, [])

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

  return (
    <Map
      ref={mapRef}
      initialViewState={initialViewState}
      mapStyle="mapbox://styles/mapbox/light-v11"
      mapboxAccessToken={mapboxToken}
      style={{ width: '100%', height: '100%' }}
      onLoad={() => {
        mapRef.current?.fitBounds(bounds, { padding: 40, duration: 800 })
      }}
    >
      <NavigationControl position="top-right" />
      <Source id="factory" type="geojson" data={factoryPolygon as unknown as Feature<Polygon>}>
        <Layer
          id="factory-fill"
          type="fill"
          paint={{ 'fill-color': '#3b82f6', 'fill-opacity': 0.25 }}
        />
        <Layer
          id="factory-outline"
          type="line"
          paint={{ 'line-color': '#1d4ed8', 'line-width': 2 }}
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


