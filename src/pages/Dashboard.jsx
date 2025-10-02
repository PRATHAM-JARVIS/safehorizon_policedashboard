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
        
        // Fetch platform statistics using the new admin API
        let dashboardStats = null;
        try {
          dashboardStats = await adminAPI.getPlatformStats('24h');
          console.log('Platform stats fetched:', dashboardStats);
        } catch (statsErr) {
          console.warn('Platform stats endpoint not available, falling back to manual calculation:', statsErr);
        }

        // If platform stats available, use them directly
        if (dashboardStats && (dashboardStats.users || dashboardStats.activity || dashboardStats.safety)) {
          setStats({
            activeTourists: dashboardStats.users?.active_tourists || 0,
            alertsToday: dashboardStats.safety?.total_alerts || 0,
            sosCount: dashboardStats.safety?.sos_triggered || 0,
            tripsInProgress: dashboardStats.activity?.active_trips || 0,
          });

          // Enhanced chart data with proper structure
          if (dashboardStats.alert_trends) {
            const chartData = dashboardStats.alert_trends.map(trend => ({
              name: new Date(trend.date).toLocaleDateString('en-US', { weekday: 'short' }),
              alerts: trend.total || 0,
              resolved: trend.resolved || 0,
              sos: trend.sos || 0,
              geofence: trend.geofence || 0,
              anomaly: trend.anomaly || 0
            }));
            setAlertsChartData(chartData);
          }

          // Enhanced safety score distribution with risk levels
          if (dashboardStats.safety?.score_distribution) {
            const scoreData = Object.entries(dashboardStats.safety.score_distribution).map(([range, count]) => ({
              score: range,
              count: count,
              color: range.includes('90-100') ? '#10b981' : 
                     range.includes('80-89') ? '#22c55e' :
                     range.includes('70-79') ? '#84cc16' :
                     range.includes('60-69') ? '#eab308' :
                     range.includes('50-59') ? '#f59e0b' :
                     range.includes('40-49') ? '#ef4444' : '#dc2626'
            }));
            setSafetyScoreData(scoreData);
          }
        } else {
          // Enhanced fallback with better data handling
          // Fetch active tourists with safety scores and risk levels
          let tourists = [];
          try {
            const touristResponse = await touristAPI.getActiveTourists();
            
            tourists = Array.isArray(touristResponse) ? touristResponse : [];
            
            console.log(`Fetched tourists: ${tourists.length} items from API`);
            
            // Enrich tourist data with current location and safety info
            const enrichedTourists = await Promise.all(
              tourists.slice(0, 50).map(async (tourist) => { // Limit to avoid too many requests
                try {
                  const locationData = await touristAPI.getCurrentLocation(tourist.id);
                  return {
                    ...tourist,
                    current_location: locationData.location,
                    safety_score: locationData.safety_score || tourist.safety_score || 75,
                    risk_level: locationData.zone_status?.risk_level || 'low',
                    last_seen: locationData.last_seen || tourist.last_seen,
                    status: locationData.location?.status || 'unknown'
                  };
                } catch (err) {
                  console.warn(`Failed to get location for tourist ${tourist.id}:`, err);
                  return {
                    ...tourist,
                    safety_score: tourist.safety_score || 75,
                    risk_level: 'unknown',
                    status: 'unknown'
                  };
                }
              })
            );
            
            setTourists(enrichedTourists);
          } catch (err) {
            console.error('Failed to fetch tourists:', err);
            tourists = [];
          }
          
          // Fetch comprehensive alerts with enhanced filtering
          let alerts = [];
          let alertsForChart = [];
          try {
            // Get alerts with severity and type information
            const alertResponse = await alertsAPI.getRecentAlerts({ 
              hours: 168, // Last 7 days for charts
              limit: 500,
              include_resolved: true 
            });
            alertsForChart = Array.isArray(alertResponse) ? alertResponse : [];
            console.log('Fetched enhanced alerts:', alertsForChart.length);
            
            // Filter for today's alerts with improved criteria
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            alerts = alertsForChart.filter(alert => {
              const alertTime = new Date(alert.created_at || alert.timestamp);
              return alertTime >= todayStart;
            });
          } catch (err) {
            console.error('Failed to fetch alerts:', err);
            alerts = [];
            alertsForChart = [];
          }
          
          // Enhanced chart data calculation with proper alert types
          const chartData = calculateAlertsChartData(alertsForChart);
          setAlertsChartData(chartData);
          
          // Enhanced safety score distribution from real tourist data
          const scoreData = calculateSafetyScoreData(tourists);
          setSafetyScoreData(scoreData);
          
          // Enhanced stats calculation with real-time WebSocket data
          const enhancedStats = {
            activeTourists: tourists.length + (alertStats.activeTourists || 0),
            alertsToday: alerts.length + (alertStats.alertsToday || 0),
            sosCount: alerts.filter(alert => 
              alert.type === 'sos' || 
              alert.type === 'sos_alert' || 
              alert.alert_type === 'sos'
            ).length + (alertStats.sosCount || 0),
            tripsInProgress: tourists.filter(t => 
              t.active_trip || 
              t.status === 'active' || 
              t.current_trip?.status === 'active'
            ).length
          };
          
          setStats(enhancedStats);
          setRecentAlerts(alerts.slice(0, 20)); // Show latest 20 alerts
        }
        
        // Fetch zones for map display with enhanced data
        let zonesData = [];
        try {
          const zonesResponse = await zonesAPI.manageZones();
          zonesData = Array.isArray(zonesResponse) ? zonesResponse : (zonesResponse.zones || []);
          console.log('Fetched zones for map:', zonesData.length);
        } catch (err) {
          console.error('Failed to fetch zones:', err);
          zonesData = [];
        }
        
        setZones(zonesData);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setError(error.message || 'Failed to connect to backend API');
        // Graceful fallback with WebSocket data only
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
    
    // Enhanced refresh interval with better error handling
    const refreshInterval = setInterval(() => {
      if (!loading) {
        fetchDashboardData();
      }
    }, 30000);
    
    return () => clearInterval(refreshInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // alertStats changes are handled within the effect

  const StatCard = (props) => {
    const { icon: Icon, title, value, description, color = "text-primary" } = props;
    
    return (
      <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-transparent hover:border-l-primary/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border shadow-sm`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
              </div>
              <div className="space-y-1">
                <p className={`text-3xl font-bold tracking-tight ${color}`}>
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    typeof value === 'number' ? value.toLocaleString() : value
                  )}
                </p>
                {description && (
                  <p className="text-sm text-muted-foreground">{description}</p>
                )}
              </div>
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
    <div className="space-y-8">
      {/* Enhanced Header with WebSocket Status */}
      <div className="bg-gradient-to-r from-background to-muted/30 -mx-6 px-6 py-6 rounded-lg border">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Real-time monitoring of tourist safety and system alerts
            </p>
          </div>
          <div className="flex items-center gap-6">
            {/* WebSocket Connection Status with improved design */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-background/80 border shadow-sm">
              <div className={`w-2.5 h-2.5 rounded-full ${
                isConnected ? 'bg-green-500 shadow-green-500/50 shadow-lg' : 
                isConnecting ? 'bg-yellow-500 animate-pulse shadow-yellow-500/50 shadow-lg' : 
                'bg-red-500 shadow-red-500/50 shadow-lg'
              }`} />
              <span className="text-sm font-medium">
                {isConnected ? 'Live Connection' : 
                 isConnecting ? 'Connecting...' : 
                 `Offline ${connectionAttempts > 0 ? `(${connectionAttempts} attempts)` : ''}`}
              </span>
              {wsError && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={forceReconnect}
                  className="text-xs h-6 px-2"
                >
                  Retry
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Error State */}
      {error && !loading && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 rounded-full bg-destructive/10">
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-destructive">Dashboard Connection Error</h3>
                <p className="text-muted-foreground max-w-md mx-auto">{error}</p>
              </div>
              <Button onClick={() => window.location.reload()} className="mt-4">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Connection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="text-muted-foreground font-medium">Loading dashboard data...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Stats Cards */}
      {!loading && !error && (
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
            color="text-amber-600"
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
      )}

      {/* Enhanced Charts and Alerts Section */}
      {!loading && !error && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Alerts Chart */}
          <Card className="xl:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-primary" />
                <span>Weekly Alert Summary</span>
              </CardTitle>
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
      )}

      {/* Enhanced Alerts Feed and Map Section */}
      {!loading && !error && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Live Alerts Feed */}
          <Card className="xl:col-span-1">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span>Live Alerts Feed</span>
                </CardTitle>
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

        {/* Enhanced Map Overview */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span>Live Map Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MapComponent
              center={[28.6139, 77.2090]}
              zoom={11}
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
      </div>
      )}

      {/* Enhanced Quick Actions */}
      {!loading && !error && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-primary" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="h-20 flex flex-col space-y-2 transition-all duration-200 hover:scale-105" variant="outline">
                <Users className="w-6 h-6 text-blue-600" />
                <span className="font-medium">View All Tourists</span>
              </Button>
              <Button className="h-20 flex flex-col space-y-2 transition-all duration-200 hover:scale-105" variant="outline">
                <MapPin className="w-6 h-6 text-green-600" />
                <span className="font-medium">Manage Zones</span>
              </Button>
              <Button className="h-20 flex flex-col space-y-2 transition-all duration-200 hover:scale-105" variant="outline">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
                <span className="font-medium">Review Alerts</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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