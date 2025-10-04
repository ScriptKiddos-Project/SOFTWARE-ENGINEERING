// Event Types
export interface Event {
  id: string;
  title: string;
  description?: string;
  club_id: string;
  event_type: EventType;
  start_date: Date;
  end_date: Date;
  location?: string;
  max_participants?: number;
  registration_deadline?: Date;
  points_reward: number;
  volunteer_hours: number;
  image_url?: string;
  tags: string[];
  skill_areas: string[];
  is_published: boolean;
  requires_approval: boolean;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  
  // Relations
  club?: {
    id: string;
    name: string;
    category: string;
    logo_url?: string;
  };
  creator?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  registrations?: EventRegistration[];
  _count?: {
    registrations: number;
  };
}

// Event Registration Types
export interface EventRegistration {
  id: string;
  user_id: string;
  event_id: string;
  registration_date: Date;
  status: RegistrationStatus;
  attended: boolean;
  attendance_marked_by?: string;
  attendance_marked_at?: Date;
  attendance_method?: AttendanceMethod;
  check_in_time?: Date;
  check_out_time?: Date;
  points_awarded: number;
  volunteer_hours_awarded: number;
  feedback_submitted: boolean;
  notes?: string;
  
  // Relations
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    student_id?: string;
    profile_image?: string;
  };
  event?: Event;
  marked_by?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

// Attendance Log Types
export interface AttendanceLog {
  id: string;
  event_id: string;
  user_id: string;
  marked_by: string;
  action: AttendanceAction;
  previous_status: boolean;
  new_status: boolean;
  reason?: string;
  created_at: Date;
  
  // Relations
  user?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  marked_by_user?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

// QR Code Types
export interface EventQRCode {
  id: string;
  event_id: string;
  qr_code_data: string;
  valid_from: Date;
  valid_until: Date;
  max_scans?: number;
  current_scans: number;
  is_active: boolean;
  created_by: string;
  created_at: Date;
}

// Enums
export enum EventType {
  WORKSHOP = 'workshop',
  SEMINAR = 'seminar',
  COMPETITION = 'competition',
  SOCIAL = 'social',
  MEETING = 'meeting',
  CONFERENCE = 'conference',
  HACKATHON = 'hackathon',
  VOLUNTEER = 'volunteer',
  OTHER = 'other'
}

export enum RegistrationStatus {
  REGISTERED = 'registered',
  WAITLISTED = 'waitlisted',
  CANCELLED = 'cancelled',
  ATTENDED = 'attended',
  NO_SHOW = 'no_show'
}

export enum AttendanceMethod {
  MANUAL = 'manual',
  QR_CODE = 'qr_code',
  GEOFENCE = 'geofence',
  BIOMETRIC = 'biometric'
}

export enum AttendanceAction {
  MARKED_PRESENT = 'marked_present',
  MARKED_ABSENT = 'marked_absent',
  UNMARKED = 'unmarked',
  UPDATED_STATUS = 'updated_status'
}

// Create Event DTO
export interface CreateEventDTO {
  title: string;
  description?: string;
  club_id: string;
  event_type: EventType;
  start_date: Date;
  end_date: Date;
  location?: string;
  max_participants?: number;
  registration_deadline?: Date;
  points_reward?: number;
  volunteer_hours?: number;
  image_url?: string;
  tags?: string[];
  skill_areas?: string[];
  requires_approval?: boolean;
}

// Update Event DTO
export interface UpdateEventDTO {
  title?: string;
  description?: string;
  event_type?: EventType;
  start_date?: Date;
  end_date?: Date;
  location?: string;
  max_participants?: number;
  registration_deadline?: Date;
  points_reward?: number;
  volunteer_hours?: number;
  image_url?: string;
  tags?: string[];
  skill_areas?: string[];
  is_published?: boolean;
  requires_approval?: boolean;
}

// Event Filters
export interface EventFilters {
  club_id?: string;
  event_type?: EventType;
  start_date?: Date;
  end_date?: Date;
  search?: string;
  tags?: string[];
  skill_areas?: string[];
  is_published?: boolean;
  created_by?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Attendance Update DTO
export interface AttendanceUpdateDTO {
  user_ids: string[];
  attended: boolean;
  marked_by: string;
  timestamp: Date;
  method: AttendanceMethod;
  reason?: string;
  check_in_time?: Date;
  check_out_time?: Date;
}

// Bulk Attendance DTO
export interface BulkAttendanceDTO {
  user_ids: string[];
  attended: boolean;
  method: AttendanceMethod;
  reason?: string;
}

// Event Statistics
export interface EventStats {
  total_registrations: number;
  total_attended: number;
  attendance_rate: number;
  points_distributed: number;
  volunteer_hours_awarded: number;
  no_shows: number;
  cancelled_registrations: number;
  waitlisted: number;
  registrations_by_day: {
    date: string;
    count: number;
  }[];
  attendance_by_method: {
    method: AttendanceMethod;
    count: number;
  }[];
}

// Calendar Event
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  club_name: string;
  event_type: EventType;
  location?: string;
  registration_status?: RegistrationStatus;
  is_registered: boolean;
  color?: string;
}

// QR Attendance Scan Result
export interface QRScanResult {
  success: boolean;
  message: string;
  data?: {
    event: Event;
    registration: EventRegistration;
    attendance_marked: boolean;
  };
}

// Event Dashboard Data
export interface EventDashboardData {
  upcoming_events: Event[];
  registered_events: Event[];
  past_events: Event[];
  total_points_earned: number;
  total_volunteer_hours: number;
  events_attended: number;
  upcoming_count: number;
}