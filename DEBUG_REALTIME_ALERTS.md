# Real-Time Alert System - Debug & Test Guide

## ✅ What Was Implemented

### 1. **Toast Notification System**
- File: `src/components/ui/toast.jsx`
- Shows colorful animated notifications in top-right corner
- Auto-dismisses or can be manually closed

### 2. **Alert Notification Bridge**
- File: `src/components/AlertNotificationBridge.jsx`
- Connects WebSocket alerts → Toast notifications
- Tracks shown alerts to prevent duplicates
- Added console logging for debugging

### 3. **Dashboard Real-Time Updates**
- File: `src/pages/Dashboard.jsx`
- New `useEffect` merges WebSocket alerts with existing list
- Updates stats automatically
- Shows debug panel in development mode

### 4. **WebSocket Enhanced Logging**
- File: `src/contexts/WebSocketContext.jsx`
- Added detailed console logs for every alert
- Tracks alert type and count

### 5. **App-Wide Toast Provider**
- File: `src/App.jsx`
- ToastProvider wraps entire app
- AlertNotificationBridge in Layout.jsx

---

## 🧪 How to Test

### Step 1: Open Browser Console (F12)
Look for these logs when dashboard loads:
```
✅ Global WebSocket connected - persists across navigation
📊 [WebSocketProvider] Environment check: {API_URL, WS_URL, ...}
```

### Step 2: Check Debug Panel
- Open http://localhost:5173/dashboard
- Look at **bottom-left corner** for black debug panel showing:
  - WebSocket Alerts count
  - Recent Alerts count  
  - Stats Today count
  - Last Render time
  - Latest Alert info

### Step 3: Trigger Test Alert
From your backend, send a WebSocket message with this format:
```json
{
  "type": "alert",
  "id": 12345,
  "title": "Test Alert",
  "description": "Testing real-time notifications",
  "severity": "high",
  "tourist_name": "John Doe",
  "tourist_id": 100,
  "timestamp": "2025-10-03T10:30:00Z",
  "location": {
    "address": "123 Main St"
  }
}
```

### Step 4: Watch for Updates
When alert arrives, you should see:
1. ✅ **Console logs:**
   ```
   📨 Global alert received: {alert data}
   🔍 Alert type: alert
   ✅ Adding alert to realtimeAlerts: {alert data}
   📊 Updated realtimeAlerts count: 1
   🔔 AlertNotificationBridge: realtimeAlerts changed 1
   🚨 Showing new alert notification: {alert data}
   📡 Dashboard: WebSocket realtimeAlerts updated 1
   ✅ Dashboard: Adding 1 new alerts to list
   ```

2. ✅ **Toast notification** appears top-right (colored by severity)

3. ✅ **Debug panel updates** (WebSocket Alerts count increases)

4. ✅ **Alert appears** in "Active Alerts" list

5. ✅ **NO PAGE REFRESH** needed!

---

## 🐛 Troubleshooting

### Problem: No console logs at all
**Diagnosis:** WebSocket not connecting

**Solutions:**
1. Check backend WebSocket server is running
2. Verify `.env` file has:
   ```env
   VITE_WS_BASE_URL=ws://localhost:8000
   VITE_WS_AUTO_CONNECT=true
   ```
3. Check Network tab in DevTools for WS connection
4. Verify no CORS or firewall issues

### Problem: Logs show but no toast notification
**Diagnosis:** Toast system issue

**Check:**
1. Look for error: `useToast must be used within ToastProvider`
2. Verify `src/App.jsx` has `<ToastProvider>` wrapper
3. Check browser console for JavaScript errors
4. Verify `AlertNotificationBridge` is in `Layout.jsx`

### Problem: Toast shows but list doesn't update
**Diagnosis:** Dashboard state update issue

**Check:**
1. Debug panel shows "WebSocket Alerts" increasing?
2. Debug panel shows "Recent Alerts" increasing?
3. Console shows: "✅ Dashboard: Adding X new alerts to list"?
4. If yes to above but no visual change, try scrolling alerts list

### Problem: Works once then stops
**Diagnosis:** Alert ID tracking issue

**Fix:**
1. Each alert must have unique `id` or `alert_id`
2. Check AlertNotificationBridge isn't blocking duplicates incorrectly
3. Clear browser cache and reload

### Problem: Alerts appear after refresh only
**Diagnosis:** WebSocket disconnected or state not updating

**Check:**
1. Network tab → WS connection still active?
2. Console shows new alert logs when backend sends?
3. Try closing and reopening browser tab completely

---

## 🔧 Quick Fixes

### Force WebSocket Reconnect
```javascript
// In browser console
window.location.reload();
```

### Clear Alert History
```javascript
// In browser console (temporary fix)
localStorage.clear();
window.location.reload();
```

### Test Toast Manually
```javascript
// In browser console
const toast = { 
  type: 'alert', 
  alert: {
    title: 'Manual Test',
    severity: 'high',
    tourist_name: 'Test User',
    timestamp: new Date().toISOString()
  }
};
// This won't work without proper context, but shows toast structure
```

---

## 📋 Checklist

Before reporting "not working", verify:

- [ ] Backend WebSocket server is running
- [ ] Browser console shows WebSocket connected message
- [ ] Debug panel visible in bottom-left (development mode)
- [ ] Network tab shows active WS connection
- [ ] No JavaScript errors in console
- [ ] Tried closing/reopening tab
- [ ] Tested with a fresh alert (unique ID)
- [ ] Checked alert has required fields (type, id, title, etc.)

---

## 🎯 Expected Flow

```
Backend sends alert
    ↓
WebSocket receives message
    ↓
WebSocketContext updates realtimeAlerts state
    ↓
AlertNotificationBridge detects change
    ↓
Toast notification appears
    ↓
Dashboard useEffect triggers
    ↓
Alert list updates
    ↓
Debug panel shows new counts
```

---

## 📞 Still Need Help?

1. **Copy all console logs** from browser (F12 → Console)
2. **Screenshot debug panel** (bottom-left)
3. **Screenshot Network tab** showing WS connection
4. **Note:** When did it stop working? After what action?
5. **Share:** Backend alert payload structure

---

## 🗑️ Remove Debug Panel

When everything works, remove debug panel:
```javascript
// In src/pages/Dashboard.jsx, delete or comment out:
{import.meta.env.DEV && (
  <div className="fixed bottom-4 left-4 ...">
    Debug Panel
  </div>
)}
```
