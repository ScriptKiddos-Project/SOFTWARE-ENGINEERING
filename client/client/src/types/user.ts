// User-related types and interfaces (extending auth types)

import { User as AuthUser, UserRole } from './auth';
import { Club, UserClub } from './club';


// User base type (for export)
export interface User extends AuthUser {}

// Extended user profile information
export interface UserProfile extends User {
  // Social information
  bio?: string;
  interests: string[];
  skills: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  
  // Academic information
  gpa?: number;
  academicYear?: AcademicYear;
  graduationYear?: number;
  secondaryDepartment?: string; // Minor/second major
  
  // Contact preferences
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
  
  // Activity tracking
  lastActive: Date;
  profileCompleteness: number; // 0-100 percentage
  
  // Relationships
  clubs?: UserClub[];
  // eventRegistrations?: EventRegistration[];
  achievements?: UserAchievement[];
  pointsHistory?: PointsTransaction[];
}

export type AcademicYear = 1 | 2 | 3 | 4 | 'graduate' | 'phd';

// User preferences and settings
export interface NotificationPreferences {
  email: {
    eventReminders: boolean;
    clubUpdates: boolean;
    newEvents: boolean;
    pointsEarned: boolean;
    weeklyDigest: boolean;
    systemAnnouncements: boolean;
  };
  push: {
    eventReminders: boolean;
    clubMessages: boolean;
    newEvents: boolean;
    pointsEarned: boolean;
    achievementUnlocked: boolean;
  };
  sms: {
    importantEvents: boolean;
    emergencyNotifications: boolean;
  };
}

export interface PrivacySettings {
  profileVisibility: ProfileVisibility;
  showEmail: boolean;
  showPhone: boolean;
  showDepartment: boolean;
  showAchievements: boolean;
  showClubs: boolean;
  showPoints: boolean;
  allowMessages: MessagePermission;
  searchable: boolean;
}

export type ProfileVisibility = 'public' | 'members_only' | 'friends_only' | 'private';
export type MessagePermission = 'everyone' | 'club_members' | 'friends' | 'none';

// User achievements and gamification
export interface UserAchievement {
  id: string;
  user: User;
  userId: string;
  achievement: Achievement;
  achievementId: string;
  unlockedAt: Date;
  progress?: number; // For progressive achievements
  metadata?: Record<string, any>; // Achievement-specific data
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  badgeUrl?: string;
  category: AchievementCategory;
  type: AchievementProgressType;
  criteria: AchievementCriteria;
  pointsReward: number;
  rarity: AchievementRarity;
  isActive: boolean;
  isSecret: boolean; // Hidden until unlocked
  prerequisiteAchievements?: string[];
  createdAt: Date;
}

export type AchievementCategory = 
  | 'participation'
  | 'leadership'
  | 'academic'
  | 'social'
  | 'service'
  | 'special'
  | 'milestone';

export type AchievementProgressType = 
  | 'instant'    // Unlocked immediately when criteria met
  | 'progressive' // Requires cumulative progress
  | 'streak';     // Requires consecutive actions

export type AchievementRarity = 
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary';

export interface AchievementCriteria {
  type: 'count' | 'streak' | 'percentage' | 'milestone' | 'custom';
  target: number;
  metric: string; // e.g., 'events_attended', 'points_earned', 'clubs_joined'
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all_time';
  conditions?: Record<string, any>; // Additional conditions
}

// Points and rewards system
export interface PointsHistory {
  id: string;
  userId: string;
  amount: number;
  type: string;
  source: string;
  description: string;
  createdAt: Date;
  // compatibility
  pointsAwarded?: number;
}

// Minimal placeholders for referenced types elsewhere in the codebase
export interface ClubMembership {
  clubId: string;
  role: string;
  joinedAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
}

export interface VolunteerActivity {
  id: string;
  hoursAwarded: number;
  date: Date;
}

export interface ProfileStats {
  totalClubsJoined: number;
  totalPointsEarned: number;
  totalVolunteerHours: number;
  totalBadgesEarned: number;
}

export interface VolunteerRecord {
  id: string;
  userId: string;
  eventId: string;
  hours: number;
  date: Date;
}

export interface PointsTransaction {
  id: string;
  user: User;
  userId: string;
  amount: number;
  type: PointsTransactionType;
  source: PointsSource;
  sourceId?: string; // ID of the event, achievement, etc.
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export type PointsTransactionType = 'earned' | 'spent' | 'bonus' | 'penalty' | 'refund';

export type PointsSource = 
  | 'event_attendance'
  | 'achievement_unlock'
  | 'club_leadership'
  | 'referral'
  | 'bonus'
  | 'admin_adjustment'
  | 'penalty'
  | 'reward_redemption';

export interface RewardItem {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  category: RewardCategory;
  pointsCost: number;
  isActive: boolean;
  isLimited: boolean;
  maxRedemptions?: number;
  currentRedemptions: number;
  validUntil?: Date;
  createdAt: Date;
}

export type RewardCategory = 
  | 'physical'
  | 'digital'
  | 'experience'
  | 'privilege'
  | 'certificate'
  | 'voucher';

export interface RewardRedemption {
  id: string;
  user: User;
  userId: string;
  reward: RewardItem;
  rewardId: string;
  pointsSpent: number;
  status: RedemptionStatus;
  redemptionCode?: string;
  redeemedAt: Date;
  fulfilledAt?: Date;
  notes?: string;
}

export type RedemptionStatus = 
  | 'pending'
  | 'confirmed'
  | 'fulfilled'
  | 'cancelled'
  | 'refunded';

// User statistics and analytics
export interface UserStats {
  totalPoints: number;
  totalVolunteerHours: number;
  eventsAttended: number;
  eventsOrganized: number;
  clubsJoined: number;
  achievementsUnlocked: number;
  currentStreak: number; // Days with activity
  longestStreak: number;
  averageEventRating: number;
  
  // Time-based stats
  thisMonth: {
    pointsEarned: number;
    eventsAttended: number;
    hoursVolunteered: number;
  };
  thisYear: {
    pointsEarned: number;
    eventsAttended: number;
    hoursVolunteered: number;
  };
  
  // Rankings
  pointsRank?: number;
  volunteerHoursRank?: number;
  departmentRank?: number;
}

export interface UserActivity {
  id: string;
  user: User;
  userId: string;
  type: UserActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  isPublic: boolean;
}

export type UserActivityType = 
  | 'joined_club'
  | 'left_club'
  | 'attended_event'
  | 'organized_event'
  | 'earned_achievement'
  | 'earned_points'
  | 'profile_updated'
  | 'milestone_reached'
  | 'streak_achieved';

// User connections and social features
export interface UserConnection {
  id: string;
  requester: User;
  requesterId: string;
  recipient: User;
  recipientId: string;
  status: ConnectionStatus;
  requestedAt: Date;
  respondedAt?: Date;
  message?: string;
}

export type ConnectionStatus = 
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'blocked';

export interface UserBadge {
  id: string;
  badgeType: string;
  earnedAt: Date;
  name: string;
  description: string;
  iconUrl: string;
  color: string;
  category: BadgeCategory;
  criteria: string;
  isRare: boolean;
  earnedBy: number; // Count of users who have this badge
}

export type BadgeCategory = 
  | 'participation'
  | 'leadership'
  | 'academic'
  | 'special'
  | 'seasonal'
  | 'milestone';

// User search and filtering
export interface UserFilters {
  department?: string[];
  yearOfStudy?: number[];
  role?: UserRole[];
  clubs?: string[]; // Club IDs
  skills?: string[];
  interests?: string[];
  pointsMin?: number;
  pointsMax?: number;
  isActive?: boolean;
}

export interface UserSearchParams extends UserFilters {
  search?: string;
  sortBy?: UserSortField;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export type UserSortField = 
  | 'firstName'
  | 'lastName'
  | 'totalPoints'
  | 'totalVolunteerHours'
  | 'joinedAt'
  | 'lastActive'
  | 'eventsAttended';

// User leaderboards
export interface Leaderboard {
  id: string;
  name: string;
  description: string;
  metric: LeaderboardMetric;
  timeframe: LeaderboardTimeframe;
  category?: string; // Department, club, etc.
  entries: LeaderboardEntry[];
  updatedAt: Date;
}

export type LeaderboardMetric = 
  | 'total_points'
  | 'volunteer_hours'
  | 'events_attended'
  | 'achievements'
  | 'streak_days';

export type LeaderboardTimeframe = 
  | 'all_time'
  | 'this_year'
  | 'this_month'
  | 'this_week';

export interface LeaderboardEntry {
  rank: number;
  user: User;
  value: number;
  change: number; // Change in rank since last update
  badge?: UserBadge; // Special badge for top positions
}

// User state for frontend
export interface UserState {
  currentUser: UserProfile | null;
  users: User[];
  userStats: UserStats | null;
  achievements: UserAchievement[];
  pointsHistory: PointsTransaction[];
  connections: UserConnection[];
  activities: UserActivity[];
  leaderboards: Leaderboard[];
  filters: UserFilters;
  searchTerm: string;
  isLoading: boolean;
  error: string | null;
}

// Profile completion tracking
export interface ProfileCompletionItem {
  field: string;
  label: string;
  completed: boolean;
  weight: number; // Percentage weight towards completion
  description: string;
}

export const PROFILE_COMPLETION_ITEMS: ProfileCompletionItem[] = [
  { field: 'profileImage', label: 'Profile Photo', completed: false, weight: 15, description: 'Add a profile photo' },
  { field: 'bio', label: 'Bio', completed: false, weight: 10, description: 'Write a short bio' },
  { field: 'phone', label: 'Phone Number', completed: false, weight: 5, description: 'Add your phone number' },
  { field: 'department', label: 'Department', completed: false, weight: 10, description: 'Select your department' },
  { field: 'yearOfStudy', label: 'Year of Study', completed: false, weight: 10, description: 'Select your academic year' },
  { field: 'interests', label: 'Interests', completed: false, weight: 15, description: 'Add at least 3 interests' },
  { field: 'skills', label: 'Skills', completed: false, weight: 15, description: 'Add at least 3 skills' },
  { field: 'linkedinUrl', label: 'LinkedIn Profile', completed: false, weight: 5, description: 'Add your LinkedIn URL' },
  { field: 'joinedClub', label: 'Join a Club', completed: false, weight: 15, description: 'Join at least one club' },
];

// User export data
export interface UserDataExport {
  profile: UserProfile;
  clubs: UserClub[];
  // events: EventRegistration[];
  achievements: UserAchievement[];
  pointsHistory: PointsTransaction[];
  activities: UserActivity[];
  connections: UserConnection[];
  format: 'json' | 'csv';
  requestedAt: Date;
}

// User analytics for admins
export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number; // Active in last 30 days
  newUsersThisMonth: number;
  userGrowthRate: number;
  retentionRate: number;
  
  demographics: {
    byDepartment: Record<string, number>;
    byYear: Record<number, number>;
    byRole: Record<UserRole, number>;
  };
  
  engagement: {
    averageEventsPerUser: number;
    averageClubsPerUser: number;
    averageSessionDuration: number;
    dailyActiveUsers: Array<{
      date: Date;
      count: number;
    }>;
  };
  
  achievements: {
    totalUnlocked: number;
    averagePerUser: number;
    mostPopular: Array<{
      achievement: Achievement;
      unlockedBy: number;
    }>;
  };
  
  points: {
    totalDistributed: number;
    averagePerUser: number;
    topEarners: User[];
    distribution: Array<{
      range: string;
      count: number;
    }>;
  };
}