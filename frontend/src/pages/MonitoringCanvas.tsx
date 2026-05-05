import React, { useState, useEffect, useCallback } from 'react';
import YardCanvas from '../components/canvas/YardCanvas';
import ControlPanel from '../components/canvas/ControlPanel';
import type { GroupedContainer, YardBoundary } from '../types/container';
import { DEFAULT_YARD_BOUNDS, isInsideYard } from '../utils/mockGPSData';
import { CoordinateTransformer } from '../utils/coordinateTransform';
import { getZones, getContainersGrouped, searchContainer, getGpsLatest, getYardConfig } from '../services/api';
import './MonitoringCanvas.css';
import '../components/Container.css';

const GPS_POLL_MS = 3000; // polling setiap 3 detik (sync dengan ESP32 delay)

interface Esp32Position {
  canvasX: number;
  canvasY: number;
  deviceId: string;
  isLive: boolean;
  lat: number;
  lng: number;
  recordedAt: string;
}


const MonitoringCanvas: React.FC = () => {
  const [groupedContainers, setGroupedContainers] = useState<GroupedContainer[]>([]);
  const [yardBounds, setYardBounds] = useState<YardBoundary>(DEFAULT_YARD_BOUNDS); // Fetch from API
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [searchCode, setSearchCode] = useState('');
  const [searchAgent, setSearchAgent] = useState('');
  const [highlightedGroupId, setHighlightedGroupId] = useState<string | null>(null);
  const [searchMessage, setSearchMessage] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<GroupedContainer | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ── ESP32 GPS state ──
  const [esp32Position, setEsp32Position] = useState<Esp32Position | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'connecting' | 'live' | 'outside' | 'offline'>('connecting');

  // ── Initialize canvas position: center the yard ──
  useEffect(() => {
    const canvasWidth = Math.min(window.innerWidth - 40, 1400);
    const canvasHeight = Math.min(window.innerHeight - 250, 800);
    const yardCenterX = yardBounds.canvasWidth / 2;
    const yardCenterY = yardBounds.canvasHeight / 2;
    setPosition({
      x: canvasWidth / 2 - yardCenterX,
      y: canvasHeight / 2 - yardCenterY,
    });
  }, [yardBounds]);

  // ── Fetch Yard Configuration from Database ──
  useEffect(() => {
    const fetchYardConfig = async () => {
      try {
        const res = await getYardConfig() as any;
        if (res.status === 'success' && res.data) {
          const config = res.data;
          // Convert API response to YardBoundary type
          const yardConfig: YardBoundary = {
            topLeft: config.top_left,
            bottomRight: config.bottom_right,
            polygonPoints: config.polygon_points || [],
            canvasWidth: config.canvas_width || 1200,
            canvasHeight: config.canvas_height || 800,
          };
          setYardBounds(yardConfig);
          console.log('✅ Yard config loaded from database:', config.yard_name);
        }
      } catch (e) {
        console.warn('⚠️ Failed to load yard config from DB, using default:', e);
        // Keep DEFAULT_YARD_BOUNDS as fallback
      }
    };
    
    fetchYardConfig();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [, groupedRes] = await Promise.all([
          getZones() as Promise<any>,
          getContainersGrouped() as Promise<any>,
        ]);

        const transformer = new CoordinateTransformer(yardBounds);

        // Map API response → GroupedContainer type yang dipakai canvas
        const groups: GroupedContainer[] = (groupedRes.data || []).map((g: any) => {
          const gpsCoord = g.gps_coordinate;
          const canvas = transformer.gpsToCanvas(gpsCoord);

          return {
            id: g.id,
            zoneId: g.zone_id,
            zoneName: g.zone_name,
            containers: g.containers.map((c: any) => ({
              id: c.id,
              containerNumber: c.container_number,
              shippingAgent: c.shipping_agent,
              agentId: c.agent_id,
              stackLevel: c.stack_level,
              yardInDate: c.yard_in_date,
              zoneId: c.zone_id,
              zoneName: c.zone_name,
              gpsCoordinate: gpsCoord,
              canvasX: canvas.x,
              canvasY: canvas.y,
              rotation: g.rotation || 0,
            })),
            canvasX: canvas.x,
            canvasY: canvas.y,
            totalStacks: g.total_stacks,
            rotation: g.rotation || 0,
          };
        });

        setGroupedContainers(groups);
      } catch (e) {
        setError('Failed to load monitoring data. Make sure the backend is running.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [yardBounds]); // Re-fetch containers when yard bounds change

  // ── GPS ESP32 polling — setiap 3 detik ──
  const fetchGps = useCallback(async () => {
    try {
      const res = await getGpsLatest('esp32-01') as any;
      if (res.status === 'success' && res.data) {
        const { lat, lng, device_id, recorded_at } = res.data;
        const gpsPoint = { latitude: lat, longitude: lng };
        
        // ✅ Validasi: hanya render ESP32 jika berada DI DALAM yard boundary
        const isInside = isInsideYard(gpsPoint, yardBounds);
        
        if (isInside) {
          const transformer = new CoordinateTransformer(yardBounds);
          const canvas = transformer.gpsToCanvas(gpsPoint);
          setEsp32Position({
            canvasX: canvas.x,
            canvasY: canvas.y,
            deviceId: device_id,
            isLive: true,
            lat,
            lng,
            recordedAt: recorded_at,
          });
          setGpsStatus('live');
        } else {
          // ESP32 ada GPS signal tapi berada di LUAR yard
          console.log(`⚠️ ESP32 is outside yard boundary: ${lat}, ${lng}`);
          setEsp32Position(null); // Jangan render marker
          setGpsStatus('outside'); // Status khusus untuk device di luar yard
        }
      } else {
        setGpsStatus('offline');
        setEsp32Position(null);
      }
    } catch {
      setGpsStatus('offline');
      setEsp32Position(null);
    }
  }, [yardBounds]); // Depend on yardBounds

  useEffect(() => {
    fetchGps();
    const timer = setInterval(fetchGps, GPS_POLL_MS);
    return () => clearInterval(timer);
  }, [fetchGps]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setHighlightedGroupId(null);
    setSearchMessage('');
    setShowModal(false);

    if (!searchCode.trim() && !searchAgent.trim()) {
      setSearchMessage('Please enter container number or shipping agent');
      return;
    }

    try {
      const res = await searchContainer({
        container_number: searchCode.trim() || undefined,
        shipping_agent: searchAgent.trim() || undefined,
      }) as any;

      const zoneId = res.data?.zone_id;
      const groupId = `stack-${zoneId}`;
      const foundGroup = groupedContainers.find(g => g.id === groupId);

      if (foundGroup) {
        setHighlightedGroupId(groupId);
        setSelectedGroup(foundGroup);
        setSearchMessage(`Found! Stack contains ${foundGroup.totalStacks} container(s)`);
      } else {
        setSearchMessage('Container found but zone not in view');
      }
    } catch (err: any) {
      if (err.message?.includes('404') || err.message?.includes('not found')) {
        setSearchMessage('Container not found');
      } else {
        setSearchMessage('Search error: ' + err.message);
      }
    }
  };

  const handleClearSearch = () => {
    setSearchCode('');
    setSearchAgent('');
    setHighlightedGroupId(null);
    setSearchMessage('');
    setSelectedGroup(null);
    setShowModal(false);
  };

  const handleGroupClick = (group: GroupedContainer) => {
    setSelectedGroup(group);
    setHighlightedGroupId(group.id);
    setShowModal(true);
  };

  const handleZoomIn = () => {
    setScale(s => {
      const newScale = Math.min(s * 1.2, 5);
      // Adjust position to keep center point stable
      const canvasWidth = Math.min(window.innerWidth - 40, 1400);
      const canvasHeight = Math.min(window.innerHeight - 250, 800);
      const centerX = (canvasWidth / 2 - position.x) / scale;
      const centerY = (canvasHeight / 2 - position.y) / scale;
      setPosition({
        x: canvasWidth / 2 - centerX * newScale,
        y: canvasHeight / 2 - centerY * newScale,
      });
      return newScale;
    });
  };

  const handleZoomOut = () => {
    setScale(s => {
      const newScale = Math.max(s / 1.2, 0.5);
      // Adjust position to keep center point stable
      const canvasWidth = Math.min(window.innerWidth - 40, 1400);
      const canvasHeight = Math.min(window.innerHeight - 250, 800);
      const centerX = (canvasWidth / 2 - position.x) / scale;
      const centerY = (canvasHeight / 2 - position.y) / scale;
      setPosition({
        x: canvasWidth / 2 - centerX * newScale,
        y: canvasHeight / 2 - centerY * newScale,
      });
      return newScale;
    });
  };

  const handleResetView = () => {
    setScale(1);
    // Reset to center position
    const canvasWidth = Math.min(window.innerWidth - 40, 1400);
    const canvasHeight = Math.min(window.innerHeight - 250, 800);
    const yardCenterX = yardBounds.canvasWidth / 2;
    const yardCenterY = yardBounds.canvasHeight / 2;
    setPosition({
      x: canvasWidth / 2 - yardCenterX,
      y: canvasHeight / 2 - yardCenterY,
    });
  };

  return (
    <div className="monitoring-canvas-page">
      {/* Search Section */}
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form-wrapper">
          <div className="search-form">
            <div className="search-header-left">
              <h2 className="search-title">GPS-Based Container Tracking</h2>
              <p className="search-subtitle">Search and locate containers on the canvas map</p>
            </div>

            <div className="search-criteria">
              <div className="criteria-row">
                <input
                  type="text"
                  placeholder="Shipping Agent"
                  value={searchAgent}
                  onChange={(e) => setSearchAgent(e.target.value)}
                  className="criteria-input"
                />
                <input
                  type="text"
                  placeholder="Container Number"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  className="criteria-input"
                />
              </div>

              <button type="submit" className="search-btn-new">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                Search
              </button>

              {highlightedGroupId && (
                <button type="button" onClick={handleClearSearch} className="clear-btn-new">Clear</button>
              )}
            </div>
          </div>

          {searchMessage && (
            <div className={`search-message ${searchMessage.includes('not found') || searchMessage.includes('error') ? 'error' : 'success'}`}>
              {searchMessage}
            </div>
          )}
        </form>
      </div>

      {/* Canvas Section */}
      <div className="canvas-wrapper">
        <div className="canvas-header">
          {/* Row 1: Title + Status Indicators */}
          <div className="canvas-header-top">
            <div className="canvas-header-left">
              <h3>Container Yard Map</h3>
              {loading && <span className="status-text status-loading">Loading...</span>}
              {error && <span className="status-text status-error">{error}</span>}
            </div>

            <div className="canvas-header-right">
              {/* ESP32 GPS status badge */}
              <div className={`esp32-badge esp32-badge--${gpsStatus}`}>
                <span className="esp32-dot"></span>
                <span className="esp32-label">
                  {gpsStatus === 'live' && esp32Position
                    ? `🛰️ ${esp32Position.deviceId} — ${esp32Position.lat.toFixed(5)}, ${esp32Position.lng.toFixed(5)}`
                    : gpsStatus === 'connecting'
                    ? '🛰️ Connecting ESP32...'
                    : gpsStatus === 'outside'
                    ? '⚠️ ESP32 Outside Yard Boundary'
                    : '🛰️ ESP32 Offline'}
                </span>
              </div>
            </div>
          </div>

          {/* Row 2: Legend */}
          <div className="canvas-legend">
            <div className="legend-item"><div className="legend-box stack-0"></div><span>Empty</span></div>
            <div className="legend-item"><div className="legend-box stack-1"></div><span>1 Stack</span></div>
            <div className="legend-item"><div className="legend-box stack-2"></div><span>2 Stacks</span></div>
            <div className="legend-item"><div className="legend-box stack-3"></div><span>3 Stacks</span></div>
            <div className="legend-item"><div className="legend-box stack-4"></div><span>4+ Stacks</span></div>
            <div className="legend-item">
              <div className="legend-box legend-esp32"></div>
              <span>ESP32 Device</span>
            </div>
          </div>
        </div>

        <YardCanvas
          groupedContainers={groupedContainers}
          yardBounds={yardBounds}
          highlightedGroupId={highlightedGroupId}
          onGroupClick={handleGroupClick}
          esp32Position={esp32Position}
          scale={scale}
          position={position}
          onScaleChange={setScale}
          onPositionChange={setPosition}
        />

        <ControlPanel
          scale={scale}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleResetView}
          containerCount={groupedContainers.length}
        />
      </div>

      {/* Selected Stack Info */}
      {selectedGroup && !showModal && (
        <div className="selected-info-card">
          <h4>Selected Stack - Zone {selectedGroup.zoneName}</h4>
          <p><strong>Zone ID:</strong> {selectedGroup.zoneId}</p>
          <p><strong>Total Containers:</strong> {selectedGroup.totalStacks}</p>
          {selectedGroup.containers[0] && (
            <p><strong>GPS:</strong> {selectedGroup.containers[0].gpsCoordinate.latitude.toFixed(6)}, {selectedGroup.containers[0].gpsCoordinate.longitude.toFixed(6)}</p>
          )}
          <button onClick={() => setShowModal(true)} className="view-details-btn">View Details</button>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedGroup && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content-compact" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Container Stack Details - Zone {selectedGroup.zoneName}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="modal-info-row">
                <div className="modal-info-item">
                  <span className="modal-info-label">Zone</span>
                  <span className="modal-info-value">{selectedGroup.zoneName} ({selectedGroup.zoneId})</span>
                </div>
                {selectedGroup.containers[0] && (
                  <div className="modal-info-item">
                    <span className="modal-info-label">GPS Location</span>
                    <span className="modal-info-value">
                      {selectedGroup.containers[0].gpsCoordinate.latitude.toFixed(6)}, {selectedGroup.containers[0].gpsCoordinate.longitude.toFixed(6)}
                    </span>
                  </div>
                )}
                <div className="modal-info-item">
                  <span className="modal-info-label">Total Stack</span>
                  <span className="modal-info-value">{selectedGroup.totalStacks}/4</span>
                </div>
              </div>
              {selectedGroup.containers.length > 0 ? (
                <table className="container-table-compact">
                  <thead>
                    <tr>
                      <th>Stack Level</th>
                      <th>Shipping Agent</th>
                      <th>Container Number</th>
                      <th>Yard In Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedGroup.containers.map((c) => (
                      <tr key={c.id}>
                        <td>{c.stackLevel}</td>
                        <td>{c.shippingAgent}</td>
                        <td className="container-number">{c.containerNumber}</td>
                        <td>{c.yardInDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="empty-message">No containers in this position</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitoringCanvas;
