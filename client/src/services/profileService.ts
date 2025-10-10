import { api } from './api';
import { UserProfile, PointsHistory, Badge, VolunteerRecord } from '../types/user';
import { ApiResponse } from '../types/api';

export const profileService = {
  // Get current user profile - FIXED: Changed from /profile to /profile/me
  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    return api.get('/me');
  },

  // Update user profile - FIXED: Changed from /profile to /profile/me
  updateProfile: async (updateData: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> => {
    return api.put('/me', updateData);
  },

  // Upload profile avatar - FIXED: Changed endpoint
  uploadAvatar: async (file: File): Promise<ApiResponse<{ profileImage: string }>> => {
    const formData = new FormData();
    formData.append('profilePicture', file); // Match the multer field name
    
    return api.post('/me/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get user's clubs - FIXED: Changed from /profile/clubs to /profile/me/clubs
  getMyClubs: async (): Promise<ApiResponse<any[]>> => {
    return api.get('/me/clubs');
  },

  // Get user's events - FIXED: Changed from /profile/events to /profile/me/events
  getMyEvents: async (filters?: {
    type?: 'upcoming' | 'past' | 'all';
    limit?: number;
  }): Promise<ApiResponse<any[]>> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('filter', filters.type);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const queryString = params.toString();
    const url = queryString ? `/me/events?${queryString}` : '/profile/me/events';
    
    return api.get(url);
  },

  // Get points history - FIXED: Changed from /profile/points to /profile/me/points
  getPointsHistory: async (limit?: number): Promise<ApiResponse<PointsHistory[]>> => {
    const url = limit ? `/me/points?limit=${limit}` : '/profile/me/points';
    return api.get(url);
  },

  // Get volunteer hours - FIXED: Changed endpoint
  getVolunteerHours: async (): Promise<ApiResponse<VolunteerRecord[]>> => {
    return api.get('/me/volunteer-hours');
  },

  // Get earned badges - FIXED: Changed endpoint
  getBadges: async (): Promise<ApiResponse<Badge[]>> => {
    return api.get('/me/badges');
  },

  // Get dashboard statistics - FIXED: Changed endpoint
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
    return api.get('/me/stats');
  },

  // Update profile settings - FIXED: Changed endpoint
  updateSettings: async (settings: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    privacy?: 'public' | 'private';
    language?: string;
    timezone?: string;
  }): Promise<ApiResponse<void>> => {
    return api.put('/me/preferences', settings);
  },

  // Get profile settings - FIXED: Changed endpoint
  getSettings: async (): Promise<ApiResponse<any>> => {
    return api.get('/me/preferences');
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<void>> => {
    return api.put('/change-password', {
      currentPassword,
      newPassword
    });
  },

  // Get activity timeline - FIXED: Changed endpoint
  getActivityTimeline: async (limit: number = 20): Promise<ApiResponse<any[]>> => {
    return api.get(`/me/activity?limit=${limit}`);
  },

  // Get achievements/milestones - FIXED: Changed endpoint
  getAchievements: async (): Promise<ApiResponse<any[]>> => {
    return api.get('/me/achievements');
  },

  // Get leaderboard position - FIXED: Changed endpoint
  getLeaderboardPosition: async (): Promise<ApiResponse<{
    rank: number;
    totalUsers: number;
    percentile: number;
  }>> => {
    return api.get('/me/leaderboard');
  },

  // Export profile data - FIXED: Changed endpoint
  exportProfileData: async (): Promise<ApiResponse<any>> => {
    return api.get('/me/export');
  },

  // Delete account - FIXED: Changed endpoint and method
  deleteAccount: async (password: string): Promise<ApiResponse<void>> => {
    return api.delete('/me', {
      data: { confirmPassword: password }
    });
  },

  // Get certificates/credentials
  getCertificates: async (): Promise<ApiResponse<any[]>> => {
    return api.get('/certificates');
  },

  // Generate participation certificate
  generateCertificate: async (eventId: string): Promise<ApiResponse<{ certificateUrl: string }>> => {
    return api.post(`/certificates/generate/${eventId}`);
  }
};