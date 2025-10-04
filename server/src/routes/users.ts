import { Router } from 'express';
import { userController } from '../controllers/userController';
import { auth, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';
// Replace missing rateLimiter with simple wrapper
import rateLimit from 'express-rate-limit';
const rateLimiter = (max: number, windowSeconds: number) => rateLimit({ windowMs: windowSeconds * 1000, max });

const router = Router();

// Public routes (no authentication required)
router.get('/dashboard-stats', userController.getDashboardStats);

// Protected routes (authentication required)
router.use(auth);

// User profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.post('/upload-avatar', 
  rateLimiter(5, 15), // 5 uploads per 15 minutes
  upload.single('avatar'), 
  userController.uploadAvatar
);

// User by ID (for public profiles)
router.get('/:id', userController.getUserById);

// Admin only routes
router.get('/', 
  requireRole(['admin', 'super_admin']), 
  userController.getAllUsers
);

router.put('/:id/role', 
  requireRole(['super_admin']), 
  userController.updateUserRole
);

router.delete('/:id', 
  requireRole(['super_admin']), 
  userController.deleteUser
);

router.put('/:id/status', 
  requireRole(['admin', 'super_admin']), 
  userController.updateUserStatus
);

// User statistics and analytics
router.get('/:id/stats', userController.getUserStats);

export default router;