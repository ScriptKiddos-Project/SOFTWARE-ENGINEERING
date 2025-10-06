// import React from 'react';
import * as React from 'react';
import { Clock, Users, Calendar, Award, MessageCircle, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';

interface ActivityItem {
  id: string;
  type: 'event_registered' | 'event_attended' | 'club_joined' | 'points_earned' | 'badge_earned' | 'event_created' | 'comment_posted';
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    points?: number;
    clubName?: string;
    eventName?: string;
    badgeName?: string;
    userName?: string;
    userAvatar?: string;
  };
}

interface RecentActivityProps {
  activities?: ActivityItem[];
  loading?: boolean;
  maxItems?: number;
}

const RecentActivity: React.FC<RecentActivityProps> = ({
  activities = [],
  loading = false,
  maxItems = 8
}) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    const iconClass = "h-4 w-4";
    
    switch (type) {
      case 'event_registered':
        return <Calendar className={iconClass} />;
      case 'event_attended':
        return <Award className={iconClass} />;
      case 'club_joined':
        return <UserPlus className={iconClass} />;
      case 'points_earned':
        return <Award className={iconClass} />;
      case 'badge_earned':
        return <Award className={iconClass} />;
      case 'event_created':
        return <Calendar className={iconClass} />;
      case 'comment_posted':
        return <MessageCircle className={iconClass} />;
      default:
        return <Clock className={iconClass} />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'event_registered':
        return 'text-blue-600 bg-blue-50';
      case 'event_attended':
        return 'text-green-600 bg-green-50';
      case 'club_joined':
        return 'text-purple-600 bg-purple-50';
      case 'points_earned':
        return 'text-yellow-600 bg-blue-50';
      case 'badge_earned':
        return 'text-orange-600 bg-orange-50';
      case 'event_created':
        return 'text-indigo-600 bg-indigo-50';
      case 'comment_posted':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return time.toLocaleDateString();
  };

  const renderActivityMetadata = (activity: ActivityItem) => {
    const { type, metadata } = activity;
    
    if (!metadata) return null;

    switch (type) {
      case 'points_earned':
        return (
          <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
            +{metadata.points} pts
          </Badge>
        );
      case 'badge_earned':
        return (
          <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-700">
            {metadata.badgeName}
          </Badge>
        );
      case 'club_joined':
        return (
          <span className="ml-2 text-sm font-medium text-purple-600">
            {metadata.clubName}
          </span>
        );
      case 'event_registered':
      case 'event_attended':
      case 'event_created':
        return (
          <span className="ml-2 text-sm font-medium text-blue-600">
            {metadata.eventName}
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-start space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </div>
          {activities.length > maxItems && (
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All
            </button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No recent activity</p>
              <p className="text-sm mt-1">Join events and clubs to see your activity here</p>
            </div>
          ) : (
            displayedActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* Activity Icon */}
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>

                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-wrap">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      {renderActivityMetadata(activity)}
                    </div>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {activity.description}
                  </p>
                  
                  {/* User info for certain activities */}
                  {activity.metadata?.userName && (
                    <div className="flex items-center gap-2 mt-2">
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={activity.metadata.userAvatar} />
                        <AvatarFallback className="text-xs">
                          {activity.metadata.userName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-gray-500">
                        {activity.metadata.userName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Activity Summary */}
        {displayedActivities.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Last 7 days</span>
              <span>{activities.length} activities</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;