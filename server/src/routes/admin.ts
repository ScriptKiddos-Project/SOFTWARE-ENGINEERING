import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticateToken } from '../middleware/auth';
import { rateLimitMiddleware } from '../middleware/rateLimiter';

const router = Router();
const adminController = new AdminController();

// Apply authentication to all routes
router.use(authenticateToken);

// Dashboard analytics
router.get('/analytics/dashboard', adminController.getDashboardAnalytics);
router.get('/analytics/system', adminController.getSystemAnalytics);
router.get('/analytics/users', adminController.getUserEngagementStats);
router.get('/analytics/clubs', adminController.getClubPerformanceStats);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserById);
router.put('/users/:userId/role', rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 10 }), adminController.updateUserRole);
router.post('/users/:userId/verify', adminController.verifyUser);
router.post('/users/:userId/suspend', rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 5 }), adminController.suspendUser);
router.put('/users/:userId/points', rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 20 }), adminController.adjustUserPoints);

// Club management
router.get('/clubs', adminController.getAllClubs);
router.get('/clubs/:clubId', adminController.getClubById);
router.put('/clubs/:clubId/status', rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 10 }), adminController.updateClubStatus);

// Event management
router.get('/events', adminController.getAllEvents);
router.get('/events/:eventId', adminController.getEventById);
router.post('/events/:eventId/moderate', rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 10 }), adminController.moderateEvent);

// System announcements
router.get('/announcements', adminController.getAnnouncements);
router.post('/announcements', rateLimitMiddleware({ windowMs: 60 * 60 * 1000, max: 10 }), adminController.createAnnouncement);
router.put('/announcements/:announcementId', rateLimitMiddleware({ windowMs: 60 * 60 * 1000, max: 20 }), adminController.updateAnnouncement);
router.delete('/announcements/:announcementId', adminController.deleteAnnouncement);

// Reports and exports
router.get('/reports/users', adminController.generateUserReport);
router.get('/reports/clubs', adminController.generateClubReport);
router.get('/reports/events', adminController.generateEventReport);

// Badge and points system
router.get('/badges', adminController.getBadgeSystem);
router.put('/badges/:badgeId/criteria', rateLimitMiddleware({ windowMs: 60 * 60 * 1000, max: 10 }), adminController.updateBadgeCriteria);
router.post('/badges/award', rateLimitMiddleware({ windowMs: 60 * 60 * 1000, max: 20 }), adminController.awardBadgeManually);

// System maintenance
router.get('/system/health', adminController.getSystemHealth);
router.post('/system/maintenance', rateLimitMiddleware({ windowMs: 60 * 60 * 1000, max: 3 }), adminController.runSystemMaintenance);

// Audit logs
router.get('/audit-logs', adminController.getAuditLogs);

export default router;