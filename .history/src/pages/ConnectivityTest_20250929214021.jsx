import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Alert, AlertDescription } from '../components/ui/alert.jsx';
import { CheckCircle, XCircle, Loader2, AlertTriangle, Wifi, Server } from 'lucide-react';
import { apiClient, tokenManager } from '../api/client.js';

const ConnectivityTest = () => {
  const [connectionStatus, setConnectionStatus] = useState({
    backend: 'testing',
    database: 'testing',
    websocket: 'testing'
  });
  const [apiEndpoints, setApiEndpoints] = useState([]);
  const [testResults, setTestResults] = useState({});
  const [isTestingAll, setIsTestingAll] = useState(false);

  // Define critical endpoints to test
  const criticalEndpoints = [
    { name: 'Health Check', endpoint: '/health', method: 'GET', requiresAuth: false },
    { name: 'System Status', endpoint: '/system/status', method: 'GET', requiresAuth: true },
    { name: 'Authority Login', endpoint: '/auth/login-authority', method: 'POST', requiresAuth: false },
    { name: 'Active Tourists', endpoint: '/tourists/active', method: 'GET', requiresAuth: true },
    { name: 'Recent Alerts', endpoint: '/alerts/recent', method: 'GET', requiresAuth: true },
    { name: 'Zones List', endpoint: '/zones/list', method: 'GET', requiresAuth: true },
    { name: 'E-FIR History', endpoint: '/efir/list', method: 'GET', requiresAuth: true }
  ];

  const testBackendConnection = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/health`);
      if (response.ok) {
        setConnectionStatus(prev => ({ ...prev, backend: 'connected' }));
        return true;
      } else {
        setConnectionStatus(prev => ({ ...prev, backend: 'error' }));
        return false;
      }
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, backend: 'error' }));
      return false;
    }
  };

  const testWebSocketConnection = async () => {
    try {
      const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8000'}/ws/alerts/subscribe`;
      const ws = new WebSocket(wsUrl);
      
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          ws.close();
          setConnectionStatus(prev => ({ ...prev, websocket: 'error' }));
          resolve(false);
        }, 5000);

        ws.onopen = () => {
          clearTimeout(timeout);
          setConnectionStatus(prev => ({ ...prev, websocket: 'connected' }));
          ws.close();
          resolve(true);
        };

        ws.onerror = () => {
          clearTimeout(timeout);
          setConnectionStatus(prev => ({ ...prev, websocket: 'error' }));
          ws.close();
          resolve(false);
        };
      });
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, websocket: 'error' }));
      return false;
    }
  };

  const testSingleEndpoint = async (endpoint) => {
    try {
      let response;
      const config = endpoint.requiresAuth ? {
        headers: { Authorization: `Bearer ${tokenManager.getToken() || 'test-token'}` }
      } : {};

      if (endpoint.method === 'GET') {
        response = await apiClient.get(endpoint.endpoint, config);
      } else if (endpoint.method === 'POST' && endpoint.name === 'Authority Login') {
        // Special case for login endpoint
        response = await apiClient.post(endpoint.endpoint, {
          email: 'test@authority.com',
          password: 'test123'
        });
      }

      return {
        status: 'success',
        code: response.status,
        message: 'Endpoint accessible',
        data: response.data
      };
    } catch (error) {
      return {
        status: 'error',
        code: error.response?.status || 0,
        message: error.response?.data?.detail || error.message,
        data: null
      };
    }
  };

  const testAllEndpoints = async () => {
    setIsTestingAll(true);
    const results = {};

    for (const endpoint of criticalEndpoints) {
      setTestResults(prev => ({
        ...prev,
        [endpoint.name]: { status: 'testing', message: 'Testing...' }
      }));

      const result = await testSingleEndpoint(endpoint);
      results[endpoint.name] = result;
      
      setTestResults(prev => ({
        ...prev,
        [endpoint.name]: result
      }));

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsTestingAll(false);
  };

  const runFullConnectivityTest = async () => {
    setConnectionStatus({
      backend: 'testing',
      database: 'testing',
      websocket: 'testing'
    });

    // Test backend connection
    const backendOk = await testBackendConnection();
    
    // Test WebSocket connection
    await testWebSocketConnection();
    
    // If backend is OK, test database through system status
    if (backendOk) {
      try {
        const response = await apiClient.get('/system/status');
        if (response.data?.database?.status === 'healthy') {
          setConnectionStatus(prev => ({ ...prev, database: 'connected' }));
        } else {
          setConnectionStatus(prev => ({ ...prev, database: 'error' }));
        }
      } catch (error) {
        setConnectionStatus(prev => ({ ...prev, database: 'error' }));
      }
    } else {
      setConnectionStatus(prev => ({ ...prev, database: 'error' }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'testing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      connected: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      testing: 'bg-blue-100 text-blue-800'
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
  };

  useEffect(() => {
    runFullConnectivityTest();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">System Connectivity Analysis</h1>
          <Button onClick={runFullConnectivityTest} className="flex items-center gap-2">
            <Wifi className="w-4 h-4" />
            Re-test Connection
          </Button>
        </div>

        {/* Connection Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Backend Server</CardTitle>
              {getStatusIcon(connectionStatus.backend)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">
                <Badge className={getStatusBadge(connectionStatus.backend)}>
                  {connectionStatus.backend}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                FastAPI Backend @ localhost:8000
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Database</CardTitle>
              {getStatusIcon(connectionStatus.database)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">
                <Badge className={getStatusBadge(connectionStatus.database)}>
                  {connectionStatus.database}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                MongoDB Connection
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">WebSocket</CardTitle>
              {getStatusIcon(connectionStatus.websocket)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">
                <Badge className={getStatusBadge(connectionStatus.websocket)}>
                  {connectionStatus.websocket}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Real-time Alerts
              </p>
            </CardContent>
          </Card>
        </div>

        {/* API Endpoints Testing */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                API Endpoints Status
              </CardTitle>
              <Button 
                onClick={testAllEndpoints} 
                disabled={isTestingAll}
                variant="outline"
                className="flex items-center gap-2"
              >
                {isTestingAll && <Loader2 className="w-4 h-4 animate-spin" />}
                Test All Endpoints
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalEndpoints.map((endpoint) => {
                const result = testResults[endpoint.name];
                const isLoading = result?.status === 'testing';
                
                return (
                  <div key={endpoint.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      ) : result?.status === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : result?.status === 'error' ? (
                        <XCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-gray-400" />
                      )}
                      <div>
                        <div className="font-medium">{endpoint.name}</div>
                        <div className="text-sm text-gray-500">
                          {endpoint.method} {endpoint.endpoint}
                          {endpoint.requiresAuth && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Auth Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {result && (
                        <>
                          <Badge 
                            className={result.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          >
                            {result.status === 'success' ? `${result.code}` : `Error ${result.code}`}
                          </Badge>
                          <div className="text-xs text-gray-500 mt-1">
                            {result.message}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Backend Setup Instructions */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Backend Setup Required:</strong> To test full connectivity, ensure the SafeHorizon FastAPI backend is running on <code>localhost:8000</code>. 
            Run <code>uvicorn main:app --reload --port 8000</code> in your backend directory.
          </AlertDescription>
        </Alert>

        {/* Configuration Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>API Base URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}
              </div>
              <div>
                <strong>WebSocket URL:</strong> {import.meta.env.VITE_WS_URL || 'ws://localhost:8000'}
              </div>
              <div>
                <strong>Environment:</strong> {import.meta.env.MODE}
              </div>
              <div>
                <strong>Token Storage:</strong> localStorage
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConnectivityTest;