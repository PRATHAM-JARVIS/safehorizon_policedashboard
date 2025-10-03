import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table.jsx';
import Map from '../components/ui/Map.jsx';
import { touristAPI } from '../api/services.js';
import { formatDateTime, formatTimeAgo, getSafetyScoreColor, getSafetyScoreLabel } from '../utils/helpers.js';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  AlertTriangle,
  Shield,
  Navigation,
  Activity
} from 'lucide-react';

const TouristDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [tourist, setTourist] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [recentLocations, setRecentLocations] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('Invalid tourist ID');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const fetchProfile = async () => {
          try {
            const response = await touristAPI.getTouristProfile(id);
            return response.tourist || response;
          } catch {
            try {
              const fallback = await touristAPI.trackTourist(id);
              return fallback.tourist || fallback;
            } catch (fallbackError) {
              console.error('Both profile endpoints failed:', fallbackError.message);
              return null;
            }
          }
        };

        const fetchCurrentLocation = async () => {
          try {
            const response = await touristAPI.getCurrentLocation(id);
            return response.location || response;
          } catch {
            return null;
          }
        };

        const fetchLocationHistory = async () => {
          try {
            const response = await touristAPI.getLocationHistoryForTourist(id, { 
              limit: 50, 
              hours_back: 24 
            });
            return response.locations || [];
          } catch {
            return [];
          }
        };

        const fetchAlerts = async () => {
          try {
            const response = await touristAPI.getTouristAlerts(id);
            return Array.isArray(response) ? response : [];
          } catch {
            return [];
          }
        };

        const [profileData, locationData, locationsData, alertsData] = await Promise.allSettled([
          fetchProfile(),
          fetchCurrentLocation(),
          fetchLocationHistory(),
          fetchAlerts()
        ]);

        // Process results
        const profile = profileData.status === 'fulfilled' ? profileData.value : null;
        const location = locationData.status === 'fulfilled' ? locationData.value : null;
        const locations = locationsData.status === 'fulfilled' ? locationsData.value : [];
        const alerts = alertsData.status === 'fulfilled' ? alertsData.value : [];

        if (!profile) {
          throw new Error('Unable to load tourist profile. Tourist may not exist.');
        }

        setTourist(profile);
        setCurrentLocation(location);
        setRecentLocations(Array.isArray(locations) ? locations : []);
        setAlerts(Array.isArray(alerts) ? alerts : []);
        setError(null);

      } catch (err) {
        console.error('Failed to load tourist data:', err);
        setError(err.message || 'Failed to load tourist data. Please check if the tourist ID is valid.');
        setTourist(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading tourist data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/tourists')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tourists
        </Button>
        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertTriangle className="w-6 h-6" />
              <div>
                <h3 className="font-semibold">Failed to load tourist data</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tourist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/tourists')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tourists
        </Button>
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Tourist not found
          </CardContent>
        </Card>
      </div>
    );
  }

  const safetyScore = tourist.safety_score || tourist.safetyScore || 0;
  const safetyColor = getSafetyScoreColor(safetyScore);
  const safetyLabel = getSafetyScoreLabel(safetyScore);

  // Enhanced location detection - check multiple possible sources
  const getLocationData = () => {
    // Priority 1: currentLocation state
    if (currentLocation?.latitude && currentLocation?.longitude) {
      return {
        lat: currentLocation.latitude,
        lon: currentLocation.longitude,
        address: currentLocation.address
      };
    }
    
    // Priority 2: tourist.current_location
    if (tourist.current_location?.lat && tourist.current_location?.lon) {
      return {
        lat: tourist.current_location.lat,
        lon: tourist.current_location.lon,
        address: tourist.current_location.address
      };
    }
    
    // Priority 3: tourist.last_location
    if (tourist.last_location?.lat && tourist.last_location?.lon) {
      return {
        lat: tourist.last_location.lat,
        lon: tourist.last_location.lon,
        address: tourist.last_location.address
      };
    }
    
    // Priority 4: tourist.location
    if (tourist.location?.lat && tourist.location?.lon) {
      return {
        lat: tourist.location.lat,
        lon: tourist.location.lon,
        address: tourist.location.address
      };
    }
    
    // Priority 5: Direct lat/lon on tourist
    if (tourist.latitude && tourist.longitude) {
      return {
        lat: tourist.latitude,
        lon: tourist.longitude,
        address: tourist.address
      };
    }
    
    // Priority 6: Check recent locations array
    if (recentLocations.length > 0 && recentLocations[0]?.latitude && recentLocations[0]?.longitude) {
      return {
        lat: recentLocations[0].latitude,
        lon: recentLocations[0].longitude,
        address: recentLocations[0].address
      };
    }
    
    return null;
  };
  
  const locationData = getLocationData();

  const mapLocations = [];
  if (currentLocation?.latitude && currentLocation?.longitude) {
    mapLocations.push({
      lat: currentLocation.latitude,
      lng: currentLocation.longitude,
      label: 'Current Location',
      isCurrent: true
    });
  }
  
  recentLocations.forEach((loc) => {
    if (loc.latitude && loc.longitude) {
      mapLocations.push({
        lat: loc.latitude,
        lng: loc.longitude,
        label: `${formatTimeAgo(loc.timestamp || loc.created_at)}`,
        isCurrent: false
      });
    }
  });

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/tourists')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{tourist.name || 'Unknown Tourist'}</h1>
            <p className="text-sm text-muted-foreground">Tourist ID: {tourist.id || id}</p>
          </div>
        </div>
        <Badge className={`${safetyColor} px-4 py-2 text-sm`}>
          <Shield className="w-4 h-4 mr-1" />
          {safetyLabel}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Tourist Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="font-medium">{tourist.name || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Mail className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium text-sm break-all">{tourist.email || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Phone className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium">{tourist.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Shield className="w-5 h-5 text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Safety Score</p>
                <p className="font-medium text-lg">{safetyScore}/100</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Last Seen</p>
                <p className="font-medium text-sm">
                  {tourist.last_location_time || tourist.lastLocationTime 
                    ? formatTimeAgo(tourist.last_location_time || tourist.lastLocationTime)
                    : 'N/A'
                  }
                </p>
              </div>
            </div>

            {locationData && (
              <div className="pt-4 border-t">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <MapPin className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Current Location</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {locationData.lat?.toFixed(6)}, {locationData.lon?.toFixed(6)}
                    </p>
                    {locationData.address && (
                      <p className="text-xs text-muted-foreground mt-1">{locationData.address}</p>
                    )}
                    {currentLocation?.zone_type && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {currentLocation.zone_type}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Navigation className="w-5 h-5" />
                Live Location Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {locationData ? (
                <>
                  <Map 
                    center={[locationData.lat, locationData.lon]}
                    zoom={15}
                    tourists={[{
                      id: tourist.id,
                      name: tourist.name,
                      last_location: {
                        lat: locationData.lat,
                        lon: locationData.lon,
                        address: locationData.address || 'Current Location'
                      },
                      current_location: {
                        lat: locationData.lat,
                        lon: locationData.lon,
                        address: locationData.address || 'Current Location'
                      },
                      safety_score: safetyScore,
                      last_seen: currentLocation?.timestamp || tourist.last_seen || new Date().toISOString()
                    }]}
                    alerts={alerts.filter(a => a.coordinates || (a.latitude && a.longitude)).map(a => ({
                      ...a,
                      coordinates: {
                        lat: a.latitude || a.coordinates?.lat || a.coordinates?.latitude,
                        lon: a.longitude || a.coordinates?.lon || a.coordinates?.longitude
                      }
                    }))}
                    height="400px"
                    showHeatmap={false}
                  />
                </>
              ) : (
                <div className="h-[400px] flex items-center justify-center bg-muted/30">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="font-medium">No location data available</p>
                    <p className="text-sm">Waiting for GPS coordinates...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{recentLocations.length}</p>
                    <p className="text-xs text-muted-foreground">Locations (24h)</p>
                  </div>
                  <MapPin className="w-8 h-8 text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{alerts.length}</p>
                    <p className="text-xs text-muted-foreground">Total Alerts</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-orange-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{safetyScore}</p>
                    <p className="text-xs text-muted-foreground">Safety Score</p>
                  </div>
                  <Shield className="w-8 h-8 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Recent Locations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentLocations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Coordinates</TableHead>
                      <TableHead>Accuracy</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentLocations.map((loc, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-xs">
                          {formatDateTime(loc.timestamp || loc.created_at)}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {loc.latitude?.toFixed(4)}, {loc.longitude?.toFixed(4)}
                        </TableCell>
                        <TableCell className="text-xs">
                          {loc.accuracy ? `±${loc.accuracy}m` : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>No recent location history</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Alert History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {alerts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alerts.slice(0, 10).map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {alert.type || alert.alert_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={`text-xs ${
                              alert.severity === 'critical' || alert.severity === 'high'
                                ? 'bg-red-500'
                                : alert.severity === 'medium'
                                ? 'bg-orange-500'
                                : 'bg-yellow-500'
                            }`}
                          >
                            {alert.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {alert.description || alert.message || 'No description'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatTimeAgo(alert.created_at || alert.timestamp)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Shield className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>No alerts recorded</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TouristDetail;
