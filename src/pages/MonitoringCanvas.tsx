import React, { useState, useEffect } from 'react';
import YardCanvas from '../components/canvas/YardCanvas';
import ControlPanel from '../components/canvas/ControlPanel';
import type { ContainerPosition, GroupedContainer, ZoneGPS } from '../types/container';
import { generateMockContainersWithGPS, generateMockZones, DEFAULT_YARD_BOUNDS, groupNearbyContainers } from '../utils/mockGPSData';
import './MonitoringCanvas.css';
import '../components/Container.css'; // Reuse modal styles

const MonitoringCanvas: React.FC = () => {
  const [zones, setZones] = useState<ZoneGPS[]>([]);
  const [containers, setContainers] = useState<ContainerPosition[]>([]);
  const [groupedContainers, setGroupedContainers] = useState<GroupedContainer[]>([]);
  const [scale, setScale] = useState(1);
  const [searchCode, setSearchCode] = useState('');
  const [searchAgent, setSearchAgent] = useState('');
  const [highlightedGroupId, setHighlightedGroupId] = useState<string | null>(null);
  const [searchMessage, setSearchMessage] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<GroupedContainer | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Generate mock data on mount - sesuai database structure
  useEffect(() => {
    // 1. Generate zones dulu (TB_M_ZONE)
    // Setiap zone = 1 stack position
    const mockZones = generateMockZones(DEFAULT_YARD_BOUNDS, 20);
    setZones(mockZones);
    
    // 2. Generate containers untuk setiap zone (TB_M_CONTAINER)
    // 1 zone = 1 stack, bisa berisi 0-4 containers dengan stack level 1-4
    const mockContainers = generateMockContainersWithGPS(DEFAULT_YARD_BOUNDS, mockZones);
    setContainers(mockContainers);
    
    // 3. Group containers by zone (1 zone = 1 stack)
    const grouped = groupNearbyContainers(mockContainers);
    setGroupedContainers(grouped);
  }, []);
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHighlightedGroupId(null);
    setSearchMessage('');
    setShowModal(false);
    
    if (!searchCode.trim() && !searchAgent.trim()) {
      setSearchMessage('Please enter container number or shipping agent');
      return;
    }
    
    // Search through grouped containers
    const foundGroup = groupedContainers.find(group => {
      return group.containers.some(container => {
        const matchCode = !searchCode.trim() || 
          container.containerNumber.toLowerCase() === searchCode.trim().toLowerCase();
        const matchAgent = !searchAgent.trim() || 
          container.shippingAgent.toLowerCase().includes(searchAgent.trim().toLowerCase());
        return matchCode && matchAgent;
      });
    });
    
    if (foundGroup) {
      setHighlightedGroupId(foundGroup.id);
      setSelectedGroup(foundGroup);
      setSearchMessage(`Found! Stack contains ${foundGroup.totalStacks} container(s)`);
    } else {
      setSearchMessage('Container not found');
    }
  };
  
  // Clear search
  const handleClearSearch = () => {
    setSearchCode('');
    setSearchAgent('');
    setHighlightedGroupId(null);
    setSearchMessage('');
    setSelectedGroup(null);
    setShowModal(false);
  };
  
  // Handle container group click - open modal
  const handleGroupClick = (group: GroupedContainer) => {
    setSelectedGroup(group);
    setHighlightedGroupId(group.id);
    setShowModal(true);
  };
  
  // Handle zoom controls
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
            <div className={`search-message ${searchMessage.includes('not found') ? 'error' : 'success'}`}>
              {searchMessage}
            </div>
          )}
        </form>
      </div>

      {/* Canvas Section */}
      <div className="canvas-wrapper">
        <div className="canvas-header">
          <h3>Container Yard Map</h3>
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
        />
      </div>

      {/* Selected Container Info */}
      {selectedGroup && !showModal && (
        <div className="selected-info-card">
          <h4>Selected Stack - Zone {selectedGroup.zoneName}</h4>
          <p><strong>Zone ID:</strong> {selectedGroup.zoneId}</p>
          <p><strong>Total Containers:</strong> {selectedGroup.totalStacks}</p>
          <p><strong>GPS:</strong> {selectedGroup.containers[0].gpsCoordinate.latitude.toFixed(6)}, {selectedGroup.containers[0].gpsCoordinate.longitude.toFixed(6)}</p>
          <button onClick={() => setShowModal(true)} className="view-details-btn">View Details</button>
        </div>
      )}

      {/* Modal for container stack details */}
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
                <div className="modal-info-item">
                  <span className="modal-info-label">GPS Location</span>
                  <span className="modal-info-value">
                    {selectedGroup.containers[0].gpsCoordinate.latitude.toFixed(6)}, {selectedGroup.containers[0].gpsCoordinate.longitude.toFixed(6)}
                  </span>
                </div>
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
                    {selectedGroup.containers.map((container) => (
                      <tr key={container.id}>
                        <td>{container.stackLevel}</td>
                        <td>{container.shippingAgent}</td>
                        <td className="container-number">{container.containerNumber}</td>
                        <td>{container.yardInDate}</td>
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
