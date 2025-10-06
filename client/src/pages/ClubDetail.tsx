// // import React from "react";


// const ClubDetail: React.FC = () => {
// 	return <div>Club Detail Page</div>;
// };

// export default ClubDetail;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Users,
  Calendar,
  Mail,
  MapPin,
  Award,
  UserPlus,
  UserMinus,
  Settings,
  Shield,
  Trophy,
  Clock,
  TrendingUp,
  ChevronLeft
} from 'lucide-react';

interface ClubMember {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profileImage?: string;
  joinedAt: string;
  totalPoints: number;
}

interface ClubEvent {
  id: string;
  title: string;
  eventType: string;
  startDate: string;
  location?: string;
  registrationCount: number;
  maxParticipants?: number;
  imageUrl?: string;
  pointsReward: number;
  status: string;
}

interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  logoUrl?: string;
  coverImageUrl?: string;
  contactEmail?: string;
  isActive: boolean;
  memberCount: number;
  eventCount: number;
  createdAt: string;
  totalPoints: number;
}

const ClubDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [club, setClub] = useState<Club | null>(null);
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    if (id) {
      fetchClubData();
    }
  }, [id]);

  const fetchClubData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      setClub({
        id: id!,
        name: 'Coding Club',
        description: 'A community of passionate programmers dedicated to learning, sharing knowledge, and building amazing projects together. We organize regular workshops, hackathons, and coding competitions.',
        category: 'technical',
        logoUrl: '',
        coverImageUrl: '',
        contactEmail: 'codingclub@college.edu',
        isActive: true,
        memberCount: 156,
        eventCount: 24,
        createdAt: '2023-08-01T12:00:00Z',
        totalPoints: 12500
      });

      setMembers([
        {
          id: '1',
          userId: 'u1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@college.edu',
          role: 'president',
          joinedAt: '2023-08-01T12:00:00Z',
          totalPoints: 850
        },
        {
          id: '2',
          userId: 'u2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@college.edu',
          role: 'vice_president',
          joinedAt: '2023-08-15T10:00:00Z',
          totalPoints: 720
        }
      ]);

      setEvents([
        {
          id: 'e1',
          title: 'Web Development Workshop',
          eventType: 'workshop',
          startDate: '2024-02-15T14:00:00Z',
          location: 'Lab 301',
          registrationCount: 45,
          maxParticipants: 50,
          pointsReward: 50,
          status: 'upcoming'
        }
      ]);

      setIsMember(false);
      setIsAdmin(false);
    } catch (error) {
      console.error('Failed to fetch club data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClub = async () => {
    try {
      // await clubService.joinClub(id!);
      setIsMember(true);
      if (club) {
        setClub({ ...club, memberCount: club.memberCount + 1 });
      }
    } catch (error) {
      console.error('Failed to join club:', error);
    }
  };

  const handleLeaveClub = async () => {
    try {
      // await clubService.leaveClub(id!);
      setIsMember(false);
      if (club) {
        setClub({ ...club, memberCount: club.memberCount - 1 });
      }
    } catch (error) {
      console.error('Failed to leave club:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      technical: 'bg-blue-600 text-blue-800',
      cultural: 'bg-purple-100 text-purple-800',
      sports: 'bg-green-100 text-green-800',
      academic: 'bg-blue-600 text-yellow-800',
      social_service: 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getRoleDisplay = (role: string) => {
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Club Not Found</CardTitle>
            <CardDescription>The club you're looking for doesn't exist.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/clubs')}>Back to Clubs</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="h-64 bg-gradient-to-r from-blue-600 to-purple-600 relative">
        {club.coverImageUrl && (
          <img src={club.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
        )}
        <Button
          variant="ghost"
          className="absolute top-4 left-4 text-white hover:bg-white/20"
          onClick={() => navigate('/clubs')}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Clubs
        </Button>
      </div>

      <div className="container mx-auto px-4 -mt-20">
        {/* Club Header Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Club Logo */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-white rounded-lg shadow-lg border-4 border-white flex items-center justify-center">
                  {club.logoUrl ? (
                    <img src={club.logoUrl} alt={club.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Users className="w-16 h-16 text-blue-600" />
                  )}
                </div>
              </div>

              {/* Club Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{club.name}</h1>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge className={getCategoryColor(club.category)}>
                        {club.category.replace('_', ' ')}
                      </Badge>
                      {club.isActive ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {isMember ? (
                      <>
                        <Button variant="outline" onClick={handleLeaveClub}>
                          <UserMinus className="w-4 h-4 mr-2" />
                          Leave Club
                        </Button>
                        {isAdmin && (
                          <Button onClick={() => navigate(`/clubs/${id}/manage`)}>
                            <Settings className="w-4 h-4 mr-2" />
                            Manage
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button onClick={handleJoinClub}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Join Club
                      </Button>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{club.memberCount}</p>
                      <p className="text-sm text-gray-500">Members</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{club.eventCount}</p>
                      <p className="text-sm text-gray-500">Events</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{club.totalPoints}</p>
                      <p className="text-sm text-gray-500">Total Points</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {new Date(club.createdAt).getFullYear()}
                      </p>
                      <p className="text-sm text-gray-500">Established</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About the Club</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-6">{club.description}</p>
                
                {club.contactEmail && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-5 h-5" />
                    <a href={`mailto:${club.contactEmail}`} className="hover:text-blue-600">
                      {club.contactEmail}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Core Team */}
            <Card>
              <CardHeader>
                <CardTitle>Core Team</CardTitle>
                <CardDescription>Meet the leadership team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {members.filter(m => ['president', 'vice_president'].includes(m.role)).map((member) => (
                    <div key={member.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.profileImage} />
                        <AvatarFallback>
                          {member.firstName[0]}{member.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.firstName} {member.lastName}</p>
                        <p className="text-sm text-gray-500">{getRoleDisplay(member.role)}</p>
                      </div>
                      <Badge className="ml-auto" variant="outline">
                        <Award className="w-3 h-3 mr-1" />
                        {member.totalPoints} pts
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>{events.length} events scheduled</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/events/${event.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Calendar className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{event.title}</h3>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <span>{new Date(event.startDate).toLocaleDateString()}</span>
                            {event.location && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {event.location}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{event.pointsReward} points</Badge>
                        <p className="text-sm text-gray-500 mt-1">
                          {event.registrationCount}/{event.maxParticipants || '∞'} registered
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Club Members</CardTitle>
                <CardDescription>{club.memberCount} total members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.profileImage} />
                          <AvatarFallback>
                            {member.firstName[0]}{member.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.firstName} {member.lastName}</p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{getRoleDisplay(member.role)}</Badge>
                        <Badge>
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {member.totalPoints}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClubDetail;