import { Router } from 'express';
// Make sure the file exists at the specified path and is named 'adminController.ts' (case-sensitive).
import { AdminController } from '../controller/adminController';
import { authMiddleware} from '../middleware/auth';
import { createRateLimiter } from '../middleware/rateLimiter';

const router = Router();
const adminController = new AdminController();

// Apply authentication to all routes
router.use(authMiddleware);

// Dashboard analytics
router.get('/analytics/dashboard', adminController.getDashboardAnalytics);
router.get('/analytics/system', adminController.getSystemAnalytics);
router.get('/analytics/users', adminController.getUserEngagementStats);
router.get('/analytics/clubs', adminController.getClubPerformanceStats);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserById);
router.put('/users/:userId/role', createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }), adminController.updateUserRole);
router.post('/users/:userId/verify', adminController.verifyUser);
router.post('/users/:userId/suspend', createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }), adminController.suspendUser);
router.put('/users/:userId/points', createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }), adminController.adjustUserPoints);

// Club management
router.get('/clubs', adminController.getAllClubs);
router.get('/clubs/:clubId', adminController.getClubById);
router.put('/clubs/:clubId/status', createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }), adminController.updateClubStatus);

// Event management
router.get('/events', adminController.getAllEvents);
router.get('/events/:eventId', adminController.getEventById);
router.post('/events/:eventId/moderate', createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }), adminController.moderateEvent);

// System announcements
router.get('/announcements', adminController.getAnnouncements);
router.post('/announcements', createRateLimiter({ windowMs: 60 * 60 * 1000, max: 10 }), adminController.createAnnouncement);
router.put('/announcements/:announcementId', createRateLimiter({ windowMs: 60 * 60 * 1000, max: 20 }), adminController.updateAnnouncement);
router.delete('/announcements/:announcementId', adminController.deleteAnnouncement);

// Reports and exports
router.get('/reports/users', adminController.generateUserReport);
router.get('/reports/clubs', adminController.generateClubReport);
router.get('/reports/events', adminController.generateEventReport);

// Badge and points system
router.get('/badges', adminController.getBadgeSystem);
router.put('/badges/:badgeId/criteria', createRateLimiter({ windowMs: 60 * 60 * 1000, max: 10 }), adminController.updateBadgeCriteria);
router.post('/badges/award', createRateLimiter({ windowMs: 60 * 60 * 1000, max: 20 }), adminController.awardBadgeManually);

// System maintenance
router.get('/system/health', adminController.getSystemHealth);
router.post('/system/maintenance', createRateLimiter({ windowMs: 60 * 60 * 1000, max: 3 }), adminController.runSystemMaintenance);

// Audit logs
router.get('/audit-logs', adminController.getAuditLogs);

export default router;