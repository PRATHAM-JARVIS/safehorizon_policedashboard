# 🧪 Testing Guide - SafeHorizon Police Dashboard Fixes

## Quick Testing Steps

### 🔍 Issue 1: Alert Detail Modal Test

#### Test Steps:
1. **Navigate to Alerts Page**
   ```
   http://localhost:5173/alerts
   ```

2. **Click "See" Button (Eye Icon)**
   - Look for any alert in the table
   - Click the eye icon (👁️) in the Actions column
   - Modal should open with full alert details

3. **Verify Display:**
   - ✅ Alert ID shows: `#123`
   - ✅ Alert Type badge displays
   - ✅ Severity badge shows correct color
   - ✅ Tourist Name displays
   - ✅ Location shows: "Address" or coordinates
   - ✅ **Coordinates display: `48.8584, 2.2945`** (if available)
   - ✅ Description text appears
   - ✅ Status information (Acknowledged/Resolved)

4. **Test Actions:**
   - Click "Acknowledge" button
   - Click "Mark as Resolved" button
   - Click "Generate E-FIR" button
   - Click "View on Map" button
   - Click "Close" button

#### Expected Result:
```
✅ Modal opens immediately
✅ All fields populated with data
✅ Coordinates format: XX.XXXX, YY.YYYY
✅ Location shows human-readable text
✅ No "undefined" or "[object Object]" text
✅ Action buttons work without errors
```

#### Common Issues & Solutions:
| Issue | Solution |
|-------|----------|
| Coordinates show `undefined` | Check backend response format |
| Location shows `[object Object]` | Backend should return string or `{address: string}` |
| Modal doesn't open | Check console for JavaScript errors |
| Action buttons fail | Verify JWT token is valid |

---

### 🗺️ Issue 2: Tourist Detail Page Test

#### Test Steps:
1. **Navigate to Tourists Page**
   ```
   http://localhost:5173/tourists
   ```

2. **Click on Any Tourist Row**
   - Or navigate directly: `http://localhost:5173/tourists/1`
   - Page should load with comprehensive information

3. **Verify Live Location Section** (NEW!)
   - ✅ **Green border card at top**
   - ✅ Title: "Live Location" with ACTIVE badge
   - ✅ Current GPS coordinates display
   - ✅ Safety Score badge with percentage
   - ✅ Zone Status: "✓ Safe Zone" or "⚠️ Restricted Zone"
   - ✅ Current zone name (if applicable)

4. **Verify Profile Information**
   - ✅ Tourist name and email
   - ✅ Phone number (or "Not provided")
   - ✅ Safety score badge
   - ✅ Last seen timestamp

5. **Verify Safety Timeline** (NEW!)
   - ✅ Section titled "Safety Score Timeline"
   - ✅ List of historical safety scores
   - ✅ Each entry shows:
     - Timestamp
     - Safety score percentage
     - Risk level (high/medium/low)

6. **Verify Location History**
   - ✅ Table with GPS coordinates
   - ✅ Speed, altitude, accuracy columns
   - ✅ Timestamps for each location
   - ✅ Last 50 locations displayed

7. **Verify Movement Analysis**
   - ✅ Total distance traveled (km)
   - ✅ Average speed (km/h)
   - ✅ Max speed (km/h)
   - ✅ Movement type (walking/driving/stationary)
   - ✅ Behavior assessment badges

8. **Test Emergency Contacts**
   - ✅ Warning message displays
   - ✅ Confirmation checkbox required
   - ✅ "View Emergency Contacts" button disabled until checked
   - ✅ Contacts display after confirmation

#### Expected Result:
```
✅ Live Location card shows at top (green border)
✅ Real-time GPS: 48.8584, 2.2945
✅ Safety Score: 85% (Safe)
✅ Zone Status badge: ✓ Safe Zone or ⚠️ Restricted
✅ Safety Timeline with 10+ historical entries
✅ Location history table populated
✅ Movement metrics show real numbers
✅ Emergency contacts require confirmation
```

#### Screenshot Checklist:
Take screenshots of:
- [ ] Live Location section (green card)
- [ ] Safety Timeline list
- [ ] Location history table
- [ ] Movement analysis metrics
- [ ] Emergency contacts warning

---

## API Response Testing

### Test with Browser DevTools

1. **Open DevTools** (F12)
2. **Go to Network Tab**
3. **Filter by "Fetch/XHR"**
4. **Navigate to Tourist Detail Page**

#### Expected API Calls:

```http
GET /api/tourist/{id}/profile
Response: {
  tourist: {...},
  statistics: {...},
  current_trip: {...}
}
```

```http
GET /api/tourist/{id}/location/current
Response: {
  location: { latitude, longitude },
  safety_score: 85,
  zone_status: {
    in_restricted_zone: false,
    current_zone: { name: "..." }
  }
}
```

```http
GET /api/tourist/{id}/location/history?hours_back=24&limit=50
Response: {
  locations: [{lat, lon, speed, altitude, accuracy, timestamp}, ...],
  statistics: {...}
}
```

```http
GET /api/tourist/{id}/safety-timeline
Response: {
  timeline: [{timestamp, safety_score, risk_level}, ...]
}
```

```http
GET /api/tourist/{id}/movement-analysis?hours=24
Response: {
  movement_metrics: {
    total_distance_km: 12.5,
    average_speed_kmh: 3.2,
    max_speed_kmh: 8.1,
    movement_type: "walking"
  },
  behavior_assessment: {...}
}
```

---

## Error Testing

### Test Graceful Degradation

#### Scenario 1: API Endpoint Not Available
```javascript
// If new endpoint fails, should fallback to old API
getTouristProfile() fails → trackTourist() used instead
```

**Expected Behavior:**
- ✅ Page still loads
- ✅ Basic tourist info displays
- ✅ No JavaScript errors in console
- ⚠️ New features may not show (Live Location, Safety Timeline)

#### Scenario 2: Invalid Tourist ID
```
Navigate to: /tourists/99999 (non-existent)
```

**Expected Behavior:**
- ✅ "Tourist not found" message displays
- ✅ "Back to Tourists" button works
- ✅ No infinite loading spinner

#### Scenario 3: Network Error
```javascript
// Simulate by throttling network in DevTools
Network: Offline
```

**Expected Behavior:**
- ✅ Loading spinner shows
- ✅ After timeout: Error message displays
- ✅ "Retry" button appears
- ✅ Refresh button works

---

## Browser Compatibility Testing

Test on multiple browsers:

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest | ✅ Primary |
| Firefox | Latest | ✅ Test |
| Safari | Latest | ✅ Test |
| Edge | Latest | ✅ Test |

### Mobile Responsive Testing

Test breakpoints:
- 📱 **Mobile**: 375px - 767px
- 📱 **Tablet**: 768px - 1023px
- 💻 **Desktop**: 1024px+

---

## Performance Testing

### Metrics to Check

1. **Initial Load Time**
   - Target: < 2 seconds
   - Check: Network tab "Load" time

2. **API Response Time**
   - Target: < 500ms per endpoint
   - Check: Network tab individual request times

3. **Real-time Updates**
   - Auto-refresh every 10 seconds
   - Should not cause UI flicker

4. **Memory Usage**
   - Check: DevTools Performance monitor
   - Should not increase over time (no memory leaks)

---

## Console Error Checking

### No Errors Should Appear:
```
✅ No "Cannot read property of undefined"
✅ No "Failed to fetch" (unless network issue)
✅ No CORS errors
✅ No 401 Unauthorized (unless token expired)
✅ No React warning messages
```

### Expected Console Messages:
```javascript
// These are OK:
"Failed to fetch profile, falling back to tracking" // When new API unavailable
"Failed to fetch current location" // When GPS data unavailable
```

---

## Security Testing

### Emergency Contacts Access
1. Try to view emergency contacts
2. Verify checkbox is required
3. Check warning message displays
4. Confirm contacts only show after checkbox

### Authentication Testing
1. Clear localStorage
2. Try to access tourist detail page
3. Should redirect to login
4. After login, should return to page

---

## Automated Testing Commands

```bash
# Install dependencies
npm install

# Run linter
npm run lint

# Run type checking (if using TypeScript)
npm run type-check

# Build production bundle
npm run build

# Preview production build
npm run preview
```

---

## Test Data Setup

### Mock Data for Testing

Create test tourists with:
- ✅ Various safety scores (0-100)
- ✅ Different zone statuses (safe/restricted)
- ✅ Multiple location history points
- ✅ Different alert types
- ✅ Emergency contacts (with consent)

### Backend Setup Required

Ensure backend has:
```python
# Tourist with ID 1
{
  "id": 1,
  "name": "Test Tourist",
  "email": "test@example.com",
  "phone": "+33123456789",
  "safety_score": 85,
  "current_location": {
    "latitude": 48.8584,
    "longitude": 2.2945
  },
  "zone_status": {
    "in_restricted_zone": false,
    "current_zone": {"name": "Eiffel Tower Area"}
  }
}
```

---

## Issue Reporting Template

If you find a bug, report using this format:

```markdown
## Bug Report

### Issue Description
[Brief description]

### Steps to Reproduce
1. Navigate to...
2. Click on...
3. Observe...

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Screenshots
[Attach screenshots]

### Console Errors
[Copy any error messages]

### Environment
- Browser: Chrome 118
- OS: Windows 11
- Date: October 1, 2025
```

---

## Success Criteria

All tests pass when:
- ✅ Alert modal shows complete information
- ✅ Tourist detail page displays all new sections
- ✅ Live Location section appears with data
- ✅ Safety Timeline shows historical scores
- ✅ No JavaScript errors in console
- ✅ All API calls succeed (or gracefully fail)
- ✅ Responsive on mobile/tablet/desktop
- ✅ Emergency contacts require confirmation
- ✅ Real-time updates work every 10 seconds

---

**Testing Status**: Ready for QA  
**Date**: October 1, 2025  
**Version**: 1.0.0
