import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './card.jsx';
import { Button } from './button.jsx';
import { Badge } from './badge.jsx';
import { 
  AlertTriangle, 
  User, 
  MapPin, 
  Clock, 
  CheckCircle, 
  X,
  Phone,
  FileText,
  Navigation
} from 'lucide-react';

export const AlertDetailModal = ({ alert, isOpen, onClose }) => {
  if (!isOpen || !alert) return null;

  const handleAcknowledge = async () => {
    console.log('Acknowledging alert:', alert.id);
    // This will be handled by parent component
    if (window.alertsAPI) {
      try {
        await window.alertsAPI.acknowledgeAlert(alert.id, 'Alert acknowledged from modal');
      } catch (error) {
        console.error('Failed to acknowledge:', error);
      }
    }
    onClose();
  };

  const handleResolve = async () => {
    console.log('Resolving alert:', alert.id);
    // This will be handled by parent component
    if (window.alertsAPI) {
      try {
        await window.alertsAPI.resolveAlert(alert.id, 'Resolved from modal', 'Action completed');
      } catch (error) {
        console.error('Failed to resolve:', error);
      }
    }
    onClose();
  };

  const handleGenerateEFIR = () => {
    console.log('Generating E-FIR for alert:', alert.id);
    window.alert('E-FIR generation initiated for Alert #' + alert.id);
    onClose();
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'critical';
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'sos': return Phone;
      case 'geofence': return MapPin;
      case 'anomaly': return Navigation;
      default: return AlertTriangle;
    }
  };

  const TypeIcon = getTypeIcon(alert.type);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ zIndex: 10000, position: 'relative' }}>
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <TypeIcon className="w-5 h-5" />
                <span>{alert.title || `${alert.type} Alert`}</span>
                <Badge variant={getSeverityColor(alert.severity)}>
                  {alert.severity}
                </Badge>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Alert Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Alert Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Alert ID:</span>
                      <span className="font-mono">#{alert.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline">{alert.type}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Severity:</span>
                      <Badge variant={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time:</span>
                      <span>{new Date(alert.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Tourist Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span>{alert.tourist_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tourist ID:</span>
                      <span className="font-mono">{alert.tourist_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="text-right">
                        {alert.location?.address || alert.location || 'Unknown location'}
                      </span>
                    </div>
                    {(alert.coordinates || alert.location?.lat || alert.lat) && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Coordinates:</span>
                        <span className="font-mono text-xs">
                          {(alert.coordinates?.lat || alert.location?.lat || alert.lat)?.toFixed(4)}, {(alert.coordinates?.lon || alert.coordinates?.lng || alert.location?.lon || alert.location?.lng || alert.lon || alert.lng)?.toFixed(4)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Description</h3>
                <p className="text-sm text-muted-foreground">
                  {alert.description || 'No additional description provided.'}
                </p>
              </div>

              {/* Status Information */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Status Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Acknowledged:</span>
                    <div className="flex items-center space-x-2 mt-1">
                      {alert.is_acknowledged ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Yes, by {alert.acknowledged_by}</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 text-yellow-500" />
                          <span>Not acknowledged</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Resolved:</span>
                    <div className="flex items-center space-x-2 mt-1">
                      {alert.is_resolved ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Yes, by {alert.resolved_by}</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 text-yellow-500" />
                          <span>Not resolved</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                {!alert.is_acknowledged && (
                  <Button onClick={handleAcknowledge} variant="outline">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Acknowledge
                  </Button>
                )}
                {alert.is_acknowledged && !alert.is_resolved && (
                  <Button onClick={handleResolve}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Resolved
                  </Button>
                )}
                <Button onClick={handleGenerateEFIR} variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate E-FIR
                </Button>
                <Button variant="outline">
                  <MapPin className="w-4 h-4 mr-2" />
                  View on Map
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AlertDetailModal;