import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table.jsx';
import { alertsAPI, efirAPI } from '../api/services.js';
import { useAppStore } from '../store/appStore.js';
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
  const { openModal } = useAppStore();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const data = await alertsAPI.getRecentAlerts({ hours: 168 }); // Last 7 days
        setAlerts(data);
        setFilteredAlerts(data);
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
        // Show error state instead of mock data
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
      await alertsAPI.acknowledgeIncident(alertId, 'Alert acknowledged from dashboard');
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, is_acknowledged: true }
          : alert
      ));
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const handleResolve = async (alertId) => {
    try {
      await alertsAPI.closeIncident(alertId, 'Incident resolved from dashboard');
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, is_resolved: true }
          : alert
      ));
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const handleGenerateEFIR = async (alert) => {
    try {
      const efir = await efirAPI.generateEFIR(
        alert.id,
        `Alert: ${alert.title || alert.type} - ${alert.description}`,
        alert.location ? `${alert.location.lat}, ${alert.location.lon}` : 'Unknown location'
      );
      console.log('E-FIR generated:', efir);
      // You could show a success message or open E-FIR detail modal
    } catch (error) {
      console.error('Failed to generate E-FIR:', error);
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <AlertTriangle className="w-8 h-8" />
            <span>Alert Management</span>
          </h1>
          <p className="text-muted-foreground">
            Monitor, acknowledge, and resolve safety alerts
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-lg px-3 py-1">
            {filteredAlerts.filter(a => !a.is_resolved).length} Active
          </Badge>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-red-100 dark:bg-red-900 p-2 rounded-full">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-lg font-bold text-red-600">
                  {alerts.filter(a => a.severity === 'critical' && !a.is_resolved).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full">
                <Activity className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">High</p>
                <p className="text-lg font-bold text-orange-600">
                  {alerts.filter(a => a.severity === 'high' && !a.is_resolved).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-full">
                <Clock className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-lg font-bold text-yellow-600">
                  {alerts.filter(a => !a.is_acknowledged && !a.is_resolved).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                <Check className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-lg font-bold text-green-600">
                  {alerts.filter(a => a.is_resolved).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search alerts by tourist, title, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="border border-input bg-transparent rounded-md px-3 py-2 text-sm"
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
                className="border border-input bg-transparent rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Alert History</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No alerts found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterSeverity !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'No alerts have been generated yet'
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
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.map((alert) => {
                  const TypeIcon = getTypeIcon(alert.type);
                  return (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <TypeIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="capitalize">{alert.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{alert.tourist_name || 'Unknown'}</div>
                          <div className="text-sm text-muted-foreground">ID: {alert.tourist_id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityColor(alert.severity)} className="capitalize">
                          {alert.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="font-medium">{alert.title || `${alert.type} Alert`}</div>
                          <div className="text-sm text-muted-foreground truncate">
                            {alert.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(alert)}>
                          {getStatusLabel(alert)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDateTime(alert.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openModal('alertDetail', alert)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {!alert.is_acknowledged && !alert.is_resolved && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAcknowledge(alert.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          
                          {alert.is_acknowledged && !alert.is_resolved && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResolve(alert.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGenerateEFIR(alert)}
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
    </div>
  );
};

export default Alerts;