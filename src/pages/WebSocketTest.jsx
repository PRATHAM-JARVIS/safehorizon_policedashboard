import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Button } from '../components/ui/button.jsx';
import { useWebSocketContext } from '../contexts/WebSocketContext.jsx';
import { AlertCircle, CheckCircle, RefreshCw, Activity, Wifi, WifiOff } from 'lucide-react';

const WebSocketTest = () => {
  const [logs, setLogs] = useState([]);
  const [testResults, setTestResults] = useState({
    envVars: null,
    token: null,
    wsUrl: null,
    connection: null
  });

  // Get WebSocket context
  const {
    isConnected,
    isConnecting,
    readyState,
    wsError,
    connectionAttempts,
    realtimeAlerts,
    alertStats,
    connectWebSocket,
    forceReconnect,
    sendMessage
  } = useWebSocketContext();

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [{
      timestamp,
      message,
      type
    }, ...prev.slice(0, 49)]); // Keep last 50 logs
  };

  // Test environment variables
  const testEnvironmentVars = () => {
    addLog('🔍 Testing environment variables...', 'info');
    
    const envVars = {
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      VITE_WS_BASE_URL: import.meta.env.VITE_WS_BASE_URL,
      VITE_WS_AUTO_CONNECT: import.meta.env.VITE_WS_AUTO_CONNECT,
      VITE_WS_RECONNECT_INTERVAL: import.meta.env.VITE_WS_RECONNECT_INTERVAL,
      VITE_WS_MAX_RECONNECT_ATTEMPTS: import.meta.env.VITE_WS_MAX_RECONNECT_ATTEMPTS,
    };

    setTestResults(prev => ({ ...prev, envVars }));
    
    if (envVars.VITE_WS_BASE_URL) {
      addLog(`✅ WebSocket URL: ${envVars.VITE_WS_BASE_URL}`, 'success');
    } else {
      addLog('❌ VITE_WS_BASE_URL not set!', 'error');
    }
  };

  // Test authentication token
  const testAuthToken = () => {
    addLog('🔍 Testing authentication token...', 'info');
    
    const token = localStorage.getItem('safehorizon_auth_token');
    
    setTestResults(prev => ({ ...prev, token: token ? 'exists' : 'missing' }));
    
    if (token) {
      addLog(`✅ Auth token exists (${token.length} chars)`, 'success');
      
      // Try to decode JWT
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          addLog(`✅ Token payload: ${JSON.stringify(payload)}`, 'success');
          
          if (payload.exp) {
            const expiryDate = new Date(payload.exp * 1000);
            const isExpired = expiryDate < new Date();
            addLog(`Token expires: ${expiryDate.toLocaleString()} ${isExpired ? '❌ EXPIRED' : '✅'}`, isExpired ? 'error' : 'success');
          }
        }
      } catch (err) {
        addLog(`⚠️ Could not decode token: ${err.message}`, 'warning');
      }
    } else {
      addLog('❌ No auth token found! Login required.', 'error');
    }
  };

  // Test WebSocket URL construction
  const testWebSocketURL = () => {
    addLog('🔍 Testing WebSocket URL construction...', 'info');
    
    try {
      const token = localStorage.getItem('safehorizon_auth_token');
      const baseWsUrl = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';
      const wsUrl = `${baseWsUrl}/api/alerts/subscribe?token=${encodeURIComponent(token)}`;
      
      setTestResults(prev => ({ ...prev, wsUrl: wsUrl.split('?')[0] + '?token=***' }));
      addLog(`✅ WebSocket URL: ${wsUrl.split('?')[0]}?token=***`, 'success');
    } catch (err) {
      addLog(`❌ Failed to construct WebSocket URL: ${err.message}`, 'error');
    }
  };

  // Manual connection test
  const testManualConnection = () => {
    addLog('🔌 Attempting manual WebSocket connection...', 'info');
    
    try {
      const token = localStorage.getItem('safehorizon_auth_token');
      if (!token) {
        addLog('❌ Cannot connect without auth token', 'error');
        return;
      }

      const baseWsUrl = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';
      const wsUrl = `${baseWsUrl}/api/alerts/subscribe?token=${encodeURIComponent(token)}`;
      
      addLog(`🔌 Connecting to: ${wsUrl.split('?')[0]}`, 'info');
      
      const testWs = new WebSocket(wsUrl);
      
      testWs.onopen = () => {
        addLog('✅ Manual connection successful!', 'success');
        setTestResults(prev => ({ ...prev, connection: 'success' }));
        testWs.close();
      };
      
      testWs.onerror = (error) => {
        addLog(`❌ Connection error: ${error}`, 'error');
        setTestResults(prev => ({ ...prev, connection: 'error' }));
      };
      
      testWs.onclose = (event) => {
        addLog(`🔌 Connection closed: Code ${event.code}, Reason: ${event.reason || 'None'}`, 'info');
      };
    } catch (err) {
      addLog(`❌ Manual connection failed: ${err.message}`, 'error');
      setTestResults(prev => ({ ...prev, connection: 'failed' }));
    }
  };

  // Send test message
  const sendTestMessage = () => {
    if (!isConnected) {
      addLog('❌ Cannot send message - not connected', 'error');
      return;
    }
    
    addLog('📤 Sending test message...', 'info');
    const result = sendMessage({ type: 'ping', timestamp: Date.now() });
    
    if (result) {
      addLog('✅ Test message sent successfully', 'success');
    } else {
      addLog('❌ Failed to send test message', 'error');
    }
  };

  // Run all tests
  const runAllTests = () => {
    setLogs([]);
    addLog('🚀 Starting comprehensive WebSocket tests...', 'info');
    
    setTimeout(() => testEnvironmentVars(), 100);
    setTimeout(() => testAuthToken(), 200);
    setTimeout(() => testWebSocketURL(), 300);
    setTimeout(() => testManualConnection(), 400);
  };

  useEffect(() => {
    addLog('📊 WebSocket Test Page loaded', 'info');
    runAllTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // runAllTests includes state setters which shouldn't trigger re-runs

  // Monitor connection state changes
  useEffect(() => {
    addLog(`🔄 Connection state changed: ${getReadyStateName(readyState)}`, 'info');
  }, [readyState]);

  useEffect(() => {
    if (wsError) {
      addLog(`❌ WebSocket error: ${wsError}`, 'error');
    }
  }, [wsError]);

  const getReadyStateName = (state) => {
    switch(state) {
      case 0: return 'CONNECTING';
      case 1: return 'OPEN';
      case 2: return 'CLOSING';
      case 3: return 'CLOSED';
      default: return 'UNKNOWN';
    }
  };

  const getStatusColor = () => {
    if (isConnected) return 'text-green-600 bg-green-50 border-green-200';
    if (isConnecting) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">WebSocket Connection Test</h1>
          <p className="text-muted-foreground">
            Comprehensive diagnostic tool for WebSocket connection issues
          </p>
        </div>
        <Button onClick={runAllTests}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Run All Tests
        </Button>
      </div>

      {/* Connection Status */}
      <Card className={`border-2 ${getStatusColor()}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {isConnected ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
              Connection Status
            </CardTitle>
            <Badge variant={isConnected ? 'default' : 'destructive'} className="text-lg px-4 py-2">
              {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Ready State</p>
              <p className="text-lg font-bold">{getReadyStateName(readyState)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Connection Attempts</p>
              <p className="text-lg font-bold">{connectionAttempts}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Real-time Alerts</p>
              <p className="text-lg font-bold">{realtimeAlerts.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Alerts Today</p>
              <p className="text-lg font-bold">{alertStats.alertsToday}</p>
            </div>
          </div>

          {wsError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-800">Error: {wsError}</p>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <Button 
              onClick={connectWebSocket} 
              disabled={isConnected || isConnecting}
              variant="outline"
            >
              Connect
            </Button>
            <Button 
              onClick={forceReconnect}
              variant="outline"
            >
              Force Reconnect
            </Button>
            <Button 
              onClick={sendTestMessage}
              disabled={!isConnected}
              variant="outline"
            >
              Send Test Message
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.envVars ? (
              <div className="space-y-2">
                {Object.entries(testResults.envVars).map(([key, value]) => (
                  <div key={key} className="flex items-start justify-between text-sm">
                    <span className="font-mono text-muted-foreground">{key}:</span>
                    <span className="font-mono ml-2 break-all">{value || '❌ Not set'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Run tests to see results</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connection Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Auth Token</span>
                {testResults.token === 'exists' ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Found
                  </Badge>
                ) : testResults.token === 'missing' ? (
                  <Badge variant="destructive">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Missing
                  </Badge>
                ) : (
                  <Badge variant="secondary">Not tested</Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span>WebSocket URL</span>
                {testResults.wsUrl ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Valid
                  </Badge>
                ) : (
                  <Badge variant="secondary">Not tested</Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span>Manual Connection</span>
                {testResults.connection === 'success' ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Success
                  </Badge>
                ) : testResults.connection === 'error' ? (
                  <Badge variant="destructive">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Failed
                  </Badge>
                ) : (
                  <Badge variant="secondary">Not tested</Badge>
                )}
              </div>

              {testResults.wsUrl && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-xs font-mono break-all">{testResults.wsUrl}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Live Logs
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setLogs([])}>
              Clear Logs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 max-h-96 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-muted-foreground">No logs yet. Run tests to see output.</p>
            ) : (
              logs.map((log, index) => (
                <div 
                  key={index} 
                  className={`p-2 rounded ${
                    log.type === 'error' ? 'bg-red-50 text-red-800' :
                    log.type === 'success' ? 'bg-green-50 text-green-800' :
                    log.type === 'warning' ? 'bg-yellow-50 text-yellow-800' :
                    'bg-muted'
                  }`}
                >
                  <span className="text-xs text-muted-foreground">[{log.timestamp}]</span>{' '}
                  {log.message}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      {realtimeAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Real-time Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {realtimeAlerts.map((alert, index) => (
                <div key={index} className="p-3 bg-muted rounded-lg">
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(alert, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WebSocketTest;
