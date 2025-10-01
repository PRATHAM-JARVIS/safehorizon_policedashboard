# 🚀 WebSocket Connection - Quick Start

## 📍 You Are Here
✅ **Frontend Server**: Running on http://localhost:5173/  
✅ **Test Page**: Available at http://localhost:5173/ws-test  
✅ **All Code**: Fixed and ready  

---

## 🎯 3-Step Connection Test

### **Step 1: Ensure Backend is Running** (30 seconds)
```bash
# Check if backend API is alive
curl http://localhost:8000/api/health

# OR open in browser:
# http://localhost:8000/docs
```

**Expected**: API docs or health response

**If Failed**: Start your SafeHorizon backend server on port 8000

---

### **Step 2: Login to Dashboard** (30 seconds)
1. Open: **http://localhost:5173/**
2. Enter authority credentials
3. Login → Should redirect to Dashboard

**Expected**: Dashboard loads, shows stats cards

---

### **Step 3: Run Connection Test** (1 minute)
1. Go to: **http://localhost:5173/ws-test**
2. Look for green checkmarks ✅
3. Click "Test Connection" button
4. Check results

**Expected**: All tests pass with ✅

---

## 🔍 What You Should See

### **When Working Correctly:**

**In Browser (Dashboard):**
```
┌─────────────────────────────────────┐
│ SafeHorizon Police Dashboard        │  🟢 ← Green dot here
└─────────────────────────────────────┘

Live Alerts Feed
━━━━━━━━━━━━━━━━━━━━
[Live] Connected      ← Blue "Live" badge
```

**In Console (F12):**
```
✅ WebSocket connected successfully
✅ Global WebSocket connected - persists across navigation
💗 Sending heartbeat ping
💗 Heartbeat pong received
```

**On Test Page (/ws-test):**
```
Environment Variables
✅ VITE_WS_BASE_URL: ws://localhost:8000
✅ VITE_API_BASE_URL: http://localhost:8000/api
✅ VITE_WS_AUTO_CONNECT: true

Authentication Status
✅ Token found: Yes
✅ Token valid: Yes

Connection Test
✅ WebSocket URL: ws://localhost:8000/api/alerts/subscribe
✅ Connection Status: Connected
```

---

### **When Something's Wrong:**

**❌ No Backend:**
```
Console: ❌ Connection error
Fix: Start backend server on port 8000
```

**❌ No Token:**
```
Console: ❌ No authentication token found
Fix: Logout → Clear localStorage → Login again
```

**❌ Wrong Environment:**
```
Test Page: ❌ VITE_WS_BASE_URL not set!
Fix: Check .env file → Restart dev server
```

---

## 🛠️ Common Fixes

### **Fix 1: Backend Not Running**
```bash
# Navigate to your backend folder
cd path/to/backend

# Start server (example for FastAPI)
uvicorn main:app --reload --port 8000

# Or Python
python main.py
```

### **Fix 2: Clear Token**
```javascript
// In browser console (F12)
localStorage.clear();
// Then refresh and login again
```

### **Fix 3: Restart Frontend**
```bash
# In your terminal, press Ctrl+C
# Then restart:
npm run dev
```

---

## ✅ Success Checklist

Test connection by doing this:

1. [ ] Dashboard loads → See green dot 🟢
2. [ ] Click "Tourists" → Green dot stays 🟢
3. [ ] Click "Alerts" → Green dot stays 🟢
4. [ ] Click "Dashboard" → Green dot stays 🟢
5. [ ] Console shows "✅ WebSocket connected successfully"
6. [ ] No red errors in console
7. [ ] "Live" badge shows on alerts feed

**If all checked**: 🎉 **WORKING PERFECTLY!**

---

## 🆘 Still Not Working?

1. **Take screenshot** of `/ws-test` page
2. **Copy all console messages** (especially red ones)
3. **Check backend logs** for errors
4. **Verify:**
   - Backend running? `curl http://localhost:8000`
   - Can login? (Yes/No)
   - Token exists? `localStorage.getItem('safehorizon_auth_token')`
5. **Provide these details** for further help

---

## 📚 Full Documentation

- **Detailed Troubleshooting**: See `WEBSOCKET_TROUBLESHOOTING.md`
- **Test Instructions**: See `TEST_CONNECTION.md`
- **API Endpoints**: See `API_ENDPOINTS.md`
- **Backend Integration**: See `BACKEND_CONNECTION_GUIDE.md`

---

## 🎯 TL;DR (Too Long; Didn't Read)

```
1. Backend running on 8000? → Yes
2. Login at localhost:5173? → Yes
3. Go to /ws-test → All green? → Yes
4. See green dot in Dashboard? → Yes

Result: ✅ WORKING!
```

---

**Current Time**: Ready to test!  
**Next Action**: Open http://localhost:5173/ and login, then check connection status 🚀
