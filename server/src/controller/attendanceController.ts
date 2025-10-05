import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../types/authRequest';
import { attendanceService } from '../services/attendanceService';
import { eventService } from '../services/eventService';
import { catchAsync, AppError } from '../middleware/errorHandler';
import { 
  HTTP_STATUS, 
  SUCCESS_MESSAGES, 
  ERROR_MESSAGES,
  API_RESPONSE_FORMAT,
  ATTENDANCE_METHODS,
  REGISTRATION_STATUS 
} from '../utils/constants';

// Validation schemas
const bulkAttendanceSchema = z.object({
  userIds: z.array(z.string().uuid()),
  attended: z.boolean(),
  notes: z.string().optional()
});

const individualAttendanceSchema = z.object({
  userId: z.string().uuid(),
  attended: z.boolean(),
  checkInTime: z.string().datetime().optional(),
  checkOutTime: z.string().datetime().optional(),
  notes: z.string().optional(),
  method: z.enum(['manual', 'qr_code', 'geofence', 'biometric']).default('manual')
});

const qrAttendanceSchema = z.object({
  qrData: z.string(),
  location: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional()
  }).optional()
});

const attendanceReportSchema = z.object({
  format: z.enum(['json', 'csv', 'pdf']).default('json'),
  includeNotes: z.boolean().default(true),
  includeTimestamps: z.boolean().default(true)
});

export class AttendanceController {
  // Mark bulk attendance for an event
  public markBulkAttendance = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const eventId = req.params.eventId;
    const { userIds, attended, notes } = bulkAttendanceSchema.parse(req.body);
    const markedBy = req.user!.id;

    // Verify user has permission to mark attendance for this event
    const event = await eventService.getEventById(eventId);
    if (!event) {
      return next(new AppError(ERROR_MESSAGES.EVENT_NOT_FOUND, HTTP_STATUS.NOT_FOUND));
    }

    // Check if user is club admin or event creator
    const hasPermission = await attendanceService.checkAttendancePermission(markedBy, eventId);
    if (!hasPermission) {
      return next(new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN));
    }

    const result = await attendanceService.bulkUpdateAttendance(
      eventId,
      {
        userIds,
        attended,
        markedBy,
        method: 'manual',
        notes
      }
    );

    res.status(HTTP_STATUS.OK).json(
      API_RESPONSE_FORMAT.SUCCESS(result, SUCCESS_MESSAGES.ATTENDANCE_MARKED)
    );
  });

  // Mark individual attendance
  public markIndividualAttendance = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const eventId = req.params.eventId;
    const attendanceData = individualAttendanceSchema.parse(req.body);
    const markedBy = req.user!.id;

    // Verify permissions
    const hasPermission = await attendanceService.checkAttendancePermission(markedBy, eventId);
    if (!hasPermission) {
      return next(new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN));
    }

    const result = await attendanceService.markIndividualAttendance(
      eventId,
      attendanceData.userId,
      attendanceData.attended,
      markedBy,
      {
        method: attendanceData.method,
        checkInTime: attendanceData.checkInTime ? new Date(attendanceData.checkInTime) : undefined,
        checkOutTime: attendanceData.checkOutTime ? new Date(attendanceData.checkOutTime) : undefined,
        notes: attendanceData.notes
      }
    );

    res.status(HTTP_STATUS.OK).json(
      API_RESPONSE_FORMAT.SUCCESS(result, SUCCESS_MESSAGES.ATTENDANCE_MARKED)
    );
  });

  // Get attendance for an event
  public getEventAttendance = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const eventId = req.params.eventId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const sortBy = req.query.sortBy as string || 'registrationDate';
    const sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'desc';

    // Verify user has permission to view attendance
    const hasPermission = await attendanceService.checkAttendancePermission(req.user!.id, eventId);
    if (!hasPermission) {
      return next(new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN));
    }

    const result = await attendanceService.getEventAttendance(eventId, {
      page,
      limit,
      search,
      status,
      sortBy,
      sortOrder
    });

    res.status(HTTP_STATUS.OK).json(
      API_RESPONSE_FORMAT.PAGINATION(
        result.registrations,
        page,
        limit,
        result.total
      )
    );
  });

  // Get attendance statistics for an event
  public getAttendanceStats = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const eventId = req.params.eventId;

    // Verify permissions
    const hasPermission = await attendanceService.checkAttendancePermission(req.user!.id, eventId);
    if (!hasPermission) {
      return next(new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN));
    }

    const stats = await attendanceService.getAttendanceStatistics(eventId);

    res.status(HTTP_STATUS.OK).json(
      API_RESPONSE_FORMAT.SUCCESS(stats)
    );
  });

  // Mark attendance via QR code scan
  public markQRAttendance = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { qrData, location } = qrAttendanceSchema.parse(req.body);
    const userId = req.user!.id;

    const result = await attendanceService.markAttendanceByQR(userId, qrData);

    res.status(HTTP_STATUS.OK).json(
      API_RESPONSE_FORMAT.SUCCESS(result, 'Attendance marked successfully via QR code')
    );
  });

  // Get attendance logs for an event (audit trail)
  public getAttendanceLogs = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const eventId = req.params.eventId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const userId = req.query.userId as string;

    // Verify permissions (only super admin or club admin can view logs)
    const hasPermission = await attendanceService.checkAttendancePermission(req.user!.id, eventId);
    if (!hasPermission) {
      return next(new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN));
    }

    const result = await attendanceService.getAttendanceLogs(eventId, {
      page,
      limit,
      userId
    });

    res.status(HTTP_STATUS.OK).json(
      API_RESPONSE_FORMAT.PAGINATION(
        result.logs,
        page,
        limit,
        result.total
      )
    );
  });

  // Update attendance status
  public updateAttendanceStatus = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const eventId = req.params.eventId;
    const userId = req.params.userId;
    const { attended, notes, reason } = req.body;
    const markedBy = req.user!.id;

    // Verify permissions
    const hasPermission = await attendanceService.checkAttendancePermission(markedBy, eventId);
    if (!hasPermission) {
      return next(new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN));
    }

    const result = await attendanceService.updateAttendanceStatus(
      eventId,
      userId,
      attended,
      markedBy,
      { notes, reason }
    );

    res.status(HTTP_STATUS.OK).json(
      API_RESPONSE_FORMAT.SUCCESS(result, 'Attendance status updated successfully')
    );
  });

  // Generate attendance report
  public generateAttendanceReport = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const eventId = req.params.eventId;
    const options = attendanceReportSchema.parse(req.query);

    // Verify permissions
    const hasPermission = await attendanceService.checkAttendancePermission(req.user!.id, eventId);
    if (!hasPermission) {
      return next(new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN));
    }

    const report = await attendanceService.generateAttendanceReport(eventId, options);

    if (options.format === 'json') {
      res.status(HTTP_STATUS.OK).json(
        API_RESPONSE_FORMAT.SUCCESS(report)
      );
    } else {
      // Set appropriate headers for file download
      const filename = `attendance-report-${eventId}-${Date.now()}.${options.format}`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 
        options.format === 'csv' ? 'text/csv' : 'application/pdf'
      );
      res.send(report);
    }
  });

  // Check-in user manually
  public checkInUser = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const eventId = req.params.eventId;
    const userId = req.params.userId;
    const markedBy = req.user!.id;
    const { notes } = req.body;

    // Verify permissions
    const hasPermission = await attendanceService.checkAttendancePermission(markedBy, eventId);
    if (!hasPermission) {
      return next(new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN));
    }

    const result = await attendanceService.checkInUser(eventId, userId, markedBy, notes);

    res.status(HTTP_STATUS.OK).json(
      API_RESPONSE_FORMAT.SUCCESS(result, 'User checked in successfully')
    );
  });

  // Check-out user manually
  public checkOutUser = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const eventId = req.params.eventId;
    const userId = req.params.userId;
    const markedBy = req.user!.id;
    const { notes } = req.body;

    // Verify permissions
    const hasPermission = await attendanceService.checkAttendancePermission(markedBy, eventId);
    if (!hasPermission) {
      return next(new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN));
    }

    const result = await attendanceService.checkOutUser(eventId, userId, markedBy, notes);

    res.status(HTTP_STATUS.OK).json(
      API_RESPONSE_FORMAT.SUCCESS(result, 'User checked out successfully')
    );
  });

  // Get user's attendance history
  public getUserAttendanceHistory = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.params.userId || req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const clubId = req.query.clubId as string;
    const eventType = req.query.eventType as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    // Users can only view their own history unless they're admin
    if (userId !== req.user!.id && req.user!.role !== 'super_admin') {
      return next(new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN));
    }

    const result = await attendanceService.getUserAttendanceHistory(userId, {
      page,
      limit,
      clubId,
      eventType,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined
    });

    res.status(HTTP_STATUS.OK).json(
      API_RESPONSE_FORMAT.PAGINATION(
        result.attendance,
        page,
        limit,
        result.total
      )
    );
  });

  // Export attendance data
  public exportAttendanceData = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const eventId = req.params.eventId;
    const format = req.query.format as 'csv' | 'excel' || 'csv';

    // Verify permissions
    const hasPermission = await attendanceService.checkAttendancePermission(req.user!.id, eventId);
    if (!hasPermission) {
      return next(new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN));
    }

    const exportData = await attendanceService.exportAttendanceData(eventId, format);

    const filename = `attendance-${eventId}-${Date.now()}.${format}`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 
      format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.send(exportData);
  });

  // Validate QR code (for testing purposes)
  public validateQRCode = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { qrData } = req.body;

    const validation = await attendanceService.validateQRCode(qrData);

    res.status(HTTP_STATUS.OK).json(
      API_RESPONSE_FORMAT.SUCCESS(validation)
    );
  });
}

export const attendanceController = new AttendanceController();