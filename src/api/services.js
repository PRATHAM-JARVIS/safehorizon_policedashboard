import { apiClient } from './client.js';

// Authentication API
export const authAPI = {
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

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Tourist auth endpoints
  registerTourist: async (data) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  loginTourist: async (email, password) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },
};

// Tourist Management API
export const touristAPI = {
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

  // Trip management
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

  acknowledgeIncident: async (alertId, notes) => {
    const response = await apiClient.post('/incident/acknowledge', {
      alert_id: alertId,
      notes,
    });
    return response.data;
  },

  closeIncident: async (alertId, notes) => {
    const response = await apiClient.post('/incident/close', {
      alert_id: alertId,
      notes,
    });
    return response.data;
  },
};

// Zones Management API
export const zonesAPI = {
  listZones: async () => {
    const response = await apiClient.get('/zones/list');
    return response.data;
  },

  manageZones: async () => {
    const response = await apiClient.get('/zones/manage');
    return response.data;
  },

  createZone: async (zoneData) => {
    const response = await apiClient.post('/zones/create', zoneData);
    return response.data;
  },

  deleteZone: async (zoneId) => {
    const response = await apiClient.delete(`/zones/${zoneId}`);
    return response.data;
  },
};

// E-FIR Management API
export const efirAPI = {
  generateEFIR: async (alertId, incidentType, description) => {
    const response = await apiClient.post('/efir/generate', {
      alert_id: alertId,
      incident_type: incidentType,
      description,
    });
    return response.data;
  },

  // Note: E-FIR listing endpoint not documented, may need to be added to backend
  listEFIRs: async (params = {}) => {
    try {
      const response = await apiClient.get('/efir/list', { params });
      return response.data;
    } catch (error) {
      // Fallback if endpoint doesn't exist yet
      console.warn('E-FIR list endpoint not available');
      return [];
    }
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

  retrainModel: async (modelType, dataRangeDays = 30) => {
    const response = await apiClient.post('/system/retrain-model', {
      model_type: modelType,
      data_range_days: dataRangeDays,
    });
    return response.data;
  },

  getAnalyticsDashboard: async (period = '7d') => {
    const response = await apiClient.get('/analytics/dashboard', {
      params: { period }
    });
    return response.data;
  },
};

// AI Services API
export const aiAPI = {
  checkGeofence: async (latitude, longitude, touristId) => {
    const response = await apiClient.post('/ai/geofence/check', {
      latitude,
      longitude,
      tourist_id: touristId,
    });
    return response.data;
  },

  getNearbyZones: async (latitude, longitude, radiusKm = 1.0) => {
    const response = await apiClient.post('/ai/geofence/nearby', {
      latitude,
      longitude,
      radius_km: radiusKm,
    });
    return response.data;
  },

  checkAnomalyPoint: async (data) => {
    const response = await apiClient.post('/ai/anomaly/point', data);
    return response.data;
  },

  checkAnomalySequence: async (sequence) => {
    const response = await apiClient.post('/ai/anomaly/sequence', {
      sequence,
    });
    return response.data;
  },

  computeSafetyScore: async (touristId, currentLocation, movementData) => {
    const response = await apiClient.post('/ai/score/compute', {
      tourist_id: touristId,
      current_location: currentLocation,
      movement_data: movementData,
    });
    return response.data;
  },

  classifyAlert: async (alertType, locationData, context) => {
    const response = await apiClient.post('/ai/classify/alert', {
      alert_type: alertType,
      location_data: locationData,
      context,
    });
    return response.data;
  },

  getModelsStatus: async () => {
    const response = await apiClient.get('/ai/models/status');
    return response.data;
  },
};

// Notification API
export const notificationAPI = {
  sendPushNotification: async (userId, title, body, data) => {
    const response = await apiClient.post('/notify/push', {
      user_id: userId,
      title,
      body,
      data,
    });
    return response.data;
  },

  sendSMS: async (phoneNumber, message) => {
    const response = await apiClient.post('/notify/sms', {
      phone_number: phoneNumber,
      message,
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

  broadcastNotification: async (channels, touristId, title, message, priority) => {
    const response = await apiClient.post('/notify/broadcast', {
      channels,
      tourist_id: touristId,
      title,
      message,
      priority,
    });
    return response.data;
  },

  getNotificationHistory: async (userId, days = 7) => {
    const response = await apiClient.get('/notify/history', {
      params: { user_id: userId, days }
    });
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