/**
 * Shared type definitions for the AISP application
 */

/**
 * Log entry for operational logs
 */
export type LogEntry = {
  id: string
  timestamp: number
  message: string
}

/**
 * Alert type classifications
 */
export type AlertType = 'security' | 'fire' | 'intrusion' | 'equipment'

/**
 * Alert status states
 */
export type AlertStatus = 'active' | 'resolved' | 'investigating'

/**
 * Alert information
 */
export type Alert = {
  id: string
  timestamp: number
  type: AlertType
  status: AlertStatus
  location: { latitude: number; longitude: number }
  description: string
  images?: string[]
  videos?: string[]
}

/**
 * Mission status states
 */
export type MissionStatus = 'completed' | 'failed' | 'cancelled'

/**
 * Mission information
 */
export type Mission = {
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

/**
 * Drone status states
 */
export type DroneStatus = 'active' | 'mission' | 'docked' | 'error'

/**
 * Dock status states
 */
export type DockStatus = 'operational' | 'charging' | 'maintenance' | 'error'

/**
 * Drone item information
 */
export type DroneItem = {
  id: string
  name: string
  status: DroneStatus
  battery: number
  location?: { latitude: number; longitude: number }
  currentMission?: string
  lastUpdate: number
}

/**
 * Dock station information
 */
export type DockStation = {
  id: string
  name: string
  status: DockStatus
  droneCount: number
  capacity: number
  temperature: number
  humidity: number
  lastUpdate: number
}

/**
 * Waypoint information for mission planning
 */
export type Waypoint = {
  id: string
  longitude: number
  latitude: number
  name: string
  order: number
}

/**
 * Marker data for map display
 */
export type MarkerData = {
  longitude: number
  latitude: number
  headingDegrees?: number
}

