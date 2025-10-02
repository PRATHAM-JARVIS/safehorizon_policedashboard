import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table.jsx';
import { alertsAPI, efirAPI } from '../api/services.js';
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

  const handleResolve = async (alertId) => {
    try {
      // Use the correct closeIncident endpoint with proper parameters (alert_id, resolution_notes)
      await alertsAPI.closeIncident(alertId, 'Incident resolved from dashboard');
      
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, is_resolved: true }
          : alert
      ));
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      alert('Failed to resolve alert. Please try again.');
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
      console.log('E-FIR generated:', efir);
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
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-background to-muted/30 -mx-6 px-6 py-6 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              Alerts Management
            </h1>
            <p className="text-lg text-muted-foreground mt-1">
              Monitor and manage real-time tourist safety alerts
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="text-lg px-4 py-2 border-2">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
              {filteredAlerts.filter(a => !a.is_resolved).length} Active
            </Badge>
          </div>
        </div>
      </div>

      {/* Enhanced Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 p-3 rounded-xl shadow-sm">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Critical</p>
                  <p className="text-2xl font-bold text-red-600">
                    {alerts.filter(a => a.severity === 'critical' && !a.is_resolved).length}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 p-3 rounded-xl shadow-sm">
                  <Activity className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">High</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {alerts.filter(a => a.severity === 'high' && !a.is_resolved).length}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 p-3 rounded-xl shadow-sm">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {alerts.filter(a => !a.is_acknowledged && !a.is_resolved).length}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-3 rounded-xl shadow-sm">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {alerts.filter(a => a.is_resolved).length}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-primary" />
            <span>Search & Filter Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search alerts by tourist, title, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 border-border/50 focus:border-primary transition-colors duration-200"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Severity</label>
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="border border-border/50 bg-background hover:bg-accent/50 rounded-lg px-4 py-3 text-sm font-medium focus:border-primary transition-colors duration-200 min-w-[140px]"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-border/50 bg-background hover:bg-accent/50 rounded-lg px-4 py-3 text-sm font-medium focus:border-primary transition-colors duration-200 min-w-[140px]"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          </div>
          {(searchTerm || filterSeverity !== 'all' || filterStatus !== 'all') && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{filteredAlerts.length}</span> of <span className="font-semibold text-foreground">{alerts.length}</span> alerts
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterSeverity('all');
                    setFilterStatus('all');
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Alerts Table */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Alert History</span>
            <Badge variant="outline" className="ml-auto">
              {filteredAlerts.length} alerts
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="bg-muted/50 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No alerts found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchTerm || filterSeverity !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your search or filter criteria to find relevant alerts'
                  : 'No alerts have been generated yet. All systems are operating normally.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alert Type</TableHead>
                    <TableHead>Tourist Information</TableHead>
                    <TableHead>Severity Level</TableHead>
                    <TableHead>Safety Score</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Current Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.map((alert) => {
                    const TypeIcon = getTypeIcon(alert.type);
                    const safetyScore = alert.tourist?.safety_score || alert.safety_score || 'N/A';
                    const riskLevel = alert.tourist?.risk_level || alert.risk_level || 'unknown';
                    const location = alert.location || {};
                    
                    return (
                      <TableRow key={alert.id} className="group">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${
                              alert.type === 'sos' ? 'bg-red-100 dark:bg-red-900' :
                              alert.type === 'geofence' ? 'bg-orange-100 dark:bg-orange-900' :
                              alert.type === 'anomaly' ? 'bg-purple-100 dark:bg-purple-900' :
                              alert.type === 'safety_drop' ? 'bg-yellow-100 dark:bg-yellow-900' :
                              'bg-blue-100 dark:bg-blue-900'
                            }`}>
                              <TypeIcon className={`w-4 h-4 ${
                                alert.type === 'sos' ? 'text-red-600' :
                                alert.type === 'geofence' ? 'text-orange-600' :
                                alert.type === 'anomaly' ? 'text-purple-600' :
                                alert.type === 'safety_drop' ? 'text-yellow-600' :
                                'text-blue-600'
                              }`} />
                            </div>
                            <span className="font-medium capitalize">{alert.type || alert.alert_type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-semibold text-foreground">{alert.tourist?.name || alert.tourist_name || 'Unknown Tourist'}</div>
                            <div className="text-sm text-muted-foreground font-mono">ID: {alert.tourist?.id || alert.tourist_id}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getSeverityColor(alert.severity)} className="capitalize font-medium">
                            {alert.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${
                              safetyScore === 'N/A' ? 'bg-gray-400' :
                              safetyScore >= 80 ? 'bg-green-500' :
                              safetyScore >= 60 ? 'bg-yellow-500' :
                              safetyScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                            }`} />
                            <span className="font-medium">
                              {safetyScore === 'N/A' ? 'N/A' : `${safetyScore}%`}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            riskLevel === 'critical' ? 'destructive' :
                            riskLevel === 'high' ? 'destructive' :
                            riskLevel === 'medium' ? 'warning' :
                            riskLevel === 'low' ? 'success' : 'secondary'
                          } className="capitalize">
                            {riskLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-sm space-y-1">
                            <div className="font-medium text-foreground line-clamp-1">{alert.title || `${alert.type} Alert`}</div>
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {alert.description || 'No additional details available'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(alert)} className="font-medium">
                            {getStatusLabel(alert)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm space-y-1">
                            {location.lat && location.lon ? (
                              <>
                                <div className="font-medium">{location.lat?.toFixed(4)}, {location.lon?.toFixed(4)}</div>
                                <div className="text-muted-foreground">{location.address || 'No address'}</div>
                              </>
                            ) : (
                              <div className="text-muted-foreground">Location unavailable</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm space-y-1">
                            <div className="font-medium">{new Date(alert.created_at).toLocaleDateString()}</div>
                            <div className="text-muted-foreground">{new Date(alert.created_at).toLocaleTimeString()}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedAlert(alert);
                                setShowAlertModal(true);
                              }}
                              title="View Details"
                              className="h-8 w-8 p-0 hover:bg-primary/10"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            
                            {!alert.is_acknowledged && !alert.is_resolved && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAcknowledge(alert.id)}
                                title="Acknowledge Alert"
                                className="h-8 w-8 p-0 hover:bg-yellow-100 hover:text-yellow-700 dark:hover:bg-yellow-900"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            
                            {alert.is_acknowledged && !alert.is_resolved && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResolve(alert.id)}
                                title="Resolve Alert"
                                className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleGenerateEFIR(alert)}
                              title="Generate E-FIR"
                              className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900"
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
            </div>
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
      />
    </div>
  );
};

export default Alerts;