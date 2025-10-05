import { Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import { UpdateUserData, UserFilters, UserRole } from '../types/user';
import { AuthRequest } from '../types/authRequest';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../utils/constants';
import { z } from 'zod';

// Simple validation function
function validateAuthRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

const userService = new UserService();


// Validation schemas
const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().min(10).max(20).optional(),
  department: z.string().min(1).max(100).optional(),
  yearOfStudy: z.number().int().min(1).max(6).optional(),
  profileImage: z.string().url().optional()
});

const userFiltersSchema = z.object({
  role: z.enum(['student', 'club_admin', 'super_admin']).optional(),
  department: z.string().optional(),
  yearOfStudy: z.number().int().min(1).max(6).optional(),
  isVerified: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional()
});

const updateRoleSchema = z.object({
  role: z.enum(['student', 'club_admin', 'super_admin'])
});

export class UserController {
  // Get current user profile
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const profile = await userService.getUserProfile(userId);
      if (!profile) {
        throw new AppError('User profile not found', HTTP_STATUS.NOT_FOUND);
      }

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user by ID
  async getUserById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const user = await userService.getUserById(id);
      if (!user) {
        throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  // Update user profile
  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const validatedData = validateAuthRequest(updateUserSchema, req.body);
      
      const updatedUser = await userService.updateUser(userId, validatedData);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }

  // Upload profile image
  async uploadAvatar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      if (!req.file) {
        throw new AppError('No image file provided', HTTP_STATUS.BAD_REQUEST);
      }

      // This assumes you have image upload middleware that adds the URL to req.file
      const imageUrl = (req.file as any).secure_url || (req.file as any).url;
      
      const updatedUser = await userService.uploadProfileImage(userId, imageUrl);

      res.json({
        success: true,
        message: 'Profile image updated successfully',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }

  // Get dashboard statistics
  async getDashboardStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const stats = await userService.getDashboardStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  // Get points history
  async getPointsHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const pointsHistory = await userService.getPointsHistory(userId);

      res.json({
        success: true,
        data: pointsHistory
      });
    } catch (error) {
      next(error);
    }
  }

  // Get recent activities
  async getRecentActivities(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const { limit = 10 } = req.query;
      const activities = await userService.getRecentActivities(userId, Number(limit));

      res.json({
        success: true,
        data: activities
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all users (Admin only)
  async getUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Check if user is admin
      if (req.user?.role !== UserRole.SUPER_ADMIN) {
        throw new AppError('Access denied. Admin privileges required.', HTTP_STATUS.FORBIDDEN);
      }

      const validatedQuery = validateAuthRequest(userFiltersSchema, req.query);
      
      const { page = 1, limit = 20, ...filters } = validatedQuery;
      
      const result = await userService.getUsers(filters as UserFilters, page, limit);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Update user role (Super Admin only)
  async updateUserRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Check if user is super admin
      if (req.user?.role !== UserRole.SUPER_ADMIN) {
        throw new AppError('Access denied. Super admin privileges required.', HTTP_STATUS.FORBIDDEN);
      }

      const { id } = req.params;
      const validatedData = validateAuthRequest(updateRoleSchema, req.body);

      const updatedUser = await userService.updateUserRole(id, validatedData.role as UserRole);

      res.json({
        success: true,
        message: 'User role updated successfully',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }

  // Verify user (Admin only)
  async verifyUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Check if user has admin privileges
      if (!req.user?.role || ![UserRole.CLUB_ADMIN, UserRole.SUPER_ADMIN].includes(req.user.role as UserRole)) {
        throw new AppError('Access denied. Admin privileges required.', HTTP_STATUS.FORBIDDEN);
      }

      const { id } = req.params;
      const verifiedUser = await userService.verifyUser(id);

      res.json({
        success: true,
        message: 'User verified successfully',
        data: verifiedUser
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete user (Super Admin only)
  async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Check if user is super admin
      if (req.user?.role !== UserRole.SUPER_ADMIN) {
        throw new AppError('Access denied. Super admin privileges required.', HTTP_STATUS.FORBIDDEN);
      }

      const { id } = req.params;
      
      // Prevent self-deletion
      if (id === req.user.id) {
        throw new AppError('You cannot delete your own account', HTTP_STATUS.BAD_REQUEST);
      }

      await userService.deleteUser(id);

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Add points to user (Admin only)
  async addPoints(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Check if user has admin privileges
      if (![UserRole.CLUB_ADMIN, UserRole.SUPER_ADMIN].includes(req.user?.role as UserRole)) {
        throw new AppError('Access denied. Admin privileges required.', HTTP_STATUS.FORBIDDEN);
      }

      const { id } = req.params;
      const { points, volunteerHours = 0 } = req.body;

      if (!points || points <= 0) {
        throw new AppError('Points must be a positive number', HTTP_STATUS.BAD_REQUEST);
      }

      if (volunteerHours < 0) {
        throw new AppError('Volunteer hours cannot be negative', HTTP_STATUS.BAD_REQUEST);
      }

      const updatedUser = await userService.addPoints(id, points, volunteerHours);

      res.json({
        success: true,
        message: 'Points added successfully',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }
}