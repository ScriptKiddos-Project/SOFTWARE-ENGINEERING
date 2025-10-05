import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants';

const prisma = new PrismaClient();

interface AttendanceData {
  attended: boolean;
  markedBy: string;
  method: 'manual' | 'qr_code' | 'geofence' | 'biometric';
  notes?: string;
  checkInTime?: Date;
  checkOutTime?: Date;
}

interface BulkAttendanceData {
  userIds: string[];
  attended: boolean;
  markedBy: string;
  method: 'manual' | 'qr_code' | 'geofence' | 'biometric';
  notes?: string;
  checkInTime?: Date;
  checkOutTime?: Date;
}

interface AttendanceHistoryOptions {
  page: number;
  limit: number;
  clubId?: string;
  eventType?: string;
  startDate?: Date;
  endDate?: Date;
}

interface EventAttendanceOptions {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

class AttendanceService {
  // Check if user has permission to mark attendance
  async checkAttendancePermission(userId: string, eventId: string): Promise<boolean> {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { 
        club: { 
          include: { 
            userClubs: true 
          } 
        } 
      }
    });

    if (!event) return false;

    // Check if user is event creator
    if (event.createdBy === userId) return true;

    // Check if user is club admin (president or vice_president)
    const userClubRole = event.club.userClubs.find(
      uc => uc.userId === userId && ['president', 'vice_president'].includes(uc.role)
    );
    
    if (userClubRole) return true;

    // Check if user is super admin
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user?.role === 'super_admin';
  }

  // Mark individual attendance
  async markAttendance(
    eventId: string,
    userId: string,
    data: AttendanceData
  ) {
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new AppError(ERROR_MESSAGES.EVENT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const registration = await prisma.eventRegistration.findUnique({
      where: {
        userId_eventId: {
          userId: userId,
          eventId: eventId
        }
      }
    });

    if (!registration) {
      throw new AppError('User is not registered for this event', HTTP_STATUS.BAD_REQUEST);
    }

    const previousStatus = registration.attended;

    const updatedRegistration = await prisma.eventRegistration.update({
      where: {
        userId_eventId: {
          userId: userId,
          eventId: eventId
        }
      },
      data: {
        attended: data.attended,
        attendanceMarkedBy: data.markedBy,
        attendanceMarkedAt: new Date(),
        attendanceMethod: data.method,
        checkInTime: data.checkInTime || registration.checkInTime,
        checkOutTime: data.checkOutTime || registration.checkOutTime,
        notes: data.notes,
        status: data.attended ? 'attended' : 'no_show',
        pointsAwarded: data.attended ? event.pointsReward : 0,
        volunteerHoursAwarded: data.attended ? event.volunteerHours : 0
      }
    });

    // Update user's total points and hours
    if (data.attended && !previousStatus) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          totalPoints: { increment: event.pointsReward },
          totalVolunteerHours: { increment: Number(event.volunteerHours) }
        }
      });
    } else if (!data.attended && previousStatus) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          totalPoints: { decrement: event.pointsReward },
          totalVolunteerHours: { decrement: Number(event.volunteerHours) }
        }
      });
    }

    // Log the attendance action
    await prisma.attendanceLog.create({
      data: {
        eventId: eventId,
        userId: userId,
        markedBy: data.markedBy,
        action: data.attended ? 'marked_present' : 'marked_absent',
        previousStatus: previousStatus,
        newStatus: data.attended,
        reason: data.notes
      }
    });

    return updatedRegistration;
  }

  // Bulk attendance update
  async bulkUpdateAttendance(
    eventId: string,
    data: BulkAttendanceData
  ) {
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new AppError(ERROR_MESSAGES.EVENT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const results = {
      success: [] as string[],
      failed: [] as { userId: string; reason: string }[]
    };

    for (const userId of data.userIds) {
      try {
        await this.markAttendance(eventId, userId, {
          attended: data.attended,
          markedBy: data.markedBy,
          method: data.method,
          notes: data.notes,
          checkInTime: data.checkInTime,
          checkOutTime: data.checkOutTime
        });
        results.success.push(userId);
      } catch (error) {
        results.failed.push({
          userId,
          reason: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  // Get event attendance with pagination
  async getEventAttendance(eventId: string, options: EventAttendanceOptions) {
    const { page, limit, search, status, sortBy, sortOrder } = options;
    const skip = (page - 1) * limit;

    const where: any = { eventId };

    if (search) {
      where.user = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    if (status) {
      where.status = status;
    }

    const [registrations, total] = await Promise.all([
      prisma.eventRegistration.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              studentId: true,
              department: true,
              yearOfStudy: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.eventRegistration.count({ where })
    ]);

    return { registrations, total };
  }

  // Get attendance statistics
  async getAttendanceStatistics(eventId: string) {
    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId }
    });

    const total = registrations.length;
    const attended = registrations.filter(r => r.attended).length;
    const absent = total - attended;
    const attendanceRate = total > 0 ? ((attended / total) * 100).toFixed(2) : '0.00';

    const totalPointsAwarded = registrations.reduce(
      (sum, r) => sum + (r.pointsAwarded || 0),
      0
    );

    const totalHoursAwarded = registrations.reduce(
      (sum, r) => sum + Number(r.volunteerHoursAwarded || 0),
      0
    );

    return {
      total_registered: total,
      total_attended: attended,
      total_absent: absent,
      attendance_rate: parseFloat(attendanceRate),
      total_points_awarded: totalPointsAwarded,
      total_volunteer_hours_awarded: totalHoursAwarded
    };
  }

  // Get attendance logs
  async getAttendanceLogs(eventId: string, options: { page: number; limit: number; userId?: string }) {
    const { page, limit, userId } = options;
    const skip = (page - 1) * limit;

    const where: any = { eventId };
    if (userId) {
      where.userId = userId;
    }

    const [logs, total] = await Promise.all([
      prisma.attendanceLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          markedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.attendanceLog.count({ where })
    ]);

    return { logs, total };
  }

  // Generate attendance report
  async generateAttendanceReport(eventId: string, options: any) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        club: true,
        eventRegistrations: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                studentId: true,
                department: true,
                yearOfStudy: true
              }
            }
          }
        }
      }
    });

    if (!event) {
      throw new AppError(ERROR_MESSAGES.EVENT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return {
      event: {
        id: event.id,
        title: event.title,
        date: event.startDate,
        club: event.club.name
      },
      statistics: await this.getAttendanceStatistics(eventId),
      registrations: event.eventRegistrations.map(reg => ({
        user: reg.user,
        registration_date: reg.registrationDate,
        attended: reg.attended,
        status: reg.status,
        check_in_time: reg.checkInTime,
        check_out_time: reg.checkOutTime,
        points_awarded: reg.pointsAwarded,
        volunteer_hours_awarded: reg.volunteerHoursAwarded,
        notes: reg.notes
      }))
    };
  }

  // Mark attendance via QR code
  async markAttendanceByQR(qrCodeData: string, userId: string) {
    const qrCode = await prisma.eventQRCode.findFirst({
      where: {
        qrCodeData: qrCodeData,
        isActive: true,
        validFrom: { lte: new Date() },
        validUntil: { gte: new Date() }
      }
    });

    if (!qrCode) {
      throw new AppError('Invalid or expired QR code', HTTP_STATUS.BAD_REQUEST);
    }

    if (qrCode.maxScans && qrCode.currentScans >= qrCode.maxScans) {
      throw new AppError('QR code scan limit reached', HTTP_STATUS.BAD_REQUEST);
    }

    const result = await this.markAttendance(qrCode.eventId, userId, {
      attended: true,
      markedBy: userId,
      method: 'qr_code',
      checkInTime: new Date(),
      notes: 'Marked via QR code scan'
    });

    await prisma.eventQRCode.update({
      where: { id: qrCode.id },
      data: { currentScans: { increment: 1 } }
    });

    return result;
  }

  // Validate QR code
  async validateQRCodePublic(qrCodeData: string) {
    const qrCode = await prisma.eventQRCode.findFirst({
      where: {
        qrCodeData: qrCodeData,
        isActive: true
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true
          }
        }
      }
    });

    if (!qrCode) {
      return { isValid: false, message: 'QR code not found' };
    }

    const now = new Date();
    if (now < qrCode.validFrom || now > qrCode.validUntil) {
      return { isValid: false, message: 'QR code has expired' };
    }

    if (qrCode.maxScans && qrCode.currentScans >= qrCode.maxScans) {
      return { isValid: false, message: 'QR code scan limit reached' };
    }

    return {
      isValid: true,
      message: 'QR code is valid',
      event: qrCode.event
    };
  }

  // Get user attendance history
  async getUserAttendanceHistory(userId: string, options: AttendanceHistoryOptions) {
    const { page, limit, clubId, eventType, startDate, endDate } = options;
    const skip = (page - 1) * limit;

    const where: any = {
      userId: userId,
      attended: true
    };

    if (clubId || eventType || startDate || endDate) {
      where.event = {};
      if (clubId) where.event.clubId = clubId;
      if (eventType) where.event.eventType = eventType;
      if (startDate || endDate) {
        where.event.startDate = {};
        if (startDate) where.event.startDate.gte = startDate;
        if (endDate) where.event.startDate.lte = endDate;
      }
    }

    const [attendance, total] = await Promise.all([
      prisma.eventRegistration.findMany({
        where,
        include: {
          event: {
            include: {
              club: {
                select: {
                  id: true,
                  name: true,
                  category: true
                }
              }
            }
          }
        },
        orderBy: { attendanceMarkedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.eventRegistration.count({ where })
    ]);

    return { attendance, total };
  }

  // Export attendance data
  async exportAttendanceData(eventId: string, format: 'csv' | 'excel') {
    const report = await this.generateAttendanceReport(eventId, {});
    
    if (format === 'csv') {
      // Generate CSV
      const headers = ['Student ID', 'Name', 'Email', 'Department', 'Year', 'Attended', 'Check In', 'Check Out', 'Points', 'Hours'];
      const rows = report.registrations.map((reg: any) => [
        reg.user.studentId || '',
        `${reg.user.firstName} ${reg.user.lastName}`,
        reg.user.email,
        reg.user.department || '',
        reg.user.yearOfStudy || '',
        reg.attended ? 'Yes' : 'No',
        reg.check_in_time || '',
        reg.check_out_time || '',
        reg.points_awarded || 0,
        reg.volunteer_hours_awarded || 0
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    return report;
  }

  // Check in user
  async checkInUser(eventId: string, userId: string, markedBy: string, notes?: string) {
    return this.markAttendance(eventId, userId, {
      attended: true,
      markedBy,
      method: 'manual',
      checkInTime: new Date(),
      notes: notes || 'Manual check-in'
    });
  }

  // Check out user
  async checkOutUser(eventId: string, userId: string, markedBy: string, notes?: string) {
    const registration = await prisma.eventRegistration.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId
        }
      }
    });

    if (!registration || !registration.attended || !registration.checkInTime) {
      throw new AppError('User must be checked in before checking out', HTTP_STATUS.BAD_REQUEST);
    }

    return this.markAttendance(eventId, userId, {
      attended: true,
      markedBy,
      method: 'manual',
      checkInTime: registration.checkInTime,
      checkOutTime: new Date(),
      notes: notes || 'Manual check-out'
    });
  }

  // Mark individual attendance (alternative signature for controller)
async markIndividualAttendance(
  eventId: string,
  userId: string,
  attended: boolean,
  markedBy: string,
  options: {
    method: 'manual' | 'qr_code' | 'geofence' | 'biometric';
    checkInTime?: Date;
    checkOutTime?: Date;
    notes?: string;
  }
) {
  return this.markAttendance(eventId, userId, {
    attended,
    markedBy,
    method: options.method,
    checkInTime: options.checkInTime,
    checkOutTime: options.checkOutTime,
    notes: options.notes
  });
}

  // Update attendance status
  async updateAttendanceStatus(
    eventId: string,
    userId: string,
    attended: boolean,
    markedBy: string,
    options: { notes?: string; reason?: string }
  ) {
    return this.markAttendance(eventId, userId, {
      attended,
      markedBy,
      method: 'manual',
      notes: options.notes || options.reason
    });
  }

  // Validate QR code (alias for controller compatibility)
  async validateQRCode(qrData: string) {
    return this.validateQRCodePublic(qrData);
  }
}

export const attendanceService = new AttendanceService();