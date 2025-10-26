// import { Router } from 'express';
// import { ProfileController } from '../controller/profileController';
// import { authMiddleware } from '../middleware/auth';
// // import { uploadMiddleware } from '../middleware/upload';
// import { upload } from '../middleware/upload';
// import { rateLimiter } from '../middleware/rateLimiter'; // <-- FIXED IMPORT

// const router = Router();
// const profileController = new ProfileController();

// // Apply authentication to all routes
// router.use(authMiddleware);

// // Basic profile routes
// router.get('/profile/me', profileController.getMyProfile);
// router.get('/user/:userId', profileController.getProfileById);
// router.put('/profile/me', rateLimiter, profileController.updateProfile); // <-- FIXED

// // Profile picture upload
// router.post('profile/me/picture', 
//   upload.single('profilePicture'), 
//   rateLimiter, // <-- FIXED
//   profileController.updateProfilePicture
// );

// // Clubs and events
// router.get('profile/me/clubs', profileController.getMyClubs);
// router.get('profile/me/events', profileController.getMyEvents);

// // Points and achievements
// router.get('profile/me/points', profileController.getPointsHistory);
// router.get('profile/me/volunteer-hours', profileController.getVolunteerHours);
// router.get('profile/me/badges', profileController.getBadges);
// router.get('profile/me/achievements', profileController.getAchievements);

// // Activity and stats
// router.get('profile/me/activity', profileController.getActivityTimeline);
// router.get('profile/me/stats', profileController.getStats);
// router.get('profile/me/leaderboard', profileController.getLeaderboardPosition);

// // Preferences and settings
// router.get('profile/me/preferences', profileController.getPreferences);
// router.put('profile/me/preferences', rateLimiter, profileController.updatePreferences); // <-- FIXED

// // Recommendations
// router.get('profile/me/recommendations', profileController.getRecommendations);

// // Data management (GDPR compliance)
// router.get('profile/me/export', 
//   rateLimiter, // <-- FIXED
//   profileController.exportData
// );

// router.delete('profile/me', 
//   rateLimiter, // <-- FIXED
//   profileController.deleteAccount
// );

// export default router;

import { Router } from 'express';
import { ProfileController } from '../controller/profileController';
import { authMiddleware } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();
const profileController = new ProfileController();

// All routes require authentication
router.use(authMiddleware);

// Basic profile routes
router.get('/me', profileController.getMyProfile);
router.get('/user/:userId', profileController.getProfileById);
router.put('/me', rateLimiter, profileController.updateProfile);

// Profile picture upload
router.post(
  '/me/picture',
  upload.single('profilePicture'),
  rateLimiter,
  profileController.updateProfilePicture
);

// Clubs and events
router.get('/me/clubs', profileController.getMyClubs);
router.get('/me/events', profileController.getMyEvents);

// Points and achievements
router.get('/profile/me/points', profileController.getPointsHistory);
router.get('/me/volunteer-hours', profileController.getVolunteerHours);
router.get('/me/badges', profileController.getBadges);
router.get('/me/achievements', profileController.getAchievements);

// Activity and stats
router.get('/me/activity', profileController.getActivityTimeline);
router.get('/me/stats', profileController.getStats);
router.get('/me/leaderboard', profileController.getLeaderboardPosition);

// Preferences and settings
router.get('/me/preferences', profileController.getPreferences);
router.put('/me/preferences', rateLimiter, profileController.updatePreferences);

// Recommendations
router.get('/me/recommendations', profileController.getRecommendations);

// Data management (GDPR compliance)
router.get('/me/export', rateLimiter, profileController.exportData);
router.delete('/me', rateLimiter, profileController.deleteAccount);

export default router;
