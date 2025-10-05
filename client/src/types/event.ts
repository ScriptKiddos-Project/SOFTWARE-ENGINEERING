// types/event.ts
// Re-export types from index.ts to maintain backward compatibility
export type {
  Event,
  EventDetail,
  EventRegistration,
  EventFilters,
  CreateEventForm,
  AttendanceLog as AttendanceData,
} from './index';

// Additional event-specific types not in index.ts
export interface UpdateEventData extends Partial<CreateEventData> {
  id?: string;
}

export interface EventAnalytics {
  totalRegistrations: number;
  attendanceRate: number;
  averageRating?: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
}

// Helper type for creating events
export interface CreateEventData {
  title: string;
  description?: string;
  clubId?: string;
  eventType?: string;
  startDate: string;
  endDate: string;
  location?: string;
  maxParticipants?: number;
  registrationDeadline?: string;
  pointsReward?: number;
  volunteerHours?: number;
  imageUrl?: string;
  tags?: string[];
  skillAreas?: string[];
  requiresApproval?: boolean;
}