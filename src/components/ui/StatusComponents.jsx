import React from 'react';
import { Card, CardContent } from './card.jsx';
import { Button } from './button.jsx';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

export const LoadingSpinner = ({ size = 'default' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`} />
  );
};

export const ErrorState = ({ error, onRetry, title = 'Connection Error' }) => (
  <Card className="w-full">
    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
      <WifiOff className="w-16 h-16 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">
        {error?.message || 'Unable to connect to the server. Please check your connection and try again.'}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
    </CardContent>
  </Card>
);

export const EmptyState = ({ 
  icon, 
  title = 'No Data Available', 
  description = 'No data to display at the moment.',
  action
}) => {
  const IconComponent = icon || AlertTriangle;
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <IconComponent className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">{description}</p>
        {action}
      </CardContent>
    </Card>
  );
};

export const ConnectionStatus = ({ isConnected, lastUpdate }) => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    {isConnected ? (
      <>
        <Wifi className="w-4 h-4 text-green-500" />
        <span>Connected</span>
      </>
    ) : (
      <>
        <WifiOff className="w-4 h-4 text-red-500" />
        <span>Disconnected</span>
      </>
    )}
    {lastUpdate && (
      <span className="ml-2">
        Last updated: {new Date(lastUpdate).toLocaleTimeString()}
      </span>
    )}
  </div>
);

export const RealTimeIndicator = ({ isLive = false }) => (
  <div className="flex items-center gap-2">
    <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
    <span className="text-sm text-muted-foreground">
      {isLive ? 'Live' : 'Offline'}
    </span>
  </div>
);