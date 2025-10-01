# 🚀 Quick Reference: New Authority API Endpoints

## 📍 Tourist Monitoring Endpoints

### Get Tourist Profile
```javascript
import { touristAPI } from './api/services.js';

const profile = await touristAPI.getTouristProfile(touristId);
// Returns: { tourist: {...}, current_trip: {...}, statistics: {...} }
```

### Get Current Location
```javascript
const location = await touristAPI.getCurrentLocation(touristId);
// Returns: { location: {...}, zone_status: {...}, safety_score: 85 }
```

### Get Location History (with filters)
```javascript
const history = await touristAPI.getLocationHistoryForTourist(touristId, {
  hours_back: 24,
  limit: 100,
  include_trip_info: true
});
// Returns: { locations: [...], statistics: {...} }
```

### Get Movement Analysis
```javascript
const analysis = await touristAPI.getMovementAnalysis(touristId, 24);
// Returns: { pattern: 'normal', anomalies_detected: 0, average_speed: 1.8 }
```

### Get Safety Timeline
```javascript
const timeline = await touristAPI.getSafetyTimeline(touristId);
// Returns: { timeline: [{ timestamp, safety_score, risk_level }, ...] }
```

### Get Emergency Contacts ⚠️ EMERGENCY ONLY
```javascript
// ⚠️ WARNING: Use only in genuine emergencies
const contacts = await touristAPI.getEmergencyContacts(touristId);
// Returns: { emergency_contacts: [{ name, phone, relationship }, ...] }
```

---

## 🚨 Alert Management Endpoints

### Acknowledge Alert (New Standard)
```javascript
import { alertsAPI } from './api/services.js';

await alertsAPI.acknowledgeAlert(alertId, 'Officer dispatched to location');
```

### Resolve Alert (New Standard)
```javascript
await alertsAPI.resolveAlert(
  alertId,
  'Incident resolved, tourist safe',
  'On-site verification completed'
);
```

### Legacy Endpoints (Still Supported)
```javascript
// Old way (still works)
await alertsAPI.acknowledgeIncident(alertId, 'Officer dispatched');
await alertsAPI.closeIncident(alertId, 'Resolved', 'completed');
```

---

## 🗺️ Zone Management Endpoints

### Get All Zones (Alternative)
```javascript
import { zonesAPI } from './api/services.js';

const zones = await zonesAPI.getAllZones({ zone_type: 'safe' });
```

### Get Zone by ID
```javascript
const zone = await zonesAPI.getZoneById(zoneId);
```

### Update Zone
```javascript
await zonesAPI.updateZone(zoneId, {
  name: 'Updated Safe Zone',
  description: 'New description',
  zone_type: 'safe',
  coordinates: [[2.2945, 48.8584], [2.2955, 48.8594]]
});
```

### Get Zone Statistics
```javascript
const stats = await zonesAPI.getZoneStats();
```

---

## 👤 Admin Endpoints

### Delete User
```javascript
import { adminAPI } from './api/services.js';

await adminAPI.deleteUser(userId);
```

### Get Model Status
```javascript
const status = await adminAPI.getModelStatus(jobId);
```

### Get Performance Metrics
```javascript
const metrics = await adminAPI.getPerformanceMetrics();
// Returns: { cpu_usage, memory_usage, response_times, ... }
```

### Get Activity Logs
```javascript
const logs = await adminAPI.getActivityLogs({
  limit: 100,
  user_type: 'authority',
  action: 'alert_acknowledged'
});
```

---

## 🔔 Notification Settings

### Get Notification Settings
```javascript
import { notificationAPI } from './api/services.js';

const settings = await notificationAPI.getNotificationSettings();
// Returns: { push_enabled, sms_enabled, notification_types, quiet_hours, ... }
```

### Update Notification Settings
```javascript
await notificationAPI.updateNotificationSettings({
  push_enabled: true,
  sms_enabled: false,
  notification_types: {
    safety_alerts: true,
    geofence_warnings: true,
    system_updates: false
  },
  quiet_hours: {
    enabled: true,
    start: '22:00',
    end: '07:00'
  }
});
```

---

## 📊 Heatmap Endpoints

### Get Comprehensive Heatmap Data
```javascript
import { heatmapAPI } from './api/services.js';

const data = await heatmapAPI.getHeatmapData({
  hours_back: 24,
  bounds_north: 49,
  bounds_south: 48,
  bounds_east: 3,
  bounds_west: 2
});
```

### Get Zone Heatmap
```javascript
const zoneHeatmap = await heatmapAPI.getZonesHeatmap({
  zone_type: 'safe'
});
```

### Get Alert Heatmap
```javascript
const alertHeatmap = await heatmapAPI.getAlertsHeatmap({
  severity: 'high',
  hours_back: 24
});
```

### Get Tourist Heatmap
```javascript
const touristHeatmap = await heatmapAPI.getTouristsHeatmap({
  hours_back: 24,
  min_safety_score: 0,
  max_safety_score: 50
});
```

---

## 🔒 Authentication Headers

All requests automatically include JWT token:

```
Authorization: Bearer <token-from-localStorage>
```

Token is managed by `src/api/client.js` interceptor.

---

## ⚠️ Error Handling Best Practice

```javascript
try {
  const data = await touristAPI.getTouristProfile(touristId);
  
  // Handle different response structures
  const profile = data.tourist || data.data || data;
  
  setProfile(profile);
} catch (error) {
  console.error('API Error:', error);
  
  if (error.response?.status === 404) {
    alert('Tourist not found');
  } else if (error.response?.status === 401) {
    alert('Please login again');
  } else {
    alert('Failed to load data. Please try again.');
  }
}
```

---

## 🎯 Common Use Cases

### Use Case 1: Tourist Detail Page
```javascript
// Fetch all tourist data
const [profile, location, analysis, timeline] = await Promise.all([
  touristAPI.getTouristProfile(touristId),
  touristAPI.getCurrentLocation(touristId),
  touristAPI.getMovementAnalysis(touristId, 24),
  touristAPI.getSafetyTimeline(touristId)
]);
```

### Use Case 2: Alert Response Workflow
```javascript
// 1. View alert details
const alert = await alertsAPI.getAlertById(alertId);

// 2. Acknowledge
await alertsAPI.acknowledgeAlert(alertId, 'Investigating');

// 3. Take action...

// 4. Resolve
await alertsAPI.resolveAlert(alertId, 'Issue resolved', 'Contacted tourist');
```

### Use Case 3: Emergency Response
```javascript
// Only if genuine emergency
const confirmEmergency = confirm('⚠️ Access emergency contacts? Use only in emergencies.');

if (confirmEmergency) {
  const contacts = await touristAPI.getEmergencyContacts(touristId);
  
  contacts.emergency_contacts.forEach(contact => {
    console.log(`Contact: ${contact.name} - ${contact.phone}`);
  });
}
```

---

## 📝 Migration from Old Endpoints

### Alerts
```javascript
// OLD ❌
await alertsAPI.acknowledgeIncident(alertId, notes);
await alertsAPI.closeIncident(alertId, notes);

// NEW ✅
await alertsAPI.acknowledgeAlert(alertId, notes);
await alertsAPI.resolveAlert(alertId, resolution, actionTaken);
```

### Zones
```javascript
// OLD ❌
const zones = await zonesAPI.listZones();

// NEW ✅ (Alternative, more flexible)
const zones = await zonesAPI.getAllZones({ zone_type: 'safe' });
```

---

## 🔗 Related Files

- **API Client:** `src/api/client.js`
- **API Services:** `src/api/services.js` ⭐ **(UPDATED)**
- **WebSocket Context:** `src/contexts/WebSocketContext.jsx`
- **Auth Store:** `src/store/authStore.js`
- **Full API Docs:** `NEW_API.md`
- **Integration Summary:** `API_INTEGRATION_SUMMARY.md`

---

**Last Updated:** October 1, 2025  
**Version:** 1.0  
**Status:** ✅ Production Ready
