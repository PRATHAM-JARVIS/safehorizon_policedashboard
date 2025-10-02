import { apiClient } from './client.js';

/**
 * Broadcast & Notification Service for SafeHorizon
 * Handles all broadcast and notification operations for Authority Platform
 * 
 * @module broadcastService
 */

// =============================================================================
// AUTHORITY BROADCAST ENDPOINTS
// =============================================================================

/**
 * Broadcast Service - Send emergency alerts to tourists
 */
export const broadcastAPI = {
  /**
   * Send radius-based broadcast to tourists within X km of a location
   * @param {Object} broadcastData - Broadcast configuration
   * @param {number} broadcastData.center_latitude - Center point latitude
   * @param {number} broadcastData.center_longitude - Center point longitude
   * @param {number} broadcastData.radius_km - Radius in kilometers
   * @param {string} broadcastData.title - Alert title
   * @param {string} broadcastData.message - Alert message
   * @param {string} broadcastData.severity - 'low' | 'medium' | 'high' | 'critical'
   * @param {string} broadcastData.alert_type - Type of alert
   * @param {string} broadcastData.action_required - Required action
   * @param {string} [broadcastData.expires_at] - ISO timestamp when broadcast expires
   */
  sendRadiusBroadcast: async (broadcastData) => {
    const response = await apiClient.post('/api/broadcast/radius', {
      center_latitude: broadcastData.center_latitude,
      center_longitude: broadcastData.center_longitude,
      radius_km: broadcastData.radius_km,
      title: broadcastData.title,
      message: broadcastData.message,
      severity: broadcastData.severity,
      alert_type: broadcastData.alert_type,
      action_required: broadcastData.action_required,
      expires_at: broadcastData.expires_at,
    });
    return response.data;
  },

  /**
   * Send zone-based broadcast to tourists in a specific zone
   * @param {Object} broadcastData - Broadcast configuration
   * @param {number} broadcastData.zone_id - Zone ID
   * @param {string} broadcastData.title - Alert title
   * @param {string} broadcastData.message - Alert message
   * @param {string} broadcastData.severity - 'low' | 'medium' | 'high' | 'critical'
   * @param {string} broadcastData.alert_type - Type of alert
   * @param {string} broadcastData.action_required - Required action
   */
  sendZoneBroadcast: async (broadcastData) => {
    const response = await apiClient.post('/api/broadcast/zone', {
      zone_id: broadcastData.zone_id,
      title: broadcastData.title,
      message: broadcastData.message,
      severity: broadcastData.severity,
      alert_type: broadcastData.alert_type,
      action_required: broadcastData.action_required,
    });
    return response.data;
  },

  /**
   * Send region-based broadcast to tourists in a bounding box
   * @param {Object} broadcastData - Broadcast configuration
   * @param {Object} broadcastData.region_bounds - Bounding box coordinates
   * @param {number} broadcastData.region_bounds.min_lat - Minimum latitude
   * @param {number} broadcastData.region_bounds.max_lat - Maximum latitude
   * @param {number} broadcastData.region_bounds.min_lon - Minimum longitude
   * @param {number} broadcastData.region_bounds.max_lon - Maximum longitude
   * @param {string} broadcastData.title - Alert title
   * @param {string} broadcastData.message - Alert message
   * @param {string} broadcastData.severity - 'low' | 'medium' | 'high' | 'critical'
   * @param {string} broadcastData.alert_type - Type of alert
   * @param {string} broadcastData.action_required - Required action
   */
  sendRegionBroadcast: async (broadcastData) => {
    const response = await apiClient.post('/api/broadcast/region', {
      region_bounds: broadcastData.region_bounds,
      title: broadcastData.title,
      message: broadcastData.message,
      severity: broadcastData.severity,
      alert_type: broadcastData.alert_type,
      action_required: broadcastData.action_required,
    });
    return response.data;
  },

  /**
   * Send broadcast to ALL active tourists (state-wide emergency)
   * @param {Object} broadcastData - Broadcast configuration
   * @param {string} broadcastData.title - Alert title
   * @param {string} broadcastData.message - Alert message
   * @param {string} broadcastData.severity - 'low' | 'medium' | 'high' | 'critical'
   * @param {string} broadcastData.alert_type - Type of alert
   * @param {string} broadcastData.action_required - Required action
   */
  sendAllBroadcast: async (broadcastData) => {
    const response = await apiClient.post('/api/broadcast/all', {
      title: broadcastData.title,
      message: broadcastData.message,
      severity: broadcastData.severity,
      alert_type: broadcastData.alert_type,
      action_required: broadcastData.action_required,
    });
    return response.data;
  },

  /**
   * Get broadcast history with pagination
   * @param {Object} [params] - Query parameters
   * @param {number} [params.limit=50] - Number of broadcasts to return
   * @param {number} [params.offset=0] - Pagination offset
   */
  getBroadcastHistory: async (params = {}) => {
    const response = await apiClient.get('/api/broadcast/history', {
      params: {
        limit: params.limit || 50,
        offset: params.offset || 0,
      }
    });
    return response.data;
  },

  /**
   * Get detailed information about a specific broadcast
   * @param {string} broadcastId - Broadcast ID
   */
  getBroadcastDetails: async (broadcastId) => {
    const response = await apiClient.get(`/api/broadcast/${broadcastId}`);
    return response.data;
  },

  /**
   * Get acknowledgments for a specific broadcast
   * @param {string} broadcastId - Broadcast ID
   * @param {Object} [params] - Query parameters
   * @param {number} [params.limit=100] - Number of acknowledgments to return
   * @param {number} [params.offset=0] - Pagination offset
   */
  getBroadcastAcknowledgments: async (broadcastId, params = {}) => {
    const response = await apiClient.get(`/api/broadcast/${broadcastId}/acknowledgments`, {
      params: {
        limit: params.limit || 100,
        offset: params.offset || 0,
      }
    });
    return response.data;
  },

  /**
   * Cancel an active broadcast
   * @param {string} broadcastId - Broadcast ID
   * @param {string} [reason] - Cancellation reason
   */
  cancelBroadcast: async (broadcastId, reason = '') => {
    const response = await apiClient.post(`/api/broadcast/${broadcastId}/cancel`, {
      reason,
    });
    return response.data;
  },
};

// =============================================================================
// MOBILE TOURIST NOTIFICATION ENDPOINTS
// =============================================================================

/**
 * Mobile Notification Service - For tourist mobile apps
 */
export const mobileNotificationAPI = {
  /**
   * Register device for push notifications (called after login)
   * @param {Object} deviceData - Device information
   * @param {string} deviceData.device_token - FCM device token
   * @param {string} deviceData.device_type - 'android' | 'ios'
   * @param {string} [deviceData.device_name] - Device name
   * @param {string} [deviceData.app_version] - App version
   */
  registerDevice: async (deviceData) => {
    const response = await apiClient.post('/device/register', {
      device_token: deviceData.device_token,
      device_type: deviceData.device_type,
      device_name: deviceData.device_name,
      app_version: deviceData.app_version,
    });
    return response.data;
  },

  /**
   * Unregister device from push notifications (called on logout)
   * @param {string} deviceToken - FCM device token
   */
  unregisterDevice: async (deviceToken) => {
    const response = await apiClient.delete(`/device/unregister?device_token=${deviceToken}`);
    return response.data;
  },

  /**
   * Update device token (called when FCM token refreshes)
   * @param {string} oldToken - Old FCM device token
   * @param {string} newToken - New FCM device token
   */
  updateDeviceToken: async (oldToken, newToken) => {
    const response = await apiClient.post('/device/update-token', {
      old_token: oldToken,
      new_token: newToken,
    });
    return response.data;
  },

  /**
   * List registered devices for the current user
   */
  listDevices: async () => {
    const response = await apiClient.get('/device/list');
    return response.data;
  },

  /**
   * Get active broadcasts affecting the tourist
   * @param {Object} [params] - Query parameters
   * @param {number} [params.lat] - Current latitude
   * @param {number} [params.lon] - Current longitude
   */
  getActiveBroadcasts: async (params = {}) => {
    const response = await apiClient.get('/broadcasts/active', {
      params: {
        lat: params.lat,
        lon: params.lon,
      }
    });
    return response.data;
  },

  /**
   * Acknowledge receipt of a broadcast
   * @param {string} broadcastId - Broadcast ID
   * @param {Object} acknowledgmentData - Acknowledgment details
   * @param {string} acknowledgmentData.status - 'safe' | 'need_help' | 'evacuating'
   * @param {Object} [acknowledgmentData.current_location] - Current location
   * @param {number} acknowledgmentData.current_location.lat - Latitude
   * @param {number} acknowledgmentData.current_location.lon - Longitude
   * @param {string} [acknowledgmentData.notes] - Additional notes
   */
  acknowledgeBroadcast: async (broadcastId, acknowledgmentData) => {
    const response = await apiClient.post(`/broadcasts/${broadcastId}/acknowledge`, {
      status: acknowledgmentData.status,
      current_location: acknowledgmentData.current_location,
      notes: acknowledgmentData.notes,
    });
    return response.data;
  },

  /**
   * Get notification history for the tourist
   * @param {Object} [params] - Query parameters
   * @param {number} [params.limit=50] - Number of notifications to return
   * @param {number} [params.offset=0] - Pagination offset
   */
  getNotificationHistory: async (params = {}) => {
    const response = await apiClient.get('/broadcasts/history', {
      params: {
        limit: params.limit || 50,
        offset: params.offset || 0,
      }
    });
    return response.data;
  },

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   */
  markNotificationRead: async (notificationId) => {
    const response = await apiClient.post(`/tourist/notification/${notificationId}/read`);
    return response.data;
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async () => {
    const response = await apiClient.get('/tourist/notifications/unread-count');
    return response.data;
  },
};

// =============================================================================
// AUTHORITY NOTIFICATION MANAGEMENT
// =============================================================================

/**
 * Authority Notification Management - For managing notification settings and history
 */
export const authorityNotificationAPI = {
  /**
   * Get notification history for authority (alerts sent by them)
   * @param {Object} [params] - Query parameters
   * @param {number} [params.limit=50] - Number of notifications to return
   * @param {number} [params.offset=0] - Pagination offset
   * @param {string} [params.type] - Filter by notification type
   */
  getNotificationHistory: async (params = {}) => {
    const response = await apiClient.get('/authority/notifications/history', {
      params: {
        limit: params.limit || 50,
        offset: params.offset || 0,
        type: params.type,
      }
    });
    return response.data;
  },

  /**
   * Get notification delivery statistics
   * @param {string} [startDate] - Start date (ISO format)
   * @param {string} [endDate] - End date (ISO format)
   */
  getNotificationStats: async (startDate, endDate) => {
    const response = await apiClient.get('/authority/notifications/stats', {
      params: {
        start_date: startDate,
        end_date: endDate,
      }
    });
    return response.data;
  },

  /**
   * Send targeted notification to specific tourists
   * @param {Object} notificationData - Notification configuration
   * @param {string[]} notificationData.tourist_ids - Array of tourist IDs
   * @param {string} notificationData.title - Notification title
   * @param {string} notificationData.message - Notification message
   * @param {string} [notificationData.severity] - 'low' | 'medium' | 'high' | 'critical'
   * @param {Object} [notificationData.data] - Additional data payload
   */
  sendTargetedNotification: async (notificationData) => {
    const response = await apiClient.post('/authority/notifications/targeted', {
      tourist_ids: notificationData.tourist_ids,
      title: notificationData.title,
      message: notificationData.message,
      severity: notificationData.severity,
      data: notificationData.data,
    });
    return response.data;
  },

  /**
   * Send notification to a single tourist
   * @param {string} touristId - Tourist ID
   * @param {Object} notificationData - Notification configuration
   * @param {string} notificationData.title - Notification title
   * @param {string} notificationData.message - Notification message
   * @param {string} [notificationData.severity] - 'low' | 'medium' | 'high' | 'critical'
   * @param {Object} [notificationData.data] - Additional data payload
   */
  sendNotificationToTourist: async (touristId, notificationData) => {
    const response = await apiClient.post(`/authority/tourist/${touristId}/notify`, {
      title: notificationData.title,
      message: notificationData.message,
      severity: notificationData.severity,
      data: notificationData.data,
    });
    return response.data;
  },

  /**
   * Get failed notification deliveries
   * @param {Object} [params] - Query parameters
   * @param {number} [params.limit=50] - Number of failures to return
   * @param {number} [params.offset=0] - Pagination offset
   */
  getFailedDeliveries: async (params = {}) => {
    const response = await apiClient.get('/authority/notifications/failed', {
      params: {
        limit: params.limit || 50,
        offset: params.offset || 0,
      }
    });
    return response.data;
  },

  /**
   * Retry failed notification delivery
   * @param {string} notificationId - Notification ID
   */
  retryNotification: async (notificationId) => {
    const response = await apiClient.post(`/authority/notification/${notificationId}/retry`);
    return response.data;
  },
};

// =============================================================================
// SYSTEM NOTIFICATION SETTINGS
// =============================================================================

/**
 * Notification Settings - Manage notification preferences
 */
export const notificationSettingsAPI = {
  /**
   * Get notification settings for current user
   */
  getSettings: async () => {
    const response = await apiClient.get('/notifications/settings');
    return response.data;
  },

  /**
   * Update notification settings
   * @param {Object} settings - Notification settings
   * @param {boolean} [settings.push_enabled] - Enable push notifications
   * @param {boolean} [settings.sms_enabled] - Enable SMS notifications
   * @param {boolean} [settings.email_enabled] - Enable email notifications
   * @param {string[]} [settings.alert_types] - Alert types to receive
   * @param {string[]} [settings.severity_levels] - Severity levels to receive
   */
  updateSettings: async (settings) => {
    const response = await apiClient.put('/notifications/settings', settings);
    return response.data;
  },

  /**
   * Test notification delivery
   * @param {string} type - 'push' | 'sms' | 'email'
   */
  testNotification: async (type) => {
    const response = await apiClient.post('/notifications/test', { type });
    return response.data;
  },
};

// =============================================================================
// EXPORT ALL SERVICES
// =============================================================================

export default {
  broadcast: broadcastAPI,
  mobile: mobileNotificationAPI,
  authority: authorityNotificationAPI,
  settings: notificationSettingsAPI,
};
