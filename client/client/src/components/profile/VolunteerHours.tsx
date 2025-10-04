import React from 'react';
import { Clock, Heart, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VolunteerRecord } from '@/types/user';
import { formatDate } from '@/utils/dateUtils';

interface VolunteerHoursProps {
  volunteerRecords: VolunteerRecord[];
  totalHours: number;
  className?: string;
}

export const VolunteerHours: React.FC<VolunteerHoursProps> = ({
  volunteerRecords,
  totalHours,
  className = ''
}) => {
  const recentRecords = volunteerRecords.slice(0, 8);
  const yearlyTarget = 40; // Common AICTE requirement
  const progressPercentage = Math.min((totalHours / yearlyTarget) * 100, 100);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Volunteer Hours
        </CardTitle>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progress towards yearly goal</span>
            <span className="font-medium">{totalHours}h / {yearlyTarget}h</span>
          </div>
          {/* Progress bar removed due to missing component */}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentRecords.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No volunteer hours yet</h3>
            <p className="text-gray-600">Start volunteering at events to track your hours!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentRecords.map((record) => (
              <div key={record.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Event ID: {record.eventId}</h4>
                      <p className="text-sm text-gray-600">Hours: {record.hours}</p>
                    </div>
                    <Badge className="bg-red-100 text-red-800">
                      {record.hours}h
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(record.date)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {volunteerRecords.length > 8 && (
          <div className="text-center">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View all {volunteerRecords.length} records
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};