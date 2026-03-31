import React, { useState, memo } from 'react';
import { Group, Rect, Text } from 'react-konva';
import type { GroupedContainer } from '../../types/container';

interface ContainerMarkerProps {
  groupedContainer: GroupedContainer;
  onClick: () => void;
  isHighlighted?: boolean;
}

const ContainerMarker: React.FC<ContainerMarkerProps> = memo(({ 
  groupedContainer, 
  onClick,
  isHighlighted = false 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getColor = (stackCount: number): string => {
    if (stackCount === 0) return '#9e9e9e';
    if (stackCount === 1) return '#aed581';
    if (stackCount === 2) return '#66bb6a';
    if (stackCount === 3) return '#26a69a';
    return '#42a5f5';
  };
  
  const containerWidth = 60;
  const containerHeight = 24;
  
  const containerColor = getColor(groupedContainer.totalStacks);
  const active = isHighlighted || isHovered;
  
  return (
    <Group
      x={groupedContainer.canvasX}
      y={groupedContainer.canvasY}
      rotation={groupedContainer.rotation}
      onClick={onClick}
      onTap={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Simple 3D effect - single shadow */}
      {groupedContainer.totalStacks > 1 && (
        <Rect
          x={-containerWidth / 2 + 2}
          y={-containerHeight / 2 + 2}
          width={containerWidth}
          height={containerHeight}
          fill="rgba(0,0,0,0.2)"
          cornerRadius={2}
          listening={false}
        />
      )}
      
      {/* Main container body - NO expensive shadows */}
      <Rect
        x={-containerWidth / 2}
        y={-containerHeight / 2}
        width={containerWidth}
        height={containerHeight}
        fill={containerColor}
        stroke={active ? '#667eea' : '#333'}
        strokeWidth={active ? 2.5 : 1}
        cornerRadius={2}
      />
      
      {/* Stack count badge - simplified */}
      {groupedContainer.totalStacks > 1 && (
        <Group x={containerWidth / 2 - 6} y={-containerHeight / 2 - 6}>
          <Rect
            x={-10}
            y={-10}
            width={20}
            height={20}
            fill="#1a4d2e"
            cornerRadius={10}
            stroke="white"
            strokeWidth={1.5}
            listening={false}
          />
          <Text
            text={groupedContainer.totalStacks.toString()}
            fontSize={12}
            fontStyle="bold"
            fill="white"
            align="center"
            verticalAlign="middle"
            width={20}
            height={20}
            x={-10}
            y={-10}
            listening={false}
          />
        </Group>
      )}
    </Group>
  );
});

ContainerMarker.displayName = 'ContainerMarker';

export default ContainerMarker;
