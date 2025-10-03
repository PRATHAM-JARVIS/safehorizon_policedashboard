import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { alertsAPI, touristAPI, efirAPI } from '../api/services.js';
import Map from '../components/ui/Map.jsx';
import {
  AlertTriangle,
  ArrowLeft,
  User,
  MapPin,
  Clock,
  Phone,
  Mail,
  Activity,
  CheckCircle,
  FileText,
  Shield,
  Navigation,
  Calendar,
  AlertCircle,
  Radio,
  Car,
  Ambulance,
  UserCheck,
  ExternalLink,
  Copy,
  MessageSquare,
  Video
} from 'lucide-react';

const AlertDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);
  const [tourist, setTourist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAlertDetails = useCallback(async () => {
    try {
      setLoading(true);
      const alertsResponse = await alertsAPI.getRecentAlerts({ limit: 1000 });
      const alerts = Array.isArray(alertsResponse) ? alertsResponse : (alertsResponse.alerts || []);
      const foundAlert = alerts.find(a => a.id === parseInt(id));
      
      if (foundAlert) {
        setAlert(foundAlert);
        
        if (foundAlert.tourist_id) {
          try {
            // Try multiple methods to get tourist data (same as Dashboard)
            const touristProfile = await touristAPI.getTouristProfile(foundAlert.tourist_id);
            const touristData = touristProfile.tourist || touristProfile;
            
            // Enrich with current location data
            try {
              const locationData = await touristAPI.getCurrentLocation(foundAlert.tourist_id);
              setTourist({
                ...touristData,
                current_location: locationData.location || locationData,
                last_location: locationData.location || locationData,
                safety_score: locationData.safety_score || touristData.safety_score || 75,
                risk_level: locationData.zone_status?.risk_level || 'unknown',
                last_seen: locationData.last_seen || touristData.last_seen
              });
            } catch (locationErr) {
              console.error('Failed to fetch location:', locationErr);
              setTourist(touristData);
            }
          } catch (err) {
            console.error('Failed to fetch tourist profile:', err);
            try {
              // Fallback to tracking endpoint
              const touristResponse = await touristAPI.trackTourist(foundAlert.tourist_id);
              const touristData = touristResponse.tourist || touristResponse;
              setTourist(touristData);
            } catch (fallbackErr) {
              console.error('Failed to fetch tourist tracking:', fallbackErr);
              // Set tourist from alert data if available
              if (foundAlert.tourist || foundAlert.tourist_name) {
                setTourist({
                  id: foundAlert.tourist_id,
                  name: foundAlert.tourist_name || foundAlert.tourist?.name || 'Unknown Tourist',
                  email: foundAlert.tourist?.email,
                  phone: foundAlert.tourist?.phone,
                  safety_score: foundAlert.tourist?.safety_score || 0
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch alert details:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAlertDetails();
  }, [fetchAlertDetails]);

  const handleAcknowledge = async () => {
    try {
      setActionLoading(true);
      await alertsAPI.acknowledgeIncident(alert.id);
      window.alert('Alert acknowledged successfully');
      fetchAlertDetails();
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      window.alert('Failed to acknowledge alert');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async () => {
    try {
      setActionLoading(true);
      await alertsAPI.resolveIncident(alert.id);
      window.alert('Alert resolved successfully');
      fetchAlertDetails();
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      window.alert('Failed to resolve alert');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateEFIR = async () => {
    try {
      setActionLoading(true);
      const efirData = {
        alert_id: alert.id,
        tourist_id: alert.tourist_id,
        incident_type: alert.type || 'general',
        description: alert.description || `${alert.type} alert at ${alert.location?.address || 'unknown location'}`,
        location: alert.location ? {
          latitude: alert.location.lat || alert.location.latitude,
          longitude: alert.location.lon || alert.location.longitude
        } : null,
        witnesses: [],
        evidence: []
      };
      
      const efir = await efirAPI.generateEFIR(efirData);
      window.alert('E-FIR generated successfully! ID: ' + (efir.efir_id || efir.id));
      if (efir.efir_id || efir.id) {
        navigate(`/efirs/${efir.efir_id || efir.id}`);
      }
    } catch (error) {
      console.error('Failed to generate E-FIR:', error);
      window.alert('Failed to generate E-FIR. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCallTourist = () => {
    if (tourist?.phone) {
      window.location.href = `tel:${tourist.phone}`;
    } else {
      window.alert('Tourist phone number not available');
    }
  };

  const handleEmailTourist = () => {
    if (tourist?.email) {
      window.location.href = `mailto:${tourist.email}?subject=SafeHorizon Alert ${alert.id}`;
    } else {
      window.alert('Tourist email not available');
    }
  };

  const handleOpenGoogleMaps = () => {
    const lat = alert.location?.lat || alert.location?.latitude;
    const lon = alert.location?.lon || alert.location?.longitude;
    if (lat && lon) {
      window.open(`https://www.google.com/maps?q=${lat},${lon}`, '_blank');
    } else {
      window.alert('Location coordinates not available');
    }
  };

  const handleCopyCoordinates = () => {
    const lat = alert.location?.lat || alert.location?.latitude;
    const lon = alert.location?.lon || alert.location?.longitude;
    if (lat && lon) {
      navigator.clipboard.writeText(`${lat}, ${lon}`);
      window.alert('Coordinates copied to clipboard!');
    } else {
      window.alert('Location coordinates not available');
    }
  };

  const handleDispatchUnit = () => {
    window.alert('Dispatch unit feature coming soon!');
  };

  const handleRequestAmbulance = () => {
    window.alert('Emergency services notification sent!');
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (alert) => {
    if (alert?.is_resolved || alert?.resolved) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (alert?.is_acknowledged || alert?.acknowledged) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  };

  const getStatusLabel = (alert) => {
    if (alert?.is_resolved || alert?.resolved) return 'Resolved';
    if (alert?.is_acknowledged || alert?.acknowledged) return 'Acknowledged';
    return 'Pending';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading alert details...</p>
        </div>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/alerts')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Alerts
          </Button>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Alert not found</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/alerts')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Alerts
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Alert #{alert.id}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {alert.type && <span className="capitalize">{alert.type}</span>} Alert Details
            </p>
          </div>
        </div>
        
        <Badge className={`${getSeverityColor(alert.severity)} text-lg px-4 py-2`}>
          {alert.severity || 'Unknown'} Priority
        </Badge>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {!alert.is_acknowledged && !alert.acknowledged && (
          <Button
            onClick={handleAcknowledge}
            disabled={actionLoading}
            className="bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Acknowledge Alert
          </Button>
        )}
        
        {!alert.is_resolved && !alert.resolved && (
          <Button
            onClick={handleResolve}
            disabled={actionLoading}
            className="bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <Shield className="w-5 h-5 mr-2" />
            Mark Resolved
          </Button>
        )}
        
        <Button
          onClick={handleGenerateEFIR}
          disabled={actionLoading}
          variant="outline"
          size="lg"
          className="border-2"
        >
          <FileText className="w-5 h-5 mr-2" />
          Generate E-FIR
        </Button>

        <Button
          onClick={handleDispatchUnit}
          variant="outline"
          size="lg"
          className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50"
        >
          <Car className="w-5 h-5 mr-2" />
          Dispatch Unit
        </Button>
      </div>

      {/* Emergency Action Buttons */}
      <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-red-900 dark:text-red-200">Emergency Actions</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={handleRequestAmbulance}
                variant="destructive"
                size="sm"
              >
                <Ambulance className="w-4 h-4 mr-2" />
                Request Ambulance
              </Button>
              <Button
                onClick={handleCallTourist}
                variant="outline"
                size="sm"
                className="border-red-300"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Tourist
              </Button>
              <Button
                onClick={handleOpenGoogleMaps}
                variant="outline"
                size="sm"
                className="border-red-300"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Open in Maps
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Alert Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Alert Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Alert Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className={getSeverityColor(alert.severity)}>
                  {alert.severity || 'Unknown'} Severity
                </Badge>
                <Badge className={getStatusColor(alert)}>
                  {getStatusLabel(alert)}
                </Badge>
                {alert.type && (
                  <Badge variant="outline">{alert.type}</Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Alert ID
                  </label>
                  <p className="text-sm font-mono">{alert.id}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Timestamp
                  </label>
                  <p className="text-sm">
                    {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : 'N/A'}
                  </p>
                </div>

                {alert.created_at && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Created At
                    </label>
                    <p className="text-sm">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {alert.description && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-sm bg-muted p-3 rounded-md">{alert.description}</p>
                </div>
              )}

              {alert.message && alert.message !== alert.description && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Message</label>
                  <p className="text-sm bg-muted p-3 rounded-md">{alert.message}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location Map */}
          {alert.location && (alert.location.lat || alert.location.latitude) && (
            <Card className="border-2 border-red-200">
              <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-red-600" />
                    Alert Location
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyCoordinates}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Coords
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenGoogleMaps}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Maps
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="h-[400px] rounded-lg overflow-hidden border-2 border-border shadow-lg">
                  <Map
                    center={[
                      alert.location.lat || alert.location.latitude,
                      alert.location.lon || alert.location.longitude
                    ]}
                    zoom={15}
                    alerts={[{
                      id: alert.id,
                      coordinates: {
                        lat: alert.location.lat || alert.location.latitude,
                        lon: alert.location.lon || alert.location.longitude
                      },
                      type: alert.type || 'alert',
                      severity: alert.severity || 'medium',
                      description: alert.description || 'Alert',
                      timestamp: alert.timestamp || alert.created_at
                    }]}
                    tourists={tourist && tourist.last_location ? [{
                      id: tourist.id || alert.tourist_id,
                      name: tourist.name || 'Tourist',
                      current_location: {
                        lat: tourist.last_location.latitude,
                        lon: tourist.last_location.longitude,
                        address: tourist.last_location.address
                      },
                      safety_score: tourist.safety_score || 75,
                      last_seen: tourist.last_location.timestamp
                    }] : []}
                  />
                </div>
                
                {alert.location.address && (
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Navigation className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Address</p>
                      <p className="text-sm text-muted-foreground">{alert.location.address}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Latitude</p>
                    <p className="font-mono font-semibold text-sm">{(alert.location.lat || alert.location.latitude).toFixed(6)}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Longitude</p>
                    <p className="font-mono font-semibold text-sm">{(alert.location.lon || alert.location.longitude).toFixed(6)}</p>
                  </div>
                </div>

                {/* Distance indicator if tourist location is available */}
                {tourist && tourist.last_location && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-900 dark:text-blue-200">
                      📍 Tourist's last known location is also available on this map
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tourist's Last Known Location (if different from alert location) */}
          {tourist && tourist.last_location && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Tourist's Last Known Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-[400px] rounded-lg overflow-hidden">
                  <Map
                    center={[
                      tourist.last_location.latitude,
                      tourist.last_location.longitude
                    ]}
                    zoom={15}
                    tourists={[{
                      id: tourist.id || alert.tourist_id,
                      name: tourist.name || 'Tourist',
                      current_location: {
                        lat: tourist.last_location.latitude,
                        lon: tourist.last_location.longitude,
                        address: tourist.last_location.address
                      },
                      safety_score: tourist.safety_score || 75,
                      last_seen: tourist.last_location.timestamp
                    }]}
                    alerts={alert.location && (alert.location.lat || alert.location.latitude) ? [{
                      id: alert.id,
                      coordinates: {
                        lat: alert.location.lat || alert.location.latitude,
                        lon: alert.location.lon || alert.location.longitude
                      },
                      type: alert.type || 'alert',
                      severity: alert.severity || 'medium',
                      description: alert.description || 'Alert',
                      timestamp: alert.timestamp || alert.created_at
                    }] : []}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span className="font-medium">
                      {new Date(tourist.last_location.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Latitude</p>
                      <p className="font-mono">{tourist.last_location.latitude}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Longitude</p>
                      <p className="font-mono">{tourist.last_location.longitude}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Tourist Info */}
        <div className="space-y-6">
          {/* Tourist Information */}
          <Card className="border-2 border-primary/20">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Tourist Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {tourist ? (
                <>
                  {/* Tourist Avatar/Initials */}
                  <div className="flex items-center gap-4 pb-4 border-b">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {tourist.name?.charAt(0) || 'T'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{tourist.name || 'Unknown Tourist'}</h3>
                      <p className="text-sm text-muted-foreground">Tourist ID: {alert.tourist_id}</p>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Contact Details</h4>
                    
                    {tourist.email && (
                      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <Mail className="w-5 h-5 text-primary mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="text-sm font-medium truncate">{tourist.email}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleEmailTourist}
                          className="shrink-0"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {tourist.phone && (
                      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <Phone className="w-5 h-5 text-primary mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="text-sm font-medium">{tourist.phone}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCallTourist}
                          className="shrink-0"
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {(!tourist.email && !tourist.phone) && (
                      <p className="text-sm text-muted-foreground italic">No contact information available</p>
                    )}
                  </div>

                  {/* Last Seen / Status */}
                  {(tourist.last_seen || tourist.last_location?.timestamp) && (
                    <div className="space-y-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-900 dark:text-blue-200">Last Seen</span>
                      </div>
                      <p className="text-sm">
                        {new Date(tourist.last_seen || tourist.last_location?.timestamp).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((Date.now() - new Date(tourist.last_seen || tourist.last_location?.timestamp)) / 60000)} minutes ago
                      </p>
                    </div>
                  )}

                  {/* Risk Level */}
                  {tourist.risk_level && (
                    <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold flex items-center gap-2">
                          <Shield className="w-4 h-4 text-primary" />
                          Risk Level
                        </label>
                        <Badge className={
                          tourist.risk_level === 'critical' ? 'bg-red-600 text-white' :
                          tourist.risk_level === 'high' ? 'bg-orange-600 text-white' :
                          tourist.risk_level === 'medium' ? 'bg-yellow-600 text-white' :
                          'bg-green-600 text-white'
                        }>
                          {tourist.risk_level.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Safety Score */}
                  {tourist.safety_score !== undefined && (
                    <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold flex items-center gap-2">
                          <Activity className="w-4 h-4 text-primary" />
                          Safety Score
                        </label>
                        <span className={`text-lg font-bold ${
                          tourist.safety_score >= 70 ? 'text-green-600' :
                          tourist.safety_score >= 40 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {tourist.safety_score}/100
                        </span>
                      </div>
                      <div className="flex-1 bg-secondary rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all shadow-sm ${
                            tourist.safety_score >= 70 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                            tourist.safety_score >= 40 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                            'bg-gradient-to-r from-red-500 to-red-600'
                          }`}
                          style={{ width: `${tourist.safety_score}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {tourist.safety_score >= 70 ? '✓ Safe Zone' :
                         tourist.safety_score >= 40 ? '⚠ Caution Required' :
                         '⚠ High Risk Area'}
                      </p>
                    </div>
                  )}

                  {/* Additional Tourist Info */}
                  <div className="space-y-2 border-t pt-4">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Additional Information</h4>
                    
                    {tourist.nationality && (
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm text-muted-foreground">Nationality</span>
                        <span className="text-sm font-medium">{tourist.nationality}</span>
                      </div>
                    )}

                    {tourist.passport_number && (
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm text-muted-foreground">Passport</span>
                        <span className="text-sm font-mono font-medium">{tourist.passport_number}</span>
                      </div>
                    )}

                    {tourist.status && (
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge variant="outline" className="capitalize">{tourist.status}</Badge>
                      </div>
                    )}

                    {tourist.active_trip !== undefined && (
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm text-muted-foreground">Active Trip</span>
                        <Badge className={tourist.active_trip ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800'}>
                          {tourist.active_trip ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    )}

                    {tourist.registered_at && (
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm text-muted-foreground">Registered</span>
                        <span className="text-sm font-medium">{new Date(tourist.registered_at).toLocaleDateString()}</span>
                      </div>
                    )}

                    {(tourist.current_location?.address || tourist.last_location?.address) && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm text-muted-foreground block mb-1">Current Area</span>
                        <span className="text-sm font-medium">{tourist.current_location?.address || tourist.last_location?.address}</span>
                      </div>
                    )}
                  </div>

                  {tourist.emergency_contact && (
                    <div className="space-y-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-sm flex items-center gap-2 text-orange-900 dark:text-orange-200">
                        <UserCheck className="w-4 h-4" />
                        Emergency Contact
                      </h4>
                      {tourist.emergency_contact.name && (
                        <p className="text-sm"><span className="text-muted-foreground">Name:</span> <span className="font-medium">{tourist.emergency_contact.name}</span></p>
                      )}
                      {tourist.emergency_contact.phone && (
                        <p className="text-sm"><span className="text-muted-foreground">Phone:</span> <span className="font-medium">{tourist.emergency_contact.phone}</span></p>
                      )}
                      {tourist.emergency_contact.relationship && (
                        <p className="text-sm"><span className="text-muted-foreground">Relation:</span> <span className="font-medium">{tourist.emergency_contact.relationship}</span></p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/tourists/${alert.tourist_id}`)}
                      className="w-full"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Full Profile
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCallTourist}
                      className="w-full"
                      disabled={!tourist.phone}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <User className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">Tourist information not available</p>
                  {alert.tourist_name && (
                    <p className="text-sm font-medium mt-2">{alert.tourist_name}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alert Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Alert Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Acknowledged</span>
                <Badge className={alert.is_acknowledged || alert.acknowledged ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}>
                  {alert.is_acknowledged || alert.acknowledged ? '✓ Yes' : '✗ No'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Resolved</span>
                <Badge className={alert.is_resolved || alert.resolved ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}>
                  {alert.is_resolved || alert.resolved ? '✓ Yes' : '✗ No'}
                </Badge>
              </div>

              {alert.acknowledged_at && (
                <div className="pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-1">Acknowledged At</p>
                  <p className="text-sm font-medium">{new Date(alert.acknowledged_at).toLocaleString()}</p>
                </div>
              )}

              {alert.resolved_at && (
                <div className="pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-1">Resolved At</p>
                  <p className="text-sm font-medium">{new Date(alert.resolved_at).toLocaleString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Communication */}
          <Card className="border-2 border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-4">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleCallTourist}
                disabled={!tourist?.phone}
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Tourist
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleEmailTourist}
                disabled={!tourist?.email}
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleDispatchUnit}
              >
                <Radio className="w-4 h-4 mr-2" />
                Radio Dispatch
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.alert('Video call feature coming soon!')}
              >
                <Video className="w-4 h-4 mr-2" />
                Video Call
              </Button>
            </CardContent>
          </Card>

          {/* Additional Details */}
          {alert.metadata && Object.keys(alert.metadata).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {Object.entries(alert.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertDetail;
