// import React from 'react';
import * as React from 'react';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';

// UI components: go up one folder to 'ui' (assuming 'someFolder' is inside 'components')
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

// Types: assuming 'types' is at 'client/src/types'
import { Event } from '../../types';

// Utils: assuming 'utils' is at 'client/src/utils'
import { dateUtils } from '../../utils/dateUtils';


interface EventTimelineProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
  className?: string;
}

export const EventTimeline: React.FC<EventTimelineProps> = ({
  events,
  onEventClick,
  className = ''
}) => {
  const groupedEvents = groupEventsByDate(events);

  return (
    <div className={`space-y-6 ${className}`}>
      {Object.entries(groupedEvents).map(([date, dayEvents]) => (
        <div key={date} className="relative">
          <div className="sticky top-0 bg-white z-10 pb-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {getDateLabel(date)}
            </h3>
          </div>
          
          <div className="space-y-3">
            {dayEvents.map((event, index) => (
              <Card 
                key={event.id}
                className="cursor-pointer hover:shadow-md transition-shadow duration-200"
                onClick={() => onEventClick?.(event)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Clock className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-medium text-gray-900 truncate">
                          {event.title}
                        </h4>
                        <Badge variant={event.eventType === 'WORKSHOP' ? 'default' : 'secondary'}>
                          {event.eventType}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={event.club?.logoUrl} alt={event.club?.name} />
                          <AvatarFallback>{event.club?.name ? event.club.name.charAt(0) : '?'}</AvatarFallback>
                        </Avatar>
                        <span>{event.club?.name}</span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{dateUtils.formatTime(event.startDate)} - {dateUtils.formatTime(event.endDate)}</span>
                        </div>
                        
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{('registeredCount' in event ? (event as any).registeredCount : 0)}/{event.maxParticipants ?? '∞'}</span>
                        </div>
                      </div>
                      
                      {event.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {event.description}
                        </p>
                      )}
                      
                      <div className="flex gap-2">
                        {event.pointsReward > 0 && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            {event.pointsReward} points
                          </Badge>
                        )}
                        {event.volunteerHours > 0 && (
                          <Badge className="bg-blue-600 text-blue-800 text-xs">
                            {event.volunteerHours}h volunteer
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

function groupEventsByDate(events: Event[]): Record<string, Event[]> {
  return events.reduce((groups, event) => {
    const date = new Date(event.startDate).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {} as Record<string, Event[]>);
}

function getDateLabel(dateString: string): string {
  const date = new Date(dateString);
  if (dateUtils.formatRelative(date).startsWith('Today')) {
    return 'Today';
  } else if (dateUtils.formatRelative(date).startsWith('Tomorrow')) {
    return 'Tomorrow';
  } else {
    return dateUtils.formatDateLong(date);
  }
}
