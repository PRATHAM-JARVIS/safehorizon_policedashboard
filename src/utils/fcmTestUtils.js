/**
 * FCM Test Utilities
 * Helper functions for testing Firebase Cloud Messaging integration
 */

// Mock FCM token for testing (replace with real token for actual testing)
export const MOCK_FCM_TOKEN = 'mock_fcm_token_for_testing_12345';

/**
 * Generate a mock FCM token for testing purposes
 * @returns {string} Mock FCM token
 */
export const generateMockFCMToken = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `mock_fcm_${timestamp}_${random}`;
};

/**
 * Validate FCM token format
 * @param {string} token - FCM token to validate
 * @returns {boolean} True if token format is valid
 */
export const validateFCMToken = (token) => {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // Basic FCM token format validation
  // Real FCM tokens are much longer and more complex
  return token.length > 10 && token.includes('_');
};

/**
 * Test notification payload generator
 * @param {Object} options - Notification options
 * @returns {Object} Test notification payload
 */
export const generateTestNotification = (options = {}) => {
  const defaults = {
    title: 'Test Notification',
    message: 'This is a test notification from SafeHorizon',
    severity: 'low',
    alert_type: 'test',
    action_required: 'none',
    broadcast_id: `TEST-${Date.now()}`,
    timestamp: new Date().toISOString()
  };
  
  return { ...defaults, ...options };
};

/**
 * Simulate FCM notification delivery
 * @param {Object} notification - Notification payload
 * @returns {Promise<Object>} Delivery simulation result
 */
export const simulateFCMDelivery = async (notification) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // Simulate delivery success/failure (90% success rate)
  const success = Math.random() > 0.1;
  
  return {
    success,
    message_id: success ? `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}` : null,
    error: success ? null : 'Simulated delivery failure',
    timestamp: new Date().toISOString(),
    notification
  };
};

/**
 * Test broadcast delivery to multiple devices
 * @param {Array<string>} deviceTokens - Array of device tokens
 * @param {Object} broadcastData - Broadcast data
 * @returns {Promise<Object>} Delivery results
 */
export const testBroadcastDelivery = async (deviceTokens, broadcastData) => {
  const results = [];
  
  for (const token of deviceTokens) {
    const result = await simulateFCMDelivery({
      ...broadcastData,
      device_token: token
    });
    results.push(result);
  }
  
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.length - successCount;
  
  return {
    total_devices: deviceTokens.length,
    success_count: successCount,
    failure_count: failureCount,
    success_rate: `${((successCount / deviceTokens.length) * 100).toFixed(1)}%`,
    results
  };
};

/**
 * Generate test device data
 * @param {number} count - Number of test devices to generate
 * @returns {Array<Object>} Array of test device data
 */
export const generateTestDevices = (count = 5) => {
  const devices = [];
  const deviceTypes = ['android', 'ios', 'web'];
  
  for (let i = 0; i < count; i++) {
    devices.push({
      id: i + 1,
      device_token: generateMockFCMToken(),
      device_type: deviceTypes[i % deviceTypes.length],
      device_name: `Test Device ${i + 1}`,
      app_version: '1.0.0',
      is_active: true,
      last_used: new Date().toISOString(),
      created_at: new Date(Date.now() - Math.random() * 86400000).toISOString()
    });
  }
  
  return devices;
};

/**
 * Test notification acknowledgment
 * @param {string} broadcastId - Broadcast ID
 * @param {Object} acknowledgmentData - Acknowledgment data
 * @returns {Promise<Object>} Acknowledgment result
 */
export const testAcknowledgment = async (broadcastId, acknowledgmentData) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  
  return {
    success: true,
    acknowledgment_id: `ack_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    broadcast_id: broadcastId,
    status: acknowledgmentData.status || 'received',
    acknowledged_at: new Date().toISOString(),
    location: acknowledgmentData.current_location || null,
    notes: acknowledgmentData.notes || null
  };
};

/**
 * Comprehensive FCM system test
 * @returns {Promise<Object>} Test results
 */
export const runFCMSystemTest = async () => {
  const testResults = {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0
    }
  };
  
  // Test 1: Token validation
  const validToken = generateMockFCMToken();
  const invalidToken = 'invalid_token';
  
  testResults.tests.push({
    name: 'Token Validation',
    passed: validateFCMToken(validToken) && !validateFCMToken(invalidToken),
    details: {
      valid_token_test: validateFCMToken(validToken),
      invalid_token_test: !validateFCMToken(invalidToken)
    }
  });
  
  // Test 2: Notification generation
  const testNotification = generateTestNotification({
    title: 'System Test',
    message: 'Testing notification generation'
  });
  
  testResults.tests.push({
    name: 'Notification Generation',
    passed: testNotification.title && testNotification.message && testNotification.broadcast_id,
    details: testNotification
  });
  
  // Test 3: Delivery simulation
  const deliveryResult = await simulateFCMDelivery(testNotification);
  
  testResults.tests.push({
    name: 'Delivery Simulation',
    passed: Object.prototype.hasOwnProperty.call(deliveryResult, 'success') && Object.prototype.hasOwnProperty.call(deliveryResult, 'message_id'),
    details: deliveryResult
  });
  
  // Test 4: Multi-device broadcast
  const testDevices = generateTestDevices(3);
  const deviceTokens = testDevices.map(d => d.device_token);
  const broadcastResult = await testBroadcastDelivery(deviceTokens, testNotification);
  
  testResults.tests.push({
    name: 'Multi-Device Broadcast',
    passed: broadcastResult.total_devices === 3 && broadcastResult.success_count >= 0,
    details: broadcastResult
  });
  
  // Test 5: Acknowledgment
  const ackResult = await testAcknowledgment(testNotification.broadcast_id, {
    status: 'safe',
    notes: 'System test acknowledgment'
  });
  
  testResults.tests.push({
    name: 'Acknowledgment',
    passed: ackResult.success && ackResult.acknowledgment_id,
    details: ackResult
  });
  
  // Calculate summary
  testResults.summary.total = testResults.tests.length;
  testResults.summary.passed = testResults.tests.filter(t => t.passed).length;
  testResults.summary.failed = testResults.summary.total - testResults.summary.passed;
  
  return testResults;
};

/**
 * Format test results for display
 * @param {Object} testResults - Test results object
 * @returns {string} Formatted test results
 */
export const formatTestResults = (testResults) => {
  const { summary, tests } = testResults;
  
  let output = `FCM System Test Results\n`;
  output += `========================\n`;
  output += `Total Tests: ${summary.total}\n`;
  output += `Passed: ${summary.passed}\n`;
  output += `Failed: ${summary.failed}\n`;
  output += `Success Rate: ${((summary.passed / summary.total) * 100).toFixed(1)}%\n\n`;
  
  tests.forEach((test, index) => {
    output += `${index + 1}. ${test.name}: ${test.passed ? 'PASS' : 'FAIL'}\n`;
    if (test.details) {
      output += `   Details: ${JSON.stringify(test.details, null, 2)}\n`;
    }
  });
  
  return output;
};

export default {
  generateMockFCMToken,
  validateFCMToken,
  generateTestNotification,
  simulateFCMDelivery,
  testBroadcastDelivery,
  generateTestDevices,
  testAcknowledgment,
  runFCMSystemTest,
  formatTestResults
};
