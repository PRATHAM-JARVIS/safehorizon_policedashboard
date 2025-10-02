import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card.jsx';
import { Badge } from './ui/badge.jsx';
import { broadcastAPI } from '../api/services.js';
import { 
  TrendingUp, 
  Users, 
  Bell, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  MapPin,
  Globe
} from 'lucide-react';

const BroadcastAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalBroadcasts: 0,
    totalTouristsNotified: 0,
    totalDevicesNotified: 0,
    totalAcknowledgments: 0,
    averageAcknowledgmentRate: 0,
    severityBreakdown: {},
    typeBreakdown: {},
    recentBroadcasts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await broadcastAPI.getBroadcastHistory({ limit: 100 });
      // Handle documented response structure: broadcasts property
      const broadcasts = response.broadcasts || [];
      
      // Calculate analytics
      const totalBroadcasts = broadcasts.length;
      const totalTouristsNotified = broadcasts.reduce((sum, b) => sum + (b.tourists_notified || 0), 0);
      const totalDevicesNotified = broadcasts.reduce((sum, b) => sum + (b.devices_notified || 0), 0);
      const totalAcknowledgments = broadcasts.reduce((sum, b) => sum + (b.acknowledgment_count || 0), 0);
      
      // Calculate average acknowledgment rate
      const acknowledgmentRates = broadcasts
        .filter(b => b.acknowledgment_rate)
        .map(b => parseFloat(b.acknowledgment_rate.replace('%', '')));
      const averageAcknowledgmentRate = acknowledgmentRates.length > 0 
        ? acknowledgmentRates.reduce((sum, rate) => sum + rate, 0) / acknowledgmentRates.length 
        : 0;

      // Severity breakdown
      const severityBreakdown = broadcasts.reduce((acc, b) => {
        const severity = b.severity?.toLowerCase() || 'unknown';
        acc[severity] = (acc[severity] || 0) + 1;
        return acc;
      }, {});

      // Type breakdown
      const typeBreakdown = broadcasts.reduce((acc, b) => {
        const type = b.broadcast_type || b.type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      setAnalytics({
        totalBroadcasts,
        totalTouristsNotified,
        totalDevicesNotified,
        totalAcknowledgments,
        averageAcknowledgmentRate,
        severityBreakdown,
        typeBreakdown,
        recentBroadcasts: broadcasts.slice(0, 5)
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'critical';
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'radius': return MapPin;
      case 'zone': return MapPin;
      case 'all': return Globe;
      default: return Bell;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Broadcast Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Broadcast Analytics</h2>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <TrendingUp className="w-4 h-4 mr-2" />
          Performance Metrics
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-blue-500" />
              <p className="text-sm font-medium text-muted-foreground">Total Broadcasts</p>
            </div>
            <p className="text-3xl font-bold">{analytics.totalBroadcasts}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-500" />
              <p className="text-sm font-medium text-muted-foreground">Tourists Notified</p>
            </div>
            <p className="text-3xl font-bold">{analytics.totalTouristsNotified}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-purple-500" />
              <p className="text-sm font-medium text-muted-foreground">Devices Notified</p>
            </div>
            <p className="text-3xl font-bold">{analytics.totalDevicesNotified}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-orange-500" />
              <p className="text-sm font-medium text-muted-foreground">Acknowledgments</p>
            </div>
            <p className="text-3xl font-bold">{analytics.totalAcknowledgments}</p>
          </CardContent>
        </Card>
      </div>

      {/* Acknowledgment Rate */}
      <Card>
        <CardHeader>
          <CardTitle>Average Acknowledgment Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="text-4xl font-bold text-blue-600">
              {analytics.averageAcknowledgmentRate.toFixed(1)}%
            </div>
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(analytics.averageAcknowledgmentRate, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Average response rate across all broadcasts
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Broadcasts by Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.severityBreakdown).map(([severity, count]) => (
                <div key={severity} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant={getSeverityColor(severity)}>
                      {severity.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{count}</span>
                    <span className="text-xs text-muted-foreground">
                      ({((count / analytics.totalBroadcasts) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Broadcasts by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.typeBreakdown).map(([type, count]) => {
                const IconComponent = getTypeIcon(type);
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <IconComponent className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium capitalize">{type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{count}</span>
                      <span className="text-xs text-muted-foreground">
                        ({((count / analytics.totalBroadcasts) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Broadcasts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Broadcasts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.recentBroadcasts.map((broadcast) => {
              const TypeIcon = getTypeIcon(broadcast.broadcast_type || broadcast.type);
              return (
                <div key={broadcast.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <TypeIcon className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{broadcast.title}</p>
                      <p className="text-sm text-muted-foreground">{broadcast.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant={getSeverityColor(broadcast.severity)}>
                      {broadcast.severity?.toUpperCase()}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm font-medium">{broadcast.tourists_notified} tourists</p>
                      <p className="text-xs text-muted-foreground">
                        {broadcast.acknowledgment_rate || '0%'} response
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(broadcast.sent_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BroadcastAnalytics;
