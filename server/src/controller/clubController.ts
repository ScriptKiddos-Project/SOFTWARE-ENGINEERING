import { Response, NextFunction } from 'express';
import { ClubService } from '../services/clubService';
import { AuthRequest } from '../types/authRequest';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../utils/constants';
import { z } from 'zod';
import { ClubCategory } from '@prisma/client';

// Simple validation function
function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

const clubService = new ClubService();

// Validation schemas
const createClubSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  category: z.nativeEnum(ClubCategory),
  contactEmail: z.string().email().optional(),
  logoUrl: z.string().url().optional(),
  coverImageUrl: z.string().url().optional()
});

const updateClubSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  category: z.nativeEnum(ClubCategory).optional(),
  contactEmail: z.string().email().optional(),
  logoUrl: z.string().url().optional(),
  coverImageUrl: z.string().url().optional(),
  isActive: z.boolean().optional()
});

const clubFiltersSchema = z.object({
  category: z.nativeEnum(ClubCategory).optional(),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  minMembers: z.coerce.number().int().min(0).optional(),
  maxMembers: z.coerce.number().int().min(1).optional(),
  hasUpcomingEvents: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional()
});

const memberFiltersSchema = z.object({
  role: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
  department: z.string().optional(),
  yearOfStudy: z.coerce.number().int().optional()
});

const updateMemberRoleSchema = z.object({
  role: z.enum(['member', 'coordinator', 'admin', 'super_admin'])
});

class ClubController {
  async createClub(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = validateRequest(createClubSchema, req.body);
      const club = await clubService.createClub(validated, req.user!.id);
      res.status(HTTP_STATUS.CREATED).json(club);
    } catch (err) {
      next(err);
    }
  }

  async getClubs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = validateRequest(clubFiltersSchema, req.query);
      const { page, limit, ...clubFilters } = filters;
      const clubs = await clubService.getClubs(clubFilters, page, limit);
      res.status(HTTP_STATUS.OK).json(clubs);
    } catch (err) {
      next(err);
    }
  }

  async getClubById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const club = await clubService.getClubById(id);
      
      if (!club) {
        throw new AppError('Club not found', HTTP_STATUS.NOT_FOUND);
      }
      
      res.status(HTTP_STATUS.OK).json(club);
    } catch (err) {
      next(err);
    }
  }

  async updateClub(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validated = validateRequest(updateClubSchema, req.body);
      const club = await clubService.updateClub(id, validated, req.user!.id);
      res.status(HTTP_STATUS.OK).json(club);
    } catch (err) {
      next(err);
    }
  }

  async deleteClub(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await clubService.deleteClub(id, req.user!.id);
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (err) {
      next(err);
    }
  }

  async joinClub(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      if (!req.user) {
        throw new AppError('Authentication required', HTTP_STATUS.UNAUTHORIZED);
      }
      
      const membership = await clubService.joinClub({ userId: req.user.id, clubId: id });
      res.status(HTTP_STATUS.CREATED).json(membership);
    } catch (err) {
      next(err);
    }
  }

  async leaveClub(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      if (!req.user) {
        throw new AppError('Authentication required', HTTP_STATUS.UNAUTHORIZED);
      }
      
      await clubService.leaveClub(req.user.id, id);
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (err) {
      next(err);
    }
  }

  async getClubMembers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const filters = validateRequest(memberFiltersSchema, req.query);
      const members = await clubService.getClubMembers(id, filters);
      res.status(HTTP_STATUS.OK).json(members);
    } catch (err) {
      next(err);
    }
  }

  async updateMemberRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id, userId } = req.params;
      const validated = validateRequest(updateMemberRoleSchema, req.body);
      
      const updatedMember = await clubService.updateMemberRole(
        id, 
        userId, 
        validated.role, 
        req.user!.id
      );
      
      res.status(HTTP_STATUS.OK).json(updatedMember);
    } catch (err) {
      next(err);
    }
  }

  async removeMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id, userId } = req.params;
      await clubService.removeMember(id, userId, req.user!.id);
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (err) {
      next(err);
    }
  }

  async getClubStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const stats = await clubService.getClubStats(id);
      res.status(HTTP_STATUS.OK).json(stats);
    } catch (err) {
      next(err);
    }
  }

  async getClubCategories(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const categories = Object.values(ClubCategory).map(cat => ({
        value: cat,
        label: cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, ' ')
      }));
      res.status(HTTP_STATUS.OK).json(categories);
    } catch (err) {
      next(err);
    }
  }
}

export const clubController = new ClubController();