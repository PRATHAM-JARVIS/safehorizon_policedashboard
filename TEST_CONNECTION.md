# 🔍 Quick Connection Test

## ✅ Frontend Status
**Dev Server**: Running on http://localhost:5173/

## 🧪 Test Steps

### **Step 1: Check if Backend is Running**
Open a new terminal and run:
```bash
curl http://localhost:8000/api/health
```

**OR** open in browser:
```
http://localhost:8000
http://localhost:8000/docs
```

**Expected Result**: You should see API documentation or a health check response.

---

### **Step 2: Login to Dashboard**
1. Go to: **http://localhost:5173/**
2. Login with authority credentials
3. You should be redirected to Dashboard

---

### **Step 3: Access WebSocket Test Page**
Go to: **http://localhost:5173/ws-test**

This page will show:
- ✅ All environment variables
- ✅ Your authentication token status
- ✅ WebSocket URL being used
- ✅ Connection test results
- 📊 Live connection logs

---

### **Step 4: Check Browser Console**
Press `F12` to open DevTools → Console tab

Look for these messages:

**✅ Good Messages (Everything Working):**
```
🚀 [WebSocketProvider] Initializing WebSocket Provider...
🔍 [WebSocket] Building WebSocket URL...
🔗 [WebSocket] URL constructed: ws://localhost:8000/api/alerts/subscribe
🔌 Connecting to WebSocket: ws://localhost:8000/api/alerts/subscribe?token=...
✅ WebSocket connected successfully
✅ Global WebSocket connected - persists across navigation
```

**❌ Problem Messages:**
```
❌ [WebSocket] No authentication token found
   → Solution: Logout and login again

❌ Connection error
   → Solution: Check if backend is running on port 8000

❌ VITE_WS_BASE_URL not set!
   → Solution: Check .env file and restart dev server
```

---

### **Step 5: Check Connection Indicator**
Look at the **top-right corner** of the Dashboard:

- 🟢 **Green dot** = Connected ✅
- 🟡 **Yellow pulsing dot** = Connecting... (wait a few seconds)
- 🔴 **Red dot** = Disconnected (check backend)

---

### **Step 6: Test Navigation**
1. Go to **Dashboard** → Check connection dot stays green
2. Click **Tourists** → Check connection dot stays green
3. Click **Alerts** → Check connection dot stays green
4. Click **Zones** → Check connection dot stays green

**Success**: Dot stays green throughout navigation 🎉

---

## 🚨 If Connection Fails

### **Most Common Issue: Backend Not Running**
Make sure your SafeHorizon backend API is running on port 8000.

Check with:
```bash
# Windows PowerShell
Test-NetConnection -ComputerName localhost -Port 8000

# Or use curl
curl http://localhost:8000
```

If backend is NOT running:
1. Navigate to your backend directory
2. Start the server:
   ```bash
   # Example for FastAPI
   uvicorn main:app --reload --port 8000
   
   # Or
   python main.py
   ```

---

### **Second Most Common: Authentication Token**
If you see "No authentication token found":

1. **Clear storage and re-login:**
   - Open browser console (F12)
   - Run: `localStorage.clear()`
   - Refresh page
   - Login again

2. **Check token exists:**
   ```javascript
   // In browser console
   console.log(localStorage.getItem('safehorizon_auth_token'));
   ```

---

### **Environment Variables Issue**
If `.env` changes aren't being picked up:

1. **Stop dev server** (Ctrl+C in terminal)
2. **Restart dev server:**
   ```bash
   npm run dev
   ```
3. **Verify variables load:**
   - Go to `/ws-test` page
   - Check "Environment Variables" section
   - All should show ✅

---

## 📋 Pre-Launch Checklist

Before testing, ensure:

- [ ] Backend server is running (port 8000)
- [ ] Frontend dev server is running (port 5173)
- [ ] `.env` file exists in project root
- [ ] `.env` contains:
  ```
  VITE_WS_BASE_URL=ws://localhost:8000
  VITE_API_BASE_URL=http://localhost:8000/api
  VITE_WS_AUTO_CONNECT=true
  ```
- [ ] Can access http://localhost:8000/docs in browser
- [ ] Can access http://localhost:5173 in browser

---

## 🎯 What to Report

If issues persist, provide:

1. **Screenshot of `/ws-test` page**
2. **Console logs** (all red messages)
3. **Backend status:**
   ```bash
   curl http://localhost:8000/api/health
   ```
4. **Environment check:**
   - Is backend running? (Yes/No)
   - Can you access http://localhost:8000/docs? (Yes/No)
   - Did you login successfully? (Yes/No)
   - What does localStorage.getItem('safehorizon_auth_token') show?

---

## 🎉 Success Looks Like

When everything works:

1. ✅ Login successful
2. ✅ Dashboard loads
3. ✅ Green connection dot appears (top-right)
4. ✅ Console shows: "✅ WebSocket connected successfully"
5. ✅ No red error messages
6. ✅ Connection stays green when navigating
7. ✅ "Live" badge on alerts feed (blue)
8. ✅ Heartbeat messages in console: "💗 Sending heartbeat ping"

---

**Current Status**: 
- ✅ Frontend running on http://localhost:5173/
- ❓ Backend status unknown (check manually)
- ❓ Authentication status unknown (login first)

**Next Action**: Login and go to http://localhost:5173/ws-test
