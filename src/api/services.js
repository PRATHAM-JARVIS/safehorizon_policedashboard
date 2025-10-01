import { apiClient } from './client.js';

// Authentication API
export const authAPI = {
  // Authority authentication
  loginAuthority: async (email, password) => {
    const response = await apiClient.post('/auth/login-authority', {
      email,
      password,
    });
    return response.data;
  },

  registerAuthority: async (data) => {
    const response = await apiClient.post('/auth/register-authority', data);
    return response.data;
  },

  // Tourist authentication
  loginTourist: async (email, password) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  registerTourist: async (data) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  // Common auth endpoints
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Debug endpoint
  debugRole: async () => {
    const response = await apiClient.get('/debug/role');
    return response.data;
  },
};

// Tourist Management API
export const touristAPI = {
  // Authority endpoints for tourist monitoring
  getActiveTourists: async () => {
    const response = await apiClient.get('/tourists/active');
    return response.data;
  },

  trackTourist: async (touristId) => {
    const response = await apiClient.get(`/tourist/${touristId}/track`);
    return response.data;
  },

  getTouristAlerts: async (touristId) => {
    const response = await apiClient.get(`/tourist/${touristId}/alerts`);
    return response.data;
  },

  // NEW: Get comprehensive tourist profile
  getTouristProfile: async (touristId) => {
    const response = await apiClient.get(`/tourist/${touristId}/profile`);
    return response.data;
  },

  // NEW: Get tourist current location
  getCurrentLocation: async (touristId) => {
    const response = await apiClient.get(`/tourist/${touristId}/location/current`);
    return response.data;
  },

  // NEW: Get location history with filters (authority endpoint)
  getLocationHistoryForTourist: async (touristId, params = {}) => {
    const response = await apiClient.get(`/tourist/${touristId}/location-history`, { params });
    return response.data;
  },

  // NEW: Get movement analysis
  getMovementAnalysis: async (touristId, hours = 24) => {
    const response = await apiClient.get(`/tourist/${touristId}/movement-analysis`, {
      params: { hours }
    });
    return response.data;
  },

  // NEW: Get safety timeline
  getSafetyTimeline: async (touristId) => {
    const response = await apiClient.get(`/tourist/${touristId}/safety-timeline`);
    return response.data;
  },

  // NEW: Get emergency contacts (use only in emergencies)
  getEmergencyContacts: async (touristId) => {
    const response = await apiClient.get(`/tourist/${touristId}/emergency-contacts`);
    return response.data;
  },

  // Trip management (tourist endpoints)
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

  // Location tracking
  updateLocation: async (locationData) => {
    const response = await apiClient.post('/location/update', locationData);
    return response.data;
  },

  getLocationHistory: async (hours = 24) => {
    const response = await apiClient.get('/location/history', {
      params: { hours }
    });
    return response.data;
  },

  // Safety
  getSafetyScore: async () => {
    const response = await apiClient.get('/safety/score');
    return response.data;
  },

  triggerSOS: async () => {
    const response = await apiClient.post('/sos/trigger');
    return response.data;
  },
};

// Alerts Management API
export const alertsAPI = {
  getRecentAlerts: async (params = {}) => {
    const response = await apiClient.get('/alerts/recent', { params });
    return response.data;
  },

  // Incident management
  acknowledgeIncident: async (alertId, notes = '') => {
    const response = await apiClient.post('/incident/acknowledge', {
      alert_id: alertId,
      notes,
    });
    return response.data;
  },

  closeIncident: async (incidentId, resolutionNotes = '', status = 'resolved') => {
    const response = await apiClient.post('/incident/close', {
      incident_id: incidentId,
      resolution_notes: resolutionNotes,
      status,
    });
    return response.data;
  },

  // WebSocket subscription URL helper
  getWebSocketURL: (token) => {
    const wsBase = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';
    return `${wsBase}/api/alerts/subscribe?token=${token}`;
  },
};

// Zones Management API
export const zonesAPI = {
  // Public zone endpoints
  listZones: async () => {
    const response = await apiClient.get('/zones/list');
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
    const response = await apiClient.get('/zones/manage');
    return response.data;
  },

  createZone: async (zoneData) => {
    const response = await apiClient.post('/zones/create', zoneData);
    return response.data;
  },

  updateZone: async (zoneId, zoneData) => {
    const response = await apiClient.put(`/zones/${zoneId}`, zoneData);
    return response.data;
  },

  deleteZone: async (zoneId) => {
    const response = await apiClient.delete(`/zones/${zoneId}`);
    return response.data;
  },

  // Public heatmap data
  getPublicHeatmap: async (bounds, zoneType = 'all') => {
    const response = await apiClient.get('/heatmap/zones/public', {
      params: { ...bounds, zone_type: zoneType }
    });
    return response.data;
  },
};

// E-FIR Management API
export const efirAPI = {
  generateEFIR: async (efirData) => {
    const response = await apiClient.post('/efir/generate', efirData);
    return response.data;
  },

  listEFIRs: async (params = {}) => {
    const response = await apiClient.get('/authority/efir/list', { params });
    return response.data;
  },

  verifyEFIR: async (blockchainTxId) => {
    const response = await apiClient.get(`/blockchain/verify/${blockchainTxId}`);
    return response.data;
  },

  exportEFIRPDF: async (efirId) => {
    const response = await apiClient.get(`/efir/${efirId}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },
};

// Heatmap & Analytics API
export const heatmapAPI = {
  // Comprehensive heatmap data (authority only)
  getDashboardHeatmap: async (heatmapData) => {
    const response = await apiClient.post('/dashboard/heatmap', heatmapData);
    return response.data;
  },

  getHeatmapData: async (bounds, options = {}) => {
    const params = {
      ...bounds,
      hours_back: options.hoursBack || 24,
      include_zones: options.includeZones !== false,
      include_alerts: options.includeAlerts !== false,
      include_tourists: options.includeTourists !== false,
    };
    const response = await apiClient.get('/heatmap/data', { params });
    return response.data;
  },

  getZonesHeatmap: async (bounds, zoneType = 'all') => {
    const response = await apiClient.get('/heatmap/zones', {
      params: { ...bounds, zone_type: zoneType }
    });
    return response.data;
  },

  getAlertsHeatmap: async (bounds, options = {}) => {
    const params = {
      ...bounds,
      alert_type: options.alertType,
      severity: options.severity,
      hours_back: options.hoursBack || 24,
    };
    const response = await apiClient.get('/heatmap/alerts', { params });
    return response.data;
  },

  getTouristsHeatmap: async (bounds, options = {}) => {
    const params = {
      ...bounds,
      hours_back: options.hoursBack || 24,
      min_safety_score: options.minSafetyScore,
      max_safety_score: options.maxSafetyScore,
    };
    const response = await apiClient.get('/heatmap/tourists', { params });
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getSystemStatus: async () => {
    const response = await apiClient.get('/system/status');
    return response.data;
  },

  getUsersList: async (params = {}) => {
    const response = await apiClient.get('/users/list', { params });
    return response.data;
  },

  suspendUser: async (userId, reason) => {
    const response = await apiClient.put(`/users/${userId}/suspend`, {
      reason,
    });
    return response.data;
  },

  activateUser: async (userId) => {
    const response = await apiClient.put(`/users/${userId}/activate`);
    return response.data;
  },

  retrainModel: async (modelTypes = ['anomaly', 'sequence'], daysBack = 30) => {
    const response = await apiClient.post('/system/retrain-model', {
      model_types: modelTypes,
      days_back: daysBack,
    });
    return response.data;
  },

  getAnalyticsDashboard: async (days = 7) => {
    const response = await apiClient.get('/analytics/dashboard', {
      params: { days }
    });
    return response.data;
  },

  getDashboardStats: async (period = '24h') => {
    const response = await apiClient.get('/dashboard/statistics', {
      params: { period }
    });
    return response.data;
  },

  getPerformanceMetrics: async () => {
    const response = await apiClient.get('/system/performance');
    return response.data;
  },

  getActivityLogs: async (params = {}) => {
    const response = await apiClient.get('/system/logs', { params });
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  },

  getModelStatus: async (jobId) => {
    const response = await apiClient.get(`/system/retrain-model/${jobId}`);
    return response.data;
  },
};

// AI Services API
export const aiAPI = {
  // Geofencing
  checkGeofence: async (lat, lon) => {
    const response = await apiClient.post('/ai/geofence/check', {
      lat,
      lon,
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
  checkAnomalyPoint: async (lat, lon, speed, timestamp) => {
    const response = await apiClient.post('/ai/anomaly/point', {
      lat,
      lon,
      speed,
      timestamp,
    });
    return response.data;
  },

  checkAnomalySequence: async (points) => {
    const response = await apiClient.post('/ai/anomaly/sequence', {
      points,
    });
    return response.data;
  },

  // Safety scoring
  computeSafetyScore: async (lat, lon, locationHistory, currentLocationData, manualAdjustment = 0) => {
    const response = await apiClient.post('/ai/score/compute', {
      lat,
      lon,
      location_history: locationHistory,
      current_location_data: currentLocationData,
      manual_adjustment: manualAdjustment,
    });
    return response.data;
  },

  // Alert classification
  classifyAlert: async (safetyScore, alertType, locationData) => {
    const response = await apiClient.post('/ai/classify/alert', {
      safety_score: safetyScore,
      alert_type: alertType,
      location_data: locationData,
    });
    return response.data;
  },

  // Model status
  getModelsStatus: async () => {
    const response = await apiClient.get('/ai/models/status');
    return response.data;
  },
};

// Notification API
export const notificationAPI = {
  sendPushNotification: async (userId, title, body, token, data = {}) => {
    const response = await apiClient.post('/notify/push', {
      user_id: userId,
      title,
      body,
      token,
      data,
    });
    return response.data;
  },

  sendSMS: async (toNumber, body) => {
    const response = await apiClient.post('/notify/sms', {
      to_number: toNumber,
      body,
    });
    return response.data;
  },

  sendEmergencyAlert: async (touristId, alertType, location, message) => {
    const response = await apiClient.post('/notify/emergency', {
      tourist_id: touristId,
      alert_type: alertType,
      location,
      message,
    });
    return response.data;
  },

  broadcastNotification: async (title, body, targetGroup = 'all', data = {}) => {
    const response = await apiClient.post('/notify/broadcast', {
      title,
      body,
      target_group: targetGroup,
      data,
    });
    return response.data;
  },

  getNotificationHistory: async (limit = 50, type = null) => {
    const params = { limit };
    if (type) params.type = type;
    const response = await apiClient.get('/notify/history', { params });
    return response.data;
  },

  getNotificationSettings: async () => {
    const response = await apiClient.get('/notify/settings');
    return response.data;
  },

  updateNotificationSettings: async (settings) => {
    const response = await apiClient.put('/notify/settings', settings);
    return response.data;
  },
};

// Emergency Services API
export const emergencyAPI = {
  broadcastEmergencyAlert: async (alertData) => {
    const response = await apiClient.post('/emergency/broadcast', alertData);
    return response.data;
  },
};