import { Response } from 'express';
import { attendanceService } from '@/services/attendanceService';
import { AuthenticatedRequest } from '@/types';
import { HTTP_STATUS, RESPONSE_MESSAGES } from '@/utils/constants';
import { catchAsync } from '@/middleware/errorHandler';

export class AttendanceController {
  // Mark individual attendance
  markIndividualAttendance = catchAsync(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { eventId, userId } = req.params;
    const { attended, notes, checkInTime, checkOutTime } = req.body;
    
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: RESPONSE_MESSAGES.ERROR.UNAUTHORIZED
      });
      return;
    }

    const result = await attendanceService.markAttendance(eventId, userId, {
      attended,
      markedBy: req.user.id,
      method: 'manual',
      notes,
      checkInTime: checkInTime ? new Date(checkInTime) : undefined,
      checkOutTime: checkOutTime ? new Date(checkOutTime) : undefined
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: RESPONSE_MESSAGES.SUCCESS.ATTENDANCE_MARKED,
      data: result
    });
  });

  // Bulk attendance marking
  markBulkAttendance = catchAsync(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { eventId } = req.params;
    const { userIds, attended, notes } = req.body;

    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: RESPONSE_MESSAGES.ERROR.UNAUTHORIZED
      });
      return;
    }

    const result = await attendanceService.bulkUpdateAttendance(eventId, {
      userIds,
      attended,
      markedBy: req.user.id,
      method: 'manual',
      notes
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Attendance updated for ${result.success.length} users`,
      data: result
    });
  });

  // Get attendance statistics
  getEventAttendance = catchAsync(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { eventId } = req.params;

    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: RESPONSE_MESSAGES.ERROR.UNAUTHORIZED
      });
      return;
    }

    const statistics = await attendanceService.getAttendanceStatistics(eventId, req.user.id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Attendance statistics retrieved',
      data: statistics
    });
  });

  // Check in user
  checkInUser = catchAsync(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { eventId, userId } = req.params;

    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: RESPONSE_MESSAGES.ERROR.UNAUTHORIZED
      });
      return;
    }

    const result = await attendanceService.markAttendance(eventId, userId, {
      attended: true,
      markedBy: req.user.id,
      method: 'manual',
      checkInTime: new Date(),
      notes: 'Manual check-in'
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'User checked in successfully',
      data: result
    });
  });

  // Check out user
  checkOutUser = catchAsync(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { eventId, userId } = req.params;

    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: RESPONSE_MESSAGES.ERROR.UNAUTHORIZED
      });
      return;
    }

    const result = await attendanceService.markAttendance(eventId, userId, {
      attended: true,
      markedBy: req.user.id,
      method: 'manual',
      checkOutTime: new Date(),
      notes: 'Manual check-out'
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'User checked out successfully',
      data: result
    });
  });

  // Get attendance logs
  getAttendanceLogs = catchAsync(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { eventId } = req.params;

    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: RESPONSE_MESSAGES.ERROR.UNAUTHORIZED
      });
      return;
    }

    const logs = await attendanceService.getAttendanceLogs(eventId, req.user.id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Attendance logs retrieved',
      data: logs
    });
  });

  // Generate attendance report
  generateReport = catchAsync(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { eventId } = req.params;

    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: RESPONSE_MESSAGES.ERROR.UNAUTHORIZED
      });
      return;
    }

    const report = await attendanceService.generateAttendanceReport(eventId, req.user.id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Attendance report generated',
      data: report
    });
  });

  // Export attendance data
  exportAttendanceData = catchAsync(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { eventId } = req.params;
    const { format = 'json' } = req.query;

    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: RESPONSE_MESSAGES.ERROR.UNAUTHORIZED
      });
      return;
    }

    const report = await attendanceService.generateAttendanceReport(eventId, req.user.id);

    if (format === 'csv') {
      // Convert to CSV format
      const csv = this.convertToCSV(report);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=attendance-${eventId}.csv`);
      res.send(csv);
    } else {
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Attendance data exported',
        data: report
      });
    }
  });

  // Mark attendance via QR code
  markAttendanceByQR = catchAsync(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { qrCodeData } = req.body;

    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: RESPONSE_MESSAGES.ERROR.UNAUTHORIZED
      });
      return;
    }

    const result = await attendanceService.markAttendanceByQR(qrCodeData, req.user.id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Attendance marked via QR code',
      data: result
    });
  });

  // Get user attendance history
  getUserAttendanceHistory = catchAsync(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: RESPONSE_MESSAGES.ERROR.UNAUTHORIZED
      });
      return;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const history = await attendanceService.getUserAttendanceHistory(
      userId,
      { page: pageNum, limit: limitNum }
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Attendance history retrieved',
      data: history
    });
  });

  // Update attendance status
  updateAttendanceStatus = catchAsync(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { eventId, userId } = req.params;
    const { status, notes } = req.body;

    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: RESPONSE_MESSAGES.ERROR.UNAUTHORIZED
      });
      return;
    }

    const attended = status === 'attended' || status === 'present';

    const result = await attendanceService.markAttendance(eventId, userId, {
      attended,
      markedBy: req.user.id,
      method: 'manual',
      notes
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Attendance status updated',
      data: result
    });
  });

  // Validate QR code
  validateQRCode = catchAsync(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { qrCodeData } = req.body;

    const validation = await attendanceService.validateQRCodePublic(qrCodeData);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: validation.isValid ? 'QR code is valid' : 'QR code is invalid or expired',
      data: validation
    });
  });

  // Helper method to convert report to CSV
  private convertToCSV(report: any): string {
    const headers = [
      'Student ID',
      'Name',
      'Email',
      'Department',
      'Year',
      'Registration Date',
      'Attended',
      'Status',
      'Check In Time',
      'Check Out Time',
      'Points Awarded',
      'Volunteer Hours',
      'Notes'
    ];

    const rows = report.registrations.map((reg: any) => [
      reg.user.student_id || '',
      `${reg.user.first_name} ${reg.user.last_name}`,
      reg.user.email,
      reg.user.department || '',
      reg.user.year_of_study || '',
      new Date(reg.registration_date).toLocaleDateString(),
      reg.attended ? 'Yes' : 'No',
      reg.status,
      reg.check_in_time ? new Date(reg.check_in_time).toLocaleString() : '',
      reg.check_out_time ? new Date(reg.check_out_time).toLocaleString() : '',
      reg.points_awarded || 0,
      reg.volunteer_hours_awarded || 0,
      reg.notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row: any[]) => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }
}