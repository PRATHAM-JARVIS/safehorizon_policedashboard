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
    // In a real app, this would generate and download a PDF
    console.log('Exporting E-FIR to PDF:', efir.efir_id);
    
    // Format location for display
    const locationStr = efir.location
      ? (efir.location.lat && efir.location.lon
          ? `${efir.location.lat}, ${efir.location.lon}`
          : efir.location.description || 'N/A')
      : 'N/A';
    
    // Mock PDF generation
    const pdfContent = `
      E-FIR Report
      ============
      
      E-FIR Number: ${efir.fir_number}
      E-FIR ID: ${efir.efir_id}
      Alert ID: ${efir.alert_id}
      
      Tourist Information:
      Name: ${efir.tourist?.name || 'N/A'}
      Email: ${efir.tourist?.email || 'N/A'}
      Phone: ${efir.tourist?.phone || 'N/A'}
      
      Incident Details:
      Type: ${efir.incident_type}
      Severity: ${efir.severity}
      Description: ${efir.description || 'N/A'}
      
      Location: ${locationStr}
      Incident Time: ${new Date(efir.incident_timestamp).toLocaleString()}
      Generated: ${new Date(efir.generated_at).toLocaleString()}
      
      Officer: ${efir.officer?.name || 'Not assigned'}
      Officer Notes: ${efir.officer_notes || 'N/A'}
      
      Blockchain Information:
      Transaction ID: ${efir.blockchain_tx_id}
      Block Hash: ${efir.block_hash}
      Chain ID: ${efir.chain_id}
      Verified: ${efir.is_verified ? 'Yes' : 'No'}
    `;
    
    // Create and download a text file (in real app, this would be PDF)
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${efir.fir_number}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const verifyBlockchainHash = () => {
    // Mock blockchain verification
    alert(`Blockchain verification for transaction:\n\n${efir.blockchain_tx_id}\n\nStatus: VERIFIED ✓\nBlock Hash: ${efir.block_hash}\nChain: ${efir.chain_id}\nTimestamp: ${new Date(efir.generated_at).toISOString()}`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" style={{ zIndex: 10000, position: 'relative' }}>
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>E-FIR Details - {efir.fir_number}</span>
                <Badge variant={(efir.incident?.status === 'closed' || efir.is_verified) ? 'success' : 'warning'}>
                  {efir.incident?.status || (efir.is_verified ? 'verified' : 'pending')}
                </Badge>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Incident Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">E-FIR Number:</span>
                      <span className="font-mono">{efir.fir_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">E-FIR ID:</span>
                      <span className="font-mono">{efir.efir_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Alert ID:</span>
                      <span className="font-mono">{efir.alert_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Incident Type:</span>
                      <Badge variant="outline" className="capitalize">{efir.incident_type}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Severity:</span>
                      <Badge variant={efir.severity === 'critical' ? 'destructive' : efir.severity === 'high' ? 'warning' : 'secondary'} className="capitalize">
                        {efir.severity}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tourist:</span>
                      <div className="text-right">
                        <div>{efir.tourist?.name || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">{efir.tourist?.email}</div>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-mono text-xs text-right">
                        {efir.location
                          ? (efir.location.lat && efir.location.lon
                              ? `${efir.location.lat.toFixed(4)}, ${efir.location.lon.toFixed(4)}`
                              : efir.location.description || 'N/A')
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Report Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Report Source:</span>
                      <Badge variant="outline" className="capitalize">{efir.report_source}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Officer:</span>
                      <span>{efir.officer?.name || 'Not assigned'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Incident Time:</span>
                      <span className="text-xs">{new Date(efir.incident_timestamp).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Generated on:</span>
                      <span className="text-xs">{new Date(efir.generated_at).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Verified:</span>
                      <Badge variant={efir.is_verified ? 'success' : 'secondary'}>
                        {efir.is_verified ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blockchain Information */}
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Hash className="w-4 h-4 mr-2" />
                    Blockchain Verification
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground">Blockchain Transaction ID:</label>
                      <div className="mt-1 p-2 bg-muted rounded font-mono text-xs break-all">
                        {efir.blockchain_tx_id || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Block Hash:</label>
                      <div className="mt-1 p-2 bg-muted rounded font-mono text-xs break-all">
                        {efir.block_hash || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Chain ID:</label>
                      <div className="mt-1 p-2 bg-muted rounded font-mono text-xs">
                        {efir.chain_id || 'N/A'}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={verifyBlockchainHash}
                      className="w-full"
                      disabled={!efir.blockchain_tx_id}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verify on Blockchain
                    </Button>
                    <div className="text-xs text-muted-foreground">
                      This E-FIR is cryptographically secured and immutable on the blockchain.
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button 
                      onClick={handleExportPDF}
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export as PDF
                    </Button>
                    <Button variant="outline" className="w-full">
                      <MapPin className="w-4 h-4 mr-2" />
                      View on Map
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Follow-up
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Incident Details */}
            <div className="mt-6 border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Incident Description</h3>
              <div className="bg-muted p-4 rounded text-sm">
                {efir.description || 'No description provided'}
              </div>
              {efir.officer_notes && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2 text-sm">Officer Notes:</h4>
                  <div className="bg-muted p-3 rounded text-sm">
                    {efir.officer_notes}
                  </div>
                </div>
              )}
              {efir.incident?.resolution_notes && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2 text-sm">Resolution Notes:</h4>
                  <div className="bg-muted p-3 rounded text-sm">
                    {efir.incident.resolution_notes}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="mt-6 flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={handleExportPDF}>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EFIRDetailModal;