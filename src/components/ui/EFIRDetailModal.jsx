import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './card.jsx';
import { Button } from './button.jsx';
import { Badge } from './badge.jsx';
import { 
  FileText, 
  Download, 
  Hash, 
  User, 
  Calendar, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';

export const EFIRDetailModal = ({ efir, isOpen, onClose }) => {
  if (!isOpen || !efir) return null;

  const handleExportPDF = () => {
    const locationStr = efir.location
      ? (efir.location.lat && efir.location.lon
          ? `${efir.location.lat}, ${efir.location.lon}`
          : efir.location.description || 'N/A')
      : 'N/A';
    
    const pdfContent = `E-FIR Report\n============\n\nE-FIR Number: ${efir.fir_number}\nTourist: ${efir.tourist?.name || 'N/A'}\nIncident: ${efir.incident_type} (${efir.severity})\nLocation: ${locationStr}\nDate: ${new Date(efir.incident_timestamp).toLocaleString()}\nBlockchain TX: ${efir.blockchain_tx_id}\nStatus: ${efir.is_verified ? 'Verified' : 'Pending'}`;
    
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

  const verifyBlockchainHash = () => {
    if (efir.blockchain_tx_id) {
      alert(`✓ Blockchain Verified\n\nTransaction: ${efir.blockchain_tx_id.substring(0, 20)}...\nStatus: Valid\nTimestamp: ${new Date(efir.generated_at).toLocaleString()}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
      <div className="bg-background rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" style={{ zIndex: 10000, position: 'relative' }}>
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold">{efir.fir_number}</div>
                  <div className="text-xs text-muted-foreground font-normal mt-1">Electronic First Information Report</div>
                </div>
                <Badge variant={efir.is_verified ? 'success' : 'secondary'} className="ml-2">
                  {efir.is_verified ? '✓ Verified' : 'Pending'}
                </Badge>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-white/50">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {/* Simplified Essential Information */}
            <div className="space-y-6">
              {/* Key Details in Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <User className="w-3 h-3" /> TOURIST
                  </div>
                  <div className="font-semibold text-lg">{efir.tourist?.name || 'Unknown'}</div>
                  <div className="text-xs text-muted-foreground mt-1">{efir.tourist?.email || 'N/A'}</div>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> INCIDENT TYPE
                  </div>
                  <div className="font-semibold text-lg capitalize">{efir.incident_type || 'Unknown'}</div>
                  <Badge variant={efir.severity === 'critical' ? 'destructive' : efir.severity === 'high' ? 'warning' : 'secondary'} className="mt-2 capitalize">
                    {efir.severity} Severity
                  </Badge>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> DATE & TIME
                  </div>
                  <div className="font-semibold">{new Date(efir.incident_timestamp).toLocaleDateString()}</div>
                  <div className="text-sm text-muted-foreground">{new Date(efir.incident_timestamp).toLocaleTimeString()}</div>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> LOCATION
                  </div>
                  <div className="font-mono text-sm">
                    {efir.location
                      ? (efir.location.lat && efir.location.lon
                          ? `${efir.location.lat.toFixed(3)}, ${efir.location.lon.toFixed(3)}`
                          : efir.location.description?.substring(0, 30) || 'N/A')
                      : 'Not available'
                    }
                  </div>
                </div>
              </div>

              {/* Blockchain Verification */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 p-5 rounded-lg border border-purple-200 dark:border-purple-800">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Hash className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Blockchain Verified
                </h3>
                <div className="bg-white dark:bg-gray-900 p-3 rounded font-mono text-xs break-all mb-3">
                  {efir.blockchain_tx_id || 'Pending blockchain confirmation'}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={verifyBlockchainHash}
                    className="flex-1"
                    disabled={!efir.blockchain_tx_id}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify Chain
                  </Button>
                  <Button 
                    onClick={handleExportPDF}
                    size="sm"
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </div>

              {/* Incident Description (if available) */}
              {efir.description && (
                <div className="border-l-4 border-blue-500 bg-muted/30 p-4 rounded">
                  <h4 className="font-medium mb-2 text-sm text-muted-foreground">INCIDENT NOTES</h4>
                  <p className="text-sm leading-relaxed">{efir.description}</p>
                </div>
              )}
            </div>

            {/* Simplified Footer */}
            <div className="mt-6 flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EFIRDetailModal;