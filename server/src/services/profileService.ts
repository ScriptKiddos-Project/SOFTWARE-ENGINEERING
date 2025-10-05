import prisma from '../config/database';
import { hashPassword, verifyPasswordSecure, validatePasswordConfirmation } from '../utils/bcrypt';
import { uploadImage } from './fileService';
import { sendEmail } from './emailService';
import {
  UpdateProfileData,
  ChangePasswordData,
  UserDashboardStats,
  Activity
} from '../types';


export class ProfileError extends Error {
  constructor(message: string, public code: string, public statusCode: number = 400) {
    super(message);
    this.name = 'ProfileError';
  }
}

/**
 * Get user profile with related data
 */
export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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
      userClubs: {
        where: { isActive: true },
        include: {
          club: {
            select: {
              id: true,
              name: true,
              category: true,
              logoUrl: true
            }
          }
        }
      },
      eventRegistrations: {
        where: {
          event: {
            endDate: { gte: new Date() }
          }
        },
        take: 5,
        orderBy: { registrationDate: 'desc' },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
              location: true,
              imageUrl: true,
              club: {
                select: {
                  name: true,
                  logoUrl: true
                }
              }
            }
          }
        }
      },
      pointsHistory: {
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
      userBadges: {
        include: {
          badge: true
        }
      }
    }
  });

  if (!user) {
    throw new ProfileError('User not found', 'USER_NOT_FOUND', 404);
  }

  return user;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId: string, updateData: UpdateProfileData) => {
  // Check if student ID is already taken (if updating)
  if (updateData.studentId) {
    const existingUser = await prisma.user.findFirst({
      where: {
        studentId: updateData.studentId,
        id: { not: userId }
      }
    });

    if (existingUser) {
      throw new ProfileError('Student ID is already taken', 'STUDENT_ID_EXISTS', 409);
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...updateData,
      updatedAt: new Date()
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      studentId: true,
      phone: true,
      department: true,
      yearOfStudy: true,
      profileImage: true,
      updatedAt: true
    }
  });

  return updatedUser;
};

/**
 * Change user password
 */
export const changePassword = async (userId: string, passwordData: ChangePasswordData) => {
  const { currentPassword, newPassword, confirmPassword } = passwordData;

  // Validate password confirmation
  validatePasswordConfirmation(newPassword, confirmPassword);

  // Get user with current password hash
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, passwordHash: true }
  });

  if (!user) {
    throw new ProfileError('User not found', 'USER_NOT_FOUND', 404);
  }

  // Verify current password
  const isCurrentPasswordValid = await verifyPasswordSecure(currentPassword, user.passwordHash);
  if (!isCurrentPasswordValid) {
    throw new ProfileError('Current password is incorrect', 'INVALID_CURRENT_PASSWORD', 400);
  }

  // Hash new password
  const newPasswordHash = await hashPassword(newPassword);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: newPasswordHash,
      updatedAt: new Date()
    }
  });

  // Send password change notification email
  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Changed Successfully',
      template: 'password-changed',
      data: {
        timestamp: new Date().toLocaleString()
      }
    });
  } catch (error) {
    console.error('Failed to send password change notification:', error);
  }

  return { message: 'Password changed successfully' };
};

/**
 * Upload profile image
 */
export const uploadProfileImage = async (userId: string, file: Express.Multer.File) => {
  try {
    const uploadResult = await uploadImage(file, {
      folder: 'profile-images',
      width: 400,
      height: 400,
      crop: 'fill',
      gravity: 'face'
    });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profileImage: uploadResult.url,
        updatedAt: new Date()
      },
      select: {
        id: true,
        profileImage: true
      }
    });

    return updatedUser;
  } catch (error) {
    throw new ProfileError('Failed to upload profile image', 'UPLOAD_FAILED', 500);
  }
};

/**
 * Get user's joined clubs
 */
export const getUserClubs = async (userId: string) => {
  const userClubs = await prisma.userClub.findMany({
    where: {
      userId,
      isActive: true
    },
    include: {
      club: {
        include: {
          _count: {
            select: {
              userClubs: true,
              events: true
            }
          }
        }
      }
    },
    orderBy: { joinedAt: 'desc' }
  });

  return userClubs.map((uc: any)=> ({
    ...uc.club,
    memberRole: uc.role,
    joinedAt: uc.joinedAt,
    memberCount: uc.club._count.userClubs,
    eventCount: uc.club._count.events
  }));
};

/**
 * Get user's event registrations
 */
export const getUserEvents = async (userId: string, filter: 'upcoming' | 'past' | 'all' = 'all') => {
  let whereClause: any = { userId };

  if (filter === 'upcoming') {
    whereClause.event = { startDate: { gte: new Date() } };
  } else if (filter === 'past') {
    whereClause.event = { endDate: { lt: new Date() } };
  }

  const registrations = await prisma.eventRegistration.findMany({
    where: whereClause,
    include: {
      event: {
        include: {
          club: {
            select: {
              name: true,
              logoUrl: true
            }
          }
        }
      }
    },
    orderBy: { registrationDate: filter === 'past' ? 'desc' : 'asc' }
  });

  return registrations;
};

/**
 * Get user's points history
 */
export const getPointsHistory = async (userId: string, limit: number = 50) => {
  const pointsHistory = await prisma.pointsHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit
  });

  return pointsHistory;
};

/**
 * Get user's volunteer hours breakdown
 */
export const getVolunteerHours = async (userId: string) => {
  const hoursData = await prisma.eventRegistration.findMany({
    where: {
      userId,
      attended: true,
      volunteerHoursAwarded: { gt: 0 }
    },
    include: {
      event: {
        select: {
          title: true,
          startDate: true,
          eventType: true,
          club: {
            select: {
              name: true,
              category: true
            }
          }
        }
      }
    },
    orderBy: { attendanceMarkedAt: 'desc' }
  });

  // Calculate hours by category
  const hoursByCategory = hoursData.reduce((acc: any, reg: any) => {
    const category = reg.event.club.category;
    acc[category] = (acc[category] || 0) + Number(reg.volunteerHoursAwarded);
    return acc;
  }, {} as Record<string, number>);

  // Calculate hours by month for trends
  const hoursByMonth = hoursData.reduce((acc: any, reg: any) => {
    if (reg.attendanceMarkedAt) {
      const month = reg.attendanceMarkedAt.toISOString().substring(0, 7);
      acc[month] = (acc[month] || 0) + Number(reg.volunteerHoursAwarded);
    }
    return acc;
  }, {} as Record<string, number>);

  return {
    totalHours: hoursData.reduce((sum: any, reg: any) => sum + Number(reg.volunteerHoursAwarded), 0),
    hoursByCategory,
    hoursByMonth,
    recentActivities: hoursData.slice(0, 10)
  };
};

/**
 * Get user's earned badges
 */
export const getUserBadges = async (userId: string) => {
  const userBadges = await prisma.userBadge.findMany({
    where: { userId },
    include: {
      badge: true
    },
    orderBy: { earnedAt: 'desc' }
  });

  return userBadges;
};

/**
 * Get dashboard statistics for user
 */
export const getDashboardStats = async (userId: string): Promise<UserDashboardStats> => {
  const [
    user,
    clubsCount,
    upcomingEvents,
    recentBadges,
    recentActivities
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        totalPoints: true,
        totalVolunteerHours: true
      }
    }),
    prisma.userClub.count({
      where: { userId, isActive: true }
    }),
    prisma.eventRegistration.findMany({
      where: {
        userId,
        event: {
          startDate: { gte: new Date() }
        }
      },
      take: 5,
      orderBy: { registrationDate: 'desc' },
      include: {
        event: {
          include: {
            club: {
              select: { name: true, logoUrl: true }
            }
          }
        }
      }
    }),
    prisma.userBadge.findMany({
      where: { userId },
      take: 3,
      orderBy: { earnedAt: 'desc' },
      include: { badge: true }
    }),
    getRecentActivities(userId, 10)
  ]);

  if (!user) {
    throw new ProfileError('User not found', 'USER_NOT_FOUND', 404);
  }

  const attendedEventsCount = await prisma.eventRegistration.count({
    where: { userId, attended: true }
  });

  return {
    totalPoints: user.totalPoints,
    totalVolunteerHours: Number(user.totalVolunteerHours),
    joinedClubs: clubsCount,
    attendedEvents: attendedEventsCount,
    upcomingEvents: upcomingEvents.map((reg: any) => reg.event),
    recentActivities,
    earnedBadges: recentBadges
  };
};

/**
 * Get recent activities for user
 */
export const getRecentActivities = async (userId: string, limit: number = 20): Promise<Activity[]> => {
  const activities: Activity[] = [];

  // Get recent event registrations
  const recentRegistrations = await prisma.eventRegistration.findMany({
    where: { userId },
    take: Math.floor(limit / 2),
    orderBy: { registrationDate: 'desc' },
    include: {
      event: {
        select: {
          title: true,
          startDate: true
        }
      }
    }
  });

  // Get recent club joins
  const recentClubJoins = await prisma.userClub.findMany({
    where: { userId },
    take: Math.floor(limit / 2),
    orderBy: { joinedAt: 'desc' },
    include: {
      club: {
        select: {
          name: true
        }
      }
    }
  });

  // Get recent badge earnings
  const recentBadges = await prisma.userBadge.findMany({
    where: { userId },
    take: Math.floor(limit / 4),
    orderBy: { earnedAt: 'desc' },
    include: {
      badge: {
        select: {
          name: true,
          description: true
        }
      }
    }
  });

  // Convert to activities
  recentRegistrations.forEach((reg: any)=> {
    activities.push({
      id: `reg-${reg.id}`,
      type: 'event_registration',
      title: 'Registered for Event',
      description: `Registered for "${reg.event.title}"`,
      timestamp: reg.registrationDate,
      metadata: { eventTitle: reg.event.title }
    });
  });

  recentClubJoins.forEach((join: any )=> {
    activities.push({
      id: `club-${join.id}`,
      type: 'club_join',
      title: 'Joined Club',
      description: `Joined "${join.club.name}"`,
      timestamp: join.joinedAt,
      metadata: { clubName: join.club.name }
    });
  });

  recentBadges.forEach((badge: any) => {
    activities.push({
      id: `badge-${badge.id}`,
      type: 'badge_earned',
      title: 'Badge Earned',
      description: `Earned "${badge.badge.name}" badge`,
      timestamp: badge.earnedAt,
      metadata: { badgeName: badge.badge.name }
    });
  });

  // Sort by timestamp and limit
  return activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
};

/**
 * Check and award badges based on user activity
 */
export const checkAndAwardBadges = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      totalPoints: true,
      totalVolunteerHours: true,
      userClubs: { where: { isActive: true } },
      eventRegistrations: { where: { attended: true } }
    }
  });

  if (!user) return;

  const badges = await prisma.badge.findMany();
  const userBadges = await prisma.userBadge.findMany({
    where: { userId },
    select: { badgeId: true }
  });

  const earnedBadgeIds = new Set(userBadges.map((ub: any)=> ub.badgeId));
  const newBadges: string[] = [];

  for (const badge of badges) {
    if (earnedBadgeIds.has(badge.id)) continue;

    let earned = false;

    // Check badge criteria
    switch (badge.criteria) {
      case 'points_25':
        earned = user.totalPoints >= 25;
        break;
      case 'points_50':
        earned = user.totalPoints >= 50;
        break;
      case 'points_100':
        earned = user.totalPoints >= 100;
        break;
      case 'volunteer_10':
        earned = Number(user.totalVolunteerHours) >= 10;
        break;
      case 'volunteer_25':
        earned = Number(user.totalVolunteerHours) >= 25;
        break;
      case 'volunteer_50':
        earned = Number(user.totalVolunteerHours) >= 50;
        break;
      case 'events_5':
        earned = user.eventRegistrations.length >= 5;
        break;
      case 'events_15':
        earned = user.eventRegistrations.length >= 15;
        break;
      case 'clubs_3':
        earned = user.userClubs.length >= 3;
        break;
      case 'active_member':
        earned = user.userClubs.length >= 2 && user.eventRegistrations.length >= 10;
        break;
    }

    if (earned) {
      await prisma.userBadge.create({
        data: {
          userId,
          badgeId: badge.id,
          earnedAt: new Date()
        }
      });
      newBadges.push(badge.id);
    }
  }

  return newBadges;
};

/**
 * Delete user account (soft delete)
 */
export const deleteUserAccount = async (userId: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true, email: true }
  });

  if (!user) {
    throw new ProfileError('User not found', 'USER_NOT_FOUND', 404);
  }

  // Verify password for security
  const isPasswordValid = await verifyPasswordSecure(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new ProfileError('Invalid password', 'INVALID_PASSWORD', 400);
  }

  // Soft delete - deactivate account (Note: isActive field doesn't exist in schema, you may need to add it or use isSuspended/isBanned)
  await prisma.user.update({
    where: { id: userId },
    data: {
      isBanned: true,
      email: `deleted_${Date.now()}_${user.email}`,
      updatedAt: new Date()
    }
  });

  // Send account deletion confirmation email
  try {
    await sendEmail({
      to: user.email,
      subject: 'Account Deleted Successfully',
      template: 'account-deleted',
      data: {
        timestamp: new Date().toLocaleString()
      }
    });
  } catch (error) {
    console.error('Failed to send deletion confirmation:', error);
  }

  return { message: 'Account deleted successfully' };
};

export const profileService = {
  getUserProfile,
  updateUserProfile,
  changePassword,
  uploadProfileImage,
  getUserClubs,
  getUserEvents,
  getPointsHistory,
  getVolunteerHours,
  getUserBadges,
  getDashboardStats,
  getRecentActivities,
  checkAndAwardBadges,
  deleteUserAccount
};
