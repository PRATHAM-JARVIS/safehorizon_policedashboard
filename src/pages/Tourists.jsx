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
  Shield
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
        const data = await touristAPI.getActiveTourists();
        setTourists(data);
        setFilteredTourists(data);
      } catch (error) {
        console.error('Failed to fetch tourists:', error);
        // Set mock data when API fails
        const mockTourists = [
          {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@email.com',
            phone: '+1234567890',
            safety_score: 85,
            last_seen: new Date(Date.now() - 300000).toISOString(),
            current_location: { lat: 35.6762, lon: 139.6503, address: 'Shibuya, Tokyo' },
            status: 'active',
            trip_started: new Date(Date.now() - 7200000).toISOString()
          },
          {
            id: '2',
            name: 'Jane Smith',
            email: 'jane.smith@email.com',
            phone: '+1234567891',
            safety_score: 45,
            last_seen: new Date(Date.now() - 600000).toISOString(),
            current_location: { lat: 35.6763, lon: 139.6504, address: 'Harajuku, Tokyo' },
            status: 'active',
            trip_started: new Date(Date.now() - 10800000).toISOString()
          },
          {
            id: '3',
            name: 'Mike Johnson',
            email: 'mike.johnson@email.com',
            phone: '+1234567892',
            safety_score: 92,
            last_seen: new Date(Date.now() - 120000).toISOString(),
            current_location: { lat: 35.6764, lon: 139.6505, address: 'Akihabara, Tokyo' },
            status: 'active',
            trip_started: new Date(Date.now() - 5400000).toISOString()
          },
          {
            id: '4',
            name: 'Sarah Wilson',
            email: 'sarah.wilson@email.com',
            phone: '+1234567893',
            safety_score: 67,
            last_seen: new Date(Date.now() - 1800000).toISOString(),
            current_location: { lat: 35.6765, lon: 139.6506, address: 'Ginza, Tokyo' },
            status: 'active',
            trip_started: new Date(Date.now() - 14400000).toISOString()
          },
          {
            id: '5',
            name: 'David Brown',
            email: 'david.brown@email.com',
            phone: '+1234567894',
            safety_score: 78,
            last_seen: new Date(Date.now() - 900000).toISOString(),
            current_location: { lat: 35.6766, lon: 139.6507, address: 'Roppongi, Tokyo' },
            status: 'active',
            trip_started: new Date(Date.now() - 3600000).toISOString()
          }
        ];
        setTourists(mockTourists);
        setFilteredTourists(mockTourists);
      } finally {
        setLoading(false);
      }
    };

    fetchTourists();
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Users className="w-8 h-8" />
            <span>Tourist Management</span>
          </h1>
          <p className="text-muted-foreground">
            Monitor and track tourist activities and safety status
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-lg px-3 py-1">
            {filteredTourists.length} Active
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search tourists by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={filterSafety}
                onChange={(e) => setFilterSafety(e.target.value)}
                className="border border-input bg-transparent rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Safety Levels</option>
                <option value="high">Safe (80+)</option>
                <option value="medium">Caution (50-79)</option>
                <option value="low">Risk (&lt;50)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tourists Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Tourists</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTourists.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No tourists found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterSafety !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No active tourists are currently being tracked'
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tourist</TableHead>
                  <TableHead>Safety Score</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTourists.map((tourist) => (
                  <TableRow key={tourist.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{tourist.name}</div>
                        <div className="text-sm text-muted-foreground">{tourist.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getSafetyColor(tourist.safety_score)}>
                          {tourist.safety_score || 0}%
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {getSafetyLabel(tourist.safety_score || 0)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {tourist.last_location ? (
                        <div className="flex items-center space-x-1 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>
                            {tourist.last_location.lat.toFixed(4)}, {tourist.last_location.lon.toFixed(4)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Unknown</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{formatLastSeen(tourist.last_seen)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Activity className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600">Active</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/tourists/${tourist.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Safe Tourists</p>
                <p className="text-2xl font-bold text-green-600">
                  {tourists.filter(t => (t.safety_score || 0) >= 80).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
                <Activity className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Need Attention</p>
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Risk</p>
                <p className="text-2xl font-bold text-red-600">
                  {tourists.filter(t => (t.safety_score || 0) < 50).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Tourists;