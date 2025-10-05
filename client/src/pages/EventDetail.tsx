// // import React from "react";

// const EventDetail: React.FC = () => {
// 	return <div>Event Detail Page</div>;
// };

// export default EventDetail;


import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  UserCheck,
  ChevronLeft,
  Share2,
  Bookmark,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
  Building2,
  Tag,
  Heart
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  clubId: string;
  clubName: string;
  clubLogo?: string;
  eventType: string;
  startDate: string;
  endDate: string;
  location?: string;
  maxParticipants?: number;
  registrationDeadline?: string;
  pointsReward: number;
  volunteerHours: number;
  imageUrl?: string;
  tags: string[];
  skillAreas: string[];
  isPublished: boolean;
  requiresApproval: boolean;
  createdBy: string;
  organizerName: string;
  registrationCount: number;
  attendanceCount: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

interface Registration {
  id: string;
  userId: string;
  status: 'registered' | 'waitlisted' | 'cancelled' | 'attended';
  registrationDate: string;
}

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isWaitlisted, setIsWaitlisted] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEventData();
    }
  }, [id]);

  const fetchEventData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      const mockEvent: Event = {
        id: id!,
        title: 'Web Development Workshop 2024',
        description: `Join us for an intensive hands-on workshop covering the fundamentals of modern web development. 

This workshop is designed for beginners and intermediate developers who want to learn or enhance their skills in building responsive, interactive web applications.

**What you'll learn:**
- HTML5 and CSS3 fundamentals
- JavaScript ES6+ features
- React.js basics
- Building responsive layouts
- Git version control
- Deployment strategies

**What to bring:**
- Your laptop with a code editor installed
- Enthusiasm to learn!

Refreshments will be provided. Certificate of participation will be awarded to all attendees.`,
        clubId: 'c1',
        clubName: 'Coding Club',
        eventType: 'workshop',
        startDate: '2024-02-15T14:00:00Z',
        endDate: '2024-02-15T18:00:00Z',
        location: 'Computer Lab 301, Main Building',
        maxParticipants: 50,
        registrationDeadline: '2024-02-14T23:59:59Z',
        pointsReward: 50,
        volunteerHours: 4,
        imageUrl: '',
        tags: ['Web Development', 'JavaScript', 'React', 'Beginner Friendly'],
        skillAreas: ['Programming', 'Web Development', 'Frontend'],
        isPublished: true,
        requiresApproval: false,
        createdBy: 'u1',
        organizerName: 'John Doe',
        registrationCount: 42,
        attendanceCount: 0,
        status: 'upcoming'
      };

      setEvent(mockEvent);
      setIsRegistered(false);
      setIsWaitlisted(false);
    } catch (error) {
      console.error('Failed to fetch event data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      // await eventService.registerForEvent(id!);
      setIsRegistered(true);
      if (event) {
        setEvent({ ...event, registrationCount: event.registrationCount + 1 });
      }
    } catch (error) {
      console.error('Failed to register:', error);
    }
  };

  const handleUnregister = async () => {
    try {
      // await eventService.unregisterFromEvent(id!);
      setIsRegistered(false);
      if (event) {
        setEvent({ ...event, registrationCount: event.registrationCount - 1 });
      }
    } catch (error) {
      console.error('Failed to unregister:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      upcoming: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getEventTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      workshop: <Award className="w-5 h-5" />,
      seminar: <Users className="w-5 h-5" />,
      competition: <Award className="w-5 h-5" />,
      hackathon: <Award className="w-5 h-5" />
    };
    return icons[type] || <Calendar className="w-5 h-5" />;
  };

  const isRegistrationOpen = () => {
    if (!event) return false;
    if (event.status === 'cancelled' || event.status === 'completed') return false;
    if (event.registrationDeadline) {
      return new Date(event.registrationDeadline) > new Date();
    }
    return new Date(event.startDate) > new Date();
  };

  const isFull = () => {
    if (!event || !event.maxParticipants) return false;
    return event.registrationCount >= event.maxParticipants;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Event Not Found</CardTitle>
            <CardDescription>The event you're looking for doesn't exist.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/events')}>Back to Events</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-blue-600 to-purple-600">
        {event.imageUrl && (
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20 mb-4"
              onClick={() => navigate('/events')}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-4">
                <Badge className={getStatusColor(event.status)}>
                  {event.status}
                </Badge>
                <Badge variant="outline" className="text-white border-white">
                  {event.eventType}
                </Badge>
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">{event.title}</h1>
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  <span>{event.clubName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{event.registrationCount} registered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-line text-gray-700">{event.description}</p>
                  </div>

                  {/* Key Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Date & Time</p>
                        <p className="text-sm text-gray-600">
                          {new Date(event.startDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(event.startDate).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {' - '}
                          {new Date(event.endDate).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {event.location && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Location</p>
                          <p className="text-sm text-gray-600">{event.location}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Rewards</p>
                        <p className="text-sm text-gray-600">{event.pointsReward} AICTE Points</p>
                        <p className="text-sm text-gray-600">{event.volunteerHours} Volunteer Hours</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Capacity</p>
                        <p className="text-sm text-gray-600">
                          {event.maxParticipants 
                            ? `${event.registrationCount} / ${event.maxParticipants} registered`
                            : `${event.registrationCount} registered`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags & Skills */}
            {(event.tags.length > 0 || event.skillAreas.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags & Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {event.tags.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {event.tags.map((tag, index) => (
                            <Badge key={index} variant="outline">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {event.skillAreas.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">Skills You'll Learn</p>
                        <div className="flex flex-wrap gap-2">
                          {event.skillAreas.map((skill, index) => (
                            <Badge key={index} className="bg-blue-100 text-blue-800">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Organizer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Organized By</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                      {event.clubLogo ? (
                        <img src={event.clubLogo} alt={event.clubName} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Building2 className="w-8 h-8 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{event.clubName}</h3>
                      <p className="text-sm text-gray-500">Event Organizer: {event.organizerName}</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => navigate(`/clubs/${event.clubId}`)}>
                    View Club
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <Card>
              <CardHeader>
                <CardTitle>Registration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Registration Status */}
                {isRegistered ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800 mb-2">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-medium">You're Registered!</span>
                    </div>
                    <p className="text-sm text-green-700">
                      You'll receive a confirmation email with event details.
                    </p>
                  </div>
                ) : isWaitlisted ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800 mb-2">
                      <Clock className="w-5 h-5" />
                      <span className="font-medium">You're Waitlisted</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      You'll be notified if a spot becomes available.
                    </p>
                  </div>
                ) : event.status === 'cancelled' ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-800 mb-2">
                      <XCircle className="w-5 h-5" />
                      <span className="font-medium">Event Cancelled</span>
                    </div>
                    <p className="text-sm text-red-700">
                      This event has been cancelled by the organizers.
                    </p>
                  </div>
                ) : event.status === 'completed' ? (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-800 mb-2">
                      <Info className="w-5 h-5" />
                      <span className="font-medium">Event Completed</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      This event has already taken place.
                    </p>
                  </div>
                ) : !isRegistrationOpen() ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-800 mb-2">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">Registration Closed</span>
                    </div>
                    <p className="text-sm text-red-700">
                      Registration deadline has passed.
                    </p>
                  </div>
                ) : isFull() ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800 mb-2">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">Event Full</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Maximum capacity reached. You can join the waitlist.
                    </p>
                  </div>
                ) : null}

                {/* Action Buttons */}
                <div className="space-y-2">
                  {isRegistered ? (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={handleUnregister}
                    >
                      Unregister
                    </Button>
                  ) : isRegistrationOpen() && !isFull() ? (
                    <Button 
                      className="w-full" 
                      onClick={handleRegister}
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Register Now
                    </Button>
                  ) : isRegistrationOpen() && isFull() ? (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleRegister}
                    >
                      Join Waitlist
                    </Button>
                  ) : null}

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Bookmark className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>

                {/* Registration Deadline */}
                {event.registrationDeadline && isRegistrationOpen() && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>
                        Register by {new Date(event.registrationDeadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Event Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Registered</span>
                    <span className="font-semibold">{event.registrationCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Attended</span>
                    <span className="font-semibold">{event.attendanceCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">AICTE Points</span>
                    <Badge variant="outline">{event.pointsReward}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Volunteer Hours</span>
                    <Badge variant="outline">{event.volunteerHours}h</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;