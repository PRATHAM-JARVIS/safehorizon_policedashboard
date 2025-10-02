import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card.jsx';
import { Button } from './ui/button.jsx';
import { Input, Label } from './ui/input.jsx';
import { Badge } from './ui/badge.jsx';
import { broadcastAPI, mobileNotificationAPI } from '../api/services.js';
import { 
  runFCMSystemTest, 
  generateMockFCMToken,
  formatTestResults 
} from '../utils/fcmTestUtils.js';
import { 
  Bell, 
  Send, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Smartphone,
  Wifi,
  WifiOff,
  Play
} from 'lucide-react';

const NotificationTester = () => {
  const [testResults, setTestResults] = useState([]);
  const [testing, setTesting] = useState(false);
  const [deviceToken, setDeviceToken] = useState('');
  const [testBroadcast, setTestBroadcast] = useState({
    title: 'Test Notification',
    message: 'This is a test broadcast to verify notification delivery.',
    severity: 'low',
    alert_type: 'test',
    action_required: 'none'
  });

  const addTestResult = (test, status, message, details = null) => {
    const result = {
      id: Date.now(),
      test,
      status, // 'success', 'error', 'warning'
      message,
      details,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [result, ...prev]);
  };

  const testDeviceRegistration = async () => {
    if (!deviceToken) {
      addTestResult('Device Registration', 'error', 'Please provide a device token');
      return;
    }

    try {
      setTesting(true);
      const result = await mobileNotificationAPI.registerDevice({
        device_token: deviceToken,
        device_type: 'web',
        device_name: 'Test Device',
        app_version: '1.0.0'
      });
      
      addTestResult('Device Registration', 'success', 'Device registered successfully', result);
    } catch (error) {
      addTestResult('Device Registration', 'error', 
        `Failed to register device: ${error.response?.data?.detail || error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const testBroadcastDelivery = async () => {
    try {
      setTesting(true);
      
      // Test radius broadcast
      const radiusResult = await broadcastAPI.sendRadiusBroadcast({
        center_latitude: 28.6129,
        center_longitude: 77.2295,
        radius_km: 1,
        ...testBroadcast
      });
      
      addTestResult('Radius Broadcast', 'success', 
        `Broadcast sent successfully. ID: ${radiusResult.broadcast_id}`, radiusResult);
      
      // Test all broadcast
      const allResult = await broadcastAPI.sendAllBroadcast({
        ...testBroadcast,
        title: 'Test All Broadcast',
        message: 'This is a test broadcast to all tourists.'
      });
      
      addTestResult('All Broadcast', 'success', 
        `All broadcast sent successfully. ID: ${allResult.broadcast_id}`, allResult);
        
    } catch (error) {
      addTestResult('Broadcast Delivery', 'error', 
        `Failed to send broadcast: ${error.response?.data?.detail || error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const testActiveBroadcasts = async () => {
    try {
      setTesting(true);
      const result = await mobileNotificationAPI.getActiveBroadcasts({
        lat: 28.6129,
        lon: 77.2295
      });
      
      addTestResult('Active Broadcasts', 'success', 
        `Found ${result.active_broadcasts?.length || 0} active broadcasts`, result);
    } catch (error) {
      addTestResult('Active Broadcasts', 'error', 
        `Failed to fetch active broadcasts: ${error.response?.data?.detail || error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const testBroadcastHistory = async () => {
    try {
      setTesting(true);
      const result = await broadcastAPI.getBroadcastHistory({ limit: 10 });
      
      addTestResult('Broadcast History', 'success', 
        `Found ${result.broadcasts?.length || 0} broadcasts in history`, result);
    } catch (error) {
      addTestResult('Broadcast History', 'error', 
        `Failed to fetch broadcast history: ${error.response?.data?.detail || error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const testDeviceList = async () => {
    try {
      setTesting(true);
      const result = await mobileNotificationAPI.listDevices();
      
      addTestResult('Device List', 'success', 
        `Found ${result.count || 0} registered devices`, result);
    } catch (error) {
      addTestResult('Device List', 'error', 
        `Failed to fetch device list: ${error.response?.data?.detail || error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    await testDeviceRegistration();
    await testBroadcastDelivery();
    await testActiveBroadcasts();
    await testBroadcastHistory();
    await testDeviceList();
  };

  const runSystemTest = async () => {
    try {
      setTesting(true);
      const results = await runFCMSystemTest();
      
      addTestResult('FCM System Test', 'success', 
        `System test completed: ${results.summary.passed}/${results.summary.total} tests passed`, results);
      
      // Log detailed results to console
      console.log('FCM System Test Results:', formatTestResults(results));
    } catch (error) {
      addTestResult('FCM System Test', 'error', 
        `System test failed: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const generateTestToken = () => {
    const token = generateMockFCMToken();
    setDeviceToken(token);
    addTestResult('Token Generation', 'success', 'Generated mock FCM token for testing');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'destructive';
      case 'warning': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Notification System Tester</h2>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Bell className="w-4 h-4 mr-2" />
          Test Suite
        </Badge>
      </div>

      {/* Test Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="device-token">Device Token (FCM)</Label>
            <Input
              id="device-token"
              value={deviceToken}
              onChange={(e) => setDeviceToken(e.target.value)}
              placeholder="Enter FCM device token for testing"
              className="mt-1"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="test-title">Test Title</Label>
              <Input
                id="test-title"
                value={testBroadcast.title}
                onChange={(e) => setTestBroadcast(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="test-severity">Severity</Label>
              <select
                id="test-severity"
                value={testBroadcast.severity}
                onChange={(e) => setTestBroadcast(prev => ({ ...prev, severity: e.target.value }))}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="test-message">Test Message</Label>
            <textarea
              id="test-message"
              value={testBroadcast.message}
              onChange={(e) => setTestBroadcast(prev => ({ ...prev, message: e.target.value }))}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Test Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={runAllTests} 
              disabled={testing}
              className="w-full"
            >
              <Bell className="w-4 h-4 mr-2" />
              Run All Tests
            </Button>
            
            <Button 
              onClick={runSystemTest} 
              disabled={testing}
              variant="outline"
              className="w-full"
            >
              <Play className="w-4 h-4 mr-2" />
              System Test
            </Button>
            
            <Button 
              onClick={generateTestToken} 
              disabled={testing}
              variant="outline"
              className="w-full"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Generate Token
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Button 
              onClick={testBroadcastDelivery} 
              disabled={testing}
              variant="outline"
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              Test Broadcasts
            </Button>
            
            <Button 
              onClick={testDeviceRegistration} 
              disabled={testing || !deviceToken}
              variant="outline"
              className="w-full"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Test Device
            </Button>
            
            <Button 
              onClick={testDeviceList} 
              disabled={testing}
              variant="outline"
              className="w-full"
            >
              <Wifi className="w-4 h-4 mr-2" />
              Test Device List
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Button 
              onClick={testActiveBroadcasts} 
              disabled={testing}
              variant="outline"
              className="w-full"
            >
              <Wifi className="w-4 h-4 mr-2" />
              Test Active Broadcasts
            </Button>
            
            <Button 
              onClick={testBroadcastHistory} 
              disabled={testing}
              variant="outline"
              className="w-full"
            >
              <WifiOff className="w-4 h-4 mr-2" />
              Test History
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No tests run yet. Click "Run All Tests" to start testing the notification system.
            </p>
          ) : (
            <div className="space-y-3">
              {testResults.map((result) => (
                <div key={result.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{result.test}</h4>
                      <Badge variant={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{result.timestamp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="text-sm cursor-pointer text-blue-600">
                          View Details
                        </summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationTester;
