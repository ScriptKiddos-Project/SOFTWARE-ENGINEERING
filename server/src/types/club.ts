import { PrismaClient, ClubMemberRole, ClubCategory } from '@prisma/client';

export interface Club {
  id: string;
  name: string;
  description?: string | null;
  category?: ClubCategory | null;
  contactEmail?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  createdBy?: string;
  isActive?: boolean;
  memberCount?: number;
  updatedAt?: Date;
  createdAt?: Date;
}

export interface CreateClubData {
  name: string;
  description?: string;
  category?: string;
  contactEmail?: string;
  logoUrl?: string;
  coverImageUrl?: string;
}

export interface UpdateClubData {
  name?: string;
  description?: string;
  category?: string;
  contactEmail?: string;
  logoUrl?: string;
  coverImageUrl?: string;
}

export interface ClubWithDetails extends Club {
  members: ClubMember[];
  events: any[];
  admins: ClubMember[];
  recentActivities: any[];
}

export interface ClubMember {
  id: string;
  userId: string;
  clubId: string;
  role: ClubMemberRole;
  joinedAt?: Date;
  isActive?: boolean;
  user?: any;
}

export interface JoinClubRequest {
  userId: string;
  clubId: string;
  message?: string;
}

export interface ClubStats {
  totalMembers: number;
  activeMembers: number;
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  averageAttendance: number;
  totalPointsDistributed: number;
  totalVolunteerHours: number;
}

export interface ClubFilters {
  category?: string;
  isActive?: boolean;
  minMembers?: number;
  maxMembers?: number;
  search?: string;
  hasUpcomingEvents?: boolean;
}

export interface ClubListResponse {
  clubs: Club[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MemberFilters {
  role?: string;
  isActive?: boolean;
  search?: string;
  department?: string;
  yearOfStudy?: number;
}

export type ClubActivity = any;
export type ClubAnalytics = any;
