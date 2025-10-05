import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
// import EventCard from '../components/events/EventCard';
// import { EventCalendar } from '../components/events/EventCalendar';
// import { EventTimeline } from '../components/events/EventTimeline';
// import { EventFilters } from '../components/events/EventFilters';
// import { EventModal } from '../components/events/EventModal';
// import { CreateEventForm } from '../components/events/CreateEventForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useEvents } from '../hooks/useEvents';
import { useAuth } from '../hooks/useAuth';
// import { Button } from '../components/ui/button';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
// import { Card } from '../components/ui/card';
// import { Calendar, List, Plus } from 'lucide-react';
import type { EventDetail } from '../types'; // Only import from types/index

const Events = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { events, loading, refetch } = useEvents();
  
  const [view, setView] = useState<'grid' | 'calendar' | 'timeline'>(
    (searchParams.get('view') as any) || 'grid'
  );
  const [selectedEvent, setSelectedEvent] = useState<EventDetail | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);

  const isClubAdmin = user?.role === 'club_admin' || user?.role === 'super_admin';

  useEffect(() => {
    refetch();
  }, []);

  const handleEventClick = (event: EventDetail) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleEventClickById = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      handleEventClick(event);
    }
  };

  const handleCloseModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  const transformEventForCard = (event: EventDetail) => ({
    id: event.id,
    title: event.title,
    description: event.description || '',
    clubName: event.club?.name || 'Unknown Club',
    clubLogo: event.club?.logoUrl || '',
    startDate: event.startDate,
    endDate: event.endDate,
    location: event.location || 'TBA',
    maxParticipants: event.maxParticipants || 0,
    registeredCount: event.registeredCount || 0,
    pointsReward: event.pointsReward,
    volunteerHours: event.volunteerHours,
    tags: event.tags || [],
    image: event.imageUrl || '',
    isRegistered: event.isRegistered || false,
    featured: false,
    rating: 4.5
  });

  const transformEventForModal = (event: EventDetail) => ({
    id: event.id,
    title: event.title,
    description: event.description || '',
    clubName: event.club?.name || 'Unknown Club',
    startDate: event.startDate,
    endDate: event.endDate,
    location: event.location || 'TBA',
    maxParticipants: event.maxParticipants || 0,
    registeredCount: event.registeredCount || 0,
    pointsReward: event.pointsReward,
    volunteerHours: event.volunteerHours,
    imageUrl: event.imageUrl,
    tags: event.tags,
    isRegistered: event.isRegistered || false,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ... rest of your JSX remains the same ... */}
    </div>
  );
};

export default Events;