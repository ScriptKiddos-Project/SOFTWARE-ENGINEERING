import { useState, useEffect } from 'react';
import { eventService } from '../services/eventService';
import type { Event, EventFilters, EventRegistration } from '../types/event';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async (filters?: EventFilters) => {
    try {
      setLoading(true);
      setError(null);
  const events = await eventService.getEvents(filters);
  setEvents(events);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const registerForEvent = async (eventId: string): Promise<boolean> => {
    try {
      await eventService.registerForEvent(eventId);
      // Update local state
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, isRegistered: true }
          : event
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
      // Update local state
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, isRegistered: false }
          : event
      ));
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to unregister from event');
      return false;
    }
  };

  const getEventById = (eventId: string): Event | undefined => {
    return events.find(event => event.id === eventId);
  };

  const getUpcomingEvents = (): Event[] => {
    const now = new Date();
    return events.filter(event => new Date(event.startDate) > now);
  };

  const getPastEvents = (): Event[] => {
    const now = new Date();
    return events.filter(event => new Date(event.endDate) < now);
  };

  const getEventsByClub = (clubId: string): Event[] => {
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
    refetch: () => fetchEvents()
  };
};

export const useEvent = (eventId: string) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError(null);
  const event = await eventService.getEventById(eventId);
  setEvent(event);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch event');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
  const regs = await eventService.getEventRegistrations(eventId);
  setRegistrations(regs);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch registrations');
    }
  };

  const markAttendance = async (userId: string, attended: boolean) => {
    try {
      await eventService.markAttendance(eventId, userId, attended);
      // Update local registrations
      setRegistrations(prev => prev.map(reg => 
        reg.userId === userId ? { ...reg, attended } : reg
      ));
    } catch (err: any) {
      setError(err.message || 'Failed to mark attendance');
    }
  };

  const bulkMarkAttendance = async (userIds: string[], attended: boolean) => {
    try {
      // eventService.bulkMarkAttendance expects (eventId, attendanceData[])
      const attendanceData = userIds.map(userId => ({ userId, attended, method: 'manual' }));
      await eventService.bulkMarkAttendance(eventId, attendanceData);
      setRegistrations(prev => prev.map(reg => 
        userIds.includes(reg.userId) ? { ...reg, attended } : reg
      ));
    } catch (err: any) {
      setError(err.message || 'Failed to bulk mark attendance');
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchEvent();
      fetchRegistrations();
    }
  }, [eventId]);

  return {
    event,
    registrations,
    loading,
    error,
    fetchEvent,
    fetchRegistrations,
    markAttendance,
    bulkMarkAttendance,
    refetch: () => {
      fetchEvent();
      fetchRegistrations();
    }
  };
};


