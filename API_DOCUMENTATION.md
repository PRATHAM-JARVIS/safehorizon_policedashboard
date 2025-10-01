# 🚀 SafeHorizon API Documentation

**Complete API Reference for SafeHorizon Tourist Safety Platform**

## 📊 Overview

SafeHorizon provides a comprehensive REST API with real-time WebSocket capabilities for tourist safety management. The API serves three main user types: **Tourists**, **Authorities (Police)**, and **System Administrators**.

### Base URL
```
Production: https://api.safehorizon.com
Development: http://localhost:8000
```

### API Prefix
All endpoints are prefixed with `/api`

### Authentication
- **Type**: Bearer Token (JWT)
- **Header**: `Authorization: Bearer <token>`
- **Roles**: `tourist`, `authority`, `admin`

---

## 🧑‍💼 TOURIST ENDPOINTS

### Authentication

#### `POST /api/auth/register`
Register a new tourist account.

**Request Body:**
```json
{
  "email": "tourist@example.com",
  "password": "secure_password",
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
  "user_id": "user_abc123",
  "email": "tourist@example.com"
}
```

#### `POST /api/auth/login`
Login as tourist.

**Request Body:**
```json
{
  "email": "tourist@example.com",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user_id": "user_abc123",
  "email": "tourist@example.com",
  "role": "tourist"
}
```

#### `GET /api/auth/me`
Get current user profile information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "user_abc123",
  "email": "tourist@example.com",
  "name": "John Doe",
  "phone": "+1234567890",
  "safety_score": 85,
  "last_seen": "2025-10-01T12:00:00Z"
}
```

### Trip Management

#### `POST /api/trip/start`
Start a new tracking trip.

**Headers:** `Authorization: Bearer <token>`

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
  "start_date": "2025-10-01T12:00:00Z"
}
```

#### `POST /api/trip/end`
End the current active trip.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "trip_id": 123,
  "status": "completed",
  "end_date": "2025-10-01T18:00:00Z"
}
```

#### `GET /api/trip/history`
Get user's trip history.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": 123,
    "destination": "Paris, France",
    "status": "completed",
    "start_date": "2025-10-01T12:00:00Z",
    "end_date": "2025-10-01T18:00:00Z",
    "created_at": "2025-10-01T11:55:00Z"
  }
]
```

### Location & Safety

#### `POST /api/location/update`
Update current location with AI safety analysis.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "lat": 48.8566,
  "lon": 2.3522,
  "speed": 5.2,
  "altitude": 35.0,
  "accuracy": 10.0,
  "timestamp": "2025-10-01T12:30:00Z"
}
```

**Response:**
```json
{
  "status": "location_updated",
  "location_id": 456,
  "safety_score": 78,
  "risk_level": "low",
  "lat": 48.8566,
  "lon": 2.3522,
  "timestamp": "2025-10-01T12:30:00Z"
}
```

#### `GET /api/location/history`
Get location history.

**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
- `limit` (optional): Number of records (default: 100)

**Response:**
```json
[
  {
    "id": 456,
    "lat": 48.8566,
    "lon": 2.3522,
    "speed": 5.2,
    "altitude": 35.0,
    "accuracy": 10.0,
    "timestamp": "2025-10-01T12:30:00Z"
  }
]
```

#### `GET /api/safety/score`
Get current AI safety score.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "safety_score": 78,
  "risk_level": "low",
  "last_updated": "2025-10-01T12:30:00Z"
}
```

### Emergency Services

#### `POST /api/sos/trigger`
Trigger SOS emergency alert.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "status": "sos_triggered",
  "alert_id": 789,
  "notifications_sent": {
    "push": true,
    "sms": true,
    "emergency_contacts": 1
  },
  "timestamp": "2025-10-01T12:35:00Z"
}
```

### Zone Information

#### `GET /api/zones/list`
Get all safety zones.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Tourist District",
    "type": "safe",
    "center": {"lat": 48.8566, "lon": 2.3522},
    "radius_meters": 1000,
    "description": "Well-patrolled tourist area"
  }
]
```

#### `GET /api/zones/nearby`
Get zones near current location.

**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
- `lat`: Latitude
- `lon`: Longitude  
- `radius`: Search radius in meters (default: 5000)

**Response:**
```json
{
  "nearby_zones": [
    {
      "id": 1,
      "name": "Tourist District",
      "type": "safe",
      "distance_meters": 250.5
    }
  ],
  "center": {"lat": 48.8566, "lon": 2.3522},
  "radius_meters": 5000,
  "total": 1
}
```

#### `GET /api/heatmap/zones/public`
Get public zone heatmap data for mobile app.

**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
- `bounds_north`, `bounds_south`, `bounds_east`, `bounds_west`: Map bounds
- `zone_type`: Filter by zone type (safe/risky/restricted/all)

**Response:**
```json
{
  "zones": [
    {
      "id": 1,
      "name": "Tourist District",
      "type": "safe",
      "center": {"lat": 48.8566, "lon": 2.3522},
      "radius_meters": 1000,
      "safety_recommendation": "Safe area - normal precautions apply"
    }
  ],
  "total": 1,
  "generated_at": "2025-10-01T12:40:00Z"
}
```

### Debug & Development

#### `GET /api/debug/role`
Debug user role and permissions.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user_id": "user_abc123",
  "email": "tourist@example.com",
  "role": "tourist",
  "is_tourist": true,
  "is_authority": false,
  "is_admin": false
}
```

---

## 👮‍♂️ AUTHORITY (POLICE) ENDPOINTS

### Authentication

#### `POST /api/auth/register-authority`
Register a new police authority account.

**Request Body:**
```json
{
  "email": "officer@police.gov",
  "password": "secure_password",
  "name": "Officer Smith",
  "badge_number": "P12345",
  "department": "Central Police",
  "rank": "Inspector"
}
```

**Response:**
```json
{
  "message": "Authority registered successfully",
  "user_id": "auth_xyz789",
  "badge_number": "P12345",
  "department": "Central Police"
}
```

#### `POST /api/auth/login-authority`
Login as police authority.

**Request Body:**
```json
{
  "email": "officer@police.gov",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user_id": "auth_xyz789",
  "email": "officer@police.gov",
  "role": "authority"
}
```

### Tourist Monitoring

#### `GET /api/tourists/active`
Get list of active tourists (last 24 hours).

**Headers:** `Authorization: Bearer <token>` (Authority role required)

**Response:**
```json
[
  {
    "id": "user_abc123",
    "name": "John Doe",
    "email": "tourist@example.com",
    "safety_score": 78,
    "last_location": {"lat": 48.8566, "lon": 2.3522},
    "last_seen": "2025-10-01T12:30:00Z"
  }
]
```

#### `GET /api/tourist/{tourist_id}/track`
Get detailed tracking for specific tourist.

**Headers:** `Authorization: Bearer <token>` (Authority role required)
**Path Parameters:**
- `tourist_id`: Tourist user ID

**Response:**
```json
{
  "tourist": {
    "id": "user_abc123",
    "name": "John Doe",
    "email": "tourist@example.com",
    "phone": "+1234567890",
    "safety_score": 78,
    "last_seen": "2025-10-01T12:30:00Z"
  },
  "locations": [
    {
      "id": 456,
      "lat": 48.8566,
      "lon": 2.3522,
      "speed": 5.2,
      "timestamp": "2025-10-01T12:30:00Z"
    }
  ],
  "recent_alerts": [
    {
      "id": 789,
      "type": "anomaly",
      "severity": "medium",
      "title": "Unusual movement detected",
      "is_acknowledged": false,
      "created_at": "2025-10-01T12:25:00Z"
    }
  ]
}
```

#### `GET /api/tourist/{tourist_id}/alerts`
Get all alerts for specific tourist.

**Headers:** `Authorization: Bearer <token>` (Authority role required)

**Response:**
```json
[
  {
    "id": 789,
    "type": "anomaly",
    "severity": "medium",
    "title": "Unusual movement detected",
    "description": "Tourist movement pattern deviates from normal",
    "is_acknowledged": false,
    "is_resolved": false,
    "created_at": "2025-10-01T12:25:00Z"
  }
]
```

### Alert Management

#### `GET /api/alerts/recent`
Get recent alerts across all tourists.

**Headers:** `Authorization: Bearer <token>` (Authority role required)
**Query Parameters:**
- `hours`: Hours back to search (default: 24)

**Response:**
```json
[
  {
    "id": 789,
    "tourist": {
      "id": "user_abc123",
      "name": "John Doe",
      "email": "tourist@example.com"
    },
    "type": "sos",
    "severity": "critical",
    "title": "🚨 SOS Emergency Alert",
    "description": "Emergency SOS triggered by John Doe",
    "is_acknowledged": false,
    "is_resolved": false,
    "created_at": "2025-10-01T12:35:00Z"
  }
]
```

#### `WS /api/alerts/subscribe`
Subscribe to real-time alerts via WebSocket.

**Headers:** `Authorization: Bearer <token>` (Authority role required)
**Query Parameters:**
- `token`: JWT token for authentication

**WebSocket Messages:**
```json
{
  "type": "sos_alert",
  "alert_id": 789,
  "tourist_id": "user_abc123",
  "tourist_name": "John Doe",
  "severity": "critical",
  "location": {"lat": 48.8566, "lon": 2.3522},
  "timestamp": "2025-10-01T12:35:00Z"
}
```

### Incident Management

#### `POST /api/incident/acknowledge`
Acknowledge an incident/alert.

**Headers:** `Authorization: Bearer <token>` (Authority role required)

**Request Body:**
```json
{
  "alert_id": 789,
  "notes": "Responding to SOS alert"
}
```

**Response:**
```json
{
  "status": "acknowledged",
  "alert_id": 789,
  "incident_number": "INC-20251001-000789",
  "acknowledged_by": "auth_xyz789",
  "acknowledged_at": "2025-10-01T12:40:00Z"
}
```

#### `POST /api/incident/close`
Close an incident.

**Headers:** `Authorization: Bearer <token>` (Authority role required)

**Request Body:**
```json
{
  "alert_id": 789,
  "notes": "Tourist found safe, false alarm"
}
```

**Response:**
```json
{
  "status": "closed",
  "incident_number": "INC-20251001-000789",
  "closed_at": "2025-10-01T12:45:00Z"
}
```

#### `POST /api/efir/generate`
Generate E-FIR (Electronic First Information Report) on blockchain.

**Headers:** `Authorization: Bearer <token>` (Authority role required)

**Request Body:**
```json
{
  "alert_id": 789,
  "notes": "Incident resolved, generating E-FIR for records"
}
```

**Response:**
```json
{
  "status": "efir_generated",
  "incident_number": "INC-20251001-000789",
  "blockchain_tx": "0x1234567890abcdef",
  "efir_data": {
    "incident_number": "INC-20251001-000789",
    "alert_type": "sos",
    "severity": "critical",
    "tourist_id": "user_abc123",
    "timestamp": "2025-10-01T12:45:00Z"
  }
}
```

### Zone Management

#### `GET /api/zones/manage`
Get all zones for management.

**Headers:** `Authorization: Bearer <token>` (Authority role required)

**Response:**
```json
[
  {
    "id": 1,
    "name": "Tourist District",
    "type": "safe",
    "center": {"lat": 48.8566, "lon": 2.3522},
    "radius_meters": 1000,
    "description": "Well-patrolled tourist area",
    "created_at": "2025-09-15T10:00:00Z"
  }
]
```

#### `POST /api/zones/create`
Create a new restricted zone.

**Headers:** `Authorization: Bearer <token>` (Authority role required)

**Request Body:**
```json
{
  "name": "Construction Zone",
  "description": "Temporary restricted area due to construction",
  "zone_type": "restricted",
  "coordinates": [
    [2.3522, 48.8566],
    [2.3530, 48.8570],
    [2.3535, 48.8565],
    [2.3527, 48.8561]
  ]
}
```

**Response:**
```json
{
  "status": "zone_created",
  "zone_id": 2,
  "name": "Construction Zone",
  "type": "restricted"
}
```

#### `DELETE /api/zones/{zone_id}`
Delete a restricted zone.

**Headers:** `Authorization: Bearer <token>` (Authority role required)

**Response:**
```json
{
  "status": "zone_deleted",
  "id": 2
}
```

### Heatmap & Analytics

#### `GET /api/heatmap/data`
Get comprehensive heatmap data.

**Headers:** `Authorization: Bearer <token>` (Authority role required)
**Query Parameters:**
- `bounds_north`, `bounds_south`, `bounds_east`, `bounds_west`: Map bounds
- `hours_back`: Hours of historical data (default: 24)
- `include_zones`: Include zones data (default: true)
- `include_alerts`: Include alerts data (default: true)  
- `include_tourists`: Include tourist locations (default: true)

**Response:**
```json
{
  "metadata": {
    "bounds": {"north": 48.9, "south": 48.8, "east": 2.4, "west": 2.3},
    "hours_back": 24,
    "generated_at": "2025-10-01T12:50:00Z",
    "summary": {
      "zones_count": 5,
      "alerts_count": 12,
      "tourists_count": 25,
      "hotspots_count": 3
    }
  },
  "zones": [...],
  "alerts": [...],
  "tourists": [...],
  "hotspots": [...]
}
```

#### `GET /api/heatmap/zones`
Get zones for heatmap visualization.

**Headers:** `Authorization: Bearer <token>` (Authority role required)
**Query Parameters:**
- `zone_type`: Filter by type (safe/risky/restricted/all)
- `bounds_*`: Map bounds

**Response:**
```json
{
  "zones": [
    {
      "id": 1,
      "name": "Tourist District",
      "type": "safe",
      "center": {"lat": 48.8566, "lon": 2.3522},
      "radius_meters": 1000,
      "risk_weight": 0.1,
      "created_at": "2025-09-15T10:00:00Z"
    }
  ],
  "total": 1
}
```

#### `GET /api/heatmap/alerts`
Get alerts for heatmap visualization.

**Headers:** `Authorization: Bearer <token>` (Authority role required)
**Query Parameters:**
- `alert_type`: Filter by type (geofence/anomaly/panic/sos/sequence)
- `severity`: Filter by severity (low/medium/high/critical)
- `hours_back`: Historical period
- `bounds_*`: Map bounds

**Response:**
```json
{
  "alerts": [
    {
      "id": 789,
      "type": "sos",
      "severity": "critical",
      "location": {"lat": 48.8566, "lon": 2.3522},
      "tourist": {"id": "user_abc123", "name": "John Doe"},
      "weight": 1.0,
      "created_at": "2025-10-01T12:35:00Z"
    }
  ],
  "total": 1
}
```

#### `GET /api/heatmap/tourists`
Get tourist locations for heatmap.

**Headers:** `Authorization: Bearer <token>` (Authority role required)
**Query Parameters:**
- `hours_back`: Historical period
- `min_safety_score`, `max_safety_score`: Safety score range
- `bounds_*`: Map bounds

**Response:**
```json
{
  "tourists": [
    {
      "id": "user_abc123",
      "name": "John Doe",
      "safety_score": 78,
      "location": {
        "lat": 48.8566,
        "lon": 2.3522,
        "timestamp": "2025-10-01T12:30:00Z"
      },
      "risk_level": "low",
      "weight": 0.25
    }
  ],
  "total": 1
}
```

---

## ⚙️ ADMIN ENDPOINTS

### System Management

#### `GET /api/system/status`
Get comprehensive system status.

**Headers:** `Authorization: Bearer <token>` (Admin role required)

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-01T13:00:00Z",
  "database": {
    "status": "connected",
    "tourists_total": 1250,
    "authorities_total": 45,
    "active_tourists_24h": 320,
    "recent_alerts_24h": 18
  },
  "websockets": {
    "active_connections": 12,
    "channels": ["authority", "admin"]
  },
  "services": {
    "supabase": "connected",
    "redis": "connected",
    "ai_models": "loaded"
  }
}
```

#### `POST /api/system/retrain-model`
Trigger AI model retraining.

**Headers:** `Authorization: Bearer <token>` (Admin role required)

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
  "started_at": "2025-10-01T13:05:00Z",
  "started_by": "admin_user_id"
}
```

### User Management

#### `GET /api/users/list`
Get list of all users.

**Headers:** `Authorization: Bearer <token>` (Admin role required)
**Query Parameters:**
- `user_type`: Filter by type (tourist/authority/all)
- `limit`: Number of records (default: 100)

**Response:**
```json
{
  "users": [
    {
      "id": "user_abc123",
      "type": "tourist",
      "email": "tourist@example.com",
      "name": "John Doe",
      "phone": "+1234567890",
      "safety_score": 78,
      "is_active": true,
      "last_seen": "2025-10-01T12:30:00Z",
      "created_at": "2025-09-01T10:00:00Z"
    }
  ],
  "total": 1,
  "filter": "all"
}
```

#### `PUT /api/users/{user_id}/suspend`
Suspend a user account.

**Headers:** `Authorization: Bearer <token>` (Admin role required)

**Request Body:**
```json
{
  "reason": "Suspicious activity detected"
}
```

**Response:**
```json
{
  "id": "user_abc123",
  "type": "tourist",
  "status": "suspended",
  "reason": "Suspicious activity detected",
  "suspended_by": "admin_user_id",
  "suspended_at": "2025-10-01T13:10:00Z"
}
```

#### `PUT /api/users/{user_id}/activate`
Reactivate a suspended user.

**Headers:** `Authorization: Bearer <token>` (Admin role required)

**Response:**
```json
{
  "id": "user_abc123",
  "type": "tourist",
  "status": "activated"
}
```

### Analytics

#### `GET /api/analytics/dashboard`
Get analytics dashboard data.

**Headers:** `Authorization: Bearer <token>` (Admin role required)
**Query Parameters:**
- `days`: Analysis period (default: 7)

**Response:**
```json
{
  "period_days": 7,
  "alerts_by_type": {
    "sos": 5,
    "anomaly": 12,
    "geofence": 8,
    "panic": 3
  },
  "safety_score_distribution": {
    "critical": 15,
    "high_risk": 45,
    "medium_risk": 180,
    "low_risk": 1010
  },
  "average_safety_score": 76.5,
  "total_active_tourists": 1250,
  "generated_at": "2025-10-01T13:15:00Z"
}
```

---

## 🤖 AI SERVICE ENDPOINTS

### Geofencing

#### `POST /api/ai/geofence/check`
Check if coordinates are within restricted zones.

**Headers:** `Authorization: Bearer <token>`

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
  "zones": [],
  "risk_level": "safe",
  "zone_count": 0
}
```

#### `POST /api/ai/geofence/nearby`
Get nearby zones within radius.

**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
- `radius`: Search radius in meters (default: 1000)

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
  "nearby_zones": [
    {
      "id": 1,
      "name": "Tourist District",
      "type": "safe",
      "distance_meters": 250.5
    }
  ],
  "radius_meters": 1000,
  "center": {"lat": 48.8566, "lon": 2.3522}
}
```

### Anomaly Detection

#### `POST /api/ai/anomaly/point`
Score single location point for anomaly.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "lat": 48.8566,
  "lon": 2.3522,
  "speed": 15.5,
  "timestamp": "2025-10-01T13:20:00Z"
}
```

**Response:**
```json
{
  "anomaly_score": 0.25,
  "risk_level": "low",
  "location": {"lat": 48.8566, "lon": 2.3522},
  "timestamp": "2025-10-01T13:20:00Z"
}
```

#### `POST /api/ai/anomaly/sequence`
Score sequence of locations for anomaly.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "points": [
    {"lat": 48.8566, "lon": 2.3522, "speed": 5.0},
    {"lat": 48.8570, "lon": 2.3525, "speed": 8.2},
    {"lat": 48.8575, "lon": 2.3530, "speed": 12.1}
  ]
}
```

**Response:**
```json
{
  "sequence_anomaly_score": 0.15,
  "risk_level": "low",
  "sequence_length": 3,
  "timestamp": "2025-10-01T13:25:00Z"
}
```

### Safety Scoring

#### `POST /api/ai/score/compute`
Compute comprehensive safety score.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "lat": 48.8566,
  "lon": 2.3522,
  "location_history": [
    {"latitude": 48.8560, "longitude": 2.3520, "speed": 3.0, "timestamp": "2025-10-01T13:15:00Z"},
    {"latitude": 48.8563, "longitude": 2.3521, "speed": 4.5, "timestamp": "2025-10-01T13:18:00Z"}
  ],
  "current_location_data": {
    "latitude": 48.8566,
    "longitude": 2.3522,
    "timestamp": "2025-10-01T13:20:00Z"
  },
  "manual_adjustment": 0
}
```

**Response:**
```json
{
  "safety_score": 82,
  "risk_level": "low",
  "components": {
    "geofence": "evaluated",
    "anomaly": "evaluated",
    "sequence": "evaluated",
    "manual_adjustment": 0
  },
  "location": {"lat": 48.8566, "lon": 2.3522},
  "timestamp": "2025-10-01T13:20:00Z"
}
```

### Alert Classification

#### `POST /api/ai/classify/alert`
Classify alert severity (placeholder for ML classifier).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "safety_score": 45,
  "alert_type": "anomaly",
  "location_data": {"lat": 48.8566, "lon": 2.3522}
}
```

**Response:**
```json
{
  "classification": {
    "label": "high",
    "confidence": 0.8
  },
  "features": {
    "safety_score": 45,
    "alert_type": "anomaly",
    "location_available": true
  },
  "model_info": {
    "type": "rule_based",
    "note": "ML classifier to be implemented"
  },
  "timestamp": "2025-10-01T13:25:00Z"
}
```

### Model Status

#### `GET /api/ai/models/status`
Get AI models status.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "models": {
    "isolation_forest": {
      "status": "loaded",
      "type": "anomaly_detection",
      "last_trained": "placeholder"
    },
    "lstm_autoencoder": {
      "status": "loaded",
      "type": "sequence_analysis",
      "last_trained": "placeholder"
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
  "timestamp": "2025-10-01T13:30:00Z"
}
```

---

## 🔔 NOTIFICATION ENDPOINTS

### Push Notifications

#### `POST /api/notify/push`
Send push notification to specific user.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "user_id": "user_abc123",
  "title": "Safety Alert",
  "body": "You have entered a restricted zone",
  "token": "device_token_here",
  "data": {"alert_type": "geofence"}
}
```

**Response:**
```json
{
  "status": "push_sent",
  "user_id": "user_abc123",
  "timestamp": "2025-10-01T13:35:00Z"
}
```

### SMS Notifications

#### `POST /api/notify/sms`
Send SMS notification.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "to_number": "+1234567890",
  "body": "Emergency alert: Tourist John Doe triggered SOS at coordinates 48.8566, 2.3522"
}
```

**Response:**
```json
{
  "status": "sms_sent",
  "to_number": "+1234567890",
  "timestamp": "2025-10-01T13:40:00Z"
}
```

### Emergency Alerts

#### `POST /api/notify/emergency`
Send emergency alert to all relevant contacts.

**Headers:** `Authorization: Bearer <token>` (Authority role required)

**Request Body:**
```json
{
  "tourist_id": "user_abc123",
  "alert_type": "sos",
  "location": {"lat": 48.8566, "lon": 2.3522},
  "message": "Emergency situation detected"
}
```

**Response:**
```json
{
  "status": "emergency_alert_sent",
  "notifications": {
    "push_sent": true,
    "sms_sent": true,
    "emergency_contacts_notified": 2,
    "authorities_notified": 5
  },
  "timestamp": "2025-10-01T13:45:00Z"
}
```

### Broadcast Notifications

#### `POST /api/notify/broadcast`
Send broadcast notification to user groups.

**Headers:** `Authorization: Bearer <token>` (Authority/Admin role required)

**Request Body:**
```json
{
  "title": "System Maintenance",
  "body": "Platform will undergo maintenance from 2:00 AM to 4:00 AM",
  "target_group": "all",
  "data": {"maintenance": "true"}
}
```

**Response:**
```json
{
  "status": "broadcast_sent",
  "target_group": "all",
  "recipients_count": 1295,
  "timestamp": "2025-10-01T13:50:00Z"
}
```

#### `GET /api/notify/history`
Get notification history.

**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
- `limit`: Number of records (default: 50)
- `type`: Filter by type (push/sms/email/broadcast)

**Response:**
```json
[
  {
    "id": 123,
    "type": "push",
    "title": "Safety Alert",
    "recipient": "user_abc123",
    "status": "delivered",
    "sent_at": "2025-10-01T13:35:00Z"
  }
]
```

---

## 🌐 WEBSOCKET ENDPOINTS

### Real-time Alerts

#### `WS /api/alerts/subscribe`
Subscribe to real-time alerts (Authority/Admin only).

**Query Parameters:**
- `token`: JWT token for authentication

**Connection:**
```javascript
const ws = new WebSocket('ws://localhost:8000/api/alerts/subscribe?token=YOUR_JWT_TOKEN');
```

**Message Types:**
```json
// SOS Alert
{
  "type": "sos_alert",
  "alert_id": 789,
  "tourist_id": "user_abc123",
  "tourist_name": "John Doe",
  "severity": "critical",
  "location": {"lat": 48.8566, "lon": 2.3522},
  "timestamp": "2025-10-01T12:35:00Z"
}

// Safety Score Alert
{
  "type": "safety_alert",
  "alert_id": 790,
  "tourist_id": "user_abc123",
  "severity": "high",
  "safety_score": 35,
  "location": {"lat": 48.8566, "lon": 2.3522},
  "timestamp": "2025-10-01T12:40:00Z"
}

// Model Retrain Complete (Admin only)
{
  "type": "retrain_complete",
  "results": {
    "anomaly": {"status": "success"},
    "sequence": {"status": "success"}
  },
  "timestamp": "2025-10-01T13:05:00Z"
}
```

**Heartbeat:**
Send `"ping"` to receive `"pong"` response for connection health check.

---

## 📊 DATA MODELS

### User Roles
- **tourist**: Basic mobile app user
- **authority**: Police/emergency responder  
- **admin**: System administrator

### Alert Types
- **geofence**: Zone violation alert
- **anomaly**: AI-detected unusual behavior
- **panic**: User-triggered panic button
- **sos**: Emergency SOS alert
- **sequence**: Sequential movement anomaly

### Alert Severity
- **low**: Minor concern
- **medium**: Moderate risk
- **high**: Significant risk
- **critical**: Emergency situation

### Zone Types
- **safe**: Safe area (tourist-friendly)
- **risky**: Areas requiring caution
- **restricted**: Prohibited/dangerous areas

### Trip Status
- **planned**: Trip planned but not started
- **active**: Currently tracking
- **completed**: Trip finished
- **cancelled**: Trip cancelled

---

## 🚨 ERROR RESPONSES

### Standard Error Format
```json
{
  "detail": "Error description",
  "status_code": 400,
  "timestamp": "2025-10-01T14:00:00Z"
}
```

### Common HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **422**: Unprocessable Entity (validation error)
- **500**: Internal Server Error

### Authentication Errors
```json
{
  "detail": "Invalid authentication credentials",
  "status_code": 401
}
```

### Permission Errors
```json
{
  "detail": "Access denied: Authority role required. Current role: tourist",
  "status_code": 403
}
```

### Validation Errors
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ],
  "status_code": 422
}
```

---

## 🔧 RATE LIMITS

### General API
- **10 requests/second** per IP
- **1000 requests/hour** per authenticated user

### Authentication Endpoints
- **5 requests/second** per IP
- **20 requests/hour** per IP

### WebSocket Connections
- **5 concurrent connections** per user
- **1 connection/second** connection rate

---

## 💡 BEST PRACTICES

### Authentication
1. Always include `Authorization: Bearer <token>` header
2. Tokens do not expire in development (change for production)
3. Use appropriate role-based endpoints

### Location Updates
1. Send location updates every 30-60 seconds for active trips
2. Include accuracy and speed when available
3. Handle safety score responses appropriately

### Error Handling
1. Check HTTP status codes
2. Parse error details from response body
3. Implement retry logic for 5xx errors

### WebSocket Usage
1. Implement reconnection logic
2. Send periodic heartbeat messages
3. Handle connection state properly

### Rate Limiting
1. Implement exponential backoff for rate limit errors
2. Cache frequently accessed data
3. Use batch endpoints when available

---

## 📱 CLIENT INTEGRATION

### Mobile App (Tourist)
```javascript
// Example: Update location with safety check
const updateLocation = async (lat, lon) => {
  const response = await fetch('/api/location/update', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      lat: lat,
      lon: lon,
      timestamp: new Date().toISOString()
    })
  });
  
  const data = await response.json();
  
  if (data.safety_score < 70) {
    showSafetyWarning(data.risk_level);
  }
};
```

### Police Dashboard (Authority)
```javascript
// Example: Subscribe to real-time alerts
const subscribeToAlerts = () => {
  const ws = new WebSocket(`ws://localhost:8000/api/alerts/subscribe?token=${token}`);
  
  ws.onmessage = (event) => {
    const alert = JSON.parse(event.data);
    
    if (alert.type === 'sos_alert') {
      displayEmergencyAlert(alert);
    }
  };
  
  // Heartbeat
  setInterval(() => {
    ws.send('ping');
  }, 30000);
};
```

### Admin Dashboard
```javascript
// Example: Trigger model retraining
const retrainModels = async () => {
  const response = await fetch('/api/system/retrain-model', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model_types: ['anomaly', 'sequence'],
      days_back: 30
    })
  });
  
  return await response.json();
};
```

---

## 🔄 CHANGELOG

### v1.0.0 (Current)
- Complete tourist endpoints
- Full authority dashboard API
- Admin system management
- AI/ML service endpoints  
- Real-time WebSocket alerts
- Notification system
- Heatmap visualization
- E-FIR blockchain integration

---

## 📞 SUPPORT

For API support and questions:
- **Email**: api-support@safehorizon.com
- **Documentation**: https://docs.safehorizon.com
- **Status Page**: https://status.safehorizon.com

---

*This documentation covers all **42 endpoints** across **5 routers** in the SafeHorizon API. For the most up-to-date information, please refer to the interactive API documentation at `/docs` (Swagger UI) or `/redoc` (ReDoc).*