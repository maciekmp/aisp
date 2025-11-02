import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Image, Video, FileText, Filter, X } from 'lucide-react'

type Alert = {
  id: string
  timestamp: number
  type: 'security' | 'fire' | 'intrusion' | 'equipment'
  status: 'active' | 'resolved' | 'investigating'
  location: { latitude: number; longitude: number }
  description: string
  images?: string[]
  videos?: string[]
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    timestamp: Date.now() - 3600000,
    type: 'security',
    status: 'active',
    location: { latitude: 50.0614, longitude: 19.9366 },
    description: 'Unauthorized access detected at main gate',
    images: ['/rgb.mp4'],
    videos: ['/rgb.mp4']
  },
  {
    id: '2',
    timestamp: Date.now() - 7200000,
    type: 'fire',
    status: 'investigating',
    location: { latitude: 50.0620, longitude: 19.9370 },
    description: 'Heat signature detected in building A',
    images: ['/rgb.mp4'],
    videos: ['/rgb.mp4']
  },
  {
    id: '3',
    timestamp: Date.now() - 86400000,
    type: 'intrusion',
    status: 'resolved',
    location: { latitude: 50.0618, longitude: 19.9368 },
    description: 'Motion detected in restricted area',
    images: ['/rgb.mp4'],
    videos: ['/rgb.mp4']
  }
]

export function AlertCenter() {
  const [alerts] = useState<Alert[]>(mockAlerts)
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const filteredAlerts = alerts.filter(alert => {
    if (statusFilter !== 'all' && alert.status !== statusFilter) return false
    if (typeFilter !== 'all' && alert.type !== typeFilter) return false
    return true
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'security': return 'bg-blue-100 text-blue-800'
      case 'fire': return 'bg-red-100 text-red-800'
      case 'intrusion': return 'bg-orange-100 text-orange-800'
      case 'equipment': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-500'
      case 'investigating': return 'bg-yellow-500'
      case 'resolved': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const handleGeneratePDF = (alert: Alert) => {
    // Placeholder for PDF generation
    console.log('Generating PDF for alert:', alert)
    window.alert('PDF generation feature - to be implemented')
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('pl-PL')
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Alert Center</h1>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Types</option>
              <option value="security">Security</option>
              <option value="fire">Fire</option>
              <option value="intrusion">Intrusion</option>
              <option value="equipment">Equipment</option>
            </select>
          </div>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No alerts found
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedAlert(alert)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-3 h-3 rounded-full mt-2 ${getStatusColor(alert.status)}`}></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(alert.type)}`}>
                            {alert.type}
                          </span>
                          <span className="text-xs text-gray-500">{formatDate(alert.timestamp)}</span>
                        </div>
                        <div className="font-medium text-gray-900 mb-1">{alert.description}</div>
                        <div className="text-sm text-gray-500">
                          {alert.location.latitude.toFixed(4)}, {alert.location.longitude.toFixed(4)}
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          {alert.images && alert.images.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Image className="w-3 h-3" />
                              {alert.images.length} image{alert.images.length !== 1 ? 's' : ''}
                            </div>
                          )}
                          {alert.videos && alert.videos.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Video className="w-3 h-3" />
                              {alert.videos.length} video{alert.videos.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
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
      {selectedAlert && (
        <div className="w-[500px] bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Alert Details</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedAlert(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Type</div>
              <span className={`px-2 py-1 rounded text-sm font-medium ${getTypeColor(selectedAlert.type)}`}>
                {selectedAlert.type}
              </span>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">Status</div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedAlert.status)}`}></div>
                <span className="text-sm font-medium capitalize">{selectedAlert.status}</span>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">Time</div>
              <div className="text-sm font-medium">{formatDate(selectedAlert.timestamp)}</div>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">Location</div>
              <div className="text-sm font-medium">
                {selectedAlert.location.latitude.toFixed(6)}, {selectedAlert.location.longitude.toFixed(6)}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">Description</div>
              <div className="text-sm">{selectedAlert.description}</div>
            </div>

            {selectedAlert.images && selectedAlert.images.length > 0 && (
              <div>
                <div className="text-sm text-gray-500 mb-2">Images</div>
                <div className="grid grid-cols-2 gap-2">
                  {selectedAlert.images.map((img, idx) => (
                    <div key={idx} className="aspect-video bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                      <Image className="w-8 h-8 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedAlert.videos && selectedAlert.videos.length > 0 && (
              <div>
                <div className="text-sm text-gray-500 mb-2">Videos</div>
                <div className="space-y-2">
                  {selectedAlert.videos.map((video, idx) => (
                    <div key={idx} className="aspect-video bg-gray-900 rounded border border-gray-200">
                      <video src={video} controls className="w-full h-full rounded" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <Button
              className="w-full"
              onClick={() => handleGeneratePDF(selectedAlert)}
            >
              <FileText className="w-4 h-4 mr-2" />
              Generate PDF Report
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

