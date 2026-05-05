import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Line } from 'react-konva';
import type Konva from 'konva';
import type { GroupedContainer, YardBoundary } from '../../types/container';
import { CoordinateTransformer } from '../../utils/coordinateTransform';
import ContainerMarker from './ContainerMarker';
import Esp32Marker from './Esp32Marker';
import './YardCanvas.css';

interface Esp32Position {
  canvasX: number;
  canvasY: number;
  deviceId: string;
  isLive: boolean;
}

interface YardCanvasProps {
  groupedContainers: GroupedContainer[];
  yardBounds: YardBoundary;
  highlightedGroupId?: string | null;
  onGroupClick: (group: GroupedContainer) => void;
  esp32Position?: Esp32Position | null;
  scale?: number;
  position?: { x: number; y: number };
  onScaleChange?: (scale: number) => void;
  onPositionChange?: (position: { x: number; y: number }) => void;
}

const YardCanvas: React.FC<YardCanvasProps> = ({
  groupedContainers,
  yardBounds,
  highlightedGroupId,
  onGroupClick,
  esp32Position = null,
  scale = 1,
  position = { x: 0, y: 0 },
  onScaleChange,
  onPositionChange,
}) => {
  const stageRef = useRef<Konva.Stage>(null);

  // Auto-scroll to highlighted container group
  useEffect(() => {
    if (highlightedGroupId && stageRef.current) {
      const group = groupedContainers.find(g => g.id === highlightedGroupId);
      if (group) {
        const stage = stageRef.current;
        const newX = -group.canvasX * scale + stage.width() / 2;
        const newY = -group.canvasY * scale + stage.height() / 2;
        onPositionChange?.({ x: newX, y: newY });
      }
    }
  }, [highlightedGroupId, groupedContainers, scale, onPositionChange]);

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
    if (newScale < 0.5 || newScale > 5) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    onScaleChange?.(newScale);
    onPositionChange?.(newPos);
  };

  // Handle drag end
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const stage = e.target as Konva.Stage;
    onPositionChange?.({
      x: stage.x(),
      y: stage.y(),
    });
  };

  // Render yard boundary (polygon or rectangle)
  const renderYardBoundary = () => {
    if (yardBounds.polygonPoints && yardBounds.polygonPoints.length >= 3) {
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
    const lines: React.JSX.Element[] = [];
    const { canvasWidth, canvasHeight } = yardBounds;
    const gridSize = 100;

    for (let i = 0; i <= canvasWidth; i += gridSize) {
      lines.push(
        <Line key={`v-${i}`} points={[i, 0, i, canvasHeight]} stroke="#e0e0e0" strokeWidth={1} dash={[5, 5]} />
      );
    }
    for (let i = 0; i <= canvasHeight; i += gridSize) {
      lines.push(
        <Line key={`h-${i}`} points={[0, i, canvasWidth, i]} stroke="#e0e0e0" strokeWidth={1} dash={[5, 5]} />
      );
    }
    return lines;
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
        onDragEnd={handleDragEnd}
        draggable
        listening={true}
      >
        <Layer>
          {/* Yard boundary */}
          {renderYardBoundary()}

          {/* Grid reference */}
          {renderGrid()}

          {/* Container stack markers */}
          {groupedContainers.map(group => (
            <ContainerMarker
              key={group.id}
              groupedContainer={group}
              onClick={() => onGroupClick(group)}
              isHighlighted={group.id === highlightedGroupId}
            />
          ))}

          {/* ESP32 GPS marker — posisi real-time device di dalam yard
              Bentuk menyerupai container (60x24px) warna oranye dengan pulse.
              Ke depannya: koordinat berasal dari GPS points nyata yard. */}
          {esp32Position && (
            <Esp32Marker
              canvasX={esp32Position.canvasX}
              canvasY={esp32Position.canvasY}
              deviceId={esp32Position.deviceId}
              isLive={esp32Position.isLive}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default YardCanvas;
