import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clubService } from '../services/clubService';
import { Club } from '../types/club';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { 
  Users, 
  Calendar, 
  Mail, 
  Globe, 
  MapPin, 
  TrendingUp, 
  Award,
  Clock,
  ArrowLeft,
  UserPlus,
  UserMinus,
  Share2,
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ClubDetails extends Club {
  members?: any[];
  events?: any[];
  admins?: any[];
}

const ClubDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [club, setClub] = useState<ClubDetails | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [isMember, setIsMember] = useState(false);
  const [joiningClub, setJoiningClub] = useState(false);

  useEffect(() => {
    if (id) {
      fetchClubDetails();
      fetchClubStats();
    }
  }, [id]);

  const fetchClubDetails = async () => {
    setLoading(true);
    try {
      const data = await clubService.getClubById(id!);
      setClub(data);
      
      // Check if user is a member (you'll need to implement this based on your auth)
      // const userId = useAuthStore.getState().user?.id;
      // setIsMember(data.members?.some(m => m.userId === userId));
    } catch (error) {
      console.error('Failed to fetch club details:', error);
      toast.error('Failed to load club details');
    } finally {
      setLoading(false);
    }
  };

  const fetchClubStats = async () => {
    try {
      const statsData = await clubService.getClubStats(id!);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch club stats:', error);
    }
  };

  const handleJoinClub = async () => {
    setJoiningClub(true);
    try {
      await clubService.joinClub(id!);
      toast.success('Successfully joined the club!');
      setIsMember(true);
      fetchClubDetails();
      fetchClubStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to join club');
    } finally {
      setJoiningClub(false);
    }
  };

  const handleLeaveClub = async () => {
    if (!confirm('Are you sure you want to leave this club?')) return;
    
    setJoiningClub(true);
    try {
      await clubService.leaveClub(id!);
      toast.success('Successfully left the club');
      setIsMember(false);
      fetchClubDetails();
      fetchClubStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to leave club');
    } finally {
      setJoiningClub(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      technical: 'bg-blue-100 text-blue-800',
      cultural: 'bg-purple-100 text-purple-800',
      sports: 'bg-green-100 text-green-800',
      academic: 'bg-yellow-100 text-yellow-800',
      social_service: 'bg-pink-100 text-pink-800',
      entrepreneurship: 'bg-orange-100 text-orange-800',
      arts: 'bg-indigo-100 text-indigo-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl font-semibold mb-2">Club not found</h2>
            <p className="text-gray-600 mb-4">The club you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/clubs')}>
              Back to Clubs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="h-64 bg-gradient-to-br from-blue-500 to-purple-600 relative">
        {club.coverImageUrl && (
          <img 
            src={club.coverImageUrl} 
            alt={club.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      </div>

      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="relative -mt-20 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Club Logo */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 bg-white rounded-lg border-4 border-white shadow-lg overflow-hidden">
                    {club.logoUrl ? (
                      <img 
                        src={club.logoUrl} 
                        alt={club.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-4xl font-bold text-white">
                          {club.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Club Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {club.name}
                      </h1>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getCategoryColor(club.category)}>
                          {club.category.replace('_', ' ')}
                        </Badge>
                        {club.isActive ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                        )}
                        {club.establishedYear && (
                          <Badge variant="outline">
                            Est. {club.establishedYear}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigate('/clubs')}
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                  </div>

                  <p className="text-gray-600 mb-4">
                    {club.description || 'No description available'}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {isMember ? (
                      <Button 
                        variant="outline" 
                        onClick={handleLeaveClub}
                        disabled={joiningClub}
                      >
                        <UserMinus className="w-4 h-4 mr-2" />
                        Leave Club
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleJoinClub}
                        disabled={joiningClub || !club.isActive}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Join Club
                      </Button>
                    )}
                    <Button variant="outline">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Members</p>
                    <p className="text-2xl font-bold">{stats.totalMembers || 0}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Events</p>
                    <p className="text-2xl font-bold">{stats.totalEvents || 0}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Points Given</p>
                    <p className="text-2xl font-bold">{stats.totalPointsDistributed || 0}</p>
                  </div>
                  <Award className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Volunteer Hrs</p>
                    <p className="text-2xl font-bold">{stats.totalVolunteerHours || 0}</p>
                  </div>
                  <Clock className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs Section */}
        <Tabs defaultValue="about" className="mb-8">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          {/* About Tab */}
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About {club.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-600">
                    {club.description || 'No description available'}
                  </p>
                </div>

                {club.requirements && (
                  <div>
                    <h3 className="font-semibold mb-2">Requirements</h3>
                    <p className="text-gray-600">{club.requirements}</p>
                  </div>
                )}

                {club.meetingSchedule && (
                  <div>
                    <h3 className="font-semibold mb-2">Meeting Schedule</h3>
                    <p className="text-gray-600">{club.meetingSchedule}</p>
                  </div>
                )}

                {club.tags && club.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {club.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Club Events</CardTitle>
                <CardDescription>
                  {stats?.upcomingEvents || 0} upcoming events
                </CardDescription>
              </CardHeader>
              <CardContent>
                {club.events && club.events.length > 0 ? (
                  <div className="space-y-4">
                    {club.events.map((event: any) => (
                      <div 
                        key={event.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/events/${event.id}`)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{event.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {event.description}
                            </p>
                            <div className="flex gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(event.startDate).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {event.location}
                              </span>
                            </div>
                          </div>
                          {event.isPublished && (
                            <Badge className="bg-green-100 text-green-800">
                              Published
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No events scheduled yet
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>Club Members</CardTitle>
                <CardDescription>
                  {club.memberCount || 0} total members
                </CardDescription>
              </CardHeader>
              <CardContent>
                {club.members && club.members.length > 0 ? (
                  <div className="space-y-3">
                    {club.members.map((member: any) => (
                      <div 
                        key={member.id}
                        className="flex items-center justify-between border rounded-lg p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.user?.profileImage} />
                            <AvatarFallback>
                              {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {member.user?.firstName} {member.user?.lastName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {member.user?.department} • Year {member.user?.yearOfStudy}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {member.role.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No members to display
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {club.contactEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <a 
                        href={`mailto:${club.contactEmail}`}
                        className="text-blue-600 hover:underline"
                      >
                        {club.contactEmail}
                      </a>
                    </div>
                  </div>
                )}

                {club.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Website</p>
                      <a 
                        href={club.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {club.website}
                      </a>
                    </div>
                  </div>
                )}

                {club.socialLinks && Object.keys(club.socialLinks).length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Social Media</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(club.socialLinks).map(([platform, url]) => (
                        <a
                          key={platform}
                          href={url as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline capitalize"
                        >
                          {platform}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {!club.contactEmail && !club.website && (!club.socialLinks || Object.keys(club.socialLinks).length === 0) && (
                  <p className="text-center text-gray-500 py-8">
                    No contact information available
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClubDetail;