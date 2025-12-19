import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Line, Group } from 'react-konva';
import type Konva from 'konva';
import type { GroupedContainer, YardBoundary } from '../../types/container';
import { CoordinateTransformer } from '../../utils/coordinateTransform';
import ContainerMarker from './ContainerMarker';
import './YardCanvas.css';

interface YardCanvasProps {
  groupedContainers: GroupedContainer[];
  yardBounds: YardBoundary;
  highlightedGroupId?: string | null;
  onGroupClick: (group: GroupedContainer) => void;
}

const YardCanvas: React.FC<YardCanvasProps> = ({ 
  groupedContainers, 
  yardBounds,
  highlightedGroupId,
  onGroupClick 
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const stageRef = useRef<Konva.Stage>(null);
  
  // Auto-scroll to highlighted container group
  useEffect(() => {
    if (highlightedGroupId && stageRef.current) {
      const group = groupedContainers.find(g => g.id === highlightedGroupId);
      if (group) {
        const stage = stageRef.current;
        const newX = -group.canvasX * scale + stage.width() / 2;
        const newY = -group.canvasY * scale + stage.height() / 2;
        
        setPosition({ x: newX, y: newY });
      }
    }
  }, [highlightedGroupId, groupedContainers, scale]);
  
  // Handle zoom with mouse wheel
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    if (!stage) return;
    
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    
    // Limit zoom range
    if (newScale < 0.5 || newScale > 5) return;
    
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    
    setScale(newScale);
    setPosition(newPos);
  };
  
  // Render yard boundary (polygon or rectangle)
  const renderYardBoundary = () => {
    if (yardBounds.polygonPoints && yardBounds.polygonPoints.length >= 3) {
      // Polygon boundary
      const transformer = new CoordinateTransformer(yardBounds);
      const points = yardBounds.polygonPoints.flatMap(gps => {
        const canvas = transformer.gpsToCanvas(gps);
        return [canvas.x, canvas.y];
      });
      
      return (
        <Line
          points={points}
          closed={true}
          fill="#f9f9f9"
          stroke="#999"
          strokeWidth={3}
          listening={false}
        />
      );
    } else {
      // Rectangle boundary (legacy)
      return (
        <Rect
          x={0}
          y={0}
          width={yardBounds.canvasWidth}
          height={yardBounds.canvasHeight}
          fill="#f9f9f9"
          stroke="#999"
          strokeWidth={3}
          listening={false}
        />
      );
    }
  };
  
  // Render grid lines for better spatial reference
  const renderGrid = () => {
    const lines: JSX.Element[] = [];
    const { canvasWidth, canvasHeight } = yardBounds;
    const gridSize = 100; // Grid every 100 pixels
    
    // Vertical lines
    for (let i = 0; i <= canvasWidth; i += gridSize) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i, 0, i, canvasHeight]}
          stroke="#e0e0e0"
          strokeWidth={1}
          dash={[5, 5]}
        />
      );
    }
    
    // Horizontal lines
    for (let i = 0; i <= canvasHeight; i += gridSize) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i, canvasWidth, i]}
          stroke="#e0e0e0"
          strokeWidth={1}
          dash={[5, 5]}
        />
      );
    }
    
    return lines;
  };
  
  // Render zone labels with notch awareness
  const renderZoneLabels = () => {
    const zones = ['A', 'B', 'C', 'D', 'E'];
    const zoneWidth = yardBounds.canvasWidth / 5;
    
    return zones.map((zone, i) => (
      <Group key={zone}>
        <Line
          points={[
            i * zoneWidth, 0,
            i * zoneWidth, yardBounds.canvasHeight
          ]}
          stroke="#1a4d2e"
          strokeWidth={2}
          dash={[10, 5]}
          listening={false}
        />
        <Text
          text={`Zone ${zone}`}
          x={i * zoneWidth + 20}
          y={100} // Position below notch area
          fontSize={24}
          fill="#1a4d2e"
          fontStyle="bold"
          shadowBlur={3}
          shadowColor="white"
          listening={false}
        />
      </Group>
    ));
  };
  
  return (
    <div className="yard-canvas-container">
      <Stage
        ref={stageRef}
        width={Math.min(window.innerWidth - 40, 1400)}
        height={Math.min(window.innerHeight - 250, 800)}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        onWheel={handleWheel}
        draggable
        // Performance optimizations
        listening={true}
      >
        <Layer>
          {/* Yard boundary - polygon or rectangle */}
          {renderYardBoundary()}
          
          {/* Grid */}
          {renderGrid()}
          
          {/* Zone overlays */}
          {renderZoneLabels()}
          
          {/* Container markers */}
          {groupedContainers.map(group => (
            <ContainerMarker
              key={group.id}
              groupedContainer={group}
              onClick={() => onGroupClick(group)}
              isHighlighted={group.id === highlightedGroupId}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default YardCanvas;
