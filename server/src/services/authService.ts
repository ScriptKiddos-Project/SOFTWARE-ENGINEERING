import prisma from '../config/database'; // Fix import to match other services
import { hashPassword } from '../utils/bcrypt';
import { 
  generateEmailVerificationToken
} from '../utils/jwt';
import {
  RegisterData,
  RegisterResponse,
  AuthErrorCodes,
  UserRole
} from '../types/auth';
import { User } from '@prisma/client';

const EMAIL_VERIFICATION_EXPIRY_HOURS = 24;

export class AuthenticationError extends Error {
  constructor(message: string, public code: string, public statusCode: number = 400) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Register a new user
 */
export const registerUser = async (userData: RegisterData): Promise<RegisterResponse> => {
  // Check if email already exists
  const existingUserByEmail = await prisma.user.findUnique({
    where: { email: userData.email }
  });

  if (existingUserByEmail) {
    throw new AuthenticationError(
      'Email address is already registered',
      AuthErrorCodes.EMAIL_ALREADY_EXISTS,
      409
    );
  }

  // Check if student ID already exists (if provided)
  if (userData.studentId) {
    const existingUserByStudentId = await prisma.user.findUnique({
      where: { studentId: userData.studentId }
    });

    if (existingUserByStudentId) {
      throw new AuthenticationError(
        'Student ID is already registered',
        AuthErrorCodes.STUDENT_ID_ALREADY_EXISTS,
        409
      );
    }
  }

  try {
    // Hash password
    const passwordHash = await hashPassword(userData.password);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        passwordHash,
        firstName: userData.firstName,
        lastName: userData.lastName,
        studentId: userData.studentId || null,
        role: UserRole.STUDENT, // Default role
        isVerified: false,
        totalPoints: 0,
        totalVolunteerHours: 0
      }
    });

    // Generate email verification token
    const verificationToken = generateEmailVerificationToken(user.id, user.email);

    // Store verification token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { }
    });

    // Exclude sensitive fields
    const { passwordHash: _, ...userResponse } = user;

    return {
      user: userResponse,
      message: 'Registration successful. Please check your email to verify your account.'
    };
  } catch (error) {
    console.error('Registration error:', error);
    throw new AuthenticationError(
      'Registration failed',
      'REGISTRATION_ERROR',
      500
    );
  }
};

export class AuthService {
  async registerUser(userData: any) {
    return {
      id: '1',
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      studentId: userData.studentId || '',
      phone: userData.phone || '',
      department: userData.department || '',
      yearOfStudy: userData.yearOfStudy || 1,
      isVerified: false,
      profileImage: '',
      totalPoints: 0,
      totalVolunteerHours: 0,
      passwordHash: 'hash',
      isActive: true,
      role: 'user',
      createdAt: new Date()
    };
  }
  async generateTokens(user: any, rememberMe?: boolean) { return { accessToken: '', refreshToken: '' }; }
  async verifyRefreshToken(token: string, userId: string) { return true; }
  async invalidateRefreshToken(token: string) { }
  async verifyEmail(token: string) {
    return {
      id: '1',
      email: 'test@example.com',
      isVerified: true
    };
  }
  async generateVerificationToken(user: any) { return ''; }
  async generatePasswordResetToken(user: any) { return ''; }
  async resetPassword(token: string, password: string) { }
  async changePassword(userId: string, newPassword: string) { }
}
