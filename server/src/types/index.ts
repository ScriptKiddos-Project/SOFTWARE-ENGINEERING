import { Request } from 'express';
import { 
  User, 
  Club, 
  Event, 
  EventRegistration, 
  UserClub,
  PointsHistory,
  Badge,
  UserBadge,
  EventFeedback,
  Notification,
  ChatRoom,
  ChatMessage,
  AttendanceLog,
  EventQRCode
} from '@prisma/client';

// Extended Request type with user information
export interface AuthenticatedRequest extends Request {
  user?: User;
  userId?: string;
  userRole?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface PaginationQuery {
  page?: string | number;
  limit?: string | number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  studentId?: string;
  phone?: string;
  department?: string;
  yearOfStudy?: number;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// User Types
export interface UserProfile extends Omit<User, 'passwordHash' | 'passwordResetToken' | 'emailVerificationToken'> {
  joinedClubs?: UserClub[];
  pointsHistory?: PointsHistory[];
  badges?: UserBadge[];
  eventRegistrations?: EventRegistration[];
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  department?: string;
  yearOfStudy?: number;
  profileImage?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Club Types
export interface ClubWithDetails extends Club {
  creator: User;
  members?: UserClub[];
  events?: Event[];
  memberCount: number;
  _count?: {
    members: number;
    events: number;
  };
}

export interface CreateClubData {
  name: string;
  description?: string;
  category: string;
  logoUrl?: string;
  coverImageUrl?: string;
  contactEmail?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  establishedYear?: number;
  meetingSchedule?: string;
  requirements?: string;
  tags?: string[];
}

export interface UpdateClubData extends Partial<CreateClubData> {
  isActive?: boolean;
}

export interface ClubMembershipData {
  userId: string;
  role?: string;
}

// Event Types
export interface EventWithDetails extends Event {
  club: Club;
  creator: User;
  registrations?: EventRegistration[];
  _count?: {
    registrations: number;
  };
  isRegistered?: boolean;
  userRegistration?: EventRegistration;
}

export interface CreateEventData {
  title: string;
  description?: string;
  clubId: string;
  eventType: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  venue?: string;
  maxParticipants?: number;
  registrationDeadline?: Date;
  pointsReward?: number;
  volunteerHours?: number;
  imageUrl?: string;
  bannerUrl?: string;
  tags?: string[];
  skillAreas?: string[];
  prerequisites?: string;
  agenda?: string;
  requiresApproval?: boolean;
  isFeatured?: boolean;
  registrationFee?: number;
  certificateTemplate?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  externalLink?: string;
}

export interface UpdateEventData extends Partial<CreateEventData> {
  isPublished?: boolean;
}

export interface EventFilters {
  clubId?: string;
  eventType?: string;
  category?: string;
  tags?: string[];
  skillAreas?: string[];
  startDate?: Date;
  endDate?: Date;
  location?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  hasAvailableSlots?: boolean;
}

// Event Registration Types
export interface EventRegistrationData {
  eventId: string;
  additionalData?: Record<string, any>;
}

export interface AttendanceData {
  userId: string;
  eventId: string;
  attended: boolean;
  checkInTime?: Date;
  checkOutTime?: Date;
  notes?: string;
  method?: string;
}

export interface BulkAttendanceData {
  eventId: string;
  attendanceRecords: {
    userId: string;
    attended: boolean;
    notes?: string;
  }[];
  markedBy: string;
}

export interface AttendanceReport {
  eventId: string;
  event: Event;
  totalRegistrations: number;
  totalAttended: number;
  attendancePercentage: number;
  registrations: (EventRegistration & {
    user: User;
  })[];
}

// QR Code Types
export interface QRCodeData {
  eventId: string;
  userId?: string;
  timestamp: number;
  action: 'check_in' | 'check_out';
}

export interface GenerateQRCodeData {
  eventId: string;
  validFrom: Date;
  validUntil: Date;
  maxScans?: number;
  description?: string;
}

// Feedback Types
export interface EventFeedbackData {
  eventId: string;
  rating: number;
  comment?: string;
  suggestions?: string;
  wouldRecommend: boolean;
  organizationRating?: number;
  contentRating?: number;
  venueRating?: number;
  isAnonymous?: boolean;
}

export interface FeedbackSummary {
  eventId: string;
  totalResponses: number;
  averageRating: number;
  averageOrganizationRating?: number;
  averageContentRating?: number;
  averageVenueRating?: number;
  recommendationPercentage: number;
  feedbacks: EventFeedback[];
}

// Notification Types
export interface CreateNotificationData {
  userId: string;
  title: string;
  message: string;
  type: string;
  priority?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

export interface BulkNotificationData {
  userIds: string[];
  title: string;
  message: string;
  type: string;
  priority?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

// Chat Types
export interface CreateChatRoomData {
  clubId: string;
  name: string;
  description?: string;
  isPrivate?: boolean;
  maxMembers?: number;
}

export interface SendMessageData {
  roomId: string;
  message: string;
  messageType?: string;
  fileUrl?: string;
  replyTo?: string;
  mentions?: string[];
}

// Dashboard Types
export interface DashboardStats {
  totalUsers: number;
  totalClubs: number;
  totalEvents: number;
  totalRegistrations: number;
  recentActivities: Activity[];
  popularEvents: Event[];
  popularClubs: Club[];
}

export interface UserDashboardStats {
  totalPoints: number;
  totalVolunteerHours: number;
  joinedClubs: number;
  attendedEvents: number;
  upcomingEvents: Event[];
  recentActivities: Activity[];
  earnedBadges: UserBadge[];
}

export interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: Date;
  user?: User;
  metadata?: Record<string, any>;
}

// Admin Types
export interface AdminUserData {
  userId: string;
  role: string;
  isActive?: boolean;
}

export interface AdminEventData extends Partial<UpdateEventData> {
  isApproved?: boolean;
  rejectionReason?: string;
}

export interface SystemStats {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
    byRole: Record<string, number>;
  };
  clubs: {
    total: number;
    active: number;
    newThisMonth: number;
    byCategory: Record<string, number>;
  };
  events: {
    total: number;
    published: number;
    thisMonth: number;
    byType: Record<string, number>;
  };
  engagement: {
    totalRegistrations: number;
    averageAttendance: number;
    totalPointsAwarded: number;
    totalVolunteerHours: number;
  };
}

// File Upload Types
export interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  resourceType: string;
}

export interface MultipleUploadResult {
  successful: UploadResult[];
  failed: {
    filename: string;
    error: string;
  }[];
}

// Email Types
export interface EmailData {
  to: string | string[];
  subject: string;
  template: string;
  data: Record<string, any>;
  attachments?: {
    filename: string;
    path: string;
  }[];
}

export interface BulkEmailData {
  recipients: {
    email: string;
    data: Record<string, any>;
  }[];
  subject: string;
  template: string;
}

// Search Types
export interface SearchQuery {
  q: string;
  type?: 'events' | 'clubs' | 'users';
  filters?: Record<string, any>;
  limit?: number;
  offset?: number;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  query: string;
  type: string;
  executionTime: number;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Cache Types
export interface CacheOptions {
  key: string;
  ttl?: number;
  tags?: string[];
}

export interface CacheResult<T> {
  data: T | null;
  hit: boolean;
  key: string;
}

// Webhook Types
export interface WebhookEvent {
  type: string;
  data: Record<string, any>;
  timestamp: Date;
  source: string;
}

// Database Transaction Types
export interface TransactionContext {
  userId?: string;
  operation: string;
  metadata?: Record<string, any>;
}

// Export all Prisma types for convenience
export type {
  User,
  Club,
  Event,
  EventRegistration,
  UserClub,
  PointsHistory,
  Badge,
  UserBadge,
  EventFeedback,
  Notification,
  ChatRoom,
  ChatMessage,
  AttendanceLog,
  EventQRCode,
} from '@prisma/client';