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
      
      <div className="control-legend">
        <div className="legend-title">Stack Count:</div>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color" style={{background: 'linear-gradient(135deg, #9e9e9e 0%, #bdbdbd 100%)'}}></div>
            <span>0 (Empty)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{background: 'linear-gradient(135deg, #aed581 0%, #c5e1a5 100%)'}}></div>
            <span>1</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{background: 'linear-gradient(135deg, #66bb6a 0%, #81c784 100%)'}}></div>
            <span>2</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{background: 'linear-gradient(135deg, #26a69a 0%, #4db6ac 100%)'}}></div>
            <span>3</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{background: 'linear-gradient(135deg, #42a5f5 0%, #64b5f6 100%)'}}></div>
            <span>4 (Full)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
