import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Button } from '../components/ui/button.jsx';
import { useWebSocket } from '../hooks/useWebSocket.js';
import { touristAPI, alertsAPI } from '../api/services.js';
import { useAppStore } from '../store/appStore.js';
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

const Dashboard = () => {
  const [stats, setStats] = useState({
    activeTourists: 0,
    alertsToday: 0,
    sosCount: 0,
    tripsInProgress: 0,
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { openModal } = useAppStore();

  // WebSocket for real-time alerts
  const { lastMessage, readyState } = useWebSocket(
    `${import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000/ws'}/alerts/subscribe`,
    {
    onMessage: (alert) => {
      console.log('New alert received:', alert);
      setRecentAlerts(prev => [alert, ...prev.slice(0, 9)]);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        alertsToday: prev.alertsToday + 1,
        sosCount: alert.type === 'sos' ? prev.sosCount + 1 : prev.sosCount,
      }));
    }
  });

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      console.log('WebSocket message received:', lastMessage);
    }
  }, [lastMessage]);

  // Sample chart data
  const alertsChartData = [
    { name: 'Mon', alerts: 12, resolved: 10 },
    { name: 'Tue', alerts: 19, resolved: 16 },
    { name: 'Wed', alerts: 8, resolved: 8 },
    { name: 'Thu', alerts: 15, resolved: 13 },
    { name: 'Fri', alerts: 23, resolved: 20 },
    { name: 'Sat', alerts: 18, resolved: 15 },
    { name: 'Sun', alerts: 14, resolved: 12 },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch active tourists
        const tourists = await touristAPI.getActiveTourists();
        
        // Fetch recent alerts
        const alerts = await alertsAPI.getRecentAlerts({ limit: 10 });
        
        setStats({
          activeTourists: tourists.length,
          alertsToday: alerts.filter(alert => {
            const today = new Date();
            const alertDate = new Date(alert.created_at);
            return alertDate.toDateString() === today.toDateString();
          }).length,
          sosCount: alerts.filter(alert => alert.type === 'sos').length,
          tripsInProgress: tourists.filter(t => t.status === 'active').length,
        });
        
        setRecentAlerts(alerts);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ icon: Icon, title, value, description, color = "text-primary", loading = false }) => (
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
          <div className={`p-3 rounded-full bg-${color.includes('red') ? 'red' : color.includes('yellow') ? 'yellow' : 'primary'}/10`}>
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
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            readyState === 1 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
          }`}>
            <div className={`w-2 h-2 rounded-full ${readyState === 1 ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{readyState === 1 ? 'Live Updates' : 'Disconnected'}</span>
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
            <CardTitle>Live Alerts Feed</CardTitle>
            <Badge variant="outline">
              <Activity className="w-3 h-3 mr-1" />
              Real-time
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentAlerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No recent alerts</p>
                </div>
              ) : (
                recentAlerts.map((alert) => {
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
                            {alert.title || `${alert.type} Alert`}
                          </p>
                          <Badge variant={getSeverityColor(alert.severity)} className="text-xs">
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {alert.tourist_name || `Tourist ${alert.tourist_id}`}
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
                        onClick={() => openModal('alertDetail', alert)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })
              )}
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

export default Dashboard;