# 🧳 SafeHorizon Tourist API Documentation

**Base URL:** `http://localhost:8000/api`  
**Authentication:** Bearer Token (JWT)

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Trip Management](#trip-management)
3. [Location & Safety](#location--safety)
4. [Emergency & SOS](#emergency--sos)
5. [Device Management](#device-management)
6. [Broadcast Notifications (FCM Push)](#broadcast-notifications-fcm-push)
7. [E-FIR (Electronic FIR)](#e-fir-electronic-fir)
8. [Safety Zones](#safety-zones)
9. [Debug & Utilities](#debug--utilities)

---

## 🔐 Authentication

### 1. Register Tourist Account

**Endpoint:** `POST /api/auth/register`  
**Authentication:** None (Public)

**Request Body:**
```json
{
  "email": "tourist@example.com",
  "password": "securepass123",
  "name": "John Doe",
  "phone": "+919876543210",
  "emergency_contact": "Jane Doe",
  "emergency_phone": "+919876543211"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": "96433ce915a95eaaf4fb6a6500ad9b82",
  "email": "tourist@example.com",
  "role": "tourist"
}
```

---

### 2. Login

**Endpoint:** `POST /api/auth/login`  
**Authentication:** None (Public)

**Request Body:**
```json
{
  "email": "tourist@example.com",
  "password": "securepass123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": "96433ce915a95eaaf4fb6a6500ad9b82",
  "email": "tourist@example.com",
  "role": "tourist"
}
```

**Response (401 Unauthorized):**
```json
{
  "detail": "Invalid credentials"
}
```

---

### 3. Get Current User Profile

**Endpoint:** `GET /api/auth/me`  
**Authentication:** Required (Bearer Token)

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "id": "96433ce915a95eaaf4fb6a6500ad9b82",
  "email": "ball@gmail.com",
  "name": "ball",
  "phone": null,
  "safety_score": 100,
  "last_seen": "2025-10-02T02:44:00.875479+00:00"
}
```

---

## 🚗 Trip Management

### 4. Start a Trip

**Endpoint:** `POST /api/trip/start`  
**Authentication:** Required

**Request Body:**
```json
{
  "destination": "India Gate, New Delhi",
  "expected_duration_hours": 4
}
```

**Response (200 OK):**
```json
{
  "trip_id": 91,
  "destination": "India Gate, New Delhi",
  "status": "active",
  "start_date": "2025-10-02T02:43:58.555201+00:00"
}
```

---

### 5. End Active Trip

**Endpoint:** `POST /api/trip/end`  
**Authentication:** Required

**Request Body:** None (automatically ends the most recent active trip)

**Response (200 OK):**
```json
{
  "trip_id": 91,
  "status": "completed",
  "end_date": "2025-10-02T02:44:24.632455+00:00"
}
```

**Response (404 Not Found):**
```json
{
  "detail": "No active trip found"
}
```

---

### 6. Get Trip History

**Endpoint:** `GET /api/trip/history?limit=10`  
**Authentication:** Required

**Query Parameters:**
- `limit` (optional): Number of trips to return (default: 20)

**Response (200 OK):**
```json
[
  {
    "id": 91,
    "destination": "India Gate, New Delhi",
    "status": "active",
    "start_date": "2025-10-02T02:43:58.555201+00:00",
    "end_date": null,
    "created_at": "2025-10-02T08:13:58.555201+00:00"
  },
  {
    "id": 90,
    "destination": "Taj Mahal, Agra",
    "status": "completed",
    "start_date": "2025-10-01T10:00:00+00:00",
    "end_date": "2025-10-01T18:30:00+00:00",
    "created_at": "2025-10-01T10:00:00+00:00"
  }
]
```

---

## 📍 Location & Safety

### 7. Update GPS Location (with AI Analysis)

**Endpoint:** `POST /api/location/update`  
**Authentication:** Required

**Request Body:**
```json
{
  "lat": 28.6129,
  "lon": 77.2295,
  "speed": 15.5,
  "altitude": 216.0,
  "accuracy": 10.0
}
```

**Response (200 OK) - Safe:**
```json
{
  "status": "location_updated",
  "location_id": 5716,
  "safety_score": 100,
  "risk_level": "low",
  "lat": 28.6129,
  "lon": 77.2295,
  "timestamp": "2025-10-02T08:14:00.738616+00:00",
  "alerts": []
}
```

**Response (200 OK) - With Alert:**
```json
{
  "status": "location_updated",
  "location_id": 5717,
  "safety_score": 45,
  "risk_level": "high",
  "lat": 28.6500,
  "lon": 77.2500,
  "timestamp": "2025-10-02T08:20:15.123456+00:00",
  "alerts": [
    {
      "id": 115,
      "type": "geofence",
      "severity": "high",
      "title": "Restricted Area Warning",
      "description": "You are approaching a restricted zone",
      "timestamp": "2025-10-02T08:20:15.123456+00:00"
    }
  ]
}
```

---

### 8. Get Location History

**Endpoint:** `GET /api/location/history?limit=10`  
**Authentication:** Required

**Query Parameters:**
- `limit` (optional): Number of locations to return (default: 100)

**Response (200 OK):**
```json
[
  {
    "id": 5716,
    "lat": 28.6129,
    "lon": 77.2295,
    "speed": 15.5,
    "altitude": 216.0,
    "accuracy": 10.0,
    "timestamp": "2025-10-02T02:44:00.738616+00:00"
  },
  {
    "id": 5715,
    "lat": 28.6120,
    "lon": 77.2280,
    "speed": 12.0,
    "altitude": 215.0,
    "accuracy": 8.0,
    "timestamp": "2025-10-02T02:43:45.123456+00:00"
  }
]
```

---

### 9. Get Current Safety Score

**Endpoint:** `GET /api/safety/score`  
**Authentication:** Required

**Response (200 OK):**
```json
{
  "safety_score": 100,
  "risk_level": "low",
  "last_updated": "2025-10-02T02:44:00.875479+00:00"
}
```

**Risk Levels:**
- `low`: Safety score 70-100
- `medium`: Safety score 40-69
- `high`: Safety score 0-39

---

## 🚨 Emergency & SOS

### 10. Trigger SOS Emergency Alert

**Endpoint:** `POST /api/sos/trigger`  
**Authentication:** Required

**Request Body:** None (uses last known location)

**Response (200 OK):**
```json
{
  "status": "sos_triggered",
  "alert_id": 124,
  "notifications_sent": {
    "push": true,
    "sms": true,
    "emergency_contacts": [
      {
        "name": "Jane Doe",
        "phone": "+919876543211",
        "status": "sent"
      }
    ]
  },
  "timestamp": "2025-10-02T08:14:13.639382+00:00"
}
```

**Note:** 
- Automatically notifies police dashboard via WebSocket
- Sends push notifications to registered devices
- Sends SMS to emergency contacts (if configured)
- Records alert in database with location data

---

## 📱 Device Management

### 11. Register Device for Push Notifications

**Endpoint:** `POST /api/device/register`  
**Authentication:** Required

**Request Body:**
```json
{
  "device_token": "fcm_token_abc123xyz789...",
  "device_type": "android",
  "device_name": "Samsung Galaxy S21",
  "app_version": "1.0.0"
}
```

**Device Types:** `android`, `ios`, `web`

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Device registered successfully",
  "device_token": "fcm_token_abc123xyz789...",
  "device_type": "android"
}
```

---

### 12. List Registered Devices

**Endpoint:** `GET /api/device/list`  
**Authentication:** Required

**Response (200 OK):**
```json
{
  "status": "success",
  "count": 11,
  "devices": [
    {
      "id": 11,
      "device_type": "android",
      "device_name": "Samsung Galaxy S21",
      "app_version": "1.0.0",
      "is_active": true,
      "last_used": "2025-10-02T08:14:00+00:00",
      "created_at": "2025-10-01T10:30:00+00:00"
    },
    {
      "id": 10,
      "device_type": "ios",
      "device_name": "iPhone 13 Pro",
      "app_version": "1.0.0",
      "is_active": true,
      "last_used": "2025-10-01T15:20:00+00:00",
      "created_at": "2025-09-28T08:00:00+00:00"
    }
  ]
}
```

---

### 13. Unregister Device

**Endpoint:** `DELETE /api/device/unregister?device_token={token}`  
**Authentication:** Required

**Query Parameters:**
- `device_token` (required): The FCM/device token to unregister

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Device unregistered"
}
```

**Response (200 OK) - Not Found:**
```json
{
  "status": "not_found",
  "message": "Device not found"
}
```

---

## � Broadcast Notifications (FCM Push)

### 14. Get Active Broadcasts

**Endpoint:** `GET /api/broadcasts/active`  
**Authentication:** Required

**Description:** Retrieves all active emergency broadcasts relevant to the tourist's current location. Broadcasts are automatically pushed to registered devices via Firebase Cloud Messaging (FCM).

**Query Parameters:**
- `lat` (optional): Current latitude (for radius-based filtering)
- `lon` (optional): Current longitude (for radius-based filtering)

**Response (200 OK):**
```json
{
  "active_broadcasts": [
    {
      "id": 15,
      "broadcast_id": "BCAST-20251002-0015",
      "broadcast_type": "RADIUS",
      "title": "⚠️ Heavy Rain Alert",
      "message": "Heavy rainfall expected in next 2 hours. Avoid low-lying areas and stay indoors if possible.",
      "severity": "MEDIUM",
      "alert_type": "natural_disaster",
      "action_required": "stay_indoors",
      "center": {
        "lat": 28.6129,
        "lon": 77.2295
      },
      "radius_km": 10.0,
      "sent_by": {
        "id": "auth123",
        "name": "Delhi Police Central",
        "department": "Emergency Response"
      },
      "sent_at": "2025-10-02T14:30:00+00:00",
      "expires_at": "2025-10-02T20:00:00+00:00",
      "tourists_notified": 1250,
      "acknowledgments": 890,
      "is_acknowledged": false,
      "distance_km": 2.5
    }
  ],
  "total": 1,
  "retrieved_at": "2025-10-02T15:45:00+00:00"
}
```

**Severity Levels:**
- `LOW`: Informational (blue notification)
- `MEDIUM`: Warning (yellow/orange notification)
- `HIGH`: Urgent (red notification with sound)
- `CRITICAL`: Emergency (full-screen alert with sound & vibration)

---

### 15. Get Broadcast History

**Endpoint:** `GET /api/broadcasts/history?limit=20`  
**Authentication:** Required

**Query Parameters:**
- `limit` (optional): Number of broadcasts to return (default: 20)
- `include_expired` (optional): Include expired broadcasts (default: true)

**Response (200 OK):**
```json
{
  "broadcasts": [
    {
      "id": 15,
      "broadcast_id": "BCAST-20251002-0015",
      "title": "⚠️ Heavy Rain Alert",
      "message": "Heavy rainfall expected...",
      "severity": "MEDIUM",
      "broadcast_type": "RADIUS",
      "sent_at": "2025-10-02T14:30:00+00:00",
      "expires_at": "2025-10-02T20:00:00+00:00",
      "is_active": true,
      "is_acknowledged": false
    }
  ],
  "total": 1,
  "retrieved_at": "2025-10-02T15:50:00+00:00"
}
```

---

### 16. Acknowledge Broadcast

**Endpoint:** `POST /api/broadcasts/{broadcast_id}/acknowledge`  
**Authentication:** Required

**Request Body:**
```json
{
  "status": "safe",
  "notes": "I am indoors and safe",
  "lat": 28.6129,
  "lon": 77.2295
}
```

**Status Options:**
- `safe`: I am safe
- `need_help`: I need assistance
- `evacuating`: I am evacuating the area
- `received`: Acknowledged (no status)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Broadcast acknowledged successfully",
  "acknowledgment_id": 523,
  "broadcast_id": "BCAST-20251002-0015",
  "status": "safe",
  "acknowledged_at": "2025-10-02T15:55:00+00:00"
}
```

---

## 📲 Firebase Cloud Messaging (FCM) Integration

### How Broadcasts are Delivered

When authorities create a broadcast, the backend automatically:

1. **Filters affected tourists** based on broadcast type (RADIUS/ZONE/REGION/ALL)
2. **Retrieves device tokens** for each affected tourist
3. **Sends FCM push notifications** to all registered devices
4. **Stores broadcast** in database for retrieval via API

### FCM Notification Payload

**Data Notification (Background):**
```json
{
  "notification": {
    "title": "⚠️ Heavy Rain Alert",
    "body": "Heavy rainfall expected in next 2 hours. Stay indoors if possible.",
    "sound": "default",
    "priority": "high",
    "badge": "1"
  },
  "data": {
    "type": "broadcast",
    "broadcast_id": "BCAST-20251002-0015",
    "severity": "MEDIUM",
    "action_required": "stay_indoors",
    "lat": "28.6129",
    "lon": "77.2295",
    "radius_km": "10.0",
    "expires_at": "2025-10-02T20:00:00+00:00",
    "click_action": "BROADCAST_DETAIL"
  }
}
```

### Mobile App FCM Handler (React Native Example)

```javascript
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';

class FCMService {
  async requestPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    
    if (enabled) {
      console.log('FCM Permission granted');
      return await this.getDeviceToken();
    }
    return null;
  }

  async getDeviceToken() {
    const token = await messaging().getToken();
    console.log('FCM Device Token:', token);
    return token;
  }

  setupNotificationHandlers(navigation) {
    // Foreground notification handler
    messaging().onMessage(async remoteMessage => {
      console.log('FCM Foreground Notification:', remoteMessage);
      
      if (remoteMessage.data.type === 'broadcast') {
        this.showLocalNotification(remoteMessage);
        this.handleBroadcast(remoteMessage.data, navigation);
      } else if (remoteMessage.data.type === 'sos_alert') {
        this.handleSOSAlert(remoteMessage.data, navigation);
      }
    });

    // Background notification handler
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('FCM Background Notification:', remoteMessage);
    });

    // Notification tap handler (app opened from notification)
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification opened app:', remoteMessage);
      
      if (remoteMessage.data.type === 'broadcast') {
        navigation.navigate('BroadcastDetail', {
          broadcast_id: remoteMessage.data.broadcast_id
        });
      }
    });

    // App opened from killed state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Notification opened app from killed state:', remoteMessage);
        }
      });
  }

  showLocalNotification(remoteMessage) {
    const { notification, data } = remoteMessage;
    
    PushNotification.localNotification({
      channelId: data.severity === 'CRITICAL' ? 'emergency' : 'general',
      title: notification.title,
      message: notification.body,
      soundName: data.severity === 'CRITICAL' ? 'emergency.mp3' : 'default',
      vibrate: data.severity === 'CRITICAL',
      vibration: data.severity === 'CRITICAL' ? 1000 : 300,
      playSound: true,
      priority: data.severity === 'CRITICAL' ? 'max' : 'high',
      importance: data.severity === 'CRITICAL' ? 'max' : 'high',
      userInfo: data
    });
  }

  handleBroadcast(data, navigation) {
    // Show in-app alert for CRITICAL broadcasts
    if (data.severity === 'CRITICAL') {
      Alert.alert(
        '🚨 EMERGENCY ALERT',
        data.message || 'Critical emergency broadcast received',
        [
          {
            text: 'View Details',
            onPress: () => navigation.navigate('BroadcastDetail', {
              broadcast_id: data.broadcast_id
            })
          },
          {
            text: 'Acknowledge',
            onPress: () => this.acknowledgeBroadcast(data.broadcast_id)
          }
        ],
        { cancelable: false }
      );
    }
  }

  async acknowledgeBroadcast(broadcast_id) {
    // Call API to acknowledge
    const response = await fetch(
      `http://localhost:8000/api/broadcasts/${broadcast_id}/acknowledge`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'received' })
      }
    );
    return response.json();
  }
}

export default new FCMService();
```

### Notification Channels Setup (Android)

```javascript
import PushNotification from 'react-native-push-notification';

PushNotification.createChannel(
  {
    channelId: 'emergency',
    channelName: 'Emergency Alerts',
    channelDescription: 'Critical emergency broadcasts',
    importance: 5, // Max importance
    vibrate: true,
    vibration: 1000,
    soundName: 'emergency.mp3',
    playSound: true
  },
  (created) => console.log(`Emergency channel created: ${created}`)
);

PushNotification.createChannel(
  {
    channelId: 'general',
    channelName: 'General Notifications',
    channelDescription: 'General safety alerts and updates',
    importance: 4, // High importance
    vibrate: true,
    vibration: 300,
    soundName: 'default',
    playSound: true
  },
  (created) => console.log(`General channel created: ${created}`)
);
```

### Firebase Configuration

**Add to your React Native project:**

1. **Install Firebase packages:**
```bash
npm install @react-native-firebase/app @react-native-firebase/messaging
npm install react-native-push-notification
```

2. **Add `google-services.json`** (provided in docs folder) to:
   - Android: `android/app/google-services.json`

3. **Update `AndroidManifest.xml`:**
```xml
<application>
  <!-- FCM Service -->
  <service
    android:name=".fcm.MyFirebaseMessagingService"
    android:exported="false">
    <intent-filter>
      <action android:name="com.google.firebase.MESSAGING_EVENT" />
    </intent-filter>
  </service>
  
  <!-- Notification Icon -->
  <meta-data
    android:name="com.google.firebase.messaging.default_notification_icon"
    android:resource="@drawable/ic_notification" />
  
  <!-- Notification Color -->
  <meta-data
    android:name="com.google.firebase.messaging.default_notification_color"
    android:resource="@color/colorAccent" />
</application>
```

4. **Register device on login:**
```javascript
async function onLogin(email, password) {
  // Login to backend
  const loginResponse = await SafeHorizonAPI.login(email, password);
  
  // Get FCM token
  const fcmToken = await FCMService.requestPermission();
  
  if (fcmToken) {
    // Register device with backend
    await SafeHorizonAPI.registerDevice(fcmToken, 'android');
  }
  
  // Setup notification handlers
  FCMService.setupNotificationHandlers(navigation);
}
```

### Testing FCM Notifications

**Use Firebase Console:**
1. Go to Firebase Console → Cloud Messaging
2. Click "Send your first message"
3. Enter device token from `device/list` endpoint
4. Test notification delivery

**Use cURL to trigger backend broadcast:**
```bash
curl -X POST http://localhost:8000/api/authority/broadcast/create \
  -H "Authorization: Bearer AUTHORITY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "broadcast_type": "ALL",
    "title": "Test Notification",
    "message": "Testing FCM push notification delivery",
    "severity": "LOW"
  }'
```

---

## �📝 E-FIR (Electronic FIR)

### 17. Generate E-FIR Report

**Endpoint:** `POST /api/tourist/efir/generate`  
**Authentication:** Required

**Request Body:**
```json
{
  "incident_type": "theft",
  "incident_description": "My wallet was stolen from the hotel room while I was at lunch",
  "location": "Hotel Taj Palace, New Delhi",
  "witnesses": ["John Smith", "Hotel Staff"],
  "additional_details": "Happened around 2 PM on October 2, 2025"
}
```

**Incident Types:**
- `theft`
- `assault`
- `harassment`
- `fraud`
- `accident`
- `other`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "E-FIR generated and stored successfully",
  "efir_id": 8,
  "fir_number": "EFIR-20251002-T96433ce9-1759373055",
  "blockchain_tx_id": "0x4329c2d1bcb2b747146f411794c5abc123...",
  "incident_type": "theft",
  "severity": "medium",
  "filed_at": "2025-10-02T08:14:15+00:00"
}
```

**Note:** E-FIR is automatically:
- Stored in PostgreSQL database
- Logged to blockchain (Hyperledger Fabric) for immutability
- Notified to nearby police stations
- Creates an alert for police dashboard

---

### 18. Get My E-FIR Reports

**Endpoint:** `GET /api/efir/my-reports?limit=10`  
**Authentication:** Required

**Query Parameters:**
- `limit` (optional): Number of reports to return (default: 20)

**Response (200 OK):**
```json
{
  "success": true,
  "total": 5,
  "efirs": [
    {
      "efir_id": 8,
      "fir_number": "EFIR-20251002-T96433ce9-1759373055",
      "incident_type": "theft",
      "severity": "medium",
      "description": "My wallet was stolen from the hotel room...",
      "location": "Hotel Taj Palace, New Delhi",
      "status": "pending",
      "filed_at": "2025-10-02T08:14:15+00:00",
      "blockchain_verified": true
    },
    {
      "efir_id": 7,
      "fir_number": "EFIR-20251001-T96433ce9-1759372392",
      "incident_type": "harassment",
      "severity": "high",
      "description": "Felt unsafe near the market area...",
      "location": "Chandni Chowk, Delhi",
      "status": "acknowledged",
      "filed_at": "2025-10-01T16:45:00+00:00",
      "blockchain_verified": true
    }
  ]
}
```

**E-FIR Status:**
- `pending`: Waiting for police acknowledgment
- `acknowledged`: Police has seen the report
- `investigating`: Under investigation
- `resolved`: Incident resolved
- `closed`: Case closed

---

### 19. Get Specific E-FIR Details

**Endpoint:** `GET /api/efir/{efir_id}`  
**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "efir": {
    "efir_id": 8,
    "fir_number": "EFIR-20251002-T96433ce9-1759373055",
    "incident_type": "theft",
    "severity": "medium",
    "description": "My wallet was stolen from the hotel room while I was at lunch",
    "location": "Hotel Taj Palace, New Delhi",
    "witnesses": ["John Smith", "Hotel Staff"],
    "additional_details": "Happened around 2 PM on October 2, 2025",
    "status": "pending",
    "filed_at": "2025-10-02T08:14:15+00:00",
    "blockchain_tx_id": "0x4329c2d1bcb2b747146f411794c5abc123...",
    "blockchain_verified": true,
    "tourist": {
      "id": "96433ce915a95eaaf4fb6a6500ad9b82",
      "name": "ball",
      "email": "ball@gmail.com"
    }
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "E-FIR not found"
}
```

---

## 🗺️ Safety Zones

### 20. Get All Safety Zones

**Endpoint:** `GET /api/zones/list`  
**Authentication:** Required

**Response (200 OK):**
```json
[
  {
    "id": 35,
    "name": "Pahalgam - Valley Tourist Area",
    "type": "safe",
    "description": "Scenic valley and trekking base - safe for tourists",
    "is_active": true,
    "center": {
      "lat": 34.0161,
      "lon": 75.315
    },
    "radius_meters": 5000
  },
  {
    "id": 31,
    "name": "Test Zone - India Gate",
    "type": "safe",
    "description": "Test zone for coordinate verification",
    "is_active": true,
    "center": {
      "lat": 28.6129,
      "lon": 77.2295
    },
    "radius_meters": 1000
  },
  {
    "id": 12,
    "name": "Border Restricted Area",
    "type": "restricted",
    "description": "Military restricted zone - entry prohibited",
    "is_active": true,
    "center": {
      "lat": 28.7000,
      "lon": 77.3000
    },
    "radius_meters": 2000
  }
]
```

**Zone Types:**
- `safe`: Safe for tourists
- `caution`: Exercise caution
- `risky`: High risk area
- `restricted`: Entry prohibited

---

### 21. Get Nearby Zones

**Endpoint:** `GET /api/zones/nearby?lat={lat}&lon={lon}&radius_km={radius}`  
**Authentication:** Required

**Query Parameters:**
- `lat` (required): Current latitude
- `lon` (required): Current longitude
- `radius_km` (optional): Search radius in kilometers (default: 5)

**Example:** `GET /api/zones/nearby?lat=28.6129&lon=77.2295&radius_km=5`

**Response (200 OK):**
```json
{
  "nearby_zones": [
    {
      "id": 31,
      "name": "Test Zone - India Gate",
      "type": "safe",
      "description": "Test zone for coordinate verification",
      "center": {
        "lat": 28.6129,
        "lon": 77.2295
      },
      "radius_meters": 1000,
      "distance_km": 0.5
    }
  ],
  "center": {
    "lat": 28.6129,
    "lon": 77.2295
  },
  "radius_meters": 5000,
  "total": 1,
  "generated_at": "2025-10-02T08:14:20+00:00"
}
```

---

### 22. Get Public Safety Heatmap

**Endpoint:** `GET /api/heatmap/zones/public`  
**Authentication:** Required

**Query Parameters (all optional):**
- `bounds_north`: Northern boundary latitude
- `bounds_south`: Southern boundary latitude
- `bounds_east`: Eastern boundary longitude
- `bounds_west`: Western boundary longitude
- `zone_type`: Filter by zone type (`safe`, `caution`, `risky`, `restricted`)

**Response (200 OK):**
```json
{
  "zones": [
    {
      "id": 35,
      "name": "Pahalgam - Valley Tourist Area",
      "type": "safe",
      "center": {
        "lat": 34.0161,
        "lon": 75.315
      },
      "radius_meters": 5000,
      "intensity": 0.1
    },
    {
      "id": 12,
      "name": "Border Restricted Area",
      "type": "restricted",
      "center": {
        "lat": 28.7000,
        "lon": 77.3000
      },
      "radius_meters": 2000,
      "intensity": 0.9
    }
  ],
  "total": 45,
  "generated_at": "2025-10-02T08:14:25+00:00"
}
```

**Intensity Scale:**
- `0.0 - 0.3`: Safe (green)
- `0.3 - 0.6`: Caution (yellow)
- `0.6 - 0.8`: Risky (orange)
- `0.8 - 1.0`: Restricted/Danger (red)

---

## 🛠️ Debug & Utilities

### 23. Debug Role Check

**Endpoint:** `GET /api/debug/role`  
**Authentication:** Required

**Response (200 OK):**
```json
{
  "user_id": "96433ce915a95eaaf4fb6a6500ad9b82",
  "email": "ball@gmail.com",
  "role": "tourist",
  "is_tourist": true,
  "is_authority": false,
  "is_admin": false
}
```

---

## 📊 API Response Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation error |
| 500 | Internal Server Error | Server error |

---

## 🔒 Authentication Notes

1. **Token Storage:** Store JWT token securely (AsyncStorage, Keychain)
2. **Token Expiry:** Tokens expire after 24 hours (configurable)
3. **Refresh:** Re-login when token expires (401 response)
4. **Header Format:** `Authorization: Bearer {token}`

---

## 🧪 Testing with cURL

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ball@gmail.com","password":"123456"}'
```

### Update Location
```bash
curl -X POST http://localhost:8000/api/location/update \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lat":28.6129,"lon":77.2295,"speed":15.5,"altitude":216,"accuracy":10}'
```

### Trigger SOS
```bash
curl -X POST http://localhost:8000/api/sos/trigger \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📱 Mobile App Integration Example (React Native)

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://localhost:8000/api';

class SafeHorizonAPI {
  async login(email, password) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    await AsyncStorage.setItem('token', data.access_token);
    return data;
  }

  async updateLocation(lat, lon, speed = 0, altitude = 0) {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(`${API_BASE}/location/update`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ lat, lon, speed, altitude, accuracy: 10 })
    });
    return response.json();
  }

  async triggerSOS() {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(`${API_BASE}/sos/trigger`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
}

export default new SafeHorizonAPI();
```

---

## 🎯 Best Practices

1. **Location Updates:** Send location every 30-60 seconds during active trip
2. **Battery Optimization:** Reduce frequency when stationary
3. **Error Handling:** Always handle 401 (re-login) and 500 (retry)
4. **Offline Mode:** Queue requests when offline, sync when online
5. **SOS Button:** Make easily accessible, confirm before triggering
6. **Push Notifications:** Request permissions on app start
7. **Background Location:** Request appropriate permissions for iOS/Android

---

**Last Updated:** October 2, 2025  
**API Version:** 1.0.0  
**Test Account:** `ball@gmail.com` / `123456`
