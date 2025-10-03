# Real-Time Notification Troubleshooting

## How to Test & Debug

### 1. Check Browser Console
Open Developer Tools (F12) and look for these messages:

```
✅ Global WebSocket connected - persists across navigation
📨 Global alert received: {alert data}
🔍 Alert type: alert
✅ Adding alert to realtimeAlerts: {alert data}
📊 Updated realtimeAlerts count: X
🔔 AlertNotificationBridge: realtimeAlerts changed X
🚨 Showing new alert notification: {alert data}
📡 Dashboard: WebSocket realtimeAlerts updated X
✅ Dashboard: Adding X new alerts to list
```

### 2. Check WebSocket Connection

**In browser console, type:**
```javascript
// Check if WebSocket context exists
window.wsConnected = true;
```

**Or add this temporarily to Dashboard.jsx:**
```javascript
console.log('WebSocket realtimeAlerts:', realtimeAlerts);
console.log('WebSocket alertStats:', alertStats);
```

### 3. Manual Test Alert

**Trigger a test alert from backend or use this in console:**
```javascript
// Simulate incoming alert (for testing UI only)
const testAlert = {
  id: Date.now(),
  type: 'alert',
  severity: 'high',
  title: 'Test Alert',
  description: 'This is a test alert',
  tourist_name: 'Test Tourist',
  tourist_id: 123,
  timestamp: new Date().toISOString(),
  location: { address: 'Test Location' }
};

// This won't work if WebSocket isn't connected
```

### 4. Common Issues & Fixes

#### Issue: No console logs at all
**Cause:** WebSocket not connecting
**Fix:** Check these environment variables in `.env`:
```
VITE_WS_BASE_URL=ws://localhost:8000
VITE_WS_AUTO_CONNECT=true
```

#### Issue: "📨 Global alert received" but no toast
**Cause:** Toast system not initialized or alert type mismatch
**Fix:** 
1. Check alert has `type: 'alert'` or `type: 'new_alert'`
2. Verify ToastProvider is wrapping the app
3. Check for JavaScript errors in console

#### Issue: Toast shows but dashboard doesn't update
**Cause:** Dashboard useEffect not triggering
**Fix:**
1. Check if `realtimeAlerts` is actually changing (console.log it)
2. Verify Dashboard component is mounted
3. Check for duplicate alert IDs

#### Issue: Everything works but requires refresh
**Cause:** State not propagating or component not re-rendering
**Fix:**
1. Verify WebSocketProvider is wrapping Layout in App.jsx
2. Check that Dashboard is using `useWebSocketContext()`
3. Ensure no React.memo or shouldComponentUpdate blocking updates

### 5. Quick Debug Component

Add this to Dashboard.jsx temporarily to see live updates:

```javascript
// At top of Dashboard component
console.log('🔄 Dashboard render - realtimeAlerts:', realtimeAlerts.length);

// In the return statement, add this debug panel:
<div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs">
  <div>WebSocket Alerts: {realtimeAlerts.length}</div>
  <div>Recent Alerts: {recentAlerts.length}</div>
  <div>Last Update: {new Date().toLocaleTimeString()}</div>
</div>
```

### 6. Verify WebSocket URL

Check that your WebSocket server is running and accessible:
```bash
# In PowerShell
curl http://localhost:8000/health
```

### 7. Force Reconnect WebSocket

If WebSocket seems stuck:
1. Close browser tab completely
2. Reopen dashboard
3. Check console for connection logs

### 8. Network Tab Check

1. Open DevTools → Network tab
2. Filter by "WS" (WebSocket)
3. Should see active WebSocket connection
4. Click on it to see messages flowing

## Expected Behavior

When alert arrives:
1. ✅ Browser notification appears (if permission granted)
2. ✅ Toast notification slides in from top-right
3. ✅ Dashboard "Active Alerts" count increases
4. ✅ New alert appears at top of alerts list
5. ✅ No page refresh needed

## Still Not Working?

Check these files are correctly modified:
- `src/App.jsx` - has ToastProvider wrapper
- `src/layouts/Layout.jsx` - has AlertNotificationBridge
- `src/contexts/WebSocketContext.jsx` - updating realtimeAlerts
- `src/pages/Dashboard.jsx` - has useEffect for realtimeAlerts
- `src/components/AlertNotificationBridge.jsx` - tracking shown alerts
