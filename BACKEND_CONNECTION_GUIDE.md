# 🔗 SafeHorizon Backend Connection Guide

This guide will help you connect the SafeHorizon Police Dashboard to the SafeHorizon FastAPI backend.

## 📋 Prerequisites

1. **SafeHorizon FastAPI Backend**: The backend server must be running
2. **Python 3.8+**: Required for the backend
3. **Database**: PostgreSQL or SQLite configured
4. **Redis**: For caching and real-time features (optional)

## 🚀 Backend Setup

### 1. Clone and Setup Backend

```bash
# Clone the SafeHorizon backend repository
git clone <safehorizon-backend-repo>
cd safehorizon-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file in the backend root:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/safehorizon
# or for SQLite
DATABASE_URL=sqlite:///./safehorizon.db

# JWT Configuration
SECRET_KEY=your-super-secret-jwt-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Configuration
ALLOWED_ORIGINS=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"]

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379

# External Services (optional)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
```

### 3. Initialize Database

```bash
# Run database migrations
alembic upgrade head

# Create sample data (optional)
python scripts/create_sample_data.py
```

### 4. Start Backend Server

```bash
# Start the FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Server will be available at:
# - API: http://localhost:8000/api
# - Docs: http://localhost:8000/docs
# - Health: http://localhost:8000/health
```

## 🔧 Dashboard Configuration

### 1. Update Environment Variables

Edit the `.env` file in the dashboard root (`e:\police\.env`):

```env
# API Configuration - Match your backend
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_BASE_URL=ws://localhost:8000/api

# Application Configuration
VITE_APP_NAME=SafeHorizon Police Dashboard
VITE_APP_VERSION=1.0.0

# Map Configuration
VITE_MAP_DEFAULT_LAT=20.5937
VITE_MAP_DEFAULT_LNG=78.9629
VITE_MAP_DEFAULT_ZOOM=6

# Feature Flags
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_REAL_TIME=true
VITE_ENABLE_MAPS=true
VITE_ENABLE_CHARTS=true
```

### 2. Test Connection

1. Start the dashboard: `npm run dev`
2. Navigate to: `http://localhost:5174/api-test`
3. Check all endpoint statuses
4. Test authentication with authority credentials

## 👮 Authority Account Setup

### Create Authority Account

Use the backend API to create an authority account:

```bash
curl -X POST http://localhost:8000/api/auth/register-authority \
  -H "Content-Type: application/json" \
  -d '{
    "email": "officer@police.com",
    "password": "police123",
    "name": "Officer Smith",
    "badge_number": "12345",
    "department": "City Police Department",
    "rank": "Officer"
  }'
```

### Test Authority Login

```bash
curl -X POST http://localhost:8000/api/auth/login-authority \
  -H "Content-Type: application/json" \
  -d '{
    "email": "officer@police.com",
    "password": "police123"
  }'
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Connection Refused
**Problem**: Dashboard can't connect to backend  
**Solution**: 
- Ensure backend is running on port 8000
- Check firewall settings
- Verify CORS configuration in backend

#### 2. Authentication Errors
**Problem**: Login fails or token errors  
**Solution**:
- Check JWT secret key configuration
- Verify authority account exists
- Check token expiration settings

#### 3. WebSocket Connection Issues
**Problem**: Real-time alerts not working  
**Solution**:
- Ensure WebSocket endpoint is accessible
- Check for proxy/firewall blocking WebSocket connections
- Verify token is included in WebSocket connection

#### 4. Database Connection
**Problem**: Backend fails to start due to database issues  
**Solution**:
- Check database URL and credentials
- Ensure database server is running
- Run migrations: `alembic upgrade head`

### Debug Mode

Enable debug mode in the dashboard by updating `.env`:

```env
VITE_DEV_MODE=true
VITE_DEBUG_LOGS=true
```

This will show detailed API request/response logs in the browser console.

## 📊 API Testing

### Using the Built-in API Test Page

1. Navigate to `/api-test` in the dashboard
2. Check backend connection status
3. Test authentication with authority credentials
4. Verify all endpoint responses

### Manual Testing with cURL

```bash
# Health check
curl http://localhost:8000/health

# Login and get token
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login-authority \
  -H "Content-Type: application/json" \
  -d '{"email":"officer@police.com","password":"police123"}' \
  | jq -r '.access_token')

# Test authenticated endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/tourists/active
```

## 🌐 Production Deployment

### Backend Deployment

```bash
# Use production WSGI server
gunicorn app.main:app -w 4 -k uvicorn.workers.UnicornWorker --bind 0.0.0.0:8000
```

### Dashboard Deployment

```bash
# Build for production
npm run build

# Serve with a static server
npx serve -s dist -l 3000
```

### Environment Variables for Production

Update `.env` for production:

```env
VITE_API_BASE_URL=https://api.safehorizon.com/api
VITE_WS_BASE_URL=wss://api.safehorizon.com/api
```

## 📚 Additional Resources

- **API Documentation**: `http://localhost:8000/docs` (Swagger UI)
- **Backend Repository**: [SafeHorizon Backend](link-to-repo)
- **API Endpoints Reference**: See `API_ENDPOINTS.md`
- **Testing Scripts**: See `test_api_endpoints.py`

## 🆘 Support

If you encounter issues:

1. Check the API test page for connection status
2. Review browser console for errors
3. Check backend logs for API errors
4. Verify all environment variables are correct
5. Ensure all required services (database, Redis) are running

For development support, refer to the project documentation or create an issue in the repository.

---

**Note**: This guide assumes you have access to the SafeHorizon backend repository. If you don't have access to the backend, you'll need to implement a compatible API server based on the `API_ENDPOINTS.md` specification.