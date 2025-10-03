import { useState, useEffect, useRef, useCallback } from 'react';

// WebSocket connection states
const WS_STATES = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
};

// WebSocket close codes
const WS_CLOSE_CODES = {
  NORMAL_CLOSURE: 1000,
  GOING_AWAY: 1001,
  PROTOCOL_ERROR: 1002,
  UNSUPPORTED_DATA: 1003,
  ABNORMAL_CLOSURE: 1006,
  POLICY_VIOLATION: 1008,
  INTERNAL_ERROR: 1011,
  SERVICE_RESTART: 1012
};

export const useWebSocket = (_channel = 'authority-alerts', options = {}) => {
  const [socket, setSocket] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  const [readyState, setReadyState] = useState(WS_STATES.CLOSED);
  const [error, setError] = useState(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  
  const reconnectTimeoutRef = useRef();
  const reconnectAttemptsRef = useRef(0);
  const heartbeatIntervalRef = useRef();
  const lastPongRef = useRef(Date.now());
  const isConnectingRef = useRef(false); // Prevent multiple simultaneous connections
  const connectRef = useRef(); // Store connect function reference
  
  const maxReconnectAttempts = options.maxReconnectAttempts || 5;
  const reconnectInterval = options.reconnectInterval || 3000;
  const heartbeatInterval = options.heartbeatInterval || 30000;
  const heartbeatTimeout = options.heartbeatTimeout || 5000;

  // Build WebSocket URL with proper authentication
  const buildWebSocketUrl = useCallback(() => {
    try {
      const token = localStorage.getItem('safehorizon_auth_token');
      if (!token) {
        console.error('❌ [WebSocket] No authentication token found');
        throw new Error('No authentication token found');
      }

      // Get base URL and handle protocol switching
      const baseWsUrl = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = import.meta.env.VITE_WS_BASE_URL ? 
        baseWsUrl.replace(/^wss?:\/\//, '') : 
        window.location.host;
      
      const wsUrl = `${protocol}//${host}/api/alerts/subscribe?token=${encodeURIComponent(token)}`;
      
      return wsUrl;
    } catch (err) {
      console.error('❌ [WebSocket] Failed to build WebSocket URL:', err);
      throw err;
    }
  }, []);

  // Validate authentication token
  const validateToken = useCallback(() => {
    try {
      const token = localStorage.getItem('safehorizon_auth_token');
      if (!token) {
        return false;
      }

      // Basic JWT structure validation
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('❌ Invalid token format');
        return false;
      }

      // Decode payload to check expiration (optional)
      try {
        const payload = JSON.parse(atob(parts[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (payload.exp && payload.exp < currentTime) {
          console.error('❌ Token has expired');
          return false;
        }

        return true;
      } catch {
        return true; // Proceed if we can't decode but token exists
      }
    } catch (err) {
      console.error('❌ Token validation error:', err);
      return false;
    }
  }, []);

  // Start heartbeat mechanism
  const startHeartbeat = useCallback((ws) => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (ws.readyState === WS_STATES.OPEN) {
        ws.send('ping');
        
        // Set timeout to check for pong response
        setTimeout(() => {
          const timeSinceLastPong = Date.now() - lastPongRef.current;
          if (timeSinceLastPong > heartbeatTimeout) {
            ws.close(WS_CLOSE_CODES.ABNORMAL_CLOSURE, 'Heartbeat timeout');
          }
        }, heartbeatTimeout);
      }
    }, heartbeatInterval);
  }, [heartbeatInterval, heartbeatTimeout]);

  // Stop heartbeat mechanism
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // Handle reconnection with exponential backoff
  const scheduleReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.error(`❌ Max reconnection attempts (${maxReconnectAttempts}) reached`);
      setError(`Connection failed after ${maxReconnectAttempts} attempts`);
      return;
    }

    const backoffDelay = Math.min(
      reconnectInterval * Math.pow(2, reconnectAttemptsRef.current),
      30000 // Max 30 seconds
    );

    reconnectAttemptsRef.current++;
    setConnectionAttempts(reconnectAttemptsRef.current);

    reconnectTimeoutRef.current = setTimeout(() => {
      // Use ref to call connect to avoid circular dependency
      connectRef.current?.();
    }, backoffDelay);
  }, [maxReconnectAttempts, reconnectInterval]);

  // Main connection function
  const connect = useCallback(() => {
    try {
      // Prevent multiple simultaneous connection attempts
      if (isConnectingRef.current) {
        return;
      }

      // Clear any existing timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Validate authentication before connecting
      if (!validateToken()) {
        setError('Authentication failed: Invalid or missing token');
        console.error('❌ Authentication validation failed');
        return;
      }

      const wsUrl = buildWebSocketUrl();
      
      isConnectingRef.current = true;
      setReadyState(WS_STATES.CONNECTING);
      setError(null);

      const ws = new WebSocket(wsUrl);

      ws.onopen = (event) => {
        isConnectingRef.current = false;
        setReadyState(WS_STATES.OPEN);
        setError(null);
        reconnectAttemptsRef.current = 0;
        setConnectionAttempts(0);
        lastPongRef.current = Date.now();
        
        // Start heartbeat
        startHeartbeat(ws);
        
        // Call onConnect callback if provided
        options.onConnect?.(event);
      };

      ws.onmessage = (event) => {
        try {
          // Handle heartbeat response
          if (event.data === 'pong') {
            lastPongRef.current = Date.now();
            return;
          }
          
          // Handle regular messages
          let data;
          try {
            data = JSON.parse(event.data);
          } catch {
            data = event.data;
          }
          
          setLastMessage(data);
          options.onMessage?.(data);
          
        } catch (err) {
          console.error('❌ Message handling error:', err);
          options.onError?.(err);
        }
      };

      ws.onclose = (event) => {
        isConnectingRef.current = false;
        setReadyState(WS_STATES.CLOSED);
        stopHeartbeat();

        // Handle different close codes
        switch (event.code) {
          case WS_CLOSE_CODES.NORMAL_CLOSURE:
            setError(null);
            break;
            
          case WS_CLOSE_CODES.POLICY_VIOLATION:
            console.error('❌ Authentication failed (Policy Violation)');
            setError('Authentication failed: Invalid credentials');
            // Don't reconnect on auth failures
            break;
            
          case WS_CLOSE_CODES.SERVICE_RESTART:
          case WS_CLOSE_CODES.ABNORMAL_CLOSURE:
            scheduleReconnect();
            break;
            
          default:
            if (!event.wasClean) {
              scheduleReconnect();
            }
        }

        // Call onClose callback if provided
        options.onClose?.(event);
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        isConnectingRef.current = false;
        const errorMessage = 'WebSocket connection error';
        setError(errorMessage);
        options.onError?.(error);
      };

      setSocket(ws);
      
    } catch (err) {
      console.error('❌ Failed to create WebSocket connection:', err);
      isConnectingRef.current = false;
      setError(`Connection failed: ${err.message}`);
      setReadyState(WS_STATES.CLOSED);
      
      // Schedule reconnect on connection creation failure
      scheduleReconnect();
    }
  }, [validateToken, buildWebSocketUrl, startHeartbeat, stopHeartbeat, scheduleReconnect, options]);

  // Disconnect function
  const disconnect = useCallback((reason = 'Disconnected by user') => {
    // Clear connecting flag
    isConnectingRef.current = false;
    
    // Clear all timers
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    stopHeartbeat();
    
    // Close WebSocket connection only if it's open
    if (socket && (socket.readyState === WS_STATES.OPEN || socket.readyState === WS_STATES.CONNECTING)) {
      socket.close(WS_CLOSE_CODES.NORMAL_CLOSURE, reason);
    }
    
    setSocket(null);
    setReadyState(WS_STATES.CLOSED);
    setError(null);
    reconnectAttemptsRef.current = 0;
    setConnectionAttempts(0);
  }, [socket, stopHeartbeat]);

  // Send message function with validation
  const sendMessage = useCallback((message) => {
    if (!socket || socket.readyState !== WS_STATES.OPEN) {
      return false;
    }

    try {
      const messageString = typeof message === 'string' ? message : JSON.stringify(message);
      socket.send(messageString);
      return true;
    } catch (err) {
      console.error('❌ Failed to send message:', err);
      setError(`Failed to send message: ${err.message}`);
      return false;
    }
  }, [socket]);

  // Force reconnect function
  const forceReconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    setConnectionAttempts(0);
    
    // Clear all timers and close current connection
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    stopHeartbeat();
    
    if (socket && socket.readyState === WS_STATES.OPEN) {
      socket.close(WS_CLOSE_CODES.NORMAL_CLOSURE, 'Force reconnect');
    }
    
    setSocket(null);
    setReadyState(WS_STATES.CLOSED);
    setError(null);
    
    // Reconnect after a short delay
    setTimeout(() => {
      connect();
    }, 1000);
  }, [socket, stopHeartbeat, connect]);

  // Store connect function in ref
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  // Effect to manage connection lifecycle
  useEffect(() => {
    let isMounted = true;
    
    if (options.autoConnect === true && isMounted) {
      connect();
    }

    // Cleanup function - only disconnect if component is actually unmounting
    return () => {
      isMounted = false;
      disconnect('Component unmounting');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount/unmount

  // Effect to handle authentication changes
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'safehorizon_auth_token') {
        if (!event.newValue) {
          // Token removed, disconnect
          disconnect('Auth token removed');
        } else if (event.oldValue && event.newValue !== event.oldValue) {
          // Token actually changed (not just set initially), reconnect
          if (socket && socket.readyState === WS_STATES.OPEN) {
            forceReconnect();
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [socket, disconnect, forceReconnect]);

  // Return enhanced WebSocket interface
  return {
    socket,
    lastMessage,
    readyState,
    error,
    connectionAttempts,
    isConnecting: readyState === WS_STATES.CONNECTING,
    isConnected: readyState === WS_STATES.OPEN,
    isDisconnected: readyState === WS_STATES.CLOSED,
    connect,
    disconnect,
    forceReconnect,
    sendMessage,
    // Helper functions for debugging
    getConnectionInfo: () => ({
      readyState,
      connectionAttempts,
      lastPong: lastPongRef.current,
      error
    })
  };
};