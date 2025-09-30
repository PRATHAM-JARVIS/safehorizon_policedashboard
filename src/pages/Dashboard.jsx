import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Button } from '../components/ui/button.jsx';
import { useWebSocket } from '../hooks/useWebSocket.js';
import { touristAPI, alertsAPI, zonesAPI } from '../api/services.js';
import { useAppStore } from '../store/appStore.js';
import MapComponent from '../components/ui/Map.jsx';
import AlertDetailModal from '../components/ui/AlertDetailModal.jsx';
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    activeTourists: 0,
    alertsToday: 0,
    sosCount: 0,
    tripsInProgress: 0,
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [tourists, setTourists] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
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

  // Enhanced chart data with more realistic metrics
  const alertsChartData = [
    { name: 'Mon', alerts: 12, resolved: 10, sos: 2, geofence: 5, anomaly: 5 },
    { name: 'Tue', alerts: 19, resolved: 16, sos: 1, geofence: 8, anomaly: 10 },
    { name: 'Wed', alerts: 8, resolved: 8, sos: 0, geofence: 3, anomaly: 5 },
    { name: 'Thu', alerts: 15, resolved: 13, sos: 3, geofence: 6, anomaly: 6 },
    { name: 'Fri', alerts: 23, resolved: 20, sos: 2, geofence: 12, anomaly: 9 },
    { name: 'Sat', alerts: 18, resolved: 15, sos: 1, geofence: 9, anomaly: 8 },
    { name: 'Sun', alerts: 14, resolved: 12, sos: 1, geofence: 7, anomaly: 6 },
  ];

  const safetyScoreData = [
    { score: '90-100', count: 45, color: '#10b981' },
    { score: '80-89', count: 32, color: '#22c55e' },
    { score: '70-79', count: 28, color: '#84cc16' },
    { score: '60-69', count: 21, color: '#eab308' },
    { score: '50-59', count: 18, color: '#f59e0b' },
    { score: '40-49', count: 12, color: '#ef4444' },
    { score: '<40', count: 8, color: '#dc2626' },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch active tourists
        const tourists = await touristAPI.getActiveTourists();
        
        // Fetch recent alerts
        const alerts = await alertsAPI.getRecentAlerts({ limit: 10 });
        
        // Fetch zones
        const zonesData = await zonesAPI.listZones();
        
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
        setTourists(tourists);
        setZones(zonesData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Set mock data when API fails
        setStats({
          activeTourists: 156,
          alertsToday: 23,
          sosCount: 3,
          tripsInProgress: 89,
        });
        
        const mockAlerts = [
          {
            id: 1,
            tourist_name: 'John Doe',
            type: 'sos',
            severity: 'critical',
            title: 'Emergency SOS Alert',
            description: 'Tourist triggered emergency SOS',
            location: 'Downtown District',
            created_at: new Date().toISOString(),
            is_acknowledged: false,
            is_resolved: false
          },
          {
            id: 2,
            tourist_name: 'Jane Smith',
            type: 'geofence',
            severity: 'high',
            title: 'Restricted Zone Entry',
            description: 'Tourist entered restricted area',
            location: 'Government Quarter',
            created_at: new Date(Date.now() - 300000).toISOString(),
            is_acknowledged: true,
            is_resolved: false
          },
          {
            id: 3,
            tourist_name: 'Mike Johnson',
            type: 'anomaly',
            severity: 'medium',
            title: 'Unusual Activity',
            description: 'Anomalous movement pattern detected',
            location: 'Tourist District',
            created_at: new Date(Date.now() - 600000).toISOString(),
            is_acknowledged: true,
            is_resolved: true
          }
        ];
        setRecentAlerts(mockAlerts);
        setTourists([
          {
            id: '1',
            name: 'John Doe',
            current_location: { lat: 35.6762, lon: 139.6503, address: 'Shibuya, Tokyo' },
            safety_score: 85,
            last_seen: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Jane Smith',
            current_location: { lat: 35.6763, lon: 139.6504, address: 'Harajuku, Tokyo' },
            safety_score: 45,
            last_seen: new Date().toISOString()
          },
          {
            id: '3',
            name: 'Mike Johnson',
            current_location: { lat: 35.6764, lon: 139.6505, address: 'Akihabara, Tokyo' },
            safety_score: 92,
            last_seen: new Date().toISOString()
          }
        ]);
        setZones([
          {
            id: '1',
            name: 'Government District',
            zone_type: 'restricted',
            description: 'Government buildings and restricted areas',
            coordinates: [
              [35.6750, 139.6490],
              [35.6760, 139.6490],
              [35.6760, 139.6510],
              [35.6750, 139.6510]
            ]
          },
          {
            id: '2',
            name: 'Tourist Safe Zone',
            zone_type: 'safe',
            description: 'Well-monitored tourist areas',
            coordinates: [
              [35.6770, 139.6520],
              [35.6780, 139.6520],
              [35.6780, 139.6540],
              [35.6770, 139.6540]
            ]
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = (props) => {
    const { icon: Icon, title, value, description, color = "text-primary" } = props;
    
    return (
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts Chart */}
        <Card className="lg:col-span-2">
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

        {/* Safety Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Safety Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={safetyScoreData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ score, count }) => `${score}: ${count}`}
                >
                  {safetyScoreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                        onClick={() => {
                          setSelectedAlert(alert);
                          setShowAlertModal(true);
                        }}
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

      {/* Map Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Live Map Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MapComponent
            center={[35.6762, 139.6503]}
            zoom={13}
            tourists={tourists}
            alerts={recentAlerts.filter(alert => alert.coordinates)}
            zones={zones}
            height="400px"
            onTouristClick={(tourist) => openModal('touristDetail', tourist)}
            onAlertClick={(alert) => {
              setSelectedAlert(alert);
              setShowAlertModal(true);
            }}
            onZoneClick={(zone) => console.log('Zone clicked:', zone)}
          />
        </CardContent>
      </Card>

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

export default Dashboard;