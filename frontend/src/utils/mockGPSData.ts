import type { ContainerPosition, YardBoundary, GPSCoordinate, ZoneGPS } from '../types/container';
import { CoordinateTransformer } from './coordinateTransform';

// Reuse existing generators from zoneData.ts
const generateContainerNumber = (): string => {
  const prefix = ['MSCU', 'TCLU', 'CSNU', 'HLXU', 'TEMU'];
  const randomPrefix = prefix[Math.floor(Math.random() * prefix.length)];
  const randomNumber = Math.floor(Math.random() * 9000000) + 1000000;
  const checkDigit = Math.floor(Math.random() * 10);
  return `${randomPrefix}${randomNumber}${checkDigit}`;
};

const generateYardInDate = (): string => {
  const today = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date(today);
  date.setDate(date.getDate() - daysAgo);
  
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  date.setSeconds(Math.floor(Math.random() * 60));
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * Generate zones dengan 4 titik GPS membentuk rectangle
 * Sesuai struktur TB_M_ZONE (latlong_upleft, latlong_downleft, latlong_upright, latlong_downright)
 */
export const generateMockZones = (yardBounds: YardBoundary, zoneCount: number = 5): ZoneGPS[] => {
  const zones: ZoneGPS[] = [];
  const zoneNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  
  const { topLeft, bottomRight } = yardBounds;
  const totalWidth = bottomRight.longitude - topLeft.longitude;
  const totalHeight = bottomRight.latitude - topLeft.latitude;
  
  // Calculate grid layout (e.g., 2x3 for 5-6 zones)
  const cols = Math.ceil(Math.sqrt(zoneCount));
  const rows = Math.ceil(zoneCount / cols);
  
  const zoneWidth = totalWidth / cols;
  const zoneHeight = totalHeight / rows;
  
  for (let i = 0; i < zoneCount && i < zoneNames.length; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    
    // Calculate 4 corner points
    const left = topLeft.longitude + (col * zoneWidth);
    const right = left + zoneWidth;
    const top = topLeft.latitude + (row * zoneHeight);
    const bottom = top + zoneHeight;
    
    zones.push({
      zoneId: `zone-${zoneNames[i]}`,
      zoneName: zoneNames[i],
      areaId: 'area-01', // Default area
      latlongUpleft: { latitude: top, longitude: left },
      latlongDownleft: { latitude: bottom, longitude: left },
      latlongUpright: { latitude: top, longitude: right },
      latlongDownright: { latitude: bottom, longitude: right }
    });
  }
  
  return zones;
};

/**
 * Check if GPS point is inside zone rectangle
 * Zone dibentuk oleh 4 corner points
 */
export const isPointInZone = (point: GPSCoordinate, zone: ZoneGPS): boolean => {
  const minLat = Math.min(
    zone.latlongUpleft.latitude,
    zone.latlongDownleft.latitude,
    zone.latlongUpright.latitude,
    zone.latlongDownright.latitude
  );
  const maxLat = Math.max(
    zone.latlongUpleft.latitude,
    zone.latlongDownleft.latitude,
    zone.latlongUpright.latitude,
    zone.latlongDownright.latitude
  );
  const minLon = Math.min(
    zone.latlongUpleft.longitude,
    zone.latlongDownleft.longitude,
    zone.latlongUpright.longitude,
    zone.latlongDownright.longitude
  );
  const maxLon = Math.max(
    zone.latlongUpleft.longitude,
    zone.latlongDownleft.longitude,
    zone.latlongUpright.longitude,
    zone.latlongDownright.longitude
  );
  
  return point.latitude >= minLat && 
         point.latitude <= maxLat && 
         point.longitude >= minLon && 
         point.longitude <= maxLon;
};

/**
 * Check if a GPS coordinate is inside the yard polygon
 * Uses ray casting algorithm for point-in-polygon test
 */
export const isInsideYard = (point: GPSCoordinate, yardBounds: YardBoundary): boolean => {
  // If no polygon defined, use rectangular bounds
  if (!yardBounds.polygonPoints || yardBounds.polygonPoints.length < 3) {
    return point.latitude >= yardBounds.topLeft.latitude &&
           point.latitude <= yardBounds.bottomRight.latitude &&
           point.longitude >= yardBounds.topLeft.longitude &&
           point.longitude <= yardBounds.bottomRight.longitude;
  }
  
  // Ray casting algorithm for polygon
  let inside = false;
  const polygon = yardBounds.polygonPoints;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].longitude;
    const yi = polygon[i].latitude;
    const xj = polygon[j].longitude;
    const yj = polygon[j].latitude;
    
    const intersect = ((yi > point.latitude) !== (yj > point.latitude))
        && (point.longitude < (xj - xi) * (point.latitude - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }
  
  return inside;
};

/**
 * Generate mock containers dengan GPS coordinates dan assign ke zones
 * 1 ZONE = 1 STACK POSITION
 * Zone digunakan untuk logic stacking: semua container dalam 1 zone = 1 vertical stack
 * @param yardBounds - Yard boundary with GPS coordinates
 * @param zones - Array of zones (1 zone = 1 stack position)
 * @returns Array of ContainerPosition dengan zone assignment dan stack levels
 */
export const generateMockContainersWithGPS = (
  yardBounds: YardBoundary,
  zones: ZoneGPS[]
): ContainerPosition[] => {
  const transformer = new CoordinateTransformer(yardBounds);
  const containers: ContainerPosition[] = [];
  const shippingAgents = [
    { id: 'AG001', name: 'Maersk Line' },
    { id: 'AG002', name: 'MSC' },
    { id: 'AG003', name: 'CMA CGM' },
    { id: 'AG004', name: 'COSCO' },
    { id: 'AG005', name: 'Hapag-Lloyd' },
    { id: 'AG006', name: 'ONE' },
    { id: 'AG007', name: 'Evergreen' },
    { id: 'AG008', name: 'Yang Ming' }
  ];
  
  // Loop through each zone - setiap zone = 1 stack
  zones.forEach(zone => {
    // Calculate center point of zone (average of 4 corners)
    const centerLat = (
      zone.latlongUpleft.latitude +
      zone.latlongDownleft.latitude +
      zone.latlongUpright.latitude +
      zone.latlongDownright.latitude
    ) / 4;
    
    const centerLon = (
      zone.latlongUpleft.longitude +
      zone.latlongDownleft.longitude +
      zone.latlongUpright.longitude +
      zone.latlongDownright.longitude
    ) / 4;
    
    const zoneGPS: GPSCoordinate = {
      latitude: centerLat,
      longitude: centerLon
    };
    
    const canvas = transformer.gpsToCanvas(zoneGPS);
    const rotation = Math.random() > 0.5 ? 0 : 90;
    
    // Tentukan berapa container di zone/stack ini (0-4)
    // 20% chance empty, otherwise 1-4 containers
    const containersInStack = Math.random() < 0.2 ? 0 : Math.floor(Math.random() * 4) + 1;
    
    // Generate containers untuk zone/stack ini
    for (let level = 1; level <= containersInStack; level++) {
      const agent = shippingAgents[Math.floor(Math.random() * shippingAgents.length)];
      
      containers.push({
        id: `container-${zone.zoneId}-L${level}`,
        containerNumber: generateContainerNumber(),
        shippingAgent: agent.name,
        agentId: agent.id,
        yardInDate: generateYardInDate(),
        stackLevel: level, // Stack level: 1 (bottom), 2, 3, 4 (top)
        zoneId: zone.zoneId,
        zoneName: zone.zoneName,
        gpsCoordinate: zoneGPS, // Semua container dalam 1 zone punya GPS sama (center of zone)
        canvasX: canvas.x,
        canvasY: canvas.y,
        rotation
      });
    }
  });
  
  return containers;
};

/**
 * Group containers by zone
 * 1 ZONE = 1 STACK
 * Containers diurutkan berdasarkan stack level (1 = bottom, 4 = top)
 */
export const groupContainersByZone = (
  containers: ContainerPosition[]
): any[] => {
  const grouped: any[] = [];
  const zoneMap = new Map<string, ContainerPosition[]>();
  
  // Group by zoneId
  containers.forEach(container => {
    if (!zoneMap.has(container.zoneId)) {
      zoneMap.set(container.zoneId, []);
    }
    zoneMap.get(container.zoneId)!.push(container);
  });
  
  // Convert to array and sort by stack level
  zoneMap.forEach((containersInZone, zoneId) => {
    if (containersInZone.length === 0) return;
    
    // Sort by stack level (1 = bottom, 4 = top)
    containersInZone.sort((a, b) => a.stackLevel - b.stackLevel);
    
    const firstContainer = containersInZone[0];
    
    grouped.push({
      id: `stack-${zoneId}`,
      zoneId: zoneId,
      zoneName: firstContainer.zoneName || '',
      containers: containersInZone,
      canvasX: firstContainer.canvasX,
      canvasY: firstContainer.canvasY,
      totalStacks: containersInZone.length,
      rotation: firstContainer.rotation,
      gpsCoordinate: firstContainer.gpsCoordinate
    });
  });
  
  return grouped;
};

// Export dengan nama lama untuk backward compatibility
export const groupNearbyContainers = groupContainersByZone;

/**
 * Default yard boundaries with iPhone-style notch at top
 * Polygon points form a closed shape
 */
export const DEFAULT_YARD_BOUNDS: YardBoundary = {
  // Bounding box for reference
  topLeft: { 
    latitude: -6.2000, 
    longitude: 106.8000 
  },
  bottomRight: { 
    latitude: -6.2100, 
    longitude: 106.8100 
  },
  // Polygon with notch at top center
  polygonPoints: [
    // Start from top-left corner
    { latitude: -6.2000, longitude: 106.8000 },
    // Go right to notch start (40% from left)
    { latitude: -6.2000, longitude: 106.8040 },
    // Notch curve - goes down
    { latitude: -6.2010, longitude: 106.8040 },
    // Notch bottom
    { latitude: -6.2010, longitude: 106.8060 },
    // Notch curve - goes up
    { latitude: -6.2000, longitude: 106.8060 },
    // Continue to top-right corner
    { latitude: -6.2000, longitude: 106.8100 },
    // Down to bottom-right
    { latitude: -6.2100, longitude: 106.8100 },
    // Across to bottom-left
    { latitude: -6.2100, longitude: 106.8000 },
    // Close polygon (auto connects to first point)
  ],
  canvasWidth: 1200,
  canvasHeight: 800
};
