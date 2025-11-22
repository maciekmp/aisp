# aisPatrol – API Architecture

## Scope and Goals

- Provide a backend contract that powers the existing React mission-control UI (focus on `src/pages/Dashboard.tsx` but covering the whole SPA).
- Support near-real-time telemetry, video feeds, mission planning, alerting, fleet oversight, archival review, and operator tooling.
- Assume a service-oriented backend exposing authenticated REST endpoints plus WebSocket/SSE channels for streaming updates.

## UI Integration Requirements

- `Dashboard`
  - Live telemetry tiles: battery, flight dynamics, connectivity, GNSS, mission, power, weather, docking mechanics.
  - Map: drone/base positions, controlled-area polygon, mission route, drone trace, alert markers, physics log toasts.
  - Video: RGB and thermal streams with expand/collapse, photo capture, 30 s clip capture.
  - Mode switching: toggle auto/manual, manual directional inputs, pause/home actions.
  - Mission progress: stage list with % complete, ETA display.
  - Operational log: append entries and display recent activity (auto + manual).
- `MissionPlanner`
  - View factory polygon and existing waypoints.
  - Create/edit/delete waypoints, reorder, save mission route metadata.
- `AlertCenter`
  - Filterable alert list with summary fields (type, status, timestamp, location, media counts).
  - Detail panel with media previews, status updates, PDF/export generation.
- `FleetManagement`
  - Drone roster with status, battery, mission assignment, location, last update.
  - Docking station roster with capacity, environment metrics, occupancy.
  - Historical log view per drone/dock.
- `Archive`
  - Mission history list with status, timing, waypoint count, media/log availability.
  - Detail view with media download links, embedded operational log.
- `Settings`
  - User profile preferences (language, units, notifications).
- Cross-cutting
  - Authentication, authorization, role-based access (operator, supervisor, admin).
  - System metadata (map tokens, feature flags), notifications, audit trail.

## Domain Model Overview

- **User**
  - `id`, `roles`, `profile` (name, locale, units), auth credentials or SSO linkage.
- **Drone**
  - `id`, `callsign`, `model`, `status`, `battery`, `firmwareVersion`, `currentMissionId`, `lastContact`.
  - Relationship: has many telemetry samples, commands, alerts, media assets.
- **Telemetry Snapshot**
  - `id`, `droneId`, `timestamp`, `position` (lat/lng/alt), `headingDeg`, `speed`, `verticalSpeed`, `battery`, `temperatures`, `connectivity`, `gnss`, `weather`.
  - Derived from streaming ingestion; stored in time-series DB with retention policies.
- **Telemetry Stream Event**
  - Real-time payload pushed via WebSocket/SSE (subset of snapshot plus incremental fields, status flags, log events).
- **Mission**
  - `id`, `name`, `status`, `phase`, `startTime`, `endTime`, `etaMinutes`, `progress`, `currentStageIndex`.
  - Relationship: has many waypoints, operational logs, media assets, associated drone.
- **Waypoint**
  - `id`, `missionId`, `order`, `name`, `latitude`, `longitude`, `altitude`, `actions`.
- **Operational Log Entry**
  - `id`, `missionId`, `authorType` (system/operator), `message`, `metadata`, `timestamp`.
- **Media Asset**
  - `id`, `missionId`, `droneId`, `type` (photo/video/frame), `uri`, `duration`, `thumbnailUri`, `capturedAt`.
- **Alert**
  - `id`, `type`, `status`, `severity`, `description`, `detectedAt`, `location`, `source` (sensor/drone/camera), `missionId?`.
  - Relationship: has media attachments, audit log, assigned responders.
- **Dock Station**
  - `id`, `name`, `status`, `capacity`, `occupiedSlots`, `environment` (temperature, humidity), `lastService`.
- **Command**
  - Manual controls or autopilot directives queued to drones (`thrust`, `yaw`, `mode`, `returnToHome`, `pause`).
- **Report**
  - Generated documents (`id`, `alertId | missionId`, `status`, `downloadUri`).
- **Configuration**
  - System-level settings (maps, weather providers, thresholds) surfaced to UI.

## Service Architecture

- **Auth & Security**
  - JWT-based session tokens issued after SSO/OAuth login; refresh tokens for session longevity.
  - Roles authorize access per domain (e.g., `telemetry:read`, `missions:write`, `alerts:manage`).
- **API Gateway**
  - REST endpoints versioned under `/api/v1/...`.
  - WebSocket endpoint under `/ws`.
- **Streaming**
  - Telemetry + log events over WebSocket topics:
    - `telemetry.drone.{droneId}`
    - `telemetry.events`
    - `mission.events.{missionId}`
    - `alerts.events`
  - Server fallback with Server-Sent Events (`/api/v1/telemetry/stream`).
- **Media Handling**
  - Video encoded via RTSP/LL-HLS; control API exposes secure session URLs and signed capture actions.
- **Data Stores**
  - PostgreSQL (core domain), Timescale/Influx for telemetry, Object storage (media), Redis for pub/sub & cache.

## Endpoint Specifications

### Auth & Session

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/v1/auth/login` | Exchange credentials or SSO token for JWT/refresh pair. |
| POST | `/api/v1/auth/refresh` | Issue new access token. |
| POST | `/api/v1/auth/logout` | Revoke refresh token. |
| GET | `/api/v1/auth/me` | Return current user profile, roles, permissions. |

### Telemetry & Drone Control

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/v1/drones` | List drones with summary (status, battery, mission). Supports `status`, `missionId` filters. |
| GET | `/api/v1/drones/{droneId}` | Detailed drone data, current telemetry snapshot, firmware info. |
| GET | `/api/v1/drones/{droneId}/telemetry` | Paginated historical telemetry (query by time range, granularity). |
| GET | `/api/v1/drones/{droneId}/trace` | GeoJSON trace for current mission (for map replay). |
| GET | `/api/v1/drones/{droneId}/health` | Diagnostics (temperatures, connectivity, faults). |
| POST | `/api/v1/drones/{droneId}/commands` | Send control command (manual thrust/yaw, mode switch, RTH, pause). |
| POST | `/api/v1/drones/{droneId}/mode` | Toggle `manual`/`auto`; returns updated mission context. |
| POST | `/api/v1/drones/{droneId}/media/capture` | Trigger photo capture; returns asset placeholder. |
| POST | `/api/v1/drones/{droneId}/media/clip` | Trigger 30 s clip extraction; asynchronous job -> report via media webhook. |
| GET | `/api/v1/telemetry/stream` | SSE endpoint delivering live updates (one stream per session). |

**WebSocket Payload (telemetry.drone.\*)**

```json
{
  "type": "telemetry",
  "droneId": "alpha-01",
  "timestamp": "2025-11-11T16:21:15.492Z",
  "position": { "lat": 50.0614, "lng": 19.9366, "alt": 42.1 },
  "headingDeg": 47,
  "velocity": { "horizontal": 12.6, "vertical": -0.4 },
  "battery": { "percent": 68, "cellTempC": 31, "etaFullMinutes": 18 },
  "connectivity": { "latencyMs": 92, "downlinkMbps": 6.4, "links": ["ethernet", "lte"] },
  "gnss": { "status": "FIX", "satellites": 18, "hdop": 0.9 },
  "power": { "source": "ups", "upsLevel": 58, "upsMinutes": 42, "fault": false },
  "weather": { "windAvg": 6.4, "windGust": 9.2, "precipitation": false },
  "mission": { "id": "mission-123", "progress": 0.43, "etaMinutes": 12 },
  "log": { "type": "started_moving", "message": "Drone started moving" }
}
```

### Mission Management

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/v1/missions` | List missions with filters (`status`, `dateRange`, `assignedDrone`). |
| POST | `/api/v1/missions` | Create mission (name, schedule, drone assignment, initial waypoints). |
| GET | `/api/v1/missions/{missionId}` | Mission detail (status, progress, ETA, stage list, stats). |
| PATCH | `/api/v1/missions/{missionId}` | Update mission metadata, schedule, status transitions. |
| POST | `/api/v1/missions/{missionId}/start` | Launch mission; backend coordinates autopilot handoff. |
| POST | `/api/v1/missions/{missionId}/abort` | Abort mission with reason. |
| GET | `/api/v1/missions/{missionId}/waypoints` | Ordered waypoint list with coordinates & actions. |
| POST | `/api/v1/missions/{missionId}/waypoints` | Add or bulk replace waypoints. |
| PATCH | `/api/v1/missions/{missionId}/waypoints/{waypointId}` | Edit waypoint name/order/coords. |
| DELETE | `/api/v1/missions/{missionId}/waypoints/{waypointId}` | Remove waypoint and normalize order. |
| GET | `/api/v1/missions/{missionId}/progress` | Lightweight progress snapshot for polling UIs. |

### Operational Logs

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/v1/missions/{missionId}/logs` | Paginated log entries (system + operator). |
| POST | `/api/v1/missions/{missionId}/logs` | Append operator comment `{ message }`; server stamps author/time. |
| DELETE | `/api/v1/missions/{missionId}/logs/{logId}` | Remove erroneous entry (permission gated). |

### Video & Media Assets

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/v1/media/live` | Return signed HLS/WebRTC URLs for RGB & thermal feeds (`droneId` query). |
| GET | `/api/v1/media/assets` | Search mission media (filters: missionId, type, capturedAt range). |
| GET | `/api/v1/media/assets/{assetId}` | Metadata + signed download URL. |
| DELETE | `/api/v1/media/assets/{assetId}` | Remove asset (with retention rules). |
| GET | `/api/v1/media/assets/{assetId}/thumbnail` | Lightweight preview. |

### Alerts & Incident Response

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/v1/alerts` | Filterable alert list (`type`, `status`, `dateRange`, `severity`, `missionId`). |
| POST | `/api/v1/alerts` | Create manual alert (operator input). |
| GET | `/api/v1/alerts/{alertId}` | Alert detail: timeline, status history, attachments. |
| PATCH | `/api/v1/alerts/{alertId}` | Update status (`active`, `investigating`, `resolved`), assignee, notes. |
| GET | `/api/v1/alerts/{alertId}/media` | Media attachments. |
| POST | `/api/v1/alerts/{alertId}/reports` | Generate PDF; returns job id. |
| GET | `/api/v1/reports/{reportId}` | Report job status + download link. |

**Alert Events (alerts.events)**

```json
{
  "type": "alert.updated",
  "alert": {
    "id": "alert-2",
    "status": "investigating",
    "updatedAt": "2025-11-11T15:11:00Z",
    "notes": "Security team dispatched"
  }
}
```

### Fleet & Dock Management

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/v1/fleet/docks` | List docking stations, capacity, environment, occupancy. |
| GET | `/api/v1/fleet/docks/{dockId}` | Dock detail + telemetry history (temperature, humidity). |
| GET | `/api/v1/fleet/drones/{droneId}/logs` | Recent maintenance/mission events for drawer panel. |
| POST | `/api/v1/fleet/drones/{droneId}/assign` | Assign drone to dock or mission. |
| GET | `/api/v1/fleet/status` | Summary counts (active, docked, error) for dashboard badges. |

### Archive & Reporting

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/v1/archive/missions` | Historical list with pagination, status filter, search. |
| GET | `/api/v1/archive/missions/{missionId}` | Detailed mission record (metrics, media counts, logs). |
| GET | `/api/v1/archive/missions/{missionId}/download` | Bulk export (media bundle, telemetry CSV, log JSON). |
| POST | `/api/v1/archive/missions/{missionId}/reports` | Generate summary report (PDF/CSV). |

### Settings & Metadata

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/v1/settings` | Fetch user & org settings (locale defaults, measurement units). |
| PATCH | `/api/v1/settings` | Update user preferences (language, notifications). |
| GET | `/api/v1/config/map` | Map configuration (`mapboxToken`, bounds, layers). |
| GET | `/api/v1/config/thresholds` | Operational thresholds for telemetry tiles (battery, wind, latency). |

### Support Services

- **Notifications**
  - POST `/api/v1/notifications/test` – send test alert to current user.
  - WebSocket topic `notifications.user.{userId}` for toast/badge updates.
- **Audit Trail**
  - GET `/api/v1/audit` – admin endpoint to review critical actions.

## Data Contracts & Validation Notes

- All timestamps ISO-8601 UTC.
- Geo coordinates WGS84 decimals; map expects GeoJSON structures for polygons/routes.
- Telemetry numeric units: meters, m/s, degrees, Celsius, unless user preferences specify imperial (server handles conversions).
- Enumerations should align with UI constants: statuses (`green|yellow|red`), modes (`auto|manual`), alert types, mission stages.
- Paginated responses follow `{ data: [...], page, pageSize, total }`.

## Real-Time Considerations

- Telemetry cadence: 1–5 Hz; compress payloads with delta encoding where possible.
- Physics log events flagged within telemetry stream (`log` field) to animate toasts (UI expects short-lived messages).
- Manual control commands require acknowledgements; respond with command id plus `queued` or `rejected` status and update via WebSocket `commands.events`.
- Provide heartbeat/ping frames every 15 s to keep WebSocket alive.

## Security & Compliance

- Enforce TLS, signed URLs for media, role checks for destructive actions (abort mission, delete media).
- Log all operator commands and alert status transitions to audit trail.
- Support multi-tenant org segregation if deployed across sites (namespace IDs in paths or headers).

## Performance & Reliability

- Cache dashboard reference data (thresholds, map polygons) with ETag headers.
- Use write batching for log submissions to avoid chattiness.
- Mission planner writes should lock mission to prevent conflicting edits.
- Provide graceful degradation (when WebSocket unavailable, UI falls back to SSE or poll endpoints).

## Integration Checklist

- [ ] Obtain Mapbox and streaming tokens via `/api/v1/config/*`.
- [ ] Subscribe to telemetry, mission, and alert topics after login.
- [ ] Fetch mission context (`/missions/{id}`) on dashboard load and keep synchronized via events.
- [ ] Update operational log UI after POST response or event push.
- [ ] Trigger media capture through command endpoints and poll asset status.
- [ ] Align alert filters with query parameters for list endpoint.
- [ ] Maintain local caches keyed by missionId/droneId for trace reuse across views.


