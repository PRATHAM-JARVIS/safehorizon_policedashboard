# SafeHorizon Police Dashboard

A modern React-based dashboard for police authorities to monitor tourist safety in real-time. Built with React, TailwindCSS, and real-time WebSocket integration.

## 🚀 Features

### Authentication & Security
- Secure authority login with JWT tokens
- Role-based access control (Authority/Admin)
- Automatic token refresh and session management

### Dashboard Overview
- Real-time statistics (Active tourists, Alerts, SOS count)
- Live alerts feed with WebSocket integration
- Interactive charts and data visualization
- Interactive map showing tourist locations and restricted zones

### Tourist Management
- Track active tourists with safety scores
- Detailed tourist profiles with location history
- Search and filter capabilities
- Trip route visualization

### Alert Management
- Real-time alert monitoring with severity levels
- Acknowledge and resolve incidents
- Filter alerts by type, severity, and date
- Generate E-FIR reports for incidents

### Zone Management
- Create and manage restricted/risky/safe zones
- Interactive map polygon drawing
- Zone type categorization
- Bulk zone operations

### E-FIR System
- Blockchain-backed incident reports
- PDF export functionality
- Hash verification for authenticity
- Complete incident documentation

### Admin Tools
- System health monitoring
- User management and suspension
- Database and service status
- Advanced administrative controls

## 🛠️ Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: TailwindCSS with shadcn/ui components
- **State Management**: Zustand
- **Routing**: React Router DOM
- **HTTP Client**: Axios with interceptors
- **Maps**: Leaflet with React Leaflet
- **Charts**: Recharts
- **Icons**: Lucide React
- **WebSocket**: Native WebSocket with reconnection
- **Build Tool**: Vite

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd police
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
# Create .env file
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_WS_BASE_URL=ws://localhost:8000/ws
```

4. Start development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## 🔧 Configuration

### API Configuration
Update `src/api/client.js` to configure:
- Base API URL
- Authentication headers
- Request/response interceptors

### WebSocket Configuration
Update `src/hooks/useWebSocket.js` for:
- WebSocket server URL
- Reconnection settings
- Message handling

### Map Configuration
Update map components for:
- Map provider (Leaflet/Mapbox)
- Default coordinates
- Zoom levels

## 📱 Responsive Design

The dashboard is fully responsive and optimized for:
- Desktop (1920x1080+)
- Tablet (768px - 1024px)
- Mobile (480px - 768px)

## 🔐 Security Features

- JWT token-based authentication
- Secure HTTP-only cookie storage
- CSRF protection
- Role-based route protection
- Input validation and sanitization

## 📊 Real-time Features

- Live alert notifications
- Tourist location tracking
- System status monitoring
- WebSocket connection with auto-reconnect

## 🎨 UI Components

### Core Components
- `Button` - Multi-variant button component
- `Card` - Container component with variants
- `Input` - Form input with validation
- `Badge` - Status indicators
- `Table` - Data tables with sorting

### Layout Components
- `Layout` - Main app layout with sidebar
- Responsive navigation
- Dark mode toggle
- User profile dropdown

## 📋 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🔗 API Integration

The dashboard integrates with the SafeHorizon FastAPI backend:

### Authentication Endpoints
- `POST /auth/login-authority` - Authority login
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - Logout

### Tourist Endpoints
- `GET /tourists/active` - Active tourists list
- `GET /tourist/{id}/track` - Tourist tracking data
- `GET /tourist/{id}/alerts` - Tourist alerts

### Alert Endpoints
- `GET /alerts/recent` - Recent alerts
- `POST /incident/acknowledge` - Acknowledge incident
- `POST /incident/close` - Close incident
- `WS /alerts/subscribe` - Real-time alerts

### Zone Endpoints
- `GET /zones/list` - List all zones
- `POST /zones/create` - Create new zone
- `DELETE /zones/{id}` - Delete zone

### E-FIR Endpoints
- `POST /efir/generate` - Generate E-FIR
- `GET /efir/list` - List E-FIRs

### Admin Endpoints
- `GET /system/status` - System health
- `GET /users/list` - User management
- `PUT /users/{id}/suspend` - Suspend user

## 🚀 Deployment

### Development
```bash
npm run dev
```
Access at: http://localhost:5173

### Production
```bash
npm run build
npm run preview
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
```

## 🧪 Testing

The application includes:
- Component integration testing
- API service testing
- WebSocket connection testing
- Responsive design testing

## 📈 Performance

- Code splitting with dynamic imports
- Lazy loading of components
- Optimized bundle size
- WebSocket connection pooling
- Efficient state management

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation

---

**SafeHorizon Police Dashboard** - Ensuring tourist safety through real-time monitoring and intelligent alert systems.
