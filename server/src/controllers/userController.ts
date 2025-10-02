import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import { UpdateUserData, UserFilters } from '../types/user';
import { ApiError } from '../utils/errors';
import { validateRequest } from '../utils/validation';
import { VALIDATION_RULES } from '../utils/constants';
import { AuthRequest } from '../types/authRequest';
import { AuthUser, UserRole } from '../types/auth';
import { z } from 'zod';

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
        throw new ApiError(401, 'User not authenticated');
      }

      const profile = await userService.getUserProfile(userId);
      if (!profile) {
        throw new ApiError(404, 'User profile not found');
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
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const user = await userService.getUserById(id);
      if (!user) {
        throw new ApiError(404, 'User not found');
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
        throw new ApiError(401, 'User not authenticated');
      }

      const validatedData = validateRequest(updateUserSchema, req.body);
      
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
        throw new ApiError(401, 'User not authenticated');
      }

      if (!req.file) {
        throw new ApiError(400, 'No image file provided');
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
        throw new ApiError(401, 'User not authenticated');
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
        throw new ApiError(401, 'User not authenticated');
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
        throw new ApiError(401, 'User not authenticated');
      }

      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const activities = await userService.getRecentActivities(userId, limit);

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
      if (req.user?.role !== 'super_admin') {
        throw new ApiError(403, 'Access denied. Admin privileges required.');
      }

      const validatedQuery = validateRequest(userFiltersSchema, req.query);
      
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
      if (req.user?.role !== 'super_admin') {
        throw new ApiError(403, 'Access denied. Super admin privileges required.');
      }
      const { id } = req.params;
      const validatedData = validateRequest(updateRoleSchema, req.body);
      const updatedUser = await userService.updateUserRole(id, validatedData.role as UserRole);
      res.json({
        success: true,
        message: 'User role updated successfully',
        data: updatedUser
      });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  // Verify user (Admin only)
  async verifyUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!['club_admin', 'super_admin'].includes(req.user?.role || '')) {
        throw new ApiError(403, 'Access denied. Admin privileges required.');
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
      if (req.user?.role !== 'super_admin') {
        throw new ApiError(403, 'Access denied. Super admin privileges required.');
      }

      const { id } = req.params;
      
      // Prevent self-deletion
      if (id === req.user.id) {
        throw new ApiError(400, 'You cannot delete your own account');
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
      if (!['club_admin', 'super_admin'].includes(req.user?.role || '')) {
        throw new ApiError(403, 'Access denied. Admin privileges required.');
      }

      const { id } = req.params;
      const { points, volunteerHours = 0 } = req.body;

      if (!points || points <= 0) {
        throw new ApiError(400, 'Points must be a positive number');
      }

      if (volunteerHours < 0) {
        throw new ApiError(400, 'Volunteer hours cannot be negative');
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