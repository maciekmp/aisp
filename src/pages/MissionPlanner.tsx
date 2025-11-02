import { useState, useMemo, useEffect } from 'react'
import { MapView } from '@/components/MapView'
import { Button } from '@/components/ui/button'
import { Trash2, Calendar, Route } from 'lucide-react'
import bbox from '@turf/bbox'
import factoryPolygon from '../tesla.json'
import type { Feature, Polygon } from 'geojson'

type Waypoint = {
  id: string
  longitude: number
  latitude: number
  name: string
  order: number
}

export function MissionPlanner() {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([])
  const [activeTab, setActiveTab] = useState<'route' | 'timeline'>('route')
  const [editingWaypoint, setEditingWaypoint] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const { center } = useMemo(() => {
    const [minLng, minLat, maxLng, maxLat] = bbox(factoryPolygon as unknown as Feature<Polygon>)
    return {
      center: { longitude: (minLng + maxLng) / 2, latitude: (minLat + maxLat) / 2 }
    }
  }, [])

  // Load waypoints from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('mission_waypoints')
    if (stored) {
      try {
        setWaypoints(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse stored waypoints:', e)
      }
    }
  }, [])

  // Save waypoints to localStorage
  useEffect(() => {
    if (waypoints.length > 0) {
      localStorage.setItem('mission_waypoints', JSON.stringify(waypoints))
    }
  }, [waypoints])

  const handleMapClick = (event: { lngLat: { lng: number; lat: number } }) => {
    const newWaypoint: Waypoint = {
      id: Date.now().toString(),
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat,
      name: `Waypoint ${waypoints.length + 1}`,
      order: waypoints.length + 1
    }
    setWaypoints([...waypoints, newWaypoint])
  }

  const handleDeleteWaypoint = (id: string) => {
    const updated = waypoints.filter(w => w.id !== id).map((w, index) => ({
      ...w,
      order: index + 1
    }))
    setWaypoints(updated)
  }

  const handleEditWaypoint = (id: string) => {
    const waypoint = waypoints.find(w => w.id === id)
    if (waypoint) {
      setEditingWaypoint(id)
      setEditingName(waypoint.name)
    }
  }

  const handleSaveEdit = () => {
    if (editingWaypoint && editingName.trim()) {
      setWaypoints(waypoints.map(w =>
        w.id === editingWaypoint ? { ...w, name: editingName.trim() } : w
      ))
      setEditingWaypoint(null)
      setEditingName('')
    }
  }

  return (
    <div className="flex-1 flex">
      {/* Map Section */}
      <div className="flex-1 relative">
        <MapView
          base={{ longitude: center.longitude, latitude: center.latitude, headingDegrees: 0 }}
          onClick={handleMapClick}
        />
      </div>

      {/* Sidebar */}
      <div className="w-[400px] bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Mission Planner</h2>
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'route' ? 'default' : 'outline'}
              onClick={() => setActiveTab('route')}
              className="flex-1"
            >
              <Route className="w-4 h-4 mr-2" />
              Route
            </Button>
            <Button
              variant={activeTab === 'timeline' ? 'default' : 'outline'}
              onClick={() => setActiveTab('timeline')}
              className="flex-1"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Timeline
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'route' ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  Click on the map to add waypoints. Drag markers to reposition.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-700">Waypoints ({waypoints.length})</h3>
                {waypoints.length === 0 ? (
                  <p className="text-sm text-gray-500">No waypoints added yet</p>
                ) : (
                  <div className="space-y-2">
                    {waypoints
                      .sort((a, b) => a.order - b.order)
                      .map((waypoint) => (
                        <div
                          key={waypoint.id}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
                              {waypoint.order}
                            </div>
                            {editingWaypoint === waypoint.id ? (
                              <div className="flex-1 flex gap-2">
                                <input
                                  type="text"
                                  value={editingName}
                                  onChange={(e) => setEditingName(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveEdit()
                                    if (e.key === 'Escape') {
                                      setEditingWaypoint(null)
                                      setEditingName('')
                                    }
                                  }}
                                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                                  autoFocus
                                />
                                <Button
                                  size="sm"
                                  onClick={handleSaveEdit}
                                  variant="default"
                                >
                                  Save
                                </Button>
                              </div>
                            ) : (
                              <>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">
                                    {waypoint.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {waypoint.latitude.toFixed(6)}, {waypoint.longitude.toFixed(6)}
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditWaypoint(waypoint.id)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteWaypoint(waypoint.id)}
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Mission Timeline</h3>
              {waypoints.length === 0 ? (
                <p className="text-sm text-gray-500">Add waypoints to see mission timeline</p>
              ) : (
                <div className="space-y-3">
                  {waypoints
                    .sort((a, b) => a.order - b.order)
                    .map((waypoint, index) => (
                      <div key={waypoint.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
                            {waypoint.order}
                          </div>
                          {index < waypoints.length - 1 && (
                            <div className="w-0.5 h-8 bg-gray-300 flex-1"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="font-medium text-gray-900">{waypoint.name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Estimated arrival: {index * 5 + 10} minutes
                          </div>
                          <div className="text-xs text-gray-500">
                            Actions: Navigate, Survey, Record
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        {activeTab === 'route' && waypoints.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <Button className="w-full" variant="default">
              Save Mission Route
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

