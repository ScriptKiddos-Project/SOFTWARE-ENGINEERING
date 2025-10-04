// Form validation schemas and utility functions using Zod

import { z } from 'zod';

// Base validation schemas
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must not exceed 50 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

export const phoneSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || /^[\+]?[1-9][\d]{0,15}$/.test(val.replace(/\s/g, '')),
    'Please enter a valid phone number'
  );

export const studentIdSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || /^[0-9]{4}[A-Z]{2}[0-9]{3}$/.test(val.replace(/[-\s]/g, '')),
    'Student ID must follow format: YYYY-XX-### (e.g., 2021-CS-001)'
  );

export const urlSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || /^https?:\/\/.+\..+/.test(val) || /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}/.test(val),
    'Please enter a valid URL'
  );

// Auth validation schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

export const registerSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  studentId: studentIdSchema,
  phone: phoneSchema,
  department: z.string().optional(),
  yearOfStudy: z.number().min(1).max(4).optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const forgotPasswordSchema = z.object({
  email: emailSchema
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your new password')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"]
});

// Profile validation schemas
export const profileUpdateSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
  department: z.string().min(1, 'Department is required'),
  yearOfStudy: z.number().min(1).max(4),
  bio: z.string().max(500, 'Bio must not exceed 500 characters').optional(),
  interests: z.array(z.string()).max(10, 'Maximum 10 interests allowed').optional(),
  skills: z.array(z.string()).max(10, 'Maximum 10 skills allowed').optional(),
  linkedinUrl: urlSchema,
  githubUrl: urlSchema,
  portfolioUrl: urlSchema
});

export const notificationPreferencesSchema = z.object({
  email: z.object({
    eventReminders: z.boolean(),
    clubUpdates: z.boolean(),
    newEvents: z.boolean(),
    pointsEarned: z.boolean(),
    weeklyDigest: z.boolean(),
    systemAnnouncements: z.boolean()
  }),
  push: z.object({
    eventReminders: z.boolean(),
    clubMessages: z.boolean(),
    newEvents: z.boolean(),
    pointsEarned: z.boolean(),
    achievementUnlocked: z.boolean()
  }),
  sms: z.object({
    importantEvents: z.boolean(),
    emergencyNotifications: z.boolean()
  })
});

// Club validation schemas
export const clubSchema = z.object({
  name: z
    .string()
    .min(1, 'Club name is required')
    .min(3, 'Club name must be at least 3 characters')
    .max(100, 'Club name must not exceed 100 characters'),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),
  category: z.enum([
    'technical',
    'cultural',
    'sports',
    'academic',
    'social_service',
    'entrepreneurship',
    'arts',
    'music',
    'dance',
    'drama',
    'photography',
    'writing',
    'debate',
    'environment',
    'health',
    'finance',
    'other'
  ]),
  contactEmail: emailSchema.optional(),
  logoUrl: urlSchema,
  coverImageUrl: urlSchema
});

export const joinClubSchema = z.object({
  clubId: z.string().uuid('Invalid club ID'),
  message: z
    .string()
    .max(300, 'Message must not exceed 300 characters')
    .optional()
});

// Event validation schemas
export const eventSchema = z.object({
  title: z
    .string()
    .min(1, 'Event title is required')
    .min(5, 'Event title must be at least 5 characters')
    .max(200, 'Event title must not exceed 200 characters'),
  description: z
    .string()
    .max(2000, 'Description must not exceed 2000 characters')
    .optional(),
  clubId: z.string().uuid('Invalid club ID'),
  eventType: z.enum([
    'workshop',
    'seminar',
    'competition',
    'social',
    'volunteer',
    'cultural',
    'sports',
    'technical',
    'career',
    'other'
  ]),
  startDate: z.date().refine(
    (date) => date > new Date(),
    'Start date must be in the future'
  ),
  endDate: z.date(),
  location: z
    .string()
    .max(200, 'Location must not exceed 200 characters')
    .optional(),
  maxParticipants: z
    .number()
    .min(1, 'Must allow at least 1 participant')
    .max(1000, 'Cannot exceed 1000 participants')
    .optional(),
  registrationDeadline: z.date().optional(),
  pointsReward: z
    .number()
    .min(0, 'Points reward cannot be negative')
    .max(100, 'Points reward cannot exceed 100'),
  volunteerHours: z
    .number()
    .min(0, 'Volunteer hours cannot be negative')
    .max(24, 'Volunteer hours cannot exceed 24 per event'),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed'),
  skillAreas: z.array(z.enum([
    'technical',
    'leadership',
    'communication',
    'creativity',
    'problem_solving',
    'teamwork',
    'project_management',
    'research',
    'entrepreneurship',
    'social_service'
  ])).max(5, 'Maximum 5 skill areas allowed'),
  requiresApproval: z.boolean()
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"]
}).refine((data) => {
  if (data.registrationDeadline) {
    return data.registrationDeadline < data.startDate;
  }
  return true;
}, {
  message: "Registration deadline must be before event start date",
  path: ["registrationDeadline"]
});

export const eventRegistrationSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  message: z
    .string()
    .max(300, 'Message must not exceed 300 characters')
    .optional()
});

export const eventFeedbackSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  rating: z
    .number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  comment: z
    .string()
    .max(500, 'Comment must not exceed 500 characters')
    .optional(),
  aspects: z.object({
    organization: z.number().min(1).max(5),
    content: z.number().min(1).max(5),
    venue: z.number().min(1).max(5),
    timing: z.number().min(1).max(5)
  }),
  suggestions: z
    .string()
    .max(500, 'Suggestions must not exceed 500 characters')
    .optional(),
  wouldRecommend: z.boolean()
});

// Attendance validation schemas
export const attendanceUpdateSchema = z.object({
  userIds: z.array(z.string().uuid()),
  attended: z.boolean(),
  notes: z
    .string()
    .max(200, 'Notes must not exceed 200 characters')
    .optional()
});

export const bulkAttendanceSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  updates: z.array(z.object({
    userId: z.string().uuid(),
    attended: z.boolean(),
    checkInTime: z.date().optional(),
    checkOutTime: z.date().optional(),
    notes: z.string().max(200).optional()
  }))
});

// Search and filter validation schemas
export const eventFiltersSchema = z.object({
  clubId: z.string().uuid().optional(),
  eventType: z.array(z.string()).optional(),
  skillAreas: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  location: z.string().optional(),
  pointsMin: z.number().min(0).optional(),
  pointsMax: z.number().min(0).optional(),
  isRegistrationOpen: z.boolean().optional(),
  department: z.string().optional()
});

export const clubFiltersSchema = z.object({
  category: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  memberCountMin: z.number().min(0).optional(),
  memberCountMax: z.number().min(0).optional(),
  hasUpcomingEvents: z.boolean().optional(),
  joinedByUser: z.string().uuid().optional()
});

export const userFiltersSchema = z.object({
  department: z.array(z.string()).optional(),
  yearOfStudy: z.array(z.number()).optional(),
  role: z.array(z.string()).optional(),
  clubs: z.array(z.string().uuid()).optional(),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  pointsMin: z.number().min(0).optional(),
  pointsMax: z.number().min(0).optional(),
  isActive: z.boolean().optional()
});

// File upload validation
export const fileUploadSchema = z.object({
  file: z.any().refine(
    (file) => file instanceof File,
    'Please select a valid file'
  ).refine(
    (file) => file.size <= 5 * 1024 * 1024, // 5MB
    'File size must not exceed 5MB'
  ).refine(
    (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
    'Only JPEG, PNG, and WebP images are allowed'
  )
});

export const avatarUploadSchema = fileUploadSchema;

export const clubLogoUploadSchema = fileUploadSchema;

export const eventImageUploadSchema = fileUploadSchema;

// Admin validation schemas
export const userRoleUpdateSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  role: z.enum(['student', 'club_admin', 'super_admin'])
});

export const adminAnnouncementSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must not exceed 100 characters'),
  message: z
    .string()
    .min(1, 'Message is required')
    .max(1000, 'Message must not exceed 1000 characters'),
  type: z.enum(['info', 'warning', 'success', 'error']),
  targetAudience: z.enum(['all', 'students', 'club_admins', 'specific_clubs']),
  clubIds: z.array(z.string().uuid()).optional(),
  expiresAt: z.date().optional()
});

// Custom validation functions
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password should contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateStudentId = (studentId: string): boolean => {
  // Remove any formatting
  const cleaned = studentId.replace(/[-\s]/g, '');
  // Check if it matches YYYY-XX-### pattern
  return /^[0-9]{4}[A-Z]{2}[0-9]{3}$/.test(cleaned);
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  // Check if it's a valid length (10-11 digits)
  return cleaned.length >= 10 && cleaned.length <= 11;
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    // Try with https:// prefix
    try {
      new URL(`https://${url}`);
      return true;
    } catch {
      return false;
    }
  }
};

export const validateDateRange = (startDate: Date, endDate: Date): boolean => {
  return endDate > startDate;
};

export const validateFutureDate = (date: Date): boolean => {
  return date > new Date();
};

// Form validation helpers
export const getFieldError = (errors: any, fieldName: string): string | undefined => {
  const field = fieldName.split('.').reduce((obj, key) => obj?.[key], errors);
  return field?.message;
};

export const hasFieldError = (errors: any, fieldName: string): boolean => {
  return !!getFieldError(errors, fieldName);
};

// Utility for validating arrays
export const validateArrayLength = (
  array: any[],
  min: number = 0,
  max: number = Infinity,
  fieldName: string = 'items'
): { isValid: boolean; error?: string } => {
  if (array.length < min) {
    return {
      isValid: false,
      error: `Must have at least ${min} ${fieldName}`
    };
  }
  
  if (array.length > max) {
    return {
      isValid: false,
      error: `Cannot have more than ${max} ${fieldName}`
    };
  }
  
  return { isValid: true };
};

// Export all validators for easy importing
export const validators = {
  // Schemas
  emailSchema,
  passwordSchema,
  nameSchema,
  phoneSchema,
  studentIdSchema,
  urlSchema,
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  profileUpdateSchema,
  notificationPreferencesSchema,
  clubSchema,
  joinClubSchema,
  eventSchema,
  eventRegistrationSchema,
  eventFeedbackSchema,
  attendanceUpdateSchema,
  bulkAttendanceSchema,
  eventFiltersSchema,
  clubFiltersSchema,
  userFiltersSchema,
  fileUploadSchema,
  avatarUploadSchema,
  clubLogoUploadSchema,
  eventImageUploadSchema,
  userRoleUpdateSchema,
  adminAnnouncementSchema,
  
  // Functions
  validatePassword,
  validateEmail,
  validateStudentId,
  validatePhoneNumber,
  validateUrl,
  validateDateRange,
  validateFutureDate,
  getFieldError,
  hasFieldError,
  validateArrayLength
};