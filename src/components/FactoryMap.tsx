import { useMemo, useRef } from 'react'
import Map, { NavigationControl, Source, Layer, type MapRef } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import factoryPolygon from '../tesla.json'
import bbox from '@turf/bbox'

export function FactoryMap() {
  const mapRef = useRef<MapRef | null>(null)

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined

  const { bounds, initialViewState } = useMemo(() => {
    const [minLng, minLat, maxLng, maxLat] = bbox(factoryPolygon as any)
    return {
      bounds: [[minLng, minLat], [maxLng, maxLat]] as [[number, number], [number, number]],
      initialViewState: {
        longitude: (minLng + maxLng) / 2,
        latitude: (minLat + maxLat) / 2,
        zoom: 14
      }
    }
  }, [])

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
      <Source id="factory" type="geojson" data={factoryPolygon as any}>
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
    </Map>
  )
}


