import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, AlertTriangle, AlertCircle, Shield, Users, Activity } from 'lucide-react';
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

const touristIcon = L.divIcon({
  html: `<div style="background-color: #3b82f6; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  </div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const highRiskTouristIcon = L.divIcon({
  html: `<div style="background-color: #ef4444; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(239,68,68,0.6); animation: pulse 2s infinite;">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  </div>
  <style>@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }</style>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const newAlertIcon = L.divIcon({
  html: `<div style="background-color: #f59e0b; color: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 0 20px rgba(245,158,11,0.8); animation: alertPulse 1s infinite;">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  </div>
  <style>@keyframes alertPulse { 0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(245,158,11,0.8); } 50% { transform: scale(1.2); box-shadow: 0 0 30px rgba(245,158,11,1); } }</style>`,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const alertIcon = createCustomIcon('#ef4444', '<path d="m21 16-4 4-4-4"/><path d="M21 4L12 13"/><path d="M9 4h12v12"/>');
const sosIcon = createCustomIcon('#dc2626', '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>');

// Enhanced Circle-based Heatmap Component with better visibility
const HeatmapCircles = ({ points, intensityKey = 'intensity' }) => {
  if (!points || points.length === 0) {
    return null;
  }

  return (
    <>
      {points.map((point, index) => {
        const lat = point.lat || point.latitude;
        const lng = point.lng || point.lon || point.longitude;
        if (!lat || !lng) {
          return null;
        }

        // Normalize intensity to 0-1 range
        let intensity = point[intensityKey] !== undefined ? point[intensityKey] : 0.5;
        
        // If intensity is a safety score (0-100), convert to 0-1 scale
        if (intensity > 1) {
          intensity = 1 - (intensity / 100); // Invert: low score = high risk = high intensity
        }
        
        // Enhanced color gradient with more vibrant colors
        const getColor = (i) => {
          if (i >= 0.8) return '#dc2626'; // Bright red (Critical)
          if (i >= 0.6) return '#ea580c'; // Orange-red (High)
          if (i >= 0.4) return '#f59e0b'; // Orange (Medium)
          if (i >= 0.2) return '#fbbf24'; // Yellow (Low)
          return '#10b981'; // Green (Safe)
        };
        
        // Dynamic radius based on intensity
        const getRadius = (i) => {
          return 300 + (i * 500); // Range: 300m - 800m
        };

        const color = getColor(intensity);
        const radius = getRadius(intensity);

        return (
          <React.Fragment key={`heatpoint-${index}`}>
            {/* Outer glow circle for high-intensity areas */}
            {intensity > 0.6 && (
              <Circle
                center={[lat, lng]}
                radius={radius * 1.5}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.1,
                  color: color,
                  opacity: 0.2,
                  weight: 0
                }}
              />
            )}
            
            {/* Main heat circle */}
            <Circle
              center={[lat, lng]}
              radius={radius}
              pathOptions={{
                fillColor: color,
                fillOpacity: 0.4 + (intensity * 0.3), // 0.4 to 0.7 opacity
                color: color,
                opacity: 0.8,
                weight: intensity > 0.5 ? 3 : 2,
                className: intensity > 0.7 ? 'pulse-border' : ''
              }}
            />
            
            {/* Core circle for high intensity */}
            {intensity > 0.5 && (
              <Circle
                center={[lat, lng]}
                radius={radius * 0.3}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.8,
                  color: '#ffffff',
                  opacity: 1,
                  weight: 2
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

// Heatmap Legend Component
const HeatmapLegend = () => {
  return (
    <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 z-[1000] border border-gray-200 dark:border-gray-700">
      <div className="text-xs font-semibold mb-2 flex items-center gap-2">
        <Activity className="w-3 h-3" />
        Risk Heatmap
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#dc2626] border-2 border-white shadow-sm"></div>
          <span className="text-[10px] text-gray-700 dark:text-gray-300">Critical Risk (80-100%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#ea580c] border-2 border-white shadow-sm"></div>
          <span className="text-[10px] text-gray-700 dark:text-gray-300">High Risk (60-80%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#f59e0b] border-2 border-white shadow-sm"></div>
          <span className="text-[10px] text-gray-700 dark:text-gray-300">Medium Risk (40-60%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#fbbf24] border-2 border-white shadow-sm"></div>
          <span className="text-[10px] text-gray-700 dark:text-gray-300">Low Risk (20-40%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#10b981] border-2 border-white shadow-sm"></div>
          <span className="text-[10px] text-gray-700 dark:text-gray-300">Safe (0-20%)</span>
        </div>
      </div>
      <div className="text-[9px] text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
        Larger circles = Higher risk concentration
      </div>
    </div>
  );
};

// Component for drawing polygons
const PolygonDrawer = ({ onPolygonComplete, isActive }) => {
  const [positions, setPositions] = useState([]);
  useMapEvents({
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
  center = [20.5937, 78.9629], // Default to center of India (geographic center)
  zoom = 5, // Zoom level to show full India map
  tourists = [],
  alerts = [],
  zones = [],
  heatmapData = null, // New prop for heatmap data
  showHeatmap = false, // Toggle heatmap visibility
  heatmapIntensityKey = 'intensity', // Key for intensity value
  onTouristClick,
  onAlertClick,
  onZoneClick,
  showZoneDrawer = false,
  onPolygonComplete,
  height = '400px',
  className = ''
}) => {
  const mapRef = useRef();
  const [temporaryAlerts, setTemporaryAlerts] = useState([]);

  // Manage temporary alerts with 2-minute auto-dismiss
  useEffect(() => {
    if (!alerts || alerts.length === 0) return;
    
    const newAlerts = alerts.filter(alert => {
      // Check if alert is new (within last 2 minutes)
      const alertTime = new Date(alert.timestamp || alert.created_at);
      const now = new Date();
      const diffMinutes = (now - alertTime) / (1000 * 60);
      return diffMinutes <= 2 && alert.coordinates?.lat && alert.coordinates?.lon;
    }).map(alert => ({
      ...alert,
      addedAt: Date.now()
    }));
    
    setTemporaryAlerts(newAlerts);
    
    // Auto-remove after 2 minutes
    const timer = setInterval(() => {
      setTemporaryAlerts(prev => 
        prev.filter(alert => (Date.now() - alert.addedAt) < 120000) // 2 minutes
      );
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(timer);
  }, [alerts]);

  // Ensure arrays are valid to prevent crashes
  // Enhanced location field checking - prioritize last_location (as per API docs)
  const safeTourists = Array.isArray(tourists) ? tourists
    .map(t => {
      if (!t) return null;
      
      // Check for various location field structures (API returns last_location)
      let location = null;
      
      if (t.last_location?.lat && t.last_location?.lon) {
        location = { lat: t.last_location.lat, lon: t.last_location.lon, address: t.last_location.address };
      } else if (t.current_location?.lat && t.current_location?.lon) {
        location = { lat: t.current_location.lat, lon: t.current_location.lon, address: t.current_location.address };
      } else if (t.location?.lat && t.location?.lon) {
        location = { lat: t.location.lat, lon: t.location.lon, address: t.location.address };
      } else if (t.location?.latitude && t.location?.longitude) {
        location = { lat: t.location.latitude, lon: t.location.longitude, address: t.location.address };
      } else if (t.lat && t.lon) {
        location = { lat: t.lat, lon: t.lon, address: t.address };
      } else if (t.latitude && t.longitude) {
        location = { lat: t.latitude, lon: t.longitude, address: t.address };
      }
      
      if (!location) return null;
      
      return {
        ...t,
        current_location: location // Normalize to expected structure
      };
    })
    .filter(t => t !== null) : [];
  
  // Separate high-risk tourists (safety_score < 50)
  const highRiskTourists = safeTourists.filter(t => (t.safety_score || 100) < 50);
  
  const safeAlerts = Array.isArray(alerts) ? alerts.filter(a => a && a.coordinates && a.coordinates.lat && a.coordinates.lon) : [];
  
  // Process zones - handle both polygon and circle-based zones
  const processedZones = Array.isArray(zones) ? zones.map(z => {
    if (!z) return null;
    
    // Check if it's a polygon-based zone (has coordinates array)
    if (z.coordinates && Array.isArray(z.coordinates) && z.coordinates.length >= 3) {
      return {
        ...z,
        type: 'polygon',
        zone_type: z.zone_type || z.type || 'safe',
        coordinates: z.coordinates.map(coord => {
          // Convert GeoJSON format [lon, lat] to Leaflet format [lat, lon]
          if (Array.isArray(coord)) {
            return [coord[1], coord[0]]; // Swap lon, lat to lat, lon
          } else if (coord.lat !== undefined && coord.lon !== undefined) {
            return [coord.lat, coord.lon];
          } else if (coord.latitude !== undefined && coord.longitude !== undefined) {
            return [coord.latitude, coord.longitude];
          }
          return coord;
        })
      };
    }
    
    // Check if it's a circle-based zone (has center and radius)
    if (z.center && z.center.lat && z.center.lon && z.radius_meters) {
      return {
        ...z,
        type: 'circle',
        zone_type: z.zone_type || z.type || 'safe',
        center: [z.center.lat, z.center.lon],
        radius: z.radius_meters
      };
    }
    
    return null;
  }).filter(z => z !== null) : [];
  
  const polygonZones = processedZones.filter(z => z.type === 'polygon');
  const circleZones = processedZones.filter(z => z.type === 'circle');

  const getZoneColor = (zoneType) => {
    switch (zoneType) {
      case 'restricted': return '#ef4444';
      case 'risky': return '#f59e0b';
      case 'safe': return '#10b981';
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

        {/* Heatmap Layer (Circle-based) */}
        {showHeatmap && heatmapData && (
          <>
            <HeatmapCircles 
              points={heatmapData} 
              intensityKey={heatmapIntensityKey}
            />
            <HeatmapLegend />
          </>
        )}
        
        {/* Heatmap Info Message when enabled */}
        {showHeatmap && (!heatmapData || heatmapData.length === 0) && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-lg shadow-lg z-[1000] text-sm">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span>Heatmap enabled but no risk data available</span>
            </div>
          </div>
        )}

        {/* Zone Drawing Component */}
        {showZoneDrawer && (
          <PolygonDrawer 
            onPolygonComplete={onPolygonComplete}
            isActive={showZoneDrawer}
          />
        )}

        {/* Render Polygon Zones */}
        {polygonZones.map((zone) => (
          <Polygon
            key={`polygon-${zone.id}`}
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
                <p className="text-sm text-gray-600 dark:text-gray-300">{zone.description || 'No description'}</p>
              </div>
            </Popup>
          </Polygon>
        ))}

        {/* Render Circle Zones */}
        {circleZones.map((zone) => (
          <Circle
            key={`circle-${zone.id}`}
            center={zone.center}
            radius={zone.radius}
            pathOptions={{
              color: getZoneColor(zone.zone_type),
              fillColor: getZoneColor(zone.zone_type),
              fillOpacity: 0.3,
              weight: 2
            }}
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
                <p className="text-sm text-gray-600 dark:text-gray-300">{zone.description || 'No description'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Radius: {zone.radius}m {zone.is_active ? '• Active' : ''}
                </p>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Render High-Risk Tourist Markers (Safety Score < 50) */}
        {highRiskTourists.map((tourist) => (
          <Marker
            key={`highrisk-${tourist.id}`}
            position={[tourist.current_location.lat, tourist.current_location.lon]}
            icon={highRiskTouristIcon}
            eventHandlers={{
              click: () => onTouristClick && onTouristClick(tourist),
            }}
            zIndexOffset={1000} // Render above other markers
          >
            <Popup>
              <div className="p-2">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="font-semibold text-red-600">{tourist.name}</span>
                  <Badge variant="destructive">
                    🚨 High Risk: {tourist.safety_score}%
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{tourist.current_location.address || 'Location not available'}</p>
                <p className="text-xs text-gray-500">Last seen: {new Date(tourist.last_seen).toLocaleTimeString()}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render Regular Tourist Markers (hidden if using heatmap) */}
        {!showHeatmap && safeTourists.filter(t => (t.safety_score || 100) >= 50).map((tourist) => (
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
        {safeAlerts.map((alert) => (
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
                  <span className="font-semibold">{alert.type}</span>
                  <Badge variant={alert.severity === 'high' ? 'destructive' : 'warning'}>
                    {alert.severity}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{alert.description}</p>
                <p className="text-xs text-gray-500">{new Date(alert.timestamp).toLocaleString()}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render Temporary Alert Markers (New alerts within 2 minutes) */}
        {temporaryAlerts.map((alert) => (
          <Marker
            key={`temp-alert-${alert.id}-${alert.addedAt}`}
            position={[alert.coordinates.lat, alert.coordinates.lon]}
            icon={newAlertIcon}
            eventHandlers={{
              click: () => onAlertClick && onAlertClick(alert),
            }}
            zIndexOffset={2000} // Render above all other markers
          >
            <Popup>
              <div className="p-2">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <span className="font-semibold text-orange-600">🆕 NEW ALERT</span>
                  <Badge variant={alert.severity === 'critical' ? 'destructive' : alert.severity === 'high' ? 'warning' : 'secondary'}>
                    {alert.severity?.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm font-medium">{alert.type || 'Alert'}</p>
                <p className="text-xs text-gray-600">{alert.description}</p>
                <p className="text-xs text-gray-500">Tourist: {alert.tourist_name}</p>
                <p className="text-xs text-gray-400">{new Date(alert.timestamp || alert.created_at).toLocaleString()}</p>
                <p className="text-xs text-orange-600 mt-1 font-medium">⏱️ Auto-dismiss in {Math.max(0, Math.ceil((120000 - (Date.now() - alert.addedAt)) / 60000))} min</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;