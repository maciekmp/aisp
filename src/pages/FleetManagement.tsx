import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Drone, HardDrive, Activity, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import type { DroneItem, DockStation } from '@/types'
import { UI_CONFIG } from '@/constants'

const mockDrones: DroneItem[] = [
  {
    id: '1',
    name: 'Drone Alpha-01',
    status: 'mission',
    battery: 85,
    location: { latitude: 50.0614, longitude: 19.9366 },
    currentMission: 'Patrol Route A',
    lastUpdate: Date.now() - 120000
  },
  {
    id: '2',
    name: 'Drone Beta-02',
    status: 'docked',
    battery: 100,
    lastUpdate: Date.now() - 300000
  },
  {
    id: '3',
    name: 'Drone Gamma-03',
    status: 'error',
    battery: 45,
    lastUpdate: Date.now() - 600000
  },
  {
    id: '4',
    name: 'Drone Delta-04',
    status: 'active',
    battery: 92,
    lastUpdate: Date.now() - 60000
  }
]

const mockDocks: DockStation[] = [
  {
    id: 'dock-1',
    name: 'Docking Station North',
    status: 'operational',
    droneCount: 1,
    capacity: 2,
    temperature: 22,
    humidity: 45,
    lastUpdate: Date.now() - 180000
  },
  {
    id: 'dock-2',
    name: 'Docking Station South',
    status: 'charging',
    droneCount: 2,
    capacity: 2,
    temperature: 21,
    humidity: 48,
    lastUpdate: Date.now() - 120000
  },
  {
    id: 'dock-3',
    name: 'Docking Station East',
    status: 'maintenance',
    droneCount: 0,
    capacity: 1,
    temperature: 20,
    humidity: 50,
    lastUpdate: Date.now() - 3600000
  }
]

export function FleetManagement() {
  const [activeTab, setActiveTab] = useState<'drones' | 'docks'>('drones')
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [logs, setLogs] = useState<{ id: string; timestamp: number; message: string }[]>([])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'operational':
        return 'bg-green-100 text-green-800'
      case 'mission':
      case 'charging':
        return 'bg-blue-100 text-blue-800'
      case 'docked':
        return 'bg-gray-100 text-gray-800'
      case 'error':
      case 'maintenance':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    if (status === 'active' || status === 'operational') {
      return <CheckCircle className="w-4 h-4 text-green-600" />
    }
    if (status === 'error') {
      return <AlertCircle className="w-4 h-4 text-red-600" />
    }
    return <Activity className="w-4 h-4 text-blue-600" />
  }

  const handleViewLogs = (id: string) => {
    setSelectedItem(id)
    // Mock logs
    setLogs([
      { id: '1', timestamp: Date.now() - 3600000, message: 'System initialized' },
      { id: '2', timestamp: Date.now() - 1800000, message: 'Mission started: Patrol Route A' },
      { id: '3', timestamp: Date.now() - 900000, message: 'Waypoint 3 reached' },
      { id: '4', timestamp: Date.now() - 600000, message: 'Battery level: 85%' },
      { id: '5', timestamp: Date.now() - 300000, message: 'Camera feed active' }
    ])
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(UI_CONFIG.DEFAULT_LOCALE)
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-white">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Fleet & Dock Management</h1>
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'drones' ? 'default' : 'outline'}
              onClick={() => setActiveTab('drones')}
            >
              <Drone className="w-4 h-4 mr-2" />
              Drones ({mockDrones.length})
            </Button>
            <Button
              variant={activeTab === 'docks' ? 'default' : 'outline'}
              onClick={() => setActiveTab('docks')}
            >
              <HardDrive className="w-4 h-4 mr-2" />
              Docking Stations ({mockDocks.length})
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'drones' ? (
            <div className="space-y-4">
              {mockDrones.map((drone) => (
                <div
                  key={drone.id}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Drone className="w-6 h-6 text-gray-600" />
                      <div>
                        <div className="font-semibold text-gray-900">{drone.name}</div>
                        <div className="text-sm text-gray-500">
                          Last update: {formatDate(drone.lastUpdate)}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${getStatusColor(drone.status)}`}>
                      {getStatusIcon(drone.status)}
                      {drone.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Battery</div>
                      <div className="text-sm font-medium">{drone.battery}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className={`h-1.5 rounded-full ${drone.battery > 50 ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${drone.battery}%` }}
                        ></div>
                      </div>
                    </div>
                    {drone.currentMission && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Mission</div>
                        <div className="text-sm font-medium">{drone.currentMission}</div>
                      </div>
                    )}
                    {drone.location && (
                      <div className="col-span-2">
                        <div className="text-xs text-gray-500 mb-1">Location</div>
                        <div className="text-sm font-medium">
                          {drone.location.latitude.toFixed(6)}, {drone.location.longitude.toFixed(6)}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewLogs(drone.id)}
                    className="w-full"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Logs
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {mockDocks.map((dock) => (
                <div
                  key={dock.id}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <HardDrive className="w-6 h-6 text-gray-600" />
                      <div>
                        <div className="font-semibold text-gray-900">{dock.name}</div>
                        <div className="text-sm text-gray-500">
                          Last update: {formatDate(dock.lastUpdate)}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${getStatusColor(dock.status)}`}>
                      {getStatusIcon(dock.status)}
                      {dock.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Capacity</div>
                      <div className="text-sm font-medium">
                        {dock.droneCount} / {dock.capacity} drones
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: `${(dock.droneCount / dock.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Temperature</div>
                      <div className="text-sm font-medium">{dock.temperature}°C</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Humidity</div>
                      <div className="text-sm font-medium">{dock.humidity}%</div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewLogs(dock.id)}
                    className="w-full"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Logs
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Logs Panel */}
      {selectedItem && (
        <div className="w-[400px] bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Logs</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="text-sm border-b border-gray-100 pb-2">
                  <div className="text-xs text-gray-500 mb-1">{formatDate(log.timestamp)}</div>
                  <div className="text-gray-900">{log.message}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

