import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table.jsx';
import EFIRDetailModal from '../components/ui/EFIRDetailModal.jsx';
import {
  FileText,
  Search,
  Download,
  Eye,
  Hash,
  Calendar,
  User,
  MapPin,
  Shield
} from 'lucide-react';

const EFIRs = () => {
  const [efirs, setEfirs] = useState([]);
  const [filteredEfirs, setFilteredEfirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEfir, setSelectedEfir] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Mock E-FIR data since we don't have a specific API endpoint for listing E-FIRs
  useEffect(() => {
    const mockEfirs = [
      {
        id: 'EFIR2025092901',
        alert_id: 123,
        tourist_name: 'John Doe',
        incident_type: 'SOS Alert',
        incident_details: 'Tourist triggered emergency SOS alert in downtown area',
        location: '35.6762, 139.6503',
        blockchain_hash: '0x1234567890abcdef1234567890abcdef12345678',
        created_at: '2025-09-29T10:24:51.720256+00:00',
        created_by: 'Officer Smith',
        status: 'verified'
      },
      {
        id: 'EFIR2025092902',
        alert_id: 124,
        tourist_name: 'Jane Smith',
        incident_type: 'Geofence Violation',
        incident_details: 'Tourist entered restricted zone near government buildings',
        location: '35.6763, 139.6504',
        blockchain_hash: '0xabcdef1234567890abcdef1234567890abcdef12',
        created_at: '2025-09-29T08:15:30.123456+00:00',
        created_by: 'Officer Johnson',
        status: 'verified'
      },
      {
        id: 'EFIR2025092903',
        alert_id: 125,
        tourist_name: 'Mike Wilson',
        incident_type: 'Anomaly Detection',
        incident_details: 'Unusual movement pattern detected, potential safety concern',
        location: '35.6764, 139.6505',
        blockchain_hash: '0x567890abcdef1234567890abcdef1234567890ab',
        created_at: '2025-09-28T16:45:22.789012+00:00',
        created_by: 'Officer Davis',
        status: 'verified'
      }
    ];

    setTimeout(() => {
      setEfirs(mockEfirs);
      setFilteredEfirs(mockEfirs);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = efirs.filter(efir =>
        efir.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        efir.tourist_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        efir.incident_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        efir.created_by?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEfirs(filtered);
    } else {
      setFilteredEfirs(efirs);
    }
  }, [efirs, searchTerm]);

  const handleExportPDF = (efir) => {
    // In a real application, this would generate and download a PDF
    console.log('Exporting E-FIR to PDF:', efir.id);
    // You could use libraries like jsPDF or html2pdf for client-side PDF generation
    // Or make an API call to a backend service that generates PDFs
  };

  const handleViewBlockchain = (hash) => {
    // In a real application, this would open a blockchain explorer
    console.log('Viewing blockchain transaction:', hash);
    // Example: window.open(`https://etherscan.io/tx/${hash}`, '_blank');
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <FileText className="w-8 h-8" />
            <span>E-FIR Management</span>
          </h1>
          <p className="text-muted-foreground">
            Electronic First Information Reports with blockchain verification
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-lg px-3 py-1">
            {filteredEfirs.length} Reports
          </Badge>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total E-FIRs</p>
                <p className="text-xl font-bold text-blue-600">{efirs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-xl font-bold text-green-600">
                  {efirs.filter(e => e.status === 'verified').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-full">
                <Calendar className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-xl font-bold text-yellow-600">
                  {efirs.filter(e => new Date(e.created_at).getMonth() === new Date().getMonth()).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
                <Hash className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Blockchain</p>
                <p className="text-xl font-bold text-purple-600">100%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search E-FIRs by ID, tourist name, incident type, or officer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* E-FIRs Table */}
      <Card>
        <CardHeader>
          <CardTitle>E-FIR History</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEfirs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No E-FIRs found</h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? 'Try adjusting your search criteria'
                  : 'No Electronic FIRs have been generated yet'
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>E-FIR ID</TableHead>
                  <TableHead>Tourist</TableHead>
                  <TableHead>Incident Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEfirs.map((efir) => (
                  <TableRow key={efir.id}>
                    <TableCell>
                      <div className="font-mono text-sm font-medium">{efir.id}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{efir.tourist_name}</div>
                        <div className="text-sm text-muted-foreground">Alert #{efir.alert_id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{efir.incident_type}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono">{efir.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{efir.created_by}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDateTime(efir.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(efir.status)} className="capitalize">
                        {efir.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedEfir(efir);
                            setShowDetailModal(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExportPDF(efir)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewBlockchain(efir.blockchain_hash)}
                          title="View on Blockchain"
                        >
                          <Hash className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Blockchain Info */}
      <Card>
        <CardHeader>
          <CardTitle>Blockchain Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <Hash className="w-6 h-6 text-primary mt-1" />
              <div>
                <h4 className="font-medium mb-2">Tamper-Proof Records</h4>
                <p className="text-sm text-muted-foreground">
                  All E-FIRs are recorded on a blockchain network to ensure data integrity and 
                  prevent tampering. Each report receives a unique cryptographic hash that serves 
                  as proof of authenticity. Click the hash icon next to any E-FIR to view its 
                  blockchain transaction.
                </p>
                <div className="mt-3 flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Network Status: Online</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>All records verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* E-FIR Detail Modal */}
      <EFIRDetailModal
        efir={selectedEfir}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedEfir(null);
        }}
      />
    </div>
  );
};

export default EFIRs;