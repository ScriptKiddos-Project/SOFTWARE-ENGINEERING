import prisma from '../config/database';
import { sendEmail } from './emailService';

export enum NotificationType {
  EVENT_REMINDER = 'event_reminder',
  CLUB_ANNOUNCEMENT = 'club_announcement',
  SYSTEM_NOTIFICATION = 'system_notification',
  EVENT_REGISTRATION = 'event_registration',
  EVENT_CANCELLED = 'event_cancelled',
  ATTENDANCE_MARKED = 'attendance_marked',
  POINTS_AWARDED = 'points_awarded',
  BADGE_EARNED = 'badge_earned',
  CLUB_INVITATION = 'club_invitation',
  ROLE_CHANGED = 'role_changed'
}

interface NotificationData {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  actionUrl?: string;
  sendEmail?: boolean;
}

interface BulkNotificationData {
  userIds: string[];
  title: string;
  message: string;
  type: NotificationType;
  actionUrl?: string;
  sendEmail?: boolean;
}

/**
 * Create a notification for a user
 */
export const createNotification = async (data: NotificationData) => {
  const { userId, title, message, type, actionUrl, sendEmail: shouldSendEmail } = data;

  // Create in-app notification
  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      actionUrl,
      isRead: false
    }
  });

  // Send email notification if requested
  if (shouldSendEmail) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, firstName: true }
      });

      if (user) {
        await sendEmail({
          to: user.email,
          subject: title,
          template: 'notification',
          data: {
            firstName: user.firstName,
            title,
            message,
            actionUrl
          }
        });
      }
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  return notification;
};

/**
 * Create bulk notifications for multiple users
 */
export const createBulkNotifications = async (data: BulkNotificationData) => {
  const { userIds, title, message, type, actionUrl, sendEmail: shouldSendEmail } = data;

  // Create in-app notifications
  const notifications = await prisma.notification.createMany({
    data: userIds.map(userId => ({
      userId,
      title,
      message,
      type,
      actionUrl,
      isRead: false
    }))
  });

  // Send email notifications if requested
  if (shouldSendEmail) {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { email: true, firstName: true }
    });

    for (const user of users) {
      try {
        await sendEmail({
          to: user.email,
          subject: title,
          template: 'notification',
          data: {
            firstName: user.firstName,
            title,
            message,
            actionUrl
          }
        });
      } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error);
      }
    }
  }

  return notifications;
};

/**
 * Get user notifications
 */
export const getUserNotifications = async (
  userId: string,
  limit: number = 20,
  offset: number = 0
) => {
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    }),
    prisma.notification.count({ where: { userId } })
  ]);

  return { notifications, total };
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (userId: string) => {
  return await prisma.notification.count({
    where: { userId, isRead: false }
  });
};

/**
 * Mark notification as read
 */
export const markAsRead = async (notificationId: string, userId: string) => {
  return await prisma.notification.update({
    where: { id: notificationId, userId },
    data: { isRead: true }
  });
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (userId: string) => {
  return await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true }
  });
};

/**
 * Delete notification
 */
export const deleteNotification = async (notificationId: string, userId: string) => {
  return await prisma.notification.delete({
    where: { id: notificationId, userId }
  });
};

/**
 * Delete all notifications for user
 */
export const deleteAllNotifications = async (userId: string) => {
  return await prisma.notification.deleteMany({
    where: { userId }
  });
};

/**
 * Notify user about event registration
 */
export const notifyEventRegistration = async (userId: string, eventId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { club: { select: { name: true } } }
  });

  if (!event) return;

  await createNotification({
    userId,
    title: 'Event Registration Confirmed',
    message: `You have successfully registered for "${event.title}" by ${event.club.name}`,
    type: NotificationType.EVENT_REGISTRATION,
    actionUrl: `/events/${eventId}`,
    sendEmail: true
  });
};

/**
 * Notify user about event cancellation
 */
export const notifyEventCancellation = async (eventId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      club: { select: { name: true } },
      eventRegistrations: { select: { userId: true } }
    }
  });

  if (!event) return;

  const userIds = event.eventRegistrations.map(r => r.userId);

  await createBulkNotifications({
    userIds,
    title: 'Event Cancelled',
    message: `The event "${event.title}" by ${event.club.name} has been cancelled`,
    type: NotificationType.EVENT_CANCELLED,
    actionUrl: `/events/${eventId}`,
    sendEmail: true
  });
};

/**
 * Send event reminder
 */
export const sendEventReminder = async (eventId: string, hoursBefore: number = 24) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      club: { select: { name: true } },
      eventRegistrations: { 
        where: { status: 'registered' },
        select: { userId: true } 
      }
    }
  });

  if (!event) return;

  const userIds = event.eventRegistrations.map(r => r.userId);

  await createBulkNotifications({
    userIds,
    title: 'Event Reminder',
    message: `"${event.title}" by ${event.club.name} starts in ${hoursBefore} hours`,
    type: NotificationType.EVENT_REMINDER,
    actionUrl: `/events/${eventId}`,
    sendEmail: true
  });
};

/**
 * Notify user about attendance marked
 */
export const notifyAttendanceMarked = async (userId: string, eventId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { club: { select: { name: true } } }
  });

  if (!event) return;

  await createNotification({
    userId,
    title: 'Attendance Confirmed',
    message: `Your attendance for "${event.title}" has been confirmed. Points will be awarded soon.`,
    type: NotificationType.ATTENDANCE_MARKED,
    actionUrl: `/events/${eventId}`,
    sendEmail: true
  });
};

/**
 * Notify user about points awarded
 */
export const notifyPointsAwarded = async (
  userId: string,
  points: number,
  volunteerHours: number,
  eventId?: string
) => {
  await createNotification({
    userId,
    title: 'Points Awarded',
    message: `You earned ${points} points${volunteerHours > 0 ? ` and ${volunteerHours} volunteer hours` : ''}!`,
    type: NotificationType.POINTS_AWARDED,
    actionUrl: eventId ? `/events/${eventId}` : '/profile',
    sendEmail: false
  });
};

/**
 * Notify user about badge earned
 */
export const notifyBadgeEarned = async (userId: string, badgeName: string) => {
  await createNotification({
    userId,
    title: 'New Badge Earned!',
    message: `Congratulations! You earned the "${badgeName}" badge`,
    type: NotificationType.BADGE_EARNED,
    actionUrl: '/profile/badges',
    sendEmail: true
  });
};

/**
 * Notify club members about announcement
 */
export const notifyClubAnnouncement = async (
  clubId: string,
  title: string,
  message: string
) => {
  const members = await prisma.userClub.findMany({
    where: { clubId, isActive: true },
    select: { userId: true }
  });

  const userIds = members.map(m => m.userId);

  await createBulkNotifications({
    userIds,
    title,
    message,
    type: NotificationType.CLUB_ANNOUNCEMENT,
    actionUrl: `/clubs/${clubId}`,
    sendEmail: false
  });
};

/**
 * Notify user about role change
 */
export const notifyRoleChange = async (
  userId: string,
  clubName: string,
  newRole: string
) => {
  await createNotification({
    userId,
    title: 'Role Updated',
    message: `Your role in ${clubName} has been updated to ${newRole}`,
    type: NotificationType.ROLE_CHANGED,
    actionUrl: '/profile/clubs',
    sendEmail: true
  });
};

export const notificationService = {
  createNotification,
  createBulkNotifications,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  notifyEventRegistration,
  notifyEventCancellation,
  sendEventReminder,
  notifyAttendanceMarked,
  notifyPointsAwarded,
  notifyBadgeEarned,
  notifyClubAnnouncement,
  notifyRoleChange
};