# SafeHorizon Police Dashboard - API Integration Guide

## Overview
This document explains how the SafeHorizon Police Dashboard integrates with the SafeHorizon API backend.

## API Structure

### Updated API Services
The `src/api/services.js` file has been completely updated to match the comprehensive API documentation. Here are the key improvements:

#### 1. Authentication API (`authAPI`)
- ✅ Authority login/registration
- ✅ Tourist login/registration  
- ✅ Current user info
- ✅ Debug role endpoint

#### 2. Tourist Management API (`touristAPI`)
- ✅ Get active tourists (authority only)
- ✅ Track specific tourist
- ✅ Get tourist alerts
- ✅ Trip management (start/end/history)
- ✅ Location tracking and history
- ✅ Safety score retrieval
- ✅ SOS trigger

#### 3. Alerts Management API (`alertsAPI`)
- ✅ Get recent alerts with filters
- ✅ Acknowledge/close incidents
- ✅ WebSocket URL helper for real-time alerts

#### 4. Zones Management API (`zonesAPI`)
- ✅ List public zones
- ✅ Get nearby zones
- ✅ Manage zones (authority only)
- ✅ Create/delete zones
- ✅ Public heatmap data

#### 5. E-FIR Management API (`efirAPI`)
- ✅ Generate E-FIR from alerts
- ✅ List E-FIRs with fallback handling

#### 6. Heatmap & Analytics API (`heatmapAPI`) - **NEW**
- ✅ Comprehensive heatmap data
- ✅ Zones heatmap
- ✅ Alerts heatmap  
- ✅ Tourists heatmap

#### 7. Admin API (`adminAPI`)
- ✅ System status
- ✅ Users management
- ✅ Suspend/activate users
- ✅ Model retraining
- ✅ Analytics dashboard

#### 8. AI Services API (`aiAPI`)
- ✅ Geofencing checks
- ✅ Nearby zones detection
- ✅ Anomaly detection (point & sequence)
- ✅ Safety score computation
- ✅ Alert classification
- ✅ Models status

#### 9. Notification API (`notificationAPI`)
- ✅ Push notifications
- ✅ SMS notifications
- ✅ Emergency alerts
- ✅ Broadcast notifications
- ✅ Notification history

## WebSocket Integration

### Real-time Alerts
The WebSocket integration has been updated to match the API documentation:

```javascript
// URL Format: ws://localhost:8000/api/alerts/subscribe?token=JWT_TOKEN
const wsUrl = `${baseWsUrl}/api/alerts/subscribe?token=${encodeURIComponent(token)}`;
```

### Features
- ✅ Automatic JWT token authentication
- ✅ Heartbeat mechanism (ping/pong)
- ✅ Automatic reconnection
- ✅ Proper error handling

### Message Types
- `sos_alert` - Critical emergency alerts
- `safety_alert` - Safety score warnings
- `retrain_complete` - AI model retraining (admin only)

## Component Updates

### Dashboard (`src/pages/Dashboard.jsx`)
- ✅ Uses updated API services
- ✅ Real-time WebSocket alerts
- ✅ Proper error handling
- ✅ Periodic data refresh (30s)

### Alerts (`src/pages/Alerts.jsx`)
- ✅ Updated acknowledge/close incident methods
- ✅ Proper API parameter handling
- ✅ Real-time refresh (10s)

### Tourists (`src/pages/Tourists.jsx`)
- ✅ Uses getActiveTourists endpoint
- ✅ Proper safety score handling
- ✅ Real-time refresh (15s)

### Zones (`src/pages/Zones.jsx`)
- ✅ Uses manageZones for authority access
- ✅ Proper zone creation with coordinates
- ✅ Zone deletion functionality

### Admin (`src/pages/Admin.jsx`)
- ✅ Updated user management API calls
- ✅ Proper suspend/activate user methods
- ✅ System status monitoring

### E-FIRs (`src/pages/EFIRs.jsx`)
- ✅ Fallback handling for missing endpoints
- ✅ Blockchain integration ready
- ✅ Error handling

## Environment Configuration

### Development
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_BASE_URL=ws://localhost:8000
```

### Production
```env
VITE_API_BASE_URL=https://api.safehorizon.com/api
VITE_WS_BASE_URL=wss://api.safehorizon.com
```

## Authentication Flow

1. **Login**: User submits credentials
2. **Token Storage**: JWT stored in localStorage
3. **API Requests**: Token included in Authorization header
4. **WebSocket**: Token passed as query parameter
5. **Refresh**: Token persisted across sessions

## Error Handling

### API Errors
- ✅ 401 Unauthorized → Redirect to login
- ✅ 403 Forbidden → Access denied message
- ✅ 404 Not Found → Graceful fallback
- ✅ 500 Server Error → User-friendly error

### WebSocket Errors
- ✅ Connection failures → Automatic retry
- ✅ Auth errors → Token refresh
- ✅ Network issues → Exponential backoff

## API Rate Limits

As per documentation:
- **General API**: 10 req/sec per IP, 1000 req/hour per user
- **Auth Endpoints**: 5 req/sec per IP, 20 req/hour per IP
- **WebSocket**: 5 concurrent connections per user

## Security Features

- ✅ JWT Bearer token authentication
- ✅ Automatic token expiration handling
- ✅ Role-based access control
- ✅ Secure WebSocket connections
- ✅ Input validation and sanitization

## Testing the Integration

### Quick Test
1. Start the development server: `npm run dev`
2. Navigate to http://localhost:5173
3. Attempt login (will fail without backend)
4. Check browser console for API calls

### With Backend
1. Ensure SafeHorizon API backend is running on localhost:8000
2. Create authority account via API
3. Login to dashboard
4. Test all features:
   - Dashboard stats
   - Real-time alerts
   - Tourist monitoring
   - Zone management
   - E-FIR generation

## Next Steps

1. **Backend Setup**: Deploy SafeHorizon API backend
2. **Database**: Configure PostgreSQL with sample data
3. **WebSocket Testing**: Test real-time alerts functionality
4. **Integration Testing**: Full end-to-end testing
5. **Production Deployment**: Configure production environment

## Notes

- All API endpoints follow RESTful conventions
- Proper error boundaries implemented
- Responsive design maintained
- Accessibility features preserved
- Code follows React best practices