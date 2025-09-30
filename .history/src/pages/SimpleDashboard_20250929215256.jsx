import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Button } from '../components/ui/button.jsx';
import {
  Users,
  AlertTriangle,
  Phone,
  Route,
  Activity,
  MapPin,
  Clock,
  Eye
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SimpleDashboard = () => {
  const [loading, setLoading] = useState(true);

  // Simple initialization - no external API calls that could fail
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Mock data that always works
  const stats = {
    activeTourists: 15,
    alertsToday: 3,
    sosCount: 1,
    tripsInProgress: 8,
  };

  const recentAlerts = [
    {
      id: 1,
      type: 'geofence',
      severity: 'medium',
      title: 'Geofence Violation',
      tourist_id: 'T001',
      tourist_name: 'John Doe',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      type: 'sos',
      severity: 'critical',
      title: 'Emergency Alert',
      tourist_id: 'T002',
      tourist_name: 'Jane Smith',
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    }
  ];

  const alertsChartData = [
    { name: 'Mon', alerts: 12, resolved: 10 },
    { name: 'Tue', alerts: 19, resolved: 16 },
    { name: 'Wed', alerts: 8, resolved: 8 },
    { name: 'Thu', alerts: 15, resolved: 13 },
    { name: 'Fri', alerts: 23, resolved: 20 },
    { name: 'Sat', alerts: 18, resolved: 15 },
    { name: 'Sun', alerts: 14, resolved: 12 },
  ];

  const StatCard = ({ icon: Icon, title, value, description, color = "text-primary" }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{loading ? '...' : value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20">
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'critical';
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const getSeverityIcon = (type) => {
    switch (type) {
      case 'sos': return Phone;
      case 'geofence': return MapPin;
      case 'anomaly': return Activity;
      default: return AlertTriangle;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of tourist safety and system alerts
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>System Active</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Active Tourists"
          value={stats.activeTourists}
          description="Currently being tracked"
          color="text-blue-600"
        />
        <StatCard
          icon={AlertTriangle}
          title="Alerts Today"
          value={stats.alertsToday}
          description="Require attention"
          color="text-yellow-600"
        />
        <StatCard
          icon={Phone}
          title="SOS Alerts"
          value={stats.sosCount}
          description="Emergency situations"
          color="text-red-600"
        />
        <StatCard
          icon={Route}
          title="Active Trips"
          value={stats.tripsInProgress}
          description="Trips in progress"
          color="text-green-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Alert Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={alertsChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="alerts" fill="#3b82f6" name="Total Alerts" />
                <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Live Alerts Feed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Alerts</CardTitle>
            <Badge variant="outline">
              <Activity className="w-3 h-3 mr-1" />
              Demo Mode
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentAlerts.map((alert) => {
                const SeverityIcon = getSeverityIcon(alert.type);
                return (
                  <div
                    key={alert.id}
                    className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <SeverityIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium truncate">
                          {alert.title}
                        </p>
                        <Badge variant={getSeverityColor(alert.severity)} className="text-xs">
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {alert.tourist_name}
                      </p>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(alert.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => console.log('Alert details:', alert)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex flex-col space-y-2" variant="outline">
              <Users className="w-6 h-6" />
              <span>View All Tourists</span>
            </Button>
            <Button className="h-20 flex flex-col space-y-2" variant="outline">
              <MapPin className="w-6 h-6" />
              <span>Manage Zones</span>
            </Button>
            <Button className="h-20 flex flex-col space-y-2" variant="outline">
              <AlertTriangle className="w-6 h-6" />
              <span>Review Alerts</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleDashboard;