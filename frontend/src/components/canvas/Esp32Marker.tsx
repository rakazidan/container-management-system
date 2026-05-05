import React, { useEffect, useRef, memo } from 'react';
import { Group, Rect, Text, Circle } from 'react-konva';
import Konva from 'konva';

interface Esp32MarkerProps {
  canvasX: number;
  canvasY: number;
  deviceId?: string;
  isLive?: boolean;
}

/**
 * Marker untuk ESP32 device di atas canvas yard.
 * Berbentuk seperti container (60x24px) dengan warna oranye
 * dan animasi pulse untuk menunjukkan posisi real-time.
 * 
 * Ke depannya: posisi ini merepresentasikan container/forklift
 * yang sedang bergerak di dalam yard, berdasarkan GPS points nyata.
 */
const Esp32Marker: React.FC<Esp32MarkerProps> = memo(({
  canvasX,
  canvasY,
  deviceId = 'esp32-01',
  isLive = true,
}) => {
  const pulseRef = useRef<Konva.Circle>(null);
  const animRef = useRef<Konva.Animation | null>(null);

  // Pulse animation ring
  useEffect(() => {
    if (!pulseRef.current || !isLive) return;

    const anim = new Konva.Animation((frame) => {
      if (!frame || !pulseRef.current) return;
      const t = (frame.time % 1800) / 1800; // 0 → 1 setiap 1.8 detik
      const scale = 1 + t * 1.8;
      const opacity = 1 - t;
      pulseRef.current.scaleX(scale);
      pulseRef.current.scaleY(scale);
      pulseRef.current.opacity(opacity);
    }, pulseRef.current.getLayer());

    anim.start();
    animRef.current = anim;

    return () => {
      anim.stop();
    };
  }, [isLive]);

  const W = 60;
  const H = 24;

  // Warna oranye untuk membedakan dari container biasa
  const bodyColor = isLive ? '#f97316' : '#6b7280';
  const strokeColor = isLive ? '#fb923c' : '#4b5563';
  const glowColor = isLive ? '#f97316' : 'transparent';

  return (
    <Group x={canvasX} y={canvasY}>
      {/* Pulse ring — animasi expand & fade */}
      {isLive && (
        <Circle
          ref={pulseRef}
          x={0}
          y={0}
          radius={22}
          fill="transparent"
          stroke={glowColor}
          strokeWidth={2}
          opacity={0.8}
          listening={false}
        />
      )}

      {/* Shadow bawah (efek 3D ringan) */}
      <Rect
        x={-W / 2 + 3}
        y={-H / 2 + 3}
        width={W}
        height={H}
        fill="rgba(249,115,22,0.25)"
        cornerRadius={3}
        listening={false}
      />

      {/* Body container — bentuk persegi panjang seperti ContainerMarker */}
      <Rect
        x={-W / 2}
        y={-H / 2}
        width={W}
        height={H}
        fill={bodyColor}
        stroke={strokeColor}
        strokeWidth={2}
        cornerRadius={3}
      />

      {/* Garis vertikal tengah (ciri visual kontainer) */}
      <Rect
        x={-1}
        y={-H / 2 + 3}
        width={2}
        height={H - 6}
        fill="rgba(255,255,255,0.3)"
        cornerRadius={1}
        listening={false}
      />

      {/* Label device ID */}
      <Text
        text={deviceId.toUpperCase()}
        x={-W / 2}
        y={-H / 2}
        width={W}
        height={H}
        fontSize={9}
        fontStyle="bold"
        fill="white"
        align="center"
        verticalAlign="middle"
        listening={false}
      />

      {/* Live dot badge (pojok kanan atas) */}
      {isLive && (
        <Group x={W / 2 - 5} y={-H / 2 - 5}>
          <Circle
            radius={5}
            fill="#22c55e"
            stroke="white"
            strokeWidth={1.5}
            listening={false}
          />
        </Group>
      )}
    </Group>
  );
});

Esp32Marker.displayName = 'Esp32Marker';

export default Esp32Marker;
