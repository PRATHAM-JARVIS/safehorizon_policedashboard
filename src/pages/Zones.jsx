import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input, Label } from '../components/ui/input.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { zonesAPI } from '../api/services.js';
import MapComponent from '../components/ui/Map.jsx';
import {
  Map,
  Plus,
  Trash2,
  MapPin,
  Shield,
  AlertTriangle,
  Info,
  Search,
  Eye,
  Save,
  X,
  Filter,
  SortAsc
} from 'lucide-react';

const Zones = () => {
  const [zones, setZones] = useState([]);
  const [filteredZones, setFilteredZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [showZoneDetail, setShowZoneDetail] = useState(false);
  const [newZone, setNewZone] = useState({
    name: '',
    description: '',
    zone_type: 'restricted',
    coordinates: []
  });
  const [creating, setCreating] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await zonesAPI.manageZones();
        const zonesList = Array.isArray(response) ? response : (response.zones || response.data || []);
        setZones(zonesList);
        setFilteredZones(zonesList);
      } catch (err) {
        console.error('❌ Failed to fetch zones:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load zones');
        setZones([]);
        setFilteredZones([]);
      } finally {
        setLoading(false);
      }
    };

    fetchZones();
    const refreshInterval = setInterval(fetchZones, 60000);
    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    let filtered = zones;

    if (searchTerm) {
      filtered = filtered.filter(zone =>
        zone.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        zone.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(zone => (zone.type || zone.zone_type) === filterType);
    }

    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'type':
          return (a.type || a.zone_type || '').localeCompare(b.type || b.zone_type || '');
        case 'created':
          return new Date(b.created_at) - new Date(a.created_at);
        default:
          return 0;
      }
    });

    setFilteredZones(filtered);
  }, [zones, searchTerm, filterType, sortBy]);

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
    if (!newZone.name || !newZone.description || newZone.coordinates.length === 0) {
      alert('Please fill all fields and draw a zone on the map');
      return;
    }

    try {
      setCreating(true);
      const createdZone = await zonesAPI.createZone({
        name: newZone.name,
        description: newZone.description,
        zone_type: newZone.zone_type,
        coordinates: newZone.coordinates
      });
      
      setZones(prev => [...prev, createdZone]);
      setNewZone({
        name: '',
        description: '',
        zone_type: 'restricted',
        coordinates: []
      });
      setShowCreateForm(false);
      setIsDrawing(false);
    } catch (error) {
      console.error('Failed to create zone:', error);
      alert('Failed to create zone. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handlePolygonComplete = (coordinates) => {
    setNewZone(prev => ({ ...prev, coordinates }));
    setIsDrawing(false);
  };

  const startDrawing = () => {
    setIsDrawing(true);
    setNewZone(prev => ({ ...prev, coordinates: [] }));
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

  const handleViewZone = (zone) => {
    setSelectedZone(zone);
    setShowZoneDetail(true);
  };

  const handleCloseDetail = () => {
    setSelectedZone(null);
    setShowZoneDetail(false);
  };

  // Close modal on ESC key press
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showZoneDetail) {
        handleCloseDetail();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showZoneDetail]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Zones</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} size="sm">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col overflow-hidden">
      {/* Compact Header */}
      <div className="flex-shrink-0 mb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold">Zone Management</h1>
            {/* Inline Stats */}
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-muted-foreground">Restricted:</span>
                <span className="font-semibold text-red-600">
                  {zones.filter(z => (z.type || z.zone_type) === 'restricted').length}
                </span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span className="text-muted-foreground">Risky:</span>
                <span className="font-semibold text-yellow-600">
                  {zones.filter(z => (z.type || z.zone_type) === 'risky').length}
                </span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-muted-foreground">Safe:</span>
                <span className="font-semibold text-green-600">
                  {zones.filter(z => (z.type || z.zone_type) === 'safe').length}
                </span>
              </div>
            </div>
          </div>
          <Button onClick={() => setShowCreateForm(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Create Zone
          </Button>
        </div>

        {/* Create Zone Form - Compact */}
        {showCreateForm && (
          <Card className="border-primary mb-3">
            <CardContent className="p-3">
              <form onSubmit={handleCreateZone} className="space-y-2">
                <div className="grid grid-cols-4 gap-2">
                  <Input
                    placeholder="Zone Name"
                    value={newZone.name}
                    onChange={(e) => setNewZone(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="h-8 text-sm"
                  />
                  <select
                    value={newZone.zone_type}
                    onChange={(e) => setNewZone(prev => ({ ...prev, zone_type: e.target.value }))}
                    className="h-8 border border-input bg-transparent rounded-md px-2 text-sm"
                    required
                  >
                    <option value="restricted">Restricted</option>
                    <option value="risky">Risky</option>
                    <option value="safe">Safe</option>
                  </select>
                  <Input
                    placeholder="Description"
                    value={newZone.description}
                    onChange={(e) => setNewZone(prev => ({ ...prev, description: e.target.value }))}
                    required
                    className="h-8 text-sm"
                  />
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant={isDrawing ? "destructive" : "outline"}
                      size="sm"
                      onClick={isDrawing ? () => setIsDrawing(false) : startDrawing}
                      className="h-8 text-xs flex-1"
                    >
                      {isDrawing ? 'Cancel' : 'Draw'}
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={creating || newZone.coordinates.length === 0} 
                      size="sm"
                      className="h-8 text-xs flex-1"
                    >
                      {creating ? 'Creating...' : 'Create'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setShowCreateForm(false);
                        setIsDrawing(false);
                      }}
                      className="h-8 px-2"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                {newZone.coordinates.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    ✓ Zone drawn with {newZone.coordinates.length} points
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Content: 70-30 Split */}
      <div className="flex-1 grid grid-cols-[1fr_400px] gap-3 min-h-0">
        {/* Left: Map (70%) */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="pb-2 border-b flex-shrink-0">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Map className="w-4 h-4" />
                Interactive Map
              </span>
              {isDrawing && (
                <Badge variant="warning" className="animate-pulse text-xs">
                  Drawing Mode
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 relative overflow-hidden">
            <MapComponent
              center={[28.6139, 77.2090]}
              zoom={11}
              zones={zones.map(zone => ({
                ...zone,
                zone_type: zone.zone_type || zone.type || 'safe'
              }))}
              tourists={[]}
              alerts={[]}
              height="100%"
              showZoneDrawer={isDrawing}
              onPolygonComplete={handlePolygonComplete}
              onZoneClick={(zone) => handleViewZone(zone)}
              showHeatmap={false}
            />
            {zones.length === 0 && !isDrawing && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 pointer-events-none">
                <div className="text-center text-muted-foreground">
                  <MapPin className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">No zones created</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Zones List (30%) */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="pb-2 border-b flex-shrink-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Zones ({filteredZones.length})</CardTitle>
              </div>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-3" />
                <Input
                  placeholder="Search zones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-7 h-7 text-xs"
                />
              </div>
              {/* Filter & Sort */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full h-7 border border-input bg-transparent rounded-md px-2 text-xs"
                  >
                    <option value="all">All Types</option>
                    <option value="restricted">Restricted</option>
                    <option value="risky">Risky</option>
                    <option value="safe">Safe</option>
                  </select>
                </div>
                <div className="flex-1">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full h-7 border border-input bg-transparent rounded-md px-2 text-xs"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="type">Sort by Type</option>
                    <option value="created">Sort by Date</option>
                  </select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            {filteredZones.length === 0 ? (
              <div className="flex items-center justify-center h-full p-4">
                <div className="text-center">
                  <Map className="w-8 h-8 mx-auto text-muted-foreground mb-2 opacity-30" />
                  <p className="text-xs text-muted-foreground">
                    {searchTerm || filterType !== 'all' ? 'No matching zones' : 'No zones found'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y">
                {filteredZones.map((zone) => {
                  const TypeIcon = getZoneTypeIcon(zone.type || zone.zone_type);
                  const zoneType = zone.type || zone.zone_type;
                  return (
                    <div 
                      key={zone.id} 
                      className="p-2.5 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleViewZone(zone)}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`p-1.5 rounded mt-0.5 flex-shrink-0 ${
                          zoneType === 'restricted' ? 'bg-red-100 dark:bg-red-900' :
                          zoneType === 'risky' ? 'bg-yellow-100 dark:bg-yellow-900' :
                          'bg-green-100 dark:bg-green-900'
                        }`}>
                          <TypeIcon className={`w-3 h-3 ${
                            zoneType === 'restricted' ? 'text-red-600' :
                            zoneType === 'risky' ? 'text-yellow-600' :
                            'text-green-600'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <h4 className="font-semibold text-xs truncate">{zone.name}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteZone(zone.id);
                              }}
                            >
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1 mb-1.5">
                            {zone.description || 'No description'}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant={getZoneTypeColor(zoneType)} className="text-[10px] px-1.5 py-0 h-4">
                              {zoneType}
                            </Badge>
                            {zone.is_active && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                                Active
                              </Badge>
                            )}
                            {zone.radius_meters && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                                {zone.radius_meters}m
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Zone Detail Modal */}
      {showZoneDetail && selectedZone && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" 
          style={{ zIndex: 9999 }}
          onClick={handleCloseDetail}
        >
          <Card 
            className="w-full max-w-4xl max-h-[85vh] flex flex-col relative animate-in zoom-in-95 duration-200" 
            style={{ zIndex: 10000 }}
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="border-b flex-shrink-0 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded ${
                    (selectedZone.zone_type || selectedZone.type) === 'restricted' ? 'bg-red-100 dark:bg-red-900' :
                    (selectedZone.zone_type || selectedZone.type) === 'risky' ? 'bg-yellow-100 dark:bg-yellow-900' :
                    'bg-green-100 dark:bg-green-900'
                  }`}>
                    <MapPin className={`w-5 h-5 ${
                      (selectedZone.zone_type || selectedZone.type) === 'restricted' ? 'text-red-600' :
                      (selectedZone.zone_type || selectedZone.type) === 'risky' ? 'text-yellow-600' :
                      'text-green-600'
                    }`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{selectedZone.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {selectedZone.description || 'No description'}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCloseDetail}
                  className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  title="Close (ESC)"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {/* Details */}
                <div className="flex gap-2">
                  <Badge variant={getZoneTypeColor(selectedZone.zone_type || selectedZone.type)}>
                    {(selectedZone.zone_type || selectedZone.type)?.toUpperCase()}
                  </Badge>
                  <Badge variant={selectedZone.is_active ? 'success' : 'secondary'}>
                    {selectedZone.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {/* Map Preview */}
                {selectedZone.coordinates && selectedZone.coordinates.length > 0 ? (
                  <div className="rounded-lg overflow-hidden border h-[300px]">
                    <MapComponent
                      center={[
                        selectedZone.center_latitude || selectedZone.coordinates.reduce((sum, coord) => sum + (Array.isArray(coord) ? coord[1] : coord.lat || 0), 0) / selectedZone.coordinates.length,
                        selectedZone.center_longitude || selectedZone.coordinates.reduce((sum, coord) => sum + (Array.isArray(coord) ? coord[0] : coord.lon || 0), 0) / selectedZone.coordinates.length
                      ]}
                      zoom={14}
                      zones={[{
                        ...selectedZone,
                        zone_type: selectedZone.zone_type || selectedZone.type || 'safe'
                      }]}
                      tourists={[]}
                      alerts={[]}
                      height="100%"
                      showHeatmap={false}
                    />
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">No map data</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Zones;
