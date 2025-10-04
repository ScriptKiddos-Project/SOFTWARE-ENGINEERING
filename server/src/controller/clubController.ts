import { Response, NextFunction } from 'express';
import { ClubService } from '../services/clubService';
import { AuthRequest } from '../types/authRequest';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../utils/constants';
import { z } from 'zod';

// Simple validation function
function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

const clubService = new ClubService();

// Validation schemas
const createClubSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  category: z.enum(['technical', 'cultural', 'sports', 'academic', 'social', 'entrepreneurship', 'volunteer']),
  contactEmail: z.string().email().optional(),
  logoUrl: z.string().url().optional(),
  coverImageUrl: z.string().url().optional()
});

const updateClubSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  category: z.enum(['technical', 'cultural', 'sports', 'academic', 'social', 'entrepreneurship', 'volunteer']).optional(),
  contactEmail: z.string().email().optional(),
  logoUrl: z.string().url().optional(),
  coverImageUrl: z.string().url().optional(),
  isActive: z.boolean().optional()
});

const clubFiltersSchema = z.object({
  category: z.enum(['technical', 'cultural', 'sports', 'academic', 'social', 'entrepreneurship', 'volunteer']).optional(),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  minMembers: z.number().int().min(0).optional(),
  maxMembers: z.number().int().min(1).optional(),
  hasUpcomingEvents: z.boolean().optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional()
});

const memberFiltersSchema = z.object({
  role: z.enum(['member', 'coordinator', 'admin']).optional(),
  search: z.string().optional(),
  department: z.string().optional(),
  yearOfStudy: z.number().int().min(1).max(6).optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional()
});

const joinClubSchema = z.object

export const clubController = new ClubController();
