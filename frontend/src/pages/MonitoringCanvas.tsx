import React, { useState, useEffect } from 'react';
import YardCanvas from '../components/canvas/YardCanvas';
import ControlPanel from '../components/canvas/ControlPanel';
import type { GroupedContainer } from '../types/container';
import { DEFAULT_YARD_BOUNDS } from '../utils/mockGPSData';
import { CoordinateTransformer } from '../utils/coordinateTransform';
import { getZones, getContainersGrouped, searchContainer } from '../services/api';
import './MonitoringCanvas.css';
import '../components/Container.css';

const MonitoringCanvas: React.FC = () => {
  const [groupedContainers, setGroupedContainers] = useState<GroupedContainer[]>([]);
  const [scale, setScale] = useState(1);
  const [searchCode, setSearchCode] = useState('');
  const [searchAgent, setSearchAgent] = useState('');
  const [highlightedGroupId, setHighlightedGroupId] = useState<string | null>(null);
  const [searchMessage, setSearchMessage] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<GroupedContainer | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [, groupedRes] = await Promise.all([
          getZones() as Promise<any>,
          getContainersGrouped() as Promise<any>,
        ]);

        const transformer = new CoordinateTransformer(DEFAULT_YARD_BOUNDS);

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
  }, []);

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

  const handleZoomIn = () => setScale(s => Math.min(s * 1.2, 5));
  const handleZoomOut = () => setScale(s => Math.max(s / 1.2, 0.5));
  const handleResetView = () => setScale(1);

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
          <h3>Container Yard Map</h3>
          {loading && <span style={{ color: '#aaa', fontSize: '0.85rem' }}>Loading...</span>}
          {error && <span style={{ color: '#ef4444', fontSize: '0.85rem' }}>{error}</span>}
          <div className="canvas-legend">
            <div className="legend-item"><div className="legend-box stack-0"></div><span>Empty</span></div>
            <div className="legend-item"><div className="legend-box stack-1"></div><span>1 Stack</span></div>
            <div className="legend-item"><div className="legend-box stack-2"></div><span>2 Stacks</span></div>
            <div className="legend-item"><div className="legend-box stack-3"></div><span>3 Stacks</span></div>
            <div className="legend-item"><div className="legend-box stack-4"></div><span>4+ Stacks</span></div>
          </div>
        </div>

        <YardCanvas
          groupedContainers={groupedContainers}
          yardBounds={DEFAULT_YARD_BOUNDS}
          highlightedGroupId={highlightedGroupId}
          onGroupClick={handleGroupClick}
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
