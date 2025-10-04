import React from 'react';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface Event {
  id: string;
  title: string;
  description: string;
  club: {
    id: string;
    name: string;
    category: string;
  };
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  pointsReward: number;
  volunteerHours: number;
  imageUrl?: string;
  tags: string[];
  skillAreas: string[];
  isRegistered: boolean;
}

interface TopEventsProps {
  events?: Event[];
  loading?: boolean;
  onEventClick?: (eventId: string) => void;
  onRegisterClick?: (eventId: string) => void;
}

const TopEvents: React.FC<TopEventsProps> = ({
  events = [],
  loading = false,
  onEventClick,
  onRegisterClick
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRegistrationStatus = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return { status: 'high', color: 'bg-red-500' };
    if (percentage >= 70) return { status: 'medium', color: 'bg-yellow-500' };
    return { status: 'low', color: 'bg-green-500' };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Top Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Top Events
          </div>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
            View All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No upcoming events found</p>
            </div>
          ) : (
            events.slice(0, 5).map((event) => {
              const registrationStatus = getRegistrationStatus(
                event.currentParticipants,
                event.maxParticipants
              );

              return (
                <div
                  key={event.id}
                  className="flex space-x-4 p-3 rounded-lg border hover:border-blue-200 hover:bg-blue-50/50 transition-colors cursor-pointer group"
                  onClick={() => onEventClick?.(event.id)}
                >
                  {/* Event Image */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0">
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                        {event.title.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {event.title}
                      </h4>
                      <div className="flex items-center gap-1 ml-2">
                        {event.pointsReward > 0 && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                            {event.pointsReward}pts
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                      by {event.club.name}
                    </p>

                    {/* Event Meta Information */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(event.startDate)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-20">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {event.currentParticipants}/{event.maxParticipants}
                      </div>
                    </div>

                    {/* Registration Status Bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${registrationStatus.color} transition-all duration-300`}
                          style={{
                            width: `${Math.min((event.currentParticipants / event.maxParticipants) * 100, 100)}%`
                          }}
                        />
                      </div>
                      <Button
                        size="sm"
                        variant={event.isRegistered ? "outline" : "default"}
                        className="text-xs h-6 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRegisterClick?.(event.id);
                        }}
                        disabled={event.currentParticipants >= event.maxParticipants}
                      >
                        {event.isRegistered 
                          ? 'Registered' 
                          : event.currentParticipants >= event.maxParticipants 
                            ? 'Full' 
                            : 'Register'
                        }
                      </Button>
                    </div>

                    {/* Tags */}
                    {event.tags.length > 0 && (
                      <div className="flex items-center gap-1 mt-2 flex-wrap">
                        {event.tags.slice(0, 2).map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs px-1.5 py-0.5 h-5"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {event.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-5">
                            +{event.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopEvents;