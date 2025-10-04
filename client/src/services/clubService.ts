import { api } from './api';
import { Club, ClubMember, ClubFilters, CreateClubData, UpdateClubData } from '../types/club';
import { ApiResponse } from '../types/api';

export const clubService = {
  // Get all clubs with optional filters
  getClubs: async (filters?: ClubFilters): Promise<ApiResponse<Club[]>> => {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.category) {
        const cat = Array.isArray(filters.category) ? filters.category.join(',') : String(filters.category);
        params.append('category', cat);
      }
      if (filters.search) params.append('search', filters.search);
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `/clubs?${queryString}` : '/clubs';
    
    return api.get(url);
  },

  // Get single club by ID
  getClubById: async (clubId: string): Promise<ApiResponse<Club>> => {
    return api.get(`/clubs/${clubId}`);
  },

  // Create new club (admin only)
  createClub: async (clubData: CreateClubData): Promise<ApiResponse<Club>> => {
    return api.post('/clubs', clubData);
  },

  // Update existing club (club admin only)
  updateClub: async (clubId: string, updateData: UpdateClubData): Promise<ApiResponse<Club>> => {
    return api.put(`/clubs/${clubId}`, updateData);
  },

  // Delete club (admin only)
  deleteClub: async (clubId: string): Promise<ApiResponse<void>> => {
    return api.delete(`/clubs/${clubId}`);
  },

  // Join club
  joinClub: async (clubId: string): Promise<ApiResponse<void>> => {
    return api.post(`/clubs/${clubId}/join`);
  },

  // Leave club
  leaveClub: async (clubId: string): Promise<ApiResponse<void>> => {
    return api.post(`/clubs/${clubId}/leave`);
  },

  // Get club members (club admin/member only)
  getClubMembers: async (clubId: string): Promise<ApiResponse<ClubMember[]>> => {
    return api.get(`/clubs/${clubId}/members`);
  },

  // Remove member from club (club admin only)
  removeMember: async (clubId: string, userId: string): Promise<ApiResponse<void>> => {
    return api.delete(`/clubs/${clubId}/members/${userId}`);
  },

  // Update member role (club admin only)
  updateMemberRole: async (clubId: string, userId: string, role: string): Promise<ApiResponse<void>> => {
    return api.put(`/clubs/${clubId}/members/${userId}/role`, { role });
  },

  // Get club categories
  getCategories: async (): Promise<ApiResponse<string[]>> => {
    return api.get('/clubs/categories');
  },

  // Get user's joined clubs
  getMyClubs: async (): Promise<ApiResponse<Club[]>> => {
    return api.get('/clubs/my-clubs');
  },

  // Get featured/popular clubs
  getFeaturedClubs: async (limit: number = 6): Promise<ApiResponse<Club[]>> => {
    return api.get(`/clubs/featured?limit=${limit}`);
  },

  // Upload club logo
  uploadLogo: async (clubId: string, file: File): Promise<ApiResponse<{ logoUrl: string }>> => {
    const formData = new FormData();
    formData.append('logo', file);
    
    return api.post(`/clubs/${clubId}/upload-logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Upload club cover image
  uploadCoverImage: async (clubId: string, file: File): Promise<ApiResponse<{ coverImageUrl: string }>> => {
    const formData = new FormData();
    formData.append('coverImage', file);
    
    return api.post(`/clubs/${clubId}/upload-cover`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get club statistics (club admin only)
  getClubStats: async (clubId: string): Promise<ApiResponse<{
    totalMembers: number;
    totalEvents: number;
    upcomingEvents: number;
    totalPoints: number;
    totalVolunteerHours: number;
    membershipGrowth: { month: string; count: number }[];
    eventAttendanceRate: number;
  }>> => {
    return api.get(`/clubs/${clubId}/stats`);
  },

  // Search clubs
  searchClubs: async (query: string, limit: number = 10): Promise<ApiResponse<Club[]>> => {
    return api.get(`/clubs/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  },

  // Get clubs by category
  getClubsByCategory: async (category: string, limit?: number): Promise<ApiResponse<Club[]>> => {
    const url = limit ? `/clubs/category/${category}?limit=${limit}` : `/clubs/category/${category}`;
    return api.get(url);
  },

  // Get club activity feed (club admin/member only)
  getClubActivity: async (clubId: string, limit: number = 20): Promise<ApiResponse<any[]>> => {
    return api.get(`/clubs/${clubId}/activity?limit=${limit}`);
  },

  // Request to join club (if approval required)
  requestToJoin: async (clubId: string, message?: string): Promise<ApiResponse<void>> => {
    return api.post(`/clubs/${clubId}/request-join`, { message });
  },

  // Approve join request (club admin only)
  approveJoinRequest: async (clubId: string, userId: string): Promise<ApiResponse<void>> => {
    return api.post(`/clubs/${clubId}/approve-join`, { userId });
  },

  // Reject join request (club admin only)
  rejectJoinRequest: async (clubId: string, userId: string, reason?: string): Promise<ApiResponse<void>> => {
    return api.post(`/clubs/${clubId}/reject-join`, { userId, reason });
  },

  // Get pending join requests (club admin only)
  getPendingRequests: async (clubId: string): Promise<ApiResponse<any[]>> => {
    return api.get(`/clubs/${clubId}/pending-requests`);
  },

  // Toggle club active status (admin only)
  toggleClubStatus: async (clubId: string): Promise<ApiResponse<Club>> => {
    return api.put(`/clubs/${clubId}/toggle-status`);
  }
};