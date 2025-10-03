/**
 * Optimized Dashboard Components
 * 
 * Memoized components to prevent unnecessary re-renders
 */

import React from 'react';
import { Card, CardContent } from '../ui/card.jsx';
import { Badge } from '../ui/badge.jsx';
import { Button } from '../ui/button.jsx';
import {
  Users,
  AlertTriangle,
  Phone,
  Route,
  Activity,
  MapPin,
  Eye,
} from 'lucide-react';

/**
 * Memoized Stat Card Component
 * Only re-renders when value, title, or icon changes
 */
export const StatCard = React.memo(({ icon: Icon, title, value, color = "text-primary", loading = false }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {Icon && <Icon className={`h-5 w-5 ${color}`} />}
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
});

StatCard.displayName = 'StatCard';

/**
 * Memoized Alert Item Component
 * Only re-renders when alert data changes
 */
export const AlertItem = React.memo(({ alert, onView, getSeverityColor, getSeverityIcon }) => {
  const SeverityIcon = getSeverityIcon(alert.type || alert.alert_type || 'alert');
  
  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
      <SeverityIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
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
        onClick={() => onView(alert)}
        className="flex-shrink-0"
      >
        <Eye className="w-4 h-4" />
      </Button>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function
  return (
    prevProps.alert.id === nextProps.alert.id &&
    prevProps.alert.severity === nextProps.alert.severity &&
    prevProps.alert.is_acknowledged === nextProps.alert.is_acknowledged &&
    prevProps.alert.is_resolved === nextProps.alert.is_resolved
  );
});

AlertItem.displayName = 'AlertItem';

/**
 * Memoized Empty State Component
 */
export const EmptyAlerts = React.memo(() => {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
      <p>No recent alerts</p>
    </div>
  );
});

EmptyAlerts.displayName = 'EmptyAlerts';

/**
 * Memoized Error State Component
 */
export const ErrorState = React.memo(({ error }) => {
  return (
    <Card className="border-destructive/50">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 text-destructive">
          <AlertTriangle className="w-6 h-6 flex-shrink-0" />
          <div>
            <h3 className="font-semibold">Connection Error</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ErrorState.displayName = 'ErrorState';

/**
 * Memoized Loading State Component
 */
export const LoadingState = React.memo(() => {
  return (
    <Card>
      <CardContent className="p-12">
        <div className="flex items-center justify-center">
          <Activity className="w-8 h-8 animate-spin text-primary" />
        </div>
      </CardContent>
    </Card>
  );
});

LoadingState.displayName = 'LoadingState';

export default {
  StatCard,
  AlertItem,
  EmptyAlerts,
  ErrorState,
  LoadingState,
};
