# Container Management System

A React + TypeScript + Vite application for managing and monitoring shipping container locations in real-time using GPS coordinates and canvas visualization.

## Features

### 📊 Dashboard
- Real-time statistics and analytics
- Yearly container movement trends
- Movement logs and activity tracking
- Zone utilization metrics

### 🗺️ GPS Canvas Monitoring
- **Real-time GPS tracking** with canvas visualization
- **Polygon yard boundary**
- Interactive zoom and pan controls (0.5x - 5x)
- Rectangular container markers (60x24px, 2.5:1 ratio matching real 20ft containers)
- **Proximity-based stacking** - containers within 35px (~2-3m) automatically group
- Color-coded stack visualization:
  - Gray: Empty
  - Light Green: 1 container
  - Medium Green: 2 containers
  - Teal: 3 containers
  - Blue: 4+ containers
- Search functionality by container number or shipping agent
- Zone overlay (A-E) with grid reference
- Modal detail view for container stacks

### 🔍 Traditional Zone Monitoring
- Grid-based zone visualization (5 zones × 9 positions)
- Stack display up to 4 containers per position
- Interactive container search with visual filtering
- Modal view for detailed container information

## Tech Stack

- **React 19** - Latest stable with new JSX transform
- **TypeScript 5.9** - Strict mode enabled
- **Vite 7.2** - Fast development server with HMR
- **react-konva + Konva.js** - Canvas rendering for GPS visualization
- **React Router v7** - Client-side routing
- **CSS Modules** - Component-scoped styling

## Project Structure

```
src/
├── components/
│   ├── canvas/              # GPS canvas components
│   │   ├── YardCanvas.tsx   # Main canvas with zoom/pan
│   │   ├── ContainerMarker.tsx  # Individual container rendering
│   │   └── ControlPanel.tsx # Zoom controls
│   ├── Container.tsx        # Traditional grid container
│   ├── Zone.tsx            # Traditional zone view
│   └── Navbar.tsx          # Navigation bar
├── pages/
│   ├── Dashboard.tsx       # Analytics dashboard
│   ├── Monitoring.tsx      # Traditional zone monitoring
│   ├── MonitoringCanvas.tsx # GPS canvas monitoring
│   └── Master.tsx          # Placeholder page
├── types/
│   └── container.ts        # TypeScript interfaces
└── utils/
    ├── coordinateTransform.ts  # GPS ↔ Canvas conversion
    ├── mockGPSData.ts         # Mock data generator
    └── zoneData.ts            # Traditional zone data

```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Development Server
Server runs on `http://localhost:5173` with hot module replacement (HMR).

## Key Concepts

### GPS Coordinate System
- Uses `CoordinateTransformer` class for bidirectional conversion
- Supports polygon boundaries with point-in-polygon algorithm
- Mock data generator creates realistic GPS positions within yard bounds

### Container Stacking
- **Automatic grouping**: Containers within 35px proximity are stacked
- Stack count determines color gradient
- Each stack shows badge with count (e.g., "3")
- Modal displays all containers in a stack

### Polygon Yard Boundary
- Supports complex yard shapes
- Defined via array of GPS coordinates
- Ray-casting algorithm validates container positions
- Visual rendering on canvas with closed polygon

### Performance Optimizations
- Removed expensive `shadowBlur` effects
- Simplified shadow rendering (single layer)
- HTML modal instead of canvas tooltips
- Reduced container count for POC (40 containers)
- React.memo() on marker components
- `listening={false}` on static shapes

## Configuration

### Yard Boundary
Edit `src/utils/mockGPSData.ts` to customize:
```typescript
export const DEFAULT_YARD_BOUNDS: YardBoundary = {
  polygonPoints: [
    { latitude: -6.2000, longitude: 106.8000 },
    // Add more points...
  ],
  // ...
};
```

### Container Count & Proximity
```typescript
// In MonitoringCanvas.tsx
const mockContainers = generateMockContainersWithGPS(
  DEFAULT_YARD_BOUNDS,
  40  // Number of containers
);

const grouped = groupNearbyContainers(
  mockContainers,
  35  // Proximity threshold in pixels
);
```

## Future Enhancements

- [ ] Real GPS hardware integration (WebSocket/API)
- [ ] Real-time updates and notifications
- [ ] Advanced stacking rules (max 4, zone-based, agent-based)
- [ ] Dynamic container scaling based on zoom level
- [ ] Multiple yard support
- [ ] Historical playback of container movements
- [ ] Export reports and analytics
- [ ] User authentication and roles

## Development Notes

- **No global state management** - pages manage their own state
- **Props drilling pattern** for component communication
- **Co-located CSS** - each component has its own `.css` file
- **Mock data** - all data is client-side generated for POC
- **Type safety** - strict TypeScript with explicit types

## Color Palette

- Primary green: `#1a4d2e`
- Gradients: `linear-gradient(135deg, #1a4d2e 0%, #0d2818 100%)`
- Stack gradients: Gray → Light Green → Medium Green → Teal → Blue

## Contributing

This is a POC (Proof of Concept) project. For production deployment, replace mock data with real GPS API integration.
