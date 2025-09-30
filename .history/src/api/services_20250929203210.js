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
  generateEFIR: async (alertId, incidentDetails, location) => {
    const response = await apiClient.post('/efir/generate', {
      alert_id: alertId,
      incident_details: incidentDetails,
      location,
    });
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

  suspendUser: async (userId, isActive, reason) => {
    const response = await apiClient.put(`/users/${userId}/suspend`, {
      is_active: isActive,
      reason,
    });
    return response.data;
  },
};

// AI Services API
export const aiAPI = {
  checkGeofence: async (lat, lon) => {
    const response = await apiClient.post('/ai/geofence/check', { lat, lon });
    return response.data;
  },

  getNearbyZones: async (lat, lon, radius = 1000) => {
    const response = await apiClient.post('/ai/geofence/nearby', { lat, lon }, {
      params: { radius }
    });
    return response.data;
  },

  checkAnomalyPoint: async (data) => {
    const response = await apiClient.post('/ai/anomaly/point', data);
    return response.data;
  },

  computeSafetyScore: async (data) => {
    const response = await apiClient.post('/ai/score/compute', data);
    return response.data;
  },
};

// Notification API
export const notificationAPI = {
  sendPushNotification: async (touristId, title, message, data) => {
    const response = await apiClient.post('/notify/push', {
      tourist_id: touristId,
      title,
      message,
      data,
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

  getNotificationHistory: async () => {
    const response = await apiClient.get('/notify/history');
    return response.data;
  },
};