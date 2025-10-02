import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  User,
  CreateUserData,
  UpdateUserData,
  UserProfile,
  DashboardStats,
  RecentActivity,
  UserFilters,
  UserListResponse,
  UserRole,
  PointsHistory
} from '../types/user';
import { ApiError } from '../utils/errors';

const prisma = new PrismaClient();

export class UserService {
  async createUser(userData: CreateUserData): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        throw new ApiError(400, 'User with this email already exists');
      }

      // Check if student ID already exists (if provided)
      if (userData.studentId) {
        const existingStudentId = await prisma.user.findUnique({
          where: { studentId: userData.studentId }
        });

        if (existingStudentId) {
          throw new ApiError(400, 'Student ID already exists');
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          passwordHash: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          studentId: userData.studentId,
          phone: userData.phone,
          department: userData.department,
          yearOfStudy: userData.yearOfStudy,
          role: UserRole.STUDENT, // Fixed enum value
          isVerified: false,
          totalPoints: 0,
          totalVolunteerHours: 0
        }
      });

      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to create user');
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) return null;

      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch user');
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) return null;

      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch user');
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
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
                  category: true,
                  logoUrl: true
                }
              }
            },
            where: { isActive: true }
          },
          eventRegistrations: {
            include: {
              event: {
                select: {
                  id: true,
                  title: true,
                  startDate: true,
                  pointsReward: true,
                  volunteerHours: true
                }
              }
            },
            orderBy: { registrationDate: 'desc' },
            take: 10
          }
        }
      });

      if (!user) return null;

      // Get points history
      const pointsHistory = await this.getPointsHistory(userId);

      const { passwordHash, ...userWithoutPassword } = user;
      return {
        ...userWithoutPassword,
        pointsHistory,
        joinedClubs: user.userClubs,
        registeredEvents: user.eventRegistrations
      } as UserProfile;
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch user profile');
    }
  }

  async updateUser(userId: string, updateData: UpdateUserData): Promise<User> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          firstName: updateData.firstName,
          lastName: updateData.lastName,
          phone: updateData.phone,
          department: updateData.department,
          yearOfStudy: updateData.yearOfStudy,
          profileImage: updateData.profileImage,
          updatedAt: new Date()
        }
      });

      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    } catch (error) {
      throw new ApiError(500, 'Failed to update user');
    }
  }

  async updateUserRole(userId: string, role: UserRole): Promise<User> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { role }
      });

      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    } catch (error) {
      throw new ApiError(500, 'Failed to update user role');
    }
  }

  async verifyUser(userId: string): Promise<User> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { isVerified: true }
      });

      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    } catch (error) {
      throw new ApiError(500, 'Failed to verify user');
    }
  }

  async getDashboardStats(userId: string): Promise<DashboardStats> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          totalPoints: true,
          totalVolunteerHours: true
        }
      });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      const clubsJoined = await prisma.userClub.count({
        where: { userId, isActive: true }
      });

      const eventsAttended = await prisma.eventRegistration.count({
        where: { userId, attended: true }
      });

      const upcomingEvents = await prisma.eventRegistration.count({
        where: {
          userId,
          status: 'registered',
          event: { startDate: { gte: new Date() } }
        }
      });

      const recentActivities = await this.getRecentActivities(userId);

      return {
        totalPoints: user.totalPoints,
        totalVolunteerHours: user.totalVolunteerHours,
        clubsJoined,
        eventsAttended,
        upcomingEvents,
        recentActivities
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to fetch dashboard stats');
    }
  }

  async getRecentActivities(userId: string, limit = 10): Promise<RecentActivity[]> {
    try {
      const eventRegistrations = await prisma.eventRegistration.findMany({
        where: { userId },
        include: { event: { select: { title: true, pointsReward: true } } },
        orderBy: { registrationDate: 'desc' },
        take: limit
      });

      const clubJoins = await prisma.userClub.findMany({
        where: { userId },
        include: { club: { select: { name: true } } },
        orderBy: { joinedAt: 'desc' },
        take: limit
      });

      const activities: RecentActivity[] = [];

      eventRegistrations.forEach(reg => {
        activities.push({
          id: reg.id,
          type: reg.attended ? 'event_attendance' : 'event_registration',
          title: reg.attended ? 'Attended Event' : 'Registered for Event',
          description: reg.event.title,
          timestamp: reg.registrationDate,
          points: reg.attended ? reg.pointsAwarded ?? 0 : undefined
        });
      });

      clubJoins.forEach(join => {
        activities.push({
          id: join.id,
          type: 'club_join',
          title: 'Joined Club',
          description: join.club.name,
          timestamp: join.joinedAt
        });
      });

      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch recent activities');
    }
  }

  async getPointsHistory(userId: string): Promise<PointsHistory[]> {
    try {
      const history = await prisma.pointsHistory.findMany({
        where: { userId }
      });

      return history.map(record => ({
        id: record.id,
        userId: record.userId,
        eventId: record.eventId ?? '', // Ensure eventId is always a string
        pointsEarned: record.pointsEarned,
        volunteerHours: record.volunteerHoursEarned,
        earnedAt: record.createdAt,
        description: record.reason
      }));
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch points history');
    }
  }

  async addPoints(userId: string, points: number, volunteerHours: number = 0, reason = 'Manual Adjustment'): Promise<User> {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: {
            totalPoints: { increment: points },
            totalVolunteerHours: { increment: volunteerHours }
          }
        });

        await tx.pointsHistory.create({
          data: {
            userId,
            pointsEarned: points,
            volunteerHoursEarned: volunteerHours,
            reason
          }
        });
      });

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new ApiError(404, 'User not found');

      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    } catch (error) {
      throw new ApiError(500, 'Failed to add points');
    }
  }

  async getUsers(filters: UserFilters, page = 1, limit = 20): Promise<UserListResponse> {
    try {
      const skip = (page - 1) * limit;
      const where: any = {};

      if (filters.role) where.role = filters.role;
      if (filters.department) where.department = filters.department;
      if (filters.yearOfStudy) where.yearOfStudy = filters.yearOfStudy;
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
            updatedAt: true
          }
        }),
        prisma.user.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return { users: users as User[], total, page, limit, totalPages };
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch users');
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await prisma.user.delete({ where: { id: userId } });
    } catch (error) {
      throw new ApiError(500, 'Failed to delete user');
    }
  }

  async uploadProfileImage(userId: string, imageUrl: string): Promise<User> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { profileImage: imageUrl }
      });

      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    } catch (error) {
      throw new ApiError(500, 'Failed to upload profile image');
    }
  }

  async findByEmail(email: string) {
    return {
      id: '1',
      email,
      firstName: 'Test',
      lastName: 'User',
      studentId: '123',
      phone: '1234567890',
      department: 'Engineering',
      yearOfStudy: 2,
      isVerified: false,
      profileImage: '',
      totalPoints: 0,
      totalVolunteerHours: 0,
      passwordHash: 'hash',
      isActive: true,
      role: 'user',
      createdAt: new Date()
    };
  }

  async findByStudentId(studentId: string) {
    return {
      id: '2',
      email: 'student@example.com',
      firstName: 'Student',
      lastName: 'User',
      studentId,
      phone: '1234567890',
      department: 'Science',
      yearOfStudy: 3,
      isVerified: false,
      profileImage: '',
      totalPoints: 0,
      totalVolunteerHours: 0,
      passwordHash: 'hash',
      isActive: true,
      role: 'user',
      createdAt: new Date()
    };
  }

  async findById(id: string) {
    return {
      id,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      studentId: '123',
      phone: '1234567890',
      department: 'Engineering',
      yearOfStudy: 2,
      isVerified: false,
      profileImage: '',
      totalPoints: 0,
      totalVolunteerHours: 0,
      passwordHash: 'hash',
      isActive: true,
      role: 'user',
      createdAt: new Date()
    };
  }

  async updateLastLogin(id: string) {
    /* TODO: implement */
  }
}
