import { Response, NextFunction } from 'express';
// If ProfileService is a default export:
import { ProfileService } from '../services/profileService';
// Or, if the actual named export is different, e.g.:
//// import { ActualExportName } from '../services/profileService';
import { UserRole } from '../types/user';
import { AuthRequest } from '../types/authRequest';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../utils/constants';
import { z } from 'zod';

// Simple validation function
function validateAuthRequest
<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

const profileService = new ProfileService();

// Validation schemas
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
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  eventType: z.string().optional(),
  clubId: z.string().uuid().optional()
});

export class ProfileController {
  // Get current user's complete profile
  async getMyProfile(req: AuthRequest
, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const profile = await profileService.getCompleteProfile(userId);
      if (!profile) {
        throw new AppError('Profile not found', 404);
      }

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  // Get profile by user ID (public view)
  async getProfileById(req: AuthRequest
, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const viewerId = req.user?.id;

      const profile = await profileService.getPublicProfile(userId, viewerId);
      if (!profile) {
        throw new AppError('Profile not found', 404);
      }

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  // Update profile information
  async updateProfile(req: AuthRequest
, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const validatedData = validateAuthRequest
(profileUpdateSchema, req.body);
      
      const updatedProfile = await profileService.updateProfile(userId, validatedData);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedProfile
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user's clubs with detailed information
  async getMyClubs(req: AuthRequest
, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const clubs = await profileService.getUserClubs(userId);

      res.json({
        success: true,
        data: clubs
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user's event history
  async getMyEvents(req: AuthRequest
, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const validatedQuery = validateAuthRequest
(querySchema, req.query);
      const events = await profileService.getUserEvents(userId, validatedQuery);

      res.json({
        success: true,
        data: events
      });
    } catch (error) {
      next(error);
    }
  }

  // Get points history
  async getPointsHistory(req: AuthRequest
, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const validatedQuery = validateAuthRequest
(querySchema, req.query);
      const pointsHistory = await profileService.getPointsHistory(userId, validatedQuery);

      res.json({
        success: true,
        data: pointsHistory
      });
    } catch (error) {
      next(error);
    }
  }

  // Get volunteer hours breakdown
  async getVolunteerHours(req: AuthRequest
, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const validatedQuery = validateAuthRequest
(querySchema, req.query);
      const volunteerHours = await profileService.getVolunteerHours(userId, validatedQuery);

      res.json({
        success: true,
        data: volunteerHours
      });
    } catch (error) {
      next(error);
    }
  }

  // Get earned badges
  async getBadges(req: AuthRequest
, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const badges = await profileService.getUserBadges(userId);

      res.json({
        success: true,
        data: badges
      });
    } catch (error) {
      next(error);
    }
  }

  // Get activity timeline
  async getActivityTimeline(req: AuthRequest
, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const validatedQuery = validateAuthRequest
(querySchema, req.query);
      const timeline = await profileService.getActivityTimeline(userId, validatedQuery);

      res.json({
        success: true,
        data: timeline
      });
    } catch (error) {
      next(error);
    }
  }

  // Update user preferences
  async updatePreferences(req: AuthRequest
, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const validatedData = validateAuthRequest
(preferencesSchema, req.body);
      
      const updatedPreferences = await profileService.updatePreferences(userId, validatedData);

      res.json({
        success: true,
        message: 'Preferences updated successfully',
        data: updatedPreferences
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user preferences
  async getPreferences(req: AuthRequest
, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const preferences = await profileService.getPreferences(userId);

      res.json({
        success: true,
        data: preferences
      });
    } catch (error) {
      next(error);
    }
  }

  // Get profile statistics
  async getStats(req: AuthRequest
, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const stats = await profileService.getProfileStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  // Export profile data (GDPR compliance)
  async exportData(req: AuthRequest
, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const exportData = await profileService.exportUserData(userId);

      res.json({
        success: true,
        message: 'Data export generated successfully',
        data: exportData
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete user account (soft delete)
  async deleteAccount(req: AuthRequest
, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const { confirmPassword } = req.body;
      if (!confirmPassword) {
        throw new AppError('Password confirmation required', HTTP_STATUS.BAD_REQUEST);
      }

      await profileService.deleteUserAccount(userId, confirmPassword);

      res.json({
        success: true,
        message: 'Account deletion initiated. You will receive a confirmation email.'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get leaderboard position
  async getLeaderboardPosition(req: AuthRequest
, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const { type = 'points' } = req.query;
      const position = await profileService.getLeaderboardPosition(userId, type as string);

      res.json({
        success: true,
        data: position
      });
    } catch (error) {
      next(error);
    }
  }

  // Get achievements progress
  async getAchievements(req: AuthRequest
, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const achievements = await profileService.getAchievements(userId);

      res.json({
        success: true,
        data: achievements
      });
    } catch (error) {
      next(error);
    }
  }

  // Update profile picture
  async updateProfilePicture(req: AuthRequest
, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      if (!req.file) {
        throw new AppError('No image file provided', HTTP_STATUS.BAD_REQUEST);
      }

      const imageUrl = (req.file as any).secure_url || (req.file as any).url;
      
      const updatedProfile = await profileService.updateProfilePicture(userId, imageUrl);

      res.json({
        success: true,
        message: 'Profile picture updated successfully',
        data: updatedProfile
      });
    } catch (error) {
      next(error);
    }
  }

  // Get recommendation settings
  async getRecommendations(req: AuthRequest
, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const recommendations = await profileService.getRecommendations(userId);

      res.json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      next(error);
    }
  }
}