import { api } from './api';
import { 
  Event, 
  EventFilters, 
  EventRegistration,
  CreateEventData,
  UpdateEventData,
  AttendanceData,
  EventAnalytics,
  CalendarEvent
} from '../types/event';

class EventService {
  private readonly endpoints = {
    events: '/events',
    calendar: '/events/calendar',
    register: (eventId: string) => `/events/${eventId}/register`,
    unregister: (eventId: string) => `/events/${eventId}/unregister`,
    registrations: (eventId: string) => `/events/${eventId}/registrations`,
    attendance: (eventId: string) => `/events/${eventId}/attendance`,
    bulkAttendance: (eventId: string) => `/events/${eventId}/bulk-attendance`,
    checkIn: (eventId: string) => `/events/${eventId}/check-in`,
    checkOut: (eventId: string) => `/events/${eventId}/check-out`,
    attendanceReport: (eventId: string) => `/events/${eventId}/attendance-report`,
    qrCode: (eventId: string) => `/events/${eventId}/qr-code`,
    qrAttendance: '/events/qr-attendance',
    attendanceLogs: (eventId: string) => `/events/${eventId}/attendance-logs`,
  };

  /**
   * Get all events with optional filters
   */
  async getEvents(filters?: EventFilters): Promise<Event[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        if (filters.clubId) params.append('clubId', filters.clubId);
        if (filters.category) params.append('category', filters.category);
        if (filters.eventType) {
          const et = Array.isArray(filters.eventType) ? filters.eventType.join(',') : String(filters.eventType);
          params.append('eventType', et);
        }
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.tags?.length) params.append('tags', filters.tags.join(','));
        if (filters.skillAreas?.length) params.append('skillAreas', filters.skillAreas.join(','));
        if (filters.search) params.append('search', filters.search);
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.offset) params.append('offset', filters.offset.toString());
      }

      const queryString = params.toString();
      const url = queryString ? `${this.endpoints.events}?${queryString}` : this.endpoints.events;
      
      const response = await api.get<Event[]>(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch events');
    }
  }

  /**
   * Get event by ID
   */
  async getEventById(eventId: string): Promise<Event> {
    try {
      const response = await api.get<Event>(`${this.endpoints.events}/${eventId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch event details');
    }
  }

  /**
   * Create new event
   */
  async createEvent(eventData: CreateEventData): Promise<Event> {
    try {
      const response = await api.post<Event>(this.endpoints.events, eventData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to create event');
    }
  }

  /**
   * Update existing event
   */
  async updateEvent(eventId: string, eventData: UpdateEventData): Promise<Event> {
    try {
      const response = await api.put<Event>(`${this.endpoints.events}/${eventId}`, eventData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to update event');
    }
  }

  /**
   * Delete event
   */
  async deleteEvent(eventId: string): Promise<void> {
    try {
      await api.delete(`${this.endpoints.events}/${eventId}`);
    } catch (error) {
      throw this.handleError(error, 'Failed to delete event');
    }
  }

  /**
   * Register for event
   */
  async registerForEvent(eventId: string): Promise<EventRegistration> {
    try {
      const response = await api.post<EventRegistration>(this.endpoints.register(eventId));
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to register for event');
    }
  }

  /**
   * Unregister from event
   */
  async unregisterFromEvent(eventId: string): Promise<void> {
    try {
      await api.post(this.endpoints.unregister(eventId));
    } catch (error) {
      throw this.handleError(error, 'Failed to unregister from event');
    }
  }

  /**
   * Get event registrations (admin only)
   */
  async getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
    try {
      const response = await api.get<EventRegistration[]>(this.endpoints.registrations(eventId));
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch event registrations');
    }
  }

  /**
   * Mark individual attendance
   */
  async markAttendance(eventId: string, userId: string, attended: boolean, notes?: string): Promise<void> {
    try {
      await api.put(this.endpoints.attendance(eventId), {
        userId,
        attended,
        notes,
        method: 'manual'
      });
    } catch (error) {
      throw this.handleError(error, 'Failed to mark attendance');
    }
  }

  /**
   * Bulk mark attendance
   */
  async bulkMarkAttendance(eventId: string, attendanceData: AttendanceData[]): Promise<void> {
    try {
      await api.put(this.endpoints.bulkAttendance(eventId), { attendanceData });
    } catch (error) {
      throw this.handleError(error, 'Failed to bulk update attendance');
    }
  }

  /**
   * Manual check-in
   */
  async checkIn(eventId: string, userId: string): Promise<void> {
    try {
      await api.post(this.endpoints.checkIn(eventId), { userId });
    } catch (error) {
      throw this.handleError(error, 'Failed to check in user');
    }
  }

  /**
   * Manual check-out
   */
  async checkOut(eventId: string, userId: string): Promise<void> {
    try {
      await api.post(this.endpoints.checkOut(eventId), { userId });
    } catch (error) {
      throw this.handleError(error, 'Failed to check out user');
    }
  }

  /**
   * Get attendance report
   */
  async getAttendanceReport(eventId: string): Promise<EventAnalytics> {
    try {
      const response = await api.get<EventAnalytics>(this.endpoints.attendanceReport(eventId));
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch attendance report');
    }
  }

  /**
   * Generate QR code for event attendance
   */
  async generateQRCode(eventId: string, validMinutes: number = 60): Promise<{ qrCode: string; expiresAt: string }> {
    try {
      const response = await api.post<{ qrCode: string; expiresAt: string }>(
        this.endpoints.qrCode(eventId),
        { validMinutes }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to generate QR code');
    }
  }

  /**
   * Mark attendance via QR code scan
   */
  async markAttendanceByQR(qrCode: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<{ success: boolean; message: string }>(
        this.endpoints.qrAttendance,
        { qrCode }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to mark attendance via QR code');
    }
  }

  /**
   * Get attendance change logs
   */
  async getAttendanceLogs(eventId: string): Promise<any[]> {
    try {
      const response = await api.get<any[]>(this.endpoints.attendanceLogs(eventId));
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch attendance logs');
    }
  }

  /**
   * Get calendar events
   */
  async getCalendarEvents(startDate?: string, endDate?: string): Promise<CalendarEvent[]> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const queryString = params.toString();
      const url = queryString ? `${this.endpoints.calendar}?${queryString}` : this.endpoints.calendar;

      const response = await api.get<CalendarEvent[]>(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch calendar events');
    }
  }

  /**
   * Get user's registered events
   */
  async getUserEvents(): Promise<Event[]> {
    try {
      const response = await api.get<Event[]>('/profile/events');
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch user events');
    }
  }

  /**
   * Upload event image
   */
  async uploadEventImage(file: File): Promise<{ imageUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post<{ imageUrl: string }>(
        '/events/upload-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to upload event image');
    }
  }

  /**
   * Get event analytics (for club admins)
   */
  async getEventAnalytics(eventId: string): Promise<EventAnalytics> {
    try {
      const response = await api.get<EventAnalytics>(`${this.endpoints.events}/${eventId}/analytics`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch event analytics');
    }
  }

  /**
   * Send event reminder notifications
   */
  async sendEventReminders(eventId: string): Promise<{ sent: number; failed: number }> {
    try {
      const response = await api.post<{ sent: number; failed: number }>(
        `${this.endpoints.events}/${eventId}/send-reminders`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to send event reminders');
    }
  }

  /**
   * Handle service errors
   */
  private handleError(error: any, defaultMessage: string): Error {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return new Error(data.message || 'Invalid request');
        case 401:
          return new Error('Authentication required');
        case 403:
          return new Error(data.message || 'Access denied');
        case 404:
          return new Error(data.message || 'Event not found');
        case 409:
          return new Error(data.message || 'Conflict - already registered or event full');
        case 422:
          return new Error(data.message || 'Validation failed');
        case 429:
          return new Error('Too many requests. Please try again later.');
        case 500:
          return new Error('Server error. Please try again later.');
        default:
          return new Error(data.message || defaultMessage);
      }
    } else if (error.request) {
      return new Error('Network error. Please check your connection.');
    } else {
      return new Error(error.message || defaultMessage);
    }
  }
}

export const eventService = new EventService();