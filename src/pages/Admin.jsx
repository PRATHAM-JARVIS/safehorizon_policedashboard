import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table.jsx';
import { adminAPI } from '../api/services.js';
import {
  Settings,
  Users,
  Database,
  Activity,
  Server,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  UserX,
  UserCheck,
  Cpu,
  HardDrive,
  Wifi
} from 'lucide-react';

const Admin = () => {
  const [systemStatus, setSystemStatus] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [retrainingModel, setRetrainingModel] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        
        // Fetch system status
        const statusResponse = await adminAPI.getSystemStatus();
        const status = statusResponse.status || statusResponse.data || statusResponse;
        setSystemStatus(status);
        
        // Fetch users list
        const usersResponse = await adminAPI.getUsersList();
        const usersData = usersResponse.users || usersResponse.data || usersResponse || [];
        const usersList = Array.isArray(usersData) ? usersData : [];
        setUsers(usersList);
        setFilteredUsers(usersList);
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
        // Show error state
        setSystemStatus({
          status: 'error',
          version: 'unknown',
          uptime: '0h 0m 0s',
          active_users: 0,
          database_status: 'disconnected',
          redis_status: 'disconnected',
          ai_models_loaded: false,
          last_updated: new Date().toISOString(),
          error: 'Failed to connect to backend'
        });
        setUsers([]);
        setFilteredUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
    
    // Set up periodic refresh for admin data (every 30 seconds)
    const refreshInterval = setInterval(fetchAdminData, 30000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterRole]);

  const handleSuspendUser = async (userId, isActive) => {
    try {
      const reason = isActive ? 'User suspended from admin panel' : 'User reactivated from admin panel';
      if (isActive) {
        await adminAPI.suspendUser(userId, true, reason);
      } else {
        await adminAPI.activateUser(userId);
      }
      
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, is_active: !isActive }
          : user
      ));
      alert(`User ${isActive ? 'suspended' : 'activated'} successfully!`);
    } catch (error) {
      console.error('Failed to update user status:', error);
      alert('Failed to update user status. Please try again.');
    }
  };

  const handleRetrainModel = async (modelType = 'isolation_forest') => {
    const confirmRetrain = window.confirm(`Are you sure you want to retrain the ${modelType} model? This may take several minutes.`);
    if (!confirmRetrain) return;

    try {
      setRetrainingModel(true);
      const result = await adminAPI.retrainModel(modelType, 30, false);
      console.log('Model retraining initiated:', result);
      alert(`Model retraining started!\nJob ID: ${result.job_id || 'N/A'}\nEstimated time: ${result.estimated_duration_minutes || 15} minutes`);
    } catch (error) {
      console.error('Failed to retrain model:', error);
      alert('Failed to initiate model retraining. Please try again.');
    } finally {
      setRetrainingModel(false);
    }
  };

  const fetchPerformanceMetrics = async () => {
    try {
      const metrics = await adminAPI.getPerformanceMetrics();
      setPerformanceMetrics(metrics);
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
    }
  };

  useEffect(() => {
    // Fetch performance metrics on mount and every minute
    fetchPerformanceMetrics();
    const metricsInterval = setInterval(fetchPerformanceMetrics, 60000);
    return () => clearInterval(metricsInterval);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case true:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
      case 'disconnected':
      case false:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'authority': return 'warning';
      case 'tourist': return 'success';
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
            <Settings className="w-8 h-8" />
            <span>System Administration</span>
          </h1>
          <p className="text-muted-foreground">
            Monitor system health and manage user accounts
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          Admin Access
        </Badge>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                <Server className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">System Status</p>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(systemStatus?.status)}
                  <span className="font-medium capitalize">
                    {systemStatus?.status || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-xl font-bold">{systemStatus?.active_users || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-full">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-lg font-bold">{systemStatus?.uptime || 'Unknown'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Version</p>
                <p className="text-lg font-bold">{systemStatus?.version || '1.0.0'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health Details */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium flex items-center space-x-2">
                <Database className="w-4 h-4" />
                <span>Database</span>
              </h4>
              <div className="flex items-center space-x-2">
                {getStatusIcon(systemStatus?.database_status)}
                <span className="capitalize">{systemStatus?.database_status || 'Unknown'}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium flex items-center space-x-2">
                <Wifi className="w-4 h-4" />
                <span>Redis Cache</span>
              </h4>
              <div className="flex items-center space-x-2">
                {getStatusIcon(systemStatus?.redis_status)}
                <span className="capitalize">{systemStatus?.redis_status || 'Unknown'}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium flex items-center space-x-2">
                <Cpu className="w-4 h-4" />
                <span>AI Models</span>
              </h4>
              <div className="flex items-center space-x-2">
                {getStatusIcon(systemStatus?.ai_models_loaded)}
                <span>{systemStatus?.ai_models_loaded ? 'Loaded' : 'Not Loaded'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="border border-input bg-transparent rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="authority">Authority</option>
              <option value="tourist">Tourist</option>
            </select>
          </div>

          {/* Users Table */}
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No users found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterRole !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No users are registered in the system'
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleColor(user.role)} className="capitalize">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {user.is_active ? (
                          <>
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-green-600">Active</span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-red-600">Suspended</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(user.last_seen).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={user.is_active ? "destructive" : "default"}
                        size="sm"
                        onClick={() => handleSuspendUser(user.id, user.is_active)}
                        disabled={user.role === 'admin'} // Don't allow suspending admins
                      >
                        {user.is_active ? (
                          <>
                            <UserX className="w-4 h-4 mr-1" />
                            Suspend
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* System Actions */}
      <Card>
        <CardHeader>
          <CardTitle>System Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-16 flex flex-col space-y-2">
              <HardDrive className="w-6 h-6" />
              <span>Database Backup</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col space-y-2">
              <Cpu className="w-6 h-6" />
              <span>Retrain AI Models</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col space-y-2">
              <Activity className="w-6 h-6" />
              <span>System Diagnostics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;