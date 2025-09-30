// Utility functions for the application

export const formatDateTime = (dateString) => {
  if (!dateString) return 'Unknown';
  return new Date(dateString).toLocaleString();
};

export const formatDate = (dateString) => {
  if (!dateString) return 'Unknown';
  return new Date(dateString).toLocaleDateString();
};

export const formatTime = (dateString) => {
  if (!dateString) return 'Unknown';
  return new Date(dateString).toLocaleTimeString();
};

export const formatTimeAgo = (dateString) => {
  if (!dateString) return 'Unknown';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return date.toLocaleDateString();
};

export const formatCoordinates = (lat, lon, precision = 4) => {
  if (typeof lat !== 'number' || typeof lon !== 'number') return 'Unknown';
  return `${lat.toFixed(precision)}, ${lon.toFixed(precision)}`;
};

export const getSafetyScoreColor = (score) => {
  if (score >= 80) return 'success';
  if (score >= 50) return 'warning';
  return 'destructive';
};

export const getSafetyScoreLabel = (score) => {
  if (score >= 80) return 'Safe';
  if (score >= 50) return 'Caution';
  return 'Risk';
};

export const getSeverityColor = (severity) => {
  switch (severity) {
    case 'critical': return 'critical';
    case 'high': return 'destructive';
    case 'medium': return 'warning';
    case 'low': return 'success';
    default: return 'secondary';
  }
};

export const getAlertTypeIcon = (type) => {
  switch (type) {
    case 'sos': return 'Phone';
    case 'geofence': return 'MapPin';
    case 'anomaly': return 'Activity';
    default: return 'AlertTriangle';
  }
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const isValidCoordinates = (lat, lon) => {
  return (
    typeof lat === 'number' && 
    typeof lon === 'number' &&
    lat >= -90 && lat <= 90 &&
    lon >= -180 && lon <= 180
  );
};