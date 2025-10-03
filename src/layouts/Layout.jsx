import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useAppStore } from '../store/appStore.js';
import AlertNotificationBridge from '../components/AlertNotificationBridge.jsx';
import {
  Shield,
  BarChart3,
  Users,
  AlertTriangle,
  Map,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Sun,
  Moon,
} from 'lucide-react';
import { Button } from '../components/ui/button.jsx';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { isDarkMode, toggleTheme } = useAppStore();
  const navigate = useNavigate();

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Tourists', path: '/tourists' },
    { icon: AlertTriangle, label: 'Alerts', path: '/alerts' },
    { icon: Map, label: 'Zones', path: '/zones' },
    { icon: FileText, label: 'E-FIRs', path: '/efirs' },
    { icon: Bell, label: 'Broadcast', path: '/broadcast' },
    ...(isAdmin ? [{ icon: Settings, label: 'Admin', path: '/admin' }] : []),
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={`${mobile ? 'w-full' : 'w-64'} bg-white border-r border-gray-200 h-full flex flex-col`}>
      {/* Government Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="bg-primary p-2 rounded">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">SafeHorizon</h1>
            <p className="text-sm text-gray-600">Police Dashboard</p>
          </div>
        </div>
      </div>

      {/* Simple Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = window.location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  if (mobile) setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* User Info Section */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="bg-gray-200 p-2 rounded-full">
            <Shield className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.email || 'Officer'}
            </p>
            <p className="text-xs text-gray-500">
              {user?.role === 'admin' ? 'Administrator' : 'Authority'}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="flex-1"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex-1"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AlertNotificationBridge />
      
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary p-1.5 rounded">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">SafeHorizon</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex h-full lg:h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="bg-black bg-opacity-50 flex-1" onClick={() => setSidebarOpen(false)} />
            <div className="bg-white w-64 h-full">
              <Sidebar mobile />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;