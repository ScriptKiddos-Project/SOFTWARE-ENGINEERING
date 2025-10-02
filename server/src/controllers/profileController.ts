import { Request, Response, NextFunction } from 'express';
import { ProfileService } from '../services/profileService';
import { ApiError } from '../utils/errors';
import { validateRequest } from '../utils/validation';
import { AuthRequest } from '../types/authRequest';
import { AuthUser } from '../types/auth';
import { z } from 'zod';

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
  async getMyProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Add null check for req.user before accessing properties
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const userId = req.user.id;

      const profile = await ProfileService.getUserProfile(userId);
      if (!profile) {
        throw new ApiError(404, 'Profile not found');
      }

      res.json({
        data: profile
      });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  // Get profile by user ID (public view)
  async getProfileById(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const viewerId = req.user?.id || '';
      const profile = await ProfileService.getUserProfile(userId);
      if (!profile) {
        throw new ApiError(404, 'Profile not found');
      }

      res.json({
        data: profile
      });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  // Update profile information
  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const userId = req.user.id;
      const validatedData = validateRequest(profileUpdateSchema, req.body);
      
      const updatedProfile = await ProfileService.updateUserProfile(userId, validatedData);

      res.json({
        message: 'Profile updated successfully',
        data: updatedProfile
      });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  // Get user's clubs with detailed information
  async getMyClubs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const userId = req.user.id;
      const clubs = await ProfileService.getUserClubs(userId);

      res.json({
        data: clubs
      });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  // Get user's event history
  async getMyEvents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const userId = req.user.id;
      // Use only userId, filter: 'all' | 'upcoming' | 'past' if needed
      const events = await ProfileService.getUserEvents(userId, 'all');

      res.json({
        data: events
      });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  // Get points history
  async getPointsHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const userId = req.user.id;
      const pointsHistory = await ProfileService.getPointsHistory(userId, 50);

      res.json({
        data: pointsHistory
      });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  // Get volunteer hours breakdown
  async getVolunteerHours(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const userId = req.user.id;
      const volunteerHours = await ProfileService.getVolunteerHours(userId);

      res.json({
        data: volunteerHours
      });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  // Get earned badges
  async getBadges(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const userId = req.user.id;
      const badges = await ProfileService.getUserBadges(userId);

      res.json({
        data: badges
      });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }
}