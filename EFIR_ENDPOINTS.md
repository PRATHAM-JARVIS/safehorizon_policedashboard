# 🚨 E-FIR (Electronic First Information Report) API Documentation

Complete guide for E-FIR generation endpoints for tourists and authorities.

---

## 📋 Table of Contents

1. [Tourist E-FIR Endpoint](#tourist-e-fir-endpoint)
2. [Authority E-FIR Endpoint](#authority-e-fir-endpoint)
3. [E-FIR Data Structure](#e-fir-data-structure)
4. [Blockchain Verification](#blockchain-verification)

---

## 🧑 Tourist E-FIR Endpoint

### Generate E-FIR (Self-Report)

**POST** `/api/efir/generate`

Allows tourists to self-report incidents and generate an official E-FIR record on the blockchain.

**Authentication:** Required (Tourist JWT Token)

**Use Cases:**
- Report theft or loss of belongings
- Report harassment or assault
- Report any incident requiring police documentation
- Generate official FIR for insurance claims

### Request Body

```json
{
  "incident_description": "My passport and wallet were stolen from my hotel room while I was at breakfast",
  "incident_type": "theft",
  "location": "48.8584, 2.2945",
  "timestamp": "2025-10-01T08:30:00.000Z",
  "witnesses": ["John Smith (Room 405)", "Hotel Staff - Marie Dubois"],
  "additional_details": "The room door was not forced. Hotel has CCTV footage."
}
```

**Request Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `incident_description` | string | ✅ Yes | Detailed description of the incident |
| `incident_type` | string | ✅ Yes | Type: theft, assault, harassment, accident, other |
| `location` | string | ❌ Optional | GPS coordinates or address (e.g., "48.8584, 2.2945") |
| `timestamp` | datetime | ❌ Optional | When incident occurred (ISO 8601 format) |
| `witnesses` | array[string] | ❌ Optional | List of witness names/details |
| `additional_details` | string | ❌ Optional | Any additional information |

### Response (200 OK)

```json
{
  "message": "E-FIR generated successfully",
  "fir_number": "EFIR-2025-10-uuid-1727779800",
  "blockchain_tx_id": "a1b2c3d4e5f6...",
  "timestamp": "2025-10-01T08:30:00.000Z",
  "verification_url": "/api/blockchain/verify/a1b2c3d4e5f6",
  "status": "submitted",
  "reference_number": "REF-TOURIST-789"
}
```

**Response Fields:**

| Field | Description |
|-------|-------------|
| `fir_number` | Unique E-FIR identification number |
| `blockchain_tx_id` | Blockchain transaction ID (cryptographic proof) |
| `timestamp` | When the E-FIR was generated |
| `verification_url` | URL to verify E-FIR authenticity |
| `reference_number` | Internal reference for tracking |

### Example: cURL Request

```bash
curl -X POST "https://your-domain.com/api/efir/generate" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "incident_description": "Passport stolen",
    "incident_type": "theft",
    "location": "48.8584, 2.2945",
    "witnesses": ["Hotel Manager"]
  }'
```

### Example: JavaScript/Fetch

```javascript
const response = await fetch('https://your-domain.com/api/efir/generate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    incident_description: "My passport and wallet were stolen",
    incident_type: "theft",
    location: "48.8584, 2.2945",
    witnesses: ["John Smith", "Hotel Staff"]
  })
});

const data = await response.json();
console.log('E-FIR Number:', data.fir_number);
console.log('Blockchain TX:', data.blockchain_tx_id);
```

### Example: Python/Requests

```python
import requests

url = "https://your-domain.com/api/efir/generate"
headers = {
    "Authorization": f"Bearer {jwt_token}",
    "Content-Type": "application/json"
}
payload = {
    "incident_description": "My passport and wallet were stolen",
    "incident_type": "theft",
    "location": "48.8584, 2.2945",
    "witnesses": ["John Smith", "Hotel Staff"],
    "additional_details": "Room 305, occurred around 8:30 AM"
}

response = requests.post(url, json=payload, headers=headers)
efir_data = response.json()

print(f"E-FIR Number: {efir_data['fir_number']}")
print(f"Blockchain TX: {efir_data['blockchain_tx_id']}")
```

### Error Responses

**401 Unauthorized**
```json
{
  "detail": "Invalid or missing authentication token"
}
```

**404 Not Found**
```json
{
  "detail": "Tourist not found"
}
```

**500 Internal Server Error**
```json
{
  "detail": "Failed to generate E-FIR: Connection timeout"
}
```

---

## 👮 Authority E-FIR Endpoint

### Generate E-FIR (Official Report)

**POST** `/api/efir/generate`

Allows police authorities to generate official E-FIR records for acknowledged incidents.

**Authentication:** Required (Authority JWT Token)

**Use Cases:**
- Generate official FIR after investigating tourist alert
- Create formal police documentation for incidents
- Link E-FIR to existing incident/alert in system
- Provide legal documentation for tourists

### Request Body

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

**Request Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `alert_id` | integer | ✅ Yes | ID of the alert/incident being documented |
| `incident_description` | string | ✅ Yes | Description of the incident |
| `tourist_id` | string | ✅ Yes | UUID of the tourist |
| `incident_type` | string | ✅ Yes | Type: theft, assault, harassment, accident, other |
| `location` | string | ❌ Optional | GPS coordinates (e.g., "48.8584, 2.2945") |
| `witnesses` | array[string] | ❌ Optional | List of witness names |
| `additional_details` | string | ❌ Optional | Investigation notes |

### Response (200 OK)

```json
{
  "message": "E-FIR generated successfully",
  "fir_number": "EFIR-AUTH-2025-10-12345",
  "blockchain_tx_id": "a1b2c3d4e5f6...",
  "timestamp": "2025-10-01T11:00:00.000Z",
  "verification_url": "/api/blockchain/verify/a1b2c3d4e5f6"
}
```

**Response Fields:**

| Field | Description |
|-------|-------------|
| `fir_number` | Official E-FIR identification number |
| `blockchain_tx_id` | Blockchain transaction ID |
| `timestamp` | When the E-FIR was generated |
| `verification_url` | URL to verify E-FIR authenticity |

### Example: cURL Request

```bash
curl -X POST "https://your-domain.com/api/efir/generate" \
  -H "Authorization: Bearer AUTHORITY_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "alert_id": 789,
    "incident_description": "Tourist reported theft",
    "tourist_id": "uuid-string",
    "incident_type": "theft",
    "location": "48.8584, 2.2945",
    "additional_details": "Investigation completed. Case closed."
  }'
```

### Example: JavaScript/Fetch

```javascript
const response = await fetch('https://your-domain.com/api/efir/generate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${authorityJwtToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    alert_id: 789,
    incident_description: "Tourist reported theft",
    tourist_id: "uuid-string",
    incident_type: "theft",
    location: "48.8584, 2.2945",
    additional_details: "Investigation completed. Suspect identified from CCTV."
  })
});

const data = await response.json();
console.log('FIR Number:', data.fir_number);
console.log('Blockchain TX:', data.blockchain_tx_id);
```

### Example: Python/Requests

```python
import requests

url = "https://your-domain.com/api/efir/generate"
headers = {
    "Authorization": f"Bearer {authority_jwt_token}",
    "Content-Type": "application/json"
}
payload = {
    "alert_id": 789,
    "incident_description": "Tourist reported theft",
    "tourist_id": "uuid-string",
    "incident_type": "theft",
    "location": "48.8584, 2.2945",
    "additional_details": "Investigation completed. Case forwarded to detective unit."
}

response = requests.post(url, json=payload, headers=headers)
efir_data = response.json()

print(f"FIR Number: {efir_data['fir_number']}")
print(f"Blockchain TX: {efir_data['blockchain_tx_id']}")
```

### Error Responses

**401 Unauthorized**
```json
{
  "detail": "Invalid or missing authentication token"
}
```

**404 Not Found**
```json
{
  "detail": "Incident not found"
}
```

**500 Internal Server Error**
```json
{
  "detail": "Failed to generate E-FIR: Blockchain service unavailable"
}
```

---

## 📊 E-FIR Data Structure

### Tourist-Generated E-FIR

```json
{
  "fir_number": "EFIR-2025-10-tourist-uuid-1727779800",
  "incident_type": "theft",
  "incident_description": "Passport and wallet stolen",
  "tourist_id": "abc-123-def",
  "tourist_name": "John Doe",
  "tourist_email": "john.doe@example.com",
  "tourist_phone": "+1234567890",
  "location": "Hotel Grand Paris, Paris",
  "reported_by": "tourist_self_report",
  "timestamp": "2025-10-01T08:30:00.000Z",
  "witnesses": ["John Smith", "Hotel Staff"],
  "additional_details": "Room not forced. CCTV available.",
  "emergency_contact": "Jane Doe",
  "emergency_phone": "+0987654321"
}
```

### Authority-Generated E-FIR

```json
{
  "incident_number": "INC-2025-10-001234",
  "alert_type": "sos",
  "severity": "critical",
  "tourist_id": "abc-123-def",
  "tourist_name": "John Doe",
  "location": {
    "lat": 48.8584,
    "lon": 2.2945
  },
  "reported_by": "officer-uuid-456",
  "timestamp": "2025-10-01T09:15:00.000Z",
  "description": "Tourist reported theft at hotel",
  "resolution_notes": "Investigation completed. Suspect identified from CCTV."
}
```

---

## 🔐 Blockchain Verification

Every E-FIR is recorded on the blockchain with cryptographic verification.

### Verify E-FIR Authenticity

**GET** `/api/blockchain/verify/{tx_id}`

Verify the authenticity of an E-FIR using its blockchain transaction ID.

**Example:**
```bash
curl "https://your-domain.com/api/blockchain/verify/a1b2c3d4e5f6"
```

**Response:**
```json
{
  "valid": true,
  "tx_id": "a1b2c3d4e5f6...",
  "status": "confirmed",
  "chain_id": "safehorizon-efir-chain",
  "verified_at": "2025-10-01T10:00:00.000Z"
}
```

### Blockchain Features

✅ **Immutable Records** - E-FIRs cannot be altered once created  
✅ **Cryptographic Proof** - SHA-256 hashing for verification  
✅ **Tamper Detection** - Any modification invalidates the record  
✅ **Timestamp Verification** - Exact time of record creation  
✅ **Unique Transaction IDs** - Each E-FIR has a unique blockchain ID

---

## 🔄 Complete E-FIR Workflow

### Tourist Flow

1. **Incident Occurs** → Tourist experiences incident (theft, harassment, etc.)
2. **Self-Report** → Tourist calls `POST /api/efir/generate`
3. **Blockchain Record** → System generates immutable E-FIR on blockchain
4. **Notification** → Authorities are notified via WebSocket
5. **Reference Number** → Tourist receives FIR number and blockchain TX ID
6. **Verification** → Tourist can verify E-FIR authenticity anytime

### Authority Flow

1. **Alert Received** → Authority receives alert about tourist incident
2. **Acknowledge** → Officer calls `POST /api/alerts/{alert_id}/acknowledge`
3. **Investigate** → Officer investigates the incident
4. **Generate E-FIR** → Officer calls `POST /api/efir/generate` with alert_id
5. **Blockchain Record** → Official E-FIR created on blockchain
6. **Close Incident** → Officer calls `POST /api/alerts/{alert_id}/resolve`

---

## 📞 Support

**For Tourists:**
- Mobile App: Use "Report Incident" feature
- Emergency: Trigger SOS alert first, then generate E-FIR
- Help: support@safehorizon.com

**For Authorities:**
- Police Dashboard: Access all E-FIR features
- Training: Contact your department administrator
- Technical Support: police-support@safehorizon.com

---

## ⚠️ Important Notes

### For Tourists:
- ✅ Generate E-FIR **as soon as possible** after incident
- ✅ Include **all relevant details** and witnesses
- ✅ Save the **FIR number** and **blockchain TX ID** for records
- ✅ E-FIR is **legally valid** for insurance and police reports
- ❌ Cannot edit E-FIR after generation (blockchain immutability)

### For Authorities:
- ✅ E-FIR can only be generated for **acknowledged incidents**
- ✅ All E-FIRs are **permanently recorded** on blockchain
- ✅ Include complete **investigation notes** in the record
- ✅ E-FIR serves as **official police documentation**
- ❌ Cannot delete or modify E-FIR once created

---

## 🔗 Related Endpoints

- `POST /api/sos/trigger` - Trigger emergency SOS alert
- `POST /api/alerts/{alert_id}/acknowledge` - Acknowledge incident (Authority)
- `POST /api/alerts/{alert_id}/resolve` - Resolve incident (Authority)
- `GET /api/tourist/{tourist_id}/alerts` - Get tourist's alerts (Authority)
- `GET /api/notify/history` - Get notification history

---

**© 2025 SafeHorizon - Tourist Safety Platform**  
**E-FIR System v2.0** | Updated October 1, 2025 | Blockchain-Verified Documentation
