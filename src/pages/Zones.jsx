import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input, Label } from '../components/ui/input.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table.jsx';
import { zonesAPI } from '../api/services.js';
import {
  Map,
  Plus,
  Trash2,
  MapPin,
  Shield,
  AlertTriangle,
  Info,
  Search,
  Eye
} from 'lucide-react';

const Zones = () => {
  const [zones, setZones] = useState([]);
  const [filteredZones, setFilteredZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newZone, setNewZone] = useState({
    name: '',
    description: '',
    zone_type: 'restricted',
    coordinates: []
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        setLoading(true);
        const data = await zonesAPI.listZones();
        setZones(data);
        setFilteredZones(data);
      } catch (error) {
        console.error('Failed to fetch zones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchZones();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = zones.filter(zone =>
        zone.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        zone.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        zone.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredZones(filtered);
    } else {
      setFilteredZones(zones);
    }
  }, [zones, searchTerm]);

  const getZoneTypeColor = (type) => {
    switch (type) {
      case 'restricted': return 'destructive';
      case 'risky': return 'warning';
      case 'safe': return 'success';
      default: return 'secondary';
    }
  };

  const getZoneTypeIcon = (type) => {
    switch (type) {
      case 'restricted': return AlertTriangle;
      case 'risky': return Shield;
      case 'safe': return Info;
      default: return MapPin;
    }
  };

  const handleCreateZone = async (e) => {
    e.preventDefault();
    if (!newZone.name || !newZone.description) return;

    try {
      setCreating(true);
      
      // For demo purposes, we'll create a circular zone with dummy coordinates
      const demoCoordinates = [
        [139.6503, 35.6762], // Tokyo coordinates as example
        [139.6603, 35.6762],
        [139.6603, 35.6862],
        [139.6503, 35.6862]
      ];

      const zoneData = {
        ...newZone,
        coordinates: demoCoordinates
      };

      const createdZone = await zonesAPI.createZone(zoneData);
      setZones(prev => [...prev, createdZone]);
      
      // Reset form
      setNewZone({
        name: '',
        description: '',
        zone_type: 'restricted',
        coordinates: []
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create zone:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteZone = async (zoneId) => {
    if (!confirm('Are you sure you want to delete this zone?')) return;

    try {
      await zonesAPI.deleteZone(zoneId);
      setZones(prev => prev.filter(zone => zone.id !== zoneId));
    } catch (error) {
      console.error('Failed to delete zone:', error);
    }
  };

  const formatCoordinates = (center) => {
    if (center && center.lat && center.lon) {
      return `${center.lat.toFixed(4)}, ${center.lon.toFixed(4)}`;
    }
    return 'Unknown';
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
            <Map className="w-8 h-8" />
            <span>Zone Management</span>
          </h1>
          <p className="text-muted-foreground">
            Create and manage restricted and safe zones for tourist monitoring
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Zone
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-red-100 dark:bg-red-900 p-2 rounded-full">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Restricted</p>
                <p className="text-xl font-bold text-red-600">
                  {zones.filter(z => z.type === 'restricted').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-full">
                <Shield className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Risky</p>
                <p className="text-xl font-bold text-yellow-600">
                  {zones.filter(z => z.type === 'risky').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                <Info className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Safe</p>
                <p className="text-xl font-bold text-green-600">
                  {zones.filter(z => z.type === 'safe').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Zone Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateZone} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zoneName">Zone Name</Label>
                  <Input
                    id="zoneName"
                    placeholder="e.g., Downtown Restricted Area"
                    value={newZone.name}
                    onChange={(e) => setNewZone(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zoneType">Zone Type</Label>
                  <select
                    id="zoneType"
                    value={newZone.zone_type}
                    onChange={(e) => setNewZone(prev => ({ ...prev, zone_type: e.target.value }))}
                    className="w-full border border-input bg-transparent rounded-md px-3 py-2 text-sm"
                    required
                  >
                    <option value="restricted">Restricted</option>
                    <option value="risky">Risky</option>
                    <option value="safe">Safe</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zoneDescription">Description</Label>
                <Input
                  id="zoneDescription"
                  placeholder="Describe the zone and any relevant safety information"
                  value={newZone.description}
                  onChange={(e) => setNewZone(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm text-muted-foreground mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Note: In a production environment, you would draw the zone boundaries on an interactive map. 
                  For this demo, zones will be created with default coordinates around Tokyo.
                </p>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={creating}>
                  {creating ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </div>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Zone
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search zones by name, description, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Zones Table */}
      <Card>
        <CardHeader>
          <CardTitle>Zone List</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredZones.length === 0 ? (
            <div className="text-center py-8">
              <Map className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No zones found</h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? 'Try adjusting your search criteria'
                  : 'Create your first zone to start monitoring areas'
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zone</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Center Coordinates</TableHead>
                  <TableHead>Radius</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredZones.map((zone) => {
                  const TypeIcon = getZoneTypeIcon(zone.type);
                  return (
                    <TableRow key={zone.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{zone.name}</div>
                          <div className="text-sm text-muted-foreground">{zone.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <TypeIcon className="w-4 h-4" />
                          <Badge variant={getZoneTypeColor(zone.type)} className="capitalize">
                            {zone.type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {formatCoordinates(zone.center)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {zone.radius_meters ? `${zone.radius_meters}m` : 'Variable'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={zone.is_active ? 'success' : 'secondary'}>
                          {zone.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {new Date(zone.created_at).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteZone(zone.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Map Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Zone Map View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg h-64 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Map className="w-12 h-12 mx-auto mb-2" />
              <p className="text-lg font-medium">Interactive Map</p>
              <p className="text-sm">
                In production, this would show an interactive map with zone boundaries, 
                tourist locations, and real-time tracking data using Mapbox or Leaflet.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Zones;