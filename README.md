# Container Management System

A React + TypeScript + Vite application for managing and monitoring shipping container locations in real-time using GPS coordinates and zone-based stacking system with canvas visualization.

## Features

### 📊 Dashboard
- Real-time statistics and analytics
- Yearly container movement trends
- Movement logs and activity tracking
- Zone utilization metrics

### 🗺️ GPS Canvas Monitoring (Zone-Based)
- **Real-time GPS tracking** with canvas visualization
- **Zone-based container stacking** - 1 zone = 1 stack position
- **Polygon yard boundary** with notch support (iPhone-style)
- Interactive zoom and pan controls (0.5x - 5x)
- Rectangular container markers (60x24px, 2.5:1 ratio matching real 20ft containers)
- **Automatic zone assignment** - containers auto-assigned to zones based on GPS position
- **Stack levels 1-4** - vertical stacking within each zone
- Color-coded stack visualization:
  - Gray: Empty
  - Light Green: 1 container
  - Medium Green: 2 containers
  - Teal: 3 containers
  - Blue: 4 containers
- Search functionality by container number or shipping agent
- Grid reference for spatial awareness
- Modal detail view showing zone info and all containers in stack

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

### Zone-Based Stacking System
- **1 Zone = 1 Stack Position** - Each zone represents a unique container stack location
- **Zone Definition**: 4 GPS corner points (upleft, downleft, upright, downright) forming a rectangle
- **Container Assignment**: Containers with GPS coordinates are automatically assigned to zones
- **Stack Levels**: Each container has a stack level (1-4):
  - Level 1: Bottom container
  - Level 2-3: Middle containers
  - Level 4: Top container
- **GPS Center Point**: All containers in a zone share the zone's center GPS coordinate
- **Database Structure**:
  - `TB_M_ZONE`: Stores zone definitions with 4 corner GPS points
  - `TB_M_CONTAINER`: Stores container data with `zone_id` foreign key and `stack_level`
  - `TB_M_AREA`: Groups zones into areas
  - `TB_M_SHIPPING_AGENT`: Shipping agent master data
  - `TB_L_HISTORY_CONTAINER`: Movement history logs

### GPS Coordinate System
- Uses `CoordinateTransformer` class for bidirectional conversion (GPS ↔ Canvas)
- Supports polygon boundaries with point-in-polygon algorithm (ray-casting)
- Mock data generator creates zones first, then assigns containers to zones
- Container receives 1 GPS point, system checks which zone it belongs to

### Container Stacking Logic
- **Grouping by Zone**: All containers with same `zone_id` form one stack
- **Sorted by Stack Level**: Containers displayed from level 1 (bottom) to 4 (top)
- **Visual Representation**: Stack count badge shows total containers (1-4)
- **Modal Details**: Shows zone ID, zone name, GPS coordinates, and all container details

### Polygon Yard Boundary
- Supports complex yard shapes (including notches)
- Defined via array of GPS coordinates in `polygonPoints`
- Ray-casting algorithm validates container positions are inside yard
- Visual rendering on canvas with closed polygon
- Notch example: iPhone-style cutout at top center

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
  topLeft: { latitude: -6.2000, longitude: 106.8000 },
  bottomRight: { latitude: -6.2100, longitude: 106.8100 },
  polygonPoints: [
    { latitude: -6.2000, longitude: 106.8000 },
    { latitude: -6.2000, longitude: 106.8040 },
    { latitude: -6.2010, longitude: 106.8040 }, // Notch
    { latitude: -6.2010, longitude: 106.8060 },
    { latitude: -6.2000, longitude: 106.8060 },
    { latitude: -6.2000, longitude: 106.8100 },
    { latitude: -6.2100, longitude: 106.8100 },
    { latitude: -6.2100, longitude: 106.8000 },
  ],
  canvasWidth: 1200,
  canvasHeight: 800
};
```

### Zone Configuration
```typescript
// In MonitoringCanvas.tsx
const mockZones = generateMockZones(
  DEFAULT_YARD_BOUNDS,
  20  // Number of zones (each zone = 1 stack position)
);

// Zones are auto-generated in grid layout (e.g., 4x5 for 20 zones)
// Each zone has 4 corner GPS points forming a rectangle
```

### Container Generation
```typescript
// Containers are generated per zone
const mockContainers = generateMockContainersWithGPS(
  DEFAULT_YARD_BOUNDS,
  mockZones  // Zones must be generated first
);

// Each zone can contain 0-4 containers (20% chance empty)
// Stack levels are automatically assigned (1-4)
```

---

## API Specification (Simple)

> **Note:** Spec ini fokus untuk menampilkan data seperti di mock saja (read-only). Untuk fitur update/create akan dikembangkan nanti.

### Base URL
```
https://api.container-system.com/v1
```

### Authentication
All API requests require Bearer token:
```
Authorization: Bearer {access_token}
```

---

### 1. Get All Zones

**Endpoint:** `GET /zones`

**Description:** Ambil semua zone dengan 4 corner GPS points

**Request:**
```http
GET /zones
```

**Response:** (sesuai dengan `generateMockZones()`)
```json
{
  "status": "success",
  "data": [
    {
      "zone_id": "zone-A",
      "zone_name": "A",
      "area_id": "area-01",
      "latlong_upleft": {
        "latitude": -6.2000,
        "longitude": 106.8000
      },
      "latlong_downleft": {
        "latitude": -6.2050,
        "longitude": 106.8000
      },
      "latlong_upright": {
        "latitude": -6.2000,
        "longitude": 106.8020
      },
      "latlong_downright": {
        "latitude": -6.2050,
        "longitude": 106.8020
      }
    },
    {
      "zone_id": "zone-B",
      "zone_name": "B",
      "area_id": "area-01",
      "latlong_upleft": {
        "latitude": -6.2000,
        "longitude": 106.8020
      },
      "latlong_downleft": {
        "latitude": -6.2050,
        "longitude": 106.8020
      },
      "latlong_upright": {
        "latitude": -6.2000,
        "longitude": 106.8040
      },
      "latlong_downright": {
        "latitude": -6.2050,
        "longitude": 106.8040
      }
    }
  ],
  "total": 20
}
```

**Notes:**
- Zone dibuat dalam grid layout (contoh: 4x5 untuk 20 zones)
- Setiap zone punya 4 corner points membentuk rectangle
- Response sesuai dengan fungsi `generateMockZones()` di mockGPSData.ts

---

### 2. Get Containers Grouped by Zone

**Endpoint:** `GET /containers/grouped`

**Description:** Ambil containers yang sudah di-group berdasarkan zone (untuk canvas visualization)

**Request:**
```http
GET /containers/grouped
```

**Response:** (sesuai dengan `groupContainersByZone()`)
```json
{
  "status": "success",
  "data": [
    {
      "id": "stack-zone-A",
      "zone_id": "zone-A",
      "zone_name": "A",
      "gps_coordinate": {
        "latitude": -6.2025,
        "longitude": 106.8010
      },
      "canvas_x": 245.5,
      "canvas_y": 312.8,
      "total_stacks": 3,
      "rotation": 0,
      "containers": [
        {
          "id": "container-zone-A-L1",
          "container_number": "MSCU1234567",
          "shipping_agent": "Maersk Line",
          "agent_id": "AG001",
          "stack_level": 1,
          "yard_in_date": "2025-12-15 08:30:45",
          "zone_id": "zone-A",
          "zone_name": "A"
        },
        {
          "id": "container-zone-A-L2",
          "container_number": "TCLU9876543",
          "shipping_agent": "MSC",
          "agent_id": "AG002",
          "stack_level": 2,
          "yard_in_date": "2025-12-20 14:22:10",
          "zone_id": "zone-A",
          "zone_name": "A"
        },
        {
          "id": "container-zone-A-L3",
          "container_number": "CSNU5555555",
          "shipping_agent": "CMA CGM",
          "agent_id": "AG003",
          "stack_level": 3,
          "yard_in_date": "2025-12-28 09:15:30",
          "zone_id": "zone-A",
          "zone_name": "A"
        }
      ]
    },
    {
      "id": "stack-zone-B",
      "zone_id": "zone-B",
      "zone_name": "B",
      "gps_coordinate": {
        "latitude": -6.2025,
        "longitude": 106.8030
      },
      "canvas_x": 512.3,
      "canvas_y": 312.8,
      "total_stacks": 1,
      "rotation": 90,
      "containers": [
        {
          "id": "container-zone-B-L1",
          "container_number": "HLXU7777777",
          "shipping_agent": "Hapag-Lloyd",
          "agent_id": "AG005",
          "stack_level": 1,
          "yard_in_date": "2026-01-01 06:00:00",
          "zone_id": "zone-B",
          "zone_name": "B"
        }
      ]
    }
  ],
  "total_groups": 15,
  "total_containers": 42,
  "empty_zones": 5
}
```

**Notes:**
- Data sudah di-group per zone (1 zone = 1 stack)
- Containers dalam 1 group sudah di-sort berdasarkan `stack_level` (1-4)
- `gps_coordinate` adalah center point dari zone (rata-rata 4 corners)
- `canvas_x` dan `canvas_y` hasil transformasi GPS → Canvas
- Response sesuai dengan fungsi `groupContainersByZone()` di mockGPSData.ts

---

### 3. Search Container

**Endpoint:** `GET /containers/search`

**Description:** Search container berdasarkan container number atau shipping agent

**Request:**
```http
GET /containers/search?container_number=MSCU1234567
GET /containers/search?shipping_agent=Maersk
GET /containers/search?container_number=MSCU&shipping_agent=Maersk
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| container_number | string | No | Container number (exact match, case-insensitive) |
| shipping_agent | string | No | Shipping agent name (partial match, case-insensitive) |

**Response:**
```json
{
  "status": "success",
  "data": {
    "zone_id": "zone-A",
    "zone_name": "A",
    "gps_coordinate": {
      "latitude": -6.2025,
      "longitude": 106.8010
    },
    "canvas_x": 245.5,
    "canvas_y": 312.8,
    "container": {
      "id": "container-zone-A-L2",
      "container_number": "MSCU1234567",
      "shipping_agent": "Maersk Line",
      "agent_id": "AG001",
      "stack_level": 2,
      "yard_in_date": "2025-12-15 08:30:45",
      "zone_id": "zone-A",
      "zone_name": "A"
    },
    "stack_info": {
      "total_stacks": 3,
      "containers_in_stack": [
        {
          "container_number": "TCLU1111111",
          "stack_level": 1,
          "shipping_agent": "MSC"
        },
        {
          "container_number": "MSCU1234567",
          "stack_level": 2,
          "shipping_agent": "Maersk Line"
        },
        {
          "container_number": "CSNU9999999",
          "stack_level": 3,
          "shipping_agent": "CMA CGM"
        }
      ]
    }
  }
}
```

**Response (Not Found):**
```json
{
  "status": "error",
  "message": "Container not found"
}
```

**Notes:**
- Search logic sama seperti `handleSearch()` di MonitoringCanvas.tsx
- Jika container number diisi: exact match (case-insensitive)
- Jika shipping agent diisi: partial match (case-insensitive)
- Minimal 1 field harus diisi
- Return container yang ditemukan beserta info stack-nya

---

### 4. Get Shipping Agents (Master Data)

**Endpoint:** `GET /shipping-agents`

**Description:** Ambil master data shipping agents

**Request:**
```http
GET /shipping-agents
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "agent_id": "AG001",
      "agent_name": "Maersk Line"
    },
    {
      "agent_id": "AG002",
      "agent_name": "MSC"
    },
    {
      "agent_id": "AG003",
      "agent_name": "CMA CGM"
    },
    {
      "agent_id": "AG004",
      "agent_name": "COSCO"
    },
    {
      "agent_id": "AG005",
      "agent_name": "Hapag-Lloyd"
    },
    {
      "agent_id": "AG006",
      "agent_name": "ONE"
    },
    {
      "agent_id": "AG007",
      "agent_name": "Evergreen"
    },
    {
      "agent_id": "AG008",
      "agent_name": "Yang Ming"
    }
  ],
  "total": 8
}
```

**Notes:**
- Data shipping agents sesuai dengan yang di-generate di `generateMockContainersWithGPS()`
- Total 8 shipping agents

---

### Error Response Format

Semua error menggunakan format yang sama:

```json
{
  "status": "error",
  "message": "Error message description"
}
```

**HTTP Status Codes:**
- `200 OK` - Request berhasil
- `400 Bad Request` - Parameter tidak valid
- `401 Unauthorized` - Authentication gagal
- `404 Not Found` - Data tidak ditemukan
- `500 Internal Server Error` - Server error

---

### Integration Example

**React/TypeScript:**
```typescript
// src/services/containerApi.ts
const API_BASE = 'https://api.container-system.com/v1';
const AUTH_TOKEN = 'your-token-here';

export const getZones = async () => {
  const response = await fetch(`${API_BASE}/zones`, {
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`
    }
  });
  return response.json();
};

export const getContainersGrouped = async () => {
  const response = await fetch(`${API_BASE}/containers/grouped`, {
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`
    }
  });
  return response.json();
};

export const searchContainer = async (containerNumber?: string, shippingAgent?: string) => {
  const params = new URLSearchParams();
  if (containerNumber) params.append('container_number', containerNumber);
  if (shippingAgent) params.append('shipping_agent', shippingAgent);
  
  const response = await fetch(`${API_BASE}/containers/search?${params}`, {
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`
    }
  });
  return response.json();
};

// Usage in MonitoringCanvas.tsx
useEffect(() => {
  const fetchData = async () => {
    const zonesData = await getZones();
    const containersData = await getContainersGrouped();
    
    setZones(zonesData.data);
    setGroupedContainers(containersData.data);
  };
  
  fetchData();
}, []);
```

---
- `500 Internal Server Error` - Server error

---

## Future Enhancements

### Backend Integration
- [ ] Implement REST API endpoints (see API Specification above)
- [ ] Real GPS hardware integration (WebSocket/MQTT for real-time updates)
- [ ] Database setup (PostgreSQL/MySQL with PostGIS for spatial queries)
- [ ] Zone auto-assignment algorithm based on GPS coordinates

### Features
- [ ] Real-time updates with WebSocket subscriptions
- [ ] Push notifications for container movements
- [ ] Advanced stacking rules validation (max height, weight limits)
- [ ] Container status tracking (IN/OUT/MOVING)
- [ ] Dynamic container scaling based on zoom level
- [ ] Multiple yard/area support
- [ ] Historical playback of container movements
- [ ] Heat map visualization for high-traffic zones
- [ ] Export reports (PDF/Excel) and analytics
- [ ] User authentication and role-based access control
- [ ] Audit logs and change tracking

### Optimization
- [ ] Virtual scrolling for large container lists
- [ ] Canvas rendering optimization (WebGL)
- [ ] Offline mode with local caching
- [ ] Progressive Web App (PWA) support

## Development Notes

### Data Flow Pattern
- **No global state management** - pages manage their own state with `useState`
- **Props drilling pattern** for component communication
- **Zone-based architecture**: Zones → Containers (1:N relationship)
- **Automatic zone assignment**: GPS coordinates determine zone membership

### Type System
All types defined in `src/types/container.ts`:
- `ZoneGPS`: Zone with 4 corner GPS points
- `ContainerPosition`: Container with zone assignment and stack level
- `GroupedContainer`: Grouped containers by zone for visualization
- `YardBoundary`: Polygon yard boundary definition

### Mock Data Generation
Current flow:
1. Generate zones with GPS boundaries (`generateMockZones`)
2. Generate containers and auto-assign to zones (`generateMockContainersWithGPS`)
3. Group containers by zone for rendering (`groupContainersByZone`)

### Styling
- **Co-located CSS** - each component has its own `.css` file
- **BEM-like naming** for maintainability
- **Gradient system** for stack visualization
- **Responsive design** for various screen sizes

## Color Palette

- Primary green: `#1a4d2e`
- Gradients: `linear-gradient(135deg, #1a4d2e 0%, #0d2818 100%)`
- Stack gradients: Gray → Light Green → Medium Green → Teal → Blue

## Contributing

This is currently a POC (Proof of Concept) with mock data. 

### To Integrate with Real Backend:

1. **Replace Mock Data Sources:**
   - Remove mock data generators in `src/utils/mockGPSData.ts`
   - Create API service layer in `src/services/api.ts`
   - Implement API calls using fetch or axios

2. **Add State Management (Optional):**
   - Consider React Context or Redux for global state
   - Manage WebSocket connections for real-time updates
   - Cache API responses for performance

3. **Example API Integration:**
   ```typescript
   // src/services/containerService.ts
   export const getContainersGrouped = async () => {
     const response = await fetch('/api/v1/containers/grouped', {
       headers: {
         'Authorization': `Bearer ${token}`
       }
     });
     return response.json();
   };
   
   // In MonitoringCanvas.tsx
   useEffect(() => {
     const fetchData = async () => {
       const data = await getContainersGrouped();
       setGroupedContainers(data.data);
     };
     fetchData();
   }, []);
   ```

4. **Real-time Updates with WebSocket:**
   ```typescript
   // src/services/websocket.ts
   const ws = new WebSocket('wss://api.container-system.com/ws');
   
   ws.onmessage = (event) => {
     const update = JSON.parse(event.data);
     // Update container position in state
     updateContainerPosition(update);
   };
   ```

## Contact

For questions or support, please contact the development team.
