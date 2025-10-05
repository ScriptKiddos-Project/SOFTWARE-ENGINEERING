// Extend Express Request type to include user
import { UserRole } from './user';
import { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  studentId?: string;
  phone?: string;
  department?: string;
  yearOfStudy?: number;
  role: UserRole | string;
  isVerified?: boolean;
  passwordHash?: string;
  profileImage?: string;
  totalPoints?: number;
  totalVolunteerHours?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
    userId?: string;
    userRole?: UserRole | string;
  }
}

export type AuthRequest = Request;

// export interface AuthRequest extends Request {
//   user?: AuthUser;
//   userId?: string;
//   userRole?: UserRole | string;
// }
