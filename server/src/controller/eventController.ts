import { Request, Response, NextFunction } from 'express';
import { eventService } from '../services/eventService';
import { attendanceService } from '../services/attendanceService';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

// Validation schemas
const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300, 'Title too long'),
  description: z.string().optional(),
  club_id: z.string().uuid('Invalid club ID'),
  event_type: z.enum(['workshop', 'seminar', 'competition', 'social', 'meeting', 'other']),
  start_date: z.string().datetime('Invalid start date'),
  end_date: z.string().datetime('Invalid end date'),
  location: z.string().optional(),
  max_participants: z.number().int().positive().optional(),
  registration_deadline: z.string().datetime().optional(),
  points_reward: z.number().int().min(0).max(100).default(0),
  volunteer_hours: z.number().min(0).max(24).default(0),
  image_url: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  skill_areas: z.array(z.string()).default([]),
  requires_approval: z.boolean().default(false)
});

const updateEventSchema = createEventSchema.partial();

const eventFiltersSchema = z.object({
  club_id: z.string().uuid().optional(),
  category: z.string().optional(),
  event_type: z.string().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  skill_areas: z.array(z.string()).optional(),
  is_published: z.boolean().optional(),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().min(0).default(0)
});

const attendanceUpdateSchema = z.object({
  user_ids: z.array(z.string().uuid()),
  attended: z.boolean(),
  method: z.enum(['manual', 'qr_code', 'geofence', 'biometric']).default('manual'),
  notes: z.string().optional(),
  check_in_time: z.string().datetime().optional(),
  check_out_time: z.string().datetime().optional()
});

export class EventController {
  // Get all events with filtering
  async getAllEvents(req: any, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const filters = eventFiltersSchema.parse(req.query);

      // Convert string dates to Date objects
      const processedFilters = {
        ...filters,
        startDate: filters.start_date ? new Date(filters.start_date) : undefined,
        endDate: filters.end_date ? new Date(filters.end_date) : undefined
      };

      const events = await eventService.getAllEvents(processedFilters);

      res.json({
        success: true,
        data: events,
        pagination: {
          limit: filters.limit,
          offset: filters.offset,
          total: events.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get event by ID
  async getEventById(req: any, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!z.string().uuid().safeParse(id).success) {
        throw new AppError('Invalid event ID', 400);
      }

      const event = await eventService.getEventById(id, userId);

      res.json({
        success: true,
        data: event
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new event
  async createEvent(req: any, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const validatedData = createEventSchema.parse(req.body);

      // Convert string dates to Date objects
      const eventData = {
        title: validatedData.title,
        description: validatedData.description,
        clubId: validatedData.club_id,  // Transform snake_case to camelCase
        eventType: validatedData.event_type,
        startDate: new Date(validatedData.start_date),
        endDate: new Date(validatedData.end_date),
        location: validatedData.location,
        maxParticipants: validatedData.max_participants,
        registrationDeadline: validatedData.registration_deadline 
          ? new Date(validatedData.registration_deadline) 
          : undefined,
        pointsReward: validatedData.points_reward,
        volunteerHours: validatedData.volunteer_hours,
        imageUrl: validatedData.image_url,
        tags: validatedData.tags,
        skillAreas: validatedData.skill_areas,
        requiresApproval: validatedData.requires_approval,
        createdBy: userId
      };

      const event = await eventService.createEvent(eventData);

      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: event
      });
    } catch (error) {
      next(error);
    }
  }

  // Update event
  async updateEvent(req: any, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!z.string().uuid().safeParse(id).success) {
        throw new AppError('Invalid event ID', 400);
      }

      const validatedData = updateEventSchema.parse(req.body);

      // Convert string dates to Date objects if provided
      const updateData: any = { ...validatedData };
      if (validatedData.start_date) {
        updateData.start_date = new Date(validatedData.start_date);
      }
      if (validatedData.end_date) {
        updateData.end_date = new Date(validatedData.end_date);
      }
      if (validatedData.registration_deadline) {
        updateData.registration_deadline = new Date(validatedData.registration_deadline);
      }

      const event = await eventService.updateEvent(id, userId, updateData);

      res.json({
        success: true,
        message: 'Event updated successfully',
        data: event
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete event
  async deleteEvent(req: any, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!z.string().uuid().safeParse(id).success) {
        throw new AppError('Invalid event ID', 400);
      }

      await eventService.deleteEvent(id, userId);

      res.json({
        success: true,
        message: 'Event deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Register for event
  async registerForEvent(req: any, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!z.string().uuid().safeParse(id).success) {
        throw new AppError('Invalid event ID', 400);
      }

      const registration = await eventService.registerForEvent(id, userId);

      res.status(201).json({
        success: true,
        message: 'Successfully registered for event',
        data: registration
      });
    } catch (error) {
      next(error);
    }
  }

  // Unregister from event
  async unregisterFromEvent(req: any, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!z.string().uuid().safeParse(id).success) {
        throw new AppError('Invalid event ID', 400);
      }

      await eventService.unregisterFromEvent(id, userId);

      res.json({
        success: true,
        message: 'Successfully unregistered from event'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get event registrations (for club admins)
  async getEventRegistrations(req: any, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!z.string().uuid().safeParse(id).success) {
        throw new AppError('Invalid event ID', 400);
      }

      const registrations = await eventService.getEventRegistrations(id, userId);

      res.json({
        success: true,
        data: registrations
      });
    } catch (error) {
      next(error);
    }
  }

  // Get calendar events
  async getCalendarEvents(req: any, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      
      const schema = z.object({
        start: z.string().datetime('Invalid start date'),
        end: z.string().datetime('Invalid end date'),
        club_ids: z.array(z.string().uuid()).optional()
      });

      const { start, end, club_ids } = schema.parse(req.query);

      const events = await eventService.getCalendarEvents({
        userId,
        clubIds: club_ids,
        start: new Date(start),
        end: new Date(end)
      });

      res.json({
        success: true,
        data: events
      });
    } catch (error) {
      next(error);
    }
  }

  // Mark individual attendance
  async markAttendance(req: any, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!z.string().uuid().safeParse(id).success) {
        throw new AppError('Invalid event ID', 400);
      }

      const schema = z.object({
        user_id: z.string().uuid('Invalid user ID'),
        attended: z.boolean(),
        method: z.enum(['manual', 'qr_code', 'geofence', 'biometric']).default('manual'),
        notes: z.string().optional(),
        check_in_time: z.string().datetime().optional(),
        check_out_time: z.string().datetime().optional()
      });

      const validatedData = schema.parse(req.body);

      const attendanceData = {
        attended: validatedData.attended,
        markedBy: userId,
        method: validatedData.method,
        notes: validatedData.notes,
        checkInTime: validatedData.check_in_time ? new Date(validatedData.check_in_time) : undefined,
        checkOutTime: validatedData.check_out_time ? new Date(validatedData.check_out_time) : undefined
      };

      const result = await attendanceService.markAttendance(id, validatedData.user_id, attendanceData);

      res.json({
        success: true,
        message: `Attendance marked as ${validatedData.attended ? 'present' : 'absent'}`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Bulk attendance marking
  async bulkUpdateAttendance(req: any, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!z.string().uuid().safeParse(id).success) {
        throw new AppError('Invalid event ID', 400);
      }

      const validatedData = attendanceUpdateSchema.parse(req.body);

      const attendanceData = {
        userIds: validatedData.user_ids,
        attended: validatedData.attended,
        markedBy: userId,
        method: validatedData.method,
        notes: validatedData.notes,
        checkInTime: validatedData.check_in_time ? new Date(validatedData.check_in_time) : undefined,
        checkOutTime: validatedData.check_out_time ? new Date(validatedData.check_out_time) : undefined
      };

      const result = await attendanceService.bulkUpdateAttendance(id, attendanceData);

      res.json({
        success: true,
        message: `Bulk attendance update completed. ${result.success.length} successful, ${result.failed.length} failed.`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Get attendance statistics
  async getAttendanceStatistics(req: any, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!z.string().uuid().safeParse(id).success) {
        throw new AppError('Invalid event ID', 400);
      }

      const statistics = await attendanceService.getAttendanceStatistics(id);

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      next(error);
    }
  }

  // Get attendance logs
  async getAttendanceLogs(req: any, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!z.string().uuid().safeParse(id).success) {
        throw new AppError('Invalid event ID', 400);
      }

      const logs = await attendanceService.getAttendanceLogs(id, userId);

      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      next(error);
    }
  }

  // Generate attendance report
  async generateAttendanceReport(req: any, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!z.string().uuid().safeParse(id).success) {
        throw new AppError('Invalid event ID', 400);
      }

      const report = await attendanceService.generateAttendanceReport(id, userId);

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  // QR code attendance marking
  async markAttendanceByQR(req: any, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const schema = z.object({
        qr_code_data: z.string().min(1, 'QR code data is required')
      });

      const { qr_code_data } = schema.parse(req.body);

      const result = await attendanceService.markAttendanceByQR(qr_code_data, userId);

      res.json({
        success: true,
        message: 'Attendance marked successfully via QR code',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Manual check-in
  async checkInUser(req: any, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!z.string().uuid().safeParse(id).success) {
        throw new AppError('Invalid event ID', 400);
      }

      const schema = z.object({
        user_id: z.string().uuid('Invalid user ID'),
        notes: z.string().optional()
      });

      const { user_id, notes } = schema.parse(req.body);

      const result = await attendanceService.markAttendance(id, user_id, {
        attended: true,
        markedBy: userId,
        method: 'manual',
        checkInTime: new Date(),
        notes: notes || 'Manual check-in by organizer'
      });

      res.json({
        success: true,
        message: 'User checked in successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Manual check-out
  async checkOutUser(req: any, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!z.string().uuid().safeParse(id).success) {
        throw new AppError('Invalid event ID', 400);
      }

      const schema = z.object({
        user_id: z.string().uuid('Invalid user ID'),
        notes: z.string().optional()
      });

      const { user_id, notes } = schema.parse(req.body);

      const registration = await eventService.getEventRegistrations(id, userId);
      const userRegistration = registration.find((r: any) => r.user_id === user_id);

      if (!userRegistration || !userRegistration.attended || !userRegistration.checkInTime) {
        throw new AppError('User must be checked in before checking out', 400);
      }

      const result = await attendanceService.markAttendance(id, user_id, {
        attended: true,
        markedBy: userId,
        method: 'manual',
        checkInTime: userRegistration.checkInTime,
        checkOutTime: new Date(),
        notes: notes || 'Manual check-out by organizer'
      });

      res.json({
        success: true,
        message: 'User checked out successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

export const eventController = new EventController();