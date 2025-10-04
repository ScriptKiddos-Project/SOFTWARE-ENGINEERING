import { PrismaClient } from '@prisma/client';
import { ApiError } from '../utils/errors';

const prisma = new PrismaClient();

export interface PointsTransaction {
  id: string;
  userId: string;
  eventId?: string;
  points: number;
  volunteerHours?: number;
  type: string;
  description: string;
  createdAt: Date;
}

export enum PointsTransactionType {
  EVENT_ATTENDANCE = 'event_attendance',
  BADGE_EARNED = 'badge_earned',
  MANUAL_ADJUSTMENT = 'manual_adjustment',
  BONUS_POINTS = 'bonus_points',
  PENALTY = 'penalty'
}

export interface PointsSystemConfig {
  eventBasePoints: number;
  volunteerHourMultiplier: number;
  attendanceBonus: number;
  earlyRegistrationBonus: number;
  leadershipBonus: number;
  maxDailyPoints: number;
  pointsExpiryDays?: number;
}

export class PointsService {
  private readonly config: PointsSystemConfig = {
    eventBasePoints: 10,
    volunteerHourMultiplier: 5,
    attendanceBonus: 5,
    earlyRegistrationBonus: 2,
    leadershipBonus: 3,
    maxDailyPoints: 100,
    pointsExpiryDays: undefined
  };

  async calculateEventPoints(eventId: string, userId: string): Promise<{ points: number; volunteerHours: number }> {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          club: true
        }
      });

      if (!event) {
        throw new ApiError(404, 'Event not found');
      }

      const registration = await prisma.eventRegistration.findFirst({
        where: { eventId, userId }
      });

      if (!registration) {
        throw new ApiError(404, 'Event registration not found');
      }

      let points = event.pointsReward || this.config.eventBasePoints;
      const volunteerHours = event.volunteerHours || 0;

      if (registration.registrationDate < new Date(event.startDate.getTime() - 7 * 24 * 60 * 60 * 1000)) {
        points += this.config.earlyRegistrationBonus;
      }

      const userClubRole = await prisma.userClub.findFirst({
        where: {
          userId,
          clubId: event.clubId,
          role: { in: ['president', 'vice_president', 'secretary'] }
        }
      });

      if (userClubRole) {
        points += this.config.leadershipBonus;
      }

      points += Math.floor(volunteerHours * this.config.volunteerHourMultiplier);

      return { points, volunteerHours };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to calculate event points');
    }
  }

  async awardEventPoints(eventId: string, userId: string, markedBy: string): Promise<any> {
    try {
      const existingTransaction = await prisma.pointsHistory.findFirst({
        where: {
          userId,
          eventId,
          reason: { contains: 'event_attendance' }
        }
      });

      if (existingTransaction) {
        throw new ApiError(400, 'Points already awarded for this event');
      }

      const { points, volunteerHours } = await this.calculateEventPoints(eventId, userId);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayPoints = await prisma.pointsHistory.aggregate({
        where: {
          userId,
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        },
        _sum: {
          pointsEarned: true
        }
      });

      let finalPoints = points;
      const currentDailyPoints = todayPoints._sum.pointsEarned || 0;
      if (currentDailyPoints + points > this.config.maxDailyPoints) {
        finalPoints = Math.max(0, this.config.maxDailyPoints - currentDailyPoints);
      }

      const transaction = await prisma.pointsHistory.create({
        data: {
          userId,
          eventId,
          pointsEarned: finalPoints,
          volunteerHoursEarned: volunteerHours,
          reason: `event_attendance: Attended event and earned ${finalPoints} points`
        }
      });

      await prisma.user.update({
        where: { id: userId },
        data: {
          totalPoints: { increment: finalPoints },
          totalVolunteerHours: { increment: volunteerHours }
        }
      });

      await prisma.eventRegistration.update({
        where: {
          userId_eventId: {
            userId,
            eventId
          }
        },
        data: {
          pointsAwarded: finalPoints,
          volunteerHoursAwarded: volunteerHours,
          attendanceMarkedAt: new Date()
        }
      });

      return transaction;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to award event points');
    }
  }

  async adjustUserPoints(userId: string, points: number, volunteerHours: number = 0, reason: string, adjustedBy: string): Promise<any> {
    try {
      const transaction = await prisma.pointsHistory.create({
        data: {
          userId,
          pointsEarned: points,
          volunteerHoursEarned: volunteerHours,
          reason: `${points > 0 ? 'manual_adjustment' : 'penalty'}: ${reason}`
        }
      });

      await prisma.user.update({
        where: { id: userId },
        data: {
          totalPoints: { increment: points },
          totalVolunteerHours: { increment: volunteerHours }
        }
      });

      return transaction;
    } catch (error) {
      throw new ApiError(500, 'Failed to adjust user points');
    }
  }

  async getUserPointsHistory(userId: string, page: number = 1, limit: number = 20): Promise<{
    transactions: any[];
    total: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      const [transactions, total] = await Promise.all([
        prisma.pointsHistory.findMany({
          where: { userId },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.pointsHistory.count({
          where: { userId }
        })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        transactions,
        total,
        totalPages
      };
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch points history');
    }
  }

  async getPointsBreakdown(userId: string, timeframe?: 'week' | 'month' | 'year'): Promise<{
    totalPoints: number;
    breakdown: {
      eventAttendance: number;
      badges: number;
      bonuses: number;
      adjustments: number;
    };
    timeline: {
      date: string;
      points: number;
      volunteerHours: number;
    }[];
  }> {
    try {
      let dateFilter = {};
      
      if (timeframe) {
        const now = new Date();
        let startDate = new Date();
        
        switch (timeframe) {
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        dateFilter = {
          createdAt: { gte: startDate }
        };
      }

      const transactions = await prisma.pointsHistory.findMany({
        where: {
          userId,
          ...dateFilter
        },
        orderBy: { createdAt: 'desc' }
      });

      const totalPoints = transactions.reduce((sum, t) => sum + t.pointsEarned, 0);
      
      const breakdown = {
        eventAttendance: transactions
          .filter(t => t.reason.includes('event_attendance'))
          .reduce((sum, t) => sum + t.pointsEarned, 0),
        badges: transactions
          .filter(t => t.reason.includes('badge_earned'))
          .reduce((sum, t) => sum + t.pointsEarned, 0),
        bonuses: transactions
          .filter(t => t.reason.includes('bonus_points'))
          .reduce((sum, t) => sum + t.pointsEarned, 0),
        adjustments: transactions
          .filter(t => t.reason.includes('manual_adjustment'))
          .reduce((sum, t) => sum + t.pointsEarned, 0)
      };

      const timelineMap = new Map();
      transactions.forEach(transaction => {
        const date = transaction.createdAt.toISOString().split('T')[0];
        if (!timelineMap.has(date)) {
          timelineMap.set(date, { points: 0, volunteerHours: 0 });
        }
        const entry = timelineMap.get(date);
        entry.points += transaction.pointsEarned;
        entry.volunteerHours += transaction.volunteerHoursEarned || 0;
      });

      const timeline = Array.from(timelineMap.entries()).map(([date, data]) => ({
        date,
        points: data.points,
        volunteerHours: data.volunteerHours
      })).sort((a, b) => a.date.localeCompare(b.date));

      return {
        totalPoints,
        breakdown,
        timeline
      };
    } catch (error) {
      throw new ApiError(500, 'Failed to get points breakdown');
    }
  }

  async getLeaderboard(timeframe?: 'week' | 'month' | 'year', limit: number = 10): Promise<{
    users: {
      userId: string;
      firstName: string;
      lastName: string;
      profileImage?: string;
      department?: string;
      totalPoints: number;
      rank: number;
    }[];
  }> {
    try {
      const users = await prisma.user.findMany({
        where: {
          isVerified: true
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImage: true,
          department: true,
          totalPoints: true
        },
        orderBy: {
          totalPoints: 'desc'
        },
        take: limit
      });

      const usersWithRank = users.map((user, index) => ({
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage || undefined,
        department: user.department || undefined,
        totalPoints: user.totalPoints,
        rank: index + 1
      }));

      return { users: usersWithRank };
    } catch (error) {
      throw new ApiError(500, 'Failed to get leaderboard');
    }
  }

  async getUserRank(userId: string, timeframe?: 'week' | 'month' | 'year'): Promise<{
    rank: number;
    totalUsers: number;
    percentile: number;
    points: number;
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { totalPoints: true }
      });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      const [higherRanked, totalUsers] = await Promise.all([
        prisma.user.count({
          where: {
            isVerified: true,
            totalPoints: { gt: user.totalPoints }
          }
        }),
        prisma.user.count({
          where: { isVerified: true }
        })
      ]);

      const rank = higherRanked + 1;
      const percentile = Math.round(((totalUsers - rank) / totalUsers) * 100);

      return {
        rank,
        totalUsers,
        percentile,
        points: user.totalPoints
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to get user rank');
    }
  }

  async getSystemStats(): Promise<{
    totalPointsAwarded: number;
    totalVolunteerHours: number;
    averagePointsPerUser: number;
    topPerformers: any[];
    recentTransactions: any[];
  }> {
    try {
      const [pointsStats, avgPoints, topPerformers, recentTransactions] = await Promise.all([
        prisma.pointsHistory.aggregate({
          _sum: {
            pointsEarned: true,
            volunteerHoursEarned: true
          }
        }),
        prisma.user.aggregate({
          _avg: {
            totalPoints: true
          },
          where: {
            isVerified: true
          }
        }),
        prisma.user.findMany({
          take: 5,
          orderBy: {
            totalPoints: 'desc'
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            totalPoints: true,
            department: true
          },
          where: {
            isVerified: true
          }
        }),
        prisma.pointsHistory.findMany({
          take: 10,
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        })
      ]);

      return {
        totalPointsAwarded: pointsStats._sum.pointsEarned || 0,
        totalVolunteerHours: pointsStats._sum.volunteerHoursEarned || 0,
        averagePointsPerUser: avgPoints._avg.totalPoints || 0,
        topPerformers,
        recentTransactions
      };
    } catch (error) {
      throw new ApiError(500, 'Failed to get system stats');
    }
  }

  async updatePointsConfig(config: Partial<PointsSystemConfig>): Promise<PointsSystemConfig> {
    try {
      Object.assign(this.config, config);
      return this.config;
    } catch (error) {
      throw new ApiError(500, 'Failed to update points configuration');
    }
  }

  getPointsConfig(): PointsSystemConfig {
    return { ...this.config };
  }
}

export const pointsService = new PointsService();