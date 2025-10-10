import prisma from '../config/database';
import { hashPassword } from '../utils/bcrypt';
import { generateEmailVerificationToken, generateAccessToken, generateRefreshToken, verifyEmailVerificationToken, verifyPasswordResetToken, generatePasswordResetToken } from '../utils/jwt';
import { sendEmail } from './emailService';
import { RegisterRequest, RegisterResponse, AuthErrorCodes, UserRole } from '../types/auth';
import bcrypt from 'bcryptjs';

const EMAIL_VERIFICATION_EXPIRY_HOURS = 24;

export class AuthenticationError extends Error {
  constructor(message: string, public code: string, public statusCode: number = 400) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class authService {
  /**
   * Register a new user
   */
  async registerUser(userData: RegisterRequest): Promise<any> {
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
      const hashedPassword = await hashPassword(userData.password);

      // Create user in database
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          passwordHash: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          studentId: userData.studentId,
          phone: userData.phone,
          department: userData.department,
          yearOfStudy: userData.yearOfStudy,
          role: UserRole.STUDENT,
          isVerified: false,
          totalPoints: 0,
          totalVolunteerHours: 0
        }
      });

      // Generate email verification token
      const verificationToken = generateEmailVerificationToken(user.id, user.email);

      console.log('Email verification token:', verificationToken);
      console.log(`Verification URL: ${process.env.CLIENT_URL}/auth/verify-email?token=${verificationToken}`);

      // Send verification email
      try {
        await sendEmail({
          to: user.email,
          subject: 'Welcome to ClubHub - Verify Your Email',
          template: 'email-verification',
          data: {
            firstName: user.firstName,
            verificationLink: `${process.env.CLIENT_URL}/auth/verify-email?token=${verificationToken}`
          }
        });
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
      }

      return user;

    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      console.error('Registration error:', error);
      throw new AuthenticationError(
        'Registration failed',
        'REGISTRATION_ERROR',
        500
      );
    }
  }

  /**
   * Generate access and refresh tokens
   */
  async generateTokens(user: any, rememberMe?: boolean) {
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token in database if needed
    // await prisma.refreshToken.create({ ... });

    return { accessToken, refreshToken };
  }

  /**
   * Verify email with token
   */
  // async verifyEmail(token: string) {
  //   const decoded = verifyEmailVerificationToken(token);
    
  //   const user = await prisma.user.update({
  //     where: { id: decoded.userId },
  //     data: { isVerified: true }
  //   });

  //   return user;
  // }

  // In authService.ts
    verifyEmail = async (token: string) => {
    try {
      const decoded = verifyEmailVerificationToken(token);

      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user) return null;

      if (user.isVerified) return user;

      const updatedUser = await prisma.user.update({
        where: { id: decoded.userId },
        data: { isVerified: true },
      });

      return updatedUser;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Email verification failed:', error.message);
      } else {
        console.error('Email verification failed:', error);
      }
      throw new Error('Invalid or expired verification token');
    }
  };


  /**
   * Generate verification token
   */
  async generateVerificationToken(user: any) {
    return generateEmailVerificationToken(user.id, user.email);
  }

  /**
   * Generate password reset token
   */
  async generatePasswordResetToken(user: any) {
    return generatePasswordResetToken(user.id, user.email);
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string) {
    const decoded = verifyPasswordResetToken(token);
    
    const hashedPassword = await hashPassword(newPassword);
    
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { passwordHash: hashedPassword }
    });
  }

  /**
   * Change password
   */
  async changePassword(userId: string, newPassword: string) {
    const hashedPassword = await hashPassword(newPassword);
    
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword }
    });
  }

  /**
   * Invalidate refresh token
   */
  async invalidateRefreshToken(token: string) {
    // Implement token invalidation logic
    // e.g., remove from database or add to blacklist
  }

  /**
   * Verify refresh token
   */
  async verifyRefreshToken(token: string, userId: string): Promise<boolean> {
    // Implement token verification logic
    // e.g., check if token exists in database and belongs to user
    return true;
  }
}

// Export both the class and a default instance
export const authServiceInstance = new authService();
export default authService;