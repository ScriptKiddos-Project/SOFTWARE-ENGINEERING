import { PrismaClient } from '@prisma/client';
import { ApiError } from '../utils/errors';

const prisma = new PrismaClient();

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  requirements: BadgeRequirements;
  rarity: BadgeRarity;
  points: number;
  isActive: boolean;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: Date;
  progress: number;
  badge: Badge;
}

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

export enum BadgeCategory {
  PARTICIPATION = 'participation',
  ACHIEVEMENT = 'achievement',
  LEADERSHIP = 'leadership',
  SPECIAL = 'special',
  MILESTONE = 'milestone'
}

export enum BadgeRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export class BadgeService {
  // Default badge definitions
  private readonly defaultBadges: Omit<Badge, 'id'>[] = [
    // Participation Badges
    {
      name: 'First Steps',
      description: 'Attend your first event',
      icon: '🎯',
      category: BadgeCategory.PARTICIPATION,
      requirements: { eventsAttended: 1 },
      rarity: BadgeRarity.COMMON,
      points: 10,
      isActive: true
    },
    {
      name: 'Event Explorer',
      description: 'Attend 5 different events',
      icon: '🚀',
      category: BadgeCategory.PARTICIPATION,
      requirements: { eventsAttended: 5 },
      rarity: BadgeRarity.COMMON,
      points: 25,
      isActive: true
    },
    {
      name: 'Regular Participant',
      description: 'Attend 15 events',
      icon: '⭐',
      category: BadgeCategory.PARTICIPATION,
      requirements: { eventsAttended: 15 },
      rarity: BadgeRarity.UNCOMMON,
      points: 50,
      isActive: true
    },
    {
      name: 'Event Enthusiast',
      description: 'Attend 50 events',
      icon: '🏆',
      category: BadgeCategory.PARTICIPATION,
      requirements: { eventsAttended: 50 },
      rarity: BadgeRarity.RARE,
      points: 150,
      isActive: true
    },
    {
      name: 'Event Champion',
      description: 'Attend 100+ events',
      icon: '👑',
      category: BadgeCategory.PARTICIPATION,
      requirements: { eventsAttended: 100 },
      rarity: BadgeRarity.EPIC,
      points: 300,
      isActive: true
    },

    // Points & Achievement Badges
    {
      name: 'Point Collector',
      description: 'Earn your first 100 points',
      icon: '💎',
      category: BadgeCategory.ACHIEVEMENT,
      requirements: { pointsEarned: 100 },
      rarity: BadgeRarity.COMMON,
      points: 20,
      isActive: true
    },
    {
      name: 'Rising Star',
      description: 'Earn 500 points',
      icon: '⭐',
      category: BadgeCategory.ACHIEVEMENT,
      requirements: { pointsEarned: 500 },
      rarity: BadgeRarity.UNCOMMON,
      points: 75,
      isActive: true
    },
    {
      name: 'Campus Hero',
      description: 'Earn 1000+ points',
      icon: '🦸',
      category: BadgeCategory.ACHIEVEMENT,
      requirements: { pointsEarned: 1000 },
      rarity: BadgeRarity.RARE,
      points: 200,
      isActive: true
    },

    // Volunteer Service Badges
    {
      name: 'Volunteer',
      description: 'Complete 10 volunteer hours',
      icon: '🤝',
      category: BadgeCategory.ACHIEVEMENT,
      requirements: { volunteerHours: 10 },
      rarity: BadgeRarity.COMMON,
      points: 30,
      isActive: true
    },
    {
      name: 'Community Helper',
      description: 'Complete 25 volunteer hours',
      icon: '💪',
      category: BadgeCategory.ACHIEVEMENT,
      requirements: { volunteerHours: 25 },
      rarity: BadgeRarity.UNCOMMON,
      points: 100,
      isActive: true
    },
    {
      name: 'Service Champion',
      description: 'Complete 50+ volunteer hours',
      icon: '🏅',
      category: BadgeCategory.ACHIEVEMENT,
      requirements: { volunteerHours: 50 },
      rarity: BadgeRarity.RARE,
      points: 250,
      isActive: true
    },

    // Leadership Badges
    {
      name: 'Club Member',
      description: 'Join your first club',
      icon: '🎭',
      category: BadgeCategory.PARTICIPATION,
      requirements: { clubsJoined: 1 },
      rarity: BadgeRarity.COMMON,
      points: 15,
      isActive: true
    },
    {
      name: 'Social Butterfly',
      description: 'Join 3 different clubs',
      icon: '🦋',
      category: BadgeCategory.PARTICIPATION,
      requirements: { clubsJoined: 3 },
      rarity: BadgeRarity.UNCOMMON,
      points: 60,
      isActive: true
    },
    {
      name: 'Club Leader',
      description: 'Become a club admin or coordinator',
      icon: '👨‍💼',
      category: BadgeCategory.LEADERSHIP,
      requirements: { customCriteria: { hasLeadershipRole: true } },
      rarity: BadgeRarity.RARE,
      points: 100,
      isActive: true
    },

    // Special Event Badges
    {
      name: 'Tech Savvy',
      description: 'Attend 5 technical events',
      icon: '💻',
      category: BadgeCategory.SPECIAL,
      requirements: { eventsAttended: 5, eventTypes: ['technical'] },
      rarity: BadgeRarity.UNCOMMON,
      points: 75,
      isActive: true
    },
    {
      name: 'Culture Enthusiast',
      description: 'Attend 5 cultural events',
      icon: '🎨',
      category: BadgeCategory.SPECIAL,
      requirements: { eventsAttended: 5, eventTypes: ['cultural'] },
      rarity: BadgeRarity.UNCOMMON,
      points: 75,
      isActive: true
    },
    {
      name: 'Sports Spirit',
      description: 'Attend 5 sports events',
      icon: '⚽',
      category: BadgeCategory.SPECIAL,
      requirements: { eventsAttended: 5, eventTypes: ['sports'] },
      rarity: BadgeRarity.UNCOMMON,
      points: 75,
      isActive: true
    },

    // Milestone Badges
    {
      name: 'One Month Strong',
      description: 'Active for 30 consecutive days',
      icon: '📅',
      category: BadgeCategory.MILESTONE,
      requirements: { consecutiveDays: 30 },
      rarity: BadgeRarity.UNCOMMON,
      points: 50,
      isActive: true
    },
    {
      name: 'Semester Champion',
      description: 'Active for 90 consecutive days',
      icon: '🗓️',
      category: BadgeCategory.MILESTONE,
      requirements: { consecutiveDays: 90 },
      rarity: BadgeRarity.RARE,
      points: 150,
      isActive: true
    },
    {
      name: 'Top 10',
      description: 'Reach top 10 in leaderboard',
      icon: '🥇',
      category: BadgeCategory.ACHIEVEMENT,
      requirements: { leaderboardPosition: 10 },
      rarity: BadgeRarity.EPIC,
      points: 200,
      isActive: true
    },
    {
      name: 'Hall of Fame',
      description: 'Reach #1 in leaderboard',
      icon: '👑',
      category: BadgeCategory.ACHIEVEMENT,
      requirements: { leaderboardPosition: 1 },
      rarity: BadgeRarity.LEGENDARY,
      points: 500,
      isActive: true
    }
  ];

  async initializeBadges(): Promise<void> {
    try {
      for (const badgeData of this.defaultBadges) {
        await prisma.badge.upsert({
          where: { name: badgeData.name },
          update: badgeData,
          create: badgeData
        });
      }
    } catch (error) {
      throw new ApiError(500, 'Failed to initialize badges');
    }
  }

  async checkAndAwardBadges(userId: string): Promise<UserBadge[]> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          userClubs: {
            where: { isActive: true },
            include: { club: true }
          },
          eventRegistrations: {
            where: { attended: true },
            include: { event: true }
          },
          userBadges: { include: { badge: true } }
        }
      });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      const availableBadges = await prisma.badge.findMany({
        where: { isActive: true }
      });

      const earnedBadgeIds = user.userBadges.map(ub => ub.badgeId);
      const newBadges: UserBadge[] = [];

      for (const badge of availableBadges) {
        if (earnedBadgeIds.includes(badge.id)) continue;

        const meetsRequirements = await this.checkBadgeRequirements(user, badge);
        
        if (meetsRequirements) {
          const userBadge = await prisma.userBadge.create({
            data: {
              userId,
              badgeId: badge.id,
              progress: 100,
              earnedAt: new Date()
            },
            include: { badge: true }
          });

          // Award badge points
          await prisma.user.update({
            where: { id: userId },
            data: {
              totalPoints: { increment: badge.points }
            }
          });

          newBadges.push(userBadge);
        }
      }

      return newBadges;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to check and award badges');
    }
  }

  private async checkBadgeRequirements(user: any, badge: any): Promise<boolean> {
    const requirements = badge.requirements as BadgeRequirements;

    // Check events attended
    if (requirements.eventsAttended) {
      let attendedCount = user.eventRegistrations.length;
      
      // Filter by event types if specified
      if (requirements.eventTypes) {
        attendedCount = user.eventRegistrations.filter((reg: any) => 
          requirements.eventTypes!.includes(reg.event.eventType)
        ).length;
      }

      if (attendedCount < requirements.eventsAttended) return false;
    }

    // Check points earned
    if (requirements.pointsEarned && user.totalPoints < requirements.pointsEarned) {
      return false;
    }

    // Check volunteer hours
    if (requirements.volunteerHours && user.totalVolunteerHours < requirements.volunteerHours) {
      return false;
    }

    // Check clubs joined
    if (requirements.clubsJoined && user.userClubs.length < requirements.clubsJoined) {
      return false;
    }

    // Check consecutive days (would need separate tracking)
    if (requirements.consecutiveDays) {
      // Implementation would require activity tracking
      // For now, return false as this needs additional infrastructure
      return false;
    }

    // Check leaderboard position
    if (requirements.leaderboardPosition) {
      const position = await this.getUserLeaderboardPosition(user.id);
      if (position > requirements.leaderboardPosition) return false;
    }

    // Check custom criteria
    if (requirements.customCriteria) {
      if (requirements.customCriteria.hasLeadershipRole) {
        const hasLeadershipRole = user.userClubs.some((uc: any) => 
          ['admin', 'coordinator'].includes(uc.role)
        );
        if (!hasLeadershipRole) return false;
      }
    }

    return true;
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
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
        const currentProgress = await this.calculateBadgeProgress(user, badge);

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

  private async calculateBadgeProgress(user: any, badge: any): Promise<number> {
    const requirements = badge.requirements as BadgeRequirements;
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
  }

  private async getUserLeaderboardPosition(userId: string): Promise<number> {
    try {
      const users = await prisma.user.findMany({
        orderBy: { totalPoints: 'desc' },
        select: { id: true }
      });

      const position = users.findIndex(u => u.id === userId) + 1;
      return position || 999999; // Return high number if not found
    } catch (error) {
      return 999999;
    }
  }

  async awardBadgeManually(userId: string, badgeId: string, reason: string, awardedBy: string): Promise<UserBadge> {
    try {
      // Check if badge already awarded
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
          progress: 100,
          earnedAt: new Date(),
          manuallyAwarded: true,
          awardedBy,
          awardReason: reason
        },
        include: { badge: true }
      });

      // Award badge points
      await prisma.user.update({
        where: { id: userId },
        data: {
          totalPoints: { increment: badge.points }
        }
      });

      return userBadge;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to award badge manually');
    }
  }

  async getAllBadges(): Promise<Badge[]> {
    try {
      return await prisma.badge.findMany({
        orderBy: [
          { category: 'asc' },
          { rarity: 'asc' },
          { points: 'asc' }
        ]
      });
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch badges');
    }
  }

  async updateBadge(badgeId: string, updateData: Partial<Badge>): Promise<Badge> {
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