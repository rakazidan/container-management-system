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

export interface ContainerPosition {
  id: string;
  containerNumber: string;
  shippingAgent: string;
  yardInDate: string;
  gpsCoordinate: GPSCoordinate;
  // Canvas coordinates (transformed from GPS)
  canvasX: number;
  canvasY: number;
  stackCount: number;
  rotation: number; // 0 or 90 degrees for container orientation
}

export interface GroupedContainer {
  id: string;
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
