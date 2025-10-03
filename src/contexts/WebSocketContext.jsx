import React, { createContext, useContext, useState, useCallback } from 'react';
import { useWebSocket } from '../hooks/useWebSocket.js';

// Create WebSocket Context
const WebSocketContext = createContext(null);

// WebSocket Provider Component
export const WebSocketProvider = ({ children }) => {
  const [realtimeAlerts, setRealtimeAlerts] = useState([]);
  const [alertStats, setAlertStats] = useState({
    alertsToday: 0,
    sosCount: 0,
    activeTourists: 0
  });

  console.log('🚀 [WebSocketProvider] Initializing WebSocket Provider...');
  console.log('📊 [WebSocketProvider] Environment check:', {
    API_URL: import.meta.env.VITE_API_BASE_URL,
    WS_URL: import.meta.env.VITE_WS_BASE_URL,
    AUTO_CONNECT: import.meta.env.VITE_WS_AUTO_CONNECT
  });

  // Request notification permission on mount
  React.useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('🔔 Notification permission:', permission);
      });
    }
  }, []);

  // Show browser notification for new alerts
  const showNotification = useCallback((alertData) => {
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
      
      // Auto-close after 10 seconds for non-critical alerts
      if (alertData.severity !== 'critical') {
        setTimeout(() => notification.close(), 10000);
      }
    }
  }, []);

  // WebSocket configuration with callbacks
  const wsOptions = {
    maxReconnectAttempts: parseInt(import.meta.env.VITE_WS_MAX_RECONNECT_ATTEMPTS) || 5,
    reconnectInterval: parseInt(import.meta.env.VITE_WS_RECONNECT_INTERVAL) || 3000,
    heartbeatInterval: parseInt(import.meta.env.VITE_WS_HEARTBEAT_INTERVAL) || 30000,
    heartbeatTimeout: parseInt(import.meta.env.VITE_WS_HEARTBEAT_TIMEOUT) || 5000,
    autoConnect: import.meta.env.VITE_WS_AUTO_CONNECT === 'true',
    onConnect: () => {
      console.log('✅ Global WebSocket connected - persists across navigation');
    },
    onMessage: (data) => {
      console.log('📨 Global alert received:', data);
      console.log('🔍 Alert type:', data.type);
      
      // Handle different message types
      if (data.type === 'alert' || data.type === 'new_alert') {
        const alertWithTimestamp = { ...data, timestamp: data.timestamp || new Date().toISOString() };
        console.log('✅ Adding alert to realtimeAlerts:', alertWithTimestamp);
        setRealtimeAlerts(prev => {
          const newList = [alertWithTimestamp, ...prev.slice(0, 19)];
          console.log('📊 Updated realtimeAlerts count:', newList.length);
          return newList;
        }); // Keep last 20 alerts
        setAlertStats(prev => ({
          ...prev,
          alertsToday: prev.alertsToday + 1
        }));
        
        // Show browser notification
        showNotification(alertWithTimestamp);
        
        // Play alert sound (optional)
        try {
          const audio = new Audio('/alert-sound.mp3');
          audio.volume = 0.3;
          audio.play().catch(() => console.log('Audio play failed'));
        } catch {
          console.log('Audio not available');
        }
      } else if (data.type === 'sos' || data.type === 'emergency') {
        const alertWithTimestamp = { ...data, timestamp: data.timestamp || new Date().toISOString() };
        setRealtimeAlerts(prev => [alertWithTimestamp, ...prev.slice(0, 19)]);
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
          audio.play().catch(() => console.log('Audio play failed'));
        } catch {
          console.log('Audio not available');
        }
      } else if (data.type === 'tourist_update') {
        setAlertStats(prev => ({
          ...prev,
          activeTourists: data.activeTourists || prev.activeTourists
        }));
      } else if (data.type === 'stats_update') {
        // Handle stats updates from backend
        setAlertStats(prev => ({
          ...prev,
          ...data.stats
        }));
      }
    },
    onClose: (event) => {
      console.log('🔌 Global WebSocket disconnected:', event.code);
    },
    onError: (error) => {
      console.error('❌ Global WebSocket error:', error);
    }
  };

  // Initialize WebSocket hook
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

  // Context value
  const contextValue = {
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
  };

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
