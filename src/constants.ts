/**
 * Application-wide constants and configuration values
 */

/**
 * Drone physics constants
 */
export const DRONE_PHYSICS = {
  /** Maximum speed in degrees per frame (scaled) */
  MAX_SPEED: 0.00002,
  /** Acceleration value */
  ACCELERATION: 0.00006,
  /** Drag coefficient (velocity multiplier per frame) */
  DRAG: 0.90,
  /** Yaw rate in degrees per frame */
  YAW_RATE_DEG_PER_FRAME: 2.0,
  /** Desired cruising speed multiplier for auto mode */
  AUTO_SPEED_MULTIPLIER: 0.8,
  /** Speed error correction factor for auto mode */
  AUTO_SPEED_CORRECTION: 0.5,
  /** Boundary margin for collision detection */
  BOUNDARY_MARGIN: 1e-9,
  /** Maximum delta time per frame (seconds) */
  MAX_DELTA_TIME: 0.05,
  /** Frame rate baseline for scaling (60fps) */
  FPS_BASELINE: 60,
} as const

/**
 * Geographic conversion constants
 */
export const GEO_CONVERSION = {
  /** Meters per degree of latitude (approximate) */
  METERS_PER_DEG_LAT: 111320,
} as const

/**
 * Operational log constants
 */
export const LOG_CONFIG = {
  /** Maximum number of log entries to keep */
  MAX_LOG_ENTRIES: 50,
  /** Maximum length of log message */
  MAX_MESSAGE_LENGTH: 200,
  /** Debounce delay for localStorage writes (ms) */
  STORAGE_DEBOUNCE_MS: 300,
} as const

/**
 * Drone trace constants
 */
export const DRONE_TRACE = {
  /** Maximum number of trace points to store */
  MAX_TRACE_POINTS: 1000,
  /** Minimum distance change to record new point (degrees) */
  MIN_DISTANCE_THRESHOLD: 0.00001,
} as const

/**
 * Video capture constants
 */
export const VIDEO_CAPTURE = {
  /** Duration of video clip to save (seconds) */
  CLIP_DURATION_SECONDS: 30,
} as const

/**
 * Map configuration constants
 */
export const MAP_CONFIG = {
  /** Default zoom level */
  DEFAULT_ZOOM: 14,
  /** Padding for fitBounds (pixels) */
  BOUNDS_PADDING: 40,
  /** Animation duration for fitBounds (ms) */
  BOUNDS_ANIMATION_DURATION: 800,
} as const

/**
 * UI constants
 */
export const UI_CONFIG = {
  /** Default locale for date formatting */
  DEFAULT_LOCALE: 'pl-PL',
} as const

