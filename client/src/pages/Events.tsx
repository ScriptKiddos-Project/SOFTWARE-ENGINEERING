import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../hooks/useEvents';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Award, 
  Clock, 
  Search,
  Filter,
  TrendingUp
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import type { EventDetail } from '../types';

const Events = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { events, loading, refetch } = useEvents();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState<EventDetail[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'upcoming' | 'past'>('all');

  const isClubAdmin = user?.role === 'club_admin' || user?.role === 'super_admin';

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, filterType]);

  const filterEvents = () => {
    let filtered = events;

    // Filter by time
    const now = new Date();
    if (filterType === 'upcoming') {
      filtered = events.filter(e => new Date(e.startDate) > now);
    } else if (filterType === 'past') {
      filtered = events.filter(e => new Date(e.endDate) < now);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(query) ||
        e.description?.toLowerCase().includes(query) ||
        e.club?.name?.toLowerCase().includes(query)
      );
    }

    setFilteredEvents(filtered);
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      workshop: 'bg-blue-100 text-blue-800',
      seminar: 'bg-purple-100 text-purple-800',
      competition: 'bg-green-100 text-green-800',
      cultural_event: 'bg-pink-100 text-pink-800',
      sports_event: 'bg-orange-100 text-orange-800',
      volunteering: 'bg-teal-100 text-teal-800',
      hackathon: 'bg-red-100 text-red-800',
      conference: 'bg-indigo-100 text-indigo-800',
      social_gathering: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getEventStatus = (event: EventDetail) => {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    if (now < start) return { label: 'Upcoming', color: 'bg-blue-100 text-blue-800' };
    if (now >= start && now <= end) return { label: 'Ongoing', color: 'bg-green-100 text-green-800' };
    return { label: 'Completed', color: 'bg-gray-100 text-gray-800' };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Events</h1>
        <p className="text-gray-600">
          Discover and participate in {events.length} exciting campus events
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {searchQuery && (
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <Button 
            variant={filterType === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterType('all')}
            size="sm"
          >
            All Events ({events.length})
          </Button>
          <Button 
            variant={filterType === 'upcoming' ? 'default' : 'outline'}
            onClick={() => setFilterType('upcoming')}
            size="sm"
          >
            Upcoming ({events.filter(e => new Date(e.startDate) > new Date()).length})
          </Button>
          <Button 
            variant={filterType === 'past' ? 'default' : 'outline'}
            onClick={() => setFilterType('past')}
            size="sm"
          >
            Past ({events.filter(e => new Date(e.endDate) < new Date()).length})
          </Button>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              {searchQuery 
                ? `No events found matching "${searchQuery}"`
                : 'No events available'
              }
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => { setSearchQuery(''); setFilterType('all'); }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => {
            const status = getEventStatus(event);
            
            return (
              <Card 
                key={event.id} 
                className="hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                onClick={() => navigate(`/events/${event.id}`)}
              >
                {/* Event Image */}
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                  {event.imageUrl ? (
                    <img 
                      src={event.imageUrl} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Calendar className="w-16 h-16 text-white opacity-50" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge className={status.color}>
                      {status.label}
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-lg line-clamp-2">
                      {event.title}
                    </CardTitle>
                  </div>
                  
                  {/* Event Type & Club */}
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getEventTypeColor(event.eventType)} variant="outline">
                      {event.eventType.replace('_', ' ')}
                    </Badge>
                    {event.club && (
                      <span className="text-xs text-gray-600">
                        by {event.club.name}
                      </span>
                    )}
                  </div>

                  <CardDescription className="line-clamp-2">
                    {event.description || 'No description available'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Date & Time */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(event.startDate)}</span>
                    <Clock className="w-4 h-4 ml-2" />
                    <span>{formatTime(event.startDate)}</span>
                  </div>

                  {/* Location */}
                  {event.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  )}

                  {/* Participants */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>
                      {event.registeredCount || 0}
                      {event.maxParticipants ? ` / ${event.maxParticipants}` : ''} registered
                    </span>
                  </div>

                  {/* Rewards */}
                  <div className="flex items-center gap-4 pt-3 border-t">
                    <div className="flex items-center gap-1 text-sm">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium">{event.pointsReward} pts</span>
                    </div>
                    {event.volunteerHours > 0 && (
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{event.volunteerHours}h</span>
                      </div>
                    )}
                  </div>

                  {/* Registration Status */}
                  {event.isRegistered && (
                    <div className="pt-2">
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        ✓ Registered
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Stats Footer */}
      {events.length > 0 && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold">{events.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Registered</p>
                  <p className="text-2xl font-bold">
                    {events.filter(e => e.isRegistered).length}
                  </p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold">
                    {events.filter(e => new Date(e.startDate) > new Date()).length}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Events;