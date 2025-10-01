# 🔧 WebSocket Connection Troubleshooting Guide

## 🎯 Quick Test Steps

### **1. Access the WebSocket Test Page**
Navigate to: **http://localhost:5173/ws-test** (after logging in)

This dedicated test page will show you:
- ✅ Environment variable status
- ✅ Authentication token status  
- ✅ WebSocket URL construction
- ✅ Connection test results
- ✅ Live connection logs
- ✅ Real-time message display

### **2. Check Browser Console**
Open browser DevTools (F12) and look for these log messages:

```
🚀 [WebSocketProvider] Initializing WebSocket Provider...
📊 [WebSocketProvider] Environment check: {...}
🔍 [WebSocket] Building WebSocket URL...
🔗 [WebSocket] URL constructed for channel: authority-alerts
🔌 Connecting to WebSocket: ws://localhost:8000/api/alerts/subscribe
✅ WebSocket connected successfully
```

### **3. Verify Prerequisites**

#### **A. Backend Server Running**
```bash
# Make sure backend is running on port 8000
curl http://localhost:8000/api/health
# or visit http://localhost:8000/docs
```

#### **B. Authentication Token**
1. Log in to the dashboard
2. Open DevTools → Application → Local Storage
3. Check for `safehorizon_auth_token`
4. Token should exist and not be expired

#### **C. Environment Variables**
Check `.env` file:
```properties
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_BASE_URL=ws://localhost:8000
VITE_WS_AUTO_CONNECT=true
```

## 🔍 Common Issues & Solutions

### **Issue 1: "No authentication token found"**

**Symptoms:**
```
❌ [WebSocket] No authentication token found
```

**Solutions:**
1. **Log out and log back in**
   ```javascript
   // Clear old token
   localStorage.clear();
   // Refresh page and login again
   ```

2. **Check if login is working**
   - Open Network tab in DevTools
   - Look for `/api/auth/login-authority` request
   - Check if response contains a token

3. **Verify token storage**
   ```javascript
   // In browser console
   console.log(localStorage.getItem('safehorizon_auth_token'));
   ```

---

### **Issue 2: "Connection refused" or "Failed to connect"**

**Symptoms:**
```
❌ Connection error
WebSocket connection to 'ws://localhost:8000/api/alerts/subscribe' failed
```

**Solutions:**
1. **Verify backend is running**
   ```bash
   # Check if backend is accessible
   curl http://localhost:8000
   curl http://localhost:8000/api/health
   ```

2. **Check WebSocket endpoint**
   ```bash
   # Test WebSocket endpoint (use wscat tool)
   wscat -c ws://localhost:8000/api/alerts/subscribe?token=YOUR_TOKEN
   ```

3. **Verify port and URL**
   - Backend should be on port **8000**
   - Frontend should be on port **5173**
   - Check `.env` has correct `VITE_WS_BASE_URL`

4. **Check firewall/antivirus**
   - Temporarily disable to test
   - Add exception for ports 8000 and 5173

---

### **Issue 3: "Token expired" or "Policy Violation"**

**Symptoms:**
```
❌ Authentication failed (Policy Violation)
🔌 WebSocket closed: Code 1008
```

**Solutions:**
1. **Token expired - login again**
   ```javascript
   // Check token expiration in console
   const token = localStorage.getItem('safehorizon_auth_token');
   const payload = JSON.parse(atob(token.split('.')[1]));
   console.log('Token expires:', new Date(payload.exp * 1000));
   ```

2. **Backend validation issue**
   - Check backend logs for authentication errors
   - Verify JWT secret matches between backend and token

---

### **Issue 4: Connection status not showing**

**Symptoms:**
- No connection indicator in Dashboard
- Status always shows "Disconnected"

**Solutions:**
1. **Check if WebSocketProvider is mounted**
   ```javascript
   // In browser console
   console.log('Provider should be mounted after login');
   ```

2. **Verify Dashboard is using context**
   - Check Dashboard.jsx imports `useWebSocketContext`
   - Not `useWebSocket` directly

3. **Check for JavaScript errors**
   - Open browser console
   - Look for React errors or warnings
   - Fix any component errors first

---

### **Issue 5: WebSocket disconnects on navigation**

**Symptoms:**
```
🔌 Disconnecting WebSocket: Component unmounting
```

**Solutions:**
This should be FIXED now. If you still see this:

1. **Verify WebSocketProvider is in correct place**
   ```jsx
   // App.jsx should have this structure:
   <ProtectedRoute>
     <WebSocketProvider>
       <Layout />
     </WebSocketProvider>
   </ProtectedRoute>
   ```

2. **Check that Dashboard uses context**
   ```jsx
   // Dashboard.jsx should have:
   import { useWebSocketContext } from '../contexts/WebSocketContext.jsx';
   const { isConnected, ... } = useWebSocketContext();
   ```

---

### **Issue 6: Environment variables not loading**

**Symptoms:**
```
undefined for VITE_WS_BASE_URL
❌ VITE_WS_BASE_URL not set!
```

**Solutions:**
1. **Restart development server**
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

2. **Check .env file location**
   - Must be in project root
   - Not in `src/` folder
   - File must be named `.env` (not `.env.txt`)

3. **Variables must start with VITE_**
   ```properties
   # ✅ Correct
   VITE_WS_BASE_URL=ws://localhost:8000
   
   # ❌ Wrong (won't be loaded)
   WS_BASE_URL=ws://localhost:8000
   ```

4. **Check for syntax errors in .env**
   - No spaces around `=`
   - No quotes needed
   - One variable per line

---

## 🧪 Manual Connection Test

If automated tests fail, try manual connection:

### **JavaScript Console Test**
```javascript
// 1. Get token
const token = localStorage.getItem('safehorizon_auth_token');
console.log('Token exists:', !!token);

// 2. Build URL
const wsUrl = `ws://localhost:8000/api/alerts/subscribe?token=${token}`;
console.log('URL:', wsUrl);

// 3. Connect
const ws = new WebSocket(wsUrl);

ws.onopen = () => console.log('✅ Connected!');
ws.onerror = (err) => console.error('❌ Error:', err);
ws.onclose = (event) => console.log('🔌 Closed:', event.code, event.reason);
ws.onmessage = (msg) => console.log('📨 Message:', msg.data);
```

### **Expected Results**
```
Token exists: true
URL: ws://localhost:8000/api/alerts/subscribe?token=...
✅ Connected!
```

---

## 📊 Connection Status Indicators

### **Where to Look**

1. **Dashboard Header** (Top right)
   - 🟢 Green dot = Connected
   - 🟡 Yellow dot (pulsing) = Connecting
   - 🔴 Red dot = Disconnected

2. **Live Alerts Feed** (Dashboard card)
   - Badge shows "Live" (green) or "Offline" (red)
   - Connection retry counter if failing

3. **Browser Console**
   - Look for WebSocket logs
   - Check for error messages

### **What Each Status Means**

| Status | Meaning | Action Needed |
|--------|---------|---------------|
| 🟢 Connected | Working perfectly | None - enjoy! |
| 🟡 Connecting | Attempting connection | Wait 5 seconds |
| 🔴 Disconnected (0 attempts) | Not started yet | Check prerequisites |
| 🔴 Disconnected (1-5 attempts) | Retrying | Check backend server |
| 🔴 Disconnected (5+ attempts) | Failed | Run diagnostics |

---

## 🛠️ Backend Server Checklist

Your backend must support:

1. **WebSocket Endpoint**
   ```
   ws://localhost:8000/api/alerts/subscribe
   ```

2. **Query Parameter Authentication**
   ```
   ?token=JWT_TOKEN_HERE
   ```

3. **CORS Headers** (for development)
   ```python
   # FastAPI example
   from fastapi.middleware.cors import CORSMiddleware
   
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:5173"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

4. **WebSocket Message Format**
   ```json
   {
     "type": "alert",
     "id": "alert123",
     "severity": "high",
     "created_at": "2025-10-01T12:00:00Z",
     "tourist_id": "tourist456",
     ...
   }
   ```

5. **Heartbeat Support**
   - Respond to `ping` with `pong`
   - Or send periodic keep-alive messages

---

## 🚀 Quick Fix Commands

### **Reset Everything**
```bash
# 1. Clear browser storage
# In browser console:
localStorage.clear();
sessionStorage.clear();

# 2. Restart frontend
npm run dev

# 3. Restart backend (your backend command)
# Example:
uvicorn main:app --reload --port 8000
```

### **Install wscat (for testing)**
```bash
npm install -g wscat

# Test WebSocket connection
wscat -c "ws://localhost:8000/api/alerts/subscribe?token=YOUR_TOKEN"
```

### **Check ports in use**
```bash
# Windows
netstat -ano | findstr :8000
netstat -ano | findstr :5173

# Linux/Mac
lsof -i :8000
lsof -i :5173
```

---

## 📞 Getting Help

If issues persist:

1. **Check WebSocket Test Page**: `/ws-test`
2. **Copy all console logs**
3. **Copy test page results**
4. **Note exact error messages**
5. **Check backend logs**

### **Useful Information to Provide**
- Browser and version
- Operating system
- Backend framework and version  
- Full error messages
- WebSocket test page screenshot
- Network tab showing WebSocket request

---

## ✅ Verification Checklist

After fixing issues, verify:

- [ ] Backend server running on port 8000
- [ ] Frontend running on port 5173
- [ ] Can login successfully
- [ ] Auth token exists in localStorage
- [ ] `.env` file has correct WebSocket URL
- [ ] WebSocket test page shows all green ✅
- [ ] Dashboard shows green connection dot 🟢
- [ ] Console shows "✅ WebSocket connected successfully"
- [ ] No red error messages in console
- [ ] Connection persists when navigating pages

---

## 🎉 Success Indicators

You'll know everything is working when:

1. **Dashboard loads** → Connection dot turns green 🟢
2. **Navigate to Tourists** → Dot stays green ✅
3. **Navigate to Alerts** → Dot stays green ✅
4. **Console shows**:
   ```
   ✅ Global WebSocket connected - persists across navigation
   💗 Sending heartbeat ping
   💗 Heartbeat pong received
   ```
5. **Real-time alerts appear** with blue "Live" badge

---

**Remember**: The WebSocket should connect ONCE on login and stay connected until logout. If it's disconnecting during navigation, the fix hasn't been applied correctly.
