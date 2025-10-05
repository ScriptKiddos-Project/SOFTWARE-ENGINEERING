import { useState } from 'react';
import * as React from 'react';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

// Icons
import { Users, Calendar, Mail, MapPin, Clock } from 'lucide-react';

// Types
import { Club, ClubMember } from '../../types/club';
import { Event } from '../../types/event';


interface ClubProfileProps {
  club: Club;
  members?: ClubMember[];
  events?: Event[];
  isJoined: boolean;
  isMember: boolean;
  onJoin: () => void;
  onLeave: () => void;
}

export const ClubProfile: React.FC<ClubProfileProps> = ({
  club,
  members = [],
  events = [],
  isJoined,
  isMember,
  onJoin,
  onLeave
}) => {
  const [activeTab, setActiveTab] = useState('about');

  // Safely compute upcoming and past events — support both snake_case and camelCase start date fields
  const upcomingEvents = events.filter(event => {
    const startRaw = (event as any).start_date ?? (event as any).startDate ?? event.startDate;
    if (!startRaw) return false;
    return new Date(String(startRaw)) > new Date();
  });
  const pastEvents = events.filter(event => {
    const startRaw = (event as any).start_date ?? (event as any).startDate ?? event.startDate;
    if (!startRaw) return false;
    return new Date(String(startRaw)) <= new Date();
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero Section */}
      <Card>
        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg">
          {((club as any).cover_image_url ?? club.coverImageUrl) && (
            <img 
              src={(club as any).cover_image_url ?? club.coverImageUrl} 
              alt={club.name}
              className="w-full h-full object-cover rounded-t-lg"
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-40 rounded-t-lg" />
        </div>
        
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                <AvatarImage src={(club as any).logo_url ?? club.logoUrl} alt={club.name} />
                <AvatarFallback className="text-2xl">{club.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{club.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">{club.category}</Badge>
                  {((club as any).is_active ?? club.isActive) ? (
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {isJoined ? (
                <Button variant="outline" onClick={onLeave}>
                  Leave Club
                </Button>
              ) : (
                <Button onClick={onJoin}>
                  Join Club
                </Button>
              )}
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{(club as any).member_count ?? club.memberCount}</div>
              <div className="text-sm text-gray-600">Members</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{upcomingEvents.length}</div>
              <div className="text-sm text-gray-600">Upcoming Events</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{pastEvents.length}</div>
              <div className="text-sm text-gray-600">Past Events</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>About {club.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed mb-4">
                {club.description}
              </p>
              
              <div className="space-y-2">
                {club.contact_email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {club.contact_email}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  Established {new Date(((club as any).created_at ?? club.createdAt) as any).getFullYear()}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-gray-600">{event.description}</p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(String((event as any).start_date ?? event.startDate ?? '')).toLocaleDateString()}
                          <MapPin className="w-3 h-3 ml-3 mr-1" />
                          {event.location}
                        </div>
                      </div>
                      <Badge variant="outline">{event.eventType}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Past Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pastEvents.slice(0, 5).map(event => (
                  <div key={event.id} className="border rounded-lg p-3 opacity-75">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(String((event as any).start_date ?? event.startDate ?? '')).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant="secondary">Completed</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Club Members ({members.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map(member => (
                  <div key={member.user_id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Avatar>
                      <AvatarImage src={member.user.profile_image} />
                      <AvatarFallback>
                        {(member.user.first_name ?? member.user.first_name ?? '')?.charAt(0)}{(member.user.last_name ?? member.user.last_name ?? '')?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">
                        {(member.user.first_name ?? member.user.first_name ?? '')} {(member.user.last_name ?? member.user.last_name ?? '')}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Photo Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                Gallery feature coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default ClubProfile;