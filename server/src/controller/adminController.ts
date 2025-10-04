import { Response, NextFunction } from 'express';
import { AdminService } from '../services/adminService';
import { UserRole } from '../types/user';
import { AuthRequest } from '../types/authRequest';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../utils/constants';
import { z } from 'zod';

// Simple validation function
function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

const adminService = new AdminService();

// Validation schemas
const userRoleUpdateSchema = z.object({
  role: z.enum(['student', 'club_admin', 'super_admin'])
});

const analyticsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  timeframe: z.enum(['day', 'week', 'month', 'year']).optional(),
  clubId: z.string().uuid().optional(),
  eventType: z.string().optional()
});

const moderationSchema = z.object({
  reason: z.string().min(1).max(500),
  action: z.enum(['warn', 'suspend', 'ban', 'delete']),
  duration: z.number().int().min(1).optional() // Duration in days for temporary actions
});

const announcementSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(2000),
  type: z.enum(['info', 'warning', 'success', 'error']),
  targetAudience: z.enum(['all', 'students', 'club_admins', 'specific_clubs']),
  clubIds: z.array(z.string().uuid()).optional(),
  expiresAt: z.string().datetime().optional()
});

export class AdminController {
  // Check if user has admin privileges
  private checkAdminAccess(user: any, requiredRole: UserRole = UserRole.SUPER_ADMIN) {
      if (!user) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }
    
    const userRole = user.role as UserRole;
    const roleHierarchy = {
      [UserRole.STUDENT]: 0,
      [UserRole.CLUB_ADMIN]: 1,
      [UserRole.SUPER_ADMIN]: 2
    };

    if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
      throw new AppError('Insufficient permissions', HTTP_STATUS.FORBIDDEN);
    }
  }

  // Dashboard analytics
  async getDashboardAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      this.checkAdminAccess(req.user);

      const validatedQuery = validateRequest(analyticsQuerySchema, req.query);
      const analytics = await adminService.getDashboardAnalytics(validatedQuery);

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      next(error);
    }
  }

  // User management
  async getAllUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      this.checkAdminAccess(req.user);

      const { page = 1, limit = 20, search, role, department, isVerified } = req.query;
      
      const filters = {
        search: search as string,
        role: role as UserRole,
        department: department as string,
        isVerified: isVerified === 'true' ? true : isVerified === 'false' ? false : undefined
      };

      const users = await adminService.getAllUsers(filters, Number(page), Number(limit));

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      this.checkAdminAccess(req.user);

      const { userId } = req.params;
      const user = await adminService.getUserWithDetails(userId);

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

  async updateUserRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      this.checkAdminAccess(req.user);

      const { userId } = req.params;
      const validatedData = validateRequest(userRoleUpdateSchema, req.body);

      const updatedUser = await adminService.updateUserRole(userId, validatedData.role as UserRole);

      res.json({
        success: true,
        message: 'User role updated successfully',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }

  async suspendUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      this.checkAdminAccess(req.user);

      const { userId } = req.params;
      const validatedData = validateRequest(moderationSchema, req.body);

      await adminService.moderateUser(userId, validatedData, req.user!.id);

      res.json({
        success: true,
        message: 'User moderated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      this.checkAdminAccess(req.user, UserRole.CLUB_ADMIN);

      const { userId } = req.params;
      const verifiedUser = await adminService.verifyUser(userId);

      res.json({
        success: true,
        message: 'User verified successfully',
        data: verifiedUser
      });
    } catch (error) {
      next(error);
    }
  }

  // Club management
  async getAllClubs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      this.checkAdminAccess(req.user);

      const { page = 1, limit = 20, search, category, isActive } = req.query;
      
      const filters = {
        search: search as string,
        category: category as string,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
      };

      const clubs = await adminService.getAllClubs(filters, Number(page), Number(limit));

      res.json({
        success: true,
        data: clubs
      });
    } catch (error) {
      next(error);
    }
  }

  async getClubById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      this.checkAdminAccess(req.user);

      const { clubId } = req.params;
      const club = await adminService.getClubWithDetails(clubId);

      if (!club) {
        throw new AppError('Club not found', HTTP_STATUS.NOT_FOUND);
      }

      res.json({
        success: true,
        data: club
      });
    } catch (error) {
      next(error);
    }
  }

  async updateClubStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      this.checkAdminAccess(req.user);

      const { clubId } = req.params;
      const { isActive, reason } = req.body;

      const updatedClub = await adminService.updateClubStatus(clubId, isActive, reason, req.user!.id);

      res.json({
        success: true,
        message: `Club ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: updatedClub
      });
    } catch (error) {
      next(error);
    }
  }

  // Event management
  async getAllEvents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      this.checkAdminAccess(req.user);

      const { page = 1, limit = 20, search, clubId, eventType, status } = req.query;
      
      const filters = {
        search: search as string,
        clubId: clubId as string,
        eventType: eventType as string,
        status: status as string
      };

      const events = await adminService.getAllEvents(filters, Number(page), Number(limit));

      res.json({
        success: true,
        data: events
      });
    } catch (error) {
      next(error);
    }
  }

  async getEventById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      this.checkAdminAccess(req.user);

      const { eventId } = req.params;
      const event = await adminService.getEventWithDetails(eventId);

      if (!event) {
        throw new AppError('Event not found', HTTP_STATUS.NOT_FOUND);
      }

      res.json({
        success: true,
        data: event
      });
    } catch (error) {
      next(error);
    }
  }

  async moderateEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      this.checkAdminAccess(req.user);

      const { eventId } = req.params;
      const { action, reason } = req.body;

      await adminService.moderateEvent(eventId, action, reason, req.user!.id);

      res.json({
        success: true,
        message: 'Event moderated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // System analytics
  async getSystemAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      this.checkAdminAccess(req.user);

      const validatedQuery = validateRequest(analyticsQuerySchema, req.query);
      const analytics = await adminService.getSystemAnalytics(validatedQuery);

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserEngagementStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      this.checkAdminAccess(req.user);

      const validatedQuery = validateRequest(analyticsQuerySchema, req.query);
      const stats = await adminService.getUserEngagementStats(validatedQuery);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  async getClubPerformanceStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      this.checkAdminAccess(req.user);

      const validatedQuery = validateRequest(analyticsQuerySchema, req.query);
      const stats = await adminService.getClubPerformanceStats(validatedQuery);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  // System announcements
  async createAnnouncement(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      this.checkAdminAccess(req.user);

      const validatedData = validateRequest(announcementSchema, req.body);
      const announcement = await adminService.createAnnouncement(validatedData, req.user!.id);

      res.json({
        success: true,
        message: 'Announcement created successfully',
        data: announcement
      });
    } catch (error) {
      next(error);
    }
  }

  async getAnnouncements(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      this.checkAdminAccess(req.user);

      const { page = 1, limit = 20, active = true } = req.query;
      const announcements = await adminService.getAnnouncements(Number(page), Number(limit), active === 'true');

      res.json({
        success: true,
        data: announcements
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAnnouncement(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      this.checkAdminAccess(req.user);

      const { announcementId } = req.params;
      const validatedData = validateRequest(announcementSchema.partial(), req.body);
      
      const announcement = await adminService.updateAnnouncement(announcementId, validatedData);

      res.json({
        success: true,
        message: 'Announcement updated successfully',
        data: announcement
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAnnouncement(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      this.checkAdminAccess(req.user);

      const { announcementId } = req.params;
      await adminService.deleteAnnouncement(announcementId);

      res.json({
        success: true,
        message: 'Announcement deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Reports and exports
  async generateUserReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      this.checkAdminAccess(req.user);

      const validatedQuery = validateRequest(analyticsQuerySchema, req.query);
      const report = await adminService.generateUserReport(validatedQuery);

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  async generateClubReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      this.checkAdminAccess(req.user);

      const validatedQuery = validateRequest(analyticsQuerySchema, req.query);
      const report = await adminService.generateClubReport(validatedQuery);

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  async generateEventReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      this.checkAdminAccess(req.user);

      const validatedQuery = validateRequest(analyticsQuerySchema, req.query);
      const report = await adminService.generateEventReport(validatedQuery);

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  // Badge and points management
  async getBadgeSystem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      this.checkAdminAccess(req.user);

      const badgeSystem = await adminService.getBadgeSystem();

      res.json({
        success: true,
        data: badgeSystem
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBadgeCriteria(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      this.checkAdminAccess(req.user);

      const { badgeId } = req.params;
      const { criteria } = req.body;

      const updatedBadge = await adminService.updateBadgeCriteria(badgeId, criteria);

      res.json({
        success: true,
        message: 'Badge criteria updated successfully',
        data: updatedBadge
      });
    } catch (error) {
      next(error);
    }
  }

  async awardBadgeManually(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      this.checkAdminAccess(req.user);

      const { userId, badgeId, reason } = req.body;
      
      const awardedBadge = await adminService.awardBadge(userId, badgeId, reason, req.user!.id);

      res.json({
        success: true,
        message: 'Badge awarded successfully',
        data: awardedBadge
      });
    } catch (error) {
      next(error);
    }
  }

  async adjustUserPoints(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      this.checkAdminAccess(req.user);

      const { userId } = req.params;
      const { points, volunteerHours = 0, reason } = req.body;

      if (!reason) {
        throw new AppError('Reason is required for manual point adjustment', HTTP_STATUS.BAD_REQUEST);
      }

      const updatedUser = await adminService.adjustUserPoints(userId, points, volunteerHours, reason, req.user!.id);

      res.json({
        success: true,
        message: 'User points adjusted successfully',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }

  // System maintenance
  async getSystemHealth(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      this.checkAdminAccess(req.user);

      const health = await adminService.getSystemHealth();

      res.json({
        success: true,
        data: health
      });
    } catch (error) {
      next(error);
    }
  }

  async runSystemMaintenance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      this.checkAdminAccess(req.user);

      const { tasks } = req.body; // Array of maintenance tasks
      
      const result = await adminService.runMaintenance(tasks, req.user!.id);

      res.json({
        success: true,
        message: 'System maintenance completed',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Audit logs
  async getAuditLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      this.checkAdminAccess(req.user);

      const { page = 1, limit = 50, action, userId, startDate, endDate } = req.query;
      
      const filters = {
        action: action as string,
        userId: userId as string,
        startDate: startDate as string,
        endDate: endDate as string
      };

      const logs = await adminService.getAuditLogs(filters, Number(page), Number(limit));

      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      next(error);
    }
  }
}