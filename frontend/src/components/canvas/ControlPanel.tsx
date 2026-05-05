import React from 'react';
import './ControlPanel.css';

interface ControlPanelProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  containerCount: number;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  scale, 
  onZoomIn, 
  onZoomOut, 
  onReset,
  containerCount 
}) => {
  return (
    <div className="control-panel">
      {/* Row 1: Controls + Info */}
      <div className="control-panel-top">
        <div className="control-group">
          <button onClick={onZoomIn} className="control-btn" title="Zoom In">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
              <line x1="11" y1="8" x2="11" y2="14"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
            Zoom In
          </button>
          
          <button onClick={onZoomOut} className="control-btn" title="Zoom Out">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
            Zoom Out
          </button>
          
          <button onClick={onReset} className="control-btn" title="Reset View">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
              <path d="M21 3v5h-5"></path>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
              <path d="M3 21v-5h5"></path>
            </svg>
            Reset
          </button>
        </div>
        
        <div className="control-info">
          <div className="info-item">
            <span className="info-label">Zoom:</span>
            <span className="info-value">{(scale * 100).toFixed(0)}%</span>
          </div>
          <div className="info-item">
            <span className="info-label">Containers:</span>
            <span className="info-value">{containerCount}</span>
          </div>
        </div>
      </div>
      
      {/* Row 2: Legend */}
      <div className="control-legend">
        <div className="legend-title">Stack Count Legend:</div>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color stack-0"></div>
            <span>Empty</span>
          </div>
          <div className="legend-item">
            <div className="legend-color stack-1"></div>
            <span>1 Stack</span>
          </div>
          <div className="legend-item">
            <div className="legend-color stack-2"></div>
            <span>2 Stacks</span>
          </div>
          <div className="legend-item">
            <div className="legend-color stack-3"></div>
            <span>3 Stacks</span>
          </div>
          <div className="legend-item">
            <div className="legend-color stack-4"></div>
            <span>4+ Stacks</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
