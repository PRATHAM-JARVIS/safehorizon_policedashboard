# 🎨 Visual Connection Guide

## 🖥️ What You Should See

### **Login Screen**
```
┌─────────────────────────────────────────┐
│                                         │
│         🛡️ SafeHorizon                  │
│       Police Dashboard                  │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ Email                           │   │
│   │ ▶ authority@example.com         │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ Password                        │   │
│   │ ▶ ••••••••                      │   │
│   └─────────────────────────────────┘   │
│                                         │
│   [        Login        ]               │
│                                         │
└─────────────────────────────────────────┘
```

---

### **Dashboard - CONNECTED ✅**
```
┌───────────────────────────────────────────────────────────────┐
│ 📊 Dashboard              👤 Authority Name    🟢 Connected   │ ← Green dot here!
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Active   │  │ Alerts   │  │   SOS    │  │  Trips   │     │
│  │ Tourists │  │  Today   │  │  Active  │  │   Live   │     │
│  │   245    │  │    12    │  │     3    │  │    89    │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ Live Alerts Feed                    [Live] ←─────────── Blue badge
│  ├─────────────────────────────────────────────────────┤     │
│  │ 🔴 HIGH     Tourist T-123 in restricted zone        │     │
│  │            📍 Location: New Delhi                    │     │
│  │            ⏰ 2 minutes ago                          │     │
│  ├─────────────────────────────────────────────────────┤     │
│  │ 🟡 MEDIUM   Safety score drop detected             │     │
│  │            👤 Tourist T-456                         │     │
│  │            ⏰ 5 minutes ago                          │     │
│  ├─────────────────────────────────────────────────────┤     │
│  │ 🟢 LOW      Trip checkpoint missed                  │     │
│  │            📱 Tourist T-789                         │     │
│  │            ⏰ 8 minutes ago                          │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ 🗺️ Map View                                         │     │
│  │                                                     │     │
│  │    [Interactive map with markers]                  │     │
│  │    • Red zones (restricted areas)                  │     │
│  │    • Blue dots (tourist locations)                 │     │
│  │    • Orange markers (active alerts)                │     │
│  │                                                     │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

### **Dashboard - CONNECTING 🟡**
```
┌───────────────────────────────────────────────────────────────┐
│ 📊 Dashboard              👤 Authority Name    🟡 Connecting  │ ← Yellow pulsing
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Stats cards appear normally...                              │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ Live Alerts Feed                   [Connecting...] │     │
│  │                                                     │     │
│  │  ⏳ Establishing connection...                      │     │
│  │     Please wait...                                  │     │
│  │                                                     │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

### **Dashboard - DISCONNECTED ❌**
```
┌───────────────────────────────────────────────────────────────┐
│ 📊 Dashboard              👤 Authority Name    🔴 Disconnected│ ← Red dot
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Stats cards appear normally...                              │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ Live Alerts Feed                      [Offline]     │     │
│  │                                                     │     │
│  │  ⚠️ Connection lost                                 │     │
│  │     Retrying... (Attempt 2/5)                       │     │
│  │                                                     │     │
│  │  [Reconnect Now]                                    │     │
│  │                                                     │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## 🧪 Test Page (/ws-test)

### **All Tests Passing ✅**
```
┌─────────────────────────────────────────────────────────────┐
│                WebSocket Diagnostic Test                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Environment Variables                                      │
│  ━━━━━━━━━━━━━━━━━━━━━                                      │
│  ✅ VITE_WS_BASE_URL: ws://localhost:8000                   │
│  ✅ VITE_API_BASE_URL: http://localhost:8000/api            │
│  ✅ VITE_WS_AUTO_CONNECT: true                              │
│  ✅ VITE_WS_RECONNECT_DELAY: 3000                           │
│  ✅ VITE_WS_HEARTBEAT_INTERVAL: 30000                       │
│  ✅ VITE_WS_MAX_RECONNECT_ATTEMPTS: 5                       │
│                                                             │
│  Authentication Status                                      │
│  ━━━━━━━━━━━━━━━━━━━━━                                      │
│  ✅ Token found: Yes                                        │
│  ✅ Token length: 200 characters                            │
│  ✅ Token format: Valid JWT (3 parts)                       │
│  ✅ Token preview: eyJhbGci...                              │
│                                                             │
│  WebSocket URL                                              │
│  ━━━━━━━━━━━━━━━━━━━━━                                      │
│  ✅ Base URL: ws://localhost:8000                           │
│  ✅ Endpoint: /api/alerts/subscribe                         │
│  ✅ Full URL: ws://localhost:8000/api/alerts/subscribe?...  │
│                                                             │
│  Connection Status                                          │
│  ━━━━━━━━━━━━━━━━━━━━━                                      │
│  🟢 Status: Connected                                       │
│  ✅ Ready State: OPEN (1)                                   │
│  ✅ Messages received: 12                                   │
│  ✅ Last message: 5 seconds ago                             │
│                                                             │
│  [ Test Connection ]  [ Disconnect ]  [ Clear Logs ]        │
│                                                             │
│  Live Logs                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━                                      │
│  [12:34:56] 🔌 Connecting to WebSocket...                   │
│  [12:34:57] ✅ Connected successfully                        │
│  [12:34:58] 💗 Heartbeat ping sent                          │
│  [12:34:58] 💗 Heartbeat pong received                      │
│  [12:35:00] 📨 Message received: {"type":"alert",...}       │
│  [12:35:10] 📨 Message received: {"type":"stats",...}       │
│  [12:35:28] 💗 Heartbeat ping sent                          │
│  [12:35:28] 💗 Heartbeat pong received                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### **Connection Failed ❌**
```
┌─────────────────────────────────────────────────────────────┐
│                WebSocket Diagnostic Test                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Environment Variables                                      │
│  ━━━━━━━━━━━━━━━━━━━━━                                      │
│  ✅ VITE_WS_BASE_URL: ws://localhost:8000                   │
│  ✅ VITE_API_BASE_URL: http://localhost:8000/api            │
│  ✅ (all others OK)                                         │
│                                                             │
│  Authentication Status                                      │
│  ━━━━━━━━━━━━━━━━━━━━━                                      │
│  ✅ Token found: Yes                                        │
│  ✅ Token format: Valid                                     │
│                                                             │
│  WebSocket URL                                              │
│  ━━━━━━━━━━━━━━━━━━━━━                                      │
│  ✅ URL constructed correctly                               │
│                                                             │
│  Connection Status                                          │
│  ━━━━━━━━━━━━━━━━━━━━━                                      │
│  🔴 Status: Disconnected                                    │
│  ❌ Ready State: CLOSED (3)                                 │
│  ❌ Error: Connection refused                               │
│                                                             │
│  [ Test Connection ]  [ Retry ]  [ Clear Logs ]             │
│                                                             │
│  Live Logs                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━                                      │
│  [12:34:56] 🔌 Connecting to WebSocket...                   │
│  [12:34:57] ❌ Connection error: Connection refused          │
│  [12:34:57] 🔄 Retrying in 3 seconds... (1/5)               │
│  [12:35:00] 🔌 Reconnecting...                              │
│  [12:35:01] ❌ Connection error: Connection refused          │
│  [12:35:01] 🔄 Retrying in 3 seconds... (2/5)               │
│                                                             │
│  ⚠️ Troubleshooting:                                         │
│  • Check if backend is running on port 8000                │
│  • Verify WebSocket endpoint exists at                     │
│    /api/alerts/subscribe                                   │
│  • Check backend logs for errors                           │
│  • Try manual test: wscat -c "ws://localhost:8000/..."    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 Browser Console

### **Success Logs ✅**
```javascript
// Console Output (F12)
console.log output:

🚀 [WebSocketProvider] Initializing WebSocket Provider...
📊 [WebSocketProvider] Environment check: {
  baseUrl: 'ws://localhost:8000',
  autoConnect: 'true',
  reconnectDelay: '3000'
}
🔍 [WebSocket] Building WebSocket URL...
🔗 [WebSocket] Token found, length: 200
🔗 [WebSocket] URL constructed for channel: authority-alerts
🔌 Connecting to WebSocket: ws://localhost:8000/api/alerts/subscribe
[WebSocket] Connection opened
✅ WebSocket connected successfully
✅ Global WebSocket connected - persists across navigation
💗 Sending heartbeat ping
💗 Heartbeat pong received
📨 Received message from server: {type: 'alert', severity: 'high', ...}
```

### **Error Logs ❌**
```javascript
// Console Output with Errors

❌ [WebSocket] No authentication token found
↪️ Reason: localStorage.getItem('safehorizon_auth_token') returned null
↪️ Fix: Login again to get a new token

// OR

🔌 Connecting to WebSocket: ws://localhost:8000/api/alerts/subscribe?token=...
❌ Connection error: WebSocket connection to 'ws://localhost:8000/...' failed
↪️ Reason: Backend not responding or endpoint doesn't exist
↪️ Fix: Check if backend server is running and WebSocket endpoint is configured

// OR

⚠️ VITE_WS_BASE_URL is undefined
↪️ Reason: Environment variable not loaded
↪️ Fix: Check .env file and restart dev server
```

---

## 📱 Network Tab (DevTools)

### **Successful WebSocket Connection**
```
Network Tab → WS Filter

Name                              Status    Type       Size
ws/api/alerts/subscribe           101       websocket  -

Headers:
Request URL: ws://localhost:8000/api/alerts/subscribe?token=eyJ...
Request Method: GET
Status Code: 101 Switching Protocols

Response Headers:
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: ...

Messages:
↗ {"type":"ping"}
↖ {"type":"pong"}
↖ {"type":"alert","data":{...}}
↗ {"type":"ping"}
↖ {"type":"pong"}
```

### **Failed WebSocket Connection**
```
Network Tab → WS Filter

Name                              Status    Type       Size
ws/api/alerts/subscribe           (failed)  websocket  -

Error: net::ERR_CONNECTION_REFUSED
or
Error: 404 Not Found
or  
Error: 401 Unauthorized
```

---

## 🎯 Navigation Test

### **Test Sequence:**
1. Start at Dashboard → 🟢 Green dot
2. Click "Tourists" → 🟢 Should stay green
3. Click "Alerts" → 🟢 Should stay green
4. Click "Zones" → 🟢 Should stay green
5. Click "Dashboard" → 🟢 Should stay green

### **✅ Success Pattern:**
```
Dashboard    🟢 ✅
  ↓
Tourists     🟢 ✅ (stayed connected!)
  ↓
Alerts       🟢 ✅ (stayed connected!)
  ↓
Zones        🟢 ✅ (stayed connected!)
  ↓
Dashboard    🟢 ✅ (stayed connected!)

Result: WebSocket persists across navigation! 🎉
```

### **❌ Failure Pattern (Old Behavior):**
```
Dashboard    🟢
  ↓
Tourists     🔴 (disconnected!)
  ↓
             Console: "🔌 Disconnecting WebSocket: Component unmounting"
```

---

## 🎨 Color Legend

### **Connection Indicator:**
- 🟢 **Green Solid** = Connected and stable
- 🟡 **Yellow Pulsing** = Connecting/Reconnecting
- 🔴 **Red Solid** = Disconnected/Failed

### **Badge Colors:**
- 🔵 **Blue "Live"** = Real-time connection active
- 🟠 **Orange "Offline"** = Connection lost
- ⚪ **Gray "Connecting"** = Attempting connection

### **Alert Severity:**
- 🔴 **Red Badge** = Critical/High severity
- 🟡 **Yellow Badge** = Medium/Warning
- 🟢 **Green Badge** = Low/Info

---

## 📸 What to Screenshot

If you need help, take screenshots of:

1. **Dashboard** - Show connection dot in top-right
2. **Console logs** - Show all WebSocket messages
3. **Test page** (`/ws-test`) - Show all test results
4. **Network tab** - Show WebSocket request (WS filter)

---

**Visual guide complete!**  
Use this to identify what's working and what needs fixing. 🎨
