// import React from 'react';
import { Calendar, Users, Crown, Settings } from 'lucide-react';

// UI components
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

// Types and Utils - go up two folders to src/
import { UserClub } from '../../types/club';
import { formatDate } from '../../utils/dateUtils';


interface JoinedClubsProps {
  userClubs: UserClub[];
  onClubClick?: (clubId: string) => void;
  onManageClub?: (clubId: string) => void;
  className?: string;
}

export const JoinedClubs: React.FC<JoinedClubsProps> = ({
  userClubs,
  onClubClick,
  onManageClub,
  className = ''
}) => {
  const activeClubs = userClubs.filter(uc => uc.isActive);
  const adminClubs = activeClubs.filter(uc => ['admin', 'president', 'vice_president'].includes(uc.role));
  const memberClubs = activeClubs.filter(uc => !['admin', 'president', 'vice_president'].includes(uc.role));

  const getRoleIcon = (role: string) => {
    if (['president', 'vice_president', 'admin'].includes(role)) {
      return <Crown className="h-4 w-4 text-yellow-600" />;
    }
    return null;
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      president: 'bg-blue-600 text-yellow-800',
      vice_president: 'bg-orange-100 text-orange-800',
      admin: 'bg-red-100 text-red-800',
      secretary: 'bg-blue-600 text-blue-800',
      treasurer: 'bg-green-100 text-green-800',
      coordinator: 'bg-purple-100 text-purple-800',
      member: 'bg-gray-100 text-gray-800'
    };
    return roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800';
  };

  // To display club info, we need to fetch the club object by clubId. For now, assume you have a clubsMap or similar. Here, we will just display clubId and role.
  const ClubCard = ({ userClub }: { userClub: UserClub }) => (
    <Card 
      key={userClub.id}
      className="cursor-pointer hover:shadow-md transition-shadow duration-200"
      onClick={() => onClubClick?.(userClub.clubId)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            {/* If you have a clubsMap, you can get logoUrl by clubId. For now, just fallback. */}
            <AvatarImage src={undefined} alt={userClub.clubId} />
            <AvatarFallback>{userClub.clubId.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-gray-900">Club ID: {userClub.clubId}</h4>
              {['admin', 'president', 'vice_president'].includes(userClub.role) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onManageClub?.(userClub.clubId);
                  }}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* Description would require club object, so omitted here. */}
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              Role: {userClub.role.replace('_', ' ')}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getRoleIcon(userClub.role)}
                <Badge className={getRoleBadge(userClub.role)}>
                  {userClub.role.replace('_', ' ')}
                </Badge>
              </div>
              
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>Joined {formatDate(userClub.joinedAt)}</span>
              </div>
            </div>
            
            {/* Member count would require club object, so omitted here. */}
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <Users className="h-3 w-3" />
              <span>Club ID: {userClub.clubId}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (activeClubs.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No clubs joined yet</h3>
          <p className="text-gray-600 mb-4">Start your journey by joining some clubs!</p>
          <Button>Explore Clubs</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {adminClubs.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-600" />
            Leadership Roles ({adminClubs.length})
          </h3>
          <div className="grid gap-4">
            {adminClubs.map(userClub => (
              <ClubCard key={userClub.id} userClub={userClub} />
            ))}
          </div>
        </div>
      )}
      
      {memberClubs.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Member of ({memberClubs.length})
          </h3>
          <div className="grid gap-4">
            {memberClubs.map(userClub => (
              <ClubCard key={userClub.id} userClub={userClub} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};