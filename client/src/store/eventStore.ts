import { create } from 'zustand';
import { Event, EventFilters, EventRegistration } from '../types/event';

interface EventState {
  // State
  events: Event[];
  currentEvent: Event | null;
  registrations: EventRegistration[];
  loading: boolean;
  error: string | null;
  filters: EventFilters;
  totalPages: number;
  currentPage: number;

  // Actions
  setEvents: (events: Event[]) => void;
  setCurrentEvent: (event: Event | null) => void;
  setRegistrations: (registrations: EventRegistration[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: EventFilters) => void;
  setPagination: (page: number, totalPages: number) => void;
  
  // Event operations
  addEvent: (event: Event) => void;
  updateEvent: (eventId: string, updates: Partial<Event>) => void;
  removeEvent: (eventId: string) => void;
  
  // Registration operations
  markAsRegistered: (eventId: string) => void;
  markAsUnregistered: (eventId: string) => void;
  updateRegistration: (eventId: string, userId: string, updates: Partial<EventRegistration>) => void;
  
  // Utility functions
  getEventById: (eventId: string) => Event | undefined;
  getUpcomingEvents: () => Event[];
  getPastEvents: () => Event[];
  getEventsByClub: (clubId: string) => Event[];
  clearError: () => void;
  reset: () => void;
}

export const useEventStore = create<EventState>((set, get) => ({
  // Initial state
  events: [],
  currentEvent: null,
  registrations: [],
  loading: false,
  error: null,
  filters: {},
  totalPages: 1,
  currentPage: 1,

  // State setters
  setEvents: (events) => set({ events }),
  setCurrentEvent: (currentEvent) => set({ currentEvent }),
  setRegistrations: (registrations) => set({ registrations }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) => set({ filters }),
  setPagination: (currentPage, totalPages) => set({ currentPage, totalPages }),

  // Event operations
  addEvent: (event) => set((state) => ({
    events: [event, ...state.events]
  })),

  updateEvent: (eventId, updates) => set((state) => ({
    events: state.events.map(event => 
      event.id === eventId ? { ...event, ...updates } : event
    ),
    currentEvent: state.currentEvent?.id === eventId 
      ? { ...state.currentEvent, ...updates }
      : state.currentEvent
  })),

  removeEvent: (eventId) => set((state) => ({
    events: state.events.filter(event => event.id !== eventId),
    currentEvent: state.currentEvent?.id === eventId ? null : state.currentEvent
  })),

  // Registration operations
  markAsRegistered: (eventId) => set((state) => ({
    events: state.events.map(event => 
      event.id === eventId 
        ? { 
            ...event, 
            isRegistered: true,
            registrationCount: (event.registrationCount || 0) + 1
          }
        : event
    ),
    currentEvent: state.currentEvent?.id === eventId
      ? { 
          ...state.currentEvent, 
          isRegistered: true,
          registrationCount: (state.currentEvent.registrationCount || 0) + 1
        }
      : state.currentEvent
  })),

  markAsUnregistered: (eventId) => set((state) => ({
    events: state.events.map(event => 
      event.id === eventId 
        ? { 
            ...event, 
            isRegistered: false,
            registrationCount: Math.max(0, (event.registrationCount || 0) - 1)
          }
        : event
    ),
    currentEvent: state.currentEvent?.id === eventId
      ? { 
          ...state.currentEvent, 
          isRegistered: false,
          registrationCount: Math.max(0, (state.currentEvent.registrationCount || 0) - 1)
        }
      : state.currentEvent
  })),

  updateRegistration: (eventId, userId, updates) => set((state) => ({
    registrations: state.registrations.map(reg => 
      reg.eventId === eventId && reg.userId === userId
        ? { ...reg, ...updates }
        : reg
    )
  })),

  // Utility functions
  getEventById: (eventId) => {
    const state = get();
    return state.events.find(event => event.id === eventId);
  },

  getUpcomingEvents: () => {
    const state = get();
    const now = new Date();
    return state.events.filter(event => new Date(event.startDate) > now);
  },

  getPastEvents: () => {
    const state = get();
    const now = new Date();
    return state.events.filter(event => new Date(event.endDate) < now);
  },

  getEventsByClub: (clubId) => {
    const state = get();
    return state.events.filter(event => event.clubId === clubId);
  },

  clearError: () => set({ error: null }),

  reset: () => set({
    events: [],
    currentEvent: null,
    registrations: [],
    loading: false,
    error: null,
    filters: {},
    totalPages: 1,
    currentPage: 1
  })
}));