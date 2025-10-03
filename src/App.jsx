import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import { useAppStore } from './store/appStore.js';
import { WebSocketProvider } from './contexts/WebSocketContext.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';
import { ToastProvider } from './components/ui/toast.jsx';

// Layout and Auth (Keep these as they're needed immediately)
import Layout from './layouts/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Tourists = lazy(() => import('./pages/Tourists.jsx'));
const TouristDetail = lazy(() => import('./pages/TouristDetail.jsx'));
const Alerts = lazy(() => import('./pages/Alerts.jsx'));
const AlertDetail = lazy(() => import('./pages/AlertDetail.jsx'));
const Zones = lazy(() => import('./pages/Zones.jsx'));
const EFIRs = lazy(() => import('./pages/EFIRs.jsx'));
const EFIRDetail = lazy(() => import('./pages/EFIRDetail.jsx'));
const Broadcast = lazy(() => import('./pages/Broadcast.jsx'));
const Admin = lazy(() => import('./pages/Admin.jsx'));

// CSS imports for Leaflet
import 'leaflet/dist/leaflet.css';

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center space-y-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

function App() {
  const { isAuthenticated } = useAuth();
  const { isDarkMode } = useAppStore();

  // Apply dark mode class to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return (
    <ErrorBoundary>
      <ToastProvider>
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
            <Route path="dashboard" element={
              <Suspense fallback={<PageLoader />}>
                <Dashboard />
              </Suspense>
            } />
            <Route path="tourists" element={
              <Suspense fallback={<PageLoader />}>
                <Tourists />
              </Suspense>
            } />
            <Route path="tourists/:id" element={
              <Suspense fallback={<PageLoader />}>
                <TouristDetail />
              </Suspense>
            } />
            <Route path="alerts" element={
              <Suspense fallback={<PageLoader />}>
                <Alerts />
              </Suspense>
            } />
            <Route path="alerts/:id" element={
              <Suspense fallback={<PageLoader />}>
                <AlertDetail />
              </Suspense>
            } />
            <Route path="zones" element={
              <Suspense fallback={<PageLoader />}>
                <Zones />
              </Suspense>
            } />
            <Route path="efirs" element={
              <Suspense fallback={<PageLoader />}>
                <EFIRs />
              </Suspense>
            } />
            <Route path="efirs/:id" element={
              <Suspense fallback={<PageLoader />}>
                <EFIRDetail />
              </Suspense>
            } />
            <Route path="broadcast" element={
              <Suspense fallback={<PageLoader />}>
                <Broadcast />
              </Suspense>
            } />
            <Route path="admin" element={
              <ProtectedRoute requireAdmin={true}>
                <Suspense fallback={<PageLoader />}>
                  <Admin />
                </Suspense>
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
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
