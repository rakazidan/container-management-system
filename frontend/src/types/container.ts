export interface ContainerInfo {
  containerNumber: string;
  shippingAgent: string;
  yardInDate: string;
  stackPosition: number; // 1-4
}

export interface Container {
  id: number;
  stackCount: number; // 0-4
  containerInfos: ContainerInfo[]; // List of containers in each stack
}

export interface Zone {
  id: string;
  name: string;
  containers: Container[];
}

// GPS and Canvas Types
export interface GPSCoordinate {
  latitude: number;
  longitude: number;
}

// Zone dengan 4 titik GPS (sesuai TB_M_ZONE)
export interface ZoneGPS {
  zoneId: string;
  zoneName: string;
  areaId: string;
  // 4 corner points membentuk rectangle
  latlongUpleft: GPSCoordinate;     // Top-left
  latlongDownleft: GPSCoordinate;   // Bottom-left
  latlongUpright: GPSCoordinate;    // Top-right
  latlongDownright: GPSCoordinate;  // Bottom-right
}

export interface ContainerPosition {
  id: string;
  containerNumber: string;
  shippingAgent: string;
  yardInDate: string;
  stackLevel: number; // 1-4 (sesuai TB_M_CONTAINER.stack_level)
  agentId: string;
  zoneId: string; // Foreign key ke ZoneGPS
  zoneName?: string; // Untuk display
  gpsCoordinate: GPSCoordinate; // 1 titik GPS saja
  // Canvas coordinates (transformed from GPS)
  canvasX: number;
  canvasY: number;
  rotation: number; // 0 or 90 degrees for container orientation
}

export interface GroupedContainer {
  id: string;
  zoneId: string;
  zoneName: string;
  containers: ContainerPosition[];
  canvasX: number;
  canvasY: number;
  totalStacks: number;
  rotation: number;
}

export interface YardBoundary {
  // For polygon yards - array of GPS coordinates
  polygonPoints?: GPSCoordinate[];
  // Legacy rectangular support
  topLeft: GPSCoordinate;
  bottomRight: GPSCoordinate;
  // Canvas dimensions in pixels
  canvasWidth: number;
  canvasHeight: number;
}
