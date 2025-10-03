import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { efirAPI } from '../api/services.js';
import {
  FileText,
  Download,
  User,
  MapPin,
  AlertTriangle,
  ArrowLeft,
  Shield,
  Clock,
  CheckCircle
} from 'lucide-react';

const EFIRDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [efir, setEfir] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEFIRDetail = async () => {
      try {
        setLoading(true);
        const response = await efirAPI.listEFIRs({ limit: 100, offset: 0 });
        const efirsList = response.efir_records || [];
        const foundEfir = efirsList.find(e => e.efir_id?.toString() === id || e.fir_number === id);
        setEfir(foundEfir || null);
      } catch (error) {
        console.error('Failed to fetch E-FIR details:', error);
        setEfir(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEFIRDetail();
  }, [id]);

  const handleExportPDF = () => {
    if (!efir) return;
    const locationStr = efir.location
      ? (efir.location.lat && efir.location.lon
          ? `${efir.location.lat}, ${efir.location.lon}`
          : efir.location.description || 'N/A')
      : 'N/A';
    
    const pdfContent = `E-FIR REPORT\n${'='.repeat(50)}\n\nE-FIR Number: ${efir.fir_number}\nE-FIR ID: ${efir.efir_id}\n\nTOURIST INFORMATION\nName: ${efir.tourist?.name || 'N/A'}\nEmail: ${efir.tourist?.email || 'N/A'}\nPhone: ${efir.tourist?.phone || 'N/A'}\n\nINCIDENT DETAILS\nType: ${efir.incident_type}\nSeverity: ${efir.severity}\nLocation: ${locationStr}\nDate: ${new Date(efir.incident_timestamp).toLocaleString()}\n\nDescription:\n${efir.description || 'No description provided'}\n\nOFFICER INFORMATION\nAssigned Officer: ${efir.officer?.name || 'Not assigned'}\nReport Source: ${efir.report_source || 'System'}\nGenerated: ${new Date(efir.generated_at).toLocaleString()}\nStatus: ${efir.incident?.status || 'Pending'}\n\nOFFICER NOTES:\n${efir.officer_notes || 'No notes added'}`;
    
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EFIR-${efir.fir_number}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading E-FIR details...</p>
        </div>
      </div>
    );
  }

  if (!efir) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <FileText className="w-20 h-20 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">E-FIR Not Found</h2>
          <p className="text-muted-foreground mb-6">The requested E-FIR record could not be found.</p>
          <Button onClick={() => navigate('/efirs')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to E-FIRs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Simple Header */}
      <div className="bg-white dark:bg-gray-900 border-b pb-6">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate('/efirs')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to E-FIRs
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">{efir.fir_number}</h1>
            </div>
            <p className="text-sm text-muted-foreground">Electronic First Information Report</p>
          </div>
          <div className="text-right">
            <Badge variant={efir.is_verified ? 'success' : 'secondary'} className="mb-2">
              {efir.is_verified ? '✓ Verified' : 'Pending'}
            </Badge>
            <div className="text-xs text-muted-foreground">
              {new Date(efir.generated_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incident Information */}
          <Card>
            <CardHeader className="border-b bg-muted/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Incident Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Key Incident Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Incident Type</label>
                  <div className="text-lg font-semibold capitalize">{efir.incident_type || 'Unknown'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Severity</label>
                  <Badge 
                    variant={efir.severity === 'critical' ? 'destructive' : efir.severity === 'high' ? 'warning' : 'secondary'} 
                    className="capitalize"
                  >
                    {efir.severity}
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="text-sm font-medium text-muted-foreground block mb-2">Location</label>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="font-mono text-sm">
                    {efir.location
                      ? (efir.location.lat && efir.location.lon
                          ? `${efir.location.lat.toFixed(6)}, ${efir.location.lon.toFixed(6)}`
                          : efir.location.description || 'Not available')
                      : 'Not available'
                    }
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="text-sm font-medium text-muted-foreground block mb-2">Date & Time</label>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">
                      {new Date(efir.incident_timestamp).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(efir.incident_timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {efir.description && (
                <div className="border-t pt-4">
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Description</label>
                  <p className="text-sm leading-relaxed">
                    {efir.description}
                  </p>
                </div>
              )}

              {/* Officer Notes */}
              {efir.officer_notes && (
                <div className="border-t pt-4">
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Officer Notes</label>
                  <p className="text-sm leading-relaxed">
                    {efir.officer_notes}
                  </p>
                </div>
              )}

              {/* Response Actions Taken */}
              <div className="border-t pt-4">
                <label className="text-sm font-medium text-muted-foreground block mb-2">Response Actions</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>E-FIR Generated</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(efir.generated_at).toLocaleTimeString()}
                    </span>
                  </div>
                  {efir.incident?.status === 'closed' && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Case Closed</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(efir.incident.closed_at || efir.generated_at).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Alerts */}
          <Card>
            <CardHeader className="border-b bg-muted/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Related Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 text-sm">
                {efir.alert_id && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Alert ID</label>
                    <div className="font-mono text-sm">{efir.alert_id}</div>
                  </div>
                )}
                {efir.incident?.id && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Incident ID</label>
                    <div className="font-mono text-sm">{efir.incident.id}</div>
                  </div>
                )}
                <Button variant="outline" size="sm" className="w-full mt-3">
                  View Related Alerts
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Officer Actions */}
          <Card>
            <CardHeader className="border-b bg-muted/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Officer Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <Button className="w-full" onClick={handleExportPDF}>
                <Download className="w-4 h-4 mr-2" />
                Export E-FIR Report
              </Button>
              
              <Button variant="outline" className="w-full">
                <User className="w-4 h-4 mr-2" />
                Contact Tourist
              </Button>
              
              <Button variant="outline" className="w-full">
                <MapPin className="w-4 h-4 mr-2" />
                View Location on Map
              </Button>
              
              <Button variant="outline" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Add Follow-up Notes
              </Button>
            </CardContent>
          </Card>

          {/* Additional Evidence */}
          <Card>
            <CardHeader className="border-b bg-muted/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Evidence & Attachments
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground text-center py-4">
                No evidence files attached
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Upload Evidence
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Tourist & Officer Info */}
        <div className="space-y-6">
          {/* Tourist Information */}
          <Card>
            <CardHeader className="border-b bg-muted/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Tourist Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">{efir.tourist?.name || 'Unknown Tourist'}</h3>
                <p className="text-sm text-muted-foreground">ID: {efir.tourist?.id || 'N/A'}</p>
              </div>

              <div className="space-y-3 pt-3 border-t">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Email</label>
                  <div className="text-sm">{efir.tourist?.email || 'Not provided'}</div>
                </div>

                {efir.tourist?.phone && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Phone</label>
                    <div className="text-sm">{efir.tourist.phone}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Report Metadata */}
          <Card>
            <CardHeader className="border-b bg-muted/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Report Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between pb-2 border-b">
                  <span className="text-muted-foreground">E-FIR ID</span>
                  <span className="font-mono">{efir.efir_id}</span>
                </div>
                <div className="flex justify-between pb-2 border-b">
                  <span className="text-muted-foreground">Source</span>
                  <Badge variant="outline" className="capitalize text-xs">{efir.report_source || 'System'}</Badge>
                </div>
                <div className="flex justify-between pb-2 border-b">
                  <span className="text-muted-foreground">Assigned Officer</span>
                  <span className="font-medium">{efir.officer?.name || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between pb-2 border-b">
                  <span className="text-muted-foreground">Generated</span>
                  <span>{new Date(efir.generated_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between pb-2 border-b">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={efir.incident?.status === 'closed' ? 'success' : 'secondary'} className="text-xs capitalize">
                    {efir.incident?.status || (efir.is_verified ? 'Verified' : 'Pending')}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Priority</span>
                  <Badge variant={efir.severity === 'critical' ? 'destructive' : efir.severity === 'high' ? 'warning' : 'secondary'} className="text-xs capitalize">
                    {efir.severity}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Case Management */}
          <Card>
            <CardHeader className="border-b bg-muted/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Case Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <User className="w-4 h-4 mr-2" />
                Reassign Officer
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Update Status
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Clock className="w-4 h-4 mr-2" />
                View History
              </Button>
              <Button variant="destructive" size="sm" className="w-full justify-start">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Close Case
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EFIRDetail;
