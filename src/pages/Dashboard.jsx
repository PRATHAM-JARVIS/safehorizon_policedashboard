import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Button } from '../components/ui/button.jsx';
import { useWebSocketContext } from '../contexts/WebSocketContext.jsx';
import { touristAPI, alertsAPI, zonesAPI, adminAPI } from '../api/services.js';
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
  Eye,
  RefreshCw
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
  const [error, setError] = useState(null);
  const { openModal } = useAppStore();

  // Use WebSocket context
  const {
    lastMessage,
    wsError,
    connectionAttempts,
    isConnected,
    isConnecting,
    connectWebSocket,
    forceReconnect,
    realtimeAlerts,
    alertStats
  } = useWebSocketContext();

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      console.log('WebSocket message received:', lastMessage);
    }
  }, [lastMessage]);

  // Helper function to calculate alerts chart data
  const calculateAlertsChartData = (alerts) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const chartData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      
      const dayAlerts = alerts.filter(alert => {
        const alertDate = new Date(alert.created_at || alert.timestamp);
        return alertDate.toDateString() === date.toDateString();
      });
      
      chartData.push({
        name: dayName,
        alerts: dayAlerts.length,
        resolved: dayAlerts.filter(a => a.is_resolved).length,
        sos: dayAlerts.filter(a => a.type === 'sos' || a.type === 'sos_alert').length,
        geofence: dayAlerts.filter(a => a.type === 'geofence' || a.type === 'geofence_violation').length,
        anomaly: dayAlerts.filter(a => a.type === 'anomaly' || a.type === 'anomaly_detected').length
      });
    }
    
    return chartData;
  };

  // Helper function to calculate safety score distribution
  const calculateSafetyScoreData = (tourists) => {
    const distribution = [
      { score: '90-100', count: 0, color: '#10b981' },
      { score: '80-89', count: 0, color: '#22c55e' },
      { score: '70-79', count: 0, color: '#84cc16' },
      { score: '60-69', count: 0, color: '#eab308' },
      { score: '50-59', count: 0, color: '#f59e0b' },
      { score: '40-49', count: 0, color: '#ef4444' },
      { score: '<40', count: 0, color: '#dc2626' },
    ];
    
    tourists.forEach(tourist => {
      const score = tourist.safety_score || 0;
      if (score >= 90) distribution[0].count++;
      else if (score >= 80) distribution[1].count++;
      else if (score >= 70) distribution[2].count++;
      else if (score >= 60) distribution[3].count++;
      else if (score >= 50) distribution[4].count++;
      else if (score >= 40) distribution[5].count++;
      else distribution[6].count++;
    });
    
    return distribution.filter(d => d.count > 0); // Only show non-zero categories
  };

  // Chart data state - calculated from real API data
  const [alertsChartData, setAlertsChartData] = useState([]);
  const [safetyScoreData, setSafetyScoreData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard statistics from dedicated endpoint
        let dashboardStats = null;
        try {
          dashboardStats = await adminAPI.getDashboardStats('24h');
          console.log('Dashboard stats fetched:', dashboardStats);
        } catch (statsErr) {
          console.warn('Dashboard stats endpoint not available, falling back to manual calculation:', statsErr);
        }

        // If dashboard stats available, use them directly
        if (dashboardStats && (dashboardStats.tourists || dashboardStats.alerts)) {
          setStats({
            activeTourists: dashboardStats.tourists?.active_now || 0,
            alertsToday: dashboardStats.alerts?.total || 0,
            sosCount: dashboardStats.alerts?.by_type?.sos || 0,
            tripsInProgress: dashboardStats.incidents?.open || 0,
          });

          // Use trends data if available
          if (dashboardStats.alert_trends) {
            const chartData = dashboardStats.alert_trends.map(trend => ({
              name: new Date(trend.hour).toLocaleDateString('en-US', { weekday: 'short' }),
              alerts: trend.count,
              resolved: 0, // Not provided by API
              sos: 0,
              geofence: 0,
              anomaly: 0
            }));
            setAlertsChartData(chartData);
          }

          // Use risk distribution if available
          if (dashboardStats.risk_distribution) {
            const scoreData = Object.entries(dashboardStats.risk_distribution).map(([key, value]) => ({
              score: key,
              count: value,
              color: key === 'critical' ? '#dc2626' : key === 'high' ? '#ef4444' : key === 'medium' ? '#f59e0b' : '#10b981'
            }));
            setSafetyScoreData(scoreData);
          }
        } else {
          // Fallback to manual data fetching
          // Fetch active tourists with error handling
          let tourists = [];
          try {
            const touristResponse = await touristAPI.getActiveTourists();
            const touristData = touristResponse.tourists || touristResponse.data || touristResponse || [];
            tourists = Array.isArray(touristData) ? touristData : [];
            console.log('Fetched tourists:', tourists.length);
          } catch (err) {
            console.error('Failed to fetch tourists:', err);
            tourists = [];
          }
          
          // Fetch recent alerts (last 7 days for charts) with error handling
          let alerts = [];
          let alertsForChart = [];
          try {
            // Fetch last 7 days for chart data
            const alertResponse = await alertsAPI.getRecentAlerts({ hours_back: 168 });
            const alertData = alertResponse.alerts || alertResponse.data || alertResponse || [];
            alertsForChart = Array.isArray(alertData) ? alertData : [];
            console.log('Fetched alerts for chart:', alertsForChart.length);
            
            // Get last 24 hours for recent alerts display
            alerts = alertsForChart.filter(alert => {
              const alertTime = new Date(alert.created_at || alert.timestamp);
              const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
              return alertTime >= dayAgo;
            });
          } catch (err) {
            console.error('Failed to fetch alerts:', err);
            alerts = [];
            alertsForChart = [];
          }
          
          // Calculate chart data from real alerts
          const chartData = calculateAlertsChartData(alertsForChart);
          setAlertsChartData(chartData);
          
          // Calculate safety score distribution
          const scoreData = calculateSafetyScoreData(tourists);
          setSafetyScoreData(scoreData);
          
          // Merge API stats with WebSocket real-time stats
          setStats({
            activeTourists: alertStats.activeTourists || tourists.length || 0,
            alertsToday: (alerts.filter(alert => {
              const today = new Date();
              const alertDate = new Date(alert.created_at || alert.timestamp);
              return alertDate.toDateString() === today.toDateString();
            }).length) + (alertStats.alertsToday || 0),
            sosCount: (alerts.filter(alert => alert.type === 'sos' || alert.type === 'sos_alert').length) + (alertStats.sosCount || 0),
            tripsInProgress: tourists.filter(t => t.active_trip || t.status === 'active').length || 0,
          });
          
          setRecentAlerts(alerts);
          setTourists(tourists);
        }
        
        // Fetch zones with error handling
        let zonesData = [];
        try {
          const zonesResponse = await zonesAPI.listZones();
          const zones = zonesResponse.zones || zonesResponse.data || zonesResponse || [];
          zonesData = Array.isArray(zones) ? zones : [];
          console.log('Fetched zones:', zonesData.length);
        } catch (err) {
          console.error('Failed to fetch zones:', err);
          zonesData = [];
        }
        
        setZones(zonesData);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setError(error.message || 'Failed to connect to backend API');
        // Show user-friendly error message
        setStats({
          activeTourists: alertStats.activeTourists || 0,
          alertsToday: alertStats.alertsToday || 0,
          sosCount: alertStats.sosCount || 0,
          tripsInProgress: 0,
        });
        setRecentAlerts([]);
        setTourists([]);
        setZones([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Set up periodic refresh for dashboard data (every 30 seconds)
    const refreshInterval = setInterval(fetchDashboardData, 30000);
    
    return () => clearInterval(refreshInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // alertStats changes are handled within the effect

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
      {/* Header with WebSocket Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of tourist safety and system alerts
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* WebSocket Connection Status */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500' : 
              isConnecting ? 'bg-yellow-500 animate-pulse' : 
              'bg-red-500'
            }`} />
            <span className="text-sm text-muted-foreground">
              {isConnected ? 'Connected' : 
               isConnecting ? 'Connecting...' : 
               `Disconnected ${connectionAttempts > 0 ? `(${connectionAttempts} attempts)` : ''}`}
            </span>
            {wsError && (
              <Button
                variant="ghost"
                size="sm"
                onClick={forceReconnect}
                className="text-xs"
              >
                Retry
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 mx-auto text-destructive mb-4" />
          <h3 className="text-lg font-medium mb-2">Dashboard Connection Error</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

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
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={isConnected ? 'border-green-500 text-green-600' : 'border-red-500 text-red-600'}>
                <Activity className={`w-3 h-3 mr-1 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
                {isConnected ? 'Live' : 'Offline'}
              </Badge>
              {connectionAttempts > 0 && (
                <Badge variant="secondary" className="text-xs">
                  Retry {connectionAttempts}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {/* Show real-time alerts first, then recent alerts */}
              {[...realtimeAlerts, ...recentAlerts.filter(alert => !realtimeAlerts.find(rt => rt.id === alert.id))].length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No recent alerts</p>
                  {!isConnected && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={connectWebSocket}
                      className="mt-2"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reconnect
                    </Button>
                  )}
                </div>
              ) : (
                [...realtimeAlerts, ...recentAlerts.filter(alert => !realtimeAlerts.find(rt => rt.id === alert.id))].slice(0, 10).map((alert, index) => {
                  const SeverityIcon = getSeverityIcon(alert.type);
                  const isRealtime = index < realtimeAlerts.length;
                  return (
                    <div
                      key={`${alert.id}-${index}`}
                      className={`flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors ${
                        isRealtime ? 'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20' : 'border-border'
                      }`}
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
                          {isRealtime && (
                            <Badge variant="outline" className="text-xs border-blue-500 text-blue-600">
                              Live
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {alert.tourist_name || `Tourist ${alert.tourist_id}`}
                        </p>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(alert.created_at || alert.timestamp).toLocaleTimeString()}
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