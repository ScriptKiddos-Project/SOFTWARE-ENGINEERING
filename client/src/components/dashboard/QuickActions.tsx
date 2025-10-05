// import React from 'react';
import * as React from 'react';
import { Plus, Search, Calendar, Users, BookOpen, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'secondary' | 'outline';
  disabled?: boolean;
}

interface QuickActionsProps {
  userRole?: 'student' | 'club_admin' | 'super_admin';
  onCreateEvent?: () => void;
  onJoinClub?: () => void;
  onViewEvents?: () => void;
  onManageClub?: () => void;
  onViewProfile?: () => void;
  onSettings?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  userRole = 'student',
  onCreateEvent,
  onJoinClub,
  onViewEvents,
  onManageClub,
  onViewProfile,
  onSettings
}) => {
  const getQuickActions = (): QuickAction[] => {
    const commonActions: QuickAction[] = [
      {
        id: 'view_events',
        title: 'Browse Events',
        description: 'Discover upcoming events',
        icon: <Calendar className="h-5 w-5" />,
        onClick: onViewEvents || (() => {}),
        variant: 'default'
      },
      {
        id: 'view_profile',
        title: 'View Profile',
        description: 'Check your stats & badges',
        icon: <BookOpen className="h-5 w-5" />,
        onClick: onViewProfile || (() => {}),
        variant: 'outline'
      },
      {
        id: 'settings',
        title: 'Settings',
        description: 'Manage preferences',
        icon: <Settings className="h-5 w-5" />,
        onClick: onSettings || (() => {}),
        variant: 'outline'
      }
    ];

    if (userRole === 'student') {
      return [
        {
          id: 'join_club',
          title: 'Join a Club',
          description: 'Explore and join clubs',
          icon: <Users className="h-5 w-5" />,
          onClick: onJoinClub || (() => {}),
          variant: 'secondary'
        },
        ...commonActions
      ];
    }

    if (userRole === 'club_admin') {
      return [
        {
          id: 'create_event',
          title: 'Create Event',
          description: 'Organize a new event',
          icon: <Plus className="h-5 w-5" />,
          onClick: onCreateEvent || (() => {}),
          variant: 'default'
        },
        {
          id: 'manage_club',
          title: 'Manage Club',
          description: 'Club administration',
          icon: <Users className="h-5 w-5" />,
          onClick: onManageClub || (() => {}),
          variant: 'secondary'
        },
        ...commonActions
      ];
    }

    if (userRole === 'super_admin') {
      return [
        {
          id: 'create_event',
          title: 'Create Event',
          description: 'Organize a new event',
          icon: <Plus className="h-5 w-5" />,
          onClick: onCreateEvent || (() => {}),
          variant: 'default'
        },
        {
          id: 'manage_all_clubs',
          title: 'Manage All Clubs',
          description: 'System administration',
          icon: <Users className="h-5 w-5" />,
          onClick: onManageClub || (() => {}),
          variant: 'secondary'
        },
        {
          id: 'view_analytics',
          title: 'View Analytics',
          description: 'Platform insights',
          icon: <Search className="h-5 w-5" />,
          onClick: onViewProfile || (() => {}),
          variant: 'outline'
        },
        ...commonActions.slice(1) // Exclude Browse Events for admins in quick actions
      ];
    }

    return commonActions;
  };

  const actions = getQuickActions();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant}
              className="h-auto p-4 flex flex-col items-start text-left space-y-2 hover:scale-[1.02] transition-transform"
              onClick={action.onClick}
              disabled={action.disabled}
            >
              <div className="flex items-center gap-2 w-full">
                {action.icon}
                <span className="font-medium">{action.title}</span>
              </div>
              <span className="text-sm text-gray-600 font-normal">
                {action.description}
              </span>
            </Button>
          ))}
        </div>

        {/* Additional Quick Stats */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-xs text-gray-500">Events Joined</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-xs text-gray-500">Points Earned</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-xs text-gray-500">Clubs Joined</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;