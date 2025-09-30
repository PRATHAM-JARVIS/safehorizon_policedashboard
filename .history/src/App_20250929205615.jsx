import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import { useAppStore } from './store/appStore.js';

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
import Admin from './pages/Admin.jsx';
import APITest from './pages/APITest.jsx';
import CSSTest from './pages/CSSTest.jsx';

// CSS imports for Leaflet (if used)
import 'leaflet/dist/leaflet.css';

function App() {
  const { isAuthenticated } = useAuth();
  const { isDarkMode } = useAppStore();

  // Apply dark mode class to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/css-test" element={<CSSTest />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tourists" element={<Tourists />} />
            <Route path="tourists/:id" element={<TouristDetail />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="zones" element={<Zones />} />
            <Route path="efirs" element={<EFIRs />} />
            <Route path="api-test" element={<APITest />} />
            <Route path="css-test" element={<CSSTest />} />
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
  );
}

export default App;
