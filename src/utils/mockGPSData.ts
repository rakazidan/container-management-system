import type { ContainerPosition, YardBoundary, GPSCoordinate } from '../types/container';
import { CoordinateTransformer } from './coordinateTransform';

// Reuse existing generators from zoneData.ts
const generateContainerNumber = (): string => {
  const prefix = ['MSCU', 'TCLU', 'CSNU', 'HLXU', 'TEMU'];
  const randomPrefix = prefix[Math.floor(Math.random() * prefix.length)];
  const randomNumber = Math.floor(Math.random() * 9000000) + 1000000;
  const checkDigit = Math.floor(Math.random() * 10);
  return `${randomPrefix}${randomNumber}${checkDigit}`;
};

const generateShippingAgent = (): string => {
  const agents = [
    'Maersk Line',
    'MSC',
    'CMA CGM',
    'COSCO',
    'Hapag-Lloyd',
    'ONE',
    'Evergreen',
    'Yang Ming'
  ];
  return agents[Math.floor(Math.random() * agents.length)];
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
 * Generate random GPS coordinate within yard boundaries
 */
const generateRandomGPS = (yardBounds: YardBoundary): GPSCoordinate => {
  const { topLeft, bottomRight } = yardBounds;
  
  const latRange = bottomRight.latitude - topLeft.latitude;
  const lonRange = bottomRight.longitude - topLeft.longitude;
  
  return {
    latitude: topLeft.latitude + Math.random() * latRange,
    longitude: topLeft.longitude + Math.random() * lonRange
  };
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
 * Generate mock containers with GPS coordinates
 * @param yardBounds - Yard boundary with GPS coordinates
 * @param count - Number of containers to generate
 * @returns Array of ContainerPosition with GPS and canvas coordinates
 */
export const generateMockContainersWithGPS = (
  yardBounds: YardBoundary,
  count: number = 50
): ContainerPosition[] => {
  const transformer = new CoordinateTransformer(yardBounds);
  const containers: ContainerPosition[] = [];
  let attempts = 0;
  const maxAttempts = count * 10; // Prevent infinite loop
  
  // Generate containers only inside the polygon
  while (containers.length < count && attempts < maxAttempts) {
    attempts++;
    const gps = generateRandomGPS(yardBounds);
    
    // Check if point is inside yard polygon
    if (isInsideYard(gps, yardBounds)) {
      const canvas = transformer.gpsToCanvas(gps);
      
      containers.push({
        id: `container-${containers.length + 1}`,
        containerNumber: generateContainerNumber(),
        shippingAgent: generateShippingAgent(),
        yardInDate: generateYardInDate(),
        gpsCoordinate: gps,
        canvasX: canvas.x,
        canvasY: canvas.y,
        stackCount: 1,
        rotation: Math.random() > 0.5 ? 0 : 90
      });
    }
  }
  
  return containers;
};

/**
 * Group nearby containers into stacks
 * Containers within proximityThreshold distance are considered part of the same stack
 */
export const groupNearbyContainers = (
  containers: ContainerPosition[],
  proximityThreshold: number = 35
): any[] => {
  const grouped: any[] = [];
  const processed = new Set<string>();
  
  containers.forEach(container => {
    if (processed.has(container.id)) return;
    
    // Find nearby containers
    const nearby = containers.filter(other => {
      if (other.id === container.id || processed.has(other.id)) return false;
      
      const distance = Math.sqrt(
        Math.pow(container.canvasX - other.canvasX, 2) +
        Math.pow(container.canvasY - other.canvasY, 2)
      );
      
      return distance < proximityThreshold;
    });
    
    // Create group
    const allInGroup = [container, ...nearby];
    allInGroup.forEach(c => processed.add(c.id));
    
    // Calculate average position for the group
    const avgX = allInGroup.reduce((sum, c) => sum + c.canvasX, 0) / allInGroup.length;
    const avgY = allInGroup.reduce((sum, c) => sum + c.canvasY, 0) / allInGroup.length;
    
    grouped.push({
      id: `group-${container.id}`,
      containers: allInGroup,
      canvasX: avgX,
      canvasY: avgY,
      totalStacks: allInGroup.length,
      rotation: container.rotation
    });
  });
  
  return grouped;
};

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
  // Polygon with notch at top center (iPhone style)
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
