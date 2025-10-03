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
  Zap,
  Sun,
  Moon,
  Radio,
  Bell,
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
    { icon: Radio, label: 'Emergency', path: '/emergency' },
    ...(isAdmin ? [{ icon: Settings, label: 'Admin', path: '/admin' }] : []),
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={`${mobile ? 'w-full' : 'w-64'} bg-gradient-to-b from-card to-card/95 border-r border-border/50 h-full flex flex-col shadow-lg`}>
      {/* Enhanced Logo Section */}
      <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-primary to-primary/80 p-2.5 rounded-xl shadow-lg">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              SafeHorizon
            </h1>
            <p className="text-sm text-muted-foreground font-medium">Police Dashboard</p>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = window.location.pathname === item.path;
            
            return (
              <div key={item.path} className="relative">
                <button
                  onClick={() => {
                    navigate(item.path);
                    if (mobile) setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25 scale-105'
                      : 'hover:bg-accent/70 hover:text-accent-foreground hover:scale-102 hover:shadow-md'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg transition-colors duration-200 ${
                    isActive 
                      ? 'bg-primary-foreground/20' 
                      : 'bg-transparent group-hover:bg-accent-foreground/10'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="absolute right-3 w-1.5 h-1.5 bg-primary-foreground rounded-full animate-pulse" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Enhanced User Info Section */}
      <div className="p-4 border-t border-border/50 bg-gradient-to-r from-muted/30 to-muted/50">
        <div className="flex items-center space-x-3 mb-4 p-3 rounded-xl bg-background/60 border border-border/50">
          <div className="bg-gradient-to-br from-primary to-primary/80 p-2 rounded-full shadow-sm">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.email}</p>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-xs text-muted-foreground capitalize font-medium">{user?.role} • Online</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="h-10 border-border/50 hover:bg-accent/70 transition-all duration-200"
          >
            {isDarkMode ? (
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4" />
                <span className="text-xs">Light</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Moon className="h-4 w-4" />
                <span className="text-xs">Dark</span>
              </div>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="h-10 border-border/50 hover:bg-destructive/20 hover:text-destructive hover:border-destructive/50 transition-all duration-200"
          >
            <div className="flex items-center space-x-2">
              <LogOut className="h-4 w-4" />
              <span className="text-xs">Logout</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Enhanced Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-background shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
              <h2 className="text-lg font-semibold flex items-center space-x-2">
                <Menu className="h-5 w-5 text-primary" />
                <span>Navigation</span>
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="hover:bg-destructive/20 hover:text-destructive"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Enhanced Topbar */}
        <header className="bg-gradient-to-r from-card to-card/95 border-b border-border/50 px-4 py-3 lg:px-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden hover:bg-primary/10"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-6 bg-gradient-to-b from-primary to-primary/60 rounded-full" />
                <h2 className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                  {menuItems.find(item => item.path === window.location.pathname)?.label || 'Dashboard'}
                </h2>
              </div>
            </div>
            {/* Optional: Add search or other actions here */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="text-sm text-muted-foreground">
                Welcome back, <span className="font-medium">{user?.email?.split('@')[0]}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Enhanced Main Content Area */}
        <main className="flex-1 overflow-auto p-4 lg:p-6 bg-gradient-to-br from-background to-muted/20">
          <Outlet />
        </main>
      </div>
      
      {/* Real-time Alert Notifications */}
      <AlertNotificationBridge />
    </div>
  );
};

export default Layout;