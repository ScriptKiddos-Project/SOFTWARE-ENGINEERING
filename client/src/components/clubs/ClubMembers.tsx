import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, MoreVertical, Crown, Shield, User } from 'lucide-react';
import { ClubMember } from '@/types/club';

interface ClubMembersProps {
  members: ClubMember[];
  canManage: boolean;
  onUpdateRole?: (userId: string, newRole: string) => void;
  onRemoveMember?: (userId: string) => void;
}

const roleIcons = {
  admin: Crown,
  moderator: Shield,
  member: User
};

const roleColors = {
  admin: 'text-yellow-600',
  moderator: 'text-blue-600',
  member: 'text-gray-600'
};

export const ClubMembers: React.FC<ClubMembersProps> = ({
  members,
  canManage,
  onUpdateRole,
  onRemoveMember
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = members.filter(member => {
    const fullName = `${member.user?.first_name ?? member.user?.firstName ?? ''} ${member.user?.last_name ?? member.user?.lastName ?? ''}`.toLowerCase();
    const email = (member.user?.email ?? '').toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
  });

  const getRoleIcon = (role: string) => {
    const Icon = roleIcons[role as keyof typeof roleIcons] || User;
    return <Icon className={`w-4 h-4 ${roleColors[role as keyof typeof roleColors]}`} />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Club Members ({members.length})</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {filteredMembers.map(member => (
            <div key={member.user_id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={(member.user?.profile_image ?? member.user?.profileImage) as any} />
                  <AvatarFallback>
                    {(member.user?.first_name ?? member.user?.firstName ?? ' ')[0]}{(member.user?.last_name ?? member.user?.lastName ?? ' ')[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <div className="font-medium">
                    {member.user?.first_name ?? `${member.user?.firstName ?? ''} ${member.user?.lastName ?? ''}`}
                  </div>
                  <div className="text-sm text-gray-600">{member.user.email}</div>
                  {member.user.department && (
                    <div className="text-xs text-gray-500">{member.user.department}</div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  {getRoleIcon(member.role)}
                  <Badge variant="outline" className="capitalize">
                    {member.role}
                  </Badge>
                </div>
                
                <div className="text-sm text-gray-500">
                  Joined {new Date(member.joined_at).toLocaleDateString()}
                </div>
                
                {canManage && member.role !== 'admin' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => onUpdateRole?.(member.user_id, 'moderator')}>
                        Promote to Moderator
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onUpdateRole?.(member.user_id, 'member')}>
                        Make Member
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onRemoveMember?.(member.user_id)}
                        className="text-red-600"
                      >
                        Remove from Club
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
          
          {filteredMembers.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No members found matching your search.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
