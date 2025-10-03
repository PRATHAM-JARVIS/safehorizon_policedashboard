/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle, Phone, MapPin, Activity, X, CheckCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    const duration = toast.duration || 5000;
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  const toast = useCallback((options) => {
    return addToast(options);
  }, [addToast]);

  toast.success = (title, description) => addToast({ type: 'success', title, description });
  toast.error = (title, description) => addToast({ type: 'error', title, description });
  toast.warning = (title, description) => addToast({ type: 'warning', title, description });
  toast.info = (title, description) => addToast({ type: 'info', title, description });
  toast.alert = (alert) => addToast({ type: 'alert', alert, duration: alert.severity === 'critical' ? 0 : 10000 });

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-md pointer-events-none">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

const Toast = ({ toast, onRemove }) => {
  const getIcon = () => {
    if (toast.type === 'alert') {
      const alertType = toast.alert?.type || toast.alert?.alert_type;
      switch (alertType) {
        case 'sos':
        case 'sos_alert':
          return <Phone className="w-5 h-5" />;
        case 'geofence':
        case 'geofence_violation':
          return <MapPin className="w-5 h-5" />;
        case 'anomaly':
        case 'anomaly_detected':
          return <Activity className="w-5 h-5" />;
        default:
          return <AlertTriangle className="w-5 h-5" />;
      }
    }
    
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getColors = () => {
    if (toast.type === 'alert') {
      const severity = toast.alert?.severity;
      switch (severity) {
        case 'critical':
          return 'bg-red-500 text-white border-red-600';
        case 'high':
          return 'bg-orange-500 text-white border-orange-600';
        case 'medium':
          return 'bg-yellow-500 text-white border-yellow-600';
        case 'low':
          return 'bg-blue-500 text-white border-blue-600';
        default:
          return 'bg-gray-700 text-white border-gray-800';
      }
    }

    switch (toast.type) {
      case 'success':
        return 'bg-green-500 text-white border-green-600';
      case 'error':
        return 'bg-red-500 text-white border-red-600';
      case 'warning':
        return 'bg-yellow-500 text-white border-yellow-600';
      case 'info':
        return 'bg-blue-500 text-white border-blue-600';
      default:
        return 'bg-gray-700 text-white border-gray-800';
    }
  };

  const getTitle = () => {
    if (toast.type === 'alert') {
      return toast.alert?.title || toast.alert?.description || `${toast.alert?.type || 'Alert'}`;
    }
    return toast.title;
  };

  const getDescription = () => {
    if (toast.type === 'alert') {
      const alert = toast.alert;
      return `Tourist: ${alert.tourist_name || alert.tourist?.name || `ID: ${alert.tourist_id}`}${alert.location?.address ? ` • ${alert.location.address}` : ''}`;
    }
    return toast.description;
  };

  return (
    <div
      className={`pointer-events-auto animate-in slide-in-from-right-full duration-300 ${
        toast.removing ? 'animate-out slide-out-to-right-full' : ''
      }`}
    >
      <div className={`rounded-lg border-2 shadow-lg p-4 min-w-[350px] ${getColors()}`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold mb-1">{getTitle()}</p>
            {getDescription() && (
              <p className="text-sm opacity-90">{getDescription()}</p>
            )}
            {toast.type === 'alert' && toast.alert?.severity && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs font-medium px-2 py-0.5 bg-white/20 rounded">
                  {toast.alert.severity.toUpperCase()}
                </span>
                <span className="text-xs opacity-75">
                  {new Date(toast.alert.created_at || toast.alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => onRemove(toast.id)}
            className="flex-shrink-0 hover:bg-white/20 rounded p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToastProvider;
