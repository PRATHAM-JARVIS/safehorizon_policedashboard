import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client.js';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Badge } from '../components/ui/badge.jsx';

const APITest = () => {
  const [apiStatus, setApiStatus] = useState('testing');
  const [testResults, setTestResults] = useState([]);

  const testEndpoints = [
    { name: 'Health Check', endpoint: '/health', method: 'GET' },
    { name: 'System Status', endpoint: '/system/status', method: 'GET' },
    { name: 'Tourists List', endpoint: '/tourists/active', method: 'GET' },
    { name: 'Alerts Recent', endpoint: '/alerts/recent', method: 'GET' },
    { name: 'Zones List', endpoint: '/zones/list', method: 'GET' },
  ];

  const testAPI = async () => {
    setApiStatus('testing');
    setTestResults([]);
    
    const results = [];
    
    for (const test of testEndpoints) {
      try {
        const start = Date.now();
        const response = await apiClient({
          url: test.endpoint,
          method: test.method,
          timeout: 5000
        });
        const duration = Date.now() - start;
        
        results.push({
          ...test,
          status: 'success',
          responseTime: duration,
          statusCode: response.status,
          data: response.data
        });
      } catch (error) {
        results.push({
          ...test,
          status: 'error',
          error: error.message,
          statusCode: error.response?.status || 'No Response'
        });
      }
    }
    
    setTestResults(results);
    setApiStatus('completed');
  };

  useEffect(() => {
    testAPI();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">API Connection Test</h1>
        <Button onClick={testAPI} disabled={apiStatus === 'testing'}>
          {apiStatus === 'testing' ? 'Testing...' : 'Retest API'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backend Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">API Base URL:</span>
              <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}
              </code>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">WebSocket URL:</span>
              <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                {import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000/ws'}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endpoint Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {testResults.length === 0 && apiStatus === 'testing' && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Testing API endpoints...</p>
              </div>
            )}
            
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(result.status)}>
                    {result.status.toUpperCase()}
                  </Badge>
                  <div>
                    <div className="font-medium">{result.name}</div>
                    <div className="text-sm text-gray-500">
                      {result.method} {result.endpoint}
                    </div>
                  </div>
                </div>
                
                <div className="text-right text-sm">
                  {result.status === 'success' ? (
                    <>
                      <div className="text-green-600 font-medium">
                        {result.statusCode} - {result.responseTime}ms
                      </div>
                      {result.data && (
                        <div className="text-gray-500">
                          {Array.isArray(result.data) ? `${result.data.length} items` : 'Data received'}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="text-red-600 font-medium">
                        {result.statusCode}
                      </div>
                      <div className="text-red-500 text-xs">
                        {result.error}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connection Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">To connect with the SafeHorizon backend:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Ensure the SafeHorizon FastAPI backend is running on port 8000</li>
                <li>Update the .env file with the correct API_BASE_URL if different</li>
                <li>Make sure CORS is configured to allow requests from this dashboard</li>
                <li>Verify the JWT authentication endpoints are available</li>
                <li>Check that the WebSocket endpoint is accessible for real-time features</li>
              </ol>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">Sample Backend URLs:</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Health: GET /health</li>
                <li>• Auth: POST /auth/login-authority</li>
                <li>• Tourists: GET /tourists/active</li>
                <li>• Alerts: GET /alerts/recent</li>
                <li>• WebSocket: WS /alerts/subscribe</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default APITest;