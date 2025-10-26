import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { JoinedClubs } from '../components/profile/JoinedClubs';
import { PointsHistory } from '../components/profile/PointsHistory';
import { VolunteerHours } from '../components/profile/VolunteerHours';
import { BadgeDisplay } from '../components/profile/BadgeDisplay';
import { ProfileSettings } from '../components/profile/ProfileSettings';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import type { VolunteerRecord } from '../types/user'; // Import the type
import {
  Calendar,
  Award,
  Users,
  Clock,
  Settings,
  TrendingUp
} from 'lucide-react';

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { profile, joinedClubs, pointsHistory, isLoading, refetch, updateProfile } = useProfile();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditMode, setIsEditMode] = useState(false);

  const isOwnProfile = !userId || userId === currentUser?.id;
  const profileUserId = userId || currentUser?.id;

  useEffect(() => {
    if (profileUserId) {
      refetch();
    }
  }, [profileUserId, refetch]);

  const handleUpdateProfile = async (data: any) => {
    try {
      await updateProfile(data);
      setIsEditMode(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600 mb-4">Profile not found</p>
        <Button onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  // Helper function to safely cast category
  const getBadgeCategory = (category?: string): 'participation' | 'leadership' | 'academic' | 'special' | 'seasonal' | 'milestone' => {
    const validCategories = ['participation', 'leadership', 'academic', 'special', 'seasonal', 'milestone'];
    return validCategories.includes(category || '') 
      ? category as any 
      : 'special';
  };

  // Transform profile achievements to badges format if they exist
  const userBadges = profile.achievements?.map(achievement => ({
    id: achievement.id,
    name: achievement.achievement?.name || 'Achievement',
    description: achievement.achievement?.description || '',
    iconUrl: achievement.achievement?.iconUrl || '',
    badgeType: achievement.achievement?.category || 'achievement',
    earnedAt: achievement.unlockedAt,
    color: 'purple',
    category: getBadgeCategory(achievement.achievement?.category),
    criteria: achievement.achievement?.criteria?.metric || '',
    isRare: achievement.achievement?.rarity === 'rare' || achievement.achievement?.rarity === 'epic',
    earnedBy: 0
  })) || [];

  // Mock volunteer records - replace with actual data when available
  const volunteerRecords: VolunteerRecord[] = [];

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileHeader
        user={profile}
        isOwnProfile={isOwnProfile}
        onEditProfile={() => setIsEditMode(true)}
      />

      <div className="mt-8">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="clubs" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Clubs
            </TabsTrigger>
            <TabsTrigger value="points" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Points
            </TabsTrigger>
            <TabsTrigger value="hours" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Hours
            </TabsTrigger>
            <TabsTrigger value="badges" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Badges
            </TabsTrigger>
            {isOwnProfile && (
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Clubs Joined</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Array.isArray(joinedClubs) ? joinedClubs.length : 0}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Events Attended</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Array.isArray(pointsHistory) ? pointsHistory.length : 0}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">AICTE Points</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {profile.total_points || 0}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Volunteer Hours</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {profile.total_volunteer_hours || 0}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <JoinedClubs 
                  userClubs={Array.isArray(joinedClubs) ? joinedClubs.slice(0, 3) : []}
                />
                {Array.isArray(joinedClubs) && joinedClubs.length > 3 && (
                  <Button
                    variant="ghost"
                    className="w-full mt-4"
                    onClick={() => setActiveTab('clubs')}
                  >
                    View All Clubs
                  </Button>
                )}
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Latest Badges</h3>
                <BadgeDisplay badges={Array.isArray(userBadges) ? userBadges.slice(0, 4) : []} />
                {userBadges.length > 4 && (
                  <Button
                    variant="ghost"
                    className="w-full mt-4"
                    onClick={() => setActiveTab('badges')}
                  >
                    View All Badges
                  </Button>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="clubs">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Joined Clubs</h2>
              <JoinedClubs userClubs={Array.isArray(joinedClubs) ? joinedClubs : []} />
            </Card>
          </TabsContent>

          <TabsContent value="points">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">AICTE Points History</h2>
              <PointsHistory 
                pointsHistory={Array.isArray(pointsHistory) ? pointsHistory : []}
                totalPoints={profile.total_points || 0}
              />
            </Card>
          </TabsContent>

          <TabsContent value="hours">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Volunteer Hours Breakdown</h2>
              <VolunteerHours 
                volunteerRecords={volunteerRecords}
                totalHours={profile.total_volunteer_hours || 0}
              />
            </Card>
          </TabsContent>

          <TabsContent value="badges">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Earned Badges</h2>
              <BadgeDisplay badges={Array.isArray(userBadges) ? userBadges : []} />
            </Card>
          </TabsContent>

          {isOwnProfile && (
            <TabsContent value="settings">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
                <ProfileSettings
                  user={{
                    firstName: profile.first_name,
                    lastName: profile.last_name,
                    email: profile.email,
                    phone: profile.phone,
                    studentId: profile.student_id,
                    department: profile.department,
                    yearOfStudy: profile.year_of_study,
                  }}
                />
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;