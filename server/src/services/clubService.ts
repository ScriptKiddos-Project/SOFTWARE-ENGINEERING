import { PrismaClient, ClubMemberRole, ClubCategory } from '@prisma/client';
import {
  Club,
  CreateClubData,
  UpdateClubData,
  ClubWithDetails,
  ClubMember,
  JoinClubRequest,
  ClubStats,
  ClubFilters,
  ClubListResponse,
  MemberFilters,
  ClubActivity,
  ClubAnalytics
} from '../types/club';
import { ApiError } from '../utils/errors';

const prisma = new PrismaClient();

export class ClubService {
  async createClub(clubData: CreateClubData, createdBy: string): Promise<Club> {
    try {
      // Check if club with same name exists
      const existingClub = await prisma.club.findFirst({
        where: { 
          name: {
            equals: clubData.name,
            mode: 'insensitive'
          }
        }
      });

      if (existingClub) {
        throw new ApiError(400, 'Club with this name already exists');
      }

      // Create club
      const club = await prisma.club.create({
        data: {
          name: clubData.name,
          description: clubData.description,
          category: clubData.category as ClubCategory,
          contactEmail: clubData.contactEmail,
          logoUrl: clubData.logoUrl,
          coverImageUrl: clubData.coverImageUrl,
          createdBy,
          isActive: true,
          memberCount: 1
        }
      });

      // Add creator as admin
      await prisma.userClub.create({
        data: {
          userId: createdBy,
          clubId: club.id,
          role: ClubMemberRole.president,
          isActive: true
        }
      });

      // Create activity log
      await this.createActivity(club.id, 'club_created', 'Club Created', 'Club was successfully created', createdBy);

      return club;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to create club');
    }
  }

  async getClubById(clubId: string): Promise<Club | null> {
    try {
      const club = await prisma.club.findUnique({
        where: { id: clubId }
      });

      return club;
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch club');
    }
  }

  async getClubWithDetails(clubId: string): Promise<ClubWithDetails | null> {
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
                  profileImage: true,
                  department: true,
                  yearOfStudy: true
                }
              }
            },
            orderBy: { joinedAt: 'asc' }
          },
          events: {
            select: {
              id: true,
              title: true,
              description: true,
              startDate: true,
              endDate: true,
              location: true,
              maxParticipants: true,
              pointsReward: true,
              volunteerHours: true,
              imageUrl: true,
              isPublished: true,
              _count: {
                select: {
                  eventRegistrations: true
                }
              }
            },
            orderBy: { startDate: 'desc' },
            take: 10
          }
        }
      });

      if (!club) return null;

      // Get recent activities
      const recentActivities = await this.getClubActivities(clubId, 10);

      // Format the response
      const members = club.userClubs.map(uc => ({
        id: uc.id,
        userId: uc.userId,
        clubId: uc.clubId,
        role: uc.role,
        joinedAt: uc.joinedAt,
        isActive: uc.isActive,
        user: uc.user
      }));

      const events = club.events.map(event => ({
        ...event,
        registeredCount: event._count.eventRegistrations
      }));

      const admins = members.filter(member => member.role === ("admin" as ClubMemberRole));

      return {
        ...club,
        members,
        events,
        admins,
        recentActivities
      };
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch club details');
    }
  }

  async updateClub(clubId: string, updateData: UpdateClubData, updatedBy: string): Promise<Club> {
    try {
      // Check if user has permission to update club
      const userClub = await prisma.userClub.findFirst({
        where: {
          clubId,
          userId: updatedBy,
          role: { in: ["admin" as ClubMemberRole] },
          isActive: true
        }
      });

      if (!userClub) {
        throw new ApiError(403, 'You do not have permission to update this club');
      }

      const club = await prisma.club.update({
        where: { id: clubId },
        data: {
          ...updateData,
          category: updateData.category as ClubCategory,
          updatedAt: new Date()
        }
      });

      // Create activity log
      await this.createActivity(clubId, 'club_updated', 'Club Updated', 'Club information was updated', updatedBy);

      return club;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to update club');
    }
  }

  async deleteClub(clubId: string, deletedBy: string): Promise<void> {
    try {
      // Check if user has permission to delete club
      const userClub = await prisma.userClub.findFirst({
        where: {
          clubId,
          userId: deletedBy,
          role: "admin" as ClubMemberRole,
          isActive: true
        }
      });

      if (!userClub) {
        throw new ApiError(403, 'You do not have permission to delete this club');
      }

      await prisma.club.delete({
        where: { id: clubId }
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to delete club');
    }
  }

  async joinClub(request: JoinClubRequest): Promise<ClubMember> {
    try {
      const { userId, clubId, message } = request;

      // Check if club exists and is active
      const club = await prisma.club.findUnique({
        where: { id: clubId }
      });

      if (!club || !club.isActive) {
        throw new ApiError(404, 'Club not found or inactive');
      }

      // Check if user is already a member
      const existingMembership = await prisma.userClub.findFirst({
        where: { userId, clubId }
      });

      if (existingMembership) {
        if (existingMembership.isActive) {
          throw new ApiError(400, 'You are already a member of this club');
        } else {
          // Reactivate membership
          const reactivatedMembership = await prisma.userClub.update({
            where: { id: existingMembership.id },
            data: { isActive: true, joinedAt: new Date() }
          });

          // Update member count
          await prisma.club.update({
            where: { id: clubId },
            data: { memberCount: { increment: 1 } }
          });

          return this.formatClubMember(reactivatedMembership);
        }
      }

      // Create new membership
      const membership = await prisma.userClub.create({
        data: {
          userId,
          clubId,
          role: "member" as ClubMemberRole,
          isActive: true
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profileImage: true,
              department: true,
              yearOfStudy: true
            }
          }
        }
      });

      // Update member count
      await prisma.club.update({
        where: { id: clubId },
        data: { memberCount: { increment: 1 } }
      });

      // Create activity log
      await this.createActivity(clubId, 'member_joined', 'Member Joined', `${membership.user.firstName} ${membership.user.lastName} joined the club`, userId);

      return this.formatClubMember(membership);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to join club');
    }
  }

  async leaveClub(userId: string, clubId: string): Promise<void> {
    try {
      const membership = await prisma.userClub.findFirst({
        where: { userId, clubId, isActive: true }
      });

      if (!membership) {
        throw new ApiError(404, 'You are not a member of this club');
      }

      // Check if user is the last admin
      if (membership.role === ("admin" as ClubMemberRole)) {
        const adminCount = await prisma.userClub.count({
          where: {
            clubId,
            role: "president",
            isActive: true
          }
        });

        if (adminCount === 1) {
          throw new ApiError(400, 'Cannot leave club as the last admin. Please assign another admin first.');
        }
      }

      // Deactivate membership
      await prisma.userClub.update({
        where: { id: membership.id },
        data: { isActive: false }
      });

      // Update member count
      await prisma.club.update({
        where: { id: clubId },
        data: { memberCount: { decrement: 1 } }
      });

      // Create activity log
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true }
      });

      if (user) {
        await this.createActivity(clubId, 'member_left', 'Member Left', `${user.firstName} ${user.lastName} left the club`, userId);
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to leave club');
    }
  }

  async getClubMembers(clubId: string, filters: MemberFilters, page = 1, limit = 20): Promise<{ members: ClubMember[], total: number, totalPages: number }> {
    try {
      const skip = (page - 1) * limit;
      const where: any = { clubId, isActive: true };

      if (filters.role) where.role = filters.role;
      if (filters.isActive !== undefined) where.isActive = filters.isActive;

      if (filters.search || filters.department || filters.yearOfStudy) {
        where.user = {};
        if (filters.department) where.user.department = filters.department;
        if (filters.yearOfStudy) where.user.yearOfStudy = filters.yearOfStudy;
        
        if (filters.search) {
          where.user.OR = [
            { firstName: { contains: filters.search, mode: 'insensitive' } },
            { lastName: { contains: filters.search, mode: 'insensitive' } },
            { email: { contains: filters.search, mode: 'insensitive' } }
          ];
        }
      }

      const [members, total] = await Promise.all([
        prisma.userClub.findMany({
          where,
          skip,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profileImage: true,
                department: true,
                yearOfStudy: true
              }
            }
          },
          orderBy: [
            { role: 'desc' }, // Admins first
            { joinedAt: 'asc' }
          ]
        }),
        prisma.userClub.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        members: members.map(this.formatClubMember),
        total,
        totalPages
      };
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch club members');
    }
  }

  async updateMemberRole(clubId: string, memberId: string, newRole: ClubMemberRole, updatedBy: string): Promise<ClubMember> {
    try {
      // Check if updater has permission
      const updaterMembership = await prisma.userClub.findFirst({
        where: {
          clubId,
          userId: updatedBy,
          role: "admin" as ClubMemberRole,
          isActive: true
        }
      });

      if (!updaterMembership) {
        throw new ApiError(403, 'You do not have permission to update member roles');
      }

      // Update member role
      const membership = await prisma.userClub.update({
        where: { id: memberId },
        data: { role: newRole },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profileImage: true,
              department: true,
              yearOfStudy: true
            }
          }
        }
      });

      // Create activity log
      await this.createActivity(clubId, 'role_updated', 'Member Role Updated', 
        `${membership.user.firstName} ${membership.user.lastName} role changed to ${newRole}`, updatedBy);

      return this.formatClubMember(membership);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to update member role');
    }
  }

  async removeMember(clubId: string, memberId: string, removedBy: string): Promise<void> {
    try {
      // Check if remover has permission
      const removerMembership = await prisma.userClub.findFirst({
        where: {
          clubId,
          userId: removedBy,
          role: "admin" as ClubMemberRole,
          isActive: true
        }
      });

      if (!removerMembership) {
        throw new ApiError(403, 'You do not have permission to remove members');
      }

      // Get member details
      const membership = await prisma.userClub.findUnique({
        where: { id: memberId },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      });

      if (!membership) {
        throw new ApiError(404, 'Member not found');
      }

      // Check if trying to remove last admin
      if (membership.role === "admin" as ClubMemberRole) {
        const adminCount = await prisma.userClub.count({
          where: {
            clubId,
            role: "president",
            isActive: true
          }
        });

        if (adminCount === 1) {
          throw new ApiError(400, 'Cannot remove the last admin');
        }
      }

      // Remove member
      await prisma.userClub.update({
        where: { id: memberId },
        data: { isActive: false }
      });

      // Update member count
      await prisma.club.update({
        where: { id: clubId },
        data: { memberCount: { decrement: 1 } }
      });

      // Create activity log
      await this.createActivity(clubId, 'member_removed', 'Member Removed', 
        `${membership.user.firstName} ${membership.user.lastName} was removed from the club`, removedBy);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to remove member');
    }
  }

  async getClubStats(clubId: string): Promise<ClubStats> {
    try {
      const club = await prisma.club.findUnique({
        where: { id: clubId },
        include: {
          _count: {
            select: {
              userClubs: { where: { isActive: true } },
              events: true
            }
          }
        }
      });

      if (!club) {
        throw new ApiError(404, 'Club not found');
      }

      // Get event statistics
      const [totalEvents, upcomingEvents, completedEvents] = await Promise.all([
        prisma.event.count({ where: { clubId } }),
        prisma.event.count({ 
          where: { 
            clubId, 
            startDate: { gte: new Date() },
            isPublished: true 
          } 
        }),
        prisma.event.count({ 
          where: { 
            clubId, 
            endDate: { lt: new Date() } 
          } 
        })
      ]);

      // Calculate average attendance
      const eventAttendance = await prisma.event.findMany({
        where: { clubId, endDate: { lt: new Date() } },
        select: {
          _count: {
            select: {
              eventRegistrations: { where: { attended: true } }
            }
          },
          maxParticipants: true
        }
      });

      const averageAttendance = eventAttendance.length > 0
        ? eventAttendance.reduce((sum, event) => sum + event._count.eventRegistrations, 0) / eventAttendance.length
        : 0;

      // Get points and volunteer hours distributed
      const pointsAndHours = await prisma.eventRegistration.aggregate({
        where: {
          event: { clubId },
          attended: true
        },
        _sum: {
          pointsAwarded: true,
          volunteerHoursAwarded: true
        }
      });

      return {
        totalMembers: club.memberCount,
        activeMembers: club._count.userClubs,
        totalEvents,
        upcomingEvents,
        completedEvents,
        averageAttendance,
        totalPointsDistributed: pointsAndHours._sum.pointsAwarded || 0,
        totalVolunteerHours: pointsAndHours._sum.volunteerHoursAwarded || 0
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to fetch club stats');
    }
  }

  async getClubs(filters: ClubFilters, page = 1, limit = 20): Promise<ClubListResponse> {
    try {
      const skip = (page - 1) * limit;
      const where: any = {};

      if (filters.category) where.category = filters.category;
      if (filters.isActive !== undefined) where.isActive = filters.isActive;
      if (filters.minMembers) where.memberCount = { gte: filters.minMembers };
      if (filters.maxMembers) where.memberCount = { ...where.memberCount, lte: filters.maxMembers };

      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      if (filters.hasUpcomingEvents) {
        where.events = {
          some: {
            startDate: { gte: new Date() },
            isPublished: true
          }
        };
      }

      const [clubs, total] = await Promise.all([
        prisma.club.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
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

  async getClubAnalytics(clubId: string): Promise<ClubAnalytics> {
    try {
      // Membership growth over last 12 months
      const membershipGrowth = await prisma.$queryRaw`
        SELECT 
          TO_CHAR(DATE_TRUNC('month', joined_at), 'YYYY-MM') as month,
          COUNT(*) as count
        FROM user_clubs 
        WHERE club_id = ${clubId} 
          AND joined_at >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', joined_at)
        ORDER BY month
      `;

      // Event attendance rates
      const eventAttendance = await prisma.event.findMany({
        where: { clubId },
        select: {
          id: true,
          title: true,
          _count: {
            select: {
              eventRegistrations: true
            }
          }
        }
      });

      // Department distribution
      const departmentDistribution = await prisma.$queryRaw`
        SELECT 
          u.department,
          COUNT(*) as count
        FROM user_clubs uc
        JOIN users u ON uc.user_id = u.id
        WHERE uc.club_id = ${clubId} AND uc.is_active = true
        GROUP BY u.department
        ORDER BY count DESC
      `;

      // Year distribution
      const yearDistribution = await prisma.$queryRaw`
        SELECT 
          u.year_of_study as year,
          COUNT(*) as count
        FROM user_clubs uc
        JOIN users u ON uc.user_id = u.id
        WHERE uc.club_id = ${clubId} AND uc.is_active = true
        GROUP BY u.year_of_study
        ORDER BY year
      `;

      return {
        membershipGrowth: membershipGrowth as any,
        eventAttendance: eventAttendance.map(event => ({
          eventId: event.id,
          eventTitle: event.title,
          registered: event._count.eventRegistrations,
          attended: event._count.eventRegistrations, // This would need adjustment in actual query
          attendanceRate: event._count.eventRegistrations > 0 
            ? (event._count.eventRegistrations / event._count.eventRegistrations) * 100 
            : 0
        })),
        departmentDistribution: departmentDistribution as any,
        yearDistribution: yearDistribution as any
      };
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch club analytics');
    }
  }

  async getClubActivities(clubId: string, limit = 10): Promise<ClubActivity[]> {
    try {
      // This would typically come from an activities/audit log table
      // For now, we'll create a simplified version based on recent events
      const recentEvents = await prisma.event.findMany({
        where: { clubId },
        select: {
          id: true,
          title: true,
          createdAt: true,
          createdBy: true
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      const activities: ClubActivity[] = recentEvents.map(event => ({
        id: event.id,
        clubId,
        type: 'event_created',
        title: 'Event Created',
        description: event.title,
        timestamp: event.createdAt,
        userId: event.createdBy,
        eventId: event.id
      }));

      return activities;
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch club activities');
    }
  }

  private formatClubMember(membership: any): ClubMember {
    return {
      id: membership.id,
      userId: membership.userId,
      clubId: membership.clubId,
      role: membership.role,
      joinedAt: membership.joinedAt,
      isActive: membership.isActive,
      user: membership.user
    };
  }

  private async createActivity(
    clubId: string, 
    type: string, 
    title: string, 
    description: string, 
    userId?: string
  ): Promise<void> {
    // This would typically insert into an activities table
    // For now, we'll just log it (implement based on your activity tracking needs)
    console.log(`Activity: ${type} - ${title} - ${description}`);
  }
}