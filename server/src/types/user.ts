export enum UserRole {
    STUDENT = 'student',
    CLUB_ADMIN = 'club_admin',
    SUPER_ADMIN = 'super_admin'
  }
  
  export enum ClubCategory {
    TECHNICAL = 'technical',
    CULTURAL = 'cultural',
    SPORTS = 'sports',
    ACADEMIC = 'academic',
    SOCIAL = 'social',
    ENTREPRENEURSHIP = 'entrepreneurship',
    VOLUNTEER = 'volunteer'
  }
  
  export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    studentId?: string;
    phone?: string;
    department?: string;
    yearOfStudy?: number;
    role: UserRole;
    isVerified: boolean;
    profileImage?: string;
    totalPoints: number;
    totalVolunteerHours: number;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface CreateUserData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    studentId?: string;
    phone?: string;
    department?: string;
    yearOfStudy?: number;
  }
  
  export interface UpdateUserData {
    firstName?: string;
    lastName?: string;
    phone?: string;
    department?: string;
    yearOfStudy?: number;
    profileImage?: string;
  }
  
  export interface UserProfile extends User {
    joinedClubs: UserClub[];
    registeredEvents: EventRegistration[];
    pointsHistory: PointsHistory[];
  }
  
  export interface UserClub {
    id: string;
    userId: string;
    clubId: string;
    role: ClubMemberRole;
    joinedAt: Date;
    isActive: boolean;
    club: {
      id: string;
      name: string;
      category: ClubCategory;
      logoUrl?: string;
    };
  }
  
  export interface EventRegistration {
    id: string;
    userId: string;
    eventId: string;
    registrationDate: Date;
    status: RegistrationStatus;
    attended: boolean;
    pointsAwarded: number;
    volunteerHoursAwarded: number;
    event: {
      id: string;
      title: string;
      startDate: Date;
      pointsReward: number;
      volunteerHours: number;
    };
  }
  
  export interface PointsHistory {
    id: string;
    userId: string;
    eventId: string;
    pointsEarned: number;
    volunteerHours: number;
    earnedAt: Date;
    description: string;
  }
  
  export enum ClubMemberRole {
    MEMBER = 'member',
    COORDINATOR = 'coordinator',
    ADMIN = 'admin'
  }
  
  export enum RegistrationStatus {
    REGISTERED = 'registered',
    WAITLISTED = 'waitlisted',
    CANCELLED = 'cancelled',
    ATTENDED = 'attended',
    NO_SHOW = 'no_show'
  }
  
  export interface DashboardStats {
    totalPoints: number;
    totalVolunteerHours: number;
    clubsJoined: number;
    eventsAttended: number;
    upcomingEvents: number;
    recentActivities: RecentActivity[];
  }
  
  export interface RecentActivity {
    id: string;
    type: 'event_registration' | 'club_join' | 'points_earned' | 'event_attendance';
    title: string;
    description: string;
    timestamp: Date;
    points?: number;
  }
  
  export interface UserFilters {
    role?: UserRole;
    department?: string;
    yearOfStudy?: number;
    isVerified?: boolean;
    search?: string;
  }
  
  export interface UserListResponse {
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }