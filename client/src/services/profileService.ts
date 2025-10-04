import { api } from './api';
import { UserProfile, PointsHistory, Badge, VolunteerRecord } from '../types/user';
import { ApiResponse } from '../types/api';

export const profileService = {
  // Get current user profile
  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    return api.get('/profile');
  },

  // Update user profile
  updateProfile: async (updateData: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> => {
    return api.put('/profile', updateData);
  },

  // Upload profile avatar
  uploadAvatar: async (file: File): Promise<ApiResponse<{ profileImage: string }>> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return api.post('/profile/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get user's clubs
  getMyClubs: async (): Promise<ApiResponse<any[]>> => {
    return api.get('/profile/clubs');
  },

  // Get user's events
  getMyEvents: async (filters?: {
    type?: 'upcoming' | 'past' | 'all';
    limit?: number;
  }): Promise<ApiResponse<any[]>> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const queryString = params.toString();
    const url = queryString ? `/profile/events?${queryString}` : '/profile/events';
    
    return api.get(url);
  },

  // Get points history
  getPointsHistory: async (limit?: number): Promise<ApiResponse<PointsHistory[]>> => {
    const url = limit ? `/profile/points?limit=${limit}` : '/profile/points';
    return api.get(url);
  },

  // Get volunteer hours
  getVolunteerHours: async (): Promise<ApiResponse<VolunteerRecord[]>> => {
    return api.get('/profile/volunteer-hours');
  },

  // Get earned badges
  getBadges: async (): Promise<ApiResponse<Badge[]>> => {
    return api.get('/profile/badges');
  },

  // Get dashboard statistics
  getDashboardStats: async (): Promise<ApiResponse<{
    totalPoints: number;
    totalVolunteerHours: number;
    joinedClubs: number;
    upcomingEvents: number;
    completedEvents: number;
    badges: number;
    rank: number;
    recentActivity: any[];
  }>> => {
    return api.get('/profile/dashboard-stats');
  },

  // Update profile settings
  updateSettings: async (settings: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    privacy?: 'public' | 'private';
    language?: string;
    timezone?: string;
  }): Promise<ApiResponse<void>> => {
    return api.put('/profile/settings', settings);
  },

  // Get profile settings
  getSettings: async (): Promise<ApiResponse<any>> => {
    return api.get('/profile/settings');
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<void>> => {
    return api.put('/profile/change-password', {
      currentPassword,
      newPassword
    });
  },

  // Get activity timeline
  getActivityTimeline: async (limit: number = 20): Promise<ApiResponse<any[]>> => {
    return api.get(`/profile/activity?limit=${limit}`);
  },

  // Get achievements/milestones
  getAchievements: async (): Promise<ApiResponse<any[]>> => {
    return api.get('/profile/achievements');
  },

  // Get leaderboard position
  getLeaderboardPosition: async (): Promise<ApiResponse<{
    rank: number;
    totalUsers: number;
    percentile: number;
  }>> => {
    return api.get('/profile/leaderboard-position');
  },

  // Export profile data
  exportProfileData: async (): Promise<ApiResponse<any>> => {
    return api.get('/profile/export');
  },

  // Delete account
  deleteAccount: async (password: string): Promise<ApiResponse<void>> => {
    return api.delete('/profile/delete-account', {
      data: { password }
    });
  },

  // Get certificates/credentials
  getCertificates: async (): Promise<ApiResponse<any[]>> => {
    return api.get('/profile/certificates');
  },

  // Generate participation certificate
  generateCertificate: async (eventId: string): Promise<ApiResponse<{ certificateUrl: string }>> => {
    return api.post(`/profile/certificates/generate/${eventId}`);
  }
};