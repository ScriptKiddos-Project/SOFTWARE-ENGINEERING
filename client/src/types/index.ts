// client/src/types/index.ts

import { 
  USER_ROLES, 
  CLUB_CATEGORIES, 
  CLUB_MEMBER_ROLES, 
  EVENT_TYPES, 
  REGISTRATION_STATUS,
  ATTENDANCE_METHOD,
  NOTIFICATION_TYPES,
  BADGE_TYPES,
  SKILL_AREAS
} from '../utils/constants';

// Base types
export type ID = string;
export type Timestamp = string;
export type Email = string;
export type URL = string;

// User types
export type UserRole = keyof typeof USER_ROLES;
export type ClubCategory = keyof typeof CLUB_CATEGORIES;
export type ClubMemberRole = keyof typeof CLUB_MEMBER_ROLES;
export type EventType = keyof typeof EVENT_TYPES;
export type RegistrationStatus = keyof typeof REGISTRATION_STATUS;
export type AttendanceMethod = keyof typeof ATTENDANCE_METHOD;
export type NotificationType = keyof typeof NOTIFICATION_TYPES;
export type BadgeType = keyof typeof BADGE_TYPES;
export type SkillArea = keyof typeof SKILL_AREAS;

// User interface
export interface User {
  id: ID;
  email: Email;
  firstName: string;
  lastName: string;
  studentId?: string;
  phone?: string;
  department?: string;
  yearOfStudy?: number;
  role: UserRole;
  isVerified: boolean;
  profileImage?: URL;
  totalPoints: number;
  totalVolunteerHours: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Profile interface
export interface UserProfile extends User {
  bio?: string;
  interests?: SkillArea[];
  socialLinks?: {
    linkedin?: URL;
    github?: URL;
    twitter?: URL;
    portfolio?: URL;
  };
  achievements?: Achievement[];
  badges?: Badge[];
}

// Club interface
export interface Club {
  id: ID;
  name: string;
  description?: string;
  category: ClubCategory;
  logoUrl?: URL;
  coverImageUrl?: URL;
  contactEmail?: Email;
  isActive: boolean;
  memberCount: number;
  createdBy: ID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Club with additional details
export interface ClubDetail extends Club {
  members?: ClubMember[];
  events?: Event[];
  announcements?: Announcement[];
  isJoined?: boolean;
  userRole?: ClubMemberRole;
}

// Club member
export interface ClubMember {
  id: ID;
  userId: ID;
  clubId: ID;
  user: User;
  role: ClubMemberRole;
  joinedAt: Timestamp;
  isActive: boolean;
}

// Event interface
export interface Event {
  id: ID;
  title: string;
  description?: string;
  clubId: ID;
  club?: Club;
  eventType: EventType;
  startDate: Timestamp;
  endDate: Timestamp;
  location?: string;
  maxParticipants?: number;
  registrationDeadline?: Timestamp;
  pointsReward: number;
  volunteerHours: number;
  imageUrl?: URL;
  tags?: string[];
  skillAreas?: SkillArea[];
  isPublished: boolean;
  requiresApproval: boolean;
  createdBy: ID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  registeredCount?: number;
  registrationCount?: number;
}

// Event with additional details
export interface EventDetail extends Event {
  registrations?: EventRegistration[];
  registeredCount: number;
  isRegistered?: boolean;
  registrationStatus?: RegistrationStatus;
  canEdit?: boolean;
  canManageAttendance?: boolean;
}

// Event registration
export interface EventRegistration {
  id: ID;
  userId: ID;
  eventId: ID;
  user?: User;
  event?: Event;
  registrationDate: Timestamp;
  status: RegistrationStatus;
  attended: boolean;
  attendanceMarkedBy?: ID;
  attendanceMarkedAt?: Timestamp;
  attendanceMethod?: AttendanceMethod;
  checkInTime?: Timestamp;
  checkOutTime?: Timestamp;
  pointsAwarded: number;
  volunteerHoursAwarded: number;
  feedbackSubmitted: boolean;
  notes?: string;
}

// Attendance log
export interface AttendanceLog {
  id: ID;
  eventId: ID;
  userId: ID;
  markedBy: ID;
  action: string;
  previousStatus?: boolean;
  newStatus?: boolean;
  reason?: string;
  createdAt: Timestamp;
}

// Badge interface
export interface Badge {
  id: ID;
  name: string;
  description: string;
  type: BadgeType;
  iconUrl?: URL;
  criteria: string;
  pointsRequired?: number;
  isActive: boolean;
  createdAt: Timestamp;
}

// User badge
export interface UserBadge {
  id: ID;
  userId: ID;
  badgeId: ID;
  badge: Badge;
  earnedAt: Timestamp;
  eventId?: ID;
  event?: Event;
}

// Achievement interface
export interface Achievement {
  id: ID;
  title: string;
  description: string;
  category: string;
  date: Timestamp;
  points: number;
  eventId?: ID;
  event?: Event;
}

// Notification interface
export interface Notification {
  id: ID;
  userId: ID;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Timestamp;
}

// Announcement interface
export interface Announcement {
  id: ID;
  clubId: ID;
  club?: Club;
  title: string;
  content: string;
  isImportant: boolean;
  createdBy: ID;
  createdAt: Timestamp;
}

// Chat interfaces
export interface ChatMessage {
  id: ID;
  chatRoomId: ID;
  senderId: ID;
  sender: User;
  content: string;
  messageType: 'text' | 'image' | 'file';
  fileUrl?: URL;
  isEdited: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ChatRoom {
  id: ID;
  clubId: ID;
  club?: Club;
  name: string;
  description?: string;
  isPrivate: boolean;
  createdBy: ID;
  createdAt: Timestamp;
  lastMessage?: ChatMessage;
  unreadCount?: number;
}

// API response interfaces
// export interface ApiResponse<T = any> {
//   success: boolean;
//   data?: T;
//   message?: string;
//   errors?: string[];
// }

// export interface PaginatedResponse<T> extends ApiResponse<T[]> {
//   pagination: {
//     page: number;
//     pageSize: number;
//     total: number;
//     totalPages: number;
//     hasNext: boolean;
//     hasPrevious: boolean;
//   };
// }

// Form interfaces
export interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  studentId?: string;
  phone?: string;
  department?: string;
  yearOfStudy?: number;
  agreeToTerms: boolean;
}

export interface CreateEventForm {
  title: string;
  description?: string;
  eventType: EventType;
  startDate: string;
  endDate: string;
  location?: string;
  maxParticipants?: number;
  registrationDeadline?: string;
  pointsReward: number;
  volunteerHours: number;
  tags?: string[];
  skillAreas?: SkillArea[];
  requiresApproval: boolean;
  imageFile?: File;
}

export interface CreateClubForm {
  name: string;
  description?: string;
  category: ClubCategory;
  contactEmail?: string;
  logoFile?: File;
  coverImageFile?: File;
}

export interface UpdateProfileForm {
  firstName: string;
  lastName: string;
  phone?: string;
  department?: string;
  yearOfStudy?: number;
  bio?: string;
  interests?: SkillArea[];
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    portfolio?: string;
  };
  profileImageFile?: File;
}

// Filter interfaces
// export interface EventFilters {
//   search?: string;
//   eventType?: EventType[];
//   clubCategory?: ClubCategory[];
//   skillAreas?: SkillArea[];
//   dateRange?: {
//     start?: string;
//     end?: string;
//   };
//   pointsRange?: {
//     min?: number;
//     max?: number;
//   };
//   location?: string;
//   isRegistrationOpen?: boolean;
//   sortBy?: 'startDate' | 'title' | 'pointsReward' | 'registrationDeadline';
//   sortOrder?: 'asc' | 'desc';
// }

export interface EventFilters {
  search?: string;
  clubId?: string;  // ADD THIS
  category?: string;  // ADD THIS
  eventType?: EventType[] | string;  // Make it accept both array and string
  clubCategory?: ClubCategory[];
  skillAreas?: SkillArea[] | string[];  // Make it accept both
  dateRange?: {
    start?: string;
    end?: string;
  };
  startDate?: string;  // ADD THIS
  endDate?: string;    // ADD THIS
  tags?: string[];     // ADD THIS
  pointsRange?: {
    min?: number;
    max?: number;
  };
  location?: string;
  isRegistrationOpen?: boolean;
  limit?: number;      // ADD THIS
  offset?: number;     // ADD THIS
  sortBy?: 'startDate' | 'title' | 'pointsReward' | 'registrationDeadline';
  sortOrder?: 'asc' | 'desc';
}

export interface ClubFilters {
  search?: string;
  category?: ClubCategory[];
  isActive?: boolean;
  memberCountRange?: {
    min?: number;
    max?: number;
  };
  sortBy?: 'name' | 'memberCount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Dashboard interfaces
export interface DashboardStats {
  totalPoints: number;
  totalVolunteerHours: number;
  eventsAttended: number;
  clubsJoined: number;
  badgesEarned: number;
  upcomingEvents: number;
  pendingRegistrations: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: ID;
  type: 'event_registration' | 'attendance_marked' | 'badge_earned' | 'club_joined' | 'points_awarded';
  title: string;
  description: string;
  date: Timestamp;
  points?: number;
  eventId?: ID;
  clubId?: ID;
}

// Chart data interfaces
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface PointsHistoryData {
  date: string;
  points: number;
  cumulativePoints: number;
  event?: string;
  eventType?: EventType;
}

// Upload interfaces
export interface FileUpload {
  file: File;
  preview?: string;
  isUploading?: boolean;
  uploadProgress?: number;
  uploadedUrl?: string;
  error?: string;
}

// Error interfaces
export interface FormError {
  field: string;
  message: string;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}

// State interfaces (for Zustand stores)
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface EventState {
  events: Event[];
  selectedEvent: EventDetail | null;
  filters: EventFilters;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ClubState {
  clubs: Club[];
  selectedClub: ClubDetail | null;
  userClubs: Club[];
  filters: ClubFilters;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ProfileState {
  profile: UserProfile | null;
  stats: DashboardStats | null;
  pointsHistory: PointsHistoryData[];
  isLoading: boolean;
  error: string | null;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

// Component prop interfaces
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export interface ErrorProps extends BaseComponentProps {
  error: string | ApiError;
  onRetry?: () => void;
}

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
  onCancel: () => void;
}

// Hook return types
export interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

export interface UsePaginationReturn {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type WithTimestamps<T> = T & {
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type CreateInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateInput<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;

// Theme types
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  borderRadius: number;
}

// Route types
export interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  exact?: boolean;
  private?: boolean;
  roles?: UserRole[];
  title?: string;
  description?: string;
}

// Export all types for easy importing
export * from './auth';

export * from './club';
export * from './user';
export * from './api';