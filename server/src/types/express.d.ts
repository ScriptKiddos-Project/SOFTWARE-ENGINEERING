import { UserRole } from '@/utils/constants'; // or wherever your roles are defined

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: 'student' | 'club_admin' | 'super_admin';
        firstName: string;
        lastName: string;
      };
      rateLimit?: {
        limit: number;
        remaining: number;
        resetTime: Date;
      };
    }
  }
}

export {};
