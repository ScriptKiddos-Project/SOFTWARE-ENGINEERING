// client/src/services/adminService.ts
import api from './api'; // This should be your axios instance or fetch wrapper

export const AdminService = {
  getStatistics: async () => {
    const { data } = await api.get('/admin/analytics/dashboard');
    return data;
  },
  getUsers: async () => {
    const { data } = await api.get('/admin/users');
    return data;
  },
  getAllClubs: async () => {
    const { data } = await api.get('/admin/clubs');
    return data;
  },
  getEvents: async () => {
    const { data } = await api.get('/admin/events');
    return data;
  },
};

// ---------------------- Analytics ----------------------
export const getDashboardAnalytics = async () => {
  const response = await api.get('/admin/analytics/dashboard');
  return response.data;
};

export const getSystemAnalytics = async () => {
  const response = await api.get('/admin/analytics/system');
  return response.data;
};

export const getUserEngagementStats = async () => {
  const response = await api.get('/admin/analytics/users');
  return response.data;
};

export const getClubPerformanceStats = async () => {
  const response = await api.get('/admin/analytics/clubs');
  return response.data;
};

// ---------------------- Users ----------------------
export const getAllUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const getUserById = async (userId: string) => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};

export const updateUserRole = async (userId: string, role: string) => {
  const response = await api.put(`/admin/users/${userId}/role`, { role });
  return response.data;
};

export const verifyUser = async (userId: string) => {
  const response = await api.post(`/admin/users/${userId}/verify`);
  return response.data;
};

export const suspendUser = async (userId: string) => {
  const response = await api.post(`/admin/users/${userId}/suspend`);
  return response.data;
};

export const adjustUserPoints = async (userId: string, points: number) => {
  const response = await api.put(`/admin/users/${userId}/points`, { points });
  return response.data;
};

// ---------------------- Clubs ----------------------
export const getClubs = async () => {
  const response = await api.get('/admin/clubs');
  return response.data;
};

export const getClubById = async (clubId: string) => {
  const response = await api.get(`/admin/clubs/${clubId}`);
  return response.data;
};

export const updateClubStatus = async (clubId: string, status: string) => {
  const response = await api.put(`/admin/clubs/${clubId}/status`, { status });
  return response.data;
};

// ---------------------- Events ----------------------
export const getAllEvents = async () => {
  const response = await api.get('/admin/events');
  return response.data;
};

export const getEventById = async (eventId: string) => {
  const response = await api.get(`/admin/events/${eventId}`);
  return response.data;
};

export const moderateEvent = async (eventId: string, action: string) => {
  const response = await api.post(`/admin/events/${eventId}/moderate`, { action });
  return response.data;
};

// ---------------------- Announcements ----------------------
export const getAnnouncements = async () => {
  const response = await api.get('/admin/announcements');
  return response.data;
};

export const createAnnouncement = async (title: string, content: string) => {
  const response = await api.post('/admin/announcements', { title, content });
  return response.data;
};

export const updateAnnouncement = async (announcementId: string, data: { title?: string; content?: string }) => {
  const response = await api.put(`/admin/announcements/${announcementId}`, data);
  return response.data;
};

export const deleteAnnouncement = async (announcementId: string) => {
  const response = await api.delete(`/admin/announcements/${announcementId}`);
  return response.data;
};

// ---------------------- Reports ----------------------
export const generateUserReport = async () => {
  const response = await api.get('/admin/reports/users');
  return response.data;
};

export const generateClubReport = async () => {
  const response = await api.get('/admin/reports/clubs');
  return response.data;
};

export const generateEventReport = async () => {
  const response = await api.get('/admin/reports/events');
  return response.data;
};

// ---------------------- Badges ----------------------
export const getBadgeSystem = async () => {
  const response = await api.get('/admin/badges');
  return response.data;
};

export const updateBadgeCriteria = async (badgeId: string, criteria: any) => {
  const response = await api.put(`/admin/badges/${badgeId}/criteria`, criteria);
  return response.data;
};

export const awardBadgeManually = async (userId: string, badgeId: string) => {
  const response = await api.post('/admin/badges/award', { userId, badgeId });
  return response.data;
};

// ---------------------- System ----------------------
export const getSystemHealth = async () => {
  const response = await api.get('/admin/system/health');
  return response.data;
};

export const runSystemMaintenance = async () => {
  const response = await api.post('/admin/system/maintenance');
  return response.data;
};

// ---------------------- Audit Logs ----------------------
export const getAuditLogs = async () => {
  const response = await api.get('/admin/audit-logs');
  return response.data;
};

// ---------------------- Data Export ----------------------
export const exportData = async (type: string) => {
  const response = await api.get(`/admin/export/${type}`);
  return response.data;
};
