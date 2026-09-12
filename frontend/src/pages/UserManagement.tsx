import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  UserPlus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Shield, 
  RefreshCw,
  Activity,
  Clock,
  Monitor,
  AlertTriangle,
  TrendingUp,
  Users,
  Eye,
  BarChart3,
  Calendar,
  Smartphone,
  Globe,
  Zap,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  specialization?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  activitySummary?: {
    totalActions: number;
    successfulActions: number;
    failedActions: number;
    avgResponseTime: number;
    uniqueResourcesCount: number;
    uniqueActionsCount: number;
    successRate: string;
    lastActivity: string;
    firstActivity: string;
  };
  activeSessions?: Array<{
    id: string;
    deviceInfo: any;
    ipAddress: string;
    lastActivity: string;
    sessionType: string;
    duration: number;
  }>;
  mostUsedResources?: Array<{
    _id: string;
    count: number;
    successCount: number;
    avgResponseTime: number;
    lastUsed: string;
  }>;
}

interface UserActivity {
  _id: string;
  action: string;
  resource: string;
  method: string;
  endpoint: string;
  statusCode: number;
  responseTime: number;
  success: boolean;
  timestamp: string;
  deviceInfo: {
    browser: string;
    os: string;
    device: string;
    isMobile: boolean;
  };
  ipAddress: string;
}

interface BehaviorData {
  summary: {
    totalActions: number;
    successfulActions: number;
    failedActions: number;
    successRate: string;
    avgResponseTime: number;
    avgSessionDuration: number;
  };
  timePatterns: {
    byHour: Array<{ _id: { hour: number }; count: number; avgResponseTime: number }>;
    byDay: Array<{ _id: { day: number; month: number; year: number }; count: number; avgResponseTime: number }>;
    peakHours: Array<{ hour: number; dayOfWeek: number; count: number; avgResponseTime: number }>;
  };
  resourceUsage: Array<{ _id: string; count: number; successCount: number; avgResponseTime: number }>;
  deviceUsage: Array<{ _id: { browser: string; os: string; device: string }; count: number; lastUsed: string }>;
  errorPatterns: Array<{ _id: { resource: string; action: string; statusCode: number }; count: number; lastOccurrence: string }>;
  behaviorInsights: Array<{ type: string; message: string; severity: string }>;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [userBehavior, setUserBehavior] = useState<BehaviorData | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: '', phone: '', specialization: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ success: boolean; data: User[] }>('/users?includeActivity=true');
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      setLoadingDetails(true);
      const [activityResponse, behaviorResponse] = await Promise.all([
        api.getUserActivity(userId, { days: 30, limit: 100 }),
        api.getUserBehavior(userId, 30)
      ]);

      if (activityResponse && activityResponse.success) {
        setUserActivities(activityResponse.data.activities);
      }

      if (behaviorResponse && behaviorResponse.success) {
        setUserBehavior(behaviorResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      toast.error('Failed to load user details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewUserDetails = async (user: User) => {
    setSelectedUser(user);
    setShowUserDetails(true);
    setActiveTab('overview');
    await fetchUserDetails(user._id);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users', formData);
      toast.success('User created successfully');
      setShowAddUser(false);
      setFormData({ name: '', email: '', password: '', role: '', phone: '', specialization: '' });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create user');
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await api.put(`/users/${selectedUser._id}`, formData);
      toast.success('User updated successfully');
      setShowEditUser(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${userId}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    try {
      await api.put(`/users/${userId}`, { isActive: !isActive });
      toast.success(`User ${isActive ? 'deactivated' : 'activated'} successfully`);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user status');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      doctor: 'bg-green-100 text-green-800',
      receptionist: 'bg-blue-100 text-blue-800',
      diagnostic: 'bg-purple-100 text-purple-800',
      pharmacy: 'bg-orange-100 text-orange-800',
      admin: 'bg-red-100 text-red-800',
      super_admin: 'bg-gray-900 text-white',
    };
    return <Badge className={colors[role] || 'bg-gray-100 text-gray-800'}>{role}</Badge>;
  };

  const getActivityLevel = (totalActions: number) => {
    if (totalActions > 100) return { level: 'High', color: 'bg-green-500' };
    if (totalActions > 50) return { level: 'Medium', color: 'bg-yellow-500' };
    if (totalActions > 10) return { level: 'Low', color: 'bg-orange-500' };
    return { level: 'Inactive', color: 'bg-gray-400' };
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'high_activity': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'low_activity': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'high_error_rate': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'primary_function': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage staff members with activity and behavior analytics</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchUsers}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setShowAddUser(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                  <SelectItem value="diagnostic">Diagnostic</SelectItem>
                  <SelectItem value="pharmacy">Pharmacy</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            <CardDescription>Staff members with activity and behavior analytics</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading users...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Activity Level</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Active Sessions</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const activityLevel = getActivityLevel(user.activitySummary?.totalActions || 0);
                    return (
                      <TableRow key={user._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className={`${activityLevel.color} text-white`}>
                              {activityLevel.level}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {user.activitySummary?.totalActions || 0} actions
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16">
                              <Progress 
                                value={parseFloat(user.activitySummary?.successRate || '0')} 
                                className="h-2" 
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {user.activitySummary?.successRate || '0'}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Monitor className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {user.activeSessions?.length || 0}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {user.activitySummary?.lastActivity 
                              ? new Date(user.activitySummary.lastActivity).toLocaleDateString()
                              : 'Never'
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewUserDetails(user)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedUser(user);
                                setFormData({
                                  name: user.name,
                                  email: user.email,
                                  password: '',
                                  role: user.role,
                                  phone: user.phone || '',
                                  specialization: user.specialization || ''
                                });
                                setShowEditUser(true);
                              }}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(user._id, user.isActive)}>
                                <Shield className="h-4 w-4 mr-2" />
                                {user.isActive ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive" 
                                onClick={() => handleDeleteUser(user._id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new staff account</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  required 
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                  required 
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input 
                  type="password" 
                  value={formData.password} 
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                  required 
                />
              </div>
              <div>
                <Label>Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="receptionist">Receptionist</SelectItem>
                    <SelectItem value="diagnostic">Diagnostic Staff</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Phone</Label>
                <Input 
                  value={formData.phone} 
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                />
              </div>
              {formData.role === 'doctor' && (
                <div>
                  <Label>Specialization</Label>
                  <Input 
                    value={formData.specialization} 
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} 
                  />
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddUser(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Create User
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user information</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  required 
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                  required 
                />
              </div>
              <div>
                <Label>New Password (leave blank to keep current)</Label>
                <Input 
                  type="password" 
                  value={formData.password} 
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                />
              </div>
              <div>
                <Label>Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="receptionist">Receptionist</SelectItem>
                    <SelectItem value="diagnostic">Diagnostic Staff</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Phone</Label>
                <Input 
                  value={formData.phone} 
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                />
              </div>
              {formData.role === 'doctor' && (
                <div>
                  <Label>Specialization</Label>
                  <Input 
                    value={formData.specialization} 
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} 
                  />
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowEditUser(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Update User
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {selectedUser?.name} - Activity & Behavior Analytics
              </DialogTitle>
              <DialogDescription>
                Comprehensive user activity tracking and behavior analysis for the last 30 days
              </DialogDescription>
            </DialogHeader>
            
            {loadingDetails ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading user analytics...</span>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="activity">Activity Log</TabsTrigger>
                  <TabsTrigger value="behavior">Behavior Patterns</TabsTrigger>
                  <TabsTrigger value="sessions">Sessions</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Activity className="h-5 w-5 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold">{userBehavior?.summary.totalActions || 0}</p>
                        <p className="text-sm text-muted-foreground">Total Actions</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold">{userBehavior?.summary.successRate || '0'}%</p>
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-purple-600" />
                        </div>
                        <p className="text-2xl font-bold">{Math.round(userBehavior?.summary.avgResponseTime || 0)}ms</p>
                        <p className="text-sm text-muted-foreground">Avg Response Time</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Zap className="h-5 w-5 text-orange-600" />
                        </div>
                        <p className="text-2xl font-bold">{formatDuration(userBehavior?.summary.avgSessionDuration || 0)}</p>
                        <p className="text-sm text-muted-foreground">Avg Session Duration</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Most Used Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {userBehavior?.resourceUsage.slice(0, 5).map((resource, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium capitalize">{resource._id.replace('_', ' ')}</p>
                              <p className="text-sm text-muted-foreground">
                                {resource.count} actions • {Math.round((resource.successCount / resource.count) * 100)}% success rate
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{Math.round(resource.avgResponseTime)}ms</p>
                              <p className="text-xs text-muted-foreground">avg response</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {userBehavior?.behaviorInsights && userBehavior.behaviorInsights.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Behavior Insights</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {userBehavior.behaviorInsights.map((insight, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                              {getInsightIcon(insight.type)}
                              <div>
                                <p className="font-medium capitalize">{insight.type.replace('_', ' ')}</p>
                                <p className="text-sm text-muted-foreground">{insight.message}</p>
                              </div>
                              <Badge className={
                                insight.severity === 'error' ? 'bg-red-100 text-red-800' :
                                insight.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }>
                                {insight.severity}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle>Device Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userBehavior?.deviceUsage.map((device, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-2">
                              {device._id.device === 'Mobile' ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                              <div>
                                <p className="font-medium">{device._id.browser} on {device._id.os}</p>
                                <p className="text-sm text-muted-foreground">{device._id.device}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{device.count} actions</p>
                              <p className="text-xs text-muted-foreground">
                                Last used: {new Date(device.lastUsed).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Active Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedUser?.activeSessions && selectedUser.activeSessions.length > 0 ? (
                          selectedUser.activeSessions.map((session, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <Globe className="h-4 w-4 text-blue-600" />
                                <div>
                                  <p className="font-medium">{session.deviceInfo}</p>
                                  <p className="text-sm text-muted-foreground">IP: {session.ipAddress}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge className="mb-1">{session.sessionType}</Badge>
                                <p className="text-sm text-muted-foreground">
                                  Duration: {formatDuration(session.duration)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Last activity: {new Date(session.lastActivity).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-muted-foreground py-8">No active sessions</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>Last 100 user actions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {userActivities.map((activity, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                            <div className="flex items-center gap-3">
                              <Badge className={activity.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {activity.method}
                              </Badge>
                              <div>
                                <p className="font-medium capitalize">{activity.action} {activity.resource}</p>
                                <p className="text-muted-foreground">{activity.endpoint}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{activity.responseTime}ms</p>
                              <p className="text-muted-foreground">{new Date(activity.timestamp).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="behavior" className="space-y-4">
                  {userBehavior?.errorPatterns && userBehavior.errorPatterns.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Error Patterns</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {userBehavior.errorPatterns.map((error, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-600" />
                                <div>
                                  <p className="font-medium">{error._id.resource} {error._id.action}</p>
                                  <p className="text-sm text-muted-foreground">Status: {error._id.statusCode}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-red-600">{error.count} errors</p>
                                <p className="text-xs text-muted-foreground">
                                  Last: {new Date(error.lastOccurrence).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="sessions" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Session History</CardTitle>
                      <CardDescription>All user sessions and login history</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedUser?.activeSessions?.map((session, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Monitor className="h-4 w-4 text-blue-600" />
                              <div>
                                <p className="font-medium">{session.deviceInfo}</p>
                                <p className="text-sm text-muted-foreground">IP: {session.ipAddress}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge>{session.sessionType}</Badge>
                              <p className="text-sm text-muted-foreground">
                                Duration: {formatDuration(session.duration)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Last activity: {new Date(session.lastActivity).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}