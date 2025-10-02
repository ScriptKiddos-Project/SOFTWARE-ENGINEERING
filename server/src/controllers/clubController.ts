import { Request, Response, NextFunction } from 'express';
import { ClubService } from '../services/clubService';
import { ApiError } from '../utils/errors';
import { validateRequest } from '../utils/validation';
import { AuthRequest } from '../types/authRequest';
import { AuthUser } from '../types/auth';
import { z } from 'zod';

// Validation schemas
const createClubSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().optional(),
  category: z.enum(['technical', 'cultural', 'sports', 'social', 'academic', 'other']),
  contact_email: z.string().email().optional(),
});

const updateClubSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  description: z.string().optional(),
  category: z.enum(['technical', 'cultural', 'sports', 'social', 'academic', 'other']).optional(),
  contact_email: z.string().email().optional(),
  is_active: z.boolean().optional(),
});

const joinClubSchema = z.object({
  userId: z.string().uuid(),
});

const memberRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['member', 'admin', 'moderator']),
});

export class ClubController {
  constructor(private clubService: ClubService) {}

  // Get all clubs with optional filters
  async getClubs(req: Request, res: Response) {
    try {
      const {
        category,
        search,
        is_active,
        page = 1,
        limit = 10,
        sort_by = 'created_at',
        sort_order = 'desc'
      } = req.query;

      const filters = {
        category: category as string,
        search: search as string,
        is_active: is_active === 'true' ? true : is_active === 'false' ? false : undefined,
        page: parseInt(page as string),
        limit: Math.min(parseInt(limit as string), 50), // Max 50 per page
        sort_by: sort_by as string,
        sort_order: sort_order as 'asc' | 'desc'
      };

      const result = await this.clubService.getClubs(filters);

      res.status(200).json({
        success: true,
        message: 'Clubs retrieved successfully',
        data: result.clubs,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: result.total,
          pages: Math.ceil(result.total / filters.limit)
        }
      });
    } catch (error) {
      console.error('Get all clubs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve clubs',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
      return;
    }
  }

  // Get club by ID
  async getClubById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || !z.string().uuid().safeParse(id).success) {
        return res.status(400).json({
          success: false,
          message: 'Valid club ID is required'
        });
      }

      const club = await this.clubService.getClubById(id);

      if (!club) {
        return res.status(404).json({
          success: false,
          message: 'Club not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Club retrieved successfully',
        data: club
      });
      return;
    } catch (error) {
      console.error('Get club by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve club',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
      return;
    }
  }

  // Create new club (Admin or Super Admin only)
  async createClub(req: AuthRequest, res: Response) {
    try {
      const validation = createClubSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.error.errors
        });
      }

      // Check if user is admin or super admin
      if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to create club'
        });
      }

      const clubData = {
        ...validation.data,
        created_by: req.user.id
      };

      const club = await this.clubService.createClub(clubData, req.user.id);

      res.status(201).json({
        success: true,
        message: 'Club created successfully',
        data: club
      });
      return;
    } catch (error) {
      console.error('Create club error:', error);
      if (typeof error === 'object' && error && 'code' in error && (error as any).code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'Club name already exists'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to create club',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
      return;
    }
  }

  // Update club (Club Admin or Super Admin only)
  async updateClub(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || !z.string().uuid().safeParse(id).success) {
        return res.status(400).json({
          success: false,
          message: 'Valid club ID is required'
        });
      }
      const validation = updateClubSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.error.errors
        });
      }
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
      const club = await this.clubService.updateClub(id, validation.data, req.user.id);
      if (!club) {
        return res.status(404).json({
          success: false,
          message: 'Club not found'
        });
      }
      res.status(200).json({
        success: true,
        message: 'Club updated successfully',
        data: club
      });
      return;
    } catch (error) {
      console.error('Update club error:', error);
      if (typeof error === 'object' && error && 'code' in error && (error as any).code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'Club name already exists'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to update club',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
      return;
    }
  }

  // Delete club (Super Admin only)
  async deleteClub(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || !z.string().uuid().safeParse(id).success) {
        return res.status(400).json({
          success: false,
          message: 'Valid club ID is required'
        });
      }

      if (!req.user || req.user.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Only super admins can delete clubs'
        });
      }

      await this.clubService.deleteClub(id, req.user.id);
      res.status(200).json({
        success: true,
        message: 'Club deleted successfully'
      });
      return;
    } catch (error) {
      console.error('Delete club error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete club',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
      return;
    }
  }

  // Get club members
  async getClubMembers(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20, role } = req.query;
      
      if (!id || !z.string().uuid().safeParse(id).success) {
        return res.status(400).json({
          success: false,
          message: 'Valid club ID is required'
        });
      }

      const filters = {
        page: parseInt(page as string),
        limit: Math.min(parseInt(limit as string), 50),
        role: role as string
      };

      const result = await this.clubService.getClubMembers(id, filters);

      res.status(200).json({
        success: true,
        message: 'Club members retrieved successfully',
        data: result.members,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: result.total,
          pages: Math.ceil(result.total / filters.limit)
        }
      });
      return;
    } catch (error) {
      console.error('Get club members error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve club members',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
      return;
    }
  }

  // Join club
  async joinClub(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      if (!id || !z.string().uuid().safeParse(id).success) {
        return res.status(400).json({
          success: false,
          message: 'Valid club ID is required'
        });
      }
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
      // Pass JoinClubRequest object as required by service
      const membership = await this.clubService.joinClub({ userId: req.user.id, clubId: id });
      res.status(201).json({
        success: true,
        message: 'Successfully joined club',
        data: membership
      });
      return;
    } catch (error) {
      console.error('Join club error:', error);
      if (typeof error === 'object' && error && 'message' in error) {
        if ((error as any).message.includes('already a member')) {
          return res.status(409).json({
            success: false,
            message: 'You are already a member of this club'
          });
        }
        if ((error as any).message.includes('Club not found')) {
          return res.status(404).json({
            success: false,
            message: 'Club not found'
          });
        }
        if ((error as any).message.includes('not active')) {
          return res.status(400).json({
            success: false,
            message: 'This club is not currently accepting new members'
          });
        }
      }
      res.status(500).json({
        success: false,
        message: 'Failed to join club',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
      return;
    }
  }

  // Leave club
  async leaveClub(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || !z.string().uuid().safeParse(id).success) {
        return res.status(400).json({
          success: false,
          message: 'Valid club ID is required'
        });
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      await this.clubService.leaveClub(req.user.id, id);
      res.status(200).json({
        success: true,
        message: 'Successfully left club'
      });
      return;
    } catch (error) {
      console.error('Leave club error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to leave club',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
      return;
    }
  }

  // Update member role (Club Admin or Super Admin only)
  async updateMemberRole(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params; // club ID
      
      if (!id || !z.string().uuid().safeParse(id).success) {
        return res.status(400).json({
          success: false,
          message: 'Valid club ID is required'
        });
      }

      const validation = memberRoleSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.error.errors
        });
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const { userId, role } = validation.data;
      const updatedMembership = await this.clubService.updateMemberRole(id, userId, role as any, req.user.id);

      if (!updatedMembership) {
        return res.status(404).json({
          success: false,
          message: 'Membership not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Member role updated successfully',
        data: updatedMembership
      });
      return;
    } catch (error) {
      console.error('Update member role error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update member role',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
      return;
    }
  }

  // Remove member from club (Club Admin or Super Admin only)
  async removeMember(req: AuthRequest, res: Response) {
    try {
      const { id, userId } = req.params; // club ID and user ID
      
      if (!id || !z.string().uuid().safeParse(id).success) {
        return res.status(400).json({
          success: false,
          message: 'Valid club ID is required'
        });
      }

      if (!userId || !z.string().uuid().safeParse(userId).success) {
        return res.status(400).json({
          success: false,
          message: 'Valid user ID is required'
        });
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      await this.clubService.removeMember(id, userId, req.user.id);
      res.status(200).json({
        success: true,
        message: 'Member removed successfully'
      });
      return;
    } catch (error) {
      console.error('Remove member error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove member',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
      return;
    }
  }

  // Get club categories
  async getClubCategories(req: Request, res: Response) {
    try {
      const categories = [
        { value: 'technical', label: 'Technical', description: 'Programming, robotics, AI, etc.' },
        { value: 'cultural', label: 'Cultural', description: 'Arts, music, dance, drama' },
        { value: 'sports', label: 'Sports', description: 'Athletics, games, fitness' },
        { value: 'social', label: 'Social', description: 'Community service, social causes' },
        { value: 'academic', label: 'Academic', description: 'Study groups, research clubs' },
        { value: 'other', label: 'Other', description: 'Miscellaneous clubs' }
      ];

      res.status(200).json({
        success: true,
        message: 'Club categories retrieved successfully',
        data: categories
      });
    } catch (error) {
      console.error('Get club categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve club categories',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
      return;
    }
  }

  // Get club statistics (for admins)
  async getClubStats(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || !z.string().uuid().safeParse(id).success) {
        return res.status(400).json({
          success: false,
          message: 'Valid club ID is required'
        });
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const stats = await this.clubService.getClubStats(id);

      res.status(200).json({
        success: true,
        message: 'Club statistics retrieved successfully',
        data: stats
      });
      return;
    } catch (error) {
      console.error('Get club stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve club statistics',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
      return;
    }
  }
}

export const clubController = new ClubController(new ClubService());