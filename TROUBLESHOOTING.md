# 🔍 Troubleshooting Guide - SafeHorizon Police Dashboard

## 🚨 Quick Fixes for Common Issues

### Issue 1: Blank White Screen

#### Symptoms
- Application shows blank white screen
- No error message visible
- DevTools shows no console errors

#### Diagnosis Steps
1. Open Browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Check Application → Local Storage for corrupted data

#### Solutions

**A. Clear Browser Cache & Storage**
```javascript
// Open DevTools Console and run:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

**B. Check Authentication**
```javascript
// Check if token exists:
console.log(localStorage.getItem('safehorizon_auth_token'));

// If token is corrupted, clear it:
localStorage.removeItem('safehorizon_auth_token');
localStorage.removeItem('safehorizon_user_data');
```

**C. Verify Backend Connection**
```bash
# Test if backend is running:
curl http://localhost:8000/api/system/status

# Or in PowerShell:
Invoke-WebRequest -Uri http://localhost:8000/api/system/status
```

---

### Issue 2: WebSocket Connection Failed

#### Symptoms
- Dashboard shows "Disconnected" status
- Real-time alerts not working
- Console shows WebSocket errors

#### Diagnosis Steps
```javascript
// Check WebSocket URL in console:
console.log('WS URL:', import.meta.env.VITE_WS_BASE_URL);

// Check token:
console.log('Token:', localStorage.getItem('safehorizon_auth_token'));
```

#### Solutions

**A. Verify Environment Variables**
Check `.env` file:
```properties
VITE_WS_BASE_URL=ws://localhost:8000  # ✅ Correct
VITE_WS_AUTO_CONNECT=false            # ✅ Keep false
```

**B. Manual WebSocket Connection**
1. Login successfully first
2. Navigate to Dashboard
3. Wait for page to load completely
4. WebSocket will attempt connection
5. If it fails, check backend WebSocket endpoint

**C. Check Backend WebSocket**
```bash
# Test WebSocket endpoint (requires wscat or similar):
wscat -c "ws://localhost:8000/api/alerts/subscribe?token=YOUR_TOKEN"
```

**D. Check Firewall/Antivirus**
- Windows Firewall might block WebSocket
- Temporarily disable to test
- Add exception for port 8000

---

### Issue 3: Login Not Working

#### Symptoms
- Login button does nothing
- "Invalid credentials" error
- Redirects back to login page

#### Diagnosis Steps
```javascript
// Check API URL:
console.log('API URL:', import.meta.env.VITE_API_BASE_URL);

// Test login endpoint:
fetch('http://localhost:8000/api/auth/login-authority', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@police.com',
    password: 'test123'
  })
}).then(r => r.json()).then(console.log);
```

#### Solutions

**A. Verify Backend is Running**
```bash
# Check if API is responding:
curl http://localhost:8000/api
# Should return backend info
```

**B. Check CORS Settings**
Backend must allow requests from `http://localhost:5173`

**C. Verify Credentials**
- Use correct authority account
- Check email format
- Check password

**D. Check Network Tab**
- Open DevTools → Network
- Try login
- Look for `/auth/login-authority` request
- Check status code and response

---

### Issue 4: Dashboard Shows No Data

#### Symptoms
- Dashboard loads but all stats show 0
- No tourists, alerts, or zones
- No error messages

#### Solutions

**A. This is Actually Normal!**
- If backend has no data, dashboard will show 0
- This is expected behavior
- App is working correctly!

**B. Check Backend Data**
```bash
# Check if backend has tourists:
curl http://localhost:8000/api/tourists/active

# Check if backend has alerts:
curl http://localhost:8000/api/alerts/recent

# Check if backend has zones:
curl http://localhost:8000/api/zones/list
```

**C. Create Test Data**
- Use backend admin panel to create test data
- Or use backend API to seed data

---

### Issue 5: Map Not Showing

#### Symptoms
- Map area is blank or shows error
- Console shows Leaflet errors

#### Solutions

**A. Check Internet Connection**
- Map tiles are loaded from OpenStreetMap
- Requires internet connection

**B. Clear Cache**
```
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

**C. Check Console for Errors**
```javascript
// If you see "L is not defined":
// Make sure Leaflet CSS is imported in App.jsx
import 'leaflet/dist/leaflet.css';
```

**D. Verify Coordinates**
- Tourists must have valid `current_location` with `lat` and `lon`
- Alerts must have valid `coordinates` with `lat` and `lon`

---

### Issue 6: "Cannot read property of undefined"

#### Symptoms
- Console shows TypeError
- Blank screen or partial rendering

#### Solutions

**A. This is Fixed!**
- Error boundaries now catch these errors
- You should see an error message instead of blank screen

**B. If Still Occurring**
1. Check which component is failing (in console)
2. Clear cache and reload
3. Check if data structure matches expected format

---

### Issue 7: Build Fails

#### Symptoms
- `npm run build` shows errors
- TypeScript errors
- Module not found errors

#### Solutions

**A. Clear node_modules**
```bash
rm -rf node_modules package-lock.json
npm install
```

**B. Check Node Version**
```bash
node --version  # Should be 18.x or higher
npm --version   # Should be 9.x or higher
```

**C. Run Lint First**
```bash
npm run lint
# Fix any errors shown
```

---

### Issue 8: Dark Mode Not Working

#### Symptoms
- Theme toggle doesn't work
- Stuck in light or dark mode

#### Solutions

**A. Check Environment Variable**
```properties
# In .env:
VITE_ENABLE_DARK_MODE=true
```

**B. Clear Browser Storage**
```javascript
localStorage.removeItem('appStore');
location.reload();
```

---

### Issue 9: Slow Performance

#### Symptoms
- App feels sluggish
- Delays when clicking
- High CPU usage

#### Solutions

**A. Disable Auto-Refresh**
- Edit polling intervals in code
- Currently: 30s for dashboard, 15s for tourists, 10s for alerts

**B. Reduce Data**
- Limit tourists/alerts shown
- Use pagination (if implemented)

**C. Disable Real-time**
```properties
# In .env:
VITE_ENABLE_REAL_TIME=false
```

**D. Check Browser Extensions**
- Disable ad blockers temporarily
- Disable React DevTools in production

---

## 📋 Pre-Flight Checklist

Before reporting an issue, check:

- [ ] Backend is running (`curl http://localhost:8000/api`)
- [ ] `.env` file exists and has correct URLs
- [ ] Browser cache cleared
- [ ] localStorage cleared
- [ ] DevTools console checked
- [ ] Network tab shows API responses
- [ ] Node version is 18+
- [ ] Dependencies installed (`npm install`)

---

## 🔧 Debug Mode

Enable debug logging:

```properties
# In .env:
VITE_DEBUG_LOGS=true
```

This will show detailed logs in console for:
- WebSocket connection attempts
- API calls
- State changes
- Authentication flow

---

## 📞 Getting Help

If none of these solutions work:

1. **Collect Information**:
   - Browser: Chrome/Firefox/Safari + Version
   - OS: Windows/Mac/Linux
   - Node version: `node --version`
   - Error messages from console
   - Network tab screenshots

2. **Check Console**:
   - Open DevTools (F12)
   - Copy all errors from Console tab
   - Include in your report

3. **Check Network**:
   - Open DevTools → Network tab
   - Filter for "Fetch/XHR"
   - Check which requests are failing
   - Include status codes in report

4. **Provide Context**:
   - What were you trying to do?
   - What did you expect to happen?
   - What actually happened?
   - Can you reproduce it?

---

## 🎯 Known Limitations

1. **WebSocket Auto-Connect**: Disabled by default for security
2. **Token Storage**: Uses localStorage (not httpOnly cookies)
3. **Map Tiles**: Requires internet connection
4. **Real-time Updates**: Requires WebSocket connection
5. **Pagination**: Not implemented (shows all data)
6. **Search**: Client-side only (backend search not implemented)

---

## ✅ Health Check Commands

Run these to verify everything is working:

```bash
# 1. Check dependencies
npm list

# 2. Check for errors
npm run lint

# 3. Try building
npm run build

# 4. Check env file
cat .env

# 5. Test backend
curl http://localhost:8000/api/system/status
```

If all pass, your setup is correct!

---

**Last Updated**: October 1, 2025
**Status**: All critical issues resolved ✅
