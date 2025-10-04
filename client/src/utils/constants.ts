// client/src/utils/constants.ts

export const APP_CONFIG = {
  name: 'ClubHub',
  version: '1.0.0',
  description: 'College Club & Event Management System',
  author: 'ClubHub Team',
  supportEmail: 'support@clubhub.com',
} as const;

// Import meta env types are declared in vite-env.d.ts

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  retries: 3,
} as const;

export const SOCKET_CONFIG = {
  url: import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000',
  options: {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  },
} as const;

export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  uploadPreset: 'clubhub_uploads',
  maxFileSize: 5 * 1024 * 1024, // 5MB
} as const;

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  EVENTS: '/events',
  EVENT_DETAIL: '/events/:id',
  CLUBS: '/clubs',
  CLUB_DETAIL: '/clubs/:id',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  ADMIN: '/admin',
  INTERVIEWS: '/interviews',
  CHAT: '/chat',
  NOTIFICATIONS: '/notifications',
} as const;

export const USER_ROLES = {
  STUDENT: 'student',
  CLUB_ADMIN: 'club_admin',
  SUPER_ADMIN: 'super_admin',
} as const;

export const CLUB_CATEGORIES = {
  TECHNICAL: 'technical',
  CULTURAL: 'cultural',
  SPORTS: 'sports',
  ACADEMIC: 'academic',
  SOCIAL_SERVICE: 'social_service',
  ENTREPRENEURSHIP: 'entrepreneurship',
  ARTS: 'arts',
  MUSIC: 'music',
  DRAMA: 'drama',
  LITERATURE: 'literature',
  DEBATE: 'debate',
  PHOTOGRAPHY: 'photography',
  GAMING: 'gaming',
  ENVIRONMENT: 'environment',
  OTHER: 'other',
} as const;

export const CLUB_MEMBER_ROLES = {
  MEMBER: 'member',
  COORDINATOR: 'coordinator',
  VICE_PRESIDENT: 'vice_president',
  PRESIDENT: 'president',
  ADVISOR: 'advisor',
} as const;

export const EVENT_TYPES = {
  WORKSHOP: 'workshop',
  SEMINAR: 'seminar',
  WEBINAR: 'webinar',
  COMPETITION: 'competition',
  HACKATHON: 'hackathon',
  CONFERENCE: 'conference',
  CULTURAL_EVENT: 'cultural_event',
  SPORTS_EVENT: 'sports_event',
  SOCIAL_EVENT: 'social_event',
  VOLUNTEER_ACTIVITY: 'volunteer_activity',
  TRAINING: 'training',
  MEETING: 'meeting',
  OTHER: 'other',
} as const;

export const REGISTRATION_STATUS = {
  REGISTERED: 'registered',
  WAITLISTED: 'waitlisted',
  CANCELLED: 'cancelled',
  ATTENDED: 'attended',
  NO_SHOW: 'no_show',
} as const;

export const ATTENDANCE_METHOD = {
  MANUAL: 'manual',
  QR_CODE: 'qr_code',
  GEOFENCE: 'geofence',
  BIOMETRIC: 'biometric',
} as const;

export const NOTIFICATION_TYPES = {
  EVENT_REMINDER: 'event_reminder',
  REGISTRATION_CONFIRMATION: 'registration_confirmation',
  ATTENDANCE_MARKED: 'attendance_marked',
  CLUB_INVITATION: 'club_invitation',
  ANNOUNCEMENT: 'announcement',
  POINTS_AWARDED: 'points_awarded',
  BADGE_EARNED: 'badge_earned',
} as const;

export const BADGE_TYPES = {
  PARTICIPANT: 'participant',
  ORGANIZER: 'organizer',
  VOLUNTEER: 'volunteer',
  LEADER: 'leader',
  ACHIEVER: 'achiever',
  CONTRIBUTOR: 'contributor',
  INNOVATOR: 'innovator',
  MENTOR: 'mentor',
} as const;

export const SKILL_AREAS = {
  PROGRAMMING: 'programming',
  WEB_DEVELOPMENT: 'web_development',
  MOBILE_DEVELOPMENT: 'mobile_development',
  DATA_SCIENCE: 'data_science',
  MACHINE_LEARNING: 'machine_learning',
  ARTIFICIAL_INTELLIGENCE: 'artificial_intelligence',
  CYBERSECURITY: 'cybersecurity',
  CLOUD_COMPUTING: 'cloud_computing',
  DEVOPS: 'devops',
  UI_UX_DESIGN: 'ui_ux_design',
  GRAPHIC_DESIGN: 'graphic_design',
  DIGITAL_MARKETING: 'digital_marketing',
  PROJECT_MANAGEMENT: 'project_management',
  LEADERSHIP: 'leadership',
  COMMUNICATION: 'communication',
  PUBLIC_SPEAKING: 'public_speaking',
  TEAMWORK: 'teamwork',
  PROBLEM_SOLVING: 'problem_solving',
  CREATIVITY: 'creativity',
  RESEARCH: 'research',
  WRITING: 'writing',
  PHOTOGRAPHY: 'photography',
  VIDEO_EDITING: 'video_editing',
  MUSIC: 'music',
  DANCE: 'dance',
  SPORTS: 'sports',
  VOLUNTEERING: 'volunteering',
  ENTREPRENEURSHIP: 'entrepreneurship',
  NETWORKING: 'networking',
  OTHER: 'other',
} as const;

export const POINTS_SYSTEM = {
  WORKSHOP_ATTENDANCE: 10,
  SEMINAR_ATTENDANCE: 8,
  WEBINAR_ATTENDANCE: 5,
  COMPETITION_PARTICIPATION: 15,
  COMPETITION_WINNER: 50,
  HACKATHON_PARTICIPATION: 25,
  VOLUNTEER_ACTIVITY: 20,
  EVENT_ORGANIZATION: 30,
  CLUB_LEADERSHIP: 40,
  CULTURAL_EVENT: 12,
  SPORTS_EVENT: 10,
  TRAINING_COMPLETION: 15,
  MEETING_ATTENDANCE: 3,
  FEEDBACK_SUBMISSION: 2,
} as const;

export const VOLUNTEER_HOURS = {
  WORKSHOP: 2,
  SEMINAR: 1.5,
  WEBINAR: 1,
  COMPETITION: 4,
  HACKATHON: 8,
  VOLUNTEER_ACTIVITY: 3,
  EVENT_ORGANIZATION: 5,
  CULTURAL_EVENT: 3,
  SPORTS_EVENT: 2,
  TRAINING: 2.5,
  MEETING: 0.5,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  EVENTS_PAGE_SIZE: 12,
  CLUBS_PAGE_SIZE: 9,
  MEMBERS_PAGE_SIZE: 20,
} as const;

export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy hh:mm a',
  INPUT: 'yyyy-MM-dd',
  INPUT_WITH_TIME: "yyyy-MM-dd'T'HH:mm",
  API: 'yyyy-MM-dd HH:mm:ss',
  RELATIVE: 'relative', // For date-fns formatDistanceToNow
} as const;

export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  AVATAR_MAX_SIZE: 2 * 1024 * 1024, // 2MB
  CLUB_LOGO_MAX_SIZE: 1 * 1024 * 1024, // 1MB
  EVENT_IMAGE_MAX_SIZE: 3 * 1024 * 1024, // 3MB
} as const;

export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?[\d\s\-\(\)]{10,15}$/,
  STUDENT_ID: /^[A-Z0-9]{6,12}$/,
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: false,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  CLUB_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
  },
  EVENT_TITLE: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 200,
  },
  DESCRIPTION: {
    MAX_LENGTH: 2000,
  },
} as const;

export const TOAST_MESSAGES = {
  SUCCESS: {
    LOGIN: 'Welcome back! Login successful.',
    LOGOUT: 'You have been logged out successfully.',
    REGISTER: 'Registration successful! Please check your email for verification.',
    PROFILE_UPDATE: 'Profile updated successfully.',
    EVENT_REGISTERED: 'Successfully registered for the event!',
    EVENT_UNREGISTERED: 'Successfully unregistered from the event.',
    CLUB_JOINED: 'Welcome to the club!',
    CLUB_LEFT: 'You have left the club.',
    ATTENDANCE_MARKED: 'Attendance marked successfully.',
    FEEDBACK_SUBMITTED: 'Thank you for your feedback!',
  },
  ERROR: {
    LOGIN: 'Login failed. Please check your credentials.',
    NETWORK: 'Network error. Please try again.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    SERVER: 'Server error. Please try again later.',
    VALIDATION: 'Please check your input and try again.',
    FILE_UPLOAD: 'File upload failed. Please try again.',
    EVENT_FULL: 'Sorry, this event is full.',
    ALREADY_REGISTERED: 'You are already registered for this event.',
    REGISTRATION_CLOSED: 'Registration for this event is closed.',
  },
  WARNING: {
    UNSAVED_CHANGES: 'You have unsaved changes. Are you sure you want to leave?',
    DELETE_CONFIRMATION: 'This action cannot be undone. Are you sure?',
    LOGOUT_CONFIRMATION: 'Are you sure you want to logout?',
  },
  INFO: {
    LOADING: 'Loading...',
    SAVING: 'Saving changes...',
    EMAIL_SENT: 'Email sent successfully.',
    PASSWORD_RESET: 'Password reset link sent to your email.',
  },
} as const;

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'clubhub_auth_token',
  REFRESH_TOKEN: 'clubhub_refresh_token',
  USER_PREFERENCES: 'clubhub_user_preferences',
  THEME: 'clubhub_theme',
  LANGUAGE: 'clubhub_language',
  REMEMBER_ME: 'clubhub_remember_me',
  LAST_VISITED: 'clubhub_last_visited',
  FILTER_PREFERENCES: 'clubhub_filter_preferences',
} as const;

export const SESSION_STORAGE_KEYS = {
  FORM_DATA: 'clubhub_form_data',
  SEARCH_HISTORY: 'clubhub_search_history',
  NAVIGATION_STATE: 'clubhub_navigation_state',
} as const;

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export const LANGUAGES = {
  ENGLISH: 'en',
  HINDI: 'hi',
  MARATHI: 'mr',
  GUJARATI: 'gu',
  TAMIL: 'ta',
  TELUGU: 'te',
  BENGALI: 'bn',
} as const;

export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

export const BREAKPOINTS = {
  XS: 0,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

export const Z_INDEX = {
  DROPDOWN: 1000,
  MODAL: 1010,
  POPOVER: 1020,
  TOOLTIP: 1030,
  TOAST: 1040,
  LOADING: 1050,
} as const;