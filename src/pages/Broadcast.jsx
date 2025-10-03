import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input, Label } from '../components/ui/input.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { broadcastAPI } from '../api/services.js';
import {
  Radio,
  MapPin,
  Globe,
  Square,
  Send,
  Bell,
  AlertCircle
} from 'lucide-react';

const Broadcast = () => {
  const [broadcastType, setBroadcastType] = useState('radius'); // 'radius' | 'zone' | 'region' | 'all'
  const [broadcasting, setBroadcasting] = useState(false);

  // Form data for different broadcast types
  const [radiusForm, setRadiusForm] = useState({
    center_latitude: '',
    center_longitude: '',
    radius_km: '5',
    title: '',
    message: '',
    severity: 'MEDIUM',
    alert_type: 'traffic_alert',
    action_required: 'plan_alternate_route',
    expires_at: '',
  });

  const [zoneForm, setZoneForm] = useState({
    zone_id: '',
    title: '',
    message: '',
    severity: 'HIGH',
    alert_type: 'security_threat',
    action_required: 'avoid_area',
  });

  const [regionForm, setRegionForm] = useState({
    min_lat: '',
    max_lat: '',
    min_lon: '',
    max_lon: '',
    title: '',
    message: '',
    severity: 'MEDIUM',
    alert_type: 'weather_warning',
    action_required: 'stay_indoors',
  });

  const [allForm, setAllForm] = useState({
    title: '',
    message: '',
    severity: 'LOW',
    alert_type: 'general_advisory',
    action_required: 'follow_guidelines',
  });



  const handleRadiusBroadcast = async (e) => {
    e.preventDefault();
    
    if (!radiusForm.center_latitude || !radiusForm.center_longitude) {
      alert('❌ Please provide center coordinates (latitude and longitude).');
      return;
    }

    if (!radiusForm.title || !radiusForm.message) {
      alert('❌ Please provide both title and message for the broadcast.');
      return;
    }

    if (parseFloat(radiusForm.radius_km) <= 0) {
      alert('❌ Radius must be greater than 0 km.');
      return;
    }

    if (parseFloat(radiusForm.radius_km) > 100) {
      alert('❌ Radius cannot exceed 100 km for safety reasons.');
      return;
    }
    
    const confirmMsg = `Send emergency broadcast to tourists within ${radiusForm.radius_km} km?\n\n` +
      `Center: ${radiusForm.center_latitude}°, ${radiusForm.center_longitude}°\n` +
      `Title: ${radiusForm.title}\n` +
      `Message: ${radiusForm.message}\n` +
      `Severity: ${radiusForm.severity.toUpperCase()}\n\n` +
      `This will send push notifications to all affected tourists.`;
    
    if (!window.confirm(confirmMsg)) return;

    try {
      setBroadcasting(true);
      const result = await broadcastAPI.sendRadiusBroadcast({
        ...radiusForm,
        center_latitude: parseFloat(radiusForm.center_latitude),
        center_longitude: parseFloat(radiusForm.center_longitude),
        radius_km: parseFloat(radiusForm.radius_km),
      });
      
      alert(
        `✅ Broadcast Sent Successfully!\n\n` +
        `Broadcast ID: ${result.broadcast_id}\n` +
        `Tourists Notified: ${result.tourists_notified}\n` +
        `Devices Notified: ${result.devices_notified}\n` +
        `Area: ${result.area_covered}`
      );
      
      // Reset form
      setRadiusForm({
        center_latitude: '',
        center_longitude: '',
        radius_km: '5',
        title: '',
        message: '',
        severity: 'MEDIUM',
        alert_type: 'traffic_alert',
        action_required: 'plan_alternate_route',
        expires_at: '',
      });

    } catch (error) {
      console.error('Failed to send broadcast:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Unknown error occurred';
      alert(`❌ Failed to send broadcast: ${errorMsg}`);
    } finally {
      setBroadcasting(false);
    }
  };

  const handleZoneBroadcast = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!zoneForm.zone_id) {
      alert('❌ Please provide a Zone ID.');
      return;
    }

    if (!zoneForm.title || !zoneForm.message) {
      alert('❌ Please provide both title and message for the broadcast.');
      return;
    }

    if (isNaN(parseInt(zoneForm.zone_id))) {
      alert('❌ Zone ID must be a valid number.');
      return;
    }
    
    const confirmMsg = `Send emergency broadcast to Zone #${zoneForm.zone_id}?\n\n` +
      `Title: ${zoneForm.title}\n` +
      `Message: ${zoneForm.message}\n` +
      `Severity: ${zoneForm.severity.toUpperCase()}\n\n` +
      `This will send push notifications to all tourists in this zone.`;
    
    if (!window.confirm(confirmMsg)) return;

    try {
      setBroadcasting(true);
      const result = await broadcastAPI.sendZoneBroadcast({
        ...zoneForm,
        zone_id: parseInt(zoneForm.zone_id),
      });
      
      alert(
        `✅ Zone Broadcast Sent!\n\n` +
        `Broadcast ID: ${result.broadcast_id}\n` +
        `Zone: ${result.zone_name}\n` +
        `Tourists Notified: ${result.tourists_notified}\n` +
        `Devices Notified: ${result.devices_notified}`
      );
      
      setZoneForm({
        zone_id: '',
        title: '',
        message: '',
        severity: 'HIGH',
        alert_type: 'security_threat',
        action_required: 'avoid_area',
      });
    } catch (error) {
      console.error('Failed to send zone broadcast:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Unknown error occurred';
      alert(`❌ Failed to send zone broadcast: ${errorMsg}`);
    } finally {
      setBroadcasting(false);
    }
  };

  const handleRegionBroadcast = async (e) => {
    e.preventDefault();
    
    // Validate region bounds
    if (!regionForm.min_lat || !regionForm.max_lat || !regionForm.min_lon || !regionForm.max_lon) {
      alert('❌ Please fill in all region boundary coordinates.');
      return;
    }

    if (parseFloat(regionForm.min_lat) >= parseFloat(regionForm.max_lat)) {
      alert('❌ Minimum latitude must be less than maximum latitude.');
      return;
    }

    if (parseFloat(regionForm.min_lon) >= parseFloat(regionForm.max_lon)) {
      alert('❌ Minimum longitude must be less than maximum longitude.');
      return;
    }
    
    const confirmMsg = `Send emergency broadcast to region?\n\n` +
      `Region: ${regionForm.min_lat}°-${regionForm.max_lat}° lat, ${regionForm.min_lon}°-${regionForm.max_lon}° lon\n` +
      `Title: ${regionForm.title}\n` +
      `Message: ${regionForm.message}\n` +
      `Severity: ${regionForm.severity.toUpperCase()}\n\n` +
      `This will send push notifications to all affected tourists.`;
    
    if (!window.confirm(confirmMsg)) return;

    try {
      setBroadcasting(true);
      const result = await broadcastAPI.sendRegionBroadcast({
        region_bounds: {
          min_lat: parseFloat(regionForm.min_lat),
          max_lat: parseFloat(regionForm.max_lat),
          min_lon: parseFloat(regionForm.min_lon),
          max_lon: parseFloat(regionForm.max_lon),
        },
        title: regionForm.title,
        message: regionForm.message,
        severity: regionForm.severity,
        alert_type: regionForm.alert_type,
        action_required: regionForm.action_required,
      });
      
      alert(
        `✅ Region Broadcast Sent!\n\n` +
        `Broadcast ID: ${result.broadcast_id}\n` +
        `Tourists Notified: ${result.tourists_notified}\n` +
        `Devices Notified: ${result.devices_notified}\n` +
        `Region: ${result.region || 'Specified region'}`
      );
      
      setRegionForm({
        min_lat: '',
        max_lat: '',
        min_lon: '',
        max_lon: '',
        title: '',
        message: '',
        severity: 'MEDIUM',
        alert_type: 'weather_warning',
        action_required: 'stay_indoors',
      });
    } catch (error) {
      console.error('Failed to send region broadcast:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Unknown error occurred';
      alert(`❌ Failed to send region broadcast: ${errorMsg}`);
    } finally {
      setBroadcasting(false);
    }
  };

  const handleAllBroadcast = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!allForm.title || !allForm.message) {
      alert('❌ Please provide both title and message for the state-wide broadcast.');
      return;
    }

    // Double confirmation for state-wide broadcasts
    const firstConfirm = window.confirm(
      `⚠️ CRITICAL ACTION ⚠️\n\n` +
      `You are about to send a state-wide emergency alert to ALL tourists.\n\n` +
      `This will notify every active tourist in the system.\n\n` +
      `Are you sure you want to continue?`
    );
    
    if (!firstConfirm) return;

    const confirmMsg = `⚠️ FINAL CONFIRMATION ⚠️\n\n` +
      `Send state-wide emergency alert to ALL tourists?\n\n` +
      `Title: ${allForm.title}\n` +
      `Message: ${allForm.message}\n` +
      `Severity: ${allForm.severity.toUpperCase()}\n\n` +
      `This action cannot be undone and will affect all active tourists!`;
    
    if (!window.confirm(confirmMsg)) return;

    try {
      setBroadcasting(true);
      const result = await broadcastAPI.sendAllBroadcast(allForm);
      
      alert(
        `✅ State-Wide Broadcast Sent!\n\n` +
        `Broadcast ID: ${result.broadcast_id}\n` +
        `Scope: ${result.scope || 'All Tourists'}\n` +
        `Tourists Notified: ${result.tourists_notified}\n` +
        `Devices Notified: ${result.devices_notified}\n\n` +
        `Broadcast successfully delivered to all active tourists.`
      );
      
      setAllForm({
        title: '',
        message: '',
        severity: 'LOW',
        alert_type: 'general_advisory',
        action_required: 'follow_guidelines',
      });
    } catch (error) {
      console.error('Failed to send all broadcast:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Unknown error occurred';
      alert(`❌ Failed to send state-wide broadcast: ${errorMsg}`);
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="w-8 h-8" />
            Emergency Broadcast
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Send notifications to tourists</p>
        </div>
      </div>

      {/* Broadcast Content */}
      <div className="space-y-6">
          {/* Broadcast Type Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Select Broadcast Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setBroadcastType('radius')}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    broadcastType === 'radius'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Radio className={`w-8 h-8 mx-auto mb-3 ${
                    broadcastType === 'radius' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <h3 className="font-semibold mb-1">Radius</h3>
                  <p className="text-xs text-muted-foreground">Alert within X km</p>
                </button>

                <button
                  onClick={() => setBroadcastType('zone')}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    broadcastType === 'zone'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <MapPin className={`w-8 h-8 mx-auto mb-3 ${
                    broadcastType === 'zone' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <h3 className="font-semibold mb-1">Zone</h3>
                  <p className="text-xs text-muted-foreground">Alert specific zone</p>
                </button>

                <button
                  onClick={() => setBroadcastType('region')}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    broadcastType === 'region'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Square className={`w-8 h-8 mx-auto mb-3 ${
                    broadcastType === 'region' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <h3 className="font-semibold mb-1">Region</h3>
                  <p className="text-xs text-muted-foreground">Alert bounding box</p>
                </button>

                <button
                  onClick={() => setBroadcastType('all')}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    broadcastType === 'all'
                      ? 'border-destructive bg-destructive/10'
                      : 'border-border hover:border-destructive/50'
                  }`}
                >
                  <Globe className={`w-8 h-8 mx-auto mb-3 ${
                    broadcastType === 'all' ? 'text-destructive' : 'text-muted-foreground'
                  }`} />
                  <h3 className="font-semibold mb-1">All Tourists</h3>
                  <p className="text-xs text-muted-foreground">State-wide alert</p>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Radius Broadcast Form */}
          {broadcastType === 'radius' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Radio className="w-5 h-5 mr-2" />
                  Radius Broadcast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRadiusBroadcast} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="center_latitude">Center Latitude *</Label>
                      <Input
                        id="center_latitude"
                        type="number"
                        step="0.000001"
                        placeholder="28.6139"
                        value={radiusForm.center_latitude}
                        onChange={(e) => setRadiusForm({...radiusForm, center_latitude: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="center_longitude">Center Longitude *</Label>
                      <Input
                        id="center_longitude"
                        type="number"
                        step="0.000001"
                        placeholder="77.2090"
                        value={radiusForm.center_longitude}
                        onChange={(e) => setRadiusForm({...radiusForm, center_longitude: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="radius_km">Radius (km) *</Label>
                      <Input
                        id="radius_km"
                        type="number"
                        step="0.1"
                        min="0.1"
                        placeholder="5"
                        value={radiusForm.radius_km}
                        onChange={(e) => setRadiusForm({...radiusForm, radius_km: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="title">Alert Title *</Label>
                    <Input
                      id="title"
                      placeholder="⚠️ Emergency Alert"
                      value={radiusForm.title}
                      onChange={(e) => setRadiusForm({...radiusForm, title: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Alert Message *</Label>
                    <textarea
                      id="message"
                      className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md bg-transparent"
                      placeholder="Detailed alert message..."
                      value={radiusForm.message}
                      onChange={(e) => setRadiusForm({...radiusForm, message: e.target.value})}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="severity">Severity *</Label>
                      <select
                        id="severity"
                        className="w-full h-10 border border-input bg-transparent rounded-md px-3"
                        value={radiusForm.severity}
                        onChange={(e) => setRadiusForm({...radiusForm, severity: e.target.value})}
                        required
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="alert_type">Alert Type *</Label>
                      <select
                        id="alert_type"
                        className="w-full h-10 border border-input bg-transparent rounded-md px-3"
                        value={radiusForm.alert_type}
                        onChange={(e) => setRadiusForm({...radiusForm, alert_type: e.target.value})}
                        required
                      >
                        <option value="emergency">Emergency</option>
                        <option value="natural_disaster">Natural Disaster</option>
                        <option value="security_threat">Security Threat</option>
                        <option value="weather_warning">Weather Warning</option>
                        <option value="riot">Riot/Civil Unrest</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="action_required">Action Required *</Label>
                      <select
                        id="action_required"
                        className="w-full h-10 border border-input bg-transparent rounded-md px-3"
                        value={radiusForm.action_required}
                        onChange={(e) => setRadiusForm({...radiusForm, action_required: e.target.value})}
                        required
                      >
                        <option value="evacuate">Evacuate</option>
                        <option value="avoid_area">Avoid Area</option>
                        <option value="stay_indoors">Stay Indoors</option>
                        <option value="follow_instructions">Follow Instructions</option>
                      </select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={broadcasting}
                    className="w-full"
                    size="lg"
                  >
                    {broadcasting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Radius Broadcast
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Zone Broadcast Form */}
          {broadcastType === 'zone' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Zone Broadcast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleZoneBroadcast} className="space-y-4">
                  <div>
                    <Label htmlFor="zone_id">Zone ID *</Label>
                    <Input
                      id="zone_id"
                      type="number"
                      placeholder="42"
                      value={zoneForm.zone_id}
                      onChange={(e) => setZoneForm({...zoneForm, zone_id: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="zone_title">Alert Title *</Label>
                    <Input
                      id="zone_title"
                      placeholder="🚫 Restricted Zone Alert"
                      value={zoneForm.title}
                      onChange={(e) => setZoneForm({...zoneForm, title: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="zone_message">Alert Message *</Label>
                    <textarea
                      id="zone_message"
                      className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md bg-transparent"
                      placeholder="This zone is temporarily restricted..."
                      value={zoneForm.message}
                      onChange={(e) => setZoneForm({...zoneForm, message: e.target.value})}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Severity *</Label>
                      <select
                        className="w-full h-10 border border-input bg-transparent rounded-md px-3"
                        value={zoneForm.severity}
                        onChange={(e) => setZoneForm({...zoneForm, severity: e.target.value})}
                        required
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    <div>
                      <Label>Alert Type *</Label>
                      <select
                        className="w-full h-10 border border-input bg-transparent rounded-md px-3"
                        value={zoneForm.alert_type}
                        onChange={(e) => setZoneForm({...zoneForm, alert_type: e.target.value})}
                        required
                      >
                        <option value="security_threat">Security Threat</option>
                        <option value="emergency">Emergency</option>
                        <option value="event_restriction">Event Restriction</option>
                      </select>
                    </div>
                    <div>
                      <Label>Action Required *</Label>
                      <select
                        className="w-full h-10 border border-input bg-transparent rounded-md px-3"
                        value={zoneForm.action_required}
                        onChange={(e) => setZoneForm({...zoneForm, action_required: e.target.value})}
                        required
                      >
                        <option value="avoid_area">Avoid Area</option>
                        <option value="evacuate">Evacuate</option>
                        <option value="stay_indoors">Stay Indoors</option>
                      </select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={broadcasting}
                    className="w-full"
                    size="lg"
                  >
                    {broadcasting ? 'Sending...' : 'Send Zone Broadcast'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Region & All Broadcast Forms - Similar structure */}
          {broadcastType === 'region' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Square className="w-5 h-5 mr-2" />
                  Region Broadcast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegionBroadcast} className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Min Latitude *</Label>
                      <Input
                        type="number"
                        step="0.000001"
                        placeholder="28.5000"
                        value={regionForm.min_lat}
                        onChange={(e) => setRegionForm({...regionForm, min_lat: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label>Max Latitude *</Label>
                      <Input
                        type="number"
                        step="0.000001"
                        placeholder="28.7000"
                        value={regionForm.max_lat}
                        onChange={(e) => setRegionForm({...regionForm, max_lat: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label>Min Longitude *</Label>
                      <Input
                        type="number"
                        step="0.000001"
                        placeholder="77.1000"
                        value={regionForm.min_lon}
                        onChange={(e) => setRegionForm({...regionForm, min_lon: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label>Max Longitude *</Label>
                      <Input
                        type="number"
                        step="0.000001"
                        placeholder="77.3000"
                        value={regionForm.max_lon}
                        onChange={(e) => setRegionForm({...regionForm, max_lon: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Alert Title *</Label>
                    <Input
                      placeholder="⛈️ Weather Alert"
                      value={regionForm.title}
                      onChange={(e) => setRegionForm({...regionForm, title: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label>Alert Message *</Label>
                    <textarea
                      className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md bg-transparent"
                      placeholder="Severe thunderstorm warning..."
                      value={regionForm.message}
                      onChange={(e) => setRegionForm({...regionForm, message: e.target.value})}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={broadcasting}
                    className="w-full"
                    size="lg"
                  >
                    {broadcasting ? 'Sending...' : 'Send Region Broadcast'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {broadcastType === 'all' && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center text-destructive">
                  <Globe className="w-5 h-5 mr-2" />
                  State-Wide Broadcast (All Tourists)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-destructive/10 border border-destructive rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-destructive mb-1">⚠️ Critical Action Warning</h4>
                      <p className="text-sm text-muted-foreground">
                        This will send notifications to ALL active tourists. Use only for state-wide emergencies.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleAllBroadcast} className="space-y-4">
                  <div>
                    <Label>Alert Title *</Label>
                    <Input
                      placeholder="🚨 State Emergency Alert"
                      value={allForm.title}
                      onChange={(e) => setAllForm({...allForm, title: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label>Alert Message *</Label>
                    <textarea
                      className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md bg-transparent"
                      placeholder="State-wide emergency declared..."
                      value={allForm.message}
                      onChange={(e) => setAllForm({...allForm, message: e.target.value})}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={broadcasting}
                    variant="destructive"
                    className="w-full"
                    size="lg"
                  >
                    {broadcasting ? 'Sending...' : '🚨 Send State-Wide Alert'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
};

export default Broadcast;
