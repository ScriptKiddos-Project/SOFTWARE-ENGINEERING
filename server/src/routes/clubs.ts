import { Router } from 'express';
import { clubController } from '../controllers/clubController';
import { auth, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes (no authentication required)
router.get('/categories', clubController.getClubCategories);
router.get('/', clubController.getAllClubs);
router.get('/:id', clubController.getClubById);

// Protected routes (authentication required)
router.use(auth);

// Club membership routes
router.post('/:id/join', 
  rateLimiter(10, 60), // 10 join attempts per minute
  clubController.joinClub
);

router.post('/:id/leave', 
  rateLimiter(5, 60), // 5 leave attempts per minute
  clubController.leaveClub
);

// Club members management
router.get('/:id/members', clubController.getClubMembers);

// Club admin routes (require club admin permissions or higher)
router.put('/:id/members/:userId/role', clubController.updateMemberRole);
router.delete('/:id/members/:userId', clubController.removeMember);
router.get('/:id/stats', clubController.getClubStats);
router.put('/:id', clubController.updateClub);

// Club creation and management (admin or super admin only)
router.post('/', 
  requireRole(['admin', 'super_admin']),
  rateLimiter(5, 3600), // 5 club creations per hour
  clubController.createClub
);

// Super admin only routes
router.delete('/:id', 
  requireRole(['super_admin']),
  clubController.deleteClub
);

export default router;