# 🔧 WebSocket Troubleshooting Guide for FastAPI

This comprehensive guide helps developers debug and resolve WebSocket-related issues in FastAPI applications, based on real-world troubleshooting experience with the SafeHorizon platform.

## 📋 Table of Contents

1. [Common WebSocket Issues](#-common-websocket-issues)
2. [Authentication Problems](#-authentication-problems)
3. [Connection Flow Issues](#-connection-flow-issues)
4. [URL and Routing Problems](#-url-and-routing-problems)
5. [Error Codes and Meanings](#-error-codes-and-meanings)
6. [Debugging Tools and Techniques](#-debugging-tools-and-techniques)
7. [Testing WebSocket Connections](#-testing-websocket-connections)
8. [Best Practices](#-best-practices)
9. [Code Examples](#-code-examples)

---

## 🚨 Common WebSocket Issues

### Issue 1: Connection Rejected (403 Forbidden)
**Symptoms:**
- WebSocket connection fails immediately
- 403 status code in browser/client
- "Forbidden" error message

**Causes:**
- Missing or invalid authentication token
- Incorrect token format
- Token passed in wrong location (headers vs query params)
- Server not recognizing authentication

**Solutions:**
```python
# ❌ Wrong: Using headers (doesn't work with WebSocket)
headers = {"Authorization": f"Bearer {token}"}
websocket = new WebSocket(url, headers)

# ✅ Correct: Using query parameters
websocket = new WebSocket(`ws://localhost:8000/api/alerts/subscribe?token=${token}`)
```

### Issue 2: Double Accept Error (1008 Policy Violation)
**Symptoms:**
- "Expected ASGI message 'websocket.send' or 'websocket.close', but got 'websocket.accept'"
- WebSocket connects but immediately closes with 1008 code

**Causes:**
- Calling `websocket.accept()` multiple times
- WebSocket manager already accepting connection

**Solutions:**
```python
# ❌ Wrong: Double accept
@router.websocket("/alerts/subscribe")
async def alerts_subscribe(websocket: WebSocket, token: str):
    await websocket.accept()  # First accept
    await websocket_manager.connect(websocket, "authority", user_data)  # Second accept inside

# ✅ Correct: Let manager handle accept
@router.websocket("/alerts/subscribe")
async def alerts_subscribe(websocket: WebSocket, token: str):
    # Authenticate first, then let manager handle connection
    user_data = authenticate_token(token)
    await websocket_manager.connect(websocket, "authority", user_data)
```

### Issue 3: Authentication with FastAPI Dependencies
**Symptoms:**
- Dependency injection not working with WebSockets
- "Cannot resolve dependency" errors
- Authentication always fails

**Causes:**
- FastAPI dependency injection has limitations with WebSockets
- Query parameters not properly extracted

**Solutions:**
```python
# ❌ Wrong: Using FastAPI dependency injection
@router.websocket("/alerts/subscribe")
async def alerts_subscribe(
    websocket: WebSocket, 
    current_user: User = Depends(get_current_user)  # This doesn't work well
):
    pass

# ✅ Correct: Manual authentication
@router.websocket("/alerts/subscribe")
async def alerts_subscribe(websocket: WebSocket, token: str):
    try:
        # Manual token verification
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        # ... continue with authentication logic
    except jwt.InvalidTokenError:
        await websocket.close(code=1008, reason="Invalid token")
        return
```

---

## 🔐 Authentication Problems

### Problem: Token Validation Fails

**Debugging Steps:**
1. **Verify token format:**
   ```python
   print(f"Token received: {token[:20]}...")  # Don't log full token
   print(f"Token length: {len(token)}")
   ```

2. **Check token structure:**
   ```python
   try:
       # Decode without verification first
       unverified = jwt.decode(token, options={"verify_signature": False})
       print(f"Token payload: {unverified}")
   except Exception as e:
       print(f"Token decode error: {e}")
   ```

3. **Validate secret key:**
   ```python
   # Ensure SECRET_KEY matches the one used for encoding
   print(f"Secret key (first 10 chars): {SECRET_KEY[:10]}...")
   ```

### Problem: Role-Based Access Control

**Implementation:**
```python
@router.websocket("/alerts/subscribe")
async def alerts_subscribe(websocket: WebSocket, token: str):
    try:
        # Verify token
        payload = local_auth.verify_token(token)
        role = payload.get("role", "tourist")
        
        # Check permissions
        if role not in ["authority", "admin"]:
            await websocket.close(code=1008, reason="Access denied: Authority role required")
            return
            
        # Continue with connection...
    except ValueError as e:
        await websocket.close(code=1008, reason=f"Invalid token: {str(e)}")
        return
```

---

## 🔄 Connection Flow Issues

### Proper WebSocket Connection Flow

1. **Client initiates connection with token**
2. **Server validates token before accepting**
3. **Server accepts connection**
4. **Server adds connection to manager**
5. **Heartbeat mechanism starts**

```python
# Correct implementation
@router.websocket("/alerts/subscribe")
async def alerts_subscribe(websocket: WebSocket, token: str):
    try:
        # Step 1: Validate authentication BEFORE accepting
        user_data = authenticate_token(token)
        
        # Step 2: Let websocket_manager handle accept and connection
        await websocket_manager.connect(websocket, "authority", user_data)
        
        # Step 3: Keep connection alive
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
                
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)
```

### Connection Manager Best Practices

```python
class WebSocketManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        
    async def connect(self, websocket: WebSocket, channel: str, user_data: dict):
        # Accept connection here (only once)
        await websocket.accept()
        
        if channel not in self.active_connections:
            self.active_connections[channel] = []
            
        self.active_connections[channel].append(websocket)
        
    def disconnect(self, websocket: WebSocket):
        for channel, connections in self.active_connections.items():
            if websocket in connections:
                connections.remove(websocket)
```

---

## 🌐 URL and Routing Problems

### Issue: Double API Prefix

**Problem:**
```
Expected: ws://localhost:8000/api/alerts/subscribe
Actual:   ws://localhost:8000/api/api/alerts/subscribe
```

**Debugging:**
1. **Check router prefix:**
   ```python
   # In main.py
   app.include_router(authority_router, prefix="/api", tags=["Authority"])
   
   # In authority.py
   router = APIRouter()  # Don't add prefix here again
   ```

2. **Verify endpoint definition:**
   ```python
   # ✅ Correct
   @router.websocket("/alerts/subscribe")
   
   # ❌ Wrong  
   @router.websocket("/api/alerts/subscribe")
   ```

### Issue: WebSocket URL Construction

**Client-side URL building:**
```javascript
// ✅ Correct
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const host = window.location.host;
const wsUrl = `${protocol}//${host}/api/alerts/subscribe?token=${token}`;

// ❌ Wrong - hardcoded protocol
const wsUrl = `ws://localhost:8000/api/alerts/subscribe?token=${token}`;
```

---

## ⚠️ Error Codes and Meanings

### WebSocket Close Codes

| Code | Name | Meaning | Solution |
|------|------|---------|----------|
| 1000 | Normal Closure | Clean disconnect | No action needed |
| 1001 | Going Away | Server/client shutting down | Implement reconnection |
| 1002 | Protocol Error | WebSocket protocol violation | Check message format |
| 1003 | Unsupported Data | Wrong data type sent | Validate message types |
| 1006 | Abnormal Closure | Connection lost unexpectedly | Add error handling |
| 1008 | Policy Violation | Auth failure, double accept | Fix authentication |
| 1011 | Internal Error | Server error | Check server logs |
| 1012 | Service Restart | Server restarting | Implement reconnection |

### Authentication Error Codes

```python
# Custom close codes for authentication
AUTH_CODES = {
    "INVALID_TOKEN": 1008,
    "EXPIRED_TOKEN": 1008,
    "INSUFFICIENT_PERMISSIONS": 1008,
    "USER_NOT_FOUND": 1008,
}

# Usage
await websocket.close(code=AUTH_CODES["INVALID_TOKEN"], reason="Token expired")
```

---

## 🛠️ Debugging Tools and Techniques

### 1. Server-Side Logging

```python
import logging

# Configure WebSocket logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@router.websocket("/alerts/subscribe")
async def alerts_subscribe(websocket: WebSocket, token: str):
    logger.info(f"WebSocket connection attempt from {websocket.client}")
    logger.debug(f"Token length: {len(token) if token else 0}")
    
    try:
        # Your WebSocket logic
        logger.info("WebSocket authenticated successfully")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.close(code=1011, reason="Internal server error")
```

### 2. Client-Side Debugging

```javascript
const websocket = new WebSocket(wsUrl);

websocket.onopen = (event) => {
    console.log("✅ WebSocket connected:", event);
};

websocket.onmessage = (event) => {
    console.log("📨 Message received:", event.data);
};

websocket.onclose = (event) => {
    console.log(`🔌 WebSocket closed: Code ${event.code}, Reason: ${event.reason}`);
    
    // Decode close codes
    switch(event.code) {
        case 1008:
            console.error("❌ Authentication failed");
            break;
        case 1012:
            console.warn("🔄 Server restarting, will reconnect");
            break;
        default:
            console.log("ℹ️ Normal closure");
    }
};

websocket.onerror = (error) => {
    console.error("❌ WebSocket error:", error);
};
```

### 3. Network Debugging

**Browser DevTools:**
1. Open Developer Tools (F12)
2. Go to Network tab
3. Filter by "WS" (WebSocket)
4. Look for:
   - Connection status (101 Switching Protocols = success)
   - Close codes and reasons
   - Message flow

**curl/wscat Testing:**
```bash
# Install wscat
npm install -g wscat

# Test WebSocket connection
wscat -c "ws://localhost:8000/api/alerts/subscribe?token=YOUR_TOKEN"

# Send test message
> ping
< pong
```

---

## ✅ Testing WebSocket Connections

### 1. Basic Connection Test

```python
import asyncio
import websockets

async def test_websocket():
    uri = "ws://localhost:8000/api/alerts/subscribe?token=YOUR_TOKEN"
    
    try:
        async with websockets.connect(uri) as websocket:
            print("✅ Connected successfully")
            
            # Test heartbeat
            await websocket.send("ping")
            response = await websocket.recv()
            print(f"Heartbeat response: {response}")
            
    except Exception as e:
        print(f"❌ Connection failed: {e}")

asyncio.run(test_websocket())
```

### 2. Authentication Test

```python
async def test_auth_scenarios():
    scenarios = [
        ("Valid token", "valid_jwt_token_here"),
        ("Invalid token", "invalid_token"),
        ("Missing token", ""),
        ("Expired token", "expired_jwt_token"),
    ]
    
    for scenario_name, token in scenarios:
        print(f"\n🧪 Testing: {scenario_name}")
        uri = f"ws://localhost:8000/api/alerts/subscribe?token={token}"
        
        try:
            async with websockets.connect(uri) as websocket:
                print("✅ Connected (unexpected for invalid tokens)")
        except websockets.exceptions.ConnectionClosedError as e:
            print(f"❌ Connection closed: {e.code} - {e.reason}")
        except Exception as e:
            print(f"❌ Error: {e}")
```

### 3. Load Testing

```python
async def stress_test_websockets(concurrent_connections=10):
    async def single_connection(connection_id):
        uri = f"ws://localhost:8000/api/alerts/subscribe?token={valid_token}"
        try:
            async with websockets.connect(uri) as websocket:
                print(f"Connection {connection_id}: Connected")
                await asyncio.sleep(30)  # Keep alive for 30 seconds
        except Exception as e:
            print(f"Connection {connection_id}: Failed - {e}")
    
    # Create multiple concurrent connections
    tasks = [single_connection(i) for i in range(concurrent_connections)]
    await asyncio.gather(*tasks)
```

---

## 📚 Best Practices

### 1. Authentication

- ✅ **DO:** Validate tokens before accepting WebSocket connections
- ✅ **DO:** Use query parameters for token passing
- ✅ **DO:** Implement proper role-based access control
- ❌ **DON'T:** Rely on FastAPI dependency injection for WebSocket auth
- ❌ **DON'T:** Accept connections before authentication

### 2. Connection Management

- ✅ **DO:** Use a centralized WebSocket manager
- ✅ **DO:** Implement heartbeat/ping-pong mechanism
- ✅ **DO:** Handle disconnections gracefully
- ❌ **DON'T:** Call `websocket.accept()` multiple times
- ❌ **DON'T:** Forget to remove connections from manager on disconnect

### 3. Error Handling

- ✅ **DO:** Use appropriate close codes
- ✅ **DO:** Provide meaningful error messages
- ✅ **DO:** Log errors for debugging
- ❌ **DON'T:** Expose sensitive information in error messages
- ❌ **DON'T:** Let exceptions crash the entire WebSocket handler

### 4. Security

- ✅ **DO:** Validate all incoming messages
- ✅ **DO:** Implement rate limiting
- ✅ **DO:** Use secure tokens with expiration
- ❌ **DON'T:** Trust client-side data
- ❌ **DON'T:** Log sensitive information (tokens, passwords)

---

## 💡 Code Examples

### Complete WebSocket Endpoint Implementation

```python
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class WebSocketManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, channel: str, user_data: dict):
        await websocket.accept()
        
        if channel not in self.active_connections:
            self.active_connections[channel] = []
        
        self.active_connections[channel].append(websocket)
        logger.info(f"User {user_data.get('email')} connected to {channel}")
    
    def disconnect(self, websocket: WebSocket):
        for channel, connections in self.active_connections.items():
            if websocket in connections:
                connections.remove(websocket)
                logger.info(f"User disconnected from {channel}")
                break
    
    async def broadcast_to_channel(self, channel: str, message: dict):
        if channel in self.active_connections:
            dead_connections = []
            
            for connection in self.active_connections[channel]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception:
                    dead_connections.append(connection)
            
            # Remove dead connections
            for dead_conn in dead_connections:
                self.active_connections[channel].remove(dead_conn)

websocket_manager = WebSocketManager()

@router.websocket("/alerts/subscribe")
async def alerts_subscribe(websocket: WebSocket, token: str):
    """Subscribe to real-time alerts via WebSocket"""
    
    # Step 1: Authenticate before accepting connection
    try:
        from ..auth.local_auth import local_auth
        
        payload = local_auth.verify_token(token)
        user_id = payload.get("sub")
        email = payload.get("email")
        role = payload.get("role", "tourist")
        
        if not user_id or not email:
            await websocket.close(code=1008, reason="Invalid token payload")
            return
        
        if role not in ["authority", "admin"]:
            await websocket.close(code=1008, reason="Access denied: Authority role required")
            return
            
    except ValueError as e:
        await websocket.close(code=1008, reason=f"Invalid token: {str(e)}")
        return
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        await websocket.close(code=1011, reason="Authentication failed")
        return
    
    # Step 2: Verify user exists in database (optional)
    try:
        from ..database import AsyncSessionLocal
        from sqlalchemy import select
        from ..models.database_models import Authority
        
        async with AsyncSessionLocal() as db:
            if role == "authority":
                result = await db.execute(select(Authority).where(Authority.id == user_id))
                user_record = result.scalar_one_or_none()
                if not user_record:
                    await websocket.close(code=1008, reason="Authority not found")
                    return
    except Exception as e:
        logger.error(f"Database verification error: {e}")
        await websocket.close(code=1011, reason="User verification failed")
        return
    
    # Step 3: Connect to WebSocket manager
    user_data = {
        "user_id": user_id,
        "email": email,
        "role": role
    }
    
    try:
        await websocket_manager.connect(websocket, "authority", user_data)
        
        # Step 4: Keep connection alive with heartbeat
        while True:
            try:
                data = await websocket.receive_text()
                
                # Handle heartbeat
                if data == "ping":
                    await websocket.send_text("pong")
                else:
                    logger.debug(f"Received message: {data}")
                    
            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"Message handling error: {e}")
                break
                
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        websocket_manager.disconnect(websocket)
```

### Client-Side JavaScript Implementation

```javascript
class SafeHorizonWebSocket {
    constructor(token, onAlert, onError) {
        this.token = token;
        this.onAlert = onAlert;
        this.onError = onError;
        this.websocket = null;
        this.heartbeatInterval = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }
    
    connect() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const url = `${protocol}//${host}/api/alerts/subscribe?token=${this.token}`;
        
        this.websocket = new WebSocket(url);
        
        this.websocket.onopen = (event) => {
            console.log("✅ SafeHorizon WebSocket connected");
            this.reconnectAttempts = 0;
            this.startHeartbeat();
        };
        
        this.websocket.onmessage = (event) => {
            if (event.data === "pong") {
                console.log("💗 Heartbeat acknowledged");
                return;
            }
            
            try {
                const alert = JSON.parse(event.data);
                console.log("🚨 Alert received:", alert);
                this.onAlert(alert);
            } catch (e) {
                console.error("❌ Failed to parse alert:", event.data);
            }
        };
        
        this.websocket.onclose = (event) => {
            console.log(`🔌 WebSocket closed: ${event.code} - ${event.reason}`);
            this.stopHeartbeat();
            
            if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnect();
            }
        };
        
        this.websocket.onerror = (error) => {
            console.error("❌ WebSocket error:", error);
            if (this.onError) {
                this.onError(error);
            }
        };
    }
    
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.websocket.readyState === WebSocket.OPEN) {
                this.websocket.send("ping");
            }
        }, 30000); // 30 seconds
    }
    
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
    
    reconnect() {
        this.reconnectAttempts++;
        const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
        
        console.log(`🔄 Reconnecting in ${delay/1000} seconds (attempt ${this.reconnectAttempts})`);
        
        setTimeout(() => {
            this.connect();
        }, delay);
    }
    
    disconnect() {
        this.stopHeartbeat();
        if (this.websocket) {
            this.websocket.close(1000, "User disconnected");
        }
    }
}

// Usage
const websocketClient = new SafeHorizonWebSocket(
    "your_jwt_token_here",
    (alert) => {
        // Handle incoming alert
        showAlertNotification(alert);
    },
    (error) => {
        // Handle connection errors
        showErrorMessage("Connection lost. Trying to reconnect...");
    }
);

websocketClient.connect();
```

---

## 🎯 Quick Troubleshooting Checklist

### ✅ Before You Start
- [ ] Server is running and accessible
- [ ] WebSocket endpoint is properly defined
- [ ] Authentication system is working for regular API calls
- [ ] Database connections are working

### ✅ Connection Issues
- [ ] Check WebSocket URL format (ws:// or wss://)
- [ ] Verify token is passed in query parameters
- [ ] Confirm no double API prefix in URL
- [ ] Test with simple WebSocket client (wscat)

### ✅ Authentication Issues  
- [ ] Token is valid and not expired
- [ ] Token contains required claims (sub, email, role)
- [ ] User has sufficient permissions
- [ ] Authentication logic runs before websocket.accept()

### ✅ Connection Flow Issues
- [ ] Only one websocket.accept() call
- [ ] WebSocket manager handles connection properly
- [ ] Heartbeat mechanism is implemented
- [ ] Disconnection cleanup is working

### ✅ Message Issues
- [ ] JSON parsing is working correctly
- [ ] Message broadcasting to correct channels
- [ ] Dead connection cleanup is implemented
- [ ] Error handling for message sending

---

This guide covers the most common WebSocket issues and their solutions. Keep it handy for quick reference during development and debugging! 🚀