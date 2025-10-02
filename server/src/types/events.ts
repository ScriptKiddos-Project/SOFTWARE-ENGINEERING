import { Router } from 'express';
import { 
  authenticate, 
  requireRole, 
  requirePermission,
  optionalAuth,
  authRateLimit 
} from '../middleware/auth';
import { validateSchema } from '../middleware/validation';
import { upload } from '../middleware/upload';
import { 
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  publishEvent,
  getEventRegistrations,
  registerForEvent,
  unregisterFromEvent,
  markAttendance,
  bulkMarkAttendance,
  checkInUser,
  checkOutUser,
  getAttendanceReport,
  generateQRCode,
  scanQRCode,
  getEventCalendar,
  getAttendanceLogs,
  getFeaturedEvents,
  getEventsByClub,
  searchEvents,
  exportEventData,
  duplicateEvent,
  getEventAnalytics,
  sendEventReminders,
  cancelEvent,
  getEventFeedback,
  submitEventFeedback
} from '../controllers/eventController';
import { UserRole, Permission } from '../types/auth'; // ✅ fixed path
import { z } from 'zod';


const router = Router();

// Validation schemas
const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300, 'Title too long'),
  description: z.string().optional(),
  clubId: z.string().uuid('Invalid club ID'),
  eventType: z.enum(['workshop', 'seminar', 'competition', 'social', 'volunteering', 'sports', 'cultural', 'technical', 'other']),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
  location: z.string().optional(),
  venue: z.string().optional(),
  maxParticipants: z.number().int().positive().optional(),
  registrationDeadline: z.string().datetime().optional(),
  pointsReward: z.number().int().min(0).max(100).default(0),
  volunteerHours: z.number().min(0).max(24).default(0),
  imageUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  skillAreas: z.array(z.string()).optional(),
  prerequisites: z.string().optional(),
  agenda: z.string().optional(),
  requiresApproval: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  registrationFee: z.number().min(0).default(0),
  certificateTemplate: z.string().optional(),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional(),
  externalLink: z.string().url().optional()
}).refine(data => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return start < end;
}, {
  message: 'End date must be after start date',
  path: ['endDate']
}).refine(data => {
  if (data.registrationDeadline) {
    const deadline = new Date(data.registrationDeadline);
    const start = new Date(data.startDate);
    return deadline <= start;
  }
  return true;
}, {
  message: 'Registration deadline must be before event start',
  path: ['registrationDeadline']
});

const updateEventSchema = createEventSchema.partial();

const eventQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
  sortBy: z.enum(['startDate', 'title', 'createdAt', 'registrations']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  clubId: z.string().uuid().optional(),
  eventType: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  skillAreas: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isPublished: z.string().transform(val => val === 'true').optional(),
  isFeatured: z.string().transform(val => val === 'true').optional(),
  hasAvailableSlots: z.string().transform(val => val === 'true').optional(),
  upcoming: z.string().transform(val => val === 'true').optional(),
  past: z.string().transform(val => val === 'true').optional()
});

const registrationSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  additionalData: z.record(z.any()).optional()
});

const attendanceSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  attended: z.boolean(),
  checkInTime: z.string().datetime().optional(),
  checkOutTime: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
  method: z.enum(['manual', 'qr_code', 'geofence', 'biometric']).default('manual')
});

const bulkAttendanceSchema = z.object({
  attendanceRecords: z.array(z.object({
    userId: z.string().uuid(),
    attended: z.boolean(),
    notes: z.string().max(500).optional()
  })).min(1, 'At least one attendance record is required')
});

const qrCodeSchema = z.object({
  validFrom: z.string().datetime('Invalid start time'),
  validUntil: z.string().datetime('Invalid end time'),
  maxScans: z.number().int().positive().optional(),
  description: z.string().max(200).optional()
}).refine(data => {
  const validFrom = new Date(data.validFrom);
  const validUntil = new Date(data.validUntil);
  return validFrom < validUntil;
}, {
  message: 'Valid until must be after valid from',
  path: ['validUntil']
});

const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
  suggestions: z.string().max(1000).optional(),
  wouldRecommend: z.boolean(),
  organizationRating: z.number().int().min(1).max(5).optional(),
  contentRating: z.number().int().min(1).max(5).optional(),
  venueRating: z.number().int().min(1).max(5).optional(),
  isAnonymous: z.boolean().default(false)
});

// Public routes (no authentication required)
router.get('/featured', getFeaturedEvents);
router.get('/public', optionalAuth, getEvents);
router.get('/calendar', optionalAuth, getEventCalendar);
router.get('/search', optionalAuth, validateSchema(z.object({ q: z.string().min(1) })), searchEvents);

// Authentication required routes
router.use(authenticate);

// Event CRUD operations
router.get('/', validateSchema(eventQuerySchema), getEvents);
router.get('/:id', getEventById);
router.post('/', 
  requirePermission(Permission.CREATE_EVENTS),
  validateSchema(createEventSchema),
  createEvent
);
router.put('/:id',
  requirePermission(Permission.UPDATE_OWN_EVENTS),
  validateSchema(updateEventSchema),
  updateEvent
);
router.delete('/:id',
  requirePermission(Permission.DELETE_OWN_EVENTS),
  deleteEvent
);

// Event publishing and management
router.patch('/:id/publish',
  requirePermission(Permission.UPDATE_OWN_EVENTS),
  publishEvent
);
router.patch('/:id/cancel',
  requirePermission(Permission.UPDATE_OWN_EVENTS),
  cancelEvent
);
router.post('/:id/duplicate',
  requirePermission(Permission.CREATE_EVENTS),
  duplicateEvent
);

// Event image/banner upload
router.post('/:id/image',
  requirePermission(Permission.UPDATE_OWN_EVENTS),
  upload.single('image'),
  async (req, res, next) => {
    // Image upload handling will be done in controller
    next();
  }
);

// Event registration management
router.get('/:id/registrations',
  requirePermission(Permission.MANAGE_EVENT_ATTENDANCE),
  getEventRegistrations
);
router.post('/:id/register',
  validateSchema(registrationSchema),
  registerForEvent
);
router.delete('/:id/register',
  unregisterFromEvent
);

// Attendance management
router.put('/:id/attendance/:userId',
  requirePermission(Permission.MANAGE_EVENT_ATTENDANCE),
  validateSchema(attendanceSchema),
  markAttendance
);
router.put('/:id/bulk-attendance',
  requirePermission(Permission.MANAGE_EVENT_ATTENDANCE),
  validateSchema(bulkAttendanceSchema),
  bulkMarkAttendance
);
router.post('/:id/check-in/:userId',
  requirePermission(Permission.MANAGE_EVENT_ATTENDANCE),
  checkInUser
);
router.post('/:id/check-out/:userId',
  requirePermission(Permission.MANAGE_EVENT_ATTENDANCE),
  checkOutUser
);

// Attendance reporting and logs
router.get('/:id/attendance-report',
  requirePermission(Permission.MANAGE_EVENT_ATTENDANCE),
  getAttendanceReport
);
router.get('/:id/attendance-logs',
  requirePermission(Permission.MANAGE_EVENT_ATTENDANCE),
  getAttendanceLogs
);

// QR Code attendance system
router.post('/:id/qr-code',
  requirePermission(Permission.MANAGE_EVENT_ATTENDANCE),
  validateSchema(qrCodeSchema),
  generateQRCode
);
router.post('/qr-attendance',
  authRateLimit, // Rate limit QR scans to prevent abuse
  scanQRCode
);

// Event analytics and insights
router.get('/:id/analytics',
  requirePermission(Permission.MANAGE_EVENT_ATTENDANCE),
  getEventAnalytics
);

// Event feedback system
router.get('/:id/feedback',
  requirePermission(Permission.MANAGE_EVENT_ATTENDANCE),
  getEventFeedback
);
router.post('/:id/feedback',
  validateSchema(feedbackSchema),
  submitEventFeedback
);

// Event communication
router.post('/:id/reminders',
  requirePermission(Permission.MANAGE_EVENT_ATTENDANCE),
  sendEventReminders
);

// Club-specific event routes
router.get('/club/:clubId',
  getEventsByClub
);

// Data export (for admins)
router.get('/:id/export',
  requireRole(UserRole.CLUB_ADMIN, UserRole.SUPER_ADMIN),
  exportEventData
);

// Admin-only routes
router.patch('/:id/feature',
  requireRole(UserRole.SUPER_ADMIN),
  async (req, res, next) => {
    // Handle featuring/unfeaturing events
    next();
  }
);

router.get('/admin/all',
  requireRole(UserRole.SUPER_ADMIN),
  async (req, res, next) => {
    // Get all events for admin panel
    next();
  }
);

// Error handling for invalid event IDs
router.use('/:id/*', (req, res, next) => {
  const { id } = req.params;
  if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid event ID format',
      error: 'INVALID_EVENT_ID'
    });
  }
  next();
});

// Route not found handler
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Event endpoint not found',
    error: 'ROUTE_NOT_FOUND'
  });
});

export default router;