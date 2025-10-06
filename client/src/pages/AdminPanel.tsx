// // import React from "react";

// const AdminPanel: React.FC = () => {
// 	return <div>Admin Panel Page</div>;
// };

// export default AdminPanel;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { 
  Users, 
  Calendar, 
  Building2, 
  Activity, 
  Search,
  Filter,
  MoreVertical,
  UserCheck,
  UserX,
  Shield,
  ShieldCheck,
  Trash2,
  Edit,
  Eye,
  Download,
  TrendingUp,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../components/ui/dropdown-menu';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  studentId: string;
  department: string;
  yearOfStudy: number;
  role: 'student' | 'club_admin' | 'super_admin';
  isVerified: boolean;
  totalPoints: number;
  totalVolunteerHours: number;
  profileImage?: string;
  createdAt: string;
  lastLogin?: string;
}

interface Club {
  id: string;
  name: string;
  category: string;
  memberCount: number;
  eventCount: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  logoUrl?: string;
}

interface Event {
  id: string;
  title: string;
  clubName: string;
  eventType: string;
  startDate: string;
  registrationCount: number;
  attendanceCount: number;
  isPublished: boolean;
  pointsReward: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

interface AdminStats {
  totalUsers: number;
  totalClubs: number;
  totalEvents: number;
  activeEvents: number;
  thisMonthRegistrations: number;
  totalPointsAwarded: number;
  totalVolunteerHours: number;
  pendingApprovals: number;
}

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // State for admin data
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalClubs: 0,
    totalEvents: 0,
    activeEvents: 0,
    thisMonthRegistrations: 0,
    totalPointsAwarded: 0,
    totalVolunteerHours: 0,
    pendingApprovals: 0
  });
  
  const [users, setUsers] = useState<User[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  // Check admin authorization
  useEffect(() => {
    if (!user || user.role !== 'super_admin') {
      // Redirect to dashboard or show error
      return;
    }
    fetchAdminData();
  }, [user]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch admin statistics
      // const statsResponse = await adminService.getStatistics();
      // setStats(statsResponse.data);
      
      // Mock data for development
      setStats({
        totalUsers: 1247,
        totalClubs: 28,
        totalEvents: 156,
        activeEvents: 12,
        thisMonthRegistrations: 342,
        totalPointsAwarded: 15680,
        totalVolunteerHours: 2840.5,
        pendingApprovals: 5
      });

      // Mock users data
      setUsers([
        {
          id: '1',
          email: 'john.doe@college.edu',
          firstName: 'John',
          lastName: 'Doe',
          studentId: 'CS2021001',
          department: 'Computer Science',
          yearOfStudy: 3,
          role: 'student',
          isVerified: true,
          totalPoints: 450,
          totalVolunteerHours: 28.5,
          createdAt: '2023-08-15T10:00:00Z',
          lastLogin: '2024-01-15T14:30:00Z'
        },
        {
          id: '2',
          email: 'jane.smith@college.edu',
          firstName: 'Jane',
          lastName: 'Smith',
          studentId: 'EC2022015',
          department: 'Electronics',
          yearOfStudy: 2,
          role: 'club_admin',
          isVerified: true,
          totalPoints: 680,
          totalVolunteerHours: 45.0,
          createdAt: '2023-09-20T15:30:00Z',
          lastLogin: '2024-01-16T09:15:00Z'
        }
      ]);

      // Mock clubs data
      setClubs([
        {
          id: '1',
          name: 'Coding Club',
          category: 'technical',
          memberCount: 156,
          eventCount: 24,
          isActive: true,
          createdBy: '2',
          createdAt: '2023-08-01T12:00:00Z'
        },
        {
          id: '2',
          name: 'Drama Society',
          category: 'cultural',
          memberCount: 89,
          eventCount: 18,
          isActive: true,
          createdBy: '3',
          createdAt: '2023-08-15T14:00:00Z'
        }
      ]);

      // Mock events data
      setEvents([
        {
          id: '1',
          title: 'Hackathon 2024',
          clubName: 'Coding Club',
          eventType: 'competition',
          startDate: '2024-02-15T09:00:00Z',
          registrationCount: 78,
          attendanceCount: 65,
          isPublished: true,
          pointsReward: 100,
          status: 'upcoming'
        },
        {
          id: '2',
          title: 'Annual Drama Festival',
          clubName: 'Drama Society',
          eventType: 'cultural',
          startDate: '2024-02-20T18:00:00Z',
          registrationCount: 45,
          attendanceCount: 42,
          isPublished: true,
          pointsReward: 75,
          status: 'completed'
        }
      ]);

    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      switch (action) {
        case 'verify':
          // await adminService.verifyUser(userId);
          console.log('Verify user:', userId);
          break;
        case 'suspend':
          // await adminService.suspendUser(userId);
          console.log('Suspend user:', userId);
          break;
        case 'promote':
          // await adminService.updateUserRole(userId, 'club_admin');
          console.log('Promote user:', userId);
          break;
        case 'delete':
          // await adminService.deleteUser(userId);
          console.log('Delete user:', userId);
          break;
      }
      // Refresh data after action
      fetchAdminData();
    } catch (error) {
      console.error('User action failed:', error);
    }
  };

  const handleClubAction = async (clubId: string, action: string) => {
    try {
      switch (action) {
        case 'activate':
          // await adminService.updateClubStatus(clubId, true);
          console.log('Activate club:', clubId);
          break;
        case 'deactivate':
          // await adminService.updateClubStatus(clubId, false);
          console.log('Deactivate club:', clubId);
          break;
        case 'delete':
          // await adminService.deleteClub(clubId);
          console.log('Delete club:', clubId);
          break;
      }
      fetchAdminData();
    } catch (error) {
      console.error('Club action failed:', error);
    }
  };

  const handleEventAction = async (eventId: string, action: string) => {
    try {
      switch (action) {
        case 'publish':
          // await adminService.publishEvent(eventId);
          console.log('Publish event:', eventId);
          break;
        case 'unpublish':
          // await adminService.unpublishEvent(eventId);
          console.log('Unpublish event:', eventId);
          break;
        case 'cancel':
          // await adminService.cancelEvent(eventId);
          console.log('Cancel event:', eventId);
          break;
        case 'delete':
          // await adminService.deleteEvent(eventId);
          console.log('Delete event:', eventId);
          break;
      }
      fetchAdminData();
    } catch (error) {
      console.error('Event action failed:', error);
    }
  };

  const exportData = async (type: string) => {
    try {
      // await adminService.exportData(type);
      console.log('Export data:', type);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800';
      case 'club_admin': return 'bg-blue-600 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-600 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.clubName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user || user.role !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access the admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600">Manage users, clubs, and events</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => exportData('all')}>
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="clubs">Clubs</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Clubs</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalClubs}</div>
                  <p className="text-xs text-muted-foreground">
                    +2 new this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalEvents}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeEvents} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Points Awarded</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPointsAwarded.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalVolunteerHours} volunteer hours
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Pending Approvals */}
            {stats.pendingApprovals > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    Pending Approvals
                  </CardTitle>
                  <CardDescription>
                    {stats.pendingApprovals} items require your attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="mr-2">
                    Review Club Applications
                  </Button>
                  <Button variant="outline">
                    Review Event Submissions
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New user registered</p>
                      <p className="text-xs text-gray-500">jane.smith@college.edu - 2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Event published</p>
                      <p className="text-xs text-gray-500">Hackathon 2024 by Coding Club - 4 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage registered users and their roles</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-80"
                      />
                    </div>
                    <Button variant="outline" onClick={() => exportData('users')}>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">User</th>
                        <th className="text-left py-2">Role</th>
                        <th className="text-left py-2">Department</th>
                        <th className="text-left py-2">Points</th>
                        <th className="text-left py-2">Status</th>
                        <th className="text-left py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.profileImage} />
                                <AvatarFallback>
                                  {user.firstName[0]}{user.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.firstName} {user.lastName}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <Badge className={getRoleColor(user.role)}>
                              {user.role.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="py-4">
                            <div>
                              <p className="text-sm">{user.department}</p>
                              <p className="text-xs text-gray-500">Year {user.yearOfStudy}</p>
                            </div>
                          </td>
                          <td className="py-4">
                            <div>
                              <p className="text-sm font-medium">{user.totalPoints}</p>
                              <p className="text-xs text-gray-500">{user.totalVolunteerHours}h volunteer</p>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              {user.isVerified ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <UserCheck className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              ) : (
                                <Badge className="bg-amber-100 text-amber-800">
                                  <UserX className="w-3 h-3 mr-1" />
                                  Pending
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => console.log('View profile:', user.id)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Profile
                                </DropdownMenuItem>
                                {!user.isVerified && (
                                  <DropdownMenuItem onClick={() => handleUserAction(user.id, 'verify')}>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Verify User
                                  </DropdownMenuItem>
                                )}
                                {user.role === 'student' && (
                                  <DropdownMenuItem onClick={() => handleUserAction(user.id, 'promote')}>
                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                    Promote to Admin
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleUserAction(user.id, 'suspend')}>
                                  <Shield className="mr-2 h-4 w-4" />
                                  Suspend User
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleUserAction(user.id, 'delete')}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clubs Tab */}
          <TabsContent value="clubs" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Club Management</CardTitle>
                    <CardDescription>Manage registered clubs and their activities</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search clubs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-80"
                      />
                    </div>
                    <Button variant="outline" onClick={() => exportData('clubs')}>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Club</th>
                        <th className="text-left py-2">Category</th>
                        <th className="text-left py-2">Members</th>
                        <th className="text-left py-2">Events</th>
                        <th className="text-left py-2">Status</th>
                        <th className="text-left py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClubs.map((club) => (
                        <tr key={club.id} className="border-b hover:bg-gray-50">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium">{club.name}</p>
                                <p className="text-sm text-gray-500">
                                  Created {new Date(club.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <Badge variant="outline">
                              {club.category}
                            </Badge>
                          </td>
                          <td className="py-4">
                            <p className="font-medium">{club.memberCount}</p>
                          </td>
                          <td className="py-4">
                            <p className="font-medium">{club.eventCount}</p>
                          </td>
                          <td className="py-4">
                            <Badge className={club.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {club.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="py-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => console.log('View club:', club.id)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => console.log('Edit club:', club.id)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Club
                                </DropdownMenuItem>
                                {club.isActive ? (
                                  <DropdownMenuItem onClick={() => handleClubAction(club.id, 'deactivate')}>
                                    <UserX className="mr-2 h-4 w-4" />
                                    Deactivate
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleClubAction(club.id, 'activate')}>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Activate
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleClubAction(club.id, 'delete')}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Club
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Event Management</CardTitle>
                    <CardDescription>Manage all club events and activities</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-80"
                      />
                    </div>
                    <Button variant="outline" onClick={() => exportData('events')}>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Event</th>
                        <th className="text-left py-2">Club</th>
                        <th className="text-left py-2">Date</th>
                        <th className="text-left py-2">Registration</th>
                        <th className="text-left py-2">Attendance</th>
                        <th className="text-left py-2">Status</th>
                        <th className="text-left py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEvents.map((event) => (
                        <tr key={event.id} className="border-b hover:bg-gray-50">
                          <td className="py-4">
                            <div>
                              <p className="font-medium">{event.title}</p>
                              <p className="text-sm text-gray-500">
                                {event.pointsReward} points • {event.eventType}
                              </p>
                            </div>
                          </td>
                          <td className="py-4">
                            <p className="text-sm">{event.clubName}</p>
                          </td>
                          <td className="py-4">
                            <div>
                              <p className="text-sm">
                                {new Date(event.startDate).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(event.startDate).toLocaleTimeString()}
                              </p>
                            </div>
                          </td>
                          <td className="py-4">
                            <p className="font-medium">{event.registrationCount}</p>
                          </td>
                          <td className="py-4">
                            <div>
                              <p className="font-medium">{event.attendanceCount}</p>
                              <p className="text-xs text-gray-500">
                                {event.registrationCount > 0 
                                  ? `${Math.round((event.attendanceCount / event.registrationCount) * 100)}%`
                                  : '0%'
                                } rate
                              </p>
                            </div>
                          </td>
                          <td className="py-4">
                            <Badge className={getStatusColor(event.status)}>
                              {event.status}
                            </Badge>
                          </td>
                          <td className="py-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => console.log('View event:', event.id)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => console.log('Edit event:', event.id)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Event
                                </DropdownMenuItem>
                                {!event.isPublished ? (
                                  <DropdownMenuItem onClick={() => handleEventAction(event.id, 'publish')}>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Publish Event
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleEventAction(event.id, 'unpublish')}>
                                    <UserX className="mr-2 h-4 w-4" />
                                    Unpublish Event
                                  </DropdownMenuItem>
                                )}
                                {event.status === 'upcoming' && (
                                  <DropdownMenuItem onClick={() => handleEventAction(event.id, 'cancel')}>
                                    <AlertCircle className="mr-2 h-4 w-4" />
                                    Cancel Event
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleEventAction(event.id, 'delete')}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Event
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;