// import React from 'react';
import * as React from 'react';

// UI components - go up one folder, then into ui
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';

// Icons (external package, keep as is)
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  Award,
  Star,
  Heart,
  Share2
} from 'lucide-react';

// Utils - go up two folders, then into utils
import { formatDate } from '../../utils/dateUtils';


interface Event {
  id: string;
  title: string;
  description: string;
  clubName: string;
  clubLogo: string;
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants: number;
  registeredCount: number;
  pointsReward: number;
  volunteerHours: number;
  tags: string[];
  image: string;
  isRegistered: boolean;
  featured: boolean;
  rating: number;
}

interface EventCardProps {
  event: Event;
  onClick?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const handleRegister = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Handle registration logic
    console.log('Register for event:', event.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Handle sharing logic
    navigator.share?.({
      title: event.title,
      text: event.description,
      url: window.location.href + '/' + event.id,
    });
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Handle favorite logic
    console.log('Toggle favorite:', event.id);
  };

  const getRegistrationStatus = () => {
    const percentage = (event.registeredCount / event.maxParticipants) * 100;
    if (percentage >= 90) return 'Almost Full';
    if (percentage >= 70) return 'Filling Fast';
    return 'Available';
  };

  const getStatusColor = () => {
    const percentage = (event.registeredCount / event.maxParticipants) * 100;
    if (percentage >= 90) return 'bg-red-100 text-red-800';
    if (percentage >= 70) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
      <div className="relative">
        {/* Event Image */}
        <div 
          className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden"
          onClick={onClick}
        >
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          
          {/* Overlay badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {event.featured && (
              <Badge className="bg-yellow-500 text-yellow-50">
                Featured
              </Badge>
            )}
            <Badge className={`${getStatusColor()}`}>
              {getRegistrationStatus()}
            </Badge>
          </div>
          
          {/* Action buttons */}
          <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0"
              onClick={handleFavorite}
            >
              <Heart className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Registration Status */}
        {event.isRegistered && (
          <div className="absolute bottom-0 left-0 right-0 bg-green-600 text-white text-center py-1 text-xs font-medium">
            ✓ Registered
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3" onClick={onClick}>
        {/* Club Info */}
        <div className="flex items-center space-x-2">
          <Avatar className="w-6 h-6">
            <AvatarImage src={event.clubLogo} alt={event.clubName} />
            <AvatarFallback className="text-xs">
              {event.clubName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">
            {event.clubName}
          </span>
          <div className="flex items-center space-x-1 ml-auto">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-muted-foreground">{event.rating}</span>
          </div>
        </div>

        {/* Event Title & Description */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
            {event.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>
        </div>

        {/* Event Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(event.startDate)}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{event.registeredCount}/{event.maxParticipants}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 text-orange-600">
                <Award className="h-3 w-3" />
                <span className="text-xs font-medium">{event.pointsReward}pts</span>
              </div>
              <div className="flex items-center space-x-1 text-green-600">
                <Clock className="h-3 w-3" />
                <span className="text-xs font-medium">{event.volunteerHours}h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {event.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {event.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{event.tags.length - 3} more
            </Badge>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          {event.isRegistered ? (
            <Button 
              variant="outline" 
              className="w-full" 
              disabled
            >
              Registered
            </Button>
          ) : event.registeredCount >= event.maxParticipants ? (
            <Button 
              variant="outline" 
              className="w-full" 
              disabled
            >
              Event Full
            </Button>
          ) : (
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleRegister}
            >
              Register Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;