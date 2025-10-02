import { apiClient } from './client.js';

// Authentication API
export const authAPI = {
  // Authority authentication
  loginAuthority: async (email, password) => {
    const response = await apiClient.post('/api/auth/login-authority', {
      email,
      password,
    });
    return response.data;
  },

  registerAuthority: async (data) => {
        const response = await apiClient.post('/api/auth/register-authority', data);
    return response.data;
  },

  // Tourist authentication (kept for compatibility)
  loginTourist: async (email, password) => {
    const response = await apiClient.post('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  registerTourist: async (data) => {
    const response = await apiClient.post('/api/auth/register', data);
    return response.data;
  },

  // Get current user info (works for both authority and tourist)
  getCurrentUser: async () => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },

  // Logout endpoint
  logout: async () => {
    const response = await apiClient.post('/api/auth/logout');
    return response.data;
  },

  // Refresh token
  refreshToken: async () => {
    const response = await apiClient.post('/api/auth/refresh');
    return response.data;
  },

  // Debug endpoint for role checking
  debugRole: async () => {
    const response = await apiClient.get('/api/debug/role');
    return response.data;
  },
};

// Tourist Management API
export const touristAPI = {
  // Authority endpoints for tourist monitoring
  getActiveTourists: async () => {
    const response = await apiClient.get('/api/tourists/active');
    return response.data;
  },

  trackTourist: async (touristId) => {
    const response = await apiClient.get(`/api/tourist/${touristId}/track`);
    return response.data;
  },

  getTouristAlerts: async (touristId) => {
    const response = await apiClient.get(`/api/tourist/${touristId}/alerts`);
    return response.data;
  },

  // Get comprehensive tourist profile
  getTouristProfile: async (touristId) => {
    const response = await apiClient.get(`/api/tourist/${touristId}/profile`);
    return response.data;
  },

  // Get tourist current location with safety score and risk level
  getCurrentLocation: async (touristId) => {
    const response = await apiClient.get(`/api/tourist/${touristId}/location/current`);
    return response.data;
  },

  // Get location history with trip information and safety metrics
  getLocationHistoryForTourist: async (touristId, params = {}) => {
    const response = await apiClient.get(`/api/tourist/${touristId}/location/history`, { params });
    return response.data;
  },

  // Get movement analysis for behavioral assessment
  getMovementAnalysis: async (touristId, hoursBack = 24) => {
    const response = await apiClient.get(`/api/tourist/${touristId}/movement-analysis`, {
      params: { hours_back: hoursBack }
    });
    return response.data;
  },

  // Get tourist safety timeline with events and alerts
  getSafetyTimeline: async (touristId, hoursBack = 24) => {
    const response = await apiClient.get(`/api/tourist/${touristId}/safety-timeline`, {
      params: { hours_back: hoursBack }
    });
    return response.data;
  },

  // Get tourist emergency contacts for incident response
  getEmergencyContacts: async (touristId) => {
    const response = await apiClient.get(`/api/tourist/${touristId}/emergency-contacts`);
    return response.data;
  },

  // Tourist trip management (for compatibility)
  startTrip: async (data) => {
    const response = await apiClient.post('/trip/start', data);
    return response.data;
  },

  endTrip: async () => {
    const response = await apiClient.post('/trip/end');
    return response.data;
  },

  getTripHistory: async () => {
    const response = await apiClient.get('/trip/history');
    return response.data;
  },

  // Location tracking for tourist app
  updateLocation: async (locationData) => {
    const response = await apiClient.post('/location/update', locationData);
    return response.data;
  },

  getLocationHistory: async (limit = 100) => {
    const response = await apiClient.get('/location/history', {
      params: { limit }
    });
    return response.data;
  },

  // Safety and emergency features
  getSafetyScore: async () => {
    const response = await apiClient.get('/safety/score');
    return response.data;
  },

  triggerSOS: async () => {
    const response = await apiClient.post('/sos/trigger');
    return response.data;
  },

  // Device management
  registerDevice: async (deviceData) => {
    const response = await apiClient.post('/device/register', deviceData);
    return response.data;
  },

  updateDeviceToken: async (token) => {
    const response = await apiClient.put('/device/token', { token });
    return response.data;
  },

  getDeviceStatus: async () => {
    const response = await apiClient.get('/device/status');
    return response.data;
  },
};

// Alerts Management API
export const alertsAPI = {
  // Get recent alerts with filtering options
  getRecentAlerts: async (params = {}) => {
    const response = await apiClient.get('/api/alerts/recent', { params });
    return response.data;
  },

  // Get alerts by severity level
  getAlertsBySeverity: async (severity, params = {}) => {
    const response = await apiClient.get('/alerts/recent', { 
      params: { severity, ...params } 
    });
    return response.data;
  },

  // Get alerts by type
  getAlertsByType: async (alertType, params = {}) => {
    const response = await apiClient.get('/alerts/recent', { 
      params: { type: alertType, ...params } 
    });
    return response.data;
  },

  // Incident management
  acknowledgeIncident: async (alertId, notes = '') => {
    const response = await apiClient.post('/api/incident/acknowledge', {
      alert_id: alertId,
      notes,
    });
    return response.data;
  },

  closeIncident: async (alertId, notes = '') => {
    const response = await apiClient.post('/api/incident/close', {
      alert_id: alertId,
      notes,
    });
    return response.data;
  },

  // Get incident details
  getIncidentDetails: async (alertId) => {
    const response = await apiClient.get(`/incident/${alertId}`);
    return response.data;
  },

  // Get incident history
  getIncidentHistory: async (params = {}) => {
    const response = await apiClient.get('/incident/history', { params });
    return response.data;
  },

  // Alert classification and severity management
  classifyAlert: async (alertData) => {
    const response = await apiClient.post('/alerts/classify', alertData);
    return response.data;
  },

  // Manual alert creation
  createManualAlert: async (alertData) => {
    const response = await apiClient.post('/alerts/create', alertData);
    return response.data;
  },

  // WebSocket subscription URL helper for real-time alerts
  getWebSocketURL: (token) => {
    const wsBase = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';
    return `${wsBase}/alerts/subscribe?token=${token}`;
  },

  // Get alert statistics
  getAlertStats: async (params = {}) => {
    const response = await apiClient.get('/alerts/stats', { params });
    return response.data;
  },

  // Bulk operations
  bulkAcknowledge: async (alertIds, notes = '') => {
    const response = await apiClient.post('/alerts/bulk/acknowledge', {
      alert_ids: alertIds,
      notes,
    });
    return response.data;
  },

  bulkClose: async (alertIds, notes = '') => {
    const response = await apiClient.post('/alerts/bulk/close', {
      alert_ids: alertIds,
      notes,
    });
    return response.data;
  },

  // Alert subscription management
  subscribeToAlerts: async (filters = {}) => {
    const response = await apiClient.post('/alerts/subscribe', filters);
    return response.data;
  },

  unsubscribeFromAlerts: async () => {
    const response = await apiClient.post('/alerts/unsubscribe');
    return response.data;
  },
};

// Zones Management API
export const zonesAPI = {
  // Public zone endpoints (for tourist app compatibility)
  listZones: async () => {
    const response = await apiClient.get('/api/zones/list');
    return response.data;
  },

  getNearbyZones: async (lat, lon, radius = 5000) => {
    const response = await apiClient.get('/zones/nearby', {
      params: { lat, lon, radius }
    });
    return response.data;
  },

  // Authority zone management
  manageZones: async () => {
    const response = await apiClient.get('/api/zones/manage');
    return response.data;
  },

  // Create polygon-based zone (proper authority endpoint)
  createZone: async (zoneData) => {
    const response = await apiClient.post('/api/zones/create', zoneData);
    return response.data;
  },

  // Update existing zone
  updateZone: async (zoneId, zoneData) => {
    const response = await apiClient.put(`/zones/${zoneId}`, zoneData);
    return response.data;
  },

  // Delete zone
  deleteZone: async (zoneId) => {
    const response = await apiClient.delete(`/api/zones/${zoneId}`);
    return response.data;
  },

  // Get zone details
  getZoneDetails: async (zoneId) => {
    const response = await apiClient.get(`/zones/${zoneId}`);
    return response.data;
  },

  // Zone analytics
  getZoneStatistics: async (zoneId, params = {}) => {
    const response = await apiClient.get(`/zones/${zoneId}/stats`, { params });
    return response.data;
  },

  // Check if point is inside zone
  checkPointInZone: async (lat, lon, zoneId = null) => {
    const response = await apiClient.post('/zones/check-point', {
      lat,
      lon,
      zone_id: zoneId
    });
    return response.data;
  },

  // Get zones by type
  getZonesByType: async (zoneType) => {
    const response = await apiClient.get('/zones/list', {
      params: { type: zoneType }
    });
    return response.data;
  },

  // Activate/deactivate zone
  toggleZoneStatus: async (zoneId, isActive) => {
    const response = await apiClient.put(`/zones/${zoneId}/status`, {
      is_active: isActive
    });
    return response.data;
  },

  // Public heatmap data (for public zones display)
  getPublicHeatmap: async (bounds, zoneType = 'all') => {
    const response = await apiClient.get('/heatmap/zones', {
      params: { ...bounds, zone_type: zoneType }
    });
    return response.data;
  },
};

// E-FIR Management API
export const efirAPI = {
  // Authority E-FIR generation (police dashboard)
  generateEFIR: async (efirData) => {
    const response = await apiClient.post('/api/authority/efir/generate', efirData);
    return response.data;
  },

  // Authority E-FIR list with filtering
  listEFIRs: async (params = {}) => {
    const response = await apiClient.get('/api/authority/efir/list', { params });
    return response.data;
  },

  // Get E-FIR details
  getEFIRDetails: async (efirId) => {
    const response = await apiClient.get(`/authority/efir/${efirId}`);
    return response.data;
  },

  // Update E-FIR status
  updateEFIRStatus: async (efirId, status, notes = '') => {
    const response = await apiClient.put(`/authority/efir/${efirId}/status`, {
      status,
      notes
    });
    return response.data;
  },

  // Verify E-FIR on blockchain
  verifyEFIR: async (efirId) => {
    const response = await apiClient.get(`/authority/efir/${efirId}/verify`);
    return response.data;
  },

  // Verify by blockchain transaction hash
  verifyByBlockchainTx: async (blockchainTxId) => {
    const response = await apiClient.get(`/blockchain/verify/${blockchainTxId}`);
    return response.data;
  },

  // Export E-FIR as PDF
  exportEFIRPDF: async (efirId) => {
    const response = await apiClient.get(`/authority/efir/${efirId}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Get E-FIR statistics
  getEFIRStats: async (params = {}) => {
    const response = await apiClient.get('/authority/efir/stats', { params });
    return response.data;
  },

  // Search E-FIRs
  searchEFIRs: async (searchParams) => {
    const response = await apiClient.post('/authority/efir/search', searchParams);
    return response.data;
  },

  // Tourist E-FIR generation (for compatibility)
  generateTouristEFIR: async (efirData) => {
    const response = await apiClient.post('/efir/generate', efirData);
    return response.data;
  },

  // Tourist E-FIR list
  getTouristEFIRs: async (params = {}) => {
    const response = await apiClient.get('/efir/my-reports', { params });
    return response.data;
  },

  // Get public E-FIR details (accessible by tourist)
  getPublicEFIRDetails: async (efirId) => {
    const response = await apiClient.get(`/efir/${efirId}`);
    return response.data;
  },

  // Bulk operations for authorities
  bulkVerifyEFIRs: async (efirIds) => {
    const response = await apiClient.post('/authority/efir/bulk/verify', {
      efir_ids: efirIds
    });
    return response.data;
  },

  bulkUpdateStatus: async (efirIds, status, notes = '') => {
    const response = await apiClient.post('/authority/efir/bulk/status', {
      efir_ids: efirIds,
      status,
      notes
    });
    return response.data;
  },

  // E-FIR workflow management
  assignEFIR: async (efirId, officerId) => {
    const response = await apiClient.put(`/authority/efir/${efirId}/assign`, {
      officer_id: officerId
    });
    return response.data;
  },

  addEFIRNote: async (efirId, note) => {
    const response = await apiClient.post(`/authority/efir/${efirId}/notes`, {
      note
    });
    return response.data;
  },

  getEFIRHistory: async (efirId) => {
    const response = await apiClient.get(`/authority/efir/${efirId}/history`);
    return response.data;
  },
};

// Heatmap & Analytics API
export const heatmapAPI = {
  // Get comprehensive heatmap data for dashboard
  getHeatmapData: async (params = {}) => {
    const response = await apiClient.get('/api/heatmap/data', { params });
    return response.data;
  },

  // Get zones for heatmap visualization with risk weights
  getHeatmapZones: async (params = {}) => {
    const response = await apiClient.get('/api/heatmap/zones', { params });
    return response.data;
  },

  // Get alerts for heatmap visualization with location data
  getHeatmapAlerts: async (params = {}) => {
    const response = await apiClient.get('/api/heatmap/alerts', { params });
    return response.data;
  },

  // Get tourist locations for real-time monitoring
  getHeatmapTourists: async (params = {}) => {
    const response = await apiClient.get('/api/heatmap/tourists', { params });
    return response.data;
  },

  // Get hotspots analysis
  getHotspots: async (params = {}) => {
    const response = await apiClient.get('/heatmap/hotspots', { params });
    return response.data;
  },

  // Get heatmap data filtered by bounds (for map viewport)
  getHeatmapByBounds: async (bounds, params = {}) => {
    const response = await apiClient.get('/heatmap/data', { 
      params: { 
        bounds_north: bounds.north,
        bounds_south: bounds.south,
        bounds_east: bounds.east,
        bounds_west: bounds.west,
        ...params 
      } 
    });
    return response.data;
  },

  // Get real-time heatmap updates
  getHeatmapUpdates: async (lastUpdate, params = {}) => {
    const response = await apiClient.get('/heatmap/updates', { 
      params: { last_update: lastUpdate, ...params } 
    });
    return response.data;
  },

  // Analytics and insights
  getHeatmapInsights: async (params = {}) => {
    const response = await apiClient.get('/heatmap/insights', { params });
    return response.data;
  },

  // Historical heatmap data
  getHistoricalHeatmap: async (date, params = {}) => {
    const response = await apiClient.get('/heatmap/historical', { 
      params: { date, ...params } 
    });
    return response.data;
  },

  // Risk assessment data
  getRiskAssessment: async (params = {}) => {
    const response = await apiClient.get('/heatmap/risk-assessment', { params });
    return response.data;
  },

  // Density analysis
  getDensityAnalysis: async (params = {}) => {
    const response = await apiClient.get('/heatmap/density', { params });
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  // System health and status
  getSystemHealth: async () => {
    const response = await apiClient.get('/admin/health');
    return response.data;
  },

  getSystemStatus: async () => {
    const response = await apiClient.get('/api/system/status');
    return response.data;
  },

  getSystemMetrics: async () => {
    const response = await apiClient.get('/admin/system/metrics');
    return response.data;
  },

  // User management with proper admin paths
  getUsersList: async (params = {}) => {
    const response = await apiClient.get('/api/users/list', { params });
    return response.data;
  },

  getUserDetails: async (userId) => {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data;
  },

  suspendUser: async (userId, reason = '') => {
    const response = await apiClient.put(`/api/users/${userId}/suspend`, {
      reason
    });
    return response.data;
  },

  activateUser: async (userId) => {
    const response = await apiClient.put(`/api/users/${userId}/activate`);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await apiClient.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  // Platform analytics and statistics
  getPlatformStats: async (period = '30d') => {
    const response = await apiClient.get('/api/analytics/dashboard', {
      params: { period }
    });
    return response.data;
  },

  getUserStats: async () => {
    const response = await apiClient.get('/admin/analytics/users');
    return response.data;
  },

  getAlertStats: async (period = '7d') => {
    const response = await apiClient.get('/admin/analytics/alerts', {
      params: { period }
    });
    return response.data;
  },

  getTripStats: async (period = '7d') => {
    const response = await apiClient.get('/admin/analytics/trips', {
      params: { period }
    });
    return response.data;
  },

  // AI model management
  retrainModel: async (modelType = 'all', hoursBack = 720) => {
    const response = await apiClient.post('/admin/ai/retrain', {
      model_type: modelType,
      hours_back: hoursBack
    });
    return response.data;
  },

  getModelStatus: async () => {
    const response = await apiClient.get('/admin/ai/model-status');
    return response.data;
  },

  getModelMetrics: async () => {
    const response = await apiClient.get('/admin/ai/model-metrics');
    return response.data;
  },

  reloadModels: async () => {
    const response = await apiClient.post('/admin/ai/reload-models');
    return response.data;
  },

  // Database management
  getDatabaseStats: async () => {
    const response = await apiClient.get('/admin/database/stats');
    return response.data;
  },

  createDatabaseBackup: async () => {
    const response = await apiClient.post('/admin/database/backup');
    return response.data;
  },

  listDatabaseBackups: async () => {
    const response = await apiClient.get('/admin/database/backups');
    return response.data;
  },

  restoreDatabaseBackup: async (backupId) => {
    const response = await apiClient.post(`/admin/database/restore/${backupId}`);
    return response.data;
  },

  optimizeDatabase: async () => {
    const response = await apiClient.post('/admin/database/optimize');
    return response.data;
  },

  // Performance monitoring
  getPerformanceMetrics: async () => {
    const response = await apiClient.get('/admin/performance');
    return response.data;
  },

  getApiMetrics: async (timeRange = '24h') => {
    const response = await apiClient.get('/admin/api-metrics', {
      params: { time_range: timeRange }
    });
    return response.data;
  },

  // System logs and diagnostics
  getSystemLogs: async (level = 'all', limit = 100) => {
    const response = await apiClient.get('/admin/logs', {
      params: { level, limit }
    });
    return response.data;
  },

  getErrorLogs: async (limit = 50) => {
    const response = await apiClient.get('/admin/logs/errors', {
      params: { limit }
    });
    return response.data;
  },

  runDiagnostics: async () => {
    const response = await apiClient.post('/admin/diagnostics');
    return response.data;
  },

  // Configuration management
  getSystemConfig: async () => {
    const response = await apiClient.get('/admin/config');
    return response.data;
  },

  updateSystemConfig: async (config) => {
    const response = await apiClient.put('/admin/config', config);
    return response.data;
  },

  // Security and monitoring
  getSecurityLogs: async (limit = 100) => {
    const response = await apiClient.get('/admin/security/logs', {
      params: { limit }
    });
    return response.data;
  },

  getFailedLogins: async (timeRange = '24h') => {
    const response = await apiClient.get('/admin/security/failed-logins', {
      params: { time_range: timeRange }
    });
    return response.data;
  },

  // Notification management
  getNotificationStats: async () => {
    const response = await apiClient.get('/admin/notifications/stats');
    return response.data;
  },

  testNotificationSystems: async () => {
    const response = await apiClient.post('/admin/notifications/test');
    return response.data;
  },
};

// AI Services API
export const aiAPI = {
  // Geofencing analysis
  checkGeofence: async (lat, lon, touristId = null) => {
    const response = await apiClient.post('/ai/geofence/check', {
      lat,
      lon,
      tourist_id: touristId,
    });
    return response.data;
  },

  getNearbyZones: async (lat, lon, radius = 1000) => {
    const response = await apiClient.post('/ai/geofence/nearby', {
      lat,
      lon,
    }, {
      params: { radius }
    });
    return response.data;
  },

  // Anomaly detection
  detectPointAnomaly: async (touristId, lat, lon, speed, timeOfDay) => {
    const response = await apiClient.post('/ai/anomaly/detect-point', {
      tourist_id: touristId,
      lat,
      lon,
      speed,
      time_of_day: timeOfDay,
    });
    return response.data;
  },

  detectSequenceAnomaly: async (touristId, hoursBack = 24) => {
    const response = await apiClient.post('/ai/anomaly/detect-sequence', {
      tourist_id: touristId,
      hours_back: hoursBack,
    });
    return response.data;
  },

  // Safety score computation
  computeSafetyScore: async (touristId, lat, lon) => {
    const response = await apiClient.post('/ai/safety/compute', {
      tourist_id: touristId,
      lat,
      lon,
    });
    return response.data;
  },

  // Alert classification
  classifyAlert: async (alertType, safetyScore, location, context) => {
    const response = await apiClient.post('/ai/alert/classify', {
      alert_type: alertType,
      safety_score: safetyScore,
      location,
      context,
    });
    return response.data;
  },

  // Model status and information
  getModelsStatus: async () => {
    const response = await apiClient.get('/ai/models/status');
    return response.data;
  },

  // Model predictions and insights
  getPredictionInsights: async (touristId, hoursBack = 24) => {
    const response = await apiClient.get('/ai/insights/predictions', {
      params: { tourist_id: touristId, hours_back: hoursBack }
    });
    return response.data;
  },

  // Behavior analysis
  analyzeBehavior: async (touristId, params = {}) => {
    const response = await apiClient.get('/ai/behavior/analyze', {
      params: { tourist_id: touristId, ...params }
    });
    return response.data;
  },

  // Risk assessment
  assessRisk: async (location, timeOfDay, touristProfile = {}) => {
    const response = await apiClient.post('/ai/risk/assess', {
      location,
      time_of_day: timeOfDay,
      tourist_profile: touristProfile,
    });
    return response.data;
  },
};

// Notification API
export const notificationAPI = {
  // Push notifications
  sendPushNotification: async (touristId, title, message, data = {}) => {
    const response = await apiClient.post('/notify/push', {
      tourist_id: touristId,
      title,
      message,
      data,
    });
    return response.data;
  },

  // SMS notifications
  sendSMS: async (phone, message) => {
    const response = await apiClient.post('/notify/sms', {
      phone,
      message,
    });
    return response.data;
  },

  // Emergency alerts
  sendEmergencyAlert: async (touristId, alertType, location, message) => {
    const response = await apiClient.post('/notify/emergency', {
      tourist_id: touristId,
      alert_type: alertType,
      location,
      message,
    });
    return response.data;
  },

  // Notification history
  getNotificationHistory: async (params = {}) => {
    const response = await apiClient.get('/notify/history', { params });
    return response.data;
  },

  // Notification settings
  getNotificationSettings: async (userId) => {
    const response = await apiClient.get(`/notify/settings/${userId}`);
    return response.data;
  },

  updateNotificationSettings: async (userId, settings) => {
    const response = await apiClient.put(`/notify/settings/${userId}`, settings);
    return response.data;
  },

  // Notification templates
  getNotificationTemplates: async () => {
    const response = await apiClient.get('/notify/templates');
    return response.data;
  },

  createNotificationTemplate: async (templateData) => {
    const response = await apiClient.post('/notify/templates', templateData);
    return response.data;
  },

  // Notification analytics
  getNotificationStats: async (params = {}) => {
    const response = await apiClient.get('/notify/stats', { params });
    return response.data;
  },

  // Bulk notifications
  sendBulkNotifications: async (recipients, message, type = 'push') => {
    const response = await apiClient.post('/notify/bulk', {
      recipients,
      message,
      type,
    });
    return response.data;
  },

  // Device management for notifications
  registerDevice: async (deviceData) => {
    const response = await apiClient.post('/notify/device/register', deviceData);
    return response.data;
  },

  unregisterDevice: async (deviceToken) => {
    const response = await apiClient.post('/notify/device/unregister', {
      device_token: deviceToken,
    });
    return response.data;
  },

  // Notification testing
  testNotification: async (testData) => {
    const response = await apiClient.post('/notify/test', testData);
    return response.data;
  },
};

// Emergency Broadcast API
export const emergencyAPI = {
  // Emergency broadcasting for area-wide alerts
  broadcastEmergencyAlert: async (alertData) => {
    const response = await apiClient.post('/emergency/broadcast', alertData);
    return response.data;
  },

  // Broadcast to specific radius
  broadcastToRadius: async (broadcastData) => {
    const response = await apiClient.post('/api/broadcast/radius', broadcastData);
    return response.data;
  },

  // Broadcast to specific zone
  broadcastToZone: async (broadcastData) => {
    const response = await apiClient.post('/api/broadcast/zone', broadcastData);
    return response.data;
  },

  // Broadcast to specific region (bounds-based)
  broadcastToRegion: async (broadcastData) => {
    const response = await apiClient.post('/broadcast/region', broadcastData);
    return response.data;
  },

  // Broadcast to all tourists
  broadcastToAll: async (broadcastData) => {
    const response = await apiClient.post('/api/broadcast/all', broadcastData);
    return response.data;
  },

  // Get broadcast history
  getBroadcastHistory: async (params = {}) => {
    const response = await apiClient.get('/broadcast/history', { params });
    return response.data;
  },

  // Get broadcast details
  getBroadcastDetails: async (broadcastId) => {
    const response = await apiClient.get(`/broadcast/${broadcastId}`);
    return response.data;
  },

  // Get broadcast analytics
  getBroadcastAnalytics: async (broadcastId) => {
    const response = await apiClient.get(`/broadcast/${broadcastId}/analytics`);
    return response.data;
  },

  // Cancel active broadcast
  cancelBroadcast: async (broadcastId) => {
    const response = await apiClient.post(`/broadcast/${broadcastId}/cancel`);
    return response.data;
  },

  // Get broadcast templates
  getBroadcastTemplates: async () => {
    const response = await apiClient.get('/broadcast/templates');
    return response.data;
  },

  // Create broadcast template
  createBroadcastTemplate: async (templateData) => {
    const response = await apiClient.post('/broadcast/templates', templateData);
    return response.data;
  },

  // Update broadcast template
  updateBroadcastTemplate: async (templateId, templateData) => {
    const response = await apiClient.put(`/broadcast/templates/${templateId}`, templateData);
    return response.data;
  },

  // Delete broadcast template
  deleteBroadcastTemplate: async (templateId) => {
    const response = await apiClient.delete(`/broadcast/templates/${templateId}`);
    return response.data;
  },

  // Get broadcast statistics
  getBroadcastStats: async (params = {}) => {
    const response = await apiClient.get('/broadcast/stats', { params });
    return response.data;
  },
};

// =============================================================================
// BROADCAST & NOTIFICATION SERVICES (NEW)
// =============================================================================

/**
 * Import comprehensive broadcast and notification services
 * These services handle all broadcast and notification operations for:
 * - Authority Platform (sending broadcasts)
 * - Mobile Tourist App (receiving notifications)
 * - Notification management and settings
 */
import {
  broadcastAPI,
  mobileNotificationAPI,
  authorityNotificationAPI,
  notificationSettingsAPI,
} from './broadcastService.js';

// Export broadcast services
export { 
  broadcastAPI,
  mobileNotificationAPI,
  authorityNotificationAPI,
  notificationSettingsAPI,
};