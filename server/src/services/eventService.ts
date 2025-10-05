import { PrismaClient } from '@prisma/client';
import { ApiError } from '../utils/helpers';
import { sendEmail } from './emailService';
import { notificationService, NotificationType } from './notificationService';

const prisma = new PrismaClient();

export class EventService {
  async getAllEvents(filters: {
    clubId?: string;
    category?: string;
    eventType?: string;
    startDate?: Date;
    endDate?: Date;
    tags?: string[];
    skillAreas?: string[];
    isPublished?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const {
      clubId,
      category,
      eventType,
      startDate,
      endDate,
      tags,
      skillAreas,
      isPublished = true,
      limit = 50,
      offset = 0
    } = filters;

    const where: any = {
      isPublished: isPublished
    };

    if (clubId) where.clubId = clubId;
    if (eventType) where.eventType = eventType;
    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) where.startDate.gte = startDate;
      if (endDate) where.startDate.lte = endDate;
    }
    if (tags && tags.length > 0) {
      where.tags = { hasEvery: tags };
    }
    if (skillAreas && skillAreas.length > 0) {
      where.skillAreas = { hasEvery: skillAreas };
    }

    if (category) {
      where.club = {
        category: category
      };
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        club: {
          select: {
            id: true,
            name: true,
            category: true,
            logoUrl: true
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
      },
      orderBy: {
        startDate: 'asc'
      },
      skip: offset,
      take: limit
    });

    return events.map(event => ({
      ...event,
      registrationCount: event._count.eventRegistrations
    }));
  }

  async getEventById(eventId: string, userId?: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            category: true,
            logoUrl: true,
            coverImageUrl: true,
            description: true,
            contactEmail: true
          }
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true
          }
        },
        _count: {
          select: {
            eventRegistrations: true
          }
        }
      }
    });

    if (!event) {
      throw new ApiError('Event not found', 404);
    }

    let userRegistration = null;
    if (userId) {
      userRegistration = await prisma.eventRegistration.findUnique({
        where: {
          userId_eventId: {
            userId: userId,
            eventId: eventId
          }
        }
      });
    }

    return {
      ...event,
      registrationCount: event._count.eventRegistrations,
      userRegistration: userRegistration,
      isRegistered: !!userRegistration,
      canRegister: this.canUserRegister(event, userRegistration),
      isPast: new Date() > event.endDate
    };
  }

  async createEvent(eventData: {
    title: string;
    description?: string;
    clubId: string;
    eventType: string;
    startDate: Date;
    endDate: Date;
    location?: string;
    maxParticipants?: number;
    registrationDeadline?: Date;
    pointsReward?: number;
    volunteerHours?: number;
    imageUrl?: string;
    tags?: string[];
    skillAreas?: string[];
    requiresApproval?: boolean;
    createdBy: string;
  }) {
    if (eventData.startDate >= eventData.endDate) {
      throw new ApiError('End date must be after start date', 400);
    }

    if (eventData.registrationDeadline && eventData.registrationDeadline > eventData.startDate) {
      throw new ApiError('Registration deadline must be before event start date', 400);
    }

    const userClub = await prisma.userClub.findUnique({
      where: {
        userId_clubId: {
          userId: eventData.createdBy,
          clubId: eventData.clubId
        }
      }
    });

    if (!userClub || !['president', 'vice_president', 'secretary'].includes(userClub.role)) {
      throw new ApiError('Insufficient permissions to create events for this club', 403);
    }

    const event = await prisma.event.create({
      data: {
        title: eventData.title,
        description: eventData.description,
        clubId: eventData.clubId,
        eventType: eventData.eventType as any,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        location: eventData.location,
        maxParticipants: eventData.maxParticipants,
        registrationDeadline: eventData.registrationDeadline,
        pointsReward: eventData.pointsReward || 0,
        volunteerHours: eventData.volunteerHours || 0,
        imageUrl: eventData.imageUrl,
        tags: eventData.tags || [],
        skillAreas: eventData.skillAreas || [],
        requiresApproval: eventData.requiresApproval || false,
        createdBy: eventData.createdBy,
        isPublished: true
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            category: true
          }
        }
      }
    });

    await this.notifyClubMembers(event.clubId, {
      eventId: event.id,
      eventTitle: event.title,
      clubName: event.club.name,
      startDate: event.startDate
    });

    return event;
  }

  async updateEvent(eventId: string, userId: string, updateData: any) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        club: true
      }
    });

    if (!event) {
      throw new ApiError('Event not found', 404);
    }

    const userClub = await prisma.userClub.findUnique({
      where: {
        userId_clubId: {
          userId: userId,
          clubId: event.clubId
        }
      }
    });

    if (!userClub || !['president', 'vice_president', 'secretary'].includes(userClub.role)) {
      throw new ApiError('Insufficient permissions to update this event', 403);
    }

    if (new Date() > event.endDate) {
      throw new ApiError('Cannot update past events', 400);
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            category: true
          }
        }
      }
    });

    return updatedEvent;
  }

  async deleteEvent(eventId: string, userId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        club: true,
        _count: {
          select: {
            eventRegistrations: true
          }
        }
      }
    });

    if (!event) {
      throw new ApiError('Event not found', 404);
    }

    const userClub = await prisma.userClub.findUnique({
      where: {
        userId_clubId: {
          userId: userId,
          clubId: event.clubId
        }
      }
    });

    if (!userClub || userClub.role !== 'president') {
      throw new ApiError('Only club presidents can delete events', 403);
    }

    const daysTillEvent = Math.ceil((event.startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (event._count.eventRegistrations > 0 && daysTillEvent < 7) {
      throw new ApiError('Cannot delete event with registrations less than 7 days before start date', 400);
    }

    if (event._count.eventRegistrations > 0) {
      await this.notifyRegisteredUsers(eventId, {
        eventTitle: event.title,
        clubName: event.club.name,
        startDate: event.startDate
      });
    }

    await prisma.event.delete({
      where: { id: eventId }
    });

    return { message: 'Event deleted successfully' };
  }

  async registerForEvent(eventId: string, userId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        club: true,
        _count: {
          select: {
            eventRegistrations: true
          }
        }
      }
    });

    if (!event) {
      throw new ApiError('Event not found', 404);
    }

    if (!event.isPublished) {
      throw new ApiError('Event is not published yet', 400);
    }

    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      throw new ApiError('Registration deadline has passed', 400);
    }

    if (new Date() > event.startDate) {
      throw new ApiError('Cannot register for event that has already started', 400);
    }

    const existingRegistration = await prisma.eventRegistration.findUnique({
      where: {
        userId_eventId: {
          userId: userId,
          eventId: eventId
        }
      }
    });

    if (existingRegistration) {
      throw new ApiError('User is already registered for this event', 400);
    }

    if (event.maxParticipants && event._count.eventRegistrations >= event.maxParticipants) {
      throw new ApiError('Event has reached maximum capacity', 400);
    }

    const registration = await prisma.eventRegistration.create({
      data: {
        userId: userId,
        eventId: eventId,
        status: event.requiresApproval ? 'registered' : 'registered'
      }
    });

    await notificationService.notifyEventRegistration(userId, eventId);

    return registration;
  }

  async unregisterFromEvent(eventId: string, userId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new ApiError('Event not found', 404);
    }

    if (new Date() > event.startDate) {
      throw new ApiError('Cannot unregister from event that has already started', 400);
    }

    const registration = await prisma.eventRegistration.findUnique({
      where: {
        userId_eventId: {
          userId: userId,
          eventId: eventId
        }
      }
    });

    if (!registration) {
      throw new ApiError('User is not registered for this event', 400);
    }

    await prisma.eventRegistration.delete({
      where: {
        userId_eventId: {
          userId: userId,
          eventId: eventId
        }
      }
    });

    return { message: 'Successfully unregistered from event' };
  }

  async getEventRegistrations(eventId: string, userId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { clubId: true }
    });

    if (!event) {
      throw new ApiError('Event not found', 404);
    }

    const userClub = await prisma.userClub.findUnique({
      where: {
        userId_clubId: {
          userId: userId,
          clubId: event.clubId
        }
      }
    });

    if (!userClub || !['president', 'vice_president', 'secretary'].includes(userClub.role)) {
      throw new ApiError('Insufficient permissions to view event registrations', 403);
    }

    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId: eventId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            studentId: true,
            department: true,
            yearOfStudy: true,
            profileImage: true
          }
        }
      },
      orderBy: {
        registrationDate: 'asc'
      }
    });

    return registrations;
  }

  async getCalendarEvents(filters: {
    userId?: string;
    clubIds?: string[];
    start: Date;
    end: Date;
  }) {
    const { userId, clubIds, start, end } = filters;

    const where: any = {
      startDate: {
        gte: start,
        lte: end
      },
      isPublished: true
    };

    if (clubIds && clubIds.length > 0) {
      where.clubId = { in: clubIds };
    }

    const events = await prisma.event.findMany({
      where,
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
        location: true,
        club: {
          select: {
            name: true,
            category: true
          }
        }
      }
    });

    if (userId) {
      const registrations = await prisma.eventRegistration.findMany({
        where: {
          userId: userId,
          eventId: { in: events.map(e => e.id) }
        },
        select: {
          eventId: true,
          status: true,
          attended: true
        }
      });

      const registrationMap = new Map(
        registrations.map(r => [r.eventId, r])
      );

      return events.map(event => ({
        ...event,
        registration: registrationMap.get(event.id) || null
      }));
    }

    return events;
  }

  private canUserRegister(event: any, userRegistration: any): boolean {
    if (userRegistration) return false;
    if (!event.isPublished) return false;
    if (new Date() > event.startDate) return false;
    if (event.registrationDeadline && new Date() > event.registrationDeadline) return false;
    
    return true;
  }

  private async notifyClubMembers(clubId: string, data: {
    eventId: string;
    eventTitle: string;
    clubName: string;
    startDate: Date;
  }) {
    const members = await prisma.userClub.findMany({
      where: { 
        clubId: clubId,
        isActive: true
      },
      select: {
        userId: true
      }
    });

    const userIds = members.map(m => m.userId);

    await notificationService.createBulkNotifications({
      userIds,
      title: `New Event: ${data.eventTitle}`,
      message: `${data.clubName} has created a new event starting ${data.startDate.toLocaleDateString()}`,
      type: NotificationType.CLUB_ANNOUNCEMENT,
      actionUrl: `/events/${data.eventId}`,
      sendEmail: false
    });
  }

  private async notifyRegisteredUsers(eventId: string, data: {
    eventTitle: string;
    clubName: string;
    startDate: Date;
  }) {
    await notificationService.notifyEventCancellation(eventId);
  }
}

export const eventService = new EventService();