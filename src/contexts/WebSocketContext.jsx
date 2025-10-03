/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useWebSocket } from '../hooks/useWebSocket.js';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [realtimeAlerts, setRealtimeAlerts] = useState([]);
  const [alertStats, setAlertStats] = useState({
    alertsToday: 0,
    sosCount: 0,
    activeTourists: 0
  });

  React.useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const showNotificationInternal = useCallback((alertData) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('🚨 SafeHorizon Alert', {
        body: `${alertData.type || 'Alert'}: ${alertData.description || 'New alert received'}\nTourist: ${alertData.tourist_name || 'Unknown'}`,
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: `alert-${alertData.id}`,
        requireInteraction: alertData.severity === 'critical',
        silent: false
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      
      if (alertData.severity !== 'critical') {
        setTimeout(() => notification.close(), 10000);
      }
    }
  }, []);

  const showNotificationThrottled = React.useRef();
  if (!showNotificationThrottled.current) {
    showNotificationThrottled.current = function(alertData) {
      showNotificationInternal(alertData);
    };
    // Simple throttle: track last call time
    let lastCallTime = 0;
    const throttleDelay = 3000;
    const originalFunc = showNotificationThrottled.current;
    showNotificationThrottled.current = function(alertData) {
      const now = Date.now();
      if (now - lastCallTime >= throttleDelay) {
        lastCallTime = now;
        originalFunc(alertData);
      }
    };
  }

  const showNotification = useCallback((alertData) => {
    showNotificationThrottled.current(alertData);
  }, []);

  // WebSocket configuration with callbacks
  const wsOptions = {
    maxReconnectAttempts: parseInt(import.meta.env.VITE_WS_MAX_RECONNECT_ATTEMPTS) || 5,
    reconnectInterval: parseInt(import.meta.env.VITE_WS_RECONNECT_INTERVAL) || 3000,
    heartbeatInterval: parseInt(import.meta.env.VITE_WS_HEARTBEAT_INTERVAL) || 30000,
    heartbeatTimeout: parseInt(import.meta.env.VITE_WS_HEARTBEAT_TIMEOUT) || 5000,
    autoConnect: import.meta.env.VITE_WS_AUTO_CONNECT === 'true',
    onConnect: () => {
    },
    onMessage: (data) => {
      if (data.type === 'alert' || data.type === 'new_alert') {
        const alertWithTimestamp = { ...data, timestamp: data.timestamp || new Date().toISOString() };
        
        setRealtimeAlerts(prev => {
          if (prev.some(alert => alert.id === alertWithTimestamp.id)) {
            return prev;
          }
          const newList = [alertWithTimestamp, ...prev.slice(0, 19)];
          return newList;
        });
        
        setAlertStats(prev => ({
          ...prev,
          alertsToday: prev.alertsToday + 1
        }));
        
        showNotification(alertWithTimestamp);
        
        try {
          const audio = new Audio('/alert-sound.mp3');
          audio.volume = 0.3;
          audio.play().catch(() => {});
        } catch {
          // Audio not available
        }
      } else if (data.type === 'sos' || data.type === 'emergency') {
        const alertWithTimestamp = { ...data, timestamp: data.timestamp || new Date().toISOString() };
        
        setRealtimeAlerts(prev => {
          if (prev.some(alert => alert.id === alertWithTimestamp.id)) {
            return prev;
          }
          return [alertWithTimestamp, ...prev.slice(0, 19)];
        });
        
        setAlertStats(prev => ({
          ...prev,
          sosCount: prev.sosCount + 1
        }));
        
        // Show critical notification for SOS
        showNotification({ ...alertWithTimestamp, severity: 'critical', description: 'SOS EMERGENCY' });
        
        // Play emergency sound
        try {
          const audio = new Audio('/emergency-sound.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {});
        } catch (err) {
          console.error('Audio error:', err);
        }
      } else if (data.type === 'tourist_update') {
        setAlertStats(prev => ({
          ...prev,
          activeTourists: data.activeTourists || prev.activeTourists
        }));
      } else if (data.type === 'stats_update') {
        setAlertStats(prev => ({
          ...prev,
          ...data.stats
        }));
      }
    },
    onClose: (_event) => {
    },
    onError: (error) => {
      console.error('❌ Global WebSocket error:', error);
    }
  };

  const {
    lastMessage,
    readyState,
    error: wsError,
    connectionAttempts,
    isConnected,
    isConnecting,
    connect: connectWebSocket,
    forceReconnect,
    sendMessage
  } = useWebSocket('authority-alerts', wsOptions);

  // Clear alerts function
  const clearRealtimeAlerts = useCallback(() => {
    setRealtimeAlerts([]);
  }, []);

  // Update stats function (for manual updates)
  const updateAlertStats = useCallback((updates) => {
    setAlertStats(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // Context value - memoized to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    // WebSocket state
    lastMessage,
    readyState,
    wsError,
    connectionAttempts,
    isConnected,
    isConnecting,
    
    // WebSocket methods
    connectWebSocket,
    forceReconnect,
    sendMessage,
    
    // Alert state
    realtimeAlerts,
    alertStats,
    
    // Alert methods
    clearRealtimeAlerts,
    updateAlertStats,
    showNotification
  }), [
    lastMessage,
    readyState,
    wsError,
    connectionAttempts,
    isConnected,
    isConnecting,
    connectWebSocket,
    forceReconnect,
    sendMessage,
    realtimeAlerts,
    alertStats,
    clearRealtimeAlerts,
    updateAlertStats,
    showNotification
  ]);

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Hook to use WebSocket context
export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider');
  }
  return context;
};

export default WebSocketProvider;
