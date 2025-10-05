import prisma from '@/config/database';
import { Club, ClubCategory } from '@prisma/client';
import { AppError } from '@/middleware/errorHandler';

// Type definitions
interface CreateClubData {
  name: string;
  description?: string;
  category: ClubCategory;
  contactEmail?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  establishedYear?: number;
  meetingSchedule?: string;
  requirements?: string;
  tags?: string[];
}

interface UpdateClubData {
  name?: string;
  description?: string;
  category?: ClubCategory;
  contactEmail?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  establishedYear?: number;
  meetingSchedule?: string;
  requirements?: string;
  tags?: string[];
  isActive?: boolean;
}

interface ClubFilters {
  category?: ClubCategory;
  isActive?: boolean;
  search?: string;
  minMembers?: number;
  maxMembers?: number;
  hasUpcomingEvents?: boolean;
}

interface MemberFilters {
  role?: string;
  isActive?: boolean;
  search?: string;
  department?: string;
  yearOfStudy?: number;
}

interface JoinClubRequest {
  userId: string;
  clubId: string;
  message?: string;
}

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
        throw new AppError('Club with this name already exists', 400);
      }

      // Create club
      const clubCreateData: any = {
        name: clubData.name,
        description: clubData.description,
        category: clubData.category,
        contactEmail: clubData.contactEmail,
        logoUrl: clubData.logoUrl,
        coverImageUrl: clubData.coverImageUrl,
        establishedYear: clubData.establishedYear,
        meetingSchedule: clubData.meetingSchedule,
        requirements: clubData.requirements,
        tags: clubData.tags,
        createdBy,
        isActive: true,
        memberCount: 1
      };

      if (clubData.website) {
        clubCreateData.website = clubData.website;
      }

      if (clubData.socialLinks) {
        clubCreateData.socialLinks = clubData.socialLinks;
      }

      const club = await prisma.club.create({
        data: clubCreateData
      });

      // Add creator as admin
      await prisma.userClub.create({
        data: {
          userId: createdBy,
          clubId: club.id,
          role: 'president',
          isActive: true
        }
      });

      return club;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create club', 500);
    }
  }

  async getClubById(clubId: string): Promise<Club | null> {
    try {
      const club = await prisma.club.findUnique({
        where: { id: clubId }
      });

      return club;
    } catch (error) {
      throw new AppError('Failed to fetch club', 500);
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
                  profileImage: true,
                  department: true,
                  yearOfStudy: true
                }
              }
            },
            orderBy: { joinedAt: 'asc' }
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

      if (!club) return null;

      const members = club.userClubs.map((uc: any) => ({
        id: uc.id,
        userId: uc.userId,
        clubId: uc.clubId,
        role: uc.role,
        joinedAt: uc.joinedAt,
        isActive: uc.isActive,
        user: uc.user
      }));

      const clubEvents = club.events.map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        maxParticipants: event.maxParticipants,
        pointsReward: event.pointsReward,
        volunteerHours: event.volunteerHours,
        imageUrl: event.imageUrl,
        isPublished: event.isPublished,
        registeredCount: event._count.registrations
      }));

      const admins = members.filter((member: any) => 
        member.role === 'president' || member.role === 'vice_president'
      );

      return {
        ...club,
        members,
        events: clubEvents,
        admins
      };
    } catch (error) {
      throw new AppError('Failed to fetch club details', 500);
    }
  }

  async updateClub(clubId: string, updateData: UpdateClubData, updatedBy: string): Promise<Club> {
    try {
      // Check if user has permission to update club
      const userClub = await prisma.userClub.findFirst({
        where: {
          clubId,
          userId: updatedBy,
          role: { in: ['president', 'vice_president', 'secretary'] },
          isActive: true
        }
      });

      if (!userClub) {
        throw new AppError('You do not have permission to update this club', 403);
      }

      const club = await prisma.club.update({
        where: { id: clubId },
        data: {
          ...updateData,
          // socialLinks: updateData.socialLinks || {},
          updatedAt: new Date()
        }
      });

      return club;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update club', 500);
    }
  }

  async deleteClub(clubId: string, deletedBy: string): Promise<void> {
    try {
      // Check if user has permission to delete club
      const userClub = await prisma.userClub.findFirst({
        where: {
          clubId,
          userId: deletedBy,
          role: 'president',
          isActive: true
        }
      });

      if (!userClub) {
        throw new AppError('You do not have permission to delete this club', 403);
      }

      await prisma.club.delete({
        where: { id: clubId }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to delete club', 500);
    }
  }

  async joinClub(request: JoinClubRequest) {
    try {
      const { userId, clubId } = request;

      // Check if club exists and is active
      const club = await prisma.club.findUnique({
        where: { id: clubId }
      });

      if (!club || !club.isActive) {
        throw new AppError('Club not found or inactive', 404);
      }

      // Check if user is already a member
      const existingMembership = await prisma.userClub.findFirst({
        where: { userId, clubId }
      });

      if (existingMembership) {
        if (existingMembership.isActive) {
          throw new AppError('You are already a member of this club', 400);
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

          return reactivatedMembership;
        }
      }

      // Create new membership
      const membership = await prisma.userClub.create({
        data: {
          userId,
          clubId,
          role: 'member',
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

      return membership;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to join club', 500);
    }
  }

  async leaveClub(userId: string, clubId: string): Promise<void> {
    try {
      const membership = await prisma.userClub.findFirst({
        where: { userId, clubId, isActive: true }
      });

      if (!membership) {
        throw new AppError('You are not a member of this club', 404);
      }

      // Check if user is the last president
      if (membership.role === 'president') {
        const presidentCount = await prisma.userClub.count({
          where: {
            clubId,
            role: 'president',
            isActive: true
          }
        });

        if (presidentCount === 1) {
          throw new AppError('Cannot leave club as the last president. Please assign another president first.', 400);
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
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to leave club', 500);
    }
  }

  async getClubMembers(clubId: string, filters: MemberFilters, page = 1, limit = 20) {
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
            { joinedAt: 'asc' }
          ]
        }),
        prisma.userClub.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        members,
        total,
        totalPages
      };
    } catch (error) {
      throw new AppError('Failed to fetch club members', 500);
    }
  }

  async updateMemberRole(clubId: string, memberId: string, newRole: string, updatedBy: string) {
    try {
      // Check if updater has permission
      const updaterMembership = await prisma.userClub.findFirst({
        where: {
          clubId,
          userId: updatedBy,
          role: { in: ['president', 'vice_president'] },
          isActive: true
        }
      });

      if (!updaterMembership) {
        throw new AppError('You do not have permission to update member roles', 403);
      }

      // Update member role
      const membership = await prisma.userClub.update({
        where: { id: memberId },
        data: { role: newRole as any },
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

      return membership;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update member role', 500);
    }
  }

  async removeMember(clubId: string, memberId: string, removedBy: string): Promise<void> {
    try {
      // Check if remover has permission
      const removerMembership = await prisma.userClub.findFirst({
        where: {
          clubId,
          userId: removedBy,
          role: { in: ['president', 'vice_president'] },
          isActive: true
        }
      });

      if (!removerMembership) {
        throw new AppError('You do not have permission to remove members', 403);
      }

      // Get member details
      const membership = await prisma.userClub.findUnique({
        where: { id: memberId }
      });

      if (!membership) {
        throw new AppError('Member not found', 404);
      }

      // Check if trying to remove last president
      if (membership.role === 'president') {
        const presidentCount = await prisma.userClub.count({
          where: {
            clubId,
            role: 'president',
            isActive: true
          }
        });

        if (presidentCount === 1) {
          throw new AppError('Cannot remove the last president', 400);
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
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to remove member', 500);
    }
  }

  async getClubStats(clubId: string) {
    try {
      const club = await prisma.club.findUnique({
        where: { id: clubId },
        include: {
          _count: {
            select: {
              userClubs: true,
              events: true
            }
          }
        }
      });

      if (!club) {
        throw new AppError('Club not found', 404);
      }

      const [upcomingEvents, completedEvents] = await Promise.all([
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
        include: {
          _count: {
            select: {
              eventRegistrations: true
            }
          }
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
        totalEvents: club._count.events,
        upcomingEvents,
        completedEvents,
        averageAttendance,
        totalPointsDistributed: pointsAndHours._sum.pointsAwarded || 0,
        totalVolunteerHours: Number(pointsAndHours._sum.volunteerHoursAwarded) || 0
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch club stats', 500);
    }
  }

  async getClubs(filters: ClubFilters, page = 1, limit = 20) {
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
      throw new AppError('Failed to fetch clubs', 500);
    }
  }
}

export const clubService = new ClubService();