import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input, Label } from '../components/ui/input.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { emergencyAPI } from '../api/services.js';
import {
  AlertTriangle,
  Radio,
  MapPin,
  Users,
  Send,
  CheckCircle,
  Info
} from 'lucide-react';

const Emergency = () => {
  const [broadcasting, setBroadcasting] = useState(false);
  const [lastBroadcast, setLastBroadcast] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    center_lat: '',
    center_lon: '',
    radius_km: '5',
    severity: 'critical',
    evacuation_points: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.message || !formData.center_lat || !formData.center_lon) {
      alert('Please fill all required fields');
      return;
    }

    const confirmBroadcast = window.confirm(
      `Are you sure you want to broadcast this ${formData.severity} emergency alert?\n\n` +
      `Title: ${formData.title}\n` +
      `Message: ${formData.message}\n` +
      `Area: ${formData.center_lat}, ${formData.center_lon} (${formData.radius_km} km radius)\n\n` +
      `This will send notifications to all tourists in the area.`
    );

    if (!confirmBroadcast) return;

    try {
      setBroadcasting(true);
      
      const alertData = {
        title: formData.title,
        message: formData.message,
        area: {
          center_lat: parseFloat(formData.center_lat),
          center_lon: parseFloat(formData.center_lon),
          radius_km: parseFloat(formData.radius_km)
        },
        severity: formData.severity,
        evacuation_points: formData.evacuation_points
      };

      const result = await emergencyAPI.broadcastEmergencyAlert(alertData);
      console.log('Emergency broadcast result:', result);
      
      setLastBroadcast(result);
      
      // Reset form
      setFormData({
        title: '',
        message: '',
        center_lat: '',
        center_lon: '',
        radius_km: '5',
        severity: 'critical',
        evacuation_points: []
      });

      alert(
        `Emergency Alert Broadcast Successfully!\n\n` +
        `Alert ID: ${result.alert_id}\n` +
        `Tourists Notified: ${result.tourists_notified}\n` +
        `Push Notifications: ${result.notifications.push}\n` +
        `SMS: ${result.notifications.sms}\n` +
        `Email: ${result.notifications.email}`
      );
    } catch (error) {
      console.error('Failed to broadcast emergency alert:', error);
      alert('Failed to broadcast emergency alert. Please try again.');
    } finally {
      setBroadcasting(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'warning';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Radio className="w-8 h-8 text-red-600" />
            <span>Emergency Broadcast</span>
          </h1>
          <p className="text-muted-foreground">
            Send emergency alerts to tourists in specific areas
          </p>
        </div>
        <Badge variant="destructive" className="text-lg px-3 py-1">
          Emergency Services
        </Badge>
      </div>

      {/* Warning Banner */}
      <Card className="border-red-500 bg-red-50 dark:bg-red-900/20">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-red-700 dark:text-red-400">
                ⚠️ Emergency Use Only
              </h3>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                This feature should only be used for genuine emergencies such as natural disasters, 
                terrorist threats, or other situations requiring immediate tourist evacuation or warning.
                Misuse may cause panic and is subject to disciplinary action.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Broadcast Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Create Emergency Broadcast</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBroadcast} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Alert Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g., Earthquake Warning - Immediate Action Required"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    disabled={broadcasting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Alert Message *</Label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder="e.g., Earthquake warning issued. Move to designated safe zones immediately. Follow local authority instructions."
                    value={formData.message}
                    onChange={handleChange}
                    required
                    disabled={broadcasting}
                    className="w-full border border-input bg-transparent rounded-md px-3 py-2 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity">Severity Level *</Label>
                  <select
                    id="severity"
                    name="severity"
                    value={formData.severity}
                    onChange={handleChange}
                    required
                    disabled={broadcasting}
                    className="w-full border border-input bg-transparent rounded-md px-3 py-2 text-sm"
                  >
                    <option value="critical">Critical - Immediate Danger</option>
                    <option value="high">High - Urgent Action Required</option>
                    <option value="medium">Medium - Caution Advised</option>
                  </select>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3 flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>Target Area</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="center_lat">Latitude *</Label>
                      <Input
                        id="center_lat"
                        name="center_lat"
                        type="number"
                        step="0.0001"
                        placeholder="35.6762"
                        value={formData.center_lat}
                        onChange={handleChange}
                        required
                        disabled={broadcasting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="center_lon">Longitude *</Label>
                      <Input
                        id="center_lon"
                        name="center_lon"
                        type="number"
                        step="0.0001"
                        placeholder="139.6503"
                        value={formData.center_lon}
                        onChange={handleChange}
                        required
                        disabled={broadcasting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="radius_km">Radius (km) *</Label>
                      <Input
                        id="radius_km"
                        name="radius_km"
                        type="number"
                        step="0.1"
                        min="0.1"
                        placeholder="5"
                        value={formData.radius_km}
                        onChange={handleChange}
                        required
                        disabled={broadcasting}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        title: '',
                        message: '',
                        center_lat: '',
                        center_lon: '',
                        radius_km: '5',
                        severity: 'critical',
                        evacuation_points: []
                      });
                    }}
                    disabled={broadcasting}
                  >
                    Clear Form
                  </Button>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={broadcasting}
                  >
                    {broadcasting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Broadcasting...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Send className="w-4 h-4" />
                        <span>Broadcast Emergency Alert</span>
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  Use clear, concise language that tourists can understand quickly.
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  Include specific instructions on what actions to take.
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  Provide evacuation point information when applicable.
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  Verify coordinates before broadcasting to ensure correct area coverage.
                </p>
              </div>
            </CardContent>
          </Card>

          {lastBroadcast && (
            <Card className="border-green-500 bg-green-50 dark:bg-green-900/20">
              <CardHeader>
                <CardTitle className="text-sm flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Last Broadcast</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div>
                  <p className="text-muted-foreground">Alert ID</p>
                  <p className="font-mono font-medium">#{lastBroadcast.alert_id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tourists Notified</p>
                  <p className="font-medium flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{lastBroadcast.tourists_notified}</span>
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Notifications Sent</p>
                  <div className="space-y-1 mt-1">
                    <p className="text-xs">Push: {lastBroadcast.notifications.push}</p>
                    <p className="text-xs">SMS: {lastBroadcast.notifications.sms}</p>
                    <p className="text-xs">Email: {lastBroadcast.notifications.email}</p>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">Time</p>
                  <p className="text-xs">{new Date(lastBroadcast.timestamp).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Emergency;
