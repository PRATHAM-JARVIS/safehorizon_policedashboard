import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card.jsx';
import { Button } from './ui/button.jsx';
import { Badge } from './ui/badge.jsx';
import { 
  AlertTriangle, 
  Info, 
  Shield, 
  Zap, 
  MapPin, 
  Globe,
  Copy,
  Check
} from 'lucide-react';

const BroadcastTemplates = ({ onSelectTemplate, onClose }) => {
  const [copiedTemplate, setCopiedTemplate] = useState(null);

  const templates = [
    // LOW Severity Templates
    {
      id: 'helpline',
      title: '📢 Tourist Helpline',
      message: '24/7 Helpline: 1800-111-363. Available for all tourist assistance.',
      severity: 'LOW',
      type: 'all',
      category: 'Information',
      icon: Info,
      color: 'success'
    },
    {
      id: 'general_safety',
      title: '🚨 General Safety Advisory',
      message: 'Please carry valid ID and emergency contacts at all times. Stay safe!',
      severity: 'LOW',
      type: 'all',
      category: 'Safety',
      icon: Shield,
      color: 'success'
    },
    {
      id: 'monument_closure',
      title: '📍 Monument Alert',
      message: 'India Gate temporarily closed for maintenance. Opens at 2 PM.',
      severity: 'LOW',
      type: 'radius',
      category: 'Location',
      icon: MapPin,
      color: 'success',
      center_latitude: 28.6129,
      center_longitude: 77.2295,
      radius_km: 1.0
    },

    // MEDIUM Severity Templates
    {
      id: 'pickpocketing',
      title: '⚠️ Pickpocketing Alert',
      message: 'Increased pickpocketing reported in tourist areas. Keep valuables secure.',
      severity: 'MEDIUM',
      type: 'all',
      category: 'Security',
      icon: AlertTriangle,
      color: 'warning'
    },
    {
      id: 'traffic_alert',
      title: '📍 Local Traffic Alert',
      message: 'Heavy traffic near India Gate. Use alternate routes.',
      severity: 'MEDIUM',
      type: 'radius',
      category: 'Traffic',
      icon: MapPin,
      color: 'warning',
      center_latitude: 28.6129,
      center_longitude: 77.2295,
      radius_km: 5.0
    },
    {
      id: 'metro_delays',
      title: '🚦 Metro Advisory',
      message: 'Metro delays on Blue Line. Plan your travel accordingly.',
      severity: 'MEDIUM',
      type: 'radius',
      category: 'Transport',
      icon: MapPin,
      color: 'warning',
      center_latitude: 28.6304,
      center_longitude: 77.2177,
      radius_km: 10.0
    },
    {
      id: 'weather_warning',
      title: '⚠️ Weather Warning',
      message: 'Heavy rain expected in North Delhi. Carry umbrella.',
      severity: 'MEDIUM',
      type: 'radius',
      category: 'Weather',
      icon: AlertTriangle,
      color: 'warning',
      center_latitude: 28.7041,
      center_longitude: 77.1025,
      radius_km: 20.0
    },

    // HIGH Severity Templates
    {
      id: 'security_alert',
      title: '🚨 Security Alert',
      message: 'Protest march at 5 PM near Connaught Place. Avoid the area.',
      severity: 'HIGH',
      type: 'radius',
      category: 'Security',
      icon: Shield,
      color: 'destructive',
      center_latitude: 28.6304,
      center_longitude: 77.2177,
      radius_km: 3.0
    },
    {
      id: 'zone_closure',
      title: '🚧 Zone Maintenance Alert',
      message: 'This zone is temporarily closed for maintenance work. Please avoid the area.',
      severity: 'HIGH',
      type: 'zone',
      category: 'Maintenance',
      icon: MapPin,
      color: 'destructive'
    },

    // CRITICAL Severity Templates
    {
      id: 'emergency_weather',
      title: '🔴 EMERGENCY: Weather Alert',
      message: 'Severe weather warning! Heavy rainfall expected. Seek shelter immediately.',
      severity: 'CRITICAL',
      type: 'all',
      category: 'Emergency',
      icon: Zap,
      color: 'critical'
    },
    {
      id: 'evacuation',
      title: '🔴 EVACUATION ALERT',
      message: 'Immediate evacuation required in affected areas. Follow emergency services instructions.',
      severity: 'CRITICAL',
      type: 'radius',
      category: 'Emergency',
      icon: Zap,
      color: 'critical',
      center_latitude: 28.6129,
      center_longitude: 77.2295,
      radius_km: 2.0
    }
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'critical';
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'success';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'radius': return MapPin;
      case 'zone': return MapPin;
      case 'all': return Globe;
      default: return Globe;
    }
  };

  const handleSelectTemplate = (template) => {
    onSelectTemplate(template);
    onClose();
  };

  const handleCopyTemplate = (template) => {
    const templateText = `${template.title}\n${template.message}\nSeverity: ${template.severity}`;
    navigator.clipboard.writeText(templateText);
    setCopiedTemplate(template.id);
    setTimeout(() => setCopiedTemplate(null), 2000);
  };

  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.severity]) {
      acc[template.severity] = [];
    }
    acc[template.severity].push(template);
    return acc;
  }, {});

  const severityOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Broadcast Templates</h2>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      <p className="text-muted-foreground">
        Select a pre-configured template to quickly create broadcasts. Templates include appropriate severity levels and content.
      </p>

      {severityOrder.map(severity => {
        const templatesForSeverity = groupedTemplates[severity];
        if (!templatesForSeverity) return null;

        return (
          <Card key={severity}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Badge variant={getSeverityColor(severity)}>
                  {severity}
                </Badge>
                <span>{severity} Severity Templates</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templatesForSeverity.map(template => {
                  const IconComponent = template.icon;
                  const TypeIcon = getTypeIcon(template.type);
                  
                  return (
                    <Card key={template.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <IconComponent className="w-5 h-5 text-muted-foreground" />
                            <TypeIcon className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{template.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {template.message}
                        </p>
                        
                        {template.type === 'radius' && (
                          <div className="text-xs text-muted-foreground mb-3">
                            <p>📍 Center: {template.center_latitude}, {template.center_longitude}</p>
                            <p>📏 Radius: {template.radius_km} km</p>
                          </div>
                        )}
                        
                        {template.type === 'zone' && (
                          <div className="text-xs text-muted-foreground mb-3">
                            <p>🏷️ Zone-based broadcast</p>
                          </div>
                        )}
                        
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleSelectTemplate(template)}
                            className="flex-1"
                          >
                            Use Template
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCopyTemplate(template)}
                          >
                            {copiedTemplate === template.id ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default BroadcastTemplates;
