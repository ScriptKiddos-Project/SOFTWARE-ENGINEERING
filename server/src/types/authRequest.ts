// Extend Express Request type to include user
import { UserRole } from '../types/user';
import { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole | string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}
