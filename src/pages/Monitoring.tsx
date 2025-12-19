import { useState, useEffect } from 'react'
import '../App.css'
import Zone from '../components/Zone'
import type { Zone as ZoneType, ContainerInfo } from '../types/container'
import { generateZoneData } from '../utils/zoneData'

function Monitoring() {
  const [zones, setZones] = useState<ZoneType[]>([]);
  const [searchCode, setSearchCode] = useState('');
  const [searchAgent, setSearchAgent] = useState('');
  const [searchedContainer, setSearchedContainer] = useState<{zoneId: string, positionId: number} | null>(null);
  const [searchResultInfo, setSearchResultInfo] = useState<{zone: string, position: number, stack: number, containerInfo: ContainerInfo} | null>(null);
  const [searchMessage, setSearchMessage] = useState('');

  useEffect(() => {
    setZones(generateZoneData());
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchedContainer(null);
    setSearchResultInfo(null);
    setSearchMessage('');
    
    if (!searchCode.trim() && !searchAgent.trim()) {
      setSearchMessage('Please enter container number or shipping agent');
      return;
    }

    for (const zone of zones) {
      for (const container of zone.containers) {
        const found = container.containerInfos.find(
          info => {
            const matchCode = !searchCode.trim() || info.containerNumber.toLowerCase() === searchCode.trim().toLowerCase();
            const matchAgent = !searchAgent.trim() || info.shippingAgent.toLowerCase().includes(searchAgent.trim().toLowerCase());
            return matchCode && matchAgent;
          }
        );
        
        if (found) {
          setSearchedContainer({
            zoneId: zone.id,
            positionId: container.id
          });
          setSearchResultInfo({
            zone: zone.name,
            position: container.id,
            stack: found.stackPosition,
            containerInfo: found
          });
          setSearchMessage(`Container found!`);
          
          setTimeout(() => {
            const element = document.getElementById(`zone-${zone.id}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
          
          return;
        }
      }
    }
    
    setSearchMessage('Container not found');
  };

  const handleClearSearch = () => {
    setSearchCode('');
    setSearchAgent('');
    setSearchedContainer(null);
    setSearchResultInfo(null);
    setSearchMessage('');
  };

  return (
    <div className="main-content">
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form-wrapper">
          <div className="search-form">
            <div className="search-header-left">
              <h2 className="search-title">Let's Find Container Location</h2>
              <p className="search-subtitle">Type Container Number to Find where the container was last placed</p>
            </div>
            
            <div className="search-criteria">
              <div className="criteria-row">
                <input
                  id="shipping-agent"
                  type="text"
                  placeholder="Shipping Agent"
                  value={searchAgent}
                  onChange={(e) => setSearchAgent(e.target.value)}
                  className="criteria-input"
                />
                
                <input
                  id="container-number"
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
              
              {searchedContainer && (
                <button type="button" onClick={handleClearSearch} className="clear-btn-new">Clear</button>
              )}
            </div>
          </div>
          
          {searchMessage && (
            <div className={`search-message ${searchMessage.includes('not found') ? 'error' : 'success'}`}>
              {searchMessage}
              {searchResultInfo && (
                <div className="search-result-detail">
                  <strong>Location:</strong> Zone {searchResultInfo.zone}, Position {searchResultInfo.position}, Stack {searchResultInfo.stack}
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      <div className="zones-section">
        <div className="detail-section">
          <h2 className="section-title">Detail Container Location</h2>
          
          <div className="legend">
            <div className="legend-item">
              <div className="legend-box stack-0"></div>
              <span>0 Stack</span>
            </div>
            <div className="legend-item">
              <div className="legend-box stack-1"></div>
              <span>1 Stack</span>
            </div>
            <div className="legend-item">
              <div className="legend-box stack-2"></div>
              <span>2 Stack</span>
            </div>
            <div className="legend-item">
              <div className="legend-box stack-3"></div>
              <span>3 Stack</span>
            </div>
            <div className="legend-item">
              <div className="legend-box stack-4"></div>
              <span>4 Stack</span>
            </div>
          </div>

          <div className="zones-container">
            {zones.map((zone) => (
              <Zone 
                key={zone.id} 
                zone={zone} 
                searchedContainer={searchedContainer}
              />
            ))}
          </div>
        </div>
      </div>

      {searchResultInfo && (
        <div className={`detail-popup ${['A', 'B', 'C'].includes(searchResultInfo.zone) ? 'right' : 'left'}`}>
          <div className="popup-header">
            <h2>Detail Container</h2>
            <button className="popup-close" onClick={handleClearSearch}>&times;</button>
          </div>
          <div className="popup-body">
            <div className="detail-row">
              <span className="detail-label">Shipping Agent:</span>
              <span className="detail-value">{searchResultInfo.containerInfo.shippingAgent}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Container Number:</span>
              <span className="detail-value container-number-display">{searchResultInfo.containerInfo.containerNumber}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Yard In Date:</span>
              <span className="detail-value">{searchResultInfo.containerInfo.yardInDate}</span>
            </div>

            <div className="stack-visualization">
              <h3>Detail Stack Position</h3>
              <div className="stack-content">
                <div className="stack-display">
                  {[4, 3, 2, 1].map((stackNum) => {
                    const zoneCode = `${searchResultInfo.zone}${searchResultInfo.position}.${String(stackNum).padStart(2, '0')}`;
                    return (
                      <div 
                        key={stackNum} 
                        className={`stack-box ${stackNum === searchResultInfo.stack ? 'active-stack' : ''}`}
                      >
                        <span className="stack-zone-code">{zoneCode}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="stack-info">
                  <div className="info-row">
                    <div className="info-item">
                      <span className="info-label">Zone</span>
                      <span className="info-value-large">
                        {searchResultInfo.zone}{searchResultInfo.position}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Stack Level</span>
                      <span className="info-value-large">{String(searchResultInfo.stack).padStart(2, '0')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Monitoring
