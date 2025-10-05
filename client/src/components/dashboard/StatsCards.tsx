// import React from 'react';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Trophy, 
  Clock, 
  Users, 
  Calendar,
  TrendingUp,
  Award,
  Star,
  Target
} from 'lucide-react';

interface StatCard {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  description?: string;
}

interface StatsCardsProps {
  totalPoints?: number;
  volunteerHours?: number;
  joinedClubs?: number;
  upcomingEvents?: number;
  completedEvents?: number;
  badges?: number;
  rank?: number;
  loading?: boolean;
}

const StatsCards: React.FC<StatsCardsProps> = ({
  totalPoints = 0,
  volunteerHours = 0,
  joinedClubs = 0,
  upcomingEvents = 0,
  completedEvents = 0,
  badges = 0,
  rank = 0,
  loading = false
}) => {
  const stats: StatCard[] = [
    {
      title: 'AICTE Points',
      value: totalPoints,
      change: '+12%',
      changeType: 'positive',
      icon: <Trophy className="h-5 w-5 text-yellow-600" />,
      description: 'Total points earned'
    },
    {
      title: 'Volunteer Hours',
      value: `${volunteerHours}h`,
      change: '+5.2h',
      changeType: 'positive',
      icon: <Clock className="h-5 w-5 text-blue-600" />,
      description: 'Community service time'
    },
    {
      title: 'Joined Clubs',
      value: joinedClubs,
      icon: <Users className="h-5 w-5 text-green-600" />,
      description: 'Active memberships'
    },
    {
      title: 'Upcoming Events',
      value: upcomingEvents,
      change: '+3',
      changeType: 'positive',
      icon: <Calendar className="h-5 w-5 text-purple-600" />,
      description: 'Registered events'
    },
    {
      title: 'Completed Events',
      value: completedEvents,
      icon: <Target className="h-5 w-5 text-indigo-600" />,
      description: 'Successfully attended'
    },
    {
      title: 'Badges Earned',
      value: badges,
      change: '+2',
      changeType: 'positive',
      icon: <Award className="h-5 w-5 text-orange-600" />,
      description: 'Achievements unlocked'
    }
  ];

  const getChangeColor = (type: 'positive' | 'negative' | 'neutral' | undefined) => {
    switch (type) {
      case 'positive':
        return 'text-green-600 bg-green-50';
      case 'negative':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="animate-pulse">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-5 w-5 bg-gray-200 rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className="hover:shadow-lg transition-shadow duration-200 cursor-pointer border-l-4 border-l-blue-500"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className="p-2 bg-gray-50 rounded-lg">
              {stat.icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                {stat.description && (
                  <p className="text-xs text-gray-500">
                    {stat.description}
                  </p>
                )}
              </div>
              {stat.change && (
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getChangeColor(stat.changeType)}`}
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.change}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Special Rank Card */}
      {rank > 0 && (
        <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer border-l-4 border-l-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Campus Rank
            </CardTitle>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  #{rank}
                </div>
                <p className="text-xs text-gray-500">
                  Among all students
                </p>
              </div>
              <Badge variant="outline" className="text-xs text-yellow-600 bg-yellow-50">
                <Trophy className="h-3 w-3 mr-1" />
                Top 10%
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StatsCards;