import React, { useEffect, useRef } from 'react';
import { useWebSocketContext } from '../contexts/WebSocketContext.jsx';
import { useToast } from './ui/toast.jsx';

/**
 * AlertNotificationBridge - Connects WebSocket alerts to Toast notifications
 * This component shows real-time toast notifications when new alerts arrive
 */
const AlertNotificationBridge = () => {
  const { realtimeAlerts } = useWebSocketContext();
  const { toast } = useToast();
  const shownAlertIds = useRef(new Set());

  useEffect(() => {
    console.log('🔔 AlertNotificationBridge: realtimeAlerts changed', realtimeAlerts.length);
    
    // Check each alert in the realtime list
    if (realtimeAlerts.length > 0) {
      const latestAlert = realtimeAlerts[0];
      const alertId = latestAlert.id || latestAlert.alert_id || JSON.stringify(latestAlert);
      
      // Only show if we haven't shown this alert before
      if (!shownAlertIds.current.has(alertId)) {
        console.log('🚨 Showing new alert notification:', latestAlert);
        toast.alert(latestAlert);
        shownAlertIds.current.add(alertId);
        
        // Clean up old alert IDs after 1 minute to prevent memory leak
        if (shownAlertIds.current.size > 100) {
          const idsArray = Array.from(shownAlertIds.current);
          shownAlertIds.current = new Set(idsArray.slice(-50));
        }
      }
    }
  }, [realtimeAlerts, toast]);

  return null; // This component doesn't render anything
};

export default AlertNotificationBridge;
