import { PrismaClient } from '@prisma/client';
import { ApiError } from '../utils/errors';

const prisma = new PrismaClient();

export interface BadgeRequirements {
  eventsAttended?: number;
  pointsEarned?: number;
  volunteerHours?: number;
  clubsJoined?: number;
  eventTypes?: string[];
  consecutiveDays?: number;
  leaderboardPosition?: number;
  customCriteria?: Record<string, any>;
}

export class BadgeService {
  // Default badge definitions matching your schema
  private readonly defaultBadges = [
    {
      name: 'First Steps',
      description: 'Attend your first event',
      icon: '🎯',
      criteria: JSON.stringify({ eventsAttended: 1 }),
      isActive: true
    },
    {
      name: 'Event Explorer',
      description: 'Attend 5 different events',
      icon: '🚀',
      criteria: JSON.stringify({ eventsAttended: 5 }),
      isActive: true
    },
    {
      name: 'Regular Participant',
      description: 'Attend 15 events',
      icon: '⭐',
      criteria: JSON.stringify({ eventsAttended: 15 }),
      isActive: true
    },
    {
      name: 'Event Enthusiast',
      description: 'Attend 50 events',
      icon: '🏆',
      criteria: JSON.stringify({ eventsAttended: 50 }),
      isActive: true
    },
    {
      name: 'Point Collector',
      description: 'Earn your first 100 points',
      icon: '💎',
      criteria: JSON.stringify({ pointsEarned: 100 }),
      isActive: true
    },
    {
      name: 'Rising Star',
      description: 'Earn 500 points',
      icon: '⭐',
      criteria: JSON.stringify({ pointsEarned: 500 }),
      isActive: true
    },
    {
      name: 'Campus Hero',
      description: 'Earn 1000+ points',
      icon: '🦸',
      criteria: JSON.stringify({ pointsEarned: 1000 }),
      isActive: true
    },
    {
      name: 'Volunteer',
      description: 'Complete 10 volunteer hours',
      icon: '🤝',
      criteria: JSON.stringify({ volunteerHours: 10 }),
      isActive: true
    },
    {
      name: 'Community Helper',
      description: 'Complete 25 volunteer hours',
      icon: '💪',
      criteria: JSON.stringify({ volunteerHours: 25 }),
      isActive: true
    },
    {
      name: 'Service Champion',
      description: 'Complete 50+ volunteer hours',
      icon: '🏅',
      criteria: JSON.stringify({ volunteerHours: 50 }),
      isActive: true
    },
    {
      name: 'Club Member',
      description: 'Join your first club',
      icon: '🎭',
      criteria: JSON.stringify({ clubsJoined: 1 }),
      isActive: true
    },
    {
      name: 'Social Butterfly',
      description: 'Join 3 different clubs',
      icon: '🦋',
      criteria: JSON.stringify({ clubsJoined: 3 }),
      isActive: true
    },
    {
      name: 'Club Leader',
      description: 'Become a club president or vice president',
      icon: '👨‍💼',
      criteria: JSON.stringify({ customCriteria: { hasLeadershipRole: true } }),
      isActive: true
    }
  ];

  async initializeBadges(): Promise<void> {
    try {
      for (const badgeData of this.defaultBadges) {
        await prisma.badge.upsert({
          where: { name: badgeData.name },
          update: {
            description: badgeData.description,
            icon: badgeData.icon,
            criteria: badgeData.criteria,
            isActive: badgeData.isActive
          },
          create: badgeData
        });
      }
      console.log('✅ Default badges initialized successfully');
    } catch (error) {
      console.error('Failed to initialize badges:', error);
      throw new ApiError(500, 'Failed to initialize badges');
    }
  }

  async checkAndAwardBadges(userId: string): Promise<any[]> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          userClubs: {
            where: { isActive: true }
          },
          eventRegistrations: {
            where: { attended: true }
          },
          userBadges: {
            include: {
              badge: true
            }
          }
        }
      });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      const availableBadges = await prisma.badge.findMany({
        where: { isActive: true }
      });

      const earnedBadgeIds = user.userBadges.map(ub => ub.badgeId);
      const newBadges: any[] = [];

      for (const badge of availableBadges) {
        if (earnedBadgeIds.includes(badge.id)) continue;

        const meetsRequirements = this.checkBadgeRequirements(user, badge);
        
        if (meetsRequirements) {
          const userBadge = await prisma.userBadge.create({
            data: {
              userId,
              badgeId: badge.id,
              earnedAt: new Date()
            },
            include: { badge: true }
          });

          newBadges.push(userBadge);
        }
      }

      return newBadges;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('Failed to check and award badges:', error);
      throw new ApiError(500, 'Failed to check and award badges');
    }
  }

  private checkBadgeRequirements(user: any, badge: any): boolean {
    try {
      const requirements: BadgeRequirements = JSON.parse(badge.criteria);

      if (requirements.eventsAttended) {
        const attendedCount = user.eventRegistrations.length;
        if (attendedCount < requirements.eventsAttended) return false;
      }

      if (requirements.pointsEarned && user.totalPoints < requirements.pointsEarned) {
        return false;
      }

      if (requirements.volunteerHours && user.totalVolunteerHours < requirements.volunteerHours) {
        return false;
      }

      if (requirements.clubsJoined && user.userClubs.length < requirements.clubsJoined) {
        return false;
      }

      if (requirements.customCriteria) {
        if (requirements.customCriteria.hasLeadershipRole) {
          const hasLeadershipRole = user.userClubs.some((uc: any) => 
            ['president', 'vice_president', 'secretary'].includes(uc.role)
          );
          if (!hasLeadershipRole) return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking badge requirements:', error);
      return false;
    }
  }

  async getUserBadges(userId: string): Promise<any[]> {
    try {
      const userBadges = await prisma.userBadge.findMany({
        where: { userId },
        include: { badge: true },
        orderBy: { earnedAt: 'desc' }
      });

      return userBadges;
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch user badges');
    }
  }

  async getBadgeProgress(userId: string): Promise<any[]> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          userClubs: { where: { isActive: true } },
          eventRegistrations: { where: { attended: true } },
          userBadges: true
        }
      });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      const availableBadges = await prisma.badge.findMany({
        where: { isActive: true }
      });

      const earnedBadgeIds = user.userBadges.map(ub => ub.badgeId);
      const progress = [];

      for (const badge of availableBadges) {
        const isEarned = earnedBadgeIds.includes(badge.id);
        const currentProgress = this.calculateBadgeProgress(user, badge);

        progress.push({
          badge,
          isEarned,
          progress: currentProgress,
          earnedAt: isEarned ? user.userBadges.find(ub => ub.badgeId === badge.id)?.earnedAt : null
        });
      }

      return progress;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to calculate badge progress');
    }
  }

  private calculateBadgeProgress(user: any, badge: any): number {
    try {
      const requirements: BadgeRequirements = JSON.parse(badge.criteria);
      let progress = 0;

      if (requirements.eventsAttended) {
        const attended = user.eventRegistrations.length;
        progress = Math.min((attended / requirements.eventsAttended) * 100, 100);
      } else if (requirements.pointsEarned) {
        progress = Math.min((user.totalPoints / requirements.pointsEarned) * 100, 100);
      } else if (requirements.volunteerHours) {
        progress = Math.min((user.totalVolunteerHours / requirements.volunteerHours) * 100, 100);
      } else if (requirements.clubsJoined) {
        progress = Math.min((user.userClubs.length / requirements.clubsJoined) * 100, 100);
      }

      return Math.round(progress);
    } catch (error) {
      return 0;
    }
  }

  async awardBadgeManually(userId: string, badgeId: string, reason: string, awardedBy: string): Promise<any> {
    try {
      const existingBadge = await prisma.userBadge.findFirst({
        where: { userId, badgeId }
      });

      if (existingBadge) {
        throw new ApiError(400, 'Badge already awarded to this user');
      }

      const badge = await prisma.badge.findUnique({
        where: { id: badgeId }
      });

      if (!badge) {
        throw new ApiError(404, 'Badge not found');
      }

      const userBadge = await prisma.userBadge.create({
        data: {
          userId,
          badgeId,
          earnedAt: new Date()
        },
        include: { badge: true }
      });

      return userBadge;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to award badge manually');
    }
  }

  async getAllBadges(): Promise<any[]> {
    try {
      return await prisma.badge.findMany({
        orderBy: { createdAt: 'asc' }
      });
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch badges');
    }
  }

  async updateBadge(badgeId: string, updateData: any): Promise<any> {
    try {
      return await prisma.badge.update({
        where: { id: badgeId },
        data: updateData
      });
    } catch (error) {
      throw new ApiError(500, 'Failed to update badge');
    }
  }
}