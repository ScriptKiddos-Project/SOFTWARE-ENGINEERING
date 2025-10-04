import { PrismaClient } from '@prisma/client';
import { ApiError } from '../utils/helpers';
import { emailService } from './emailService';
import { notificationService } from './notificationService';

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
      registration_count: event._count.eventRegistrations
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
      throw new ApiError(404, 'Event not found');
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
      registration_count: event._count.eventRegistrations,
      user_registration: userRegistration,
      is_registered: !!userRegistration,
      can_register: this.canUserRegister(event, userRegistration),
      is_past: new Date() > event.endDate
    };
  }

  async createEvent(eventData: {
    title: string;
    description?: string;
    club_id: string;
    event_type: string;
    start_date: Date;
    end_date: Date;
    location?: string;
    max_participants?: number;
    registration_deadline?: Date;
    points_reward?: number;
    volunteer_hours?: number;
    image_url?: string;
    tags?: string[];
    skill_areas?: string[];
    requires_approval?: boolean;
    created_by: string;
  }) {
    if (eventData.start_date >= eventData.end_date) {
      throw new ApiError(400, 'End date must be after start date');
    }

    if (eventData.registration_deadline && eventData.registration_deadline > eventData.start_date) {
      throw new ApiError(400, 'Registration deadline must be before event start date');
    }

    const userClub = await prisma.userClub.findUnique({
      where: {
        userId_clubId: {
          userId: eventData.created_by,
          clubId: eventData.club_id
        }
      }
    });

    if (!userClub || !['president', 'vice_president', 'secretary'].includes(userClub.role)) {
      throw new ApiError(403, 'Insufficient permissions to create events for this club');
    }

    const event = await prisma.event.create({
      data: {
        title: eventData.title,
        description: eventData.description,
        clubId: eventData.club_id,
        eventType: eventData.event_type as any,
        startDate: eventData.start_date,
        endDate: eventData.end_date,
        location: eventData.location,
        maxParticipants: eventData.max_participants,
        registrationDeadline: eventData.registration_deadline,
        pointsReward: eventData.points_reward || 0,
        volunteerHours: eventData.volunteer_hours || 0,
        imageUrl: eventData.image_url,
        tags: eventData.tags || [],
        skillAreas: eventData.skill_areas || [],
        requiresApproval: eventData.requires_approval || false,
        createdBy: eventData.created_by,
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

    await this.notifyClubMembers(event.clubId, 'new_event', {
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
      throw new ApiError(404, 'Event not found');
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
      throw new ApiError(403, 'Insufficient permissions to update this event');
    }

    if (new Date() > event.endDate) {
      throw new ApiError(400, 'Cannot update past events');
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
      throw new ApiError(404, 'Event not found');
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
      throw new ApiError(403, 'Only club presidents can delete events');
    }

    const daysTillEvent = Math.ceil((event.startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (event._count.eventRegistrations > 0 && daysTillEvent < 7) {
      throw new ApiError(400, 'Cannot delete event with registrations less than 7 days before start date');
    }

    if (event._count.eventRegistrations > 0) {
      await this.notifyRegisteredUsers(eventId, 'event_cancelled', {
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
      throw new ApiError(404, 'Event not found');
    }

    if (!event.isPublished) {
      throw new ApiError(400, 'Event is not published yet');
    }

    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      throw new ApiError(400, 'Registration deadline has passed');
    }

    if (new Date() > event.startDate) {
      throw new ApiError(400, 'Cannot register for event that has already started');
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
      throw new ApiError(400, 'User is already registered for this event');
    }

    if (event.maxParticipants && event._count.eventRegistrations >= event.maxParticipants) {
      throw new ApiError(400, 'Event has reached maximum capacity');
    }

    const registration = await prisma.eventRegistration.create({
      data: {
        userId: userId,
        eventId: eventId,
        status: event.requiresApproval ? 'registered' : 'registered'
      }
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true }
    });

    if (user) {
      await emailService.sendEventRegistrationConfirmation(
        user.email,
        user.firstName,
        event.title,
        event.startDate,
        event.location
      );
    }

    return registration;
  }

  async unregisterFromEvent(eventId: string, userId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new ApiError(404, 'Event not found');
    }

    if (new Date() > event.startDate) {
      throw new ApiError(400, 'Cannot unregister from event that has already started');
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
      throw new ApiError(400, 'User is not registered for this event');
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
      throw new ApiError(404, 'Event not found');
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
      throw new ApiError(403, 'Insufficient permissions to view event registrations');
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

  private async notifyClubMembers(clubId: string, type: string, data: any) {
    const members = await prisma.userClub.findMany({
      where: { 
        clubId: clubId,
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true
          }
        }
      }
    });

    for (const member of members) {
      await notificationService.createNotification({
        user_id: member.user.id,
        type,
        title: `New Event: ${data.eventTitle}`,
        message: `${data.clubName} has created a new event starting ${data.startDate.toLocaleDateString()}`,
        data: {
          clubId,
          eventTitle: data.eventTitle
        }
      });
    }
  }

  private async notifyRegisteredUsers(eventId: string, type: string, data: any) {
    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId: eventId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true
          }
        }
      }
    });

    for (const registration of registrations) {
      await notificationService.createNotification({
        user_id: registration.user.id,
        type,
        title: `Event Cancelled: ${data.eventTitle}`,
        message: `The event "${data.eventTitle}" by ${data.clubName} has been cancelled.`,
        data: {
          eventId,
          eventTitle: data.eventTitle
        }
      });

      await emailService.sendEventCancellationEmail(
        registration.user.email,
        registration.user.firstName,
        data.eventTitle,
        data.startDate
      );
    }
  }
}

export const eventService = new EventService();