import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getGpsLatest, getGpsHistory } from '../services/api';
import './GpsTracking.css';

// Fix Leaflet default icon path (Vite issue)
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerIcon2xUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIcon2xUrl,
  shadowUrl: markerShadowUrl,
});

interface GpsRecord {
  id: number;
  device_id: string;
  lat: number;
  lng: number;
  recorded_at: string;
}

const POLL_INTERVAL_MS = 3000; // poll setiap 3 detik (sync dengan ESP32)
const HISTORY_LIMIT = 50;

const GpsTracking: React.FC = () => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const historyMarkersRef = useRef<L.CircleMarker[]>([]);

  const [latest, setLatest] = useState<GpsRecord | null>(null);
  const [history, setHistory] = useState<GpsRecord[]>([]);
  const [deviceId, setDeviceId] = useState('esp32-01');
  const [status, setStatus] = useState<'connecting' | 'live' | 'offline'>('connecting');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [showHistory, setShowHistory] = useState(true);
  const [autoCenter, setAutoCenter] = useState(true);
  const [error, setError] = useState('');
  const [historyList, setHistoryList] = useState<GpsRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [-6.2, 106.8],
      zoom: 15,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // OpenStreetMap tile (gratis, no API key)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Satellite tile option (esri, gratis)
    const satellite = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: '© Esri', maxZoom: 19 }
    );

    const baseMaps = {
      '🗺️ Street': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }),
      '🛰️ Satellite': satellite,
    };
    L.control.layers(baseMaps, {}, { position: 'topright' }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update map dengan data GPS
  const updateMap = useCallback((record: GpsRecord, historyData: GpsRecord[]) => {
    const map = mapRef.current;
    if (!map) return;
    const latlng: L.LatLngExpression = [record.lat, record.lng];

    // ── Main marker (current position) ──
    if (!markerRef.current) {
      // Custom pulsing icon
      const pulseIcon = L.divIcon({
        className: '',
        html: `<div class="gps-pulse-wrapper">
          <div class="gps-pulse-ring"></div>
          <div class="gps-pulse-dot"></div>
        </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });
      markerRef.current = L.marker(latlng, { icon: pulseIcon })
        .addTo(map)
        .bindPopup(`<b>${record.device_id}</b><br/>Lat: ${record.lat}<br/>Lng: ${record.lng}`);
    } else {
      markerRef.current.setLatLng(latlng);
      markerRef.current.setPopupContent(
        `<b>${record.device_id}</b><br/>Lat: ${record.lat}<br/>Lng: ${record.lng}<br/>${record.recorded_at}`
      );
    }

    // ── Accuracy circle ──
    if (!circleRef.current) {
      circleRef.current = L.circle(latlng, {
        radius: 10,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.15,
        weight: 1,
      }).addTo(map);
    } else {
      circleRef.current.setLatLng(latlng);
    }

    // ── History trail polyline ──
    if (historyData.length > 1) {
      const latlngs: L.LatLngExpression[] = historyData.map(r => [r.lat, r.lng]);

      if (!polylineRef.current) {
        polylineRef.current = L.polyline(latlngs, {
          color: '#6366f1',
          weight: 2.5,
          opacity: 0.7,
          dashArray: '6 4',
        }).addTo(map);
      } else {
        polylineRef.current.setLatLngs(latlngs);
      }

      // Show/hide trail
      if (showHistory) {
        polylineRef.current.addTo(map);
      } else {
        polylineRef.current.removeFrom(map);
      }

      // ── History dots ──
      historyMarkersRef.current.forEach(m => m.removeFrom(map));
      historyMarkersRef.current = [];

      if (showHistory) {
        historyData.slice(1).forEach((r, idx) => {
          const opacity = 0.2 + (idx / historyData.length) * 0.5;
          const dot = L.circleMarker([r.lat, r.lng], {
            radius: 4,
            color: '#6366f1',
            fillColor: '#818cf8',
            fillOpacity: opacity,
            weight: 1,
          })
            .bindPopup(`<small>${r.recorded_at}</small><br/>Lat: ${r.lat}<br/>Lng: ${r.lng}`)
            .addTo(map);
          historyMarkersRef.current.push(dot);
        });
      }
    }

    // Auto center
    if (autoCenter) {
      map.setView(latlng, map.getZoom());
    }
  }, [showHistory, autoCenter]);

  // Polling
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    let mounted = true;

    const fetchData = async () => {
      try {
        const [latestRes, histRes] = await Promise.all([
          getGpsLatest(deviceId) as Promise<any>,
          getGpsHistory(deviceId, HISTORY_LIMIT) as Promise<any>,
        ]);

        if (!mounted) return;

        if (latestRes.status === 'success' && latestRes.data) {
          setLatest(latestRes.data);
          setStatus('live');
          setLastUpdate(new Date());
          setError('');

          const histData: GpsRecord[] = histRes.data || [];
          setHistory(histData);
          setHistoryList(histData);
          updateMap(latestRes.data, histData);
        } else {
          setStatus('offline');
          setError('No GPS data from ESP32 yet');
        }
      } catch (e: any) {
        if (!mounted) return;
        setStatus('offline');
        setError(e.message || 'Failed to connect to backend');
      }
    };

    fetchData();
    timer = setInterval(fetchData, POLL_INTERVAL_MS);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [deviceId, updateMap]);

  const handleFlyTo = () => {
    if (latest && mapRef.current) {
      mapRef.current.flyTo([latest.lat, latest.lng], 17, { animate: true, duration: 1.5 });
    }
  };

  const timeSinceUpdate = lastUpdate
    ? Math.floor((Date.now() - lastUpdate.getTime()) / 1000)
    : null;

  return (
    <div className="gps-page">
      {/* ── Header panel ── */}
      <div className="gps-header">
        <div className="gps-header-left">
          <div className="gps-title-group">
            <span className={`gps-status-dot ${status}`}></span>
            <h1 className="gps-title">Live GPS Tracking</h1>
          </div>
          <p className="gps-subtitle">
            {status === 'live' ? 'Real-time ESP32 position' : status === 'connecting' ? 'Connecting...' : 'Device offline'}
          </p>
        </div>

        <div className="gps-header-controls">
          <div className="device-selector-wrap">
            <label className="ctrl-label">Device</label>
            <select
              id="device-select"
              className="device-select"
              value={deviceId}
              onChange={e => setDeviceId(e.target.value)}
            >
              <option value="esp32-01">esp32-01</option>
              <option value="esp32-02">esp32-02</option>
              <option value="esp32-03">esp32-03</option>
            </select>
          </div>

          <div className="toggle-group">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={showHistory}
                onChange={e => setShowHistory(e.target.checked)}
              />
              <span className="toggle-track"></span>
              <span className="ctrl-label">Trail</span>
            </label>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={autoCenter}
                onChange={e => setAutoCenter(e.target.checked)}
              />
              <span className="toggle-track"></span>
              <span className="ctrl-label">Auto-center</span>
            </label>
          </div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="gps-layout">
        {/* Map */}
        <div className="gps-map-wrapper">
          <div ref={mapContainerRef} id="gps-map" className="gps-map" />

          {/* Fly-to button */}
          {latest && (
            <button className="fly-to-btn" onClick={handleFlyTo} title="Center on device">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v4M12 19v4M1 12h4M19 12h4" />
              </svg>
            </button>
          )}

          {/* Poll indicator */}
          <div className="poll-badge">
            <span className={`poll-dot ${status === 'live' ? 'active' : ''}`}></span>
            {timeSinceUpdate !== null ? `${timeSinceUpdate}s ago` : 'Waiting...'}
          </div>
        </div>

        {/* Sidebar */}
        <div className="gps-sidebar">
          {/* Tabs */}
          <div className="sidebar-tabs">
            <button
              className={`stab ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              📍 Current
            </button>
            <button
              className={`stab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              🕐 History ({history.length})
            </button>
          </div>

          {/* Tab: Info */}
          {activeTab === 'info' && (
            <div className="sidebar-content">
              {error && <div className="gps-error">{error}</div>}

              {latest ? (
                <>
                  <div className="info-card">
                    <div className="info-card-label">Device</div>
                    <div className="info-card-value device-id">{latest.device_id}</div>
                  </div>
                  <div className="info-grid">
                    <div className="info-card">
                      <div className="info-card-label">Latitude</div>
                      <div className="info-card-value coord">{latest.lat.toFixed(6)}°</div>
                    </div>
                    <div className="info-card">
                      <div className="info-card-label">Longitude</div>
                      <div className="info-card-value coord">{latest.lng.toFixed(6)}°</div>
                    </div>
                  </div>
                  <div className="info-card">
                    <div className="info-card-label">Last Recorded</div>
                    <div className="info-card-value timestamp">{latest.recorded_at}</div>
                  </div>
                  <div className="info-card">
                    <div className="info-card-label">Total Waypoints</div>
                    <div className="info-card-value">{history.length}</div>
                  </div>

                  <button className="fly-center-btn" onClick={handleFlyTo}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 1v4M12 19v4M1 12h4M19 12h4" />
                    </svg>
                    Center Map
                  </button>
                </>
              ) : (
                <div className="no-data">
                  <div className="no-data-icon">📡</div>
                  <p>Waiting for ESP32 signal...</p>
                  <small>Make sure ESP32 is powered and has GPS fix</small>
                </div>
              )}
            </div>
          )}

          {/* Tab: History */}
          {activeTab === 'history' && (
            <div className="sidebar-content">
              {historyList.length === 0 ? (
                <div className="no-data">
                  <div className="no-data-icon">🕐</div>
                  <p>No history yet</p>
                </div>
              ) : (
                <div className="history-list">
                  {historyList.map((r, idx) => (
                    <div
                      key={r.id}
                      className={`history-item ${idx === 0 ? 'latest' : ''}`}
                      onClick={() => mapRef.current?.flyTo([r.lat, r.lng], 17)}
                    >
                      <div className="history-idx">#{historyList.length - idx}</div>
                      <div className="history-coords">
                        <span>{r.lat.toFixed(6)}°</span>
                        <span>{r.lng.toFixed(6)}°</span>
                      </div>
                      <div className="history-time">{r.recorded_at.slice(11, 19)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GpsTracking;
