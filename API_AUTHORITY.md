# 👮 Authority (Police) API Endpoints

Base URL: `/api`

All endpoints require authority authentication.

---

## 📝 Authentication

### Register Authority

**Endpoint:** `POST /auth/register-authority`

**Description:** Register a new police authority account.

**Request Body:**
```json
{
  "email": "officer.smith@police.gov",
  "password": "SecurePolicePass123!",
  "name": "Officer John Smith",
  "badge_number": "PD-12345",
  "department": "Tokyo Metropolitan Police",
  "rank": "Inspector",
  "phone": "+81-90-1234-5678"
}
```

**Response:** `200 OK`
```json
{
  "message": "Authority registered successfully",
  "user_id": "auth_a1b2c3d4...",
  "badge_number": "PD-12345",
  "department": "Tokyo Metropolitan Police"
}
```

**Error Response:** `400 Bad Request`
```json
{
  "detail": "Badge number already exists"
}
```

---

### Login Authority

**Endpoint:** `POST /auth/login-authority`

**Description:** Login with authority credentials to receive JWT access token.

**Request Body:**
```json
{
  "email": "officer.smith@police.gov",
  "password": "SecurePolicePass123!"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": "auth_a1b2c3d4...",
  "email": "officer.smith@police.gov",
  "role": "authority"
}
```

**Note:** If user has admin rank, role will be `"admin"`.

---

## 👥 Tourist Monitoring

### Get Active Tourists

**Endpoint:** `GET /tourists/active`

**Description:** Get list of all tourists who have been active in the last 24 hours.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
[
  {
    "id": "tourist_xyz123",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "safety_score": 85,
    "last_location": {
      "lat": 35.6762,
      "lon": 139.6503
    },
    "last_seen": "2025-10-01T14:30:00Z"
  },
  {
    "id": "tourist_abc456",
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "safety_score": 62,
    "last_location": {
      "lat": 35.6800,
      "lon": 139.6550
    },
    "last_seen": "2025-10-01T14:28:00Z"
  }
]
```

---

### Track Tourist

**Endpoint:** `GET /tourist/{tourist_id}/track`

**Description:** Get detailed tracking information for a specific tourist including recent locations and alerts.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `tourist_id`: Tourist user ID

**Example:** `GET /tourist/tourist_xyz123/track`

**Response:** `200 OK`
```json
{
  "tourist": {
    "id": "tourist_xyz123",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "safety_score": 85,
    "last_seen": "2025-10-01T14:30:00Z"
  },
  "locations": [
    {
      "id": 5678,
      "lat": 35.6762,
      "lon": 139.6503,
      "speed": 5.2,
      "altitude": 45.0,
      "timestamp": "2025-10-01T14:30:00Z"
    },
    {
      "id": 5677,
      "lat": 35.6755,
      "lon": 139.6498,
      "speed": 4.8,
      "altitude": 44.5,
      "timestamp": "2025-10-01T14:25:00Z"
    }
  ],
  "alerts": [
    {
      "id": 890,
      "type": "anomaly",
      "severity": "high",
      "title": "Safety Alert - Score: 45",
      "description": "Safety score dropped to 45",
      "is_acknowledged": false,
      "created_at": "2025-10-01T13:00:00Z"
    }
  ]
}
```

---

### Get Tourist Alerts

**Endpoint:** `GET /tourist/{tourist_id}/alerts`

**Description:** Get all alerts for a specific tourist.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `tourist_id`: Tourist user ID

**Query Parameters:**
- `limit` (optional, default: 50): Maximum number of alerts
- `hours_back` (optional, default: 24): Time range in hours

**Example:** `GET /tourist/tourist_xyz123/alerts?hours_back=48&limit=100`

**Response:** `200 OK`
```json
{
  "tourist_id": "tourist_xyz123",
  "tourist_name": "John Doe",
  "filter": {
    "hours_back": 48,
    "limit": 100
  },
  "alerts": [
    {
      "id": 890,
      "type": "anomaly",
      "severity": "high",
      "title": "Safety Alert",
      "description": "Unusual movement pattern detected",
      "location": {
        "lat": 35.6800,
        "lon": 139.6550
      },
      "is_acknowledged": false,
      "is_resolved": false,
      "created_at": "2025-10-01T13:00:00Z"
    }
  ],
  "total_count": 15,
  "unacknowledged_count": 3
}
```

---

### Get Tourist Location History

**Endpoint:** `GET /tourist/{tourist_id}/location-history`

**Description:** Get comprehensive location history with trip information and statistics.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `tourist_id`: Tourist user ID

**Query Parameters:**
- `hours_back` (optional, default: 24): Time range in hours
- `limit` (optional, default: 100): Maximum number of locations
- `include_trip_info` (optional, default: false): Include trip details

**Example:** `GET /tourist/tourist_xyz123/location-history?hours_back=12&limit=50&include_trip_info=true`

**Response:** `200 OK`
```json
{
  "tourist_id": "tourist_xyz123",
  "tourist_name": "John Doe",
  "filter": {
    "hours_back": 12,
    "limit": 50,
    "time_from": "2025-10-01T02:30:00Z",
    "time_to": "2025-10-01T14:30:00Z"
  },
  "locations": [
    {
      "id": 5678,
      "latitude": 35.6762,
      "longitude": 139.6503,
      "altitude": 45.0,
      "speed": 5.2,
      "accuracy": 10.0,
      "timestamp": "2025-10-01T14:30:00Z",
      "trip": {
        "id": 123,
        "destination": "Tokyo, Japan",
        "status": "active"
      }
    }
  ],
  "statistics": {
    "total_points": 48,
    "distance_traveled_meters": 12543.67,
    "distance_traveled_km": 12.54,
    "time_span_hours": 12
  }
}
```

---

### Get Tourist Movement Analysis

**Endpoint:** `GET /tourist/{tourist_id}/movement-analysis`

**Description:** Analyze tourist's movement patterns for police assessment.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `tourist_id`: Tourist user ID

**Query Parameters:**
- `hours_back` (optional, default: 24): Analysis time range

**Example:** `GET /tourist/tourist_xyz123/movement-analysis?hours_back=6`

**Response:** `200 OK`
```json
{
  "tourist_id": "tourist_xyz123",
  "tourist_name": "John Doe",
  "analysis_period": {
    "hours": 6,
    "from": "2025-10-01T08:30:00Z",
    "to": "2025-10-01T14:30:00Z"
  },
  "movement_metrics": {
    "total_distance_km": 8.45,
    "average_speed_kmh": 12.3,
    "max_speed_kmh": 45.8,
    "movement_type": "vehicle_city",
    "data_points": 72,
    "stationary_periods": 5
  },
  "behavior_assessment": {
    "is_moving": true,
    "unusual_speed": false,
    "mostly_stationary": false,
    "activity_level": "high"
  }
}
```

**Movement Types:**
- `mostly_stationary`: Average speed < 5 km/h
- `walking`: Average speed 5-15 km/h
- `vehicle_city`: Average speed 15-50 km/h
- `vehicle_highway`: Average speed > 50 km/h

---

## 🚨 Alert Management

### Get Recent Alerts

**Endpoint:** `GET /alerts/recent`

**Description:** Get recent alerts from all tourists.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `limit` (optional, default: 50): Maximum number of alerts
- `severity` (optional): Filter by severity (low, medium, high, critical)
- `hours_back` (optional, default: 24): Time range in hours

**Example:** `GET /alerts/recent?severity=high&limit=20&hours_back=6`

**Response:** `200 OK`
```json
{
  "alerts": [
    {
      "id": 999,
      "tourist": {
        "id": "tourist_xyz123",
        "name": "John Doe",
        "email": "john.doe@example.com"
      },
      "type": "sos",
      "severity": "critical",
      "title": "SOS Emergency Alert",
      "description": "Emergency SOS triggered by user",
      "location": {
        "lat": 35.6762,
        "lon": 139.6503
      },
      "is_acknowledged": false,
      "is_resolved": false,
      "created_at": "2025-10-01T14:45:00Z"
    }
  ],
  "total_count": 8,
  "filter": {
    "severity": "high",
    "hours_back": 6
  }
}
```

---

### WebSocket Alert Subscription

**Endpoint:** `WS /alerts/subscribe`

**Description:** WebSocket connection for real-time alert notifications.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Connection Example:**
```javascript
const ws = new WebSocket('wss://api.safehorizon.com/alerts/subscribe');
ws.onmessage = (event) => {
  const alert = JSON.parse(event.data);
  console.log('New alert:', alert);
};
```

**Alert Message Format:**
```json
{
  "type": "safety_alert",
  "alert_id": 890,
  "tourist_id": "tourist_xyz123",
  "tourist_name": "John Doe",
  "severity": "high",
  "safety_score": 45,
  "location": {
    "lat": 35.6800,
    "lon": 139.6550
  },
  "timestamp": "2025-10-01T15:00:00Z",
  "alert_type": "anomaly"
}
```

---

## 📋 Incident Management

### Acknowledge Incident

**Endpoint:** `POST /incident/acknowledge`

**Description:** Acknowledge an alert/incident and assign to current officer.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "alert_id": 890,
  "notes": "Responding to location, ETA 10 minutes"
}
```

**Response:** `200 OK`
```json
{
  "status": "acknowledged",
  "incident_id": 456,
  "alert_id": 890,
  "acknowledged_by": {
    "id": "auth_a1b2c3d4...",
    "name": "Officer John Smith",
    "badge_number": "PD-12345"
  },
  "acknowledged_at": "2025-10-01T15:05:00Z",
  "notes": "Responding to location, ETA 10 minutes"
}
```

---

### Close Incident

**Endpoint:** `POST /incident/close`

**Description:** Close a resolved incident with resolution notes.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "incident_id": 456,
  "resolution_notes": "False alarm - tourist confirmed safe, was in area for sightseeing",
  "status": "resolved"
}
```

**Response:** `200 OK`
```json
{
  "status": "closed",
  "incident_id": 456,
  "incident_number": "INC-2025-001234",
  "resolved_at": "2025-10-01T15:30:00Z",
  "resolution_notes": "False alarm - tourist confirmed safe",
  "resolved_by": {
    "id": "auth_a1b2c3d4...",
    "name": "Officer John Smith",
    "badge_number": "PD-12345"
  }
}
```

---

## 📄 E-FIR Management

### Generate E-FIR

**Endpoint:** `POST /efir/generate`

**Description:** Generate Electronic First Information Report for an incident.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "incident_id": 456,
  "tourist_id": "tourist_xyz123",
  "incident_type": "harassment",
  "description": "Tourist reported harassment near shopping district",
  "location": "Shibuya Crossing, Tokyo",
  "witnesses": ["Tourist reported two witnesses at scene"],
  "officer_notes": "Incident verified, CCTV footage requested",
  "severity": "medium"
}
```

**Response:** `200 OK`
```json
{
  "status": "efir_generated",
  "efir_reference": "EFIR-2025-001234",
  "incident_id": 456,
  "incident_number": "INC-2025-001234",
  "blockchain": {
    "tx_id": "0x1a2b3c4d5e6f7890abcdef...",
    "block_hash": "block_9f8e7d6c5b4a3210...",
    "status": "confirmed",
    "timestamp": "2025-10-01T15:35:00Z",
    "verification_url": "/api/blockchain/verify/0x1a2b3c4d5e6f7890abcdef...",
    "chain_id": "safehorizon-efir-chain"
  },
  "generated_by": {
    "id": "auth_a1b2c3d4...",
    "name": "Officer John Smith",
    "badge_number": "PD-12345"
  },
  "generated_at": "2025-10-01T15:35:00Z"
}
```

---

### List E-FIR Records

**Endpoint:** `GET /authority/efir/list`

**Description:** Get paginated list of all E-FIR records with filtering options.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `limit` (optional, default: 100): Maximum number of records to return
- `offset` (optional, default: 0): Pagination offset
- `status` (optional): Filter by incident status (open, acknowledged, resolved, closed)

**Example:** `GET /authority/efir/list?status=open&limit=50&offset=0`

**Response:** `200 OK`
```json
{
  "efir_records": [
    {
      "efir_reference": "0x1a2b3c4d5e6f7890abcdef...",
      "incident_number": "INC-2025-001234",
      "incident_id": 456,
      "alert_id": 789,
      "alert_type": "sos",
      "severity": "critical",
      "status": "open",
      "priority": "high",
      "tourist": {
        "id": "tourist_xyz123",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "+1234567890"
      },
      "location": {
        "lat": 35.6762,
        "lon": 139.6503
      },
      "assigned_to": "auth_abc456",
      "response_time": "2025-10-01T15:30:00Z",
      "resolution_notes": "Units dispatched, tourist located safely",
      "created_at": "2025-10-01T15:25:00Z",
      "updated_at": "2025-10-01T15:45:00Z"
    },
    {
      "efir_reference": "0x9876543210fedcba...",
      "incident_number": "INC-2025-001233",
      "incident_id": 455,
      "alert_id": 788,
      "alert_type": "anomaly",
      "severity": "high",
      "status": "resolved",
      "priority": "medium",
      "tourist": {
        "id": "tourist_abc789",
        "name": "Jane Smith",
        "email": "jane.smith@example.com",
        "phone": "+1234567891"
      },
      "location": {
        "lat": 35.6895,
        "lon": 139.6917
      },
      "assigned_to": "auth_def789",
      "response_time": "2025-10-01T14:20:00Z",
      "resolution_notes": "False alarm - tourist was jogging in unusual pattern",
      "created_at": "2025-10-01T14:15:00Z",
      "updated_at": "2025-10-01T14:50:00Z"
    }
  ],
  "pagination": {
    "total": 234,
    "limit": 50,
    "offset": 0,
    "has_more": true
  }
}
```

**Error Response:** `401 Unauthorized`
```json
{
  "detail": "Invalid authentication credentials"
}
```

**Error Response:** `403 Forbidden`
```json
{
  "detail": "Access denied: Authority role required"
}
```

---

## 🗺️ Zone Management

### List Restricted Zones

**Endpoint:** `GET /zones/list`

**Description:** Get list of all restricted zones.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `zone_type` (optional): Filter by type (safe, risky, restricted)
- `active_only` (optional, default: true): Show only active zones

**Example:** `GET /zones/list?zone_type=risky&active_only=true`

**Response:** `200 OK`
```json
{
  "zones": [
    {
      "id": 1,
      "name": "Night District - High Crime Area",
      "type": "risky",
      "description": "Increased theft and harassment reports after 10 PM",
      "center": {
        "lat": 35.6750,
        "lon": 139.6520
      },
      "radius_meters": 500,
      "is_active": true,
      "created_by": {
        "name": "Officer Smith",
        "badge_number": "PD-12345"
      },
      "created_at": "2025-09-15T10:00:00Z"
    }
  ],
  "total_count": 15,
  "filter": {
    "zone_type": "risky",
    "active_only": true
  }
}
```

---

### Create Restricted Zone

**Endpoint:** `POST /zones/create`

**Description:** Create a new restricted zone.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "Construction Area - Restricted",
  "description": "Active construction site - no entry allowed",
  "zone_type": "restricted",
  "coordinates": [
    [139.6500, 35.6740],
    [139.6510, 35.6740],
    [139.6510, 35.6750],
    [139.6500, 35.6750],
    [139.6500, 35.6740]
  ]
}
```

**Response:** `200 OK`
```json
{
  "id": 25,
  "name": "Construction Area - Restricted",
  "type": "restricted",
  "description": "Active construction site - no entry allowed",
  "center": {
    "lat": 35.6745,
    "lon": 139.6505
  },
  "radius_meters": 785.5,
  "created_at": "2025-10-01T16:00:00Z",
  "created_by": {
    "id": "auth_a1b2c3d4...",
    "name": "Officer John Smith"
  }
}
```

---

### Update Restricted Zone

**Endpoint:** `PUT /zones/{zone_id}`

**Description:** Update an existing restricted zone.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `zone_id`: Zone ID

**Request Body:**
```json
{
  "name": "Night District - High Crime Area (Updated)",
  "description": "Increased theft and harassment - police patrol increased",
  "is_active": true
}
```

**Response:** `200 OK`
```json
{
  "status": "zone_updated",
  "zone_id": 1,
  "updated_fields": ["name", "description"],
  "updated_at": "2025-10-01T16:10:00Z"
}
```

---

### Delete Restricted Zone

**Endpoint:** `DELETE /zones/{zone_id}`

**Description:** Deactivate a restricted zone (soft delete).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `zone_id`: Zone ID

**Example:** `DELETE /zones/5`

**Response:** `200 OK`
```json
{
  "status": "zone_deleted",
  "zone_id": 5,
  "message": "Zone deactivated successfully"
}
```

---

## 📊 Dashboard & Analytics

### Get Dashboard Heatmap

**Endpoint:** `POST /dashboard/heatmap`

**Description:** Get heatmap data for police dashboard visualization.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "bounds": {
    "north": 35.7,
    "south": 35.6,
    "east": 139.8,
    "west": 139.6
  },
  "hours_back": 24,
  "include_zones": true,
  "include_alerts": true,
  "include_tourists": true
}
```

**Response:** `200 OK`
```json
{
  "bounds": {
    "north": 35.7,
    "south": 35.6,
    "east": 139.8,
    "west": 139.6
  },
  "time_range": {
    "hours_back": 24,
    "from": "2025-09-30T16:00:00Z",
    "to": "2025-10-01T16:00:00Z"
  },
  "tourists": {
    "active_count": 25,
    "locations": [
      {
        "tourist_id": "tourist_xyz123",
        "lat": 35.6762,
        "lon": 139.6503,
        "safety_score": 85
      }
    ]
  },
  "alerts": {
    "total_count": 8,
    "by_severity": {
      "critical": 1,
      "high": 2,
      "medium": 3,
      "low": 2
    },
    "hotspots": [
      {
        "lat": 35.6750,
        "lon": 139.6520,
        "alert_count": 5,
        "severity": "high"
      }
    ]
  },
  "zones": [
    {
      "id": 1,
      "name": "Night District",
      "type": "risky",
      "center": {
        "lat": 35.6750,
        "lon": 139.6520
      },
      "radius_meters": 500
    }
  ]
}
```

---

### Get Statistics

**Endpoint:** `GET /dashboard/statistics`

**Description:** Get comprehensive statistics for the dashboard.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `period` (optional, default: 24h): Time period (24h, 7d, 30d)

**Example:** `GET /dashboard/statistics?period=7d`

**Response:** `200 OK`
```json
{
  "period": "7d",
  "tourists": {
    "total": 150,
    "active_now": 25,
    "average_safety_score": 78.5
  },
  "alerts": {
    "total": 45,
    "by_type": {
      "sos": 3,
      "anomaly": 15,
      "geofence": 20,
      "panic": 2,
      "sequence": 5
    },
    "by_severity": {
      "critical": 3,
      "high": 12,
      "medium": 20,
      "low": 10
    },
    "response_time_avg_minutes": 8.5
  },
  "incidents": {
    "total": 30,
    "open": 5,
    "resolved": 25,
    "with_efir": 12
  },
  "zones": {
    "total": 15,
    "risky": 8,
    "restricted": 5,
    "safe": 2
  }
}
```

---

## 📞 Emergency Services

### Broadcast Emergency Alert

**Endpoint:** `POST /emergency/broadcast`

**Description:** Broadcast emergency alert to tourists in a specific area.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "title": "Emergency: Natural Disaster Alert",
  "message": "Earthquake warning issued. Move to designated safe zones immediately.",
  "area": {
    "center_lat": 35.6762,
    "center_lon": 139.6503,
    "radius_km": 5
  },
  "severity": "critical",
  "evacuation_points": [
    {
      "name": "Central Park Safe Zone",
      "lat": 35.6800,
      "lon": 139.6600
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "status": "broadcast_sent",
  "alert_id": 1500,
  "tourists_notified": 47,
  "notifications": {
    "push": 45,
    "sms": 47,
    "email": 47
  },
  "area": {
    "center": {
      "lat": 35.6762,
      "lon": 139.6503
    },
    "radius_km": 5
  },
  "timestamp": "2025-10-01T17:00:00Z"
}
```

---

## Error Responses

### Common Error Codes

**401 Unauthorized**
```json
{
  "detail": "Invalid authentication credentials"
}
```

**403 Forbidden**
```json
{
  "detail": "Access denied: Authority role required"
}
```

**404 Not Found**
```json
{
  "detail": "Tourist not found"
}
```

**429 Too Many Requests**
```json
{
  "detail": "Rate limit exceeded"
}
```

---

## Notes

- All endpoints require **authority role** authentication
- Admin users can access all authority endpoints
- WebSocket connections auto-reconnect on disconnect
- Heatmap data refreshes every 30 seconds
- E-FIR records are **immutable** once created on blockchain
