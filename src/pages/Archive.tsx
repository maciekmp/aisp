import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArchiveIcon, Filter, FileText, Image, Video, Download, X } from 'lucide-react'
import { OperationalLog } from '@/components/OperationalLog'

type MissionStatus = 'completed' | 'failed' | 'cancelled'

type Mission = {
  id: string
  name: string
  startTime: number
  endTime?: number
  status: MissionStatus
  waypoints: number
  duration?: number
  images?: number
  videos?: number
  logs?: boolean
}

const mockMissions: Mission[] = [
  {
    id: '1',
    name: 'Patrol Route A',
    startTime: Date.now() - 86400000,
    endTime: Date.now() - 82800000,
    status: 'completed',
    waypoints: 8,
    duration: 3600,
    images: 45,
    videos: 3,
    logs: true
  },
  {
    id: '2',
    name: 'Security Check North',
    startTime: Date.now() - 172800000,
    endTime: Date.now() - 169200000,
    status: 'completed',
    waypoints: 5,
    duration: 3600,
    images: 32,
    videos: 2,
    logs: true
  },
  {
    id: '3',
    name: 'Emergency Response',
    startTime: Date.now() - 259200000,
    status: 'failed',
    waypoints: 3,
    images: 12,
    videos: 1,
    logs: true
  },
  {
    id: '4',
    name: 'Routine Inspection',
    startTime: Date.now() - 345600000,
    endTime: Date.now() - 342000000,
    status: 'completed',
    waypoints: 12,
    duration: 3600,
    images: 67,
    videos: 4,
    logs: true
  }
]

export function Archive() {
  const [missions] = useState<Mission[]>(mockMissions)
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')

  const filteredMissions = missions.filter(mission => {
    if (statusFilter !== 'all' && mission.status !== statusFilter) return false
    // Date filter would be more complex in real implementation
    return true
  })

  const getStatusColor = (status: MissionStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('pl-PL')
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-white">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Archive</h1>
          <div className="flex gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {filteredMissions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No missions found
              </div>
            ) : (
              filteredMissions.map((mission) => (
                <div
                  key={mission.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedMission(mission)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <ArchiveIcon className="w-5 h-5 text-gray-600" />
                        <div className="font-semibold text-gray-900">{mission.name}</div>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(mission.status)}`}>
                          {mission.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500 mb-1">Start</div>
                          <div className="font-medium">{formatDate(mission.startTime)}</div>
                        </div>
                        {mission.endTime && (
                          <div>
                            <div className="text-gray-500 mb-1">End</div>
                            <div className="font-medium">{formatDate(mission.endTime)}</div>
                          </div>
                        )}
                        <div>
                          <div className="text-gray-500 mb-1">Duration</div>
                          <div className="font-medium">{formatDuration(mission.duration)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Waypoints</div>
                          <div className="font-medium">{mission.waypoints}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        {mission.images !== undefined && (
                          <div className="flex items-center gap-1">
                            <Image className="w-4 h-4" />
                            {mission.images} images
                          </div>
                        )}
                        {mission.videos !== undefined && (
                          <div className="flex items-center gap-1">
                            <Video className="w-4 h-4" />
                            {mission.videos} videos
                          </div>
                        )}
                        {mission.logs && (
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            Logs available
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedMission && (
        <div className="w-[500px] bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{selectedMission.name}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedMission(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Mission Details</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(selectedMission.status)}`}>
                    {selectedMission.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Start:</span>
                  <span className="font-medium">{formatDate(selectedMission.startTime)}</span>
                </div>
                {selectedMission.endTime && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">End:</span>
                    <span className="font-medium">{formatDate(selectedMission.endTime)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration:</span>
                  <span className="font-medium">{formatDuration(selectedMission.duration)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Waypoints:</span>
                  <span className="font-medium">{selectedMission.waypoints}</span>
                </div>
              </div>
            </div>

            {selectedMission.images !== undefined && selectedMission.images > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Images ({selectedMission.images})</div>
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: Math.min(selectedMission.images, 4) }).map((_, idx) => (
                    <div key={idx} className="aspect-video bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                      <Image className="w-8 h-8 text-gray-400" />
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download All Images
                </Button>
              </div>
            )}

            {selectedMission.videos !== undefined && selectedMission.videos > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Videos ({selectedMission.videos})</div>
                <div className="space-y-2">
                  {Array.from({ length: selectedMission.videos }).map((_, idx) => (
                    <div key={idx} className="aspect-video bg-gray-900 rounded border border-gray-200">
                      <video src="/rgb.mp4" controls className="w-full h-full rounded" />
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download All Videos
                </Button>
              </div>
            )}

            {selectedMission.logs && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Operational Logs</div>
                <div className="border border-gray-200 rounded">
                  <OperationalLog missionId={selectedMission.id} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

