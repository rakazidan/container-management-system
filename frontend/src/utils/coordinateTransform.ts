import type { GPSCoordinate, YardBoundary } from '../types/container';

/**
 * CoordinateTransformer converts between GPS coordinates (latitude/longitude)
 * and canvas coordinates (x/y pixels) for rendering containers on canvas.
 */
export class CoordinateTransformer {
  private yardBounds: YardBoundary;
  
  constructor(yardBounds: YardBoundary) {
    this.yardBounds = yardBounds;
  }
  
  /**
   * Convert GPS coordinates to canvas pixel coordinates
   * @param gps - GPS coordinate (latitude, longitude)
   * @returns Canvas coordinate (x, y) in pixels
   */
  gpsToCanvas(gps: GPSCoordinate): { x: number; y: number } {
    const { topLeft, bottomRight, canvasWidth, canvasHeight } = this.yardBounds;
    
    // Calculate longitude range (x-axis)
    const lonRange = bottomRight.longitude - topLeft.longitude;
    // Calculate latitude range (y-axis) - note: latitude decreases as we go down
    const latRange = bottomRight.latitude - topLeft.latitude;
    
    // Normalize GPS to 0-1 range
    const normalizedX = (gps.longitude - topLeft.longitude) / lonRange;
    const normalizedY = (gps.latitude - topLeft.latitude) / latRange;
    
    return {
      x: normalizedX * canvasWidth,
      y: normalizedY * canvasHeight
    };
  }
  
  /**
   * Convert canvas pixel coordinates to GPS coordinates
   * Useful for future features like clicking on canvas to add containers
   * @param x - Canvas x coordinate in pixels
   * @param y - Canvas y coordinate in pixels
   * @returns GPS coordinate (latitude, longitude)
   */
  canvasToGPS(x: number, y: number): GPSCoordinate {
    const { topLeft, bottomRight, canvasWidth, canvasHeight } = this.yardBounds;
    
    // Calculate longitude range (x-axis)
    const lonRange = bottomRight.longitude - topLeft.longitude;
    // Calculate latitude range (y-axis)
    const latRange = bottomRight.latitude - topLeft.latitude;
    
    return {
      longitude: topLeft.longitude + (x / canvasWidth) * lonRange,
      latitude: topLeft.latitude + (y / canvasHeight) * latRange
    };
  }
  
  /**
   * Calculate distance between two GPS coordinates in meters
   * Uses Haversine formula for accuracy
   * @param coord1 - First GPS coordinate
   * @param coord2 - Second GPS coordinate
   * @returns Distance in meters
   */
  calculateDistance(coord1: GPSCoordinate, coord2: GPSCoordinate): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (coord1.latitude * Math.PI) / 180;
    const φ2 = (coord2.latitude * Math.PI) / 180;
    const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }
}
