import React from 'react';
import type { Zone as ZoneType } from '../types/container';
import Container from './Container';
import './Zone.css';

interface ZoneProps {
  zone: ZoneType;
  searchedContainer: {zoneId: string, positionId: number} | null;
}

const Zone: React.FC<ZoneProps> = ({ zone, searchedContainer }) => {
  return (
    <div className="zone-wrapper" id={`zone-${zone.id}`}>
      <div className="zone-grid">
        {zone.containers.map((container) => (
          <Container 
            key={container.id} 
            container={container}
            zoneName={zone.name}
            isSearchActive={searchedContainer !== null}
            isSearchedContainer={searchedContainer?.zoneId === zone.id && searchedContainer?.positionId === container.id}
          />
        ))}
      </div>
      <div className="zone-label">
        Zone {zone.name}
      </div>
    </div>
  );
};

export default Zone;
