import { prisma } from '../config/database';
import { hashPassword, verifyPasswordSecure, validatePasswordConfirmation } from '../utils/bcrypt';
import { 
  generateTokenPair,
  generateEmailVerificationToken,
  generatePasswordResetToken,
  verifyEmailVerificationToken,
  verifyPasswordResetToken,
  verifyRefreshToken
} from '../utils/jwt';
import { sendEmail } from './emailService';
import {
  RegisterData,
  LoginCredentials,
  LoginResponse,
  RegisterResponse,
  TokenPair,
  ForgotPasswordData,
  ResetPasswordData,
  ChangePasswordData,
  AuthErrorCodes,
  UserRole
} from '../types/auth';
import type { User } from '@prisma/client';

// Constants for security policies
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;
const EMAIL_VERIFICATION_EXPIRY_HOURS = 24;
const PASSWORD_RESET_EXPIRY_HOURS = 1;

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
        role: UserRole.STUDENT, // Default role
        isVerified: false,
        isActive: true,
        totalPoints: 0,
        totalVolunteerHours: 0,
        loginAttempts: 0
      }
    });

    // Generate email verification token
    const verificationToken = generateEmailVerificationToken(user.id, user.email);

    // Store verification token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        emailVerificationToken: verificationToken,
        emailVerificationExpires: new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000)
      }
    });

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
      // Don't fail registration if email fails
    }

    // Return user data (excluding sensitive fields)
    const { passwordHash: _passwordHash, emailVerificationToken: _emailVerificationToken, passwordResetToken: _passwordResetToken, ...userResponse } = user;

    return {
      user: userResponse,
      message: 'Registration successful. Please check your email to verify your account.'
    };

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
};