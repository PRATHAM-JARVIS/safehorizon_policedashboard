import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, AlertTriangle, Shield, Users } from 'lucide-react';
import { Badge } from './badge.jsx';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different marker types
const createCustomIcon = (color, icon) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          ${icon}
        </svg>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const touristIcon = createCustomIcon('#3b82f6', '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>');
const alertIcon = createCustomIcon('#ef4444', '<path d="m21 16-4 4-4-4"/><path d="M21 4L12 13"/><path d="M9 4h12v12"/>');
const sosIcon = createCustomIcon('#dc2626', '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>');

// Component for drawing polygons
const PolygonDrawer = ({ onPolygonComplete, isActive }) => {
  const [positions, setPositions] = useState([]);
  const map = useMapEvents({
    click(e) {
      if (isActive) {
        const newPosition = [e.latlng.lat, e.latlng.lng];
        setPositions(prev => [...prev, newPosition]);
      }
    },
  });

  useEffect(() => {
    if (positions.length >= 3 && onPolygonComplete) {
      onPolygonComplete(positions);
      setPositions([]);
    }
  }, [positions, onPolygonComplete]);

  return positions.length >= 3 ? (
    <Polygon positions={positions} color="blue" />
  ) : null;
};

// Main Map Component
export const MapComponent = ({ 
  center = [35.6762, 139.6503], // Default to Tokyo
  zoom = 12,
  tourists = [],
  alerts = [],
  zones = [],
  onTouristClick,
  onAlertClick,
  onZoneClick,
  showZoneDrawer = false,
  onPolygonComplete,
  height = '400px',
  className = ''
}) => {
  const mapRef = useRef();

  const getZoneColor = (zoneType) => {
    switch (zoneType) {
      case 'restricted': return '#ef4444';
      case 'risky': return '#f59e0b';
      case 'safe': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getAlertSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Zone Drawing Component */}
        {showZoneDrawer && (
          <PolygonDrawer 
            onPolygonComplete={onPolygonComplete}
            isActive={showZoneDrawer}
          />
        )}

        {/* Render Zones */}
        {zones.map((zone) => (
          <Polygon
            key={zone.id}
            positions={zone.coordinates}
            color={getZoneColor(zone.zone_type)}
            fillColor={getZoneColor(zone.zone_type)}
            fillOpacity={0.3}
            eventHandlers={{
              click: () => onZoneClick && onZoneClick(zone),
            }}
          >
            <Popup>
              <div className="p-2">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-4 h-4" />
                  <span className="font-semibold">{zone.name}</span>
                  <Badge variant={zone.zone_type === 'restricted' ? 'destructive' : zone.zone_type === 'risky' ? 'warning' : 'success'}>
                    {zone.zone_type}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{zone.description}</p>
              </div>
            </Popup>
          </Polygon>
        ))}

        {/* Render Tourist Markers */}
        {tourists.map((tourist) => (
          <Marker
            key={tourist.id}
            position={[tourist.current_location.lat, tourist.current_location.lon]}
            icon={touristIcon}
            eventHandlers={{
              click: () => onTouristClick && onTouristClick(tourist),
            }}
          >
            <Popup>
              <div className="p-2">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-4 h-4" />
                  <span className="font-semibold">{tourist.name}</span>
                  <Badge variant={tourist.safety_score >= 80 ? 'success' : tourist.safety_score >= 50 ? 'warning' : 'destructive'}>
                    Safety: {tourist.safety_score}%
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{tourist.current_location.address}</p>
                <p className="text-xs text-gray-500">Last seen: {new Date(tourist.last_seen).toLocaleTimeString()}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render Alert Markers */}
        {alerts.map((alert) => (
          <Marker
            key={alert.id}
            position={[alert.coordinates.lat, alert.coordinates.lon]}
            icon={alert.type === 'sos' ? sosIcon : alertIcon}
            eventHandlers={{
              click: () => onAlertClick && onAlertClick(alert),
            }}
          >
            <Popup>
              <div className="p-2">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-semibold">{alert.title}</span>
                  <Badge variant={alert.severity === 'critical' ? 'critical' : alert.severity === 'high' ? 'destructive' : 'warning'}>
                    {alert.severity}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{alert.description}</p>
                <p className="text-xs text-gray-500">Tourist: {alert.tourist_name}</p>
                <p className="text-xs text-gray-500">{new Date(alert.created_at).toLocaleString()}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;