import bbox from '@turf/bbox'
import type { Feature, Polygon } from 'geojson'

/**
 * Calculate map bounds and center point from a GeoJSON polygon feature
 * @param feature - GeoJSON polygon feature
 * @returns Bounds and center coordinates
 */
export function calculateMapBounds(feature: Feature<Polygon>) {
  const [minLng, minLat, maxLng, maxLat] = bbox(feature)
  return {
    bounds: { minLng, minLat, maxLng, maxLat },
    center: {
      longitude: (minLng + maxLng) / 2,
      latitude: (minLat + maxLat) / 2,
    },
  }
}

