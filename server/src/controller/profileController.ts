import { Response, NextFunction } from 'express';
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  uploadProfileImage,
  getUserClubs,
  getUserEvents,
  getPointsHistory,
  getVolunteerHours,
  getUserBadges,
  getDashboardStats,
  getRecentActivities,
  checkAndAwardBadges,
  deleteUserAccount
} from '../services/profileService';
import { AuthRequest } from '../types/authRequest';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../utils/constants';
import { z } from 'zod';

function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

const profileUpdateSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().min(10).max(20).optional(),
  department: z.string().min(1).max(100).optional(),
  yearOfStudy: z.number().int().min(1).max(6).optional(),
  bio: z.string().max(500).optional(),
  interests: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  socialLinks: z.object({
    linkedin: z.string().url().optional(),
    github: z.string().url().optional(),
    instagram: z.string().url().optional(),
    twitter: z.string().url().optional()
  }).optional()
});

const preferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  eventReminders: z.boolean().optional(),
  clubUpdates: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  privacy: z.object({
    showEmail: z.boolean().optional(),
    showPhone: z.boolean().optional(),
    showDepartment: z.boolean().optional(),
    profileVisibility: z.enum(['public', 'members_only', 'private']).optional()
  }).optional()
});

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  eventType: z.string().optional(),
  clubId: z.string().uuid().optional()
});

export class ProfileController {
  async getMyProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const profile = await getUserProfile(userId);
      res.json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }

  async getProfileById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const profile = await getUserProfile(userId);
      res.json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const validatedData = validateRequest(profileUpdateSchema, req.body);
      const updatedProfile = await updateUserProfile(userId, validatedData);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedProfile
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyClubs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const clubs = await getUserClubs(userId);
      res.json({ success: true, data: clubs });
    } catch (error) {
      next(error);
    }
  }

  async getMyEvents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const { filter = 'all' } = req.query;
      const events = await getUserEvents(userId, filter as 'upcoming' | 'past' | 'all');
      res.json({ success: true, data: events });
    } catch (error) {
      next(error);
    }
  }

  async getPointsHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const { limit = 50 } = req.query;
      const pointsHistory = await getPointsHistory(userId, Number(limit));
      res.json({ success: true, data: pointsHistory });
    } catch (error) {
      next(error);
    }
  }

  async getVolunteerHours(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const volunteerHours = await getVolunteerHours(userId);
      res.json({ success: true, data: volunteerHours });
    } catch (error) {
      next(error);
    }
  }

  async getBadges(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const badges = await getUserBadges(userId);
      res.json({ success: true, data: badges });
    } catch (error) {
      next(error);
    }
  }

  async getActivityTimeline(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const { limit = 20 } = req.query;
      const timeline = await getRecentActivities(userId, Number(limit));
      res.json({ success: true, data: timeline });
    } catch (error) {
      next(error);
    }
  }

  async updatePreferences(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const validatedData = validateRequest(preferencesSchema, req.body);
      
      // Preferences update logic would go here
      res.json({
        success: true,
        message: 'Preferences updated successfully',
        data: validatedData
      });
    } catch (error) {
      next(error);
    }
  }

  async getPreferences(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      // Preferences fetch logic would go here
      res.json({ success: true, data: {} });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const stats = await getDashboardStats(userId);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async exportData(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const profile = await getUserProfile(userId);
      res.json({
        success: true,
        message: 'Data export generated successfully',
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const { confirmPassword } = req.body;
      if (!confirmPassword) {
        throw new AppError('Password confirmation required', HTTP_STATUS.BAD_REQUEST);
      }

      await deleteUserAccount(userId, confirmPassword);
      res.json({
        success: true,
        message: 'Account deletion initiated. You will receive a confirmation email.'
      });
    } catch (error) {
      next(error);
    }
  }

  async getLeaderboardPosition(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      // Leaderboard logic would go here
      res.json({ success: true, data: { position: 0, total: 0 } });
    } catch (error) {
      next(error);
    }
  }

  async getAchievements(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const badges = await checkAndAwardBadges(userId);
      res.json({ success: true, data: badges });
    } catch (error) {
      next(error);
    }
  }

  async updateProfilePicture(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      if (!req.file) {
        throw new AppError('No image file provided', HTTP_STATUS.BAD_REQUEST);
      }

      const updatedProfile = await uploadProfileImage(userId, req.file);
      res.json({
        success: true,
        message: 'Profile picture updated successfully',
        data: updatedProfile
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecommendations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      // Recommendations logic would go here
      res.json({ success: true, data: [] });
    } catch (error) {
      next(error);
    }
  }
}

export const profileController = new ProfileController();