import { Router } from 'express';
import { ProfileController } from '../controllers/profileController';
import { authenticateToken } from '../middleware/auth';
import { uploadMiddleware } from '../middleware/upload';
import { rateLimitMiddleware } from '../middleware/rateLimiter';

const router = Router();
const profileController = new ProfileController();

// Apply authentication to all routes
router.use(authenticateToken);

// Basic profile routes
router.get('/me', profileController.getMyProfile);
router.get('/user/:userId', profileController.getProfileById);
router.put('/me', rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 10 }), profileController.updateProfile);

// Profile picture upload
router.post('/me/picture', 
  uploadMiddleware.single('profilePicture'), 
  rateLimitMiddleware({ windowMs: 60 * 60 * 1000, max: 5 }), // 5 uploads per hour
  profileController.updateProfilePicture
);

// Clubs and events
router.get('/me/clubs', profileController.getMyClubs);
router.get('/me/events', profileController.getMyEvents);

// Points and achievements
router.get('/me/points', profileController.getPointsHistory);
router.get('/me/volunteer-hours', profileController.getVolunteerHours);
router.get('/me/badges', profileController.getBadges);
router.get('/me/achievements', profileController.getAchievements);

// Activity and stats
router.get('/me/activity', profileController.getActivityTimeline);
router.get('/me/stats', profileController.getStats);
router.get('/me/leaderboard', profileController.getLeaderboardPosition);

// Preferences and settings
router.get('/me/preferences', profileController.getPreferences);
router.put('/me/preferences', rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 20 }), profileController.updatePreferences);

// Recommendations
router.get('/me/recommendations', profileController.getRecommendations);

// Data management (GDPR compliance)
router.get('/me/export', 
  rateLimitMiddleware({ windowMs: 24 * 60 * 60 * 1000, max: 3 }), // 3 exports per day
  profileController.exportData
);

router.delete('/me', 
  rateLimitMiddleware({ windowMs: 24 * 60 * 60 * 1000, max: 1 }), // 1 delete attempt per day
  profileController.deleteAccount
);

export default router;