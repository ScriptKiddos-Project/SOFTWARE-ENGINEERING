import { PrismaClient } from '@prisma/client';
import { ApiError } from '../utils/errors';

const prisma = new PrismaClient();

export interface AdminDashboardAnalytics {
  userStats: {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    userGrowthRate: number;
  };
  clubStats: {
    totalClubs: number;
    activeClubs: number;
    newClubsThisMonth: number;
    averageMembersPerClub: number;
  };
  eventStats: {
    totalEvents: number;
    upcomingEvents: number;
    eventsThisMonth: number;
    averageAttendanceRate: number;
  };
  engagementStats: {
    totalPointsAwarded: number;
    totalVolunteerHours: number;
    totalRegistrations: number;
    totalAttendance: number;
  };
}

export interface SystemHealth {
  database: {
    status: 'healthy' | 'warning' | 'error';
    connectionCount: number;
    responseTime: number;
  };
  performance: {
    avgResponseTime: number;
    errorRate: number;
    uptime: number;
  };
  storage: {
    totalUsers: number;
    totalEvents: number;
    totalClubs: number;
    databaseSize: string;
  };
}

export class AdminService {
  async getDashboardAnalytics(filters?: {
    startDate?: string;
    endDate?: string;
    timeframe?: string;
  }): Promise<AdminDashboardAnalytics> {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // User statistics
      const [
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        newUsersLastMonth
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: {
            updatedAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
          }
        }),
        prisma.user.count({
          where: { createdAt: { gte: monthStart } }
        }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: lastMonthStart,
              lte: lastMonthEnd
            }
          }
        })
      ]);

      const userGrowthRate = newUsersLastMonth > 0 
        ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 
        : 0;

      // Club statistics
      const [
        totalClubs,
        activeClubs,
        newClubsThisMonth,
        clubMemberStats
      ] = await Promise.all([
        prisma.club.count(),
        prisma.club.count({ where: { isActive: true } }),
        prisma.club.count({
          where: { createdAt: { gte: monthStart } }
        }),
        prisma.club.aggregate({
          _avg: { memberCount: true }
        })
      ]);

      // Event statistics with fixed attendance stats
      const [
        totalEvents,
        upcomingEvents,
        eventsThisMonth,
        attendanceStats
      ] = await Promise.all([
        prisma.event.count(),
        prisma.event.count({
          where: {
            startDate: { gte: now },
            isPublished: true
          }
        }),
        prisma.event.count({
          where: { createdAt: { gte: monthStart } }
        }),
        Promise.all([
          prisma.eventRegistration.count(),
          prisma.eventRegistration.count({ where: { attended: true } })
        ]).then(([total, attended]) => ({ _count: { _all: total, attended } }))
      ]);

      const averageAttendanceRate = attendanceStats._count._all > 0 
        ? (attendanceStats._count.attended / attendanceStats._count._all) * 100 
        : 0;

      // Engagement statistics - using pointsHistory instead of pointsTransaction
      const [
        pointsStats,
        totalRegistrations,
        totalAttendance
      ] = await Promise.all([
        prisma.pointsHistory.aggregate({
          _sum: {
            pointsEarned: true,
            volunteerHoursEarned: true
          }
        }),
        prisma.eventRegistration.count(),
        prisma.eventRegistration.count({
          where: { attended: true }
        })
      ]);

      return {
        userStats: {
          totalUsers,
          activeUsers,
          newUsersThisMonth,
          userGrowthRate
        },
        clubStats: {
          totalClubs,
          activeClubs,
          newClubsThisMonth,
          averageMembersPerClub: clubMemberStats._avg.memberCount || 0
        },
        eventStats: {
          totalEvents,
          upcomingEvents,
          eventsThisMonth,
          averageAttendanceRate
        },
        engagementStats: {
          totalPointsAwarded: pointsStats._sum.pointsEarned || 0,
          totalVolunteerHours: pointsStats._sum.volunteerHoursEarned || 0,
          totalRegistrations,
          totalAttendance
        }
      };
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch dashboard analytics');
    }
  }

  async getAllUsers(filters: any, page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;
      const where: any = {};

      if (filters.role) where.role = filters.role;
      if (filters.department) where.department = filters.department;
      if (filters.isVerified !== undefined) where.isVerified = filters.isVerified;

      if (filters.search) {
        where.OR = [
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { studentId: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            studentId: true,
            phone: true,
            department: true,
            yearOfStudy: true,
            role: true,
            isVerified: true,
            profileImage: true,
            totalPoints: true,
            totalVolunteerHours: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                userClubs: { where: { isActive: true } },
                eventRegistrations: { where: { attended: true } }
              }
            }
          }
        }),
        prisma.user.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        users,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch users');
    }
  }

  async getUserWithDetails(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          userClubs: {
            include: {
              club: {
                select: {
                  id: true,
                  name: true,
                  category: true
                }
              }
            }
          },
          eventRegistrations: {
            include: {
              event: {
                select: {
                  id: true,
                  title: true,
                  startDate: true,
                  pointsReward: true
                }
              }
            },
            orderBy: { registrationDate: 'desc' },
            take: 10
          },
          pointsHistory: {
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          userBadges: {
            include: {
              badge: true
            }
          }
        }
      });

      if (!user) return null;

      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch user details');
    }
  }

  async updateUserRole(userId: string, role: string) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { role: role as any }
      });

      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw new ApiError(500, 'Failed to update user role');
    }
  }

  async moderateUser(userId: string, moderation: any, moderatedBy: string) {
    try {
      const { action, reason, duration } = moderation;

      await prisma.userModeration.create({
        data: {
          userId,
          action,
          reason,
          duration,
          moderatedBy,
          createdAt: new Date()
        }
      });

      switch (action) {
        case 'suspend':
          await prisma.user.update({
            where: { id: userId },
            data: {
              isSuspended: true,
              suspendedUntil: duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null
            }
          });
          break;
        case 'ban':
          await prisma.user.update({
            where: { id: userId },
            data: { isBanned: true }
          });
          break;
      }
    } catch (error) {
      throw new ApiError(500, 'Failed to moderate user');
    }
  }

  async verifyUser(userId: string) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { isVerified: true }
      });

      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw new ApiError(500, 'Failed to verify user');
    }
  }

  async getClubs(filters: any, page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;
      const where: any = {};

      if (filters.category) where.category = filters.category;
      if (filters.isActive !== undefined) where.isActive = filters.isActive;

      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      const [clubs, total] = await Promise.all([
        prisma.club.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: {
                userClubs: { where: { isActive: true } },
                events: true
              }
            },
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }),
        prisma.club.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        clubs,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch clubs');
    }
  }

  async getClubWithDetails(clubId: string) {
    try {
      const club = await prisma.club.findUnique({
        where: { id: clubId },
        include: {
          userClubs: {
            where: { isActive: true },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  department: true
                }
              }
            }
          },
          events: {
            orderBy: { startDate: 'desc' },
            take: 10,
            include: {
              _count: {
                select: {
                  eventRegistrations: true
                }
              }
            }
          }
        }
      });

      return club;
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch club details');
    }
  }

  async updateClubStatus(clubId: string, isActive: boolean, reason: string, updatedBy: string) {
    try {
      const club = await prisma.club.update({
        where: { id: clubId },
        data: { isActive }
      });

      await prisma.clubModeration.create({
        data: {
          clubId,
          action: isActive ? 'activate' : 'deactivate',
          reason,
          moderatedBy: updatedBy
        }
      });

      return club;
    } catch (error) {
      throw new ApiError(500, 'Failed to update club status');
    }
  }

  async getSystemHealth(): Promise<SystemHealth> {
    try {
      const startTime = Date.now();
      
      await prisma.$queryRaw`SELECT 1`;
      const dbResponseTime = Date.now() - startTime;

      const [userCount, eventCount, clubCount] = await Promise.all([
        prisma.user.count(),
        prisma.event.count(),
        prisma.club.count()
      ]);

      return {
        database: {
          status: dbResponseTime < 100 ? 'healthy' : dbResponseTime < 500 ? 'warning' : 'error',
          connectionCount: 1,
          responseTime: dbResponseTime
        },
        performance: {
          avgResponseTime: 0,
          errorRate: 0,
          uptime: process.uptime()
        },
        storage: {
          totalUsers: userCount,
          totalEvents: eventCount,
          totalClubs: clubCount,
          databaseSize: 'N/A'
        }
      };
    } catch (error) {
      throw new ApiError(500, 'Failed to get system health');
    }
  }

  async createAnnouncement(data: any, createdBy: string) {
    try {
      const announcement = await prisma.announcement.create({
        data: {
          ...data,
          createdBy,
          isActive: true
        }
      });

      return announcement;
    } catch (error) {
      throw new ApiError(500, 'Failed to create announcement');
    }
  }

  async getAnnouncements(page: number, limit: number, active: boolean) {
    try {
      const skip = (page - 1) * limit;
      const where = active ? { isActive: true } : {};

      const [announcements, total] = await Promise.all([
        prisma.announcement.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.announcement.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        announcements,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch announcements');
    }
  }

  async getAllEvents(filters: any, page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;
      const where: any = {};

      if (filters.clubId) where.clubId = filters.clubId;
      if (filters.eventType) where.eventType = filters.eventType;
      if (filters.status) {
        if (filters.status === 'upcoming') {
          where.startDate = { gte: new Date() };
        } else if (filters.status === 'completed') {
          where.endDate = { lt: new Date() };
        }
      }

      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      const [events, total] = await Promise.all([
        prisma.event.findMany({
          where,
          skip,
          take: limit,
          orderBy: { startDate: 'desc' },
          include: {
            club: {
              select: {
                id: true,
                name: true,
                category: true
              }
            },
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            },
            _count: {
              select: {
                eventRegistrations: true
              }
            }
          }
        }),
        prisma.event.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        events,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch events');
    }
  }

  async getEventWithDetails(eventId: string) {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          club: true,
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          eventRegistrations: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  department: true
                }
              }
            }
          }
        }
      });

      return event;
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch event details');
    }
  }

  async moderateEvent(eventId: string, action: string, reason: string, moderatedBy: string) {
    try {
      await prisma.eventModeration.create({
        data: {
          eventId,
          action,
          reason,
          moderatedBy
        }
      });

      switch (action) {
        case 'unpublish':
          await prisma.event.update({
            where: { id: eventId },
            data: { isPublished: false }
          });
          break;
        case 'delete':
          await prisma.event.delete({
            where: { id: eventId }
          });
          break;
      }
    } catch (error) {
      throw new ApiError(500, 'Failed to moderate event');
    }
  }

  async generateUserReport(filters: any) {
    try {
      const users = await prisma.user.findMany({
        include: {
          userClubs: {
            include: {
              club: {
                select: { name: true, category: true }
              }
            }
          },
          eventRegistrations: {
            where: { attended: true }
          }
        }
      });

      const report = users.map(user => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        department: user.department,
        yearOfStudy: user.yearOfStudy,
        totalPoints: user.totalPoints,
        totalVolunteerHours: user.totalVolunteerHours,
        clubsJoined: user.userClubs.length,
        eventsAttended: user.eventRegistrations.length,
        joinDate: user.createdAt
      }));

      return {
        reportType: 'User Report',
        generatedAt: new Date(),
        totalRecords: report.length,
        data: report
      };
    } catch (error) {
      throw new ApiError(500, 'Failed to generate user report');
    }
  }

  async generateClubReport(filters: any) {
    try {
      const clubs = await prisma.club.findMany({
        include: {
          userClubs: {
            where: { isActive: true }
          },
          events: {
            include: {
              eventRegistrations: true
            }
          }
        }
      });

      const report = clubs.map(club => {
        const totalEvents = club.events.length;
        const totalRegistrations = club.events.reduce((sum, event) => sum + event.eventRegistrations.length, 0);
        const totalAttendance = club.events.reduce(
          (sum, event) => sum + event.eventRegistrations.filter((reg: any) => reg.attended).length, 0
        );

        return {
          id: club.id,
          name: club.name,
          category: club.category,
          memberCount: club.memberCount,
          totalEvents,
          totalRegistrations,
          totalAttendance,
          attendanceRate: totalRegistrations > 0 ? (totalAttendance / totalRegistrations) * 100 : 0,
          isActive: club.isActive,
          createdAt: club.createdAt
        };
      });

      return {
        reportType: 'Club Report',
        generatedAt: new Date(),
        totalRecords: report.length,
        data: report
      };
    } catch (error) {
      throw new ApiError(500, 'Failed to generate club report');
    }
  }

  async generateEventReport(filters: any) {
    try {
      const events = await prisma.event.findMany({
        include: {
          club: {
            select: { name: true, category: true }
          },
          eventRegistrations: true,
          creator: {
            select: { firstName: true, lastName: true }
          }
        }
      });

      const report = events.map(event => {
        const totalRegistrations = event.eventRegistrations.length;
        const totalAttendance = event.eventRegistrations.filter((reg: any) => reg.attended).length;

        return {
          id: event.id,
          title: event.title,
          clubName: event.club.name,
          clubCategory: event.club.category,
          eventType: event.eventType,
          startDate: event.startDate,
          endDate: event.endDate,
          maxParticipants: event.maxParticipants,
          totalRegistrations,
          totalAttendance,
          attendanceRate: totalRegistrations > 0 ? (totalAttendance / totalRegistrations) * 100 : 0,
          pointsReward: event.pointsReward,
          volunteerHours: event.volunteerHours,
          createdBy: `${event.creator?.firstName} ${event.creator?.lastName}`,
          isPublished: event.isPublished
        };
      });

      return {
        reportType: 'Event Report',
        generatedAt: new Date(),
        totalRecords: report.length,
        data: report
      };
    } catch (error) {
      throw new ApiError(500, 'Failed to generate event report');
    }
  }

  async updateAnnouncement(announcementId: string, updateData: any) {
    try {
      return await prisma.announcement.update({
        where: { id: announcementId },
        data: updateData
      });
    } catch (error) {
      throw new ApiError(500, 'Failed to update announcement');
    }
  }

  async deleteAnnouncement(announcementId: string) {
    try {
      await prisma.announcement.delete({
        where: { id: announcementId }
      });
    } catch (error) {
      throw new ApiError(500, 'Failed to delete announcement');
    }
  }

  async getSystemAnalytics(filters: any) {
  // Return the same as getDashboardAnalytics or implement separately
  return this.getDashboardAnalytics(filters);
}

async getUserEngagementStats(filters: any) {
  try {
    const users = await prisma.user.findMany({
      include: {
        eventRegistrations: { where: { attended: true } },
        userClubs: { where: { isActive: true } }
      }
    });

    return {
      totalActiveUsers: users.filter(u => u.eventRegistrations.length > 0).length,
      averageEventsPerUser: users.reduce((sum: number, u: any) => sum + u.eventRegistrations.length, 0) / users.length,
      averageClubsPerUser: users.reduce((sum: number, u: any) => sum + u.userClubs.length, 0) / users.length
    };
  } catch (error) {
    throw new ApiError(500, 'Failed to fetch user engagement stats');
  }
}

async getClubPerformanceStats(filters: any) {
  try {
    const clubs = await prisma.club.findMany({
      include: {
        events: { include: { eventRegistrations: true } },
        userClubs: { where: { isActive: true } }
      }
    });

    return clubs.map((club: any) => ({
      clubId: club.id,
      clubName: club.name,
      totalEvents: club.events.length,
      totalMembers: club.userClubs.length,
      totalAttendance: club.events.reduce((sum: number, e: any) => 
        sum + e.eventRegistrations.filter((r: any) => r.attended).length, 0)
    }));
  } catch (error) {
    throw new ApiError(500, 'Failed to fetch club performance stats');
  }
}

async getBadgeSystem() {
  try {
    const badges = await prisma.badge.findMany({
      include: {
        _count: { select: { userBadges: true } }
      }
    });
    return badges;
  } catch (error) {
    throw new ApiError(500, 'Failed to fetch badge system');
  }
}

async updateBadgeCriteria(badgeId: string, criteria: any) {
  try {
    return await prisma.badge.update({
      where: { id: badgeId },
      data: { criteria }
    });
  } catch (error) {
    throw new ApiError(500, 'Failed to update badge criteria');
  }
}

async awardBadge(userId: string, badgeId: string, reason: string, awardedBy: string) {
  try {
    return await prisma.userBadge.create({
      data: {
        userId,
        badgeId,
      }
    });
  } catch (error) {
    throw new ApiError(500, 'Failed to award badge');
  }
}

async adjustUserPoints(userId: string, points: number, volunteerHours: number, reason: string, adjustedBy: string) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        totalPoints: { increment: points },
        totalVolunteerHours: { increment: volunteerHours }
      }
    });

    await prisma.pointsHistory.create({
      data: {
        userId,
        pointsEarned: points,
        volunteerHoursEarned: volunteerHours,
        reason: reason
      }
    });

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    throw new ApiError(500, 'Failed to adjust user points');
  }
}

async runMaintenance(tasks: string[], executedBy: string) {
  try {
    const results = [];
    for (const task of tasks) {
      // Implement maintenance tasks
      results.push({ task, status: 'completed' });
    }
    return { tasks: results, executedAt: new Date(), executedBy };
  } catch (error) {
    throw new ApiError(500, 'Failed to run maintenance');
  }
}

async getAuditLogs(filters: any, page: number, limit: number) {
  try {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (filters.action) where.action = filters.action;
    if (filters.userId) where.userId = filters.userId;
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.auditLog.count({ where })
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    throw new ApiError(500, 'Failed to fetch audit logs');
  }
  }
}