// import React from 'react';
import { Camera, Edit, Mail, Phone, Calendar, MapPin } from 'lucide-react';

// UI components
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

// Types
import { User } from '../../types/user';


interface ProfileHeaderProps {
  user: User;
  onEditProfile?: () => void;
  onChangePhoto?: () => void;
  isOwnProfile?: boolean;
  className?: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  onEditProfile,
  onChangePhoto,
  isOwnProfile = false,
  className = ''
}) => {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
        {isOwnProfile && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4"
            onClick={onEditProfile}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>
      
      <CardContent className="pt-0 pb-6">
        <div className="flex flex-col sm:flex-row items-start gap-6 -mt-16">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
              <AvatarImage src={user.profile_image} alt={`${user.first_name} ${user.last_name}`} />
              <AvatarFallback className="text-3xl">
                {user.first_name[0]}{user.last_name[0]}
              </AvatarFallback>
            </Avatar>
            {isOwnProfile && (
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                onClick={onChangePhoto}
              >
                <Camera className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="flex-1 pt-4 sm:pt-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {user.first_name} {user.last_name}
                </h1>
                <p className="text-gray-600">{user.student_id}</p>
              </div>
              
              <div className="flex items-center gap-4 mt-4 sm:mt-0">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{user.total_points}</div>
                  <div className="text-xs text-gray-500">AICTE Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{user.total_volunteer_hours}h</div>
                  <div className="text-xs text-gray-500">Volunteer Hours</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
              {user.department && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{user.department}</span>
                </div>
              )}
              
              {user.year_of_study && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Year {user.year_of_study}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              
              {user.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{user.phone}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{user.role}</Badge>
              {user.is_verified && (
                <Badge className="bg-green-100 text-green-800">Verified</Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
