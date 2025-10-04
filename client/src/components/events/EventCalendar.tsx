// client/src/components/events/EventCalendar.tsx
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput } from '@fullcalendar/core';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { useEvents } from '../../hooks/useEvents';
import type { Event } from '../../types/event';
import { format } from 'date-fns';

interface EventCalendarProps {
  onEventClick?: (event: Event) => void;
  height?: string;
  initialView?: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';
}

export const EventCalendar: React.FC<EventCalendarProps> = ({
  onEventClick,
  height = '600px',
  initialView = 'dayGridMonth',
}) => {
  const { events, refetch } = useEvents();
  const [calendarEvents, setCalendarEvents] = useState<EventInput[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    // Convert events to FullCalendar format
    const formattedEvents: EventInput[] = events.map(event => ({
      id: event.id,
      title: event.title,
      start: event.startDate,
      end: event.endDate,
      // No category property on Event, so use default color
      backgroundColor: getCategoryColor('default'),
      borderColor: getCategoryColor('default'),
      textColor: '#ffffff',
      extendedProps: {
        description: event.description,
        location: event.location,
        club: (event as any).club ?? null,
        pointsReward: event.pointsReward,
        // isRegistered, category, currentParticipants removed (not in Event type)
        eventType: event.eventType,
        maxParticipants: event.maxParticipants,
      },
    }));
    
    setCalendarEvents(formattedEvents);
  }, [events]);

  const getCategoryColor = (category: string): string => {
    // Only default color available due to missing category
    return '#6b7280';
  };

  const handleEventClick = (clickInfo: any) => {
    const event = events.find(e => e.id === clickInfo.event.id);
    if (event) {
      setSelectedEvent(event);
      onEventClick?.(event);
    }
  };

  const handleDateSelect = (selectInfo: any) => {
    // You could implement event creation here
    console.log('Date selected:', selectInfo.startStr, selectInfo.endStr);
  };

  const EventPopover = ({ event }: { event: Event }) => (
    <div className="p-4 max-w-sm space-y-3">
      <div className="space-y-2">
        <h4 className="font-semibold text-lg">{event.title}</h4>
        <div className="flex items-center gap-2">
          {/* No category property */}
          <Badge variant="outline" className="text-xs">
            {event.eventType}
          </Badge>
        </div>
      </div>

      {event.description && (
        <p className="text-sm text-gray-600 line-clamp-2">
          {event.description}
        </p>
      )}

      <div className="space-y-1 text-sm">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-gray-400" />
          <span>
            {format(new Date(event.startDate), 'MMM d, yyyy • h:mm a')}
            {event.endDate && 
              ` - ${format(new Date(event.endDate), 'h:mm a')}`
            }
          </span>
        </div>
        
        {event.location && (
          <div className="flex items-center gap-2">
            <span className="text-gray-400">📍</span>
            <span>{event.location}</span>
          </div>
        )}

        {(event as any).club && (
          <div className="flex items-center gap-2">
            <span className="text-gray-400">🏢</span>
            <span>{(event as any).club?.name ?? ''}</span>
          </div>
        )}

  {(event.pointsReward ?? 0) > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-gray-400">⭐</span>
            <span>{event.pointsReward} points</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Button size="sm" variant="default" className="flex-1">
          Register
        </Button>
        <Button size="sm" variant="outline">
          View Details
        </Button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Event Calendar</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          initialView={initialView}
          editable={false}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={calendarEvents}
          eventClick={handleEventClick}
          select={handleDateSelect}
          height={height}
          eventDisplay="block"
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            omitZeroMinute: false,
            hour12: true
          }}
          // eventDidMount removed: isRegistered not available on Event
        />
      </div>

      {/* Event Details Popover */}
      {selectedEvent && (
        <Popover open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <PopoverTrigger asChild>
            <div /> {/* Invisible trigger */}
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <EventPopover event={selectedEvent} />
          </PopoverContent>
        </Popover>
      )}

      {/* Calendar Legend */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span>Technical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-purple-500"></div>
            <span>Cultural</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span>Sports</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-500"></div>
            <span>Academic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-pink-500"></div>
            <span>Social</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500"></div>
            <span>Volunteer</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-600">
          Events with green borders indicate your registrations
        </div>
      </div>
    </div>
  );
};