# 👮 SafeHorizon Authority (Police) API Documentation

**Base URL:** `http://localhost:8000/api`  
**Authentication:** Bearer Token (JWT)  
**Role:** Authority/Police

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Tourist Monitoring](#tourist-monitoring)
3. [Alert Management](#alert-management)
4. [Broadcast System](#broadcast-system)
5. [E-FIR Management](#e-fir-management)
6. [Zone Management](#zone-management)
7. [WebSocket (Real-time Alerts)](#websocket-real-time-alerts)

---

## 🔐 Authentication

### 1. Register Authority Account

**Endpoint:** `POST /api/authority/auth/register`  
**Authentication:** None (Admin approval may be required)

**Request Body:**
```json
{
  "email": "officer@police.gov.in",
  "password": "securepass123",
  "name": "Officer John Smith",
  "badge_number": "POL-12345",
  "department": "Delhi Police",
  "jurisdiction": "South Delhi",
  "phone": "+919876543210"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": "auth123abc456def789",
  "email": "officer@police.gov.in",
  "role": "authority"
}
```

---

### 2. Login Authority

**Endpoint:** `POST /api/authority/auth/login`  
**Authentication:** None (Public)

**Request Body:**
```json
{
  "email": "demo@gmail.com",
  "password": "demo@123456"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": "auth123abc456def789",
  "email": "demo@gmail.com",
  "role": "authority"
}
```

**Response (401 Unauthorized):**
```json
{
  "detail": "Invalid credentials"
}
```

---

### 3. Get Authority Profile

**Endpoint:** `GET /api/authority/auth/me`  
**Authentication:** Required (Authority Token)

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "id": "auth123abc456def789",
  "email": "demo@gmail.com",
  "name": "Officer Demo",
  "badge_number": "POL-DEMO",
  "department": "Delhi Police",
  "jurisdiction": "Central Delhi",
  "phone": "+919876543210",
  "is_active": true,
  "created_at": "2025-09-15T10:00:00+00:00"
}
```

---

## 🔍 Tourist Monitoring

### 4. Get Active Tourists

**Endpoint:** `GET /api/authority/tourists/active`  
**Authentication:** Required (Authority)

**Response (200 OK):**
```json
{
  "active_tourists": [
    {
      "id": "96433ce915a95eaaf4fb6a6500ad9b82",
      "name": "ball",
      "email": "ball@gmail.com",
      "phone": "+919876543210",
      "safety_score": 100,
      "risk_level": "low",
      "last_location": {
        "lat": 28.6129,
        "lon": 77.2295,
        "timestamp": "2025-10-02T08:14:00+00:00"
      },
      "active_trip": {
        "id": 91,
        "destination": "India Gate, New Delhi",
        "start_date": "2025-10-02T02:43:58+00:00"
      },
      "last_seen": "2025-10-02T08:14:00+00:00"
    },
    {
      "id": "tourist456xyz789abc",
      "name": "Jane Tourist",
      "email": "jane@example.com",
      "phone": "+919876543211",
      "safety_score": 65,
      "risk_level": "medium",
      "last_location": {
        "lat": 28.7041,
        "lon": 77.1025,
        "timestamp": "2025-10-02T08:10:00+00:00"
      },
      "active_trip": {
        "id": 92,
        "destination": "Red Fort, Delhi",
        "start_date": "2025-10-02T07:00:00+00:00"
      },
      "last_seen": "2025-10-02T08:12:00+00:00"
    }
  ],
  "total": 2,
  "timestamp": "2025-10-02T08:15:00+00:00"
}
```

---

### 5. Track Specific Tourist

**Endpoint:** `GET /api/authority/tourist/{tourist_id}/track`  
**Authentication:** Required (Authority)

**Response (200 OK):**
```json
{
  "tourist": {
    "id": "96433ce915a95eaaf4fb6a6500ad9b82",
    "name": "ball",
    "email": "ball@gmail.com",
    "phone": "+919876543210",
    "emergency_contact": "Jane Doe",
    "emergency_phone": "+919876543211",
    "safety_score": 100,
    "risk_level": "low",
    "is_active": true
  },
  "current_location": {
    "lat": 28.6129,
    "lon": 77.2295,
    "speed": 15.5,
    "altitude": 216.0,
    "accuracy": 10.0,
    "timestamp": "2025-10-02T08:14:00+00:00"
  },
  "active_trip": {
    "id": 91,
    "destination": "India Gate, New Delhi",
    "status": "active",
    "start_date": "2025-10-02T02:43:58+00:00",
    "expected_duration_hours": 4
  },
  "recent_locations": [
    {
      "lat": 28.6129,
      "lon": 77.2295,
      "timestamp": "2025-10-02T08:14:00+00:00"
    },
    {
      "lat": 28.6120,
      "lon": 77.2280,
      "timestamp": "2025-10-02T08:13:00+00:00"
    }
  ],
  "recent_alerts": [
    {
      "id": 124,
      "type": "sos",
      "severity": "critical",
      "title": "SOS Emergency Alert",
      "description": "Tourist triggered SOS",
      "timestamp": "2025-10-02T08:14:13+00:00",
      "status": "pending"
    }
  ]
}
```

**Response (404 Not Found):**
```json
{
  "detail": "Tourist not found"
}
```

---

### 6. Get Tourist Location History

**Endpoint:** `GET /api/authority/tourist/{tourist_id}/locations?hours=24&limit=100`  
**Authentication:** Required (Authority)

**Query Parameters:**
- `hours` (optional): Hours of history (default: 24)
- `limit` (optional): Max locations (default: 100)

**Response (200 OK):**
```json
{
  "tourist_id": "96433ce915a95eaaf4fb6a6500ad9b82",
  "tourist_name": "ball",
  "locations": [
    {
      "id": 5716,
      "lat": 28.6129,
      "lon": 77.2295,
      "speed": 15.5,
      "altitude": 216.0,
      "accuracy": 10.0,
      "safety_score": 100,
      "timestamp": "2025-10-02T08:14:00+00:00"
    },
    {
      "id": 5715,
      "lat": 28.6120,
      "lon": 77.2280,
      "speed": 12.0,
      "altitude": 215.0,
      "accuracy": 8.0,
      "safety_score": 100,
      "timestamp": "2025-10-02T08:13:00+00:00"
    }
  ],
  "total": 50,
  "time_range": {
    "start": "2025-10-01T08:14:00+00:00",
    "end": "2025-10-02T08:14:00+00:00"
  }
}
```

---

## 🚨 Alert Management

### 7. Get Recent Alerts

**Endpoint:** `GET /api/authority/alerts/recent?limit=50&severity=all`  
**Authentication:** Required (Authority)

**Query Parameters:**
- `limit` (optional): Number of alerts (default: 50)
- `severity` (optional): Filter by severity (`low`, `medium`, `high`, `critical`, `all`)

**Response (200 OK):**
```json
{
  "alerts": [
    {
      "id": 124,
      "tourist_id": "96433ce915a95eaaf4fb6a6500ad9b82",
      "tourist_name": "ball",
      "tourist_phone": "+919876543210",
      "type": "sos",
      "severity": "critical",
      "title": "SOS Emergency Alert",
      "description": "Tourist triggered SOS",
      "location": {
        "lat": 28.6129,
        "lon": 77.2295,
        "address": "India Gate, New Delhi"
      },
      "timestamp": "2025-10-02T08:14:13+00:00",
      "status": "pending",
      "acknowledged_by": null
    },
    {
      "id": 123,
      "tourist_id": "tourist456xyz789abc",
      "tourist_name": "Jane Tourist",
      "tourist_phone": "+919876543211",
      "type": "geofence",
      "severity": "high",
      "title": "Restricted Area Warning",
      "description": "Tourist entered restricted zone",
      "location": {
        "lat": 28.7000,
        "lon": 77.3000,
        "address": "Border Area"
      },
      "timestamp": "2025-10-02T07:45:00+00:00",
      "status": "acknowledged",
      "acknowledged_by": "Officer Demo"
    }
  ],
  "total": 2,
  "summary": {
    "critical": 1,
    "high": 1,
    "medium": 0,
    "low": 0
  }
}
```

---

### 8. Get Tourist Alerts

**Endpoint:** `GET /api/authority/tourist/{tourist_id}/alerts?limit=20`  
**Authentication:** Required (Authority)

**Query Parameters:**
- `limit` (optional): Number of alerts (default: 20)

**Response (200 OK):**
```json
{
  "tourist_id": "96433ce915a95eaaf4fb6a6500ad9b82",
  "tourist_name": "ball",
  "alerts": [
    {
      "id": 124,
      "type": "sos",
      "severity": "critical",
      "title": "SOS Emergency Alert",
      "description": "Tourist triggered SOS",
      "location": {
        "lat": 28.6129,
        "lon": 77.2295
      },
      "timestamp": "2025-10-02T08:14:13+00:00",
      "status": "pending"
    }
  ],
  "total": 1
}
```

---

### 9. Acknowledge Alert

**Endpoint:** `POST /api/authority/alert/{alert_id}/acknowledge`  
**Authentication:** Required (Authority)

**Request Body (optional):**
```json
{
  "notes": "Patrol unit dispatched to location"
}
```

**Response (200 OK):**
```json
{
  "status": "acknowledged",
  "alert_id": 124,
  "acknowledged_by": "Officer Demo",
  "acknowledged_at": "2025-10-02T08:20:00+00:00",
  "notes": "Patrol unit dispatched to location"
}
```

---

### 10. Close/Resolve Alert

**Endpoint:** `POST /api/authority/alert/{alert_id}/close`  
**Authentication:** Required (Authority)

**Request Body:**
```json
{
  "resolution": "Tourist located and safe. False alarm.",
  "action_taken": "Patrol unit verified tourist safety"
}
```

**Response (200 OK):**
```json
{
  "status": "closed",
  "alert_id": 124,
  "closed_by": "Officer Demo",
  "closed_at": "2025-10-02T08:30:00+00:00",
  "resolution": "Tourist located and safe. False alarm.",
  "action_taken": "Patrol unit verified tourist safety"
}
```

---

## 📢 Broadcast System

The broadcast system allows authorities to send emergency notifications to tourists via Firebase Cloud Messaging (FCM) push notifications. Tourists automatically receive these on their registered devices.

**Severity Levels:**
- `LOW`: Information/Advisory
- `MEDIUM`: Caution/Warning
- `HIGH`: Urgent/Danger
- `CRITICAL`: Extreme danger/Emergency

---

### 11. Broadcast to Radius Area

**Endpoint:** `POST /api/broadcast/radius`  
**Authentication:** Required (Authority)

**Description:** Send emergency broadcast to tourists within a circular radius of a center point.

**Request Body:**
```json
{
  "center_latitude": 28.6129,
  "center_longitude": 77.2295,
  "radius_km": 5.0,
  "title": "⚠️ Heavy Traffic Alert",
  "message": "Heavy traffic expected near India Gate area. Please plan accordingly.",
  "severity": "MEDIUM",
  "alert_type": "traffic_disruption",
  "action_required": "plan_alternate_route",
  "expires_at": "2025-10-02T20:00:00+00:00"
}
```

**Response (200 OK):**
```json
{
  "broadcast_id": "BCAST-20251002-090412",
  "status": "success",
  "tourists_notified": 4,
  "devices_notified": 7,
  "area_covered": "5.0km radius from (28.6129, 77.2295)",
  "severity": "medium",
  "timestamp": "2025-10-02T09:04:12.811925+00:00"
}
```

---

### 12. Broadcast to Zone

**Endpoint:** `POST /api/broadcast/zone`  
**Authentication:** Required (Authority)

**Description:** Send emergency broadcast to tourists in a specific safety zone.

**Request Body:**
```json
{
  "zone_id": 31,
  "title": "🚧 Zone Maintenance Alert",
  "message": "This zone is temporarily closed for maintenance work. Please avoid the area.",
  "severity": "HIGH",
  "alert_type": "zone_closure",
  "action_required": "avoid_area"
}
```

**Response (200 OK):**
```json
{
  "broadcast_id": "BCAST-20251002-091523",
  "status": "success",
  "zone_name": "Test Zone - India Gate",
  "tourists_notified": 12,
  "devices_notified": 15,
  "timestamp": "2025-10-02T09:15:23.456789+00:00"
}
```

---

### 13. Broadcast to Region

**Endpoint:** `POST /api/broadcast/region`  
**Authentication:** Required (Authority)

**Description:** Send emergency broadcast to tourists within a geographic bounding box region.

**Request Body:**
```json
{
  "region_bounds": {
    "min_lat": 28.5000,
    "max_lat": 28.7000,
    "min_lon": 77.1000,
    "max_lon": 77.3000
  },
  "title": "🌧️ Weather Advisory",
  "message": "Heavy rainfall expected in Delhi NCR region. Carry rain gear and avoid flooding areas.",
  "severity": "MEDIUM",
  "alert_type": "natural_disaster",
  "action_required": "stay_alert"
}
```

**Response (200 OK):**
```json
{
  "broadcast_id": "BCAST-20251002-092145",
  "status": "success",
  "region": "28.5000-28.7000 lat, 77.1000-77.3000 lon",
  "tourists_notified": 56,
  "devices_notified": 68,
  "timestamp": "2025-10-02T09:21:45.123456+00:00"
}
```

---

### 14. Broadcast to All Tourists

**Endpoint:** `POST /api/broadcast/all`  
**Authentication:** Required (Authority)

**Description:** Send emergency broadcast to ALL active tourists in the system.

**Request Body:**
```json
{
  "title": "🚨 General Safety Advisory",
  "message": "Please carry valid ID and emergency contacts at all times. Stay safe!",
  "severity": "LOW",
  "alert_type": "general_advisory",
  "action_required": "follow_guidelines"
}
```

**Response (200 OK):**
```json
{
  "broadcast_id": "BCAST-20251002-090410",
  "status": "success",
  "scope": "all_tourists",
  "tourists_notified": 77,
  "devices_notified": 8,
  "timestamp": "2025-10-02T09:04:10.621646+00:00"
}
```

---

### 15. Get Broadcast History

**Endpoint:** `GET /api/broadcast/history?limit=50&offset=0`  
**Authentication:** Required (Authority)

**Query Parameters:**
- `limit` (optional): Number of broadcasts (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response (200 OK):**
```json
{
  "broadcasts": [
    {
      "broadcast_id": "BCAST-20251002-090414",
      "type": "all",
      "title": "🔴 EMERGENCY: Weather Alert",
      "severity": "critical",
      "tourists_notified": 77,
      "devices_notified": 8,
      "acknowledgments": 5,
      "sent_at": "2025-10-02T09:04:14.984343+00:00"
    },
    {
      "broadcast_id": "BCAST-20251002-090412",
      "type": "radius",
      "title": "⚠️ Heavy Traffic Alert",
      "severity": "medium",
      "tourists_notified": 4,
      "devices_notified": 7,
      "acknowledgments": 2,
      "sent_at": "2025-10-02T09:04:12.811925+00:00"
    }
  ],
  "total": 2
}
```

---

### 16. Get Broadcast Details

**Endpoint:** `GET /api/broadcast/{broadcast_id}`  
**Authentication:** Required (Authority)

**Description:** Get detailed information about a specific broadcast including acknowledgments.

**Response (200 OK):**
```json
{
  "broadcast_id": "BCAST-20251002-090410",
  "type": "all",
  "title": "🚨 General Safety Advisory",
  "message": "Please carry valid ID and emergency contacts at all times. Stay safe!",
  "severity": "low",
  "alert_type": null,
  "action_required": null,
  "tourists_notified": 77,
  "devices_notified": 8,
  "acknowledgment_count": 1,
  "acknowledgment_rate": "1.3%",
  "sent_at": "2025-10-02T09:04:10.621646+00:00",
  "expires_at": null,
  "acknowledgments": [
    {
      "tourist_id": "96433ce915a95eaaf4fb6a6500ad9b82",
      "status": "safe",
      "acknowledged_at": "2025-10-02T09:04:21.429520+00:00",
      "location": {
        "lat": 28.6129,
        "lon": 77.2295
      },
      "notes": "I am safe and indoors. Thank you for the alert."
    }
  ]
}
```

---

## 📝 E-FIR Management

### 17. Get All E-FIR Reports

**Endpoint:** `GET /api/authority/efir/all?status=all&limit=50`  
**Authentication:** Required (Authority)

**Query Parameters:**
- `status` (optional): Filter by status (`pending`, `acknowledged`, `investigating`, `resolved`, `closed`, `all`)
- `limit` (optional): Number of reports (default: 50)
- `incident_type` (optional): Filter by type

**Response (200 OK):**
```json
{
  "efirs": [
    {
      "efir_id": 8,
      "fir_number": "EFIR-20251002-T96433ce9-1759373055",
      "tourist_id": "96433ce915a95eaaf4fb6a6500ad9b82",
      "tourist_name": "ball",
      "tourist_email": "ball@gmail.com",
      "tourist_phone": "+919876543210",
      "incident_type": "theft",
      "severity": "medium",
      "description": "My wallet was stolen from the hotel room...",
      "location": "Hotel Taj Palace, New Delhi",
      "witnesses": ["John Smith", "Hotel Staff"],
      "status": "pending",
      "filed_at": "2025-10-02T08:14:15+00:00",
      "blockchain_tx_id": "0x4329c2d1bcb2b747...",
      "blockchain_verified": true
    }
  ],
  "total": 1,
  "summary": {
    "pending": 1,
    "acknowledged": 0,
    "investigating": 0,
    "resolved": 0,
    "closed": 0
  }
}
```

---

### 16. Get E-FIR Details

**Endpoint:** `GET /api/authority/efir/{efir_id}`  
**Authentication:** Required (Authority)

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
      "email": "ball@gmail.com",
      "phone": "+919876543210",
      "emergency_contact": "Jane Doe",
      "emergency_phone": "+919876543211"
    },
    "handling_officer": null,
    "investigation_notes": []
  }
}
```

---

### 17. Update E-FIR Status

**Endpoint:** `PUT /api/authority/efir/{efir_id}/status`  
**Authentication:** Required (Authority)

**Request Body:**
```json
{
  "status": "acknowledged",
  "notes": "Case assigned to Officer Smith. Investigation started.",
  "assigned_officer": "Officer John Smith"
}
```

**Status Options:**
- `acknowledged`: FIR acknowledged by police
- `investigating`: Under investigation
- `resolved`: Case resolved
- `closed`: Case closed

**Response (200 OK):**
```json
{
  "success": true,
  "efir_id": 8,
  "status": "acknowledged",
  "updated_by": "Officer Demo",
  "updated_at": "2025-10-02T09:00:00+00:00",
  "notes": "Case assigned to Officer Smith. Investigation started."
}
```

---

### 18. Add Investigation Notes

**Endpoint:** `POST /api/authority/efir/{efir_id}/notes`  
**Authentication:** Required (Authority)

**Request Body:**
```json
{
  "note": "Reviewed CCTV footage. Suspect identified. Warrant issued.",
  "is_internal": false
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "note_id": 45,
  "efir_id": 8,
  "added_by": "Officer Demo",
  "added_at": "2025-10-02T10:30:00+00:00"
}
```

---

## 🗺️ Zone Management

### 19. Create Restricted Zone

**Endpoint:** `POST /api/authority/zones/create`  
**Authentication:** Required (Authority)

**Request Body:**
```json
{
  "name": "Military Area - Red Fort",
  "zone_type": "restricted",
  "description": "Restricted military zone - entry prohibited",
  "center_lat": 28.6562,
  "center_lon": 77.2410,
  "radius_meters": 500,
  "is_active": true
}
```

**Zone Types:**
- `safe`: Safe for tourists
- `caution`: Exercise caution
- `risky`: High risk area
- `restricted`: Entry prohibited

**Response (200 OK):**
```json
{
  "success": true,
  "zone_id": 46,
  "name": "Military Area - Red Fort",
  "zone_type": "restricted",
  "center": {
    "lat": 28.6562,
    "lon": 77.2410
  },
  "radius_meters": 500,
  "created_by": "Officer Demo",
  "created_at": "2025-10-02T11:00:00+00:00"
}
```

---

### 20. Update Zone

**Endpoint:** `PUT /api/authority/zones/{zone_id}`  
**Authentication:** Required (Authority)

**Request Body:**
```json
{
  "name": "Military Area - Red Fort (Updated)",
  "zone_type": "restricted",
  "description": "Updated description",
  "radius_meters": 750,
  "is_active": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "zone_id": 46,
  "name": "Military Area - Red Fort (Updated)",
  "updated_by": "Officer Demo",
  "updated_at": "2025-10-02T11:15:00+00:00"
}
```

---

### 21. Delete Zone

**Endpoint:** `DELETE /api/authority/zones/{zone_id}`  
**Authentication:** Required (Authority)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Zone deleted successfully",
  "zone_id": 46,
  "deleted_by": "Officer Demo",
  "deleted_at": "2025-10-02T11:30:00+00:00"
}
```

---

### 22. Get All Zones (Authority View)

**Endpoint:** `GET /api/authority/zones/list`  
**Authentication:** Required (Authority)

**Response (200 OK):**
```json
{
  "zones": [
    {
      "id": 46,
      "name": "Military Area - Red Fort",
      "type": "restricted",
      "description": "Restricted military zone",
      "center": {
        "lat": 28.6562,
        "lon": 77.2410
      },
      "radius_meters": 500,
      "is_active": true,
      "created_by": "Officer Demo",
      "created_at": "2025-10-02T11:00:00+00:00",
      "tourists_in_zone": 0,
      "recent_violations": 2
    }
  ],
  "total": 45
}
```

---

## 🔴 WebSocket (Real-time Alerts)

### 23. Connect to WebSocket

**Endpoint:** `WS /api/authority/ws/alerts`  
**Authentication:** Required (Token in query param)

**Connection URL:**
```
ws://localhost:8000/api/authority/ws/alerts?token=YOUR_JWT_TOKEN
```

**JavaScript Example:**
```javascript
const token = 'YOUR_JWT_TOKEN';
const ws = new WebSocket(`ws://localhost:8000/api/authority/ws/alerts?token=${token}`);

ws.onopen = () => {
  console.log('Connected to alert stream');
};

ws.onmessage = (event) => {
  const alert = JSON.parse(event.data);
  console.log('New alert received:', alert);
  
  // Handle different alert types
  switch(alert.type) {
    case 'sos':
      handleSOSAlert(alert);
      break;
    case 'geofence':
      handleGeofenceAlert(alert);
      break;
    case 'anomaly':
      handleAnomalyAlert(alert);
      break;
  }
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('Disconnected from alert stream');
  // Implement reconnection logic
};
```

**Message Format (Real-time Alert):**
```json
{
  "type": "alert",
  "event": "new_alert",
  "data": {
    "alert_id": 124,
    "tourist_id": "96433ce915a95eaaf4fb6a6500ad9b82",
    "tourist_name": "ball",
    "tourist_phone": "+919876543210",
    "alert_type": "sos",
    "severity": "critical",
    "title": "SOS Emergency Alert",
    "description": "Tourist triggered SOS",
    "location": {
      "lat": 28.6129,
      "lon": 77.2295,
      "address": "India Gate, New Delhi"
    },
    "timestamp": "2025-10-02T08:14:13+00:00",
    "requires_immediate_action": true
  }
}
```

**Message Format (Location Update):**
```json
{
  "type": "location_update",
  "event": "tourist_moved",
  "data": {
    "tourist_id": "96433ce915a95eaaf4fb6a6500ad9b82",
    "tourist_name": "ball",
    "location": {
      "lat": 28.6129,
      "lon": 77.2295
    },
    "safety_score": 100,
    "risk_level": "low",
    "timestamp": "2025-10-02T08:14:00+00:00"
  }
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
| 403 | Forbidden | Insufficient permissions (not authority role) |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation error |
| 500 | Internal Server Error | Server error |

---

## 🔒 Security & Permissions

1. **Role-Based Access:** All endpoints require `authority` role
2. **JWT Expiry:** Tokens expire after 24 hours
3. **Audit Logging:** All actions are logged with officer ID
4. **Data Privacy:** Tourist personal data access is logged
5. **Jurisdiction:** Officers can only act within their jurisdiction (future feature)

---

## 🧪 Testing with cURL

### Login
```bash
curl -X POST http://localhost:8000/api/authority/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@gmail.com","password":"demo@123456"}'
```

### Get Active Tourists
```bash
curl -X GET http://localhost:8000/api/authority/tourists/active \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Broadcast (ALL Tourists)
```bash
curl -X POST http://localhost:8000/api/broadcast/all \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "🚨 General Safety Advisory",
    "message": "Please carry valid ID and emergency contacts at all times. Stay safe!",
    "severity": "LOW",
    "alert_type": "general_advisory",
    "action_required": "follow_guidelines"
  }'
```

### Create Broadcast (RADIUS)
```bash
curl -X POST http://localhost:8000/api/broadcast/radius \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "center_latitude": 28.6129,
    "center_longitude": 77.2295,
    "radius_km": 5.0,
    "title": "⚠️ Heavy Traffic Alert",
    "message": "Heavy traffic expected near India Gate area. Please plan accordingly.",
    "severity": "MEDIUM",
    "alert_type": "traffic_disruption",
    "action_required": "plan_alternate_route"
  }'
```

### Acknowledge Alert
```bash
curl -X POST http://localhost:8000/api/authority/alert/124/acknowledge \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Patrol unit dispatched"}'
```

---

## 📱 Police Dashboard Integration

### React Dashboard Example

```javascript
import { useState, useEffect } from 'react';

const PoliceDashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [tourists, setTourists] = useState([]);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    // Connect to WebSocket
    const token = localStorage.getItem('auth_token');
    const websocket = new WebSocket(
      `ws://localhost:8000/api/authority/ws/alerts?token=${token}`
    );

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'alert') {
        setAlerts(prev => [data.data, ...prev]);
        // Show notification
        showNotification(data.data);
      }
    };

    setWs(websocket);

    // Fetch initial data
    fetchActiveTourists();
    fetchRecentAlerts();

    return () => websocket.close();
  }, []);

  const fetchActiveTourists = async () => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(
      'http://localhost:8000/api/authority/tourists/active',
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    const data = await response.json();
    setTourists(data.active_tourists);
  };

  const acknowledgeAlert = async (alertId) => {
    const token = localStorage.getItem('auth_token');
    await fetch(
      `http://localhost:8000/api/authority/alert/${alertId}/acknowledge`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes: 'Acknowledged' })
      }
    );
  };

  return (
    <div>
      <h1>Police Dashboard</h1>
      
      {/* Active Tourists Map */}
      <TouristMap tourists={tourists} />
      
      {/* Real-time Alerts */}
      <AlertsList 
        alerts={alerts} 
        onAcknowledge={acknowledgeAlert}
      />
      
      {/* Broadcast Panel */}
      <BroadcastPanel />
    </div>
  );
};
```

---

## 🎯 Best Practices

1. **WebSocket Connection:** Keep alive, reconnect on disconnect
2. **Alert Handling:** Acknowledge critical alerts immediately
3. **Broadcast Usage:** Use appropriate severity levels
4. **E-FIR Management:** Update status regularly
5. **Zone Updates:** Keep restricted zones current
6. **Data Refresh:** Poll active tourists every 30-60 seconds
7. **Audit Trail:** Document all actions with notes

---

## 📞 Emergency Response Workflow

1. **SOS Alert Received** → WebSocket notification
2. **Acknowledge Alert** → `POST /authority/alert/{id}/acknowledge`
3. **Track Tourist** → `GET /authority/tourist/{id}/track`
4. **Dispatch Unit** → (External system integration)
5. **Update Status** → Add notes to alert
6. **Close Alert** → `POST /authority/alert/{id}/close`

---

**Last Updated:** October 2, 2025  
**API Version:** 1.0.0  
**Test Account:** `demo@gmail.com` / `demo@123456`
