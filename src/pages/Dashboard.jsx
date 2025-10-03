import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Button } from '../components/ui/button.jsx';
import { useWebSocketContext } from '../contexts/WebSocketContext.jsx';
import { touristAPI, alertsAPI, zonesAPI, adminAPI, efirAPI } from '../api/services.js';
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
  const [showHeatmap, setShowHeatmap] = useState(false);
  const { openModal } = useAppStore();

  // Use WebSocket context
  const {
    realtimeAlerts,
    alertStats
  } = useWebSocketContext();



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
        } catch {
          // Fallback to manual stats - silently ignore errors
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
                } catch {
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
          setRecentAlerts(alertsForChart); // Show all alerts
        }
        
        // Fetch zones for map display with enhanced data
        let zonesData = [];
        try {
          const zonesResponse = await zonesAPI.manageZones();
          zonesData = Array.isArray(zonesResponse) ? zonesResponse : (zonesResponse.zones || []);
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

  // Real-time alert updates from WebSocket
  useEffect(() => {
    console.log('📡 Dashboard: WebSocket realtimeAlerts updated', realtimeAlerts.length);
    
    if (realtimeAlerts.length > 0) {
      // Merge WebSocket alerts with existing alerts (avoid duplicates)
      setRecentAlerts(prev => {
        const existingIds = new Set(prev.map(a => a.id || a.alert_id));
        const newAlerts = realtimeAlerts.filter(alert => 
          !existingIds.has(alert.id || alert.alert_id)
        );
        
        if (newAlerts.length > 0) {
          console.log('✅ Dashboard: Adding', newAlerts.length, 'new alerts to list');
          return [...newAlerts, ...prev];
        }
        return prev;
      });
      
      // Update stats with WebSocket data
      setStats(prev => ({
        ...prev,
        alertsToday: prev.alertsToday + realtimeAlerts.filter(a => {
          const alertTime = new Date(a.timestamp || a.created_at);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return alertTime >= today;
        }).length,
        sosCount: prev.sosCount + realtimeAlerts.filter(a => 
          a.type === 'sos' || a.type === 'sos_alert'
        ).length
      }));
    }
  }, [realtimeAlerts]);

  const StatCard = (props) => {
    const { icon: Icon, title, value, color = "text-primary" } = props;
    
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`h-5 w-5 ${color}`} />
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
              </div>
              <p className={`text-2xl font-bold ${color}`}>
                {loading ? '...' : typeof value === 'number' ? value.toLocaleString() : value}
              </p>
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
      {/* Simple Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Real-time monitoring of tourist safety</p>
      </div>

      {/* Error State */}
      {error && !loading && (
        <Card className="border-destructive/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertTriangle className="w-6 h-6" />
              <div>
                <h3 className="font-semibold">Connection Error</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-12">
            <div className="flex items-center justify-center space-y-4">
              <Activity className="w-8 h-8 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            title="Active Tourists"
            value={stats.activeTourists}
            color="text-blue-600"
          />
          <StatCard
            icon={AlertTriangle}
            title="Alerts Today"
            value={stats.alertsToday}
            color="text-amber-600"
          />
          <StatCard
            icon={Phone}
            title="SOS Alerts"
            value={stats.sosCount}
            color="text-red-600"
          />
          <StatCard
            icon={Route}
            title="Active Trips"
            value={stats.tripsInProgress}
            color="text-green-600"
          />
        </div>
      )}

      {/* Map and Alerts Section - Top Row */}
      {!loading && !error && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Enhanced Map Overview - Top Left (2 columns) */}
          <Card className="xl:col-span-2">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span>Live Map Overview</span>
                </CardTitle>
                <Button
                  variant={showHeatmap ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className="flex items-center gap-2"
                >
                  <Activity className="w-4 h-4" />
                  {showHeatmap ? 'Hide' : 'Show'} Risk Heatmap
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <MapComponent
                center={[28.6139, 77.2090]}
                zoom={11}
                tourists={tourists}
                alerts={recentAlerts.filter(alert => alert.coordinates)}
                zones={zones}
                height="400px"
                showHeatmap={showHeatmap}
                heatmapData={tourists.map(t => ({
                  lat: t.last_location?.lat || t.current_location?.lat || t.latitude,
                  lon: t.last_location?.lon || t.current_location?.lon || t.longitude,
                  intensity: 1 - ((t.safety_score || 75) / 100),
                  touristId: t.id,
                  name: t.name,
                  safetyScore: t.safety_score || 75
                })).filter(t => t.lat && t.lon)}
                heatmapIntensityKey="intensity"
                onTouristClick={(tourist) => openModal('touristDetail', tourist)}
                onAlertClick={(alert) => {
                  setSelectedAlert(alert);
                  setShowAlertModal(true);
                }}
              />
            </CardContent>
          </Card>

          {/* Active Alerts - Top Right */}
          <Card className="xl:col-span-1">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Active Alerts ({[...realtimeAlerts, ...recentAlerts.filter(alert => !realtimeAlerts.find(rt => rt.id === alert.id))].length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {[...realtimeAlerts, ...recentAlerts.filter(alert => !realtimeAlerts.find(rt => rt.id === alert.id))].length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No recent alerts</p>
                </div>
              ) : (
                [...realtimeAlerts, ...recentAlerts.filter(alert => !realtimeAlerts.find(rt => rt.id === alert.id))].map((alert, index) => {
                  const SeverityIcon = getSeverityIcon(alert.type || alert.alert_type || 'alert');
                  return (
                    <div
                      key={`${alert.id}-${index}`}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50"
                    >
                      <SeverityIcon className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {alert.title || alert.description || `${alert.type || alert.alert_type || 'Alert'}`}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {alert.tourist_name || alert.tourist?.name || `Tourist ${alert.tourist_id || 'Unknown'}`}
                        </p>
                      </div>
                      <Badge variant={getSeverityColor(alert.severity || 'medium')}>
                        {alert.severity || 'medium'}
                      </Badge>
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
      )}

      {/* Charts Section - Bottom Row */}
      {!loading && !error && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Weekly Alert Summary */}
          <Card>
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

      {/* Alert Detail Modal */}
      <AlertDetailModal
        alert={selectedAlert}
        isOpen={showAlertModal}
        onClose={() => {
          setShowAlertModal(false);
          setSelectedAlert(null);
        }}
        onAcknowledge={async (alertId) => {
          try {
            await alertsAPI.acknowledgeIncident(alertId, 'Alert acknowledged from dashboard');
            setRecentAlerts(prev => prev.map(alert => 
              alert.id === alertId ? { ...alert, is_acknowledged: true } : alert
            ));
          } catch (error) {
            console.error('Failed to acknowledge alert:', error);
            alert('Failed to acknowledge alert. Please try again.');
          }
        }}
        onResolve={async (alertId) => {
          try {
            await alertsAPI.closeIncident(alertId, 'Incident resolved from dashboard');
            setRecentAlerts(prev => prev.map(alert => 
              alert.id === alertId ? { ...alert, is_resolved: true } : alert
            ));
          } catch (error) {
            console.error('Failed to resolve alert:', error);
            alert('Failed to resolve alert. Please try again.');
          }
        }}
        onGenerateEFIR={async (alert) => {
          try {
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
            alert(`E-FIR generated successfully! ID: ${efir.efir_id || efir.id}`);
          } catch (error) {
            console.error('Failed to generate E-FIR:', error);
            alert('Failed to generate E-FIR. Please try again.');
          }
        }}
      />

      {/* Debug Panel - Remove after testing */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 left-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-xs">
          <div className="font-bold mb-2 text-green-400">🔍 Real-Time Debug</div>
          <div className="space-y-1">
            <div>WebSocket Alerts: <span className="text-yellow-400">{realtimeAlerts.length}</span></div>
            <div>Recent Alerts: <span className="text-blue-400">{recentAlerts.length}</span></div>
            <div>Stats Today: <span className="text-purple-400">{stats.alertsToday}</span></div>
            <div>Last Render: <span className="text-gray-400">{new Date().toLocaleTimeString()}</span></div>
            {realtimeAlerts.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-600">
                <div className="text-green-400">Latest Alert:</div>
                <div className="text-xs truncate">{realtimeAlerts[0]?.title || realtimeAlerts[0]?.type}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;