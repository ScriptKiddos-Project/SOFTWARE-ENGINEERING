import { PrismaClient } from '@prisma/client';
import { ApiError } from '../utils/errors';

const prisma = new PrismaClient();

export interface PointsTransaction {
  id: string;
  userId: string;
  eventId?: string;
  points: number;
  volunteerHours?: number;
  type: PointsTransactionType;
  description: string;
  createdAt: Date;
  createdBy?: string;
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
    pointsExpiryDays: undefined // Points don't expire by default
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

      // Add bonus points for early registration
      if (registration.registrationDate < new Date(event.startDate.getTime() - 7 * 24 * 60 * 60 * 1000)) {
        points += this.config.earlyRegistrationBonus;
      }

      // Add leadership bonus if user is club admin
      const userClubRole = await prisma.userClub.findFirst({
        where: {
          userId,
          clubId: event.clubId,
          role: { in: ['admin', 'coordinator'] }
        }
      });

      if (userClubRole) {
        points += this.config.leadershipBonus;
      }

      // Add volunteer hour multiplier
      points += Math.floor(volunteerHours * this.config.volunteerHourMultiplier);

      return { points, volunteerHours };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to calculate event points');
    }
  }

  async awardEventPoints(eventId: string, userId: string, markedBy: string): Promise<PointsTransaction> {
    try {
      // Check if points already awarded
      const existingTransaction = await prisma.pointsTransaction.findFirst({
        where: {
          userId,
          eventId,
          type: PointsTransactionType.EVENT_ATTENDANCE
        }
      });

      if (existingTransaction) {
        throw new ApiError(400, 'Points already awarded for this event');
      }

      const { points, volunteerHours } = await this.calculateEventPoints(eventId, userId);

      // Check daily points limit
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayPoints = await prisma.pointsTransaction.aggregate({
        where: {
          userId,
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        },
        _sum: {
          points: true
        }
      });

      const currentDailyPoints = todayPoints._sum.points || 0;
      if (currentDailyPoints + points > this.config.maxDailyPoints) {
        points = Math.max(0, this.config.maxDailyPoints - currentDailyPoints);
      }

      // Create points transaction
      const transaction = await prisma.pointsTransaction.create({
        data: {
          userId,
          eventId,
          points,
          volunteerHours,
          type: PointsTransactionType.EVENT_ATTENDANCE,
          description: `Attended event and earned ${points} points`,
          createdBy: markedBy
        }
      });

      // Update user's total points and volunteer hours
      await prisma.user.update({
        where: { id: userId },
        data: {
          totalPoints: { increment: points },
          totalVolunteerHours: { increment: volunteerHours }
        }
      });

      // Update event registration record
      await prisma.eventRegistration.update({
        where: {
          userId_eventId: {
            userId,
            eventId
          }
        },
        data: {
          pointsAwarded: points,
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

  async adjustUserPoints(userId: string, points: number, volunteerHours: number = 0, reason: string, adjustedBy: string): Promise<PointsTransaction> {
    try {
      const transaction = await prisma.pointsTransaction.create({
        data: {
          userId,
          points,
          volunteerHours,
          type: points > 0 ? PointsTransactionType.MANUAL_ADJUSTMENT : PointsTransactionType.PENALTY,
          description: reason,
          createdBy: adjustedBy
        }
      });

      // Update user's totals
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
    transactions: PointsTransaction[];
    total: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      const [transactions, total] = await Promise.all([
        prisma.pointsTransaction.findMany({
          where: { userId },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            event: {
              select: {
                id: true,
                title: true,
                startDate: true
              }
            }
          }
        }),
        prisma.pointsTransaction.count({
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

      const transactions = await prisma.pointsTransaction.findMany({
        where: {
          userId,
          ...dateFilter
        },
        orderBy: { createdAt: 'desc' }
      });

      const totalPoints = transactions.reduce((sum, t) => sum + t.points, 0);
      
      const breakdown = {
        eventAttendance: transactions
          .filter(t => t.type === PointsTransactionType.EVENT_ATTENDANCE)
          .reduce((sum, t) => sum + t.points, 0),
        badges: transactions
          .filter(t => t.type === PointsTransactionType.BADGE_EARNED)
          .reduce((sum, t) => sum + t.points, 0),
        bonuses: transactions
          .filter(t => t.type === PointsTransactionType.BONUS_POINTS)
          .reduce((sum, t) => sum + t.points, 0),
        adjustments: transactions
          .filter(t => t.type === PointsTransactionType.MANUAL_ADJUSTMENT)
          .reduce((sum, t) => sum + t.points, 0)
      };

      // Create timeline data
      const timelineMap = new Map();
      transactions.forEach(transaction => {
        const date = transaction.createdAt.toISOString().split('T')[0];
        if (!timelineMap.has(date)) {
          timelineMap.set(date, { points: 0, volunteerHours: 0 });
        }
        const entry = timelineMap.get(date);
        entry.points += transaction.points;
        entry.volunteerHours += transaction.volunteerHours || 0;
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
      let query = `
        SELECT 
          u.id as "userId",
          u.first_name as "firstName", 
          u.last_name as "lastName",
          u.profile_image as "profileImage",
          u.department,
          u.total_points as "totalPoints",
          ROW_NUMBER() OVER (ORDER BY u.total_points DESC) as rank
        FROM users u
        WHERE u.is_verified = true
      `;

      if (timeframe) {
        const interval = timeframe === 'week' ? '7 days' : timeframe === 'month' ? '30 days' : '365 days';
        query = `
          SELECT 
            u.id as "userId",
            u.first_name as "firstName", 
            u.last_name as "lastName",
            u.profile_image as "profileImage",
            u.department,
            COALESCE(SUM(pt.points), 0) as "totalPoints",
            ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(pt.points), 0) DESC) as rank
          FROM users u
          LEFT JOIN points_transactions pt ON u.id = pt.user_id 
            AND pt.created_at >= NOW() - INTERVAL '${interval}'
          WHERE u.is_verified = true
          GROUP BY u.id, u.first_name, u.last_name, u.profile_image, u.department
        `;
      }

      query += ` ORDER BY "totalPoints" DESC LIMIT ${limit}`;

      const users = await prisma.$queryRawUnsafe(query);

      return { users: users as any[] };
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
      let pointsQuery: string;
      let countQuery: string;

      if (timeframe) {
        const interval = timeframe === 'week' ? '7 days' : timeframe === 'month' ? '30 days' : '365 days';
        
        pointsQuery = `
          SELECT COALESCE(SUM(points), 0) as points
          FROM points_transactions 
          WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '${interval}'
        `;
        
        countQuery = `
          SELECT COUNT(DISTINCT u.id) as count
          FROM users u
          LEFT JOIN points_transactions pt ON u.id = pt.user_id 
            AND pt.created_at >= NOW() - INTERVAL '${interval}'
          WHERE u.is_verified = true 
            AND COALESCE(SUM(pt.points), 0) > (
              SELECT COALESCE(SUM(points), 0)
              FROM points_transactions 
              WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '${interval}'
            )
          GROUP BY u.id
        `;
      } else {
        pointsQuery = `
          SELECT total_points as points 
          FROM users 
          WHERE id = $1
        `;
        
        countQuery = `
          SELECT COUNT(*) as count
          FROM users 
          WHERE is_verified = true AND total_points > (
            SELECT total_points FROM users WHERE id = $1
          )
        `;
      }

      const [pointsResult, countResult, totalUsersResult] = await Promise.all([
        prisma.$queryRawUnsafe(pointsQuery, userId),
        prisma.$queryRawUnsafe(countQuery, userId),
        prisma.user.count({ where: { isVerified: true } })
      ]);

      const points = (pointsResult as any)[0]?.points || 0;
      const rank = (countResult as any)[0]?.count + 1 || 1;
      const totalUsers = totalUsersResult;
      const percentile = Math.round(((totalUsers - rank) / totalUsers) * 100);

      return {
        rank,
        totalUsers,
        percentile,
        points
      };
    } catch (error) {
      throw new ApiError(500, 'Failed to get user rank');
    }
  }

  async getSystemStats(): Promise<{
    totalPointsAwarded: number;
    totalVolunteerHours: number;
    averagePointsPerUser: number;
    topPerformers: any[];
    recentTransactions: PointsTransaction[];
  }> {
    try {
      const [
        pointsStats,
        avgPoints,
        topPerformers,
        recentTransactions
      ] = await Promise.all([
        prisma.pointsTransaction.aggregate({
          _sum: {
            points: true,
            volunteerHours: true
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
        prisma.pointsTransaction.findMany({
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
            },
            event: {
              select: {
                title: true
              }
            }
          }
        })
      ]);

      return {
        totalPointsAwarded: pointsStats._sum.points || 0,
        totalVolunteerHours: pointsStats._sum.volunteerHours || 0,
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
      // Update configuration in database or cache
      // For now, just update the in-memory config
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