import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table.jsx';
import { touristAPI, alertsAPI, efirAPI } from '../api/services.js';
import AlertDetailModal from '../components/ui/AlertDetailModal.jsx';
import {
  AlertTriangle,
  Search,
  Filter,
  Phone,
  MapPin,
  Activity,
  Eye,
  Check,
  X,
  FileText,
  Clock
} from 'lucide-react';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showAlertModal, setShowAlertModal] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        // Use documented parameters for alerts API
        const response = await alertsAPI.getRecentAlerts({ hours: 168 }); // Get 7 days worth
        // Handle documented response structure: direct array
        const alertsList = Array.isArray(response) ? response : [];
        setAlerts(alertsList);
        setFilteredAlerts(alertsList);
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
        // Show error state
        setAlerts([]);
        setFilteredAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    
    // Set up periodic refresh for alerts (every 10 seconds for real-time monitoring)
    const refreshInterval = setInterval(fetchAlerts, 10000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    let filtered = alerts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(alert =>
        alert.tourist_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Severity filter
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(alert => alert.severity === filterSeverity);
    }

    // Status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'pending') {
        filtered = filtered.filter(alert => !alert.is_acknowledged && !alert.is_resolved);
      } else if (filterStatus === 'acknowledged') {
        filtered = filtered.filter(alert => alert.is_acknowledged && !alert.is_resolved);
      } else if (filterStatus === 'resolved') {
        filtered = filtered.filter(alert => alert.is_resolved);
      }
    }

    setFilteredAlerts(filtered);
  }, [alerts, searchTerm, filterSeverity, filterStatus]);

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
      case 'anomaly': return Activity;
      default: return AlertTriangle;
    }
  };

  const handleAcknowledge = async (alertId) => {
    try {
      // Use the correct API endpoint as per documentation
      await alertsAPI.acknowledgeIncident(alertId, 'Alert acknowledged from dashboard');
      
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, is_acknowledged: true }
          : alert
      ));
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      alert('Failed to acknowledge alert. Please try again.');
    }
  };

  const handleResolve = async (alertId, currentResolvedStatus) => {
    try {
      const newStatus = !currentResolvedStatus;
      const action = newStatus ? 'resolved' : 'reopened';
      
      // Use the toggle method which handles both resolve and unresolve
      await alertsAPI.toggleResolvedStatus(
        alertId, 
        currentResolvedStatus, 
        `Incident ${action} from dashboard`
      );
      
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, is_resolved: newStatus, resolved: newStatus }
          : alert
      ));
      
      alert(`Alert ${action} successfully!`);
    } catch (error) {
      console.error('Failed to update alert status:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Unknown error';
      alert(`Failed to update alert status: ${errorMsg}. Please try again.`);
    }
  };

  const handleGenerateEFIR = async (alert) => {
    try {
      // Match API.md format for E-FIR generation
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
      alert('E-FIR generated successfully! ID: ' + (efir.efir_id || efir.id));
    } catch (error) {
      console.error('Failed to generate E-FIR:', error);
      alert('Failed to generate E-FIR. Please try again.');
    }
  };

  const getStatusLabel = (alert) => {
    if (alert.is_resolved) return 'Resolved';
    if (alert.is_acknowledged) return 'Acknowledged';
    return 'Pending';
  };

  const getStatusColor = (alert) => {
    if (alert.is_resolved) return 'success';
    if (alert.is_acknowledged) return 'warning';
    return 'destructive';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Simple Header */}
      <div>
        <h1 className="text-3xl font-bold mb-6">Alerts Management</h1>
        
        {/* Compact Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 dark:bg-red-900 p-3 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Critical</p>
                  <p className="text-2xl font-bold text-red-600">
                    {alerts.filter(a => a.severity === 'critical' && !a.is_resolved).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg">
                  <Activity className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">High</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {alerts.filter(a => a.severity === 'high' && !a.is_resolved).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {alerts.filter(a => !a.is_acknowledged && !a.is_resolved).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {alerts.filter(a => a.is_resolved).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Simple Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="border border-input bg-background rounded-md px-4 py-2 text-sm min-w-[150px]"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-input bg-background rounded-md px-4 py-2 text-sm min-w-[150px]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Simplified Alerts Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Alerts</CardTitle>
          <Badge variant="outline">{filteredAlerts.length} alerts</Badge>
        </CardHeader>
        <CardContent>
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No alerts found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterSeverity !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No alerts generated yet'
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Tourist</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.map((alert) => {
                  const TypeIcon = getTypeIcon(alert.type || alert.alert_type);
                  
                  return (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <TypeIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="capitalize font-medium">{alert.type || alert.alert_type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {alert.tourist?.name || alert.tourist_name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityColor(alert.severity)} className="capitalize">
                          {alert.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {alert.description || alert.title || 'No description'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(alert)}>
                          {getStatusLabel(alert)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(alert.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAlert(alert);
                              setShowAlertModal(true);
                            }}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {!alert.is_acknowledged && !alert.is_resolved && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAcknowledge(alert.id)}
                              title="Acknowledge"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          
                          {alert.is_acknowledged && !alert.is_resolved && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResolve(alert.id)}
                              title="Resolve"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGenerateEFIR(alert)}
                            title="Generate E-FIR"
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Alert Detail Modal */}
      <AlertDetailModal
        alert={selectedAlert}
        isOpen={showAlertModal}
        onClose={() => {
          setShowAlertModal(false);
          setSelectedAlert(null);
        }}
        onAcknowledge={handleAcknowledge}
        onResolve={(alertId) => handleResolve(alertId, selectedAlert?.is_resolved || selectedAlert?.resolved)}
        onGenerateEFIR={handleGenerateEFIR}
      />
    </div>
  );
};

export default Alerts;