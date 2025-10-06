// import React from 'react';
import { Award, Star, Trophy, Medal } from 'lucide-react';

// UI components - up one level then into ui
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

// Types - up two levels to src/types
import { UserBadge } from '../../types/user';

// Utils - up two levels to src/utils
import { formatDate } from '../../utils/dateUtils';


interface BadgeDisplayProps {
  badges: UserBadge[];
  className?: string;
}

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
  badges,
  className = ''
}) => {
  const getBadgeIcon = (badgeType: string) => {
    const icons = {
      participation: Star,
      leadership: Trophy,
      volunteer: Award,
      achievement: Medal,
      default: Award
    };
    const IconComponent = icons[badgeType as keyof typeof icons] || icons.default;
    return <IconComponent className="h-6 w-6" />;
  };

  const getBadgeColor = (badgeType: string) => {
    const colors = {
      participation: 'bg-blue-600 text-blue-800 border-blue-200',
      leadership: 'bg-blue-600 text-yellow-800 border-yellow-200',
      volunteer: 'bg-green-100 text-green-800 border-green-200',
      achievement: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[badgeType as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const recentBadges = badges.slice(0, 6);
  const remainingCount = badges.length - 6;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-purple-600" />
          Badges & Achievements
        </CardTitle>
        <p className="text-sm text-gray-600">{badges.length} badges earned</p>
      </CardHeader>
      
      <CardContent>
        {badges.length === 0 ? (
          <div className="text-center py-8">
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No badges yet</h3>
            <p className="text-gray-600">Participate in events and activities to earn badges!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {recentBadges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-4 rounded-lg border-2 ${getBadgeColor(badge.badgeType)} hover:shadow-md transition-shadow cursor-pointer`}
                  title={badge.description}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-2">
                      {getBadgeIcon(badge.badgeType)}
                    </div>
                    <h4 className="font-medium text-sm mb-1">{badge.name}</h4>
                    <p className="text-xs opacity-75 mb-2 line-clamp-2">
                      {badge.description}
                    </p>
                    <div className="text-xs opacity-60">
                      {formatDate(badge.earnedAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {remainingCount > 0 && (
              <div className="text-center">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View {remainingCount} more badges
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};