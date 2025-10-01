import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table.jsx';
import { touristAPI } from '../api/services.js';
import { formatDateTime, formatTimeAgo, getSafetyScoreColor, getSafetyScoreLabel } from '../utils/helpers.js';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Activity,
  Clock,
  Route,
  AlertTriangle,
  Shield
} from 'lucide-react';

const TouristDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tourist, setTourist] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locations, setLocations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [safetyTimeline, setSafetyTimeline] = useState([]);
  const [movementAnalysis, setMovementAnalysis] = useState(null);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);
  const [emergencyConfirmed, setEmergencyConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTouristData = async () => {
      try {
        setLoading(true);
        
        // Fetch comprehensive tourist profile (NEW API)
        try {
          const profileResponse = await touristAPI.getTouristProfile(id);
          const profileData = profileResponse.tourist || profileResponse.data || profileResponse;
          console.log('Tourist Profile Data:', profileData);
          setTourist(profileData); // Use profile data directly
        } catch (profileError) {
          console.error('Failed to fetch profile, falling back to tracking:', profileError);
          // Fallback to old tracking API
          const trackingResponse = await touristAPI.trackTourist(id);
          const touristData = trackingResponse.tourist || trackingResponse.data || trackingResponse;
          console.log('Tourist Tracking Data (Fallback):', touristData);
          setTourist(touristData);
        }

        // Fetch current location (NEW API)
        try {
          const locationResponse = await touristAPI.getCurrentLocation(id);
          setCurrentLocation(locationResponse);
        } catch (locError) {
          console.error('Failed to fetch current location:', locError);
          setCurrentLocation(null);
        }
        
        // Fetch location history (NEW API with authority endpoint)
        try {
          const locationHistoryResponse = await touristAPI.getLocationHistoryForTourist(id, { 
            hours_back: 24, 
            limit: 50,
            include_trip_info: true 
          });
          const locationData = locationHistoryResponse.locations || locationHistoryResponse.data || locationHistoryResponse || [];
          setLocations(Array.isArray(locationData) ? locationData : []);
        } catch (locError) {
          console.error('Failed to fetch location history:', locError);
          setLocations([]);
        }
        
        // Fetch tourist-specific alerts
        try {
          const alertsResponse = await touristAPI.getTouristAlerts(id);
          const alertsData = alertsResponse.alerts || alertsResponse.data || alertsResponse || [];
          setAlerts(Array.isArray(alertsData) ? alertsData : []);
        } catch (alertError) {
          console.error('Failed to fetch tourist alerts:', alertError);
          setAlerts([]);
        }

        // Fetch safety timeline (NEW API)
        try {
          const timelineResponse = await touristAPI.getSafetyTimeline(id);
          const timelineData = timelineResponse.timeline || timelineResponse.data || [];
          setSafetyTimeline(Array.isArray(timelineData) ? timelineData : []);
        } catch (timelineError) {
          console.error('Failed to fetch safety timeline:', timelineError);
          setSafetyTimeline([]);
        }

        // Fetch movement analysis (NEW API)
        try {
          const analysisResponse = await touristAPI.getMovementAnalysis(id, 24);
          setMovementAnalysis(analysisResponse);
        } catch (analysisError) {
          console.error('Failed to fetch movement analysis:', analysisError);
          setMovementAnalysis(null);
        }
        
        setError(null);
      } catch (error) {
        console.error('Failed to fetch tourist data:', error);
        setError(error);
        setTourist(null);
        setCurrentLocation(null);
        setLocations([]);
        setAlerts([]);
        setSafetyTimeline([]);
        setMovementAnalysis(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTouristData();
      
      // Set up periodic refresh for real-time tracking (every 10 seconds)
      const refreshInterval = setInterval(fetchTouristData, 10000);
      
      return () => clearInterval(refreshInterval);
    }
  }, [id]);

  // Function to fetch emergency contacts
  const fetchEmergencyContacts = async () => {
    if (!emergencyConfirmed) {
      alert('⚠️ Emergency contacts should only be accessed in emergency situations.');
      return;
    }

    try {
      const response = await touristAPI.getEmergencyContacts(id);
      const contactsData = response.emergency_contacts || response.data || [];
      setEmergencyContacts(Array.isArray(contactsData) ? contactsData : []);
      setShowEmergencyContacts(true);
    } catch (error) {
      console.error('Failed to fetch emergency contacts:', error);
      alert('Failed to fetch emergency contacts. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 mx-auto text-destructive mb-4" />
        <h3 className="text-lg font-medium mb-2">Failed to Load Tourist Data</h3>
        <p className="text-muted-foreground mb-4">Please try again later.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  if (!tourist) {
    return (
      <div className="text-center py-8">
        <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Tourist not found</h3>
        <p className="text-muted-foreground mb-4">
          The requested tourist could not be found or you don't have permission to view this data.
        </p>
        <Button onClick={() => navigate('/tourists')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tourists
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/tourists')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-2">
              <User className="w-8 h-8" />
              <span>{tourist.name || tourist.full_name || `Tourist #${id}`}</span>
            </h1>
            <p className="text-muted-foreground">Tourist Profile & Activity</p>
          </div>
        </div>
        <Badge variant={getSafetyScoreColor(tourist.safety_score || 0)} className="text-lg px-3 py-1">
          Safety: {tourist.safety_score ?? 'N/A'}%
        </Badge>
      </div>

      {/* Live Location Alert */}
      {currentLocation && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-900/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-green-600" />
              <span className="text-green-700 dark:text-green-400">Live Location</span>
              <Badge variant="success" className="ml-2">ACTIVE</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Position</p>
                <p className="font-mono text-sm">
                  {currentLocation.location?.latitude?.toFixed(4)}, {currentLocation.location?.longitude?.toFixed(4)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Safety Score</p>
                <div className="flex items-center space-x-2">
                  <Badge variant={getSafetyScoreColor(currentLocation.safety_score)}>
                    {currentLocation.safety_score}%
                  </Badge>
                  <span className="text-sm">{getSafetyScoreLabel(currentLocation.safety_score)}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Zone Status</p>
                <Badge variant={currentLocation.zone_status?.in_restricted_zone ? 'destructive' : 'success'}>
                  {currentLocation.zone_status?.in_restricted_zone ? '⚠️ Restricted Zone' : '✓ Safe Zone'}
                </Badge>
              </div>
            </div>
            {currentLocation.zone_status?.current_zone && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm text-muted-foreground">Current Zone: <span className="font-medium text-foreground">{currentLocation.zone_status.current_zone.name}</span></p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tourist Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Tourist ID</p>
                <p className="font-medium font-mono">#{tourist.id || tourist.tourist_id || id}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{tourist.name || tourist.full_name || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{tourist.email || tourist.email_address || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{tourist.phone || tourist.phone_number || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Safety Status</p>
                <div className="flex items-center space-x-2">
                  <Badge variant={getSafetyScoreColor(tourist.safety_score || 0)}>
                    {tourist.safety_score ?? 'N/A'}%
                  </Badge>
                  <span className="text-sm">{getSafetyScoreLabel(tourist.safety_score || 0)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Last Seen</p>
                <p className="font-medium">{formatTimeAgo(tourist.last_seen)}</p>
                <p className="text-xs text-muted-foreground">{formatDateTime(tourist.last_seen)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity & Stats */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activity Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium text-blue-600">Active</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Locations</p>
                    <p className="font-medium text-green-600">{locations.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Alerts</p>
                    <p className="font-medium text-orange-600">{alerts.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Locations</CardTitle>
        </CardHeader>
        <CardContent>
          {locations.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No location data available</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Coordinates</TableHead>
                  <TableHead>Speed</TableHead>
                  <TableHead>Altitude</TableHead>
                  <TableHead>Accuracy</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.slice(0, 10).map((location) => (
                  <TableRow key={location.id}>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {location.lat != null && location.lon != null 
                          ? `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`
                          : 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {location.speed != null ? `${location.speed.toFixed(1)} km/h` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {location.altitude != null ? `${location.altitude.toFixed(0)}m` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {location.accuracy != null ? `±${location.accuracy.toFixed(0)}m` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {formatDateTime(location.timestamp)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Alerts History */}
      <Card>
        <CardHeader>
          <CardTitle>Alert History</CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No alerts for this tourist</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <span className="capitalize">{alert.type}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSafetyScoreColor(alert.severity)} className="capitalize">
                        {alert.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{alert.title}</div>
                        <div className="text-sm text-muted-foreground">{alert.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={alert.is_resolved ? 'success' : alert.is_acknowledged ? 'warning' : 'destructive'}>
                        {alert.is_resolved ? 'Resolved' : alert.is_acknowledged ? 'Acknowledged' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDateTime(alert.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Safety Timeline */}
      {safetyTimeline && safetyTimeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Safety Score Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {safetyTimeline.slice(0, 10).map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">{formatDateTime(entry.timestamp)}</p>
                      <p className="text-xs text-muted-foreground">{formatTimeAgo(entry.timestamp)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={getSafetyScoreColor(entry.safety_score)} className="text-sm">
                      {entry.safety_score}%
                    </Badge>
                    <Badge variant={entry.risk_level === 'high' ? 'destructive' : entry.risk_level === 'medium' ? 'warning' : 'success'} className="capitalize">
                      {entry.risk_level}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Movement Analysis */}
      {movementAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Movement Analysis (Last 24 Hours)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Distance Traveled</div>
                <div className="text-2xl font-bold text-blue-600">
                  {movementAnalysis.movement_metrics?.total_distance_km?.toFixed(2) || '0'} km
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Average Speed</div>
                <div className="text-2xl font-bold text-green-600">
                  {movementAnalysis.movement_metrics?.average_speed_kmh?.toFixed(1) || '0'} km/h
                </div>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Max Speed</div>
                <div className="text-2xl font-bold text-orange-600">
                  {movementAnalysis.movement_metrics?.max_speed_kmh?.toFixed(1) || '0'} km/h
                </div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Movement Type</div>
                <div className="text-lg font-bold text-purple-600 capitalize">
                  {movementAnalysis.movement_metrics?.movement_type?.replace('_', ' ') || 'Unknown'}
                </div>
              </div>
            </div>

            {movementAnalysis.behavior_assessment && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Behavior Assessment</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={movementAnalysis.behavior_assessment.is_moving ? 'success' : 'secondary'}>
                    {movementAnalysis.behavior_assessment.is_moving ? 'Currently Moving' : 'Stationary'}
                  </Badge>
                  <Badge variant={movementAnalysis.behavior_assessment.unusual_speed ? 'warning' : 'success'}>
                    {movementAnalysis.behavior_assessment.unusual_speed ? '⚠️ Unusual Speed' : 'Normal Speed'}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    Activity: {movementAnalysis.behavior_assessment.activity_level}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="w-5 h-5" />
            <span>Emergency Contacts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!showEmergencyContacts ? (
            <div className="text-center py-6">
              <AlertTriangle className="w-12 h-12 mx-auto text-warning mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                ⚠️ Emergency contacts contain sensitive information.<br/>
                This feature should only be used in emergency situations.
              </p>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <input 
                  type="checkbox" 
                  id="emergency-confirm"
                  checked={emergencyConfirmed}
                  onChange={(e) => setEmergencyConfirmed(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="emergency-confirm" className="text-sm">
                  I confirm this is an emergency situation
                </label>
              </div>
              <Button 
                onClick={fetchEmergencyContacts}
                disabled={!emergencyConfirmed}
                variant="destructive"
              >
                View Emergency Contacts
              </Button>
            </div>
          ) : (
            <div>
              {emergencyContacts.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No emergency contacts registered
                </p>
              ) : (
                <div className="space-y-4">
                  {emergencyContacts.map((contact, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{contact.name}</h4>
                        {contact.is_primary && (
                          <Badge variant="warning">Primary</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Relationship: {contact.relationship}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span className="font-mono">{contact.phone}</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.location.href = `tel:${contact.phone}`}
                        >
                          📞 Call Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Location Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg h-64 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-2" />
              <p className="text-lg font-medium">Interactive Map</p>
              <p className="text-sm">
                Tourist location tracking and route history would be displayed here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TouristDetail;