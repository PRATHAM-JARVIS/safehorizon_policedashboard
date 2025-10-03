import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table.jsx';
import { touristAPI } from '../api/services.js';
import {
  Users,
  Search,
  MapPin,
  Eye,
  Filter,
  Clock,
  Activity,
  Shield,
  AlertTriangle
} from 'lucide-react';

const Tourists = () => {
  const [tourists, setTourists] = useState([]);
  const [filteredTourists, setFilteredTourists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSafety, setFilterSafety] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTourists = async () => {
      try {
        setLoading(true);
        const response = await touristAPI.getActiveTourists();
        // Handle documented response structure: direct array
        const touristsList = Array.isArray(response) ? response : [];
        setTourists(touristsList);
        setFilteredTourists(touristsList);
      } catch (error) {
        console.error('Failed to fetch tourists:', error);
        // Show error state
        setTourists([]);
        setFilteredTourists([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTourists();
    
    // Set up periodic refresh for tourist data (every 15 seconds for real-time tracking)
    const refreshInterval = setInterval(fetchTourists, 15000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    let filtered = tourists;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(tourist =>
        tourist.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tourist.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Safety score filter
    if (filterSafety !== 'all') {
      filtered = filtered.filter(tourist => {
        const score = tourist.safety_score || 0;
        switch (filterSafety) {
          case 'high': return score >= 80;
          case 'medium': return score >= 50 && score < 80;
          case 'low': return score < 50;
          default: return true;
        }
      });
    }

    setFilteredTourists(filtered);
  }, [tourists, searchTerm, filterSafety]);

  const getSafetyColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 50) return 'warning';
    return 'destructive';
  };

  const getSafetyLabel = (score) => {
    if (score >= 80) return 'Safe';
    if (score >= 50) return 'Caution';
    return 'Risk';
  };

  const formatLastSeen = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
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
      {/* Header with Stats */}
      <div>
        <h1 className="text-3xl font-bold mb-6">Tourist Management</h1>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Total Active</p>
                  <p className="text-2xl font-bold">{tourists.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Safe</p>
                  <p className="text-2xl font-bold text-green-600">
                    {tourists.filter(t => (t.safety_score || 0) >= 80).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
                  <Activity className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Caution</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {tourists.filter(t => {
                      const score = t.safety_score || 0;
                      return score >= 50 && score < 80;
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 dark:bg-red-900 p-3 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">At Risk</p>
                  <p className="text-2xl font-bold text-red-600">
                    {tourists.filter(t => (t.safety_score || 0) < 50).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={filterSafety}
              onChange={(e) => setFilterSafety(e.target.value)}
              className="border border-input bg-background rounded-md px-4 py-2 text-sm min-w-[180px]"
            >
              <option value="all">All Safety Levels</option>
              <option value="high">Safe (80+)</option>
              <option value="medium">Caution (50-79)</option>
              <option value="low">At Risk (&lt;50)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tourists Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active Tourists</CardTitle>
          <Badge variant="outline">{filteredTourists.length} tourists</Badge>
        </CardHeader>
        <CardContent>
          {filteredTourists.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No tourists found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterSafety !== 'all' 
                  ? 'Try adjusting your search or filter'
                  : 'No active tourists are currently tracked'
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Safety Score</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTourists.map((tourist) => (
                  <TableRow key={tourist.id}>
                    <TableCell className="font-medium">{tourist.name}</TableCell>
                    <TableCell className="text-muted-foreground">{tourist.email}</TableCell>
                    <TableCell>
                      <Badge variant={getSafetyColor(tourist.safety_score)} className="font-medium">
                        {tourist.safety_score || 0}% {getSafetyLabel(tourist.safety_score || 0)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{formatLastSeen(tourist.last_seen)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/tourists/${tourist.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Tourists;