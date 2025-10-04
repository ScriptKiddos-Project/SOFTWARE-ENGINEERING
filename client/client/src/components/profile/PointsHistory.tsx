import React from 'react';
import { Trophy, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PointsHistory as PointsHistoryType } from '@/types/user';
import { formatDate } from '@/utils/dateUtils';

interface PointsHistoryProps {
  pointsHistory: PointsHistoryType[];
  totalPoints: number;
  className?: string;
}

export const PointsHistory: React.FC<PointsHistoryProps> = ({
  pointsHistory,
  totalPoints,
  className = ''
}) => {
  const recentHistory = pointsHistory.slice(0, 10);
  const monthlyPoints = getMonthlyPointsBreakdown(pointsHistory);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          AICTE Points History
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span>Total: {totalPoints} points</span>
          </div>
          <div>This month: {monthlyPoints.current} points</div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {recentHistory.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No points earned yet</h3>
            <p className="text-gray-600">Participate in events to start earning AICTE points!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentHistory.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    <Trophy className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{entry.type}</h4>
                      <p className="text-sm text-gray-600">{entry.description}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {entry.amount > 0 ? `+${entry.amount}` : entry.amount} points
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(entry.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {pointsHistory.length > 10 && (
          <div className="text-center">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View all {pointsHistory.length} entries
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

function getMonthlyPointsBreakdown(history: PointsHistoryType[]) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const current = history
    .filter(entry => {
      const date = new Date(entry.createdAt);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, entry) => sum + entry.amount, 0);
  return { current };
}
