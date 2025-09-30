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
  const [locations, setLocations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTouristData = async () => {
      try {
        setLoading(true);
        const data = await touristAPI.trackTourist(id);
        setTourist(data.tourist);
        setLocations(data.locations || []);
        setAlerts(data.recent_alerts || []);
      } catch (error) {
        console.error('Failed to fetch tourist data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTouristData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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
              <span>{tourist.name}</span>
            </h1>
            <p className="text-muted-foreground">Tourist Profile & Activity</p>
          </div>
        </div>
        <Badge variant={getSafetyScoreColor(tourist.safety_score)} className="text-lg px-3 py-1">
          Safety: {tourist.safety_score}%
        </Badge>
      </div>

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
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{tourist.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{tourist.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{tourist.phone || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Safety Status</p>
                <div className="flex items-center space-x-2">
                  <Badge variant={getSafetyScoreColor(tourist.safety_score)}>
                    {tourist.safety_score}%
                  </Badge>
                  <span className="text-sm">{getSafetyScoreLabel(tourist.safety_score)}</span>
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
                        {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {location.speed ? `${location.speed.toFixed(1)} km/h` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {location.altitude ? `${location.altitude.toFixed(0)}m` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {location.accuracy ? `±${location.accuracy.toFixed(0)}m` : 'N/A'}
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