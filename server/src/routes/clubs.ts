import { Router } from 'express';
import { clubController } from '../controller/clubController';
import { authMiddleware, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';
import rateLimit from 'express-rate-limit';

const router = Router();

// Simple rate limiter helper
const createRateLimiter = (max: number, windowMs: number) => 
  rateLimit({ windowMs, max, standardHeaders: true, legacyHeaders: false });

// Public routes (no authentication required)
router.get('/categories', clubController.getClubCategories);
router.get('/', clubController.getAllClubs);
router.get('/:id', clubController.getClubById);

// Protected routes (authentication required)
router.use(authMiddleware);

// Club membership routes
router.post('/:id/join', 
  createRateLimiter(10, 60 * 1000),
  clubController.joinClub
);

router.post('/:id/leave', 
  createRateLimiter(5, 60 * 1000),
  clubController.leaveClub
);

router.get('/:id/members', clubController.getClubMembers);

// Club admin routes
router.put('/:id/members/:userId/role', 
  requireRole('club_admin', 'super_admin'),
  clubController.updateMemberRole
);

router.delete('/:id/members/:userId', 
  requireRole('club_admin', 'super_admin'),
  clubController.removeMember
);

router.get('/:id/stats', clubController.getClubStats);

router.put('/:id', 
  requireRole('club_admin', 'super_admin'),
  upload.single('clubLogo'),
  clubController.updateClub
);

// Club creation (admin only)
router.post('/', 
  requireRole('club_admin', 'super_admin'),
  createRateLimiter(5, 3600 * 1000),
  upload.single('clubLogo'),
  clubController.createClub
);

// Super admin only routes
router.delete('/:id', 
  requireRole('super_admin'),
  clubController.deleteClub
);

export default router;