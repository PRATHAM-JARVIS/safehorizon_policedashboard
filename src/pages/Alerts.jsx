import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table.jsx';
import { alertsAPI, efirAPI } from '../api/services.js';
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
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const response = await alertsAPI.getRecentAlerts({ hours: 168 });
        const alertsList = Array.isArray(response) ? response : [];
        setAlerts(alertsList);
        setFilteredAlerts(alertsList);
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
        setAlerts([]);
        setFilteredAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    const refreshInterval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    let filtered = alerts;

    if (searchTerm) {
      filtered = filtered.filter(alert =>
        alert.tourist_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterSeverity !== 'all') {
      filtered = filtered.filter(alert => alert.severity === filterSeverity);
    }

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
      await alertsAPI.acknowledgeIncident(alertId, 'Alert acknowledged by officer');
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, is_acknowledged: true, acknowledged_at: new Date().toISOString() }
          : alert
      ));
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const handleResolve = async (alertId) => {
    try {
      await alertsAPI.closeIncident(alertId, 'Incident resolved by officer');
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, is_resolved: true, resolved_at: new Date().toISOString() }
          : alert
      ));
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const handleGenerateEFIR = async (alertId) => {
    try {
      await efirAPI.generateEFIR(alertId, 'E-FIR generated from alert');
      alert('E-FIR generated successfully!');
    } catch (error) {
      console.error('Failed to generate E-FIR:', error);
      alert('Failed to generate E-FIR. Please try again.');
    }
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
      {/* Simple Professional Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Alert Management</h1>
        <p className="text-gray-600 mt-1">Monitor and respond to tourist safety alerts</p>
      </div>

      {/* Alert Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-red-50 p-2 rounded">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Critical</p>
                <p className="text-xl font-semibold text-red-600">
                  {alerts.filter(a => a.severity === 'critical' && !a.is_resolved).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-50 p-2 rounded">
                <Activity className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">High</p>
                <p className="text-xl font-semibold text-orange-600">
                  {alerts.filter(a => a.severity === 'high' && !a.is_resolved).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-50 p-2 rounded">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Pending</p>
                <p className="text-xl font-semibold text-blue-600">
                  {alerts.filter(a => !a.is_resolved).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-50 p-2 rounded">
                <Check className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Resolved</p>
                <p className="text-xl font-semibold text-green-600">
                  {alerts.filter(a => a.is_resolved).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border border-gray-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
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
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
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
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Alerts ({filteredAlerts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No alerts found</h3>
              <p className="mt-1 text-sm text-gray-500">No alerts match your current filters.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tourist</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.map((alert) => {
                  const TypeIcon = getTypeIcon(alert.type);
                  return (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{alert.tourist_name || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{alert.tourist_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <TypeIcon className="h-4 w-4" />
                          <span className="capitalize">{alert.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {alert.location || 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {alert.is_resolved ? (
                          <Badge variant="success">Resolved</Badge>
                        ) : alert.is_acknowledged ? (
                          <Badge variant="warning">Acknowledged</Badge>
                        ) : (
                          <Badge variant="destructive">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(alert.created_at || alert.timestamp).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/alerts/${alert.id}`)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          {!alert.is_acknowledged && !alert.is_resolved && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAcknowledge(alert.id)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          {alert.is_acknowledged && !alert.is_resolved && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResolve(alert.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGenerateEFIR(alert.id)}
                          >
                            <FileText className="h-3 w-3" />
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