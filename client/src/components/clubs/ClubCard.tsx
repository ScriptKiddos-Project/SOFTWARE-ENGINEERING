import * as React from 'react';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

// Icons
import { Users, Calendar, MapPin } from 'lucide-react';

// Types
import { Club } from '../../types/club';

interface ClubCardProps {
  club: Club;
  onJoin?: (clubId: string) => void;
  onView?: (clubId: string) => void;
  isJoined?: boolean;
}

export const ClubCard: React.FC<ClubCardProps> = ({ 
  club, 
  onJoin, 
  onView, 
  isJoined = false 
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={club.logoUrl as unknown as string} alt={club.name} />
              <AvatarFallback>{club.name?.charAt(0) ?? 'C'}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{club.name}</CardTitle>
              <Badge variant="secondary">{club.category}</Badge>
            </div>
          </div>
          {club.isActive ? (
            <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
          ) : (
            <Badge variant="secondary">Inactive</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <CardDescription className="mb-4 line-clamp-3">
          {club.description}
        </CardDescription>
        
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {club.memberCount} members
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {(club as any).upcomingEventsCount || 0} events
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onView?.(club.id)}
            className="flex-1"
          >
            View Details
          </Button>
          {!isJoined ? (
            <Button 
              size="sm" 
              onClick={() => onJoin?.(club.id)}
              className="flex-1"
            >
              Join Club
            </Button>
          ) : (
            <Badge variant="default" className="px-3 py-1">Joined</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
