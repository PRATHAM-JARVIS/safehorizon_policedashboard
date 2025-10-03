# SafeHorizon Backend API Documentation

## Overview
SafeHorizon is a comprehensive tourist safety platform with AI-powered tracking, real-time alerts, and blockchain-based incident reporting (E-FIR). This documentation provides complete endpoint information for frontend developers.

**Base URL**: `http://localhost:8000/api` (development)  
**API Prefix**: `/api`

---

## Table of Contents
1. [Public Endpoints (No Auth)](#public-endpoints)
2. [Authentication](#authentication)
3. [Tourist Endpoints](#tourist-endpoints)
4. [Authority/Police Endpoints](#authority-endpoints)
5. [Admin Endpoints](#admin-endpoints)
6. [AI & Safety Scoring](#ai-endpoints)
7. [Notifications](#notification-endpoints)
8. [WebSocket Connections](#websocket-connections)
9. [Data Models](#data-models)

---

## Public Endpoints

These endpoints **DO NOT require authentication** and are accessible to everyone.

### **GET** `/api/public/panic-alerts` 🆕
Get list of panic/SOS alerts (public access for emergency awareness).

**Description:**  
This endpoint returns panic and SOS alerts without requiring authentication. Personal information is anonymized for privacy. **By default, only shows unresolved alerts** to focus on active emergencies. Useful for:
- Emergency services monitoring
- Nearby tourists staying aware of dangers
- Community emergency awareness
- Real-time incident tracking

**Query Parameters:**
- `limit` (optional): Maximum number of alerts to return (1-1000, default: 50)
- `hours_back` (optional): Look back period in hours (1-168, default: 24)
- `show_resolved` (optional): Include resolved alerts (default: false, only unresolved)

**Optimizations:** 🚀
- Single optimized query with JOINs (reduces database round trips)
- Database-level filtering for resolution status
- Average response time: ~2.1 seconds

**Request:**
```bash
# Get only unresolved alerts (default)
GET /api/public/panic-alerts?limit=10&hours_back=12

# Get all alerts including resolved ones
GET /api/public/panic-alerts?limit=10&hours_back=12&show_resolved=true
```

**Response:**
```json
{
  "total_alerts": 4,
  "active_count": 1,
  "unresolved_count": 3,
  "resolved_count": 1,
  "hours_back": 12,
  "alerts": [
    {
      "alert_id": 353,
      "type": "sos",
      "severity": "critical",
      "title": "🚨 SOS Emergency Alert",
      "description": "Emergency situation - assistance needed",
      "location": {
        "lat": 23.4716367,
        "lon": 72.39096,
        "timestamp": "2025-10-03T04:37:10.089291+00:00"
      },
      "timestamp": "2025-10-03T03:27:14.960120+00:00",
      "time_ago": "1:10:20",
      "status": "active",
      "resolved": false,
      "resolved_at": null
    },
    {
      "alert_id": 352,
      "type": "panic",
      "severity": "critical",
      "title": "⚠️ Panic Button Alert",
      "description": "Emergency situation - assistance needed",
      "location": null,
      "timestamp": "2025-10-02T20:04:27.038434+00:00",
      "time_ago": "8:33:08",
      "status": "older",
      "resolved": true,
      "resolved_at": "2025-10-02T21:30:00.000000+00:00"
    }
  ],
  "timestamp": "2025-10-03T04:37:35.459956+00:00",
  "note": "Personal information anonymized for privacy. Contact emergency services for urgent situations."
}
```

**Response Fields:**
- `total_alerts`: Total number of alerts found
- `active_count`: Alerts within last hour
- `unresolved_count`: Alerts not yet resolved  
- `resolved_count`: Alerts marked as resolved
- `resolved`: Boolean indicating if alert has been handled
- `resolved_at`: Timestamp when alert was marked resolved

**Alert Status:**
- `active`: Alert created within last 1 hour
- `older`: Alert older than 1 hour but within lookup window

**Resolution Status:**
- By default, only **unresolved** alerts are shown (active emergencies)
- Use `show_resolved=true` to include resolved historical alerts
- Authorities can mark alerts as resolved via `/api/authority/alert/resolve`

**Privacy Features:**
- Tourist names, emails, phones are NOT included
- Generic descriptions for all alerts
- Only essential location data provided
- No identifying information exposed

**Example Usage:**

**cURL:**
```bash
curl -X GET "http://localhost:8000/api/public/panic-alerts?limit=10&hours_back=12"
```

**JavaScript:**
```javascript
fetch('http://localhost:8000/api/public/panic-alerts?limit=10&hours_back=12')
  .then(response => response.json())
  .then(data => {
    console.log(`Total Alerts: ${data.total_alerts}`);
    console.log(`Active Count: ${data.active_count}`);
    data.alerts.forEach(alert => {
      console.log(`Alert ${alert.alert_id}: ${alert.title} at ${alert.location?.lat}, ${alert.location?.lon}`);
    });
  });
```

**Python:**
```python
import requests

response = requests.get(
    'http://localhost:8000/api/public/panic-alerts',
    params={'limit': 10, 'hours_back': 12}
)
data = response.json()

print(f"Total Alerts: {data['total_alerts']}")
print(f"Active Count: {data['active_count']}")
for alert in data['alerts']:
    print(f"Alert {alert['alert_id']}: {alert['title']}")
```

**Status Codes:**
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `422`: Validation Error (invalid parameter types)
- `500`: Internal Server Error

**Use Cases:**
1. **Emergency Services Dashboard**: Display active emergencies on a map
2. **Tourist Apps**: Show nearby emergency alerts to warn other tourists
3. **Community Safety Apps**: Public awareness of active incidents
4. **News/Media**: Real-time incident monitoring
5. **Research**: Emergency pattern analysis

---

## Authentication

All endpoints require JWT Bearer token authentication unless marked as **PUBLIC**.

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

---

## Tourist Endpoints

### 1. Authentication

#### **POST** `/api/auth/register`
Register a new tourist user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "phone": "+1234567890",
  "emergency_contact": "Jane Doe",
  "emergency_phone": "+0987654321"
}
```

**Response:**
```json
{
  "message": "Tourist registered successfully",
  "user_id": "uuid-string",
  "email": "user@example.com"
}
```

---

#### **POST** `/api/auth/login`
Login tourist user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGci...",
  "token_type": "bearer",
  "user_id": "uuid-string",
  "email": "user@example.com",
  "role": "tourist"
}
```

---

#### **GET** `/api/auth/me`
Get current user information.

**Response:**
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+1234567890",
  "safety_score": 85,
  "last_seen": "2025-10-03T04:20:00Z"
}
```

---

### 2. Trip Management

#### **POST** `/api/trip/start`
Start a new trip.

**Request Body:**
```json
{
  "destination": "Paris, France",
  "itinerary": "Visit Eiffel Tower, Louvre Museum"
}
```

**Response:**
```json
{
  "trip_id": 123,
  "destination": "Paris, France",
  "status": "active",
  "start_date": "2025-10-03T04:20:00Z"
}
```

---

#### **POST** `/api/trip/end`
End the current active trip.

**Response:**
```json
{
  "trip_id": 123,
  "status": "completed",
  "end_date": "2025-10-03T10:20:00Z"
}
```

---

#### **GET** `/api/trip/history`
Get user's trip history.

**Response:**
```json
[
  {
    "id": 123,
    "destination": "Paris, France",
    "status": "completed",
    "start_date": "2025-10-03T04:20:00Z",
    "end_date": "2025-10-03T10:20:00Z",
    "created_at": "2025-10-03T04:00:00Z"
  }
]
```

---

### 3. Location Tracking

#### **POST** `/api/location/update`
Update user location with AI safety analysis.

**Request Body:**
```json
{
  "lat": 48.8566,
  "lon": 2.3522,
  "speed": 1.5,
  "altitude": 35.0,
  "accuracy": 10.0,
  "timestamp": "2025-10-03T04:20:00Z"
}
```

**Response:**
```json
{
  "status": "location_updated",
  "location_id": 456,
  "location_safety_score": 75,
  "tourist_safety_score": 80,
  "risk_level": "medium",
  "lat": 48.8566,
  "lon": 2.3522,
  "timestamp": "2025-10-03T04:20:00Z",
  "ai_analysis": {
    "factors": {
      "zone_risk": 0.2,
      "historical_incidents": 0.3,
      "time_of_day": 0.15,
      "movement_pattern": 0.1
    },
    "recommendations": [
      "Stay on well-lit streets",
      "Keep emergency contacts updated"
    ]
  }
}
```

---

#### **GET** `/api/location/history`
Get location history (default 100 points).

**Query Parameters:**
- `limit` (optional): Number of locations to return (default: 100)

**Response:**
```json
[
  {
    "id": 456,
    "lat": 48.8566,
    "lon": 2.3522,
    "speed": 1.5,
    "altitude": 35.0,
    "accuracy": 10.0,
    "timestamp": "2025-10-03T04:20:00Z",
    "safety_score": 75,
    "safety_score_updated_at": "2025-10-03T04:20:00Z"
  }
]
```

---

#### **GET** `/api/location/safety-trend`
Get safety score trend over time.

**Query Parameters:**
- `hours_back` (optional): Hours to look back (default: 24)

**Response:**
```json
{
  "hours_back": 24,
  "data_points": 50,
  "trend": [
    {
      "timestamp": "2025-10-03T04:20:00Z",
      "safety_score": 75,
      "risk_level": "medium",
      "location": {"lat": 48.8566, "lon": 2.3522}
    }
  ],
  "statistics": {
    "average_score": 78.5,
    "min_score": 60,
    "max_score": 95,
    "current_score": 80,
    "score_volatility": 35
  }
}
```

---

#### **GET** `/api/location/safety-analysis`
Get detailed AI safety analysis for current location.

**Response:**
```json
{
  "location": {
    "id": 456,
    "lat": 48.8566,
    "lon": 2.3522,
    "timestamp": "2025-10-03T04:20:00Z"
  },
  "safety_score": 75,
  "risk_level": "medium",
  "factors": {
    "zone_risk": 0.2,
    "historical_incidents": 0.3,
    "time_of_day": 0.15
  },
  "recommendations": [
    "Stay in well-lit areas",
    "Avoid isolated streets"
  ],
  "tourist_profile": {
    "id": "uuid",
    "overall_safety_score": 80,
    "last_seen": "2025-10-03T04:20:00Z"
  }
}
```

---

#### **GET** `/api/location/nearby-risks`
Get nearby risks and alerts.

**Query Parameters:**
- `radius_km` (optional): Search radius in kilometers (default: 2.0)

**Response:**
```json
{
  "current_location": {
    "lat": 48.8566,
    "lon": 2.3522,
    "safety_score": 75,
    "timestamp": "2025-10-03T04:20:00Z"
  },
  "search_radius_km": 2.0,
  "nearby_alerts": [
    {
      "alert_id": 789,
      "type": "anomaly",
      "severity": "high",
      "title": "Safety Alert",
      "description": "Unusual activity detected",
      "distance_km": 0.5,
      "location": {"lat": 48.8560, "lon": 2.3520},
      "timestamp": "2025-10-03T03:00:00Z"
    }
  ],
  "nearby_risky_zones": [
    {
      "zone_id": 10,
      "name": "Construction Area",
      "type": "risky",
      "distance_km": 0.8,
      "radius_km": 0.5,
      "center": {"lat": 48.8570, "lon": 2.3525},
      "is_inside": false
    }
  ],
  "risk_summary": {
    "total_alerts": 1,
    "critical_alerts": 0,
    "high_alerts": 1,
    "risky_zones_nearby": 1,
    "inside_risky_zone": false
  }
}
```

---

### 4. Safety & Alerts

#### **GET** `/api/safety/score`
Get current safety score.

**Response:**
```json
{
  "safety_score": 80,
  "risk_level": "low",
  "last_updated": "2025-10-03T04:20:00Z"
}
```

---

#### **POST** `/api/sos/trigger`
Trigger SOS emergency alert.

**Response:**
```json
{
  "status": "sos_triggered",
  "alert_id": 789,
  "notifications_sent": {
    "sms": true,
    "push": true,
    "email": true
  },
  "timestamp": "2025-10-03T04:20:00Z"
}
```

---

### 5. E-FIR (Electronic First Information Report)

#### **POST** `/api/tourist/efir/generate`
Generate E-FIR for tourist-reported incident.

**Request Body:**
```json
{
  "incident_description": "Wallet stolen from pocket",
  "incident_type": "theft",
  "location": "Near Eiffel Tower, Paris",
  "timestamp": "2025-10-03T04:20:00Z",
  "witnesses": ["John Smith", "Mary Jane"],
  "additional_details": "Occurred in crowded area"
}
```

**Response:**
```json
{
  "success": true,
  "message": "E-FIR generated and stored successfully",
  "efir_id": 123,
  "fir_number": "EFIR-20251003-T12345678-1696302000",
  "blockchain_tx_id": "0x123abc...",
  "timestamp": "2025-10-03T04:20:00Z",
  "verification_url": "https://blockchain.safehorizon.com/verify/...",
  "status": "submitted",
  "alert_id": 789
}
```

---

#### **GET** `/api/efir/my-reports`
Get all E-FIRs submitted by current tourist.

**Query Parameters:**
- `limit` (optional): Number of reports (default: 50)

**Response:**
```json
{
  "success": true,
  "total": 2,
  "efirs": [
    {
      "efir_id": 123,
      "fir_number": "EFIR-20251003-T12345678-1696302000",
      "incident_type": "theft",
      "severity": "medium",
      "description": "Wallet stolen from pocket",
      "location": {
        "lat": 48.8566,
        "lon": 2.3522,
        "description": "Near Eiffel Tower, Paris"
      },
      "incident_timestamp": "2025-10-03T04:20:00Z",
      "generated_at": "2025-10-03T04:25:00Z",
      "blockchain_tx_id": "0x123abc...",
      "is_verified": false,
      "verification_timestamp": null,
      "witnesses": ["John Smith", "Mary Jane"],
      "status": "pending_verification"
    }
  ],
  "generated_at": "2025-10-03T05:00:00Z"
}
```

---

#### **GET** `/api/efir/{efir_id}`
Get detailed E-FIR information.

**Response:**
```json
{
  "success": true,
  "efir": {
    "efir_id": 123,
    "fir_number": "EFIR-20251003-T12345678-1696302000",
    "incident_type": "theft",
    "severity": "medium",
    "description": "Wallet stolen from pocket",
    "location": {
      "lat": 48.8566,
      "lon": 2.3522,
      "description": "Near Eiffel Tower, Paris"
    },
    "tourist_info": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "incident_timestamp": "2025-10-03T04:20:00Z",
    "generated_at": "2025-10-03T04:25:00Z",
    "blockchain": {
      "tx_id": "0x123abc...",
      "block_hash": "0x456def...",
      "chain_id": "safehorizon-efir-chain"
    },
    "is_verified": false,
    "verification_timestamp": null,
    "witnesses": ["John Smith", "Mary Jane"],
    "additional_details": "Occurred in crowded area",
    "report_source": "tourist",
    "status": "pending_verification"
  }
}
```

---

### 6. Zones & Safety Map

#### **GET** `/api/zones/list`
Get list of all safety zones.

**Response:**
```json
{
  "zones": [
    {
      "id": 10,
      "name": "Tourist Safe Zone",
      "type": "safe",
      "center": {"lat": 48.8566, "lon": 2.3522},
      "radius_meters": 1000,
      "description": "Well-patrolled tourist area"
    }
  ],
  "total": 1
}
```

---

#### **GET** `/api/zones/nearby`
Get zones near current location.

**Query Parameters:**
- `lat` (required): Latitude
- `lon` (required): Longitude
- `radius` (optional): Radius in meters (default: 5000)

**Response:**
```json
{
  "nearby_zones": [
    {
      "id": 10,
      "name": "Construction Area",
      "type": "risky",
      "distance_meters": 500,
      "center": {"lat": 48.8570, "lon": 2.3525}
    }
  ],
  "center": {"lat": 48.8566, "lon": 2.3522},
  "radius_meters": 5000,
  "total": 1,
  "generated_at": "2025-10-03T04:20:00Z"
}
```

---

#### **GET** `/api/heatmap/zones/public`
Get public zone heatmap data for tourist app.

**Query Parameters:**
- `bounds_north`, `bounds_south`, `bounds_east`, `bounds_west` (optional)
- `zone_type` (optional): Filter by zone type ("safe", "risky", "restricted", "all")

**Response:**
```json
{
  "zones": [
    {
      "id": 10,
      "name": "Tourist Safe Zone",
      "type": "safe",
      "center": {"lat": 48.8566, "lon": 2.3522},
      "radius_meters": 1000,
      "description": "Well-patrolled area",
      "risk_level": "safe",
      "safety_recommendation": "Safe area - normal precautions apply"
    }
  ],
  "total": 1,
  "filter": {
    "zone_type": "all",
    "bounds": null
  },
  "generated_at": "2025-10-03T04:20:00Z",
  "note": "Public zone information for tourist safety awareness"
}
```

---

### 7. Device Management (Push Notifications)

#### **POST** `/api/device/register`
Register device for push notifications.

**Request Body:**
```json
{
  "device_token": "firebase-fcm-token",
  "device_type": "android",
  "device_name": "Pixel 6",
  "app_version": "1.0.0"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Device registered successfully",
  "device_token": "firebase-fcm-token",
  "device_type": "android"
}
```

---

#### **DELETE** `/api/device/unregister`
Unregister device.

**Query Parameters:**
- `device_token` (required): Device token to unregister

**Response:**
```json
{
  "status": "success",
  "message": "Device unregistered"
}
```

---

#### **GET** `/api/device/list`
List all registered devices.

**Response:**
```json
{
  "status": "success",
  "count": 2,
  "devices": [
    {
      "id": 1,
      "device_type": "android",
      "device_name": "Pixel 6",
      "app_version": "1.0.0",
      "is_active": true,
      "last_used": "2025-10-03T04:20:00Z",
      "created_at": "2025-10-01T10:00:00Z"
    }
  ]
}
```

---

### 8. Broadcast Alerts (Emergency Notifications)

#### **GET** `/api/broadcasts/active`
Get active emergency broadcasts.

**Query Parameters:**
- `lat`, `lon` (optional): Current location for radius-based filtering

**Response:**
```json
{
  "active_broadcasts": [
    {
      "id": 1,
      "broadcast_id": "BCAST-20251003-001",
      "broadcast_type": "RADIUS",
      "title": "Emergency Weather Alert",
      "message": "Heavy storm approaching. Seek shelter immediately.",
      "severity": "HIGH",
      "alert_type": "weather",
      "action_required": "Seek immediate shelter",
      "sent_by": {
        "id": "authority-uuid",
        "name": "Police Department",
        "department": "Emergency Services"
      },
      "sent_at": "2025-10-03T04:00:00Z",
      "expires_at": "2025-10-03T10:00:00Z",
      "tourists_notified": 150,
      "acknowledgments": 120,
      "is_acknowledged": false,
      "center": {"lat": 48.8566, "lon": 2.3522},
      "radius_km": 5.0,
      "distance_km": 1.2
    }
  ],
  "total": 1,
  "retrieved_at": "2025-10-03T04:20:00Z"
}
```

---

#### **GET** `/api/broadcasts/history`
Get broadcast history.

**Query Parameters:**
- `limit` (optional): Number of broadcasts (default: 20)
- `include_expired` (optional): Include expired broadcasts (default: true)

**Response:**
```json
{
  "broadcasts": [
    {
      "id": 1,
      "broadcast_id": "BCAST-20251003-001",
      "title": "Emergency Weather Alert",
      "message": "Heavy storm approaching",
      "severity": "HIGH",
      "broadcast_type": "RADIUS",
      "sent_at": "2025-10-03T04:00:00Z",
      "expires_at": "2025-10-03T10:00:00Z",
      "is_active": true,
      "is_acknowledged": false
    }
  ],
  "total": 1,
  "retrieved_at": "2025-10-03T04:20:00Z"
}
```

---

#### **POST** `/api/broadcasts/{broadcast_id}/acknowledge`
Acknowledge a broadcast.

**Request Body:**
```json
{
  "status": "safe",
  "notes": "I'm in a safe location",
  "lat": 48.8566,
  "lon": 2.3522
}
```

**Status Options:** `safe`, `need_help`, `evacuating`, `received`

**Response:**
```json
{
  "success": true,
  "message": "Broadcast acknowledged successfully",
  "acknowledgment_id": 123,
  "broadcast_id": "BCAST-20251003-001",
  "status": "safe",
  "acknowledged_at": "2025-10-03T04:20:00Z"
}
```

---

### 9. Debug Endpoints

#### **GET** `/api/debug/role`
Check user role and permissions (for testing).

**Response:**
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "role": "tourist",
  "is_tourist": true,
  "is_authority": false,
  "is_admin": false
}
```

---

## Authority Endpoints

### 1. Authentication

#### **POST** `/api/auth/register-authority`
Register a new police authority.

**Request Body:**
```json
{
  "email": "officer@police.gov",
  "password": "securePassword123",
  "name": "Officer John Smith",
  "badge_number": "BADGE-12345",
  "department": "Central Police Station",
  "rank": "Inspector"
}
```

**Response:**
```json
{
  "message": "Authority registered successfully",
  "user_id": "uuid-string",
  "badge_number": "BADGE-12345",
  "department": "Central Police Station"
}
```

---

#### **POST** `/api/auth/login-authority`
Login authority user.

**Request Body:**
```json
{
  "email": "officer@police.gov",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGci...",
  "token_type": "bearer",
  "user_id": "uuid-string",
  "email": "officer@police.gov",
  "role": "authority"
}
```

---

### 2. Tourist Monitoring

#### **GET** `/api/tourists/active`
Get list of all tourists (shows all registered tourists).

**Response:**
```json
[
  {
    "id": "tourist-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "safety_score": 85,
    "last_location": {
      "lat": 48.8566,
      "lon": 2.3522
    },
    "last_seen": "2025-10-03T04:20:00Z",
    "is_active": true,
    "status": "online"
  }
]
```

---

#### **GET** `/api/tourist/{tourist_id}/track`
Get detailed tracking for specific tourist.

**Response:**
```json
{
  "tourist": {
    "id": "tourist-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "safety_score": 85,
    "last_seen": "2025-10-03T04:20:00Z"
  },
  "locations": [
    {
      "id": 456,
      "lat": 48.8566,
      "lon": 2.3522,
      "speed": 1.5,
      "altitude": 35.0,
      "timestamp": "2025-10-03T04:20:00Z"
    }
  ],
  "recent_alerts": [
    {
      "id": 789,
      "type": "anomaly",
      "severity": "high",
      "title": "Safety Alert",
      "description": "Unusual movement pattern",
      "is_acknowledged": false,
      "created_at": "2025-10-03T03:00:00Z"
    }
  ]
}
```

---

#### **GET** `/api/tourist/{tourist_id}/profile`
Get complete tourist profile.

**Response:**
```json
{
  "tourist": {
    "id": "tourist-uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "emergency_contact": "Jane Doe",
    "emergency_phone": "+0987654321",
    "safety_score": 85,
    "is_active": true,
    "last_location": {
      "lat": 48.8566,
      "lon": 2.3522
    },
    "last_seen": "2025-10-03T04:20:00Z",
    "created_at": "2025-10-01T10:00:00Z",
    "member_since_days": 2
  },
  "current_trip": {
    "id": 123,
    "destination": "Paris, France",
    "start_date": "2025-10-03T00:00:00Z",
    "itinerary": "Eiffel Tower, Louvre",
    "duration_hours": 4.33
  },
  "statistics": {
    "total_trips": 5,
    "total_alerts": 2,
    "unresolved_alerts": 0,
    "safety_rating": "safe"
  }
}
```

---

#### **GET** `/api/tourist/{tourist_id}/alerts`
Get all alerts for specific tourist.

**Response:**
```json
[
  {
    "id": 789,
    "type": "anomaly",
    "severity": "high",
    "title": "Safety Alert",
    "description": "Unusual movement pattern",
    "is_acknowledged": true,
    "acknowledged_by": "authority-uuid",
    "acknowledged_at": "2025-10-03T03:10:00Z",
    "is_resolved": true,
    "resolved_at": "2025-10-03T03:30:00Z",
    "created_at": "2025-10-03T03:00:00Z"
  }
]
```

---

#### **GET** `/api/tourist/{tourist_id}/location/current`
Get tourist's current location.

**Response:**
```json
{
  "tourist_id": "tourist-uuid",
  "tourist_name": "John Doe",
  "safety_score": 85,
  "location": {
    "id": 456,
    "latitude": 48.8566,
    "longitude": 2.3522,
    "altitude": 35.0,
    "speed": 1.5,
    "accuracy": 10.0,
    "timestamp": "2025-10-03T04:20:00Z",
    "minutes_ago": 5,
    "is_recent": true,
    "status": "live"
  },
  "zone_status": {
    "inside_restricted": false,
    "risk_level": "low",
    "zones": []
  },
  "last_seen": "2025-10-03T04:20:00Z"
}
```

---

#### **GET** `/api/tourist/{tourist_id}/location/history`
Get tourist's location history.

**Query Parameters:**
- `hours_back` (optional): Hours to look back (default: 24)
- `limit` (optional): Max locations (default: 100)
- `include_trip_info` (optional): Include trip details (default: false)

**Response:**
```json
{
  "tourist_id": "tourist-uuid",
  "tourist_name": "John Doe",
  "filter": {
    "hours_back": 24,
    "limit": 100,
    "time_from": "2025-10-02T04:20:00Z",
    "time_to": "2025-10-03T04:20:00Z"
  },
  "locations": [
    {
      "id": 456,
      "latitude": 48.8566,
      "longitude": 2.3522,
      "altitude": 35.0,
      "speed": 1.5,
      "accuracy": 10.0,
      "timestamp": "2025-10-03T04:20:00Z"
    }
  ],
  "statistics": {
    "total_points": 50,
    "distance_traveled_meters": 5000,
    "distance_traveled_km": 5.0,
    "time_span_hours": 24
  }
}
```

---

#### **GET** `/api/tourist/{tourist_id}/movement-analysis`
Analyze tourist's movement patterns.

**Query Parameters:**
- `hours_back` (optional): Hours to analyze (default: 24)

**Response:**
```json
{
  "tourist_id": "tourist-uuid",
  "tourist_name": "John Doe",
  "analysis_period": {
    "hours": 24,
    "from": "2025-10-02T04:20:00Z",
    "to": "2025-10-03T04:20:00Z"
  },
  "movement_metrics": {
    "total_distance_km": 5.2,
    "average_speed_kmh": 3.5,
    "max_speed_kmh": 45.0,
    "movement_type": "walking",
    "data_points": 50,
    "stationary_periods": 5
  },
  "behavior_assessment": {
    "is_moving": true,
    "unusual_speed": false,
    "mostly_stationary": false,
    "activity_level": "moderate"
  }
}
```

---

#### **GET** `/api/tourist/{tourist_id}/safety-timeline`
Get comprehensive safety timeline.

**Query Parameters:**
- `hours_back` (optional): Hours to look back (default: 24)

**Response:**
```json
{
  "tourist_id": "tourist-uuid",
  "tourist_name": "John Doe",
  "current_safety_score": 85,
  "period": {
    "hours": 24,
    "from": "2025-10-02T04:20:00Z",
    "to": "2025-10-03T04:20:00Z"
  },
  "timeline": [
    {
      "timestamp": "2025-10-03T03:00:00Z",
      "type": "alert",
      "event": "anomaly",
      "severity": "high",
      "title": "Safety Alert",
      "description": "Unusual movement",
      "is_resolved": true
    },
    {
      "timestamp": "2025-10-03T00:00:00Z",
      "type": "trip_start",
      "event": "trip_started",
      "destination": "Paris",
      "trip_id": 123
    }
  ],
  "summary": {
    "total_events": 2,
    "alerts_count": 1,
    "critical_alerts": 0,
    "trips_count": 1,
    "unresolved_alerts": 0
  }
}
```

---

#### **GET** `/api/tourist/{tourist_id}/emergency-contacts`
Get tourist's emergency contacts.

**Response:**
```json
{
  "tourist": {
    "id": "tourist-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "emergency_contacts": [
    {
      "name": "Jane Doe",
      "phone": "+0987654321",
      "relationship": "emergency_contact"
    }
  ],
  "note": "This information should only be used in emergency situations"
}
```

---

### 3. Alert Management

#### **GET** `/api/alerts/recent`
Get recent alerts across all tourists.

**Query Parameters:**
- `hours` (optional): Hours to look back (default: 24)

**Response:**
```json
[
  {
    "id": 789,
    "tourist": {
      "id": "tourist-uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "type": "anomaly",
    "severity": "high",
    "title": "Safety Alert",
    "description": "Unusual movement pattern",
    "is_acknowledged": false,
    "is_resolved": false,
    "created_at": "2025-10-03T03:00:00Z"
  }
]
```

---

#### **POST** `/api/incident/acknowledge`
Acknowledge an alert/incident.

**Request Body:**
```json
{
  "alert_id": 789,
  "notes": "Investigating the situation"
}
```

**Response:**
```json
{
  "status": "acknowledged",
  "alert_id": 789,
  "incident_number": "INC-20251003-000789",
  "acknowledged_by": "authority-uuid",
  "acknowledged_at": "2025-10-03T04:20:00Z"
}
```

---

#### **POST** `/api/incident/close`
Close an incident.

**Request Body:**
```json
{
  "alert_id": 789,
  "notes": "False alarm - tourist was exercising"
}
```

**Response:**
```json
{
  "status": "closed",
  "incident_number": "INC-20251003-000789",
  "closed_at": "2025-10-03T04:30:00Z",
  "closed_by": "authority-uuid"
}
```

---

#### **POST** `/api/authority/alert/resolve` 🆕
Mark an alert as resolved after handling the situation.

**Description:**  
This endpoint allows authorities to mark panic/SOS alerts as resolved after the emergency has been handled. Resolved alerts are filtered out from the public panic alerts endpoint by default, reducing noise for emergency services.

**Request Body:**
```json
{
  "alert_id": 353,
  "notes": "Situation handled. Tourist is safe and was reunited with their group."
}
```

**Response:**
```json
{
  "status": "resolved",
  "alert_id": 353,
  "alert_type": "sos",
  "resolved_at": "2025-10-03T05:45:00.000000+00:00",
  "resolved_by": "authority-uuid",
  "authority_name": "Officer Smith",
  "notes": "Situation handled. Tourist is safe and was reunited with their group."
}
```

**If Already Resolved:**
```json
{
  "status": "already_resolved",
  "alert_id": 353,
  "resolved_at": "2025-10-03T05:45:00.000000+00:00",
  "resolved_by": "authority-uuid"
}
```

**Benefits:**
- ✅ Filters resolved alerts from public endpoint
- ✅ Tracks which authority resolved the alert
- ✅ Provides accountability and audit trail
- ✅ Automatically updates associated incidents
- ✅ Improves emergency response workflow

---

### 4. E-FIR Management

#### **POST** `/api/authority/efir/generate`
Generate E-FIR for incident (by authority).

**Request Body:**
```json
{
  "alert_id": 789,
  "notes": "Theft reported, witness statements collected"
}
```

**Response:**
```json
{
  "status": "efir_generated",
  "efir_number": "EFIR-20251003-00001",
  "efir_id": 123,
  "incident_number": "INC-20251003-000789",
  "blockchain_tx": "0x123abc...",
  "block_hash": "0x456def...",
  "generated_at": "2025-10-03T04:30:00Z"
}
```

---

#### **GET** `/api/authority/efir/list`
List all E-FIR records.

**Query Parameters:**
- `limit` (optional): Number of records (default: 100)
- `offset` (optional): Pagination offset (default: 0)
- `report_source` (optional): Filter by source ("tourist" or "authority")
- `is_verified` (optional): Filter by verification status
- `status` (optional): Filter by incident status

**Response:**
```json
{
  "success": true,
  "efir_records": [
    {
      "efir_id": 123,
      "fir_number": "EFIR-20251003-00001",
      "blockchain_tx_id": "0x123abc...",
      "block_hash": "0x456def...",
      "chain_id": "safehorizon-efir-chain",
      "report_source": "authority",
      "alert_id": 789,
      "incident_type": "sos",
      "severity": "critical",
      "description": "Theft reported",
      "tourist": {
        "id": "tourist-uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "location": {
        "lat": 48.8566,
        "lon": 2.3522,
        "description": "Near Eiffel Tower"
      },
      "officer": {
        "id": "authority-uuid",
        "name": "Officer Smith",
        "badge": "BADGE-12345",
        "department": "Central Police"
      },
      "officer_notes": "Witness statements collected",
      "witnesses": [],
      "evidence": [],
      "is_verified": true,
      "verification_timestamp": "2025-10-03T04:30:00Z",
      "incident_timestamp": "2025-10-03T03:00:00Z",
      "generated_at": "2025-10-03T04:30:00Z",
      "incident": {
        "incident_number": "INC-20251003-000789",
        "incident_id": 456,
        "status": "closed",
        "priority": "high",
        "assigned_to": "authority-uuid"
      }
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 100,
    "offset": 0,
    "has_more": false
  }
}
```

---

### 5. Zone Management

#### **GET** `/api/zones/manage`
Get all zones for management.

**Response:**
```json
{
  "zones": [
    {
      "id": 10,
      "name": "Tourist Safe Zone",
      "type": "safe",
      "center": {"lat": 48.8566, "lon": 2.3522},
      "radius_meters": 1000
    }
  ]
}
```

---

#### **POST** `/api/zones/create`
Create a new restricted zone.

**Request Body:**
```json
{
  "name": "Construction Zone",
  "description": "Temporary construction area",
  "zone_type": "restricted",
  "coordinates": [
    [2.3520, 48.8560],
    [2.3525, 48.8560],
    [2.3525, 48.8565],
    [2.3520, 48.8565]
  ]
}
```

**Response:**
```json
{
  "status": "zone_created",
  "zone_id": 11,
  "name": "Construction Zone",
  "type": "restricted"
}
```

---

#### **DELETE** `/api/zones/{zone_id}`
Delete a zone.

**Response:**
```json
{
  "status": "zone_deleted",
  "id": 11
}
```

---

### 6. Heatmap & Analytics

#### **GET** `/api/heatmap/data`
Get comprehensive heatmap data.

**Query Parameters:**
- `bounds_north`, `bounds_south`, `bounds_east`, `bounds_west` (optional)
- `hours_back` (optional): Hours of data (default: 24)
- `include_zones` (optional): Include zones (default: true)
- `include_alerts` (optional): Include alerts (default: true)
- `include_tourists` (optional): Include tourist locations (default: true)

**Response:**
```json
{
  "metadata": {
    "bounds": null,
    "hours_back": 24,
    "generated_at": "2025-10-03T04:20:00Z",
    "data_types": ["zones", "alerts", "tourists", "hotspots"],
    "summary": {
      "zones_count": 5,
      "alerts_count": 10,
      "tourists_count": 50,
      "hotspots_count": 3
    }
  },
  "zones": [...],
  "alerts": [...],
  "tourists": [...],
  "hotspots": [...]
}
```

---

#### **GET** `/api/heatmap/zones`
Get zones for heatmap.

**Query Parameters:**
- `zone_type` (optional): Filter ("safe", "risky", "restricted", "all")
- `bounds_north`, `bounds_south`, `bounds_east`, `bounds_west` (optional)

**Response:**
```json
{
  "zones": [
    {
      "id": 10,
      "name": "Tourist Safe Zone",
      "type": "safe",
      "center": {"lat": 48.8566, "lon": 2.3522},
      "radius_meters": 1000,
      "description": "Well-patrolled area",
      "bounds_json": "...",
      "risk_weight": 0.1,
      "created_at": "2025-10-01T10:00:00Z"
    }
  ],
  "total": 1,
  "filter": {
    "zone_type": "all",
    "bounds": null
  },
  "generated_at": "2025-10-03T04:20:00Z"
}
```

---

#### **GET** `/api/heatmap/alerts`
Get alerts for heatmap.

**Query Parameters:**
- `alert_type` (optional): Filter by type
- `severity` (optional): Filter by severity
- `hours_back` (optional): Hours (default: 24)
- `bounds_north`, `bounds_south`, `bounds_east`, `bounds_west` (optional)

---

### 7. WebSocket Connection

#### **WebSocket** `/api/alerts/subscribe`
Subscribe to real-time alerts.

**Connection URL:**
```
ws://localhost:8000/api/alerts/subscribe?token=<jwt_token>
```

**Message Types Received:**
```json
{
  "type": "safety_alert",
  "alert_id": 789,
  "tourist_id": "uuid",
  "tourist_name": "John Doe",
  "severity": "high",
  "safety_score": 45,
  "risk_level": "high",
  "location": {"lat": 48.8566, "lon": 2.3522},
  "timestamp": "2025-10-03T04:20:00Z"
}
```

**Heartbeat:**
- Send: `"ping"`
- Receive: `"pong"`

---

## Admin Endpoints

### 1. System Management

#### **GET** `/api/system/status`
Get system status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-03T04:20:00Z",
  "database": {
    "status": "connected",
    "tourists_total": 150,
    "authorities_total": 25,
    "active_tourists_24h": 80,
    "recent_alerts_24h": 15
  },
  "websockets": {
    "authority": 5,
    "tourist": 20,
    "admin": 1
  },
  "services": {
    "redis": "connected",
    "ai_models": "loaded"
  }
}
```

---

#### **POST** `/api/system/retrain-model`
Trigger AI model retraining.

**Request Body:**
```json
{
  "model_types": ["anomaly", "sequence"],
  "days_back": 30
}
```

**Response:**
```json
{
  "status": "retrain_started",
  "model_types": ["anomaly", "sequence"],
  "days_back": 30,
  "started_at": "2025-10-03T04:20:00Z",
  "started_by": "admin-uuid"
}
```

---

### 2. User Management

#### **GET** `/api/users/list`
List all users.

**Query Parameters:**
- `user_type` (optional): Filter ("tourist" or "authority")
- `limit` (optional): Max users (default: 100)

**Response:**
```json
{
  "users": [
    {
      "id": "user-uuid",
      "type": "tourist",
      "email": "user@example.com",
      "name": "John Doe",
      "phone": "+1234567890",
      "safety_score": 85,
      "is_active": true,
      "last_seen": "2025-10-03T04:20:00Z",
      "created_at": "2025-10-01T10:00:00Z"
    }
  ],
  "total": 1,
  "filter": "all"
}
```

---

#### **PUT** `/api/users/{user_id}/suspend`
Suspend a user.

**Request Body:**
```json
{
  "reason": "Violation of terms of service"
}
```

**Response:**
```json
{
  "id": "user-uuid",
  "type": "tourist",
  "status": "suspended",
  "reason": "Violation of terms of service",
  "suspended_by": "admin-uuid",
  "suspended_at": "2025-10-03T04:20:00Z"
}
```

---

#### **PUT** `/api/users/{user_id}/activate`
Reactivate a suspended user.

**Response:**
```json
{
  "id": "user-uuid",
  "type": "tourist",
  "status": "activated"
}
```

---

### 3. Analytics

#### **GET** `/api/analytics/dashboard`
Get analytics dashboard data.

**Query Parameters:**
- `days` (optional): Days to analyze (default: 7)

**Response:**
```json
{
  "period_days": 7,
  "alerts_by_type": {
    "anomaly": 25,
    "sos": 5,
    "geofence": 10
  },
  "safety_score_distribution": {
    "critical": 5,
    "high_risk": 15,
    "medium_risk": 30,
    "low_risk": 100
  },
  "average_safety_score": 78.5,
  "total_active_tourists": 150,
  "generated_at": "2025-10-03T04:20:00Z"
}
```

---

## AI Endpoints

### 1. Geofence

#### **POST** `/api/ai/geofence/check`
Check if coordinates are in restricted zones.

**Request Body:**
```json
{
  "lat": 48.8566,
  "lon": 2.3522
}
```

**Response:**
```json
{
  "inside_restricted": false,
  "risk_level": "low",
  "zones": []
}
```

---

#### **POST** `/api/ai/geofence/nearby`
Get nearby zones.

**Request Body:**
```json
{
  "lat": 48.8566,
  "lon": 2.3522
}
```

**Query Parameters:**
- `radius` (optional): Radius in meters (default: 1000)

**Response:**
```json
{
  "nearby_zones": [
    {
      "id": 10,
      "name": "Safe Zone",
      "type": "safe",
      "distance_meters": 500
    }
  ],
  "radius_meters": 1000,
  "center": {"lat": 48.8566, "lon": 2.3522}
}
```

---

### 2. Anomaly Detection

#### **POST** `/api/ai/anomaly/point`
Score single location for anomaly.

**Request Body:**
```json
{
  "lat": 48.8566,
  "lon": 2.3522,
  "speed": 1.5,
  "timestamp": "2025-10-03T04:20:00Z"
}
```

**Response:**
```json
{
  "anomaly_score": 0.35,
  "risk_level": "low",
  "location": {"lat": 48.8566, "lon": 2.3522},
  "timestamp": "2025-10-03T04:20:00Z"
}
```

---

#### **POST** `/api/ai/anomaly/sequence`
Score sequence of locations.

**Request Body:**
```json
{
  "points": [
    {
      "lat": 48.8566,
      "lon": 2.3522,
      "speed": 1.5,
      "timestamp": "2025-10-03T04:20:00Z"
    }
  ]
}
```

**Response:**
```json
{
  "sequence_anomaly_score": 0.42,
  "risk_level": "medium",
  "sequence_length": 1,
  "timestamp": "2025-10-03T04:20:00Z"
}
```

---

### 3. Safety Scoring

#### **POST** `/api/ai/score/compute`
Compute comprehensive safety score.

**Request Body:**
```json
{
  "lat": 48.8566,
  "lon": 2.3522,
  "location_history": [],
  "current_location_data": {
    "latitude": 48.8566,
    "longitude": 2.3522,
    "timestamp": "2025-10-03T04:20:00Z"
  },
  "manual_adjustment": 0
}
```

**Response:**
```json
{
  "safety_score": 75,
  "risk_level": "medium",
  "components": {
    "geofence": "evaluated",
    "anomaly": "evaluated",
    "sequence": "insufficient_data",
    "manual_adjustment": 0
  },
  "location": {"lat": 48.8566, "lon": 2.3522},
  "timestamp": "2025-10-03T04:20:00Z"
}
```

---

### 4. Alert Classification

#### **POST** `/api/ai/classify/alert`
Classify alert severity.

**Request Body:**
```json
{
  "safety_score": 45,
  "alert_type": "anomaly",
  "location_data": {},
  "context": {}
}
```

**Response:**
```json
{
  "predicted_severity": "high",
  "confidence": 0.85,
  "severity_probabilities": {
    "low": 0.1,
    "medium": 0.2,
    "high": 0.85,
    "critical": 0.4
  },
  "reasoning": [
    "Low safety score (45) indicates high risk",
    "Classification: high"
  ],
  "features_used": {
    "safety_score": 45,
    "alert_type": "anomaly",
    "has_location": false,
    "context": {}
  },
  "timestamp": "2025-10-03T04:20:00Z"
}
```

---

### 5. Model Status

#### **GET** `/api/ai/models/status`
Get AI models status.

**Response:**
```json
{
  "models": {
    "isolation_forest": {
      "status": "loaded",
      "type": "anomaly_detection",
      "algorithm": "Isolation Forest",
      "file_exists": true
    },
    "lstm_autoencoder": {
      "status": "loaded",
      "type": "sequence_analysis",
      "architecture": "LSTM Autoencoder",
      "file_exists": true
    },
    "geofence": {
      "status": "active",
      "type": "rule_based",
      "zones_count": "dynamic"
    },
    "safety_scorer": {
      "status": "active",
      "type": "composite",
      "components": ["geofence", "anomaly", "sequence"]
    }
  },
  "timestamp": "2025-10-03T04:20:00Z"
}
```

---

## Notification Endpoints

### 1. Push Notifications

#### **POST** `/api/notify/push`
Send push notification.

**Request Body:**
```json
{
  "user_id": "uuid",
  "title": "Safety Alert",
  "body": "Please check your location",
  "token": "fcm-device-token",
  "data": {
    "alert_id": "789",
    "type": "safety"
  }
}
```

**Response:**
```json
{
  "status": "push_sent",
  "user_id": "uuid",
  "timestamp": "2025-10-03T04:20:00Z"
}
```

---

### 2. SMS Notifications

#### **POST** `/api/notify/sms`
Send SMS notification.

**Request Body:**
```json
{
  "to_number": "+1234567890",
  "body": "Emergency alert - please check your location"
}
```

**Response:**
```json
{
  "status": "sms_sent",
  "to": "+1234567890",
  "timestamp": "2025-10-03T04:20:00Z"
}
```

---

### 3. Emergency Alerts

#### **POST** `/api/notify/emergency`
Send emergency notification (Authority only).

**Request Body:**
```json
{
  "tourist_id": "uuid",
  "alert_type": "sos",
  "location": {"lat": 48.8566, "lon": 2.3522},
  "message": "Emergency assistance needed"
}
```

**Response:**
```json
{
  "status": "emergency_sent",
  "tourist_id": "uuid",
  "results": {
    "sms": true,
    "push": true,
    "email": true
  },
  "timestamp": "2025-10-03T04:20:00Z"
}
```

---

### 4. Broadcast Notifications

#### **POST** `/api/notify/broadcast`
Broadcast to multiple users (Authority only).

**Request Body:**
```json
{
  "title": "Weather Alert",
  "body": "Storm approaching - seek shelter",
  "target_group": "tourists",
  "data": {
    "type": "weather",
    "severity": "high"
  }
}
```

**Target Groups:** `all`, `tourists`, `authorities`

**Response:**
```json
{
  "status": "broadcast_completed",
  "target_group": "tourists",
  "total_recipients": 150,
  "successful": 145,
  "failed": 5,
  "title": "Weather Alert",
  "message": "Storm approaching",
  "timestamp": "2025-10-03T04:20:00Z"
}
```

---

### 5. Notification History

#### **GET** `/api/notify/history`
Get notification history.

**Query Parameters:**
- `hours` (optional): Hours to look back (default: 24)

**Response:**
```json
{
  "notifications": [
    {
      "id": "notif-789",
      "alert_id": 789,
      "type": "alert_notification",
      "title": "Safety Alert",
      "body": "Unusual movement detected",
      "severity": "high",
      "alert_type": "anomaly",
      "tourist_id": "uuid",
      "created_at": "2025-10-03T04:20:00Z",
      "acknowledged": false
    }
  ],
  "period_hours": 24,
  "total": 1,
  "summary": {
    "critical": 0,
    "high": 1,
    "medium": 0,
    "low": 0
  }
}
```

---

### 6. Notification Settings

#### **GET** `/api/notify/settings`
Get notification settings.

**Response:**
```json
{
  "user_id": "uuid",
  "role": "tourist",
  "push_enabled": true,
  "sms_enabled": true,
  "email_enabled": true,
  "emergency_contacts_enabled": true,
  "notification_types": {
    "safety_alerts": true,
    "geofence_warnings": true,
    "system_updates": true,
    "emergency_alerts": true,
    "trip_reminders": true
  },
  "quiet_hours": {
    "enabled": false,
    "start": "22:00",
    "end": "07:00"
  },
  "emergency_contacts": [
    {
      "name": "Jane Doe",
      "phone": "+0987654321"
    }
  ]
}
```

---

#### **PUT** `/api/notify/settings`
Update notification settings.

**Request Body:**
```json
{
  "push_enabled": true,
  "sms_enabled": false,
  "notification_types": {
    "safety_alerts": true,
    "trip_reminders": false
  }
}
```

**Response:**
```json
{
  "status": "settings_updated",
  "user_id": "uuid",
  "updated_settings": {
    "push_enabled": true,
    "sms_enabled": false
  },
  "timestamp": "2025-10-03T04:20:00Z"
}
```

---

### 7. Public Panic Alerts (Moved to Public Endpoints Section)

See [Public Endpoints](#public-endpoints) section for the `/api/public/panic-alerts` endpoint.

---

## WebSocket Connections

### Tourist Alerts WebSocket
Not yet implemented for tourists, but authorities have real-time alerts.

### Authority Alerts WebSocket

**Connection URL:**
```
ws://localhost:8000/api/alerts/subscribe?token=<jwt_token>
```

**Authentication:**
- Include JWT token as query parameter
- Only authority and admin roles can connect

**Incoming Message Types:**

1. **Safety Alert**
```json
{
  "type": "safety_alert",
  "alert_id": 789,
  "tourist_id": "uuid",
  "tourist_name": "John Doe",
  "severity": "high",
  "safety_score": 45,
  "risk_level": "high",
  "location": {"lat": 48.8566, "lon": 2.3522},
  "ai_factors": {...},
  "recommendations": [...],
  "timestamp": "2025-10-03T04:20:00Z"
}
```

2. **SOS Alert**
```json
{
  "type": "sos_alert",
  "alert_id": 789,
  "tourist_id": "uuid",
  "tourist_name": "John Doe",
  "severity": "critical",
  "location": {"lat": 48.8566, "lon": 2.3522},
  "timestamp": "2025-10-03T04:20:00Z"
}
```

3. **E-FIR Generated**
```json
{
  "type": "efir_generated",
  "efir_id": 123,
  "fir_number": "EFIR-20251003-...",
  "tourist_id": "uuid",
  "tourist_name": "John Doe",
  "incident_type": "theft",
  "location": "Near Eiffel Tower",
  "timestamp": "2025-10-03T04:20:00Z",
  "alert_id": 789,
  "report_source": "tourist"
}
```

**Heartbeat:**
- Send `"ping"` to keep connection alive
- Receive `"pong"` as response

---

## Data Models

### Tourist
```typescript
interface Tourist {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  safety_score: number; // 0-100
  is_active: boolean;
  last_location_lat?: number;
  last_location_lon?: number;
  last_seen?: string; // ISO datetime
  created_at: string;
  updated_at?: string;
}
```

### Location
```typescript
interface Location {
  id: number;
  tourist_id: string;
  trip_id?: number;
  latitude: number;
  longitude: number;
  altitude?: number;
  speed?: number;
  accuracy?: number;
  timestamp: string; // ISO datetime
  safety_score?: number; // AI-calculated
  safety_score_updated_at?: string;
  created_at: string;
}
```

### Alert
```typescript
enum AlertType {
  GEOFENCE = "geofence",
  ANOMALY = "anomaly",
  PANIC = "panic",
  SOS = "sos",
  SEQUENCE = "sequence",
  MANUAL = "manual"
}

enum AlertSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}

interface Alert {
  id: number;
  tourist_id: string;
  location_id?: number;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description?: string;
  is_acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  is_resolved: boolean;
  resolved_at?: string;
  created_at: string;
  updated_at?: string;
}
```

### Trip
```typescript
enum TripStatus {
  PLANNED = "planned",
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELLED = "cancelled"
}

interface Trip {
  id: number;
  tourist_id: string;
  destination: string;
  start_date?: string;
  end_date?: string;
  status: TripStatus;
  itinerary?: string;
  created_at: string;
  updated_at?: string;
}
```

### Zone
```typescript
enum ZoneType {
  SAFE = "safe",
  RISKY = "risky",
  RESTRICTED = "restricted"
}

interface Zone {
  id: number;
  name: string;
  description?: string;
  zone_type: ZoneType;
  center_latitude: number;
  center_longitude: number;
  radius_meters?: number;
  bounds_json?: string; // GeoJSON polygon
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at?: string;
}
```

### E-FIR
```typescript
interface EFIR {
  id: number;
  efir_number: string;
  incident_id?: number;
  alert_id?: number;
  tourist_id: string;
  blockchain_tx_id?: string;
  block_hash?: string;
  chain_id: string;
  incident_type: string;
  severity: string;
  description: string;
  location_lat?: number;
  location_lon?: number;
  location_description?: string;
  tourist_name?: string;
  tourist_email?: string;
  tourist_phone?: string;
  reported_by?: string; // Authority ID
  officer_name?: string;
  officer_badge?: string;
  officer_department?: string;
  officer_notes?: string;
  report_source: "tourist" | "authority";
  witnesses?: string[]; // JSON
  evidence?: string[]; // JSON
  is_verified: boolean;
  verification_timestamp?: string;
  incident_timestamp: string;
  generated_at: string;
  additional_data?: Record<string, any>; // JSON
}
```

### Broadcast
```typescript
enum BroadcastType {
  RADIUS = "radius",
  ZONE = "zone",
  REGION = "region",
  ALL = "all"
}

enum BroadcastSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}

interface EmergencyBroadcast {
  id: number;
  broadcast_id: string;
  broadcast_type: BroadcastType;
  title: string;
  message: string;
  severity: BroadcastSeverity;
  alert_type?: string;
  action_required?: string;
  sent_by: string; // Authority ID
  sent_at: string;
  expires_at?: string;
  center_latitude?: number; // For RADIUS type
  center_longitude?: number;
  radius_km?: number;
  zone_id?: number; // For ZONE type
  region_name?: string; // For REGION type
  tourists_notified_count: number;
  acknowledgment_count: number;
}
```

---

## Error Responses

All endpoints return standard error responses:

### 400 Bad Request
```json
{
  "detail": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "detail": "Access denied: insufficient permissions"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ],
  "body": {...}
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error occurred",
  "error_type": "Exception"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. Consider implementing rate limiting in production.

---

## CORS Configuration

The API supports CORS with the following default origins:
- `http://localhost:5173` (Vite)
- `http://localhost:3000` (React/Next.js)
- `http://localhost:8080` (Vue)
- All origins (`*`) in development

Configure `ALLOWED_ORIGINS` in `.env` file for production.

---

## Environment Variables

Create a `.env` file with these variables:

```env
# App Configuration
APP_NAME=SafeHorizon API
APP_ENV=development
APP_DEBUG=True
API_PREFIX=/api

# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/safehorizon
SYNC_DATABASE_URL=postgresql://user:password@localhost:5432/safehorizon

# Redis (for caching and WebSocket)
REDIS_URL=redis://localhost:6379/0

# Firebase (for push notifications)
FIREBASE_CREDENTIALS_JSON_PATH=./firebase-credentials.json

# Twilio (for SMS)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+1234567890

# AI Models
MODELS_DIR=./models_store

# CORS
ALLOWED_ORIGINS=["*"]
```

---

## Testing Endpoints

### Health Check
**GET** `/health` (**PUBLIC**)

**Response:**
```json
{
  "status": "ok"
}
```

---

## Notes for Frontend Developers

1. **Authentication**: Always include `Authorization: Bearer <token>` header
2. **Timestamps**: All timestamps are in UTC ISO 8601 format
3. **Safety Scores**: Range from 0-100 (higher is safer)
4. **Risk Levels**: `low`, `medium`, `high`, `critical`
5. **WebSocket**: Use WebSocket for real-time authority alerts
6. **Device Tokens**: Register device tokens for push notifications
7. **Broadcasts**: Poll `/api/broadcasts/active` or listen via WebSocket
8. **E-FIR**: Tourists can self-report incidents, authorities can generate official E-FIRs
9. **Location Updates**: Send location updates regularly for accurate tracking
10. **Error Handling**: All errors follow standard JSON error format

---

## API Version

**Current Version**: 1.0.0  
**Last Updated**: October 3, 2025

---

## Support & Contact

For API support and questions:
- Documentation: This file
- GitHub: [Repository URL]
- Email: support@safehorizon.com

---

**End of Documentation**
