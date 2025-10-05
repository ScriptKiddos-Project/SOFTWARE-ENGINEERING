import { useState, useEffect } from 'react';
import { eventService } from '../services/eventService';
import type { Event, EventDetail, EventFilters } from '../types/event';

export const useEvents = () => {
  // Change events to EventDetail[] to match expected type
  const [events, setEvents] = useState<EventDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async (filters?: EventFilters) => {
    try {
      setLoading(true);
      setError(null);
      const eventsFromService: Event[] = await eventService.getEvents(filters);

      // Map Event[] to EventDetail[] by adding required fields
      const detailedEvents: EventDetail[] = eventsFromService.map(event => ({
        ...event,
        registeredCount: 0,     // Default 0, replace if you get real data
        isRegistered: false,    // Default false
        registrationStatus: undefined,
        canEdit: false,
        canManageAttendance: false,
        registrations: [],      // empty array if you want
      }));

      setEvents(detailedEvents);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  // Other methods unchanged, but typed on EventDetail[]
  const registerForEvent = async (eventId: string): Promise<boolean> => {
    try {
      await eventService.registerForEvent(eventId);
      setEvents(prev => prev.map(event => 
        event.id === eventId ? { ...event, isRegistered: true } : event
      ));
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to register for event');
      return false;
    }
  };

  const unregisterFromEvent = async (eventId: string): Promise<boolean> => {
    try {
      await eventService.unregisterFromEvent(eventId);
      setEvents(prev => prev.map(event => 
        event.id === eventId ? { ...event, isRegistered: false } : event
      ));
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to unregister from event');
      return false;
    }
  };

  const getEventById = (eventId: string): EventDetail | undefined => {
    return events.find(event => event.id === eventId);
  };

  const getUpcomingEvents = (): EventDetail[] => {
    const now = new Date();
    return events.filter(event => new Date(event.startDate) > now);
  };

  const getPastEvents = (): EventDetail[] => {
    const now = new Date();
    return events.filter(event => new Date(event.endDate) < now);
  };

  const getEventsByClub = (clubId: string): EventDetail[] => {
    return events.filter(event => event.clubId === clubId);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    error,
    fetchEvents,
    registerForEvent,
    unregisterFromEvent,
    getEventById,
    getUpcomingEvents,
    getPastEvents,
    getEventsByClub,
    refetch: () => fetchEvents(),
  };
};
