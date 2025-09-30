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
    console.log('Exporting E-FIR to PDF:', efir.id);
    
    // Mock PDF generation
    const pdfContent = `
      E-FIR Report
      ============
      
      E-FIR ID: ${efir.id}
      Alert ID: ${efir.alert_id}
      Tourist: ${efir.tourist_name}
      
      Incident Details:
      ${efir.incident_details}
      
      Location: ${efir.location}
      Date: ${new Date(efir.created_at).toLocaleString()}
      Created by: ${efir.created_by}
      
      Blockchain Hash: ${efir.blockchain_hash}
      Status: ${efir.status}
    `;
    
    // Create and download a text file (in real app, this would be PDF)
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EFIR_${efir.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const verifyBlockchainHash = () => {
    // Mock blockchain verification
    alert(`Blockchain verification for hash: ${efir.blockchain_hash}\n\nStatus: VERIFIED ✓\nBlock: #123456\nTimestamp: ${new Date(efir.created_at).toISOString()}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>E-FIR Details - {efir.id}</span>
                <Badge variant={efir.status === 'verified' ? 'success' : 'warning'}>
                  {efir.status}
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
                      <span className="text-muted-foreground">E-FIR ID:</span>
                      <span className="font-mono">{efir.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Alert ID:</span>
                      <span className="font-mono">{efir.alert_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Incident Type:</span>
                      <Badge variant="outline">{efir.incident_type}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tourist:</span>
                      <span>{efir.tourist_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span>{efir.location}</span>
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
                      <span className="text-muted-foreground">Created by:</span>
                      <span>{efir.created_by}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created on:</span>
                      <span>{new Date(efir.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={efir.status === 'verified' ? 'success' : 'warning'}>
                        {efir.status}
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
                      <label className="text-sm text-muted-foreground">Blockchain Hash:</label>
                      <div className="mt-1 p-2 bg-muted rounded font-mono text-xs break-all">
                        {efir.blockchain_hash}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={verifyBlockchainHash}
                      className="w-full"
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
              <h3 className="font-semibold mb-3">Incident Details</h3>
              <div className="bg-muted p-4 rounded text-sm">
                {efir.incident_details}
              </div>
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