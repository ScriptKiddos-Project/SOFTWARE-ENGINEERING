// client/src/components/events/EventModal.tsx
// import React from 'react';
import { X, Calendar, MapPin, Users, Award, Clock, Tag } from 'lucide-react';
import { Button } from '../ui/button';

interface Event {
  id: string;
  title: string;
  description: string;
  clubName: string;
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants: number;
  registeredCount: number;
  pointsReward: number;
  volunteerHours: number;
  imageUrl?: string;
  tags?: string[];
  isRegistered?: boolean;
}

interface EventModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  onRegister?: (eventId: string) => void;
  onUnregister?: (eventId: string) => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  event,
  isOpen,
  onClose,
  onRegister,
  onUnregister,
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const spotsLeft = event.maxParticipants - event.registeredCount;
  const isFull = spotsLeft <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
        >
          <X className="h-6 w-6 text-gray-600" />
        </button>

        {/* Event Image */}
        {event.imageUrl && (
          <div className="w-full h-64 overflow-hidden rounded-t-lg">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title and Club */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {event.title}
            </h2>
            <p className="text-lg text-blue-600">{event.clubName}</p>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              About This Event
            </h3>
            <p className="text-gray-700 leading-relaxed">{event.description}</p>
          </div>

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date & Time */}
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Date & Time</p>
                <p className="text-sm text-gray-600">{formatDate(event.startDate)}</p>
                <p className="text-sm text-gray-600">to {formatDate(event.endDate)}</p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Location</p>
                <p className="text-sm text-gray-600">{event.location}</p>
              </div>
            </div>

            {/* Participants */}
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Participants</p>
                <p className="text-sm text-gray-600">
                  {event.registeredCount} / {event.maxParticipants} registered
                </p>
                <p className="text-sm text-gray-600">
                  {isFull ? 'Event is full' : `${spotsLeft} spots left`}
                </p>
              </div>
            </div>

            {/* Rewards */}
            <div className="flex items-start gap-3">
              <Award className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Rewards</p>
                <p className="text-sm text-gray-600">
                  {event.pointsReward} AICTE Points
                </p>
                <p className="text-sm text-gray-600">
                  {event.volunteerHours} Volunteer Hours
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <p className="text-sm font-medium text-gray-900">Tags</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            {event.isRegistered ? (
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => onUnregister?.(event.id)}
              >
                Unregister
              </Button>
            ) : (
              <Button
                className="flex-1"
                disabled={isFull}
                onClick={() => onRegister?.(event.id)}
              >
                {isFull ? 'Event Full' : 'Register Now'}
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};