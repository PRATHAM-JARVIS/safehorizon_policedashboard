import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import { useAppStore } from './store/appStore.js';
import { WebSocketProvider } from './contexts/WebSocketContext.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';

// Layout and Auth
import Layout from './layouts/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Pages
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Tourists from './pages/Tourists.jsx';
import TouristDetail from './pages/TouristDetail.jsx';
import Alerts from './pages/Alerts.jsx';
import Zones from './pages/Zones.jsx';
import EFIRs from './pages/EFIRs.jsx';
import Emergency from './pages/Emergency.jsx';
import Admin from './pages/Admin.jsx';

// CSS imports for Leaflet
import 'leaflet/dist/leaflet.css';

function App() {
  const { isAuthenticated } = useAuth();
  const { isDarkMode } = useAppStore();

  // Apply dark mode class to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-background text-foreground">
          <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes with WebSocket */}
          <Route path="/" element={
            <ProtectedRoute>
              <WebSocketProvider>
                <Layout />
              </WebSocketProvider>
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tourists" element={<Tourists />} />
            <Route path="tourists/:id" element={<TouristDetail />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="zones" element={<Zones />} />
            <Route path="efirs" element={<EFIRs />} />
            <Route path="emergency" element={
              <ProtectedRoute requireAdmin={false}>
                <Emergency />
              </ProtectedRoute>
            } />
            <Route path="admin" element={
              <ProtectedRoute requireAdmin={true}>
                <Admin />
              </ProtectedRoute>
            } />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}export default App;
