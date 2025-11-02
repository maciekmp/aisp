# AISP - Autonomous Inspection and Surveillance Platform

A modern web application for managing drone fleets, monitoring missions, and analyzing operational data in real-time.

## Features

- **Mission Control Dashboard**: Real-time drone telemetry, video feeds (RGB and thermal), and interactive map visualization
- **Mission Planner**: Plan flight routes with waypoints on an interactive map
- **Alert Center**: Monitor and manage security alerts, fire detections, intrusions, and equipment issues
- **Fleet Management**: Track drone and docking station status, battery levels, and operational logs
- **Archive**: Review past missions with detailed logs, images, and videos

## Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **React Router** for navigation
- **Mapbox GL** for map visualization
- **Tailwind CSS** for styling
- **Radix UI** for accessible component primitives

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Mapbox access token

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd aisp
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

   Get your Mapbox token from: https://account.mapbox.com/access-tokens/

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components (Dashboard, Mission Planner, etc.)
├── hooks/          # Custom React hooks
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── constants.ts    # Application constants
```

## Environment Variables

- `VITE_MAPBOX_TOKEN` (required): Mapbox access token for map rendering

## Development

The project uses:
- **TypeScript** with strict mode enabled
- **ESLint** with type-aware rules for better code quality
- **Tailwind CSS** for utility-first styling
- **React Router** for client-side routing

## Features in Detail

### Dashboard
- Real-time drone position tracking on map
- Manual and automatic flight modes
- Live video feeds from RGB and thermal cameras
- Telemetry display (speed, altitude, battery, GPS)
- Operational log for mission notes

### Mission Planner
- Click-to-add waypoints on map
- Edit waypoint names and positions
- Route timeline view
- Local storage persistence

### Alert Center
- Filter alerts by type and status
- Detailed alert information panel
- Image and video attachments
- PDF report generation (placeholder)

### Fleet Management
- Monitor drone status and battery levels
- View docking station capacity and environmental conditions
- Access operational logs per drone/dock

### Archive
- Browse past missions with filters
- View mission details, images, and videos
- Access historical operational logs

## License

[Your License Here]
