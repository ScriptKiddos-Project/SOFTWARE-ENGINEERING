// Application Constants

export const APP_CONFIG = {
    NAME: 'ClubHub',
    VERSION: '1.0.0',
    DESCRIPTION: 'College Club & Event Management System',
    AUTHOR: 'ClubHub Team'
  } as const;
  
  // Environment
  export const NODE_ENV = process.env.NODE_ENV || 'development';
  export const PORT = process.env.PORT || 3000;
  export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
  
  // Database
  export const DATABASE_CONFIG = {
    CONNECTION_TIMEOUT: 60000,
    POOL_MIN: 2,
    POOL_MAX: 10,
    IDLE_TIMEOUT: 30000,
    ACQUIRE_TIMEOUT: 60000
  } as const;
  
  // JWT Configuration
  export const JWT_CONFIG = {
    ACCESS_TOKEN_EXPIRE: process.env.JWT_EXPIRE || '15m',
    REFRESH_TOKEN_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '7d',
    ISSUER: 'clubhub-api',
    AUDIENCE: 'clubhub-users',
    ALGORITHM: 'HS256' as const
  };
  
  // Rate Limiting
  export const RATE_LIMIT_CONFIG = {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100, // requests per window
    MESSAGE: 'Too many requests from this IP, please try again later.',
    STANDARD_HEADERS: true,
    LEGACY_HEADERS: false,
  } as const;
  
  export const AUTH_RATE_LIMIT = {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 5, // login attempts per window
    MESSAGE: 'Too many login attempts, please try again later.',
  } as const;
  
  // File Upload Configuration
  export const UPLOAD_CONFIG = {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    PROFILE_IMAGE_SIZE: { width: 400, height: 400 },
    CLUB_LOGO_SIZE: { width: 200, height: 200 },
    EVENT_IMAGE_SIZE: { width: 800, height: 600 }
  } as const;
  
  // Email Configuration
  export const EMAIL_CONFIG = {
    FROM_NAME: 'ClubHub',
    FROM_EMAIL: process.env.EMAIL_USER || 'noreply@clubhub.com',
    TEMPLATES: {
      WELCOME: 'welcome',
      EMAIL_VERIFICATION: 'email-verification',
      PASSWORD_RESET: 'password-reset',
      EVENT_REMINDER: 'event-reminder',
      EVENT_REGISTRATION: 'event-registration',
      ATTENDANCE_CONFIRMATION: 'attendance-confirmation'
    }
  } as const;
  
  // Pagination Defaults
  export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    DEFAULT_SORT: 'createdAt',
    DEFAULT_ORDER: 'desc' as 'asc' | 'desc'
  } as const;
  
  // User Roles and Permissions
  export const USER_ROLES = {
    STUDENT: 'student',
    CLUB_ADMIN: 'club_admin',
    SUPER_ADMIN: 'super_admin'
  } as const;
  
  export const CLUB_ROLES = {
    MEMBER: 'member',
    CORE_MEMBER: 'core_member',
    SECRETARY: 'secretary',
    TREASURER: 'treasurer',
    VICE_PRESIDENT: 'vice_president',
    PRESIDENT: 'president'
  } as const;
  
  // Club Categories
  export const CLUB_CATEGORIES = {
    TECHNICAL: 'technical',
    CULTURAL: 'cultural',
    SPORTS: 'sports',
    ACADEMIC: 'academic',
    SOCIAL_SERVICE: 'social_service',
    ENTREPRENEURSHIP: 'entrepreneurship',
    ARTS: 'arts',
    OTHER: 'other'
  } as const;
  
  // Event Types
  export const EVENT_TYPES = {
    WORKSHOP: 'workshop',
    SEMINAR: 'seminar',
    COMPETITION: 'competition',
    CULTURAL_EVENT: 'cultural_event',
    SPORTS_EVENT: 'sports_event',
    VOLUNTEERING: 'volunteering',
    HACKATHON: 'hackathon',
    CONFERENCE: 'conference',
    SOCIAL_GATHERING: 'social_gathering',
    OTHER: 'other'
  } as const;
  
  // Registration Status
  export const REGISTRATION_STATUS = {
    REGISTERED: 'registered',
    WAITLISTED: 'waitlisted',
    CANCELLED: 'cancelled',
    ATTENDED: 'attended',
    NO_SHOW: 'no_show'
  } as const;
  
  // Attendance Methods
  export const ATTENDANCE_METHODS = {
    MANUAL: 'manual',
    QR_CODE: 'qr_code',
    GEOFENCE: 'geofence',
    BIOMETRIC: 'biometric'
  } as const;
  
  // Points and Rewards System
  export const POINTS_CONFIG = {
    EVENT_ATTENDANCE: {
      WORKSHOP: 10,
      SEMINAR: 8,
      COMPETITION: 15,
      CULTURAL_EVENT: 5,
      SPORTS_EVENT: 8,
      VOLUNTEERING: 20,
      HACKATHON: 25,
      CONFERENCE: 12,
      SOCIAL_GATHERING: 3,
      OTHER: 5
    },
    VOLUNTEER_HOURS: {
      WORKSHOP: 2,
      SEMINAR: 1.5,
      COMPETITION: 4,
      CULTURAL_EVENT: 1,
      SPORTS_EVENT: 2,
      VOLUNTEERING: 8,
      HACKATHON: 12,
      CONFERENCE: 3,
      SOCIAL_GATHERING: 0.5,
      OTHER: 1
    },
    LEADERSHIP_BONUS: {
      MEMBER: 0,
      CORE_MEMBER: 5,
      SECRETARY: 10,
      TREASURER: 10,
      VICE_PRESIDENT: 15,
      PRESIDENT: 20
    }
  } as const;
  
  // Validation Rules
  export const VALIDATION_RULES = {
    PASSWORD: {
      MIN_LENGTH: 8,
      MAX_LENGTH: 128,
      REQUIRE_UPPERCASE: true,
      REQUIRE_LOWERCASE: true,
      REQUIRE_NUMBERS: true,
      REQUIRE_SPECIAL_CHARS: false
    },
    NAME: {
      MIN_LENGTH: 2,
      MAX_LENGTH: 50
    },
    STUDENT_ID: {
      MIN_LENGTH: 8,
      MAX_LENGTH: 15
    },
    PHONE: {
      MIN_LENGTH: 10,
      MAX_LENGTH: 15
    },
    CLUB_NAME: {
      MIN_LENGTH: 3,
      MAX_LENGTH: 100
    },
    EVENT_TITLE: {
      MIN_LENGTH: 5,
      MAX_LENGTH: 200
    },
    DESCRIPTION: {
      MAX_LENGTH: 2000
    }
  } as const;
  
  // Error Messages
  export const ERROR_MESSAGES = {
    // Authentication
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_ALREADY_EXISTS: 'Email already exists',
    USER_NOT_FOUND: 'User not found',
    EMAIL_NOT_VERIFIED: 'Please verify your email before logging in',
    INVALID_TOKEN: 'Invalid or expired token',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    
    // Validation
    VALIDATION_ERROR: 'Validation error',
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Invalid email format',
    PASSWORD_TOO_WEAK: 'Password is too weak',
    INVALID_PHONE: 'Invalid phone number format',
    
    // Resources
    CLUB_NOT_FOUND: 'Club not found',
    EVENT_NOT_FOUND: 'Event not found',
    ALREADY_REGISTERED: 'Already registered for this event',
    EVENT_FULL: 'Event is full',
    REGISTRATION_CLOSED: 'Registration deadline has passed',
    NOT_REGISTERED: 'Not registered for this event',
    ALREADY_MEMBER: 'Already a member of this club',
    NOT_CLUB_MEMBER: 'Not a member of this club',
    
    // Server
    INTERNAL_SERVER_ERROR: 'Internal server error',
    DATABASE_ERROR: 'Database operation failed',
    FILE_UPLOAD_ERROR: 'File upload failed',
    EMAIL_SEND_ERROR: 'Failed to send email'
  } as const;
  
  // Success Messages
  export const SUCCESS_MESSAGES = {
    // Authentication
    REGISTRATION_SUCCESS: 'Registration successful! Please check your email for verification.',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    PASSWORD_RESET_SENT: 'Password reset link sent to your email',
    PASSWORD_RESET_SUCCESS: 'Password reset successful',
    EMAIL_VERIFIED: 'Email verified successfully',
    
    // Profile
    PROFILE_UPDATED: 'Profile updated successfully',
    AVATAR_UPLOADED: 'Profile picture updated successfully',
    
    // Clubs
    CLUB_CREATED: 'Club created successfully',
    CLUB_UPDATED: 'Club updated successfully',
    CLUB_JOINED: 'Successfully joined the club',
    CLUB_LEFT: 'Successfully left the club',
    
    // Events
    EVENT_CREATED: 'Event created successfully',
    EVENT_UPDATED: 'Event updated successfully',
    EVENT_DELETED: 'Event deleted successfully',
    EVENT_REGISTERED: 'Successfully registered for the event',
    EVENT_UNREGISTERED: 'Successfully unregistered from the event',
    ATTENDANCE_MARKED: 'Attendance marked successfully',
    
    // General
    OPERATION_SUCCESS: 'Operation completed successfully',
    DATA_SAVED: 'Data saved successfully',
    DATA_DELETED: 'Data deleted successfully'
  } as const;
  
  // HTTP Status Codes
  export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504
  } as const;
  
  // CORS Configuration
  export const CORS_CONFIG = {
    ORIGIN: process.env.NODE_ENV === 'production' 
      ? [process.env.CLIENT_URL || 'https://clubhub.vercel.app']
      : ['http://localhost:3000', 'http://localhost:5173'],
    METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    ALLOWED_HEADERS: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
      'Pragma'
    ],
    CREDENTIALS: true,
    PREFLIGHT_CONTINUE: false,
    OPTIONS_SUCCESS_STATUS: 204
  } as const;
  
  // Socket.IO Events
  export const SOCKET_EVENTS = {
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    
    // Chat Events
    JOIN_ROOM: 'join_room',
    LEAVE_ROOM: 'leave_room',
    SEND_MESSAGE: 'send_message',
    NEW_MESSAGE: 'new_message',
    USER_TYPING: 'user_typing',
    STOP_TYPING: 'stop_typing',
    
    // Notification Events
    NEW_NOTIFICATION: 'new_notification',
    MARK_NOTIFICATION_READ: 'mark_notification_read',
    
    // Event Updates
    EVENT_UPDATE: 'event_update',
    NEW_EVENT: 'new_event',
    EVENT_REMINDER: 'event_reminder',
    
    // Club Updates
    CLUB_UPDATE: 'club_update',
    NEW_MEMBER: 'new_member',
    MEMBER_LEFT: 'member_left'
  } as const;
  
  // Cache Keys and TTL
  export const CACHE_CONFIG = {
    TTL: {
      SHORT: 5 * 60, // 5 minutes
      MEDIUM: 30 * 60, // 30 minutes
      LONG: 60 * 60, // 1 hour
      VERY_LONG: 24 * 60 * 60 // 24 hours
    },
    KEYS: {
      USER_PROFILE: 'user:profile:',
      CLUB_DETAILS: 'club:details:',
      EVENT_DETAILS: 'event:details:',
      DASHBOARD_STATS: 'dashboard:stats:',
      POPULAR_EVENTS: 'events:popular',
      CLUB_CATEGORIES: 'clubs:categories',
      USER_PERMISSIONS: 'user:permissions:'
    }
  } as const;
  
  // QR Code Configuration
  export const QR_CODE_CONFIG = {
    DEFAULT_SIZE: 200,
    ERROR_CORRECTION: 'M' as const,
    TYPE: 'png' as const,
    QUALITY: 0.92,
    MARGIN: 1,
    COLOR: {
      DARK: '#000000',
      LIGHT: '#FFFFFF'
    },
    VALIDITY_HOURS: 2 // QR code valid for 2 hours
  } as const;
  
  // Notification Types
  export const NOTIFICATION_TYPES = {
    EVENT_REMINDER: 'event_reminder',
    EVENT_REGISTRATION: 'event_registration',
    CLUB_ANNOUNCEMENT: 'club_announcement',
    ATTENDANCE_MARKED: 'attendance_marked',
    POINTS_AWARDED: 'points_awarded',
    NEW_BADGE: 'new_badge',
    SYSTEM_UPDATE: 'system_update',
    WELCOME: 'welcome'
  } as const;
  
  // Badge Criteria Types
  export const BADGE_CRITERIA = {
    EVENTS_ATTENDED: 'events_attended',
    POINTS_EARNED: 'points_earned',
    VOLUNTEER_HOURS: 'volunteer_hours',
    CLUBS_JOINED: 'clubs_joined',
    EVENTS_ORGANIZED: 'events_organized',
    CONSECUTIVE_ATTENDANCE: 'consecutive_attendance',
    LEADERSHIP_ROLE: 'leadership_role',
    SPECIAL_ACHIEVEMENT: 'special_achievement'
  } as const;
  
  // API Response Formats
  export const API_RESPONSE_FORMAT = {
    SUCCESS: (data: any, message?: string) => ({
      success: true,
      data,
      message: message || 'Operation successful',
      timestamp: new Date().toISOString()
    }),
    ERROR: (message: string, errors?: any) => ({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    }),
    PAGINATION: (data: any, page: number, limit: number, total: number) => ({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      timestamp: new Date().toISOString()
    })
  } as const;
  
  // Regular Expressions for Validation
  export const REGEX_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    PHONE: /^\+?[\d\s\-\(\)]{10,15}$/,
    STUDENT_ID: /^[A-Z0-9]{8,15}$/,
    UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    SLUG: /^[a-z0-9-]+$/,
    HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  } as const;
  
  // Time Zones and Date Formats
  export const DATE_CONFIG = {
    DEFAULT_TIMEZONE: 'Asia/Kolkata',
    DATE_FORMAT: 'YYYY-MM-DD',
    DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
    TIME_FORMAT: 'HH:mm',
    DISPLAY_DATE_FORMAT: 'DD MMM YYYY',
    DISPLAY_DATETIME_FORMAT: 'DD MMM YYYY, HH:mm',
  } as const;
  
  // Logging Levels
  export const LOG_LEVELS = {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    HTTP: 'http',
    VERBOSE: 'verbose',
    DEBUG: 'debug',
    SILLY: 'silly'
  } as const;
  
  // Default Values
  export const DEFAULTS = {
    PAGINATION_LIMIT: 10,
    MAX_FILE_SIZE_MB: 5,
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
    PASSWORD_RESET_TIMEOUT: 15 * 60 * 1000, // 15 minutes
    EMAIL_VERIFICATION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
    QR_CODE_TIMEOUT: 2 * 60 * 60 * 1000, // 2 hours
  } as const;
  
  // Feature Flags
  export const FEATURE_FLAGS = {
    ENABLE_CHAT: process.env.ENABLE_CHAT === 'true',
    ENABLE_NOTIFICATIONS: process.env.ENABLE_NOTIFICATIONS !== 'false',
    ENABLE_QR_ATTENDANCE: process.env.ENABLE_QR_ATTENDANCE !== 'false',
    ENABLE_EMAIL_VERIFICATION: process.env.ENABLE_EMAIL_VERIFICATION !== 'false',
    ENABLE_POINTS_SYSTEM: process.env.ENABLE_POINTS_SYSTEM !== 'false',
    ENABLE_BADGES: process.env.ENABLE_BADGES !== 'false',
    ENABLE_FILE_UPLOAD: process.env.ENABLE_FILE_UPLOAD !== 'false',
  } as const;