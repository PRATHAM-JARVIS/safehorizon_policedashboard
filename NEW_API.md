# 🚀 SafeHorizon API Reference

**Complete API Documentation - All 57 Production Endpoints**

Base URL: `https://your-domain.com/api`  
Version: `1.0.0`  
Authentication: JWT Bearer Token

---

## 📑 Table of Contents

1. [Tourist Endpoints (15)](#1-tourist-endpoints)
2. [Authority Endpoints (22)](#2-authority-endpoints)
3. [AI/ML Endpoints (7)](#3-ai-ml-endpoints)
4. [Admin Endpoints (6)](#4-admin-endpoints)
5. [Notification Endpoints (7)](#5-notification-endpoints)
6. [Authentication & Authorization](#authentication--authorization)
7. [Error Handling](#error-handling)

---

## 1. Tourist Endpoints

### 1.1 Register Tourist

**POST** `/api/auth/register`

Register a new tourist user account.

**Request Body:**
```json
{
  "email": "tourist@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "phone": "+1234567890",
  "emergency_contact": "Jane Doe",
  "emergency_phone": "+0987654321"
}
```

**Response (200 OK):**
```json
{
  "message": "Tourist registered successfully",
  "user_id": "uuid-string",
  "email": "tourist@example.com"
}
```

**Errors:**
- `400 Bad Request` - Validation error or user already exists
- `500 Internal Server Error` - Registration failed

---

### 1.2 Login Tourist

**POST** `/api/auth/login`

Authenticate tourist and get JWT access token.

**Request Body:**
```json
{
  "email": "tourist@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": "uuid-string",
  "email": "tourist@example.com",
  "role": "tourist"
}
```

**Errors:**
- `401 Unauthorized` - Invalid credentials
- `500 Internal Server Error` - Login failed

---

### 1.3 Get Current User Info

**GET** `/api/auth/me`

Get authenticated tourist's profile information.

**Authentication:** Required (Bearer Token)

**Response (200 OK):**
```json
{
  "id": "uuid-string",
  "email": "tourist@example.com",
  "name": "John Doe",
  "phone": "+1234567890",
  "safety_score": 85,
  "last_seen": "2025-01-12T10:30:00.000Z"
}
```

**Errors:**
- `401 Unauthorized` - Invalid/missing token
- `404 Not Found` - User not found

---

### 1.4 Start Trip

**POST** `/api/trip/start`

Start a new trip for the authenticated tourist.

**Authentication:** Required (Tourist role)

**Request Body:**
```json
{
  "destination": "Paris, France",
  "itinerary": "Visit Eiffel Tower, Louvre Museum, Notre-Dame"
}
```

**Response (200 OK):**
```json
{
  "trip_id": 123,
  "destination": "Paris, France",
  "status": "active",
  "start_date": "2025-01-12T10:30:00.000Z"
}
```

**Errors:**
- `401 Unauthorized` - Not authenticated
- `500 Internal Server Error` - Failed to create trip

---

### 1.5 End Trip

**POST** `/api/trip/end`

End the currently active trip.

**Authentication:** Required (Tourist role)

**Response (200 OK):**
```json
{
  "trip_id": 123,
  "status": "completed",
  "end_date": "2025-01-15T18:00:00.000Z"
}
```

**Errors:**
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - No active trip found

---

### 1.6 Get Trip History

**GET** `/api/trip/history`

Get all trips for the authenticated tourist.

**Authentication:** Required (Tourist role)

**Response (200 OK):**
```json
[
  {
    "id": 123,
    "destination": "Paris, France",
    "status": "completed",
    "start_date": "2025-01-12T10:30:00.000Z",
    "end_date": "2025-01-15T18:00:00.000Z",
    "created_at": "2025-01-12T10:30:00.000Z"
  },
  {
    "id": 124,
    "destination": "Tokyo, Japan",
    "status": "active",
    "start_date": "2025-01-16T08:00:00.000Z",
    "end_date": null,
    "created_at": "2025-01-16T08:00:00.000Z"
  }
]
```

---

### 1.7 Update Location

**POST** `/api/location/update`

Update tourist's current GPS location and trigger AI safety analysis.

**Authentication:** Required (Tourist role)

**Request Body:**
```json
{
  "lat": 48.8584,
  "lon": 2.2945,
  "speed": 1.5,
  "altitude": 35.0,
  "accuracy": 10.0,
  "timestamp": "2025-01-12T10:35:00.000Z"
}
```

**Response (200 OK):**
```json
{
  "status": "location_updated",
  "location_id": 456,
  "safety_score": 85,
  "risk_level": "low",
  "lat": 48.8584,
  "lon": 2.2945,
  "timestamp": "2025-01-12T10:35:00.000Z"
}
```

**Errors:**
- `400 Bad Request` - Invalid coordinates
- `401 Unauthorized` - Not authenticated

---

### 1.8 Get Location History

**GET** `/api/location/history?limit=100`

Get tourist's location history.

**Authentication:** Required (Tourist role)

**Query Parameters:**
- `limit` (optional, default: 100) - Maximum number of locations to return

**Response (200 OK):**
```json
[
  {
    "id": 456,
    "lat": 48.8584,
    "lon": 2.2945,
    "speed": 1.5,
    "altitude": 35.0,
    "accuracy": 10.0,
    "timestamp": "2025-01-12T10:35:00.000Z"
  }
]
```

---

### 1.9 Get Safety Score

**GET** `/api/safety/score`

Get current safety score for authenticated tourist.

**Authentication:** Required (Tourist role)

**Response (200 OK):**
```json
{
  "safety_score": 85,
  "risk_level": "low",
  "last_updated": "2025-01-12T10:35:00.000Z"
}
```

**Risk Levels:**
- `low` (score 70-100)
- `medium` (score 40-69)
- `high` (score 0-39)

---

### 1.10 Trigger SOS

**POST** `/api/sos/trigger`

Trigger emergency SOS alert. Notifies police, family, and emergency contacts.

**Authentication:** Required (Tourist role)

**Response (200 OK):**
```json
{
  "status": "sos_triggered",
  "alert_id": 789,
  "notifications_sent": {
    "push_notifications": 3,
    "sms_alerts": 2,
    "email_alerts": 2
  },
  "timestamp": "2025-01-12T10:40:00.000Z"
}
```

**Errors:**
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Tourist profile not found
- `500 Internal Server Error` - Failed to send alerts

---

### 1.11 Generate E-FIR (Tourist)

**POST** `/api/efir/generate`

Generate Electronic First Information Report for tourist-reported incident.

**Authentication:** Required (Tourist role)

**Request Body:**
```json
{
  "incident_description": "Lost passport and wallet stolen",
  "incident_type": "theft",
  "location": "48.8584, 2.2945",
  "timestamp": "2025-01-12T10:00:00.000Z",
  "witnesses": ["John Smith", "Jane Doe"],
  "additional_details": "Incident occurred near Metro station"
}
```

**Response (200 OK):**
```json
{
  "message": "E-FIR generated successfully",
  "fir_number": "EFIR-2025-01-uuid-1736681400",
  "blockchain_tx_id": "a1b2c3d4e5f6...",
  "timestamp": "2025-01-12T10:00:00.000Z",
  "verification_url": "/api/blockchain/verify/a1b2c3d4e5f6",
  "status": "submitted",
  "reference_number": "REF-TOURIST-789"
}
```

**Errors:**
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Tourist not found
- `500 Internal Server Error` - E-FIR generation failed

---

### 1.12 Debug Role

**GET** `/api/debug/role`

Debug endpoint to check user role and permissions.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "user_id": "uuid-string",
  "email": "tourist@example.com",
  "role": "tourist",
  "is_tourist": true,
  "is_authority": false,
  "is_admin": false
}
```

---

### 1.13 List All Zones

**GET** `/api/zones/list`

Get list of all safety zones (safe/risky/restricted).

**Authentication:** Required

**Response (200 OK):**
```json
{
  "zones": [
    {
      "id": 1,
      "name": "Tourist Safe Zone - Downtown",
      "type": "safe",
      "description": "Well-lit area with police presence",
      "coordinates": [[2.2945, 48.8584], [2.2955, 48.8594]]
    }
  ],
  "total": 10
}
```

---

### 1.14 Get Nearby Zones

**GET** `/api/zones/nearby?lat=48.8584&lon=2.2945&radius=5000`

Get zones near tourist's location.

**Authentication:** Required

**Query Parameters:**
- `lat` (required) - Latitude
- `lon` (required) - Longitude
- `radius` (optional, default: 5000) - Radius in meters

**Response (200 OK):**
```json
{
  "nearby_zones": [
    {
      "id": 1,
      "name": "Tourist Safe Zone",
      "type": "safe",
      "distance_meters": 150
    }
  ],
  "center": {"lat": 48.8584, "lon": 2.2945},
  "radius_meters": 5000,
  "total": 3,
  "generated_at": "2025-01-12T10:45:00.000Z"
}
```

---

### 1.15 Get Public Zone Heatmap

**GET** `/api/heatmap/zones/public?bounds_north=49&bounds_south=48&bounds_east=3&bounds_west=2&zone_type=safe`

Get public heatmap data for zones.

**Authentication:** Required

**Query Parameters:**
- `bounds_north` (optional) - Northern boundary
- `bounds_south` (optional) - Southern boundary
- `bounds_east` (optional) - Eastern boundary
- `bounds_west` (optional) - Western boundary
- `zone_type` (optional) - Filter by zone type (safe/risky/restricted)

**Response (200 OK):**
```json
{
  "zones": [
    {
      "id": 1,
      "name": "Safe Zone",
      "type": "safe",
      "coordinates": [[2.2945, 48.8584]],
      "intensity": 0.8
    }
  ]
}
```

---

## 2. Authority Endpoints

### 2.1 Register Authority

**POST** `/api/auth/register-authority`

Register a new police authority account.

**Request Body:**
```json
{
  "email": "officer@police.gov",
  "password": "SecurePass123!",
  "name": "Officer Smith",
  "badge_number": "BADGE-12345",
  "department": "Paris Police Department",
  "rank": "Inspector"
}
```

**Response (200 OK):**
```json
{
  "message": "Authority registered successfully",
  "user_id": "uuid-string",
  "badge_number": "BADGE-12345",
  "department": "Paris Police Department"
}
```

**Errors:**
- `400 Bad Request` - Validation error or user exists

---

### 2.2 Login Authority

**POST** `/api/auth/login-authority`

Login police authority account.

**Request Body:**
```json
{
  "email": "officer@police.gov",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": "uuid-string",
  "email": "officer@police.gov",
  "role": "authority"
}
```

---

### 2.3 Get Active Tourists

**GET** `/api/tourists/active`

Get list of tourists active in the last 24 hours.

**Authentication:** Required (Authority role)

**Response (200 OK):**
```json
[
  {
    "id": "uuid-string",
    "name": "John Doe",
    "email": "tourist@example.com",
    "safety_score": 85,
    "last_location": {
      "lat": 48.8584,
      "lon": 2.2945
    },
    "last_seen": "2025-01-12T10:45:00.000Z"
  }
]
```

---

### 2.4 Track Tourist

**GET** `/api/tourist/{tourist_id}/track`

Get detailed real-time tracking for a specific tourist.

**Authentication:** Required (Authority role)

**Path Parameters:**
- `tourist_id` - Tourist UUID

**Response (200 OK):**
```json
{
  "tourist": {
    "id": "uuid-string",
    "name": "John Doe",
    "email": "tourist@example.com",
    "phone": "+1234567890",
    "safety_score": 85,
    "last_seen": "2025-01-12T10:45:00.000Z"
  },
  "locations": [
    {
      "id": 456,
      "lat": 48.8584,
      "lon": 2.2945,
      "speed": 1.5,
      "altitude": 35.0,
      "timestamp": "2025-01-12T10:45:00.000Z"
    }
  ],
  "recent_alerts": [
    {
      "id": 789,
      "type": "anomaly",
      "severity": "high",
      "title": "Safety Alert",
      "description": "Safety score dropped",
      "is_acknowledged": false,
      "created_at": "2025-01-12T10:40:00.000Z"
    }
  ]
}
```

---

### 2.5 Get Tourist Alerts

**GET** `/api/tourist/{tourist_id}/alerts`

Get all alerts for a specific tourist.

**Authentication:** Required (Authority role)

**Path Parameters:**
- `tourist_id` - Tourist UUID

**Response (200 OK):**
```json
[
  {
    "id": 789,
    "type": "anomaly",
    "severity": "high",
    "title": "Safety Alert",
    "description": "Safety score dropped",
    "is_acknowledged": true,
    "acknowledged_by": "authority-uuid",
    "acknowledged_at": "2025-01-12T10:50:00.000Z",
    "is_resolved": false,
    "resolved_at": null,
    "created_at": "2025-01-12T10:40:00.000Z"
  }
]
```

---

### 2.6 Get Tourist Profile

**GET** `/api/tourist/{tourist_id}/profile`

Get complete tourist profile with statistics.

**Authentication:** Required (Authority role)

**Path Parameters:**
- `tourist_id` - Tourist UUID

**Response (200 OK):**
```json
{
  "tourist": {
    "id": "uuid-string",
    "email": "tourist@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "emergency_contact": "Jane Doe",
    "emergency_phone": "+0987654321",
    "safety_score": 85,
    "is_active": true,
    "last_location": {
      "lat": 48.8584,
      "lon": 2.2945
    },
    "last_seen": "2025-01-12T10:45:00.000Z",
    "created_at": "2025-01-01T00:00:00.000Z",
    "member_since_days": 11
  },
  "current_trip": {
    "id": 123,
    "destination": "Paris, France",
    "start_date": "2025-01-12T10:30:00.000Z",
    "itinerary": "Eiffel Tower, Louvre",
    "duration_hours": 0.25
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

### 2.7 Get Tourist Current Location

**GET** `/api/tourist/{tourist_id}/location/current`

Get tourist's most recent real-time location.

**Authentication:** Required (Authority role)

**Path Parameters:**
- `tourist_id` - Tourist UUID

**Response (200 OK):**
```json
{
  "tourist_id": "uuid-string",
  "tourist_name": "John Doe",
  "safety_score": 85,
  "location": {
    "id": 456,
    "latitude": 48.8584,
    "longitude": 2.2945,
    "altitude": 35.0,
    "speed": 1.5,
    "accuracy": 10.0,
    "timestamp": "2025-01-12T10:45:00.000Z",
    "minutes_ago": 2,
    "is_recent": true,
    "status": "live"
  },
  "zone_status": {
    "inside_restricted": false,
    "risk_level": "safe",
    "zones": []
  },
  "last_seen": "2025-01-12T10:45:00.000Z"
}
```

---

### 2.8 Get Tourist Location History

**GET** `/api/tourist/{tourist_id}/location/history?hours_back=24&limit=100&include_trip_info=false`

Get tourist's location history with filtering.

**Authentication:** Required (Authority role)

**Path Parameters:**
- `tourist_id` - Tourist UUID

**Query Parameters:**
- `hours_back` (optional, default: 24) - Hours of history to retrieve
- `limit` (optional, default: 100) - Maximum locations to return
- `include_trip_info` (optional, default: false) - Include trip details

**Response (200 OK):**
```json
{
  "tourist_id": "uuid-string",
  "tourist_name": "John Doe",
  "filter": {
    "hours_back": 24,
    "limit": 100,
    "time_from": "2025-01-11T10:45:00.000Z",
    "time_to": "2025-01-12T10:45:00.000Z"
  },
  "locations": [
    {
      "id": 456,
      "latitude": 48.8584,
      "longitude": 2.2945,
      "altitude": 35.0,
      "speed": 1.5,
      "accuracy": 10.0,
      "timestamp": "2025-01-12T10:45:00.000Z"
    }
  ],
  "statistics": {
    "total_points": 48,
    "distance_traveled_meters": 12543.75,
    "distance_traveled_km": 12.54,
    "time_span_hours": 24
  }
}
```

---

### 2.9 Get Movement Analysis

**GET** `/api/tourist/{tourist_id}/movement-analysis`

Get detailed movement pattern analysis for a tourist.

**Authentication:** Required (Authority role)

**Path Parameters:**
- `tourist_id` - Tourist UUID

**Response (200 OK):**
```json
{
  "tourist_id": "uuid-string",
  "analysis": {
    "pattern": "normal",
    "anomalies_detected": 0,
    "average_speed": 1.8,
    "total_distance_km": 12.54
  }
}
```

---

### 2.10 Get Safety Timeline

**GET** `/api/tourist/{tourist_id}/safety-timeline`

Get safety score timeline for a tourist.

**Authentication:** Required (Authority role)

**Path Parameters:**
- `tourist_id` - Tourist UUID

**Response (200 OK):**
```json
{
  "tourist_id": "uuid-string",
  "timeline": [
    {
      "timestamp": "2025-01-12T10:00:00.000Z",
      "safety_score": 85,
      "risk_level": "low"
    }
  ]
}
```

---

### 2.11 Get Emergency Contacts

**GET** `/api/tourist/{tourist_id}/emergency-contacts`

Get tourist's emergency contact information.

**Authentication:** Required (Authority role)

**Path Parameters:**
- `tourist_id` - Tourist UUID

**Response (200 OK):**
```json
{
  "tourist_id": "uuid-string",
  "emergency_contacts": [
    {
      "name": "Jane Doe",
      "phone": "+0987654321",
      "relationship": "Family"
    }
  ]
}
```

---

### 2.12 Get Recent Alerts

**GET** `/api/alerts/recent`

Get recent alerts across all tourists.

**Authentication:** Required (Authority role)

**Response (200 OK):**
```json
[
  {
    "id": 789,
    "tourist_id": "uuid-string",
    "tourist_name": "John Doe",
    "type": "anomaly",
    "severity": "high",
    "title": "Safety Alert",
    "description": "Safety score dropped",
    "is_acknowledged": false,
    "created_at": "2025-01-12T10:40:00.000Z"
  }
]
```

---

### 2.13 Acknowledge Incident

**POST** `/api/incident/acknowledge`

Acknowledge an alert as incident being handled.

**Authentication:** Required (Authority role)

**Request Body:**
```json
{
  "alert_id": 789,
  "notes": "Officer dispatched to location"
}
```

**Response (200 OK):**
```json
{
  "status": "incident_acknowledged",
  "incident_id": 101,
  "alert_id": 789,
  "acknowledged_by": "authority-uuid",
  "acknowledged_at": "2025-01-12T10:50:00.000Z"
}
```

---

### 2.14 Close Incident

**POST** `/api/incident/close`

Close and resolve an incident.

**Authentication:** Required (Authority role)

**Request Body:**
```json
{
  "alert_id": 789,
  "notes": "Situation resolved, tourist safe"
}
```

**Response (200 OK):**
```json
{
  "status": "incident_closed",
  "incident_id": 101,
  "alert_id": 789,
  "closed_at": "2025-01-12T11:00:00.000Z"
}
```

---

### 2.15 Generate E-FIR (Authority)

**POST** `/api/efir/generate`

Generate E-FIR for authority-initiated incident report.

**Authentication:** Required (Authority role)

**Request Body:**
```json
{
  "alert_id": 789,
  "incident_description": "Tourist reported theft",
  "tourist_id": "uuid-string",
  "incident_type": "theft",
  "location": "48.8584, 2.2945",
  "witnesses": ["Witness Name"],
  "additional_details": "Additional investigation notes"
}
```

**Response (200 OK):**
```json
{
  "message": "E-FIR generated successfully",
  "fir_number": "EFIR-AUTH-2025-01-12345",
  "blockchain_tx_id": "a1b2c3d4e5f6...",
  "timestamp": "2025-01-12T11:00:00.000Z",
  "verification_url": "/api/blockchain/verify/a1b2c3d4e5f6"
}
```

---

### 2.16 Manage Zones

**GET** `/api/zones/manage`

Get all zones for management (authority view).

**Authentication:** Required (Authority role)

**Response (200 OK):**
```json
{
  "zones": [
    {
      "id": 1,
      "name": "Safe Zone Downtown",
      "type": "safe",
      "description": "Well-lit tourist area",
      "coordinates": [[2.2945, 48.8584]],
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 2.17 Create Zone

**POST** `/api/zones/create`

Create a new safety zone.

**Authentication:** Required (Authority role)

**Request Body:**
```json
{
  "name": "New Safe Zone",
  "description": "Tourist-friendly area",
  "zone_type": "safe",
  "coordinates": [[2.2945, 48.8584], [2.2955, 48.8594]]
}
```

**Response (200 OK):**
```json
{
  "zone_id": 2,
  "name": "New Safe Zone",
  "type": "safe",
  "status": "created",
  "created_at": "2025-01-12T11:10:00.000Z"
}
```

**Zone Types:**
- `safe` - Safe tourist area
- `risky` - Caution advised
- `restricted` - Avoid/prohibited area

---

### 2.18 Delete Zone

**DELETE** `/api/zones/{zone_id}`

Delete a safety zone.

**Authentication:** Required (Authority role)

**Path Parameters:**
- `zone_id` - Zone ID

**Response (200 OK):**
```json
{
  "status": "zone_deleted",
  "zone_id": 2,
  "deleted_at": "2025-01-12T11:15:00.000Z"
}
```

---

### 2.19 Get Heatmap Data

**GET** `/api/heatmap/data`

Get comprehensive heatmap data (locations, alerts, zones).

**Authentication:** Required (Authority role)

**Response (200 OK):**
```json
{
  "locations": [
    {
      "lat": 48.8584,
      "lon": 2.2945,
      "intensity": 0.8
    }
  ],
  "alerts": [
    {
      "lat": 48.8585,
      "lon": 2.2946,
      "severity": "high"
    }
  ],
  "zones": [
    {
      "id": 1,
      "type": "safe",
      "coordinates": [[2.2945, 48.8584]]
    }
  ]
}
```

---

### 2.20 Get Zone Heatmap

**GET** `/api/heatmap/zones`

Get zone-specific heatmap visualization data.

**Authentication:** Required (Authority role)

**Response (200 OK):**
```json
{
  "zones": [
    {
      "id": 1,
      "name": "Safe Zone",
      "type": "safe",
      "coordinates": [[2.2945, 48.8584]],
      "intensity": 0.9
    }
  ]
}
```

---

### 2.21 Get Alert Heatmap

**GET** `/api/heatmap/alerts`

Get alert density heatmap data.

**Authentication:** Required (Authority role)

**Response (200 OK):**
```json
{
  "alerts": [
    {
      "lat": 48.8584,
      "lon": 2.2945,
      "severity": "high",
      "count": 5,
      "intensity": 0.85
    }
  ]
}
```

---

### 2.22 Get Tourist Heatmap

**GET** `/api/heatmap/tourists`

Get tourist location density heatmap.

**Authentication:** Required (Authority role)

**Response (200 OK):**
```json
{
  "tourists": [
    {
      "lat": 48.8584,
      "lon": 2.2945,
      "count": 12,
      "density": 0.75
    }
  ]
}
```

---

## 3. AI/ML Endpoints

### 3.1 Check Geofence

**POST** `/api/ai/geofence/check`

Check if coordinates are within restricted zones.

**Authentication:** Required

**Request Body:**
```json
{
  "lat": 48.8584,
  "lon": 2.2945
}
```

**Response (200 OK):**
```json
{
  "inside_restricted": false,
  "risk_level": "safe",
  "zones": [],
  "checked_at": "2025-01-12T11:20:00.000Z"
}
```

---

### 3.2 Get Nearby Zones (AI)

**POST** `/api/ai/geofence/nearby?radius=1000`

Get zones within specified radius.

**Authentication:** Required

**Request Body:**
```json
{
  "lat": 48.8584,
  "lon": 2.2945
}
```

**Query Parameters:**
- `radius` (optional, default: 1000) - Radius in meters

**Response (200 OK):**
```json
{
  "nearby_zones": [
    {
      "id": 1,
      "name": "Safe Zone",
      "type": "safe",
      "distance_meters": 150
    }
  ],
  "radius_meters": 1000,
  "center": {"lat": 48.8584, "lon": 2.2945}
}
```

---

### 3.3 Detect Point Anomaly

**POST** `/api/ai/anomaly/point`

Detect anomaly in single GPS point using Isolation Forest.

**Authentication:** Required

**Request Body:**
```json
{
  "lat": 48.8584,
  "lon": 2.2945,
  "speed": 1.5,
  "timestamp": "2025-01-12T11:20:00.000Z"
}
```

**Response (200 OK):**
```json
{
  "anomaly_score": 0.15,
  "risk_level": "low",
  "location": {"lat": 48.8584, "lon": 2.2945},
  "timestamp": "2025-01-12T11:20:00.000Z"
}
```

**Anomaly Score:**
- `0.0 - 0.4` = low risk
- `0.4 - 0.7` = medium risk
- `0.7 - 1.0` = high risk

---

### 3.4 Detect Sequence Anomaly

**POST** `/api/ai/anomaly/sequence`

Detect anomaly in GPS sequence using LSTM/GRU Autoencoder.

**Authentication:** Required

**Request Body:**
```json
{
  "points": [
    {
      "lat": 48.8584,
      "lon": 2.2945,
      "speed": 1.5,
      "timestamp": "2025-01-12T11:00:00.000Z"
    },
    {
      "lat": 48.8594,
      "lon": 2.2955,
      "speed": 1.8,
      "timestamp": "2025-01-12T11:05:00.000Z"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "sequence_anomaly_score": 0.25,
  "risk_level": "low",
  "sequence_length": 2,
  "timestamp": "2025-01-12T11:20:00.000Z"
}
```

---

### 3.5 Compute Safety Score

**POST** `/api/ai/score/compute`

Compute comprehensive safety score using all AI models.

**Authentication:** Required

**Request Body:**
```json
{
  "lat": 48.8584,
  "lon": 2.2945,
  "location_history": [
    {
      "latitude": 48.8584,
      "longitude": 2.2945,
      "speed": 1.5,
      "timestamp": "2025-01-12T11:00:00.000Z"
    }
  ],
  "current_location_data": {
    "latitude": 48.8584,
    "longitude": 2.2945,
    "timestamp": "2025-01-12T11:20:00.000Z"
  },
  "manual_adjustment": 0
}
```

**Response (200 OK):**
```json
{
  "safety_score": 85,
  "risk_level": "low",
  "components": {
    "geofence": "evaluated",
    "anomaly": "evaluated",
    "sequence": "evaluated",
    "manual_adjustment": 0
  },
  "location": {"lat": 48.8584, "lon": 2.2945},
  "timestamp": "2025-01-12T11:20:00.000Z"
}
```

---

### 3.6 Classify Alert Severity

**POST** `/api/ai/classify/alert`

Classify alert severity using rule-based classifier.

**Authentication:** Required

**Request Body:**
```json
{
  "safety_score": 35,
  "alert_type": "anomaly",
  "location_data": {
    "lat": 48.8584,
    "lon": 2.2945
  },
  "context": {
    "time_of_day": "night",
    "tourist_history": "new_user"
  }
}
```

**Response (200 OK):**
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
    "Low safety score (35) indicates high risk",
    "Classification: high"
  ],
  "features_used": {
    "safety_score": 35,
    "alert_type": "anomaly",
    "has_location": true,
    "context": {"time_of_day": "night"}
  },
  "timestamp": "2025-01-12T11:20:00.000Z"
}
```

---

### 3.7 Get AI Models Status

**GET** `/api/ai/models/status`

Get status and health of all AI models.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "models": {
    "isolation_forest": {
      "status": "loaded",
      "last_trained": "2025-01-10T00:00:00.000Z",
      "version": "1.0"
    },
    "lstm_autoencoder": {
      "status": "loaded",
      "last_trained": "2025-01-10T00:00:00.000Z",
      "version": "1.0"
    },
    "geofence_engine": {
      "status": "active"
    },
    "rule_classifier": {
      "status": "active"
    }
  },
  "overall_status": "healthy",
  "checked_at": "2025-01-12T11:20:00.000Z"
}
```

---

## 4. Admin Endpoints

### 4.1 Get System Status

**GET** `/api/system/status`

Get comprehensive system health and statistics.

**Authentication:** Required (Admin role)

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2025-01-12T11:20:00.000Z",
  "database": {
    "status": "connected",
    "tourists_total": 1543,
    "authorities_total": 87,
    "active_tourists_24h": 234,
    "recent_alerts_24h": 12
  },
  "websockets": {
    "active_connections": 45,
    "channels": {
      "authority": 12,
      "tourist": 33
    }
  },
  "services": {
    "redis": "connected",
    "ai_models": "loaded"
  }
}
```

---

### 4.2 Retrain AI Models

**POST** `/api/system/retrain-model`

Trigger AI model retraining in background.

**Authentication:** Required (Admin role)

**Request Body:**
```json
{
  "model_types": ["anomaly", "sequence"],
  "days_back": 30
}
```

**Response (200 OK):**
```json
{
  "status": "retrain_started",
  "model_types": ["anomaly", "sequence"],
  "days_back": 30,
  "started_at": "2025-01-12T11:20:00.000Z",
  "started_by": "admin-uuid"
}
```

**Model Types:**
- `anomaly` - Isolation Forest model
- `sequence` - LSTM/GRU Autoencoder model

---

### 4.3 List Users

**GET** `/api/users/list?user_type=tourist&limit=100`

Get list of all users (tourists/authorities).

**Authentication:** Required (Admin role)

**Query Parameters:**
- `user_type` (optional) - Filter by "tourist" or "authority"
- `limit` (optional, default: 100) - Maximum users to return

**Response (200 OK):**
```json
{
  "users": [
    {
      "id": "uuid-string",
      "type": "tourist",
      "email": "tourist@example.com",
      "name": "John Doe",
      "phone": "+1234567890",
      "safety_score": 85,
      "is_active": true,
      "last_seen": "2025-01-12T10:45:00.000Z",
      "created_at": "2025-01-01T00:00:00.000Z"
    },
    {
      "id": "uuid-string",
      "type": "authority",
      "email": "officer@police.gov",
      "name": "Officer Smith",
      "badge_number": "BADGE-12345",
      "department": "Paris Police",
      "rank": "Inspector",
      "is_active": true,
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ],
  "total": 2,
  "filter": "all"
}
```

---

### 4.4 Suspend User

**PUT** `/api/users/{user_id}/suspend`

Suspend a user account (tourist or authority).

**Authentication:** Required (Admin role)

**Path Parameters:**
- `user_id` - User UUID

**Request Body:**
```json
{
  "reason": "Violation of terms of service"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid-string",
  "type": "tourist",
  "status": "suspended",
  "reason": "Violation of terms of service",
  "suspended_by": "admin-uuid",
  "suspended_at": "2025-01-12T11:25:00.000Z"
}
```

---

### 4.5 Activate User

**PUT** `/api/users/{user_id}/activate`

Reactivate a suspended user account.

**Authentication:** Required (Admin role)

**Path Parameters:**
- `user_id` - User UUID

**Response (200 OK):**
```json
{
  "id": "uuid-string",
  "type": "tourist",
  "status": "activated"
}
```

---

### 4.6 Get Analytics Dashboard

**GET** `/api/analytics/dashboard?days=7`

Get analytics dashboard data.

**Authentication:** Required (Admin role)

**Query Parameters:**
- `days` (optional, default: 7) - Number of days to analyze

**Response (200 OK):**
```json
{
  "period_days": 7,
  "summary": {
    "total_tourists": 1543,
    "active_tourists": 234,
    "total_trips": 876,
    "total_alerts": 45,
    "critical_alerts": 3
  },
  "trends": {
    "new_registrations": 67,
    "safety_score_avg": 78.5,
    "alert_resolution_rate": 0.92
  }
}
```

---

## 5. Notification Endpoints

### 5.1 Send Push Notification

**POST** `/api/notify/push`

Send push notification to specific user or device.

**Authentication:** Required

**Request Body:**
```json
{
  "user_id": "uuid-string",
  "title": "Safety Alert",
  "body": "Please check your location",
  "token": "fcm-device-token",
  "data": {
    "type": "alert",
    "priority": "high"
  }
}
```

**Response (200 OK):**
```json
{
  "status": "push_sent",
  "user_id": "uuid-string",
  "timestamp": "2025-01-12T11:30:00.000Z"
}
```

**Errors:**
- `400 Bad Request` - Device token required
- `500 Internal Server Error` - Push failed

---

### 5.2 Send SMS

**POST** `/api/notify/sms`

Send SMS notification.

**Authentication:** Required

**Request Body:**
```json
{
  "to_number": "+1234567890",
  "body": "Safety Alert: Please check your location immediately."
}
```

**Response (200 OK):**
```json
{
  "status": "sms_sent",
  "to": "+1234567890",
  "timestamp": "2025-01-12T11:30:00.000Z"
}
```

---

### 5.3 Send Emergency Alert

**POST** `/api/notify/emergency`

Send emergency notification to tourist and contacts.

**Authentication:** Required (Authority role)

**Request Body:**
```json
{
  "tourist_id": "uuid-string",
  "alert_type": "sos",
  "location": {
    "lat": 48.8584,
    "lon": 2.2945
  },
  "message": "Emergency situation detected"
}
```

**Response (200 OK):**
```json
{
  "status": "emergency_sent",
  "tourist_id": "uuid-string",
  "results": {
    "push_notifications": 2,
    "sms_alerts": 1,
    "email_alerts": 2
  },
  "timestamp": "2025-01-12T11:30:00.000Z"
}
```

---

### 5.4 Broadcast Notification

**POST** `/api/notify/broadcast`

Broadcast notification to multiple users.

**Authentication:** Required (Authority role)

**Request Body:**
```json
{
  "title": "Security Update",
  "body": "New safe zones have been established",
  "target_group": "tourists",
  "data": {
    "type": "info",
    "priority": "normal"
  }
}
```

**Response (200 OK):**
```json
{
  "status": "broadcast_completed",
  "target_group": "tourists",
  "total_recipients": 234,
  "successful": 230,
  "failed": 4,
  "title": "Security Update",
  "message": "New safe zones have been established",
  "timestamp": "2025-01-12T11:30:00.000Z"
}
```

**Target Groups:**
- `all` - All users (tourists + authorities)
- `tourists` - Only tourists
- `authorities` - Only authorities

---

### 5.5 Get Notification History

**GET** `/api/notify/history?hours=24`

Get notification history based on alerts.

**Authentication:** Required

**Query Parameters:**
- `hours` (optional, default: 24) - Hours of history to retrieve

**Response (200 OK):**
```json
{
  "notifications": [
    {
      "id": "notif-789",
      "alert_id": 789,
      "type": "alert_notification",
      "title": "Safety Alert",
      "body": "Safety score dropped",
      "severity": "high",
      "alert_type": "anomaly",
      "tourist_id": "uuid-string",
      "created_at": "2025-01-12T10:40:00.000Z",
      "acknowledged": true
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

### 5.6 Get Notification Settings

**GET** `/api/notify/settings`

Get notification preferences for current user.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "user_id": "uuid-string",
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

### 5.7 Update Notification Settings

**PUT** `/api/notify/settings`

Update notification preferences.

**Authentication:** Required

**Request Body:**
```json
{
  "push_enabled": true,
  "sms_enabled": false,
  "notification_types": {
    "safety_alerts": true,
    "geofence_warnings": true,
    "system_updates": false
  },
  "quiet_hours": {
    "enabled": true,
    "start": "22:00",
    "end": "07:00"
  }
}
```

**Response (200 OK):**
```json
{
  "status": "settings_updated",
  "user_id": "uuid-string",
  "updated_settings": {
    "push_enabled": true,
    "sms_enabled": false,
    "notification_types": {
      "safety_alerts": true,
      "geofence_warnings": true,
      "system_updates": false
    },
    "quiet_hours": {
      "enabled": true,
      "start": "22:00",
      "end": "07:00"
    }
  },
  "timestamp": "2025-01-12T11:35:00.000Z"
}
```

---

## Authentication & Authorization

### JWT Token Format

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Payload

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "tourist",
  "exp": 1736681400
}
```

### Roles

- **tourist** - Tourist mobile app users
- **authority** - Police dashboard users
- **admin** - System administrators

### Role Access Matrix

| Endpoint Category | Tourist | Authority | Admin |
|-------------------|---------|-----------|-------|
| Tourist Auth      | ✅      | ❌        | ✅    |
| Authority Auth    | ❌      | ✅        | ✅    |
| Tourist Endpoints | ✅      | ❌        | ✅    |
| Authority Endpoints| ❌     | ✅        | ✅    |
| AI Endpoints      | ✅      | ✅        | ✅    |
| Admin Endpoints   | ❌      | ❌        | ✅    |
| Notifications     | ✅      | ✅        | ✅    |

---

## Error Handling

### Standard Error Response

```json
{
  "detail": "Error message description"
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200  | OK | Request successful |
| 201  | Created | Resource created successfully |
| 400  | Bad Request | Invalid request data |
| 401  | Unauthorized | Authentication required or invalid |
| 403  | Forbidden | Insufficient permissions |
| 404  | Not Found | Resource not found |
| 422  | Unprocessable Entity | Validation error |
| 500  | Internal Server Error | Server-side error |

### Common Error Examples

**401 Unauthorized:**
```json
{
  "detail": "Invalid credentials"
}
```

**404 Not Found:**
```json
{
  "detail": "Tourist not found"
}
```

**400 Bad Request:**
```json
{
  "detail": "Validation error: Invalid coordinates"
}
```

**500 Internal Server Error:**
```json
{
  "detail": "Failed to generate E-FIR: Connection timeout"
}
```

---

## Rate Limiting

**Default Limits:**
- 100 requests per minute per user
- 1000 requests per hour per IP

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1736681400
```

---

## WebSocket Endpoints

### Authority Alert Channel

**WS** `/api/alerts/subscribe`

Real-time alert stream for police dashboard.

**Authentication:** Required (Authority role)

**Connection:**
```javascript
ws://your-domain.com/api/alerts/subscribe?token=jwt-token
```

**Message Format:**
```json
{
  "type": "sos_alert",
  "alert_id": 789,
  "tourist_id": "uuid-string",
  "tourist_name": "John Doe",
  "severity": "critical",
  "location": {
    "lat": 48.8584,
    "lon": 2.2945
  },
  "timestamp": "2025-01-12T11:40:00.000Z"
}
```

**Alert Types:**
- `sos_alert` - Emergency SOS triggered
- `safety_alert` - Safety score dropped
- `geofence_alert` - Entered restricted zone
- `efir_generated` - E-FIR created

---

## Changelog

### Version 1.0.0 (2025-01-12)
- ✅ Initial production release
- ✅ 57 endpoints implemented
- ✅ JWT authentication system
- ✅ AI/ML integration (Isolation Forest, LSTM Autoencoder)
- ✅ Blockchain E-FIR generation
- ✅ Real-time WebSocket alerts
- ✅ Firebase Push + Twilio SMS notifications
- ✅ PostgreSQL + PostGIS database
- ✅ Role-based access control (Tourist, Authority, Admin)

---

## Support

**Documentation:** https://docs.safehorizon.com  
**API Status:** https://status.safehorizon.com  
**Support Email:** support@safehorizon.com

---

**© 2025 SafeHorizon - Tourist Safety Platform**
