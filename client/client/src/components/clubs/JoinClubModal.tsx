import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '../ui/input';
import { FormLabel as Label } from '../ui/form';
import { Users, Calendar, Clock } from 'lucide-react';
import type { Club } from '@/types/club';

interface JoinClubModalProps {
  club: Club | null;
  isOpen: boolean;
  onClose: () => void;
  onJoin: (clubId: string, message?: string) => void;
  isLoading?: boolean;
}

export const JoinClubModal: React.FC<JoinClubModalProps> = ({
  club,
  isOpen,
  onClose,
  onJoin,
  isLoading = false
}) => {
  const [joinMessage, setJoinMessage] = useState('');

  if (!club) return null;

  const handleJoin = () => {
    onJoin(club.id, joinMessage);
    setJoinMessage('');
  };

  const handleClose = () => {
    setJoinMessage('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Join Club</DialogTitle>
          <DialogDescription>
            Review club details and submit your join request
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Club Info */}
          <div className="flex items-center space-x-4 p-4 border rounded-lg">
            <Avatar className="w-12 h-12">
              <AvatarImage src={club.logoUrl} alt={club.name} />
              <AvatarFallback>{club.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium">{club.name}</h3>
              <Badge variant="secondary">{club.category}</Badge>
            </div>
          </div>
          
          {/* Club Stats */}
          <div className="grid grid-cols-3 gap-4 text-center py-4 border rounded-lg">
            <div>
              <div className="flex items-center justify-center mb-1">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-sm font-medium">{club.memberCount}</div>
              <div className="text-xs text-gray-600">Members</div>
            </div>
            <div>
              <div className="flex items-center justify-center mb-1">
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-sm font-medium">{(club as any).upcomingEventsCount || 0}</div>
              <div className="text-xs text-gray-600">Events</div>
            </div>
            <div>
              <div className="flex items-center justify-center mb-1">
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-sm font-medium">
                {new Date().getFullYear() - new Date(club.createdAt).getFullYear()}y
              </div>
              <div className="text-xs text-gray-600">Active</div>
            </div>
          </div>
          
          {/* Description */}
          <div>
            <Label className="text-sm font-medium">About this club</Label>
            <p className="text-sm text-gray-600 mt-1 line-clamp-3">
              {club.description}
            </p>
          </div>
          
          {/* Join Message */}
          <div className="space-y-2">
            <Label htmlFor="join-message">
              Introduction Message (Optional)
            </Label>
            <Textarea
              id="join-message"
              placeholder="Tell the club why you'd like to join..."
              value={joinMessage}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setJoinMessage(e.target.value)}
              rows={3}
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleJoin}
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Joining...' : 'Join Club'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
