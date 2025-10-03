import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table.jsx';
import { efirAPI } from '../api/services.js';
import {
  FileText,
  Search,
  Download,
  Eye,
  Hash,
  Calendar,
  User,
  MapPin,
  CheckCircle
} from 'lucide-react';

const EFIRs = () => {
  const navigate = useNavigate();
  const [efirs, setEfirs] = useState([]);
  const [filteredEfirs, setFilteredEfirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEFIRs = async () => {
      try {
        setLoading(true);
        // Use the documented authority E-FIR list endpoint
        const response = await efirAPI.listEFIRs({ limit: 100, offset: 0 });
        // Handle documented response structure: efir_records property
        const efirsList = response.efir_records || [];
        setEfirs(Array.isArray(efirsList) ? efirsList : []);
        setFilteredEfirs(Array.isArray(efirsList) ? efirsList : []);
      } catch (error) {
        console.error('Failed to fetch E-FIRs:', error);
        // Show error state - E-FIR endpoint may not be fully implemented yet
        setEfirs([]);
        setFilteredEfirs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEFIRs();
    
    // Set up periodic refresh for E-FIRs (every 30 seconds)
    const refreshInterval = setInterval(fetchEFIRs, 30000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = efirs.filter(efir =>
        efir.efir_id?.toString().includes(searchTerm.toLowerCase()) ||
        efir.fir_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        efir.blockchain_tx_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        efir.tourist?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        efir.incident_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        efir.officer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEfirs(filtered);
    } else {
      setFilteredEfirs(efirs);
    }
  }, [efirs, searchTerm]);

  const handleExportPDF = async (efir) => {
    try {
      const pdfBlob = await efirAPI.exportEFIRPDF(efir.efir_id);
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `EFIR-${efir.fir_number || efir.efir_id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF. This feature may not be available yet.');
    }
  };

  const handleViewBlockchain = (hash) => {
    // In a real application, this would open a blockchain explorer
    // Example for Ethereum: window.open(`https://etherscan.io/tx/${hash}`, '_blank');
    // For now, show an alert with the hash
    alert(`Blockchain Transaction Hash:\n${hash}\n\nVerification link would open in blockchain explorer.`);
  };

  const _handleVerifyEFIR = async (blockchainTxId) => {
    try {
      const verification = await efirAPI.verifyEFIR(blockchainTxId);
      alert(`E-FIR Verification:\nStatus: ${verification.is_valid ? 'Valid' : 'Invalid'}\nTimestamp: ${verification.timestamp || 'N/A'}`);
    } catch (error) {
      console.error('Failed to verify E-FIR:', error);
      alert('Failed to verify E-FIR on blockchain. Please try again later.');
    }
  };

  const _formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'closed': return 'success';
      case 'resolved': return 'success';
      case 'verified': return 'success';
      case 'open': return 'warning';
      case 'in_progress': return 'default';
      case 'pending': return 'secondary';
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
      {/* Simple Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="w-8 h-8" />
            E-FIR Records
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Electronic First Information Reports</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold">{filteredEfirs.length}</div>
          <div className="text-xs text-muted-foreground">Total Reports</div>
        </div>
      </div>

      {/* Simple Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total</p>
                <p className="text-2xl font-bold">{efirs.length}</p>
              </div>
              <FileText className="w-8 h-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Verified</p>
                <p className="text-2xl font-bold">{efirs.filter(e => e.is_verified).length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">This Month</p>
                <p className="text-2xl font-bold">
                  {efirs.filter(e => new Date(e.generated_at).getMonth() === new Date().getMonth()).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Pending</p>
                <p className="text-2xl font-bold">
                  {efirs.filter(e => !e.is_verified && !e.incident?.status).length}
                </p>
              </div>
              <Hash className="w-8 h-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search by E-FIR number, tourist name, or incident type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* E-FIRs Table */}
      <Card>
        <CardContent className="p-0">
          {filteredEfirs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground/30 mb-3" />
              <h3 className="text-lg font-semibold mb-1">No E-FIRs found</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm 
                  ? 'Try adjusting your search criteria'
                  : 'No incident reports available'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">E-FIR Number</TableHead>
                    <TableHead className="font-semibold">Tourist</TableHead>
                    <TableHead className="font-semibold">Incident</TableHead>
                    <TableHead className="font-semibold">Date & Time</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEfirs.map((efir) => (
                    <TableRow key={efir.efir_id || efir.fir_number} className="hover:bg-muted/30">
                      <TableCell>
                        <div>
                          <div className="font-mono text-sm font-medium">{efir.fir_number}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Hash className="w-3 h-3" />
                            ID: {efir.efir_id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">{efir.tourist?.name || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground">{efir.tourist?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium capitalize">{efir.incident_type || 'Unknown'}</span>
                            {efir.severity && (
                              <Badge 
                                variant={efir.severity === 'critical' ? 'destructive' : efir.severity === 'high' ? 'warning' : 'secondary'} 
                                className="text-xs capitalize"
                              >
                                {efir.severity}
                              </Badge>
                            )}
                          </div>
                          {efir.location && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {efir.location.lat && efir.location.lon
                                ? `${efir.location.lat.toFixed(2)}, ${efir.location.lon.toFixed(2)}`
                                : efir.location.description?.substring(0, 20) || 'Location available'
                              }
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {efir.generated_at || efir.incident_timestamp 
                            ? new Date(efir.generated_at || efir.incident_timestamp).toLocaleDateString()
                            : 'N/A'
                          }
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {efir.generated_at || efir.incident_timestamp
                            ? new Date(efir.generated_at || efir.incident_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : 'N/A'
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusColor(efir.incident?.status || (efir.is_verified ? 'verified' : 'pending'))} 
                          className="capitalize"
                        >
                          {efir.incident?.status || (efir.is_verified ? '✓ Verified' : 'Pending')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/efirs/${efir.efir_id || efir.fir_number}`)}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExportPDF(efir)}
                            title="Export PDF"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewBlockchain(efir.blockchain_tx_id)}
                            title="View Blockchain"
                            disabled={!efir.blockchain_tx_id}
                          >
                            <Hash className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EFIRs;