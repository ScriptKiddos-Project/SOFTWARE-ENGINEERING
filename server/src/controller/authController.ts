import { Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { authService } from '../services/authService';
import { UserService } from '../services/userService';
import { sendEmail } from '../services/emailService'; // ✅ Import function directly
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken,
  generateEmailVerificationToken,
  generatePasswordResetToken,
  verifyEmailVerificationToken,
  verifyPasswordResetToken
} from '../utils/jwt';
import { logger } from '../utils/logger';

import { 
  HTTP_STATUS, 
  SUCCESS_MESSAGES, 
  ERROR_MESSAGES, 
  VALIDATION_RULES
} from '../utils/constants';
import { 
  AppError, 
  catchAsync 
} from '../middleware/errorHandler';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(VALIDATION_RULES.PASSWORD.MIN_LENGTH, 'Password must be at least 8 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50, 'First name too long'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50, 'Last name too long'),
  studentId: z.string().optional(),
  phone: z.string().optional(),
  department: z.string().max(100, 'Department name too long').optional(),
  yearOfStudy: z.number().int().min(1).max(6).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(VALIDATION_RULES.PASSWORD.MIN_LENGTH, `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters`),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(VALIDATION_RULES.PASSWORD.MIN_LENGTH, `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters`),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export class AuthController {
  private authService: authService;
  private userService: UserService;
  // ✅ REMOVED: private emailService: emailService;

  constructor() {
    this.authService = new authService();
    this.userService = new UserService();
    // ✅ REMOVED: this.emailService = new emailService();
  }

  // Register new user
  register = catchAsync(async (req: any, res: Response): Promise<void> => {
    const validationResult = registerSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.errors.forEach((error) => {
        errors[error.path.join('.')] = error.message;
      });
      throw new AppError(JSON.stringify(errors), HTTP_STATUS.BAD_REQUEST);
    }

    const userData = validationResult.data;

    // Check if user already exists
    const existingUser = await this.userService.findByEmail(userData.email);
    if (existingUser) {
      // ✅ Add better error message based on verification status
      if (!existingUser.isVerified) {
        throw new AppError(
          'This email is already registered but not verified. Please check your email for the verification link or request a new one.',
          HTTP_STATUS.CONFLICT
        );
      }
      throw new AppError(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
    }

    // Check if student ID already exists (if provided)
    if (userData.studentId) {
      const existingStudentId = await this.userService.findByStudentId(userData.studentId);
      if (existingStudentId) {
        throw new AppError('Student ID already exists', HTTP_STATUS.CONFLICT);
      }
    }

    // Create user
    const user = await this.authService.registerUser(userData);

    // Send verification email
    try {
      const verificationToken = await this.authService.generateVerificationToken(user);
      await sendEmail({
        to: user.email,
        subject: 'Verify Your ClubHub Email Address',
        template: 'email-verification',
        data: {
          firstName: user.firstName,
          verificationToken, // ✅ Pass token for template to build link
          email: user.email,
        }
      });
      logger.info(`Verification email sent to ${user.email}`);
    } catch (error) {
      logger.error('Failed to send verification email:', error);
      // ✅ Don't let email failure block registration
    }

    // ✅ Return success without tokens - user must verify email first
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      data: {
        email: user.email,
        requiresVerification: true,
      },
    });
  });

  // Login user
  login = catchAsync(async (req: any, res: Response): Promise<void> => {
    const validationResult = loginSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.errors.forEach((error) => {
        errors[error.path.join('.')] = error.message;
      });
      throw new AppError(JSON.stringify(errors), HTTP_STATUS.BAD_REQUEST);
    }

    const { email, password, rememberMe } = validationResult.data;

    // Find user by email
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }

    // ✅ Check verification BEFORE generating tokens
    if (!user.isVerified) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Please verify your email before logging in. Check your inbox for the verification link.',
        error: 'EMAIL_NOT_VERIFIED'
      });
      return;
    }

    // Update last login
    await this.userService.updateUser(user.id, { updatedAt: new Date() });

    // ✅ Generate tokens only if verified
    const tokens = await this.authService.generateTokens(user, rememberMe);

    // Set refresh token in HTTP-only cookie
    const cookieMaxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: cookieMaxAge,
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
      data: {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          student_id: user.studentId,
          phone: user.phone,
          department: user.department,
          year_of_study: user.yearOfStudy,
          role: user.role,
          is_verified: user.isVerified,
          profile_image: user.profileImage,
          total_points: user.totalPoints,
          total_volunteer_hours: user.totalVolunteerHours,
          created_at: user.createdAt,
          updated_at: user.updatedAt,
        },
        accessToken: tokens.accessToken,
      },
    });
  });

  // Logout user
  logout = catchAsync(async (req: any, res: Response): Promise<void> => {
    const refreshToken = req.cookies.refreshToken;
    
    if (refreshToken) {
      await this.authService.invalidateRefreshToken(refreshToken);
    }

    res.clearCookie('refreshToken');

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
    });
  });

  // Refresh access token
  refreshToken = catchAsync(async (req: any, res: Response): Promise<void> => {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      throw new AppError('Refresh token not provided', HTTP_STATUS.UNAUTHORIZED);
    }

    const decoded = verifyRefreshToken(refreshToken);
    
    const user = await this.userService.findById(decoded.userId);
    if (!user) {
      throw new AppError('Invalid refresh token', HTTP_STATUS.UNAUTHORIZED);
    }

    const isValidRefreshToken = await this.authService.verifyRefreshToken(refreshToken, user.id);
    if (!isValidRefreshToken) {
      throw new AppError('Invalid refresh token', HTTP_STATUS.UNAUTHORIZED);
    }

    const tokens = await this.authService.generateTokens(user);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: tokens.accessToken,
      },
    });
  });

  // Verify email
  verifyEmail = catchAsync(async (req: any, res: Response): Promise<void> => {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      throw new AppError('Verification token is required', HTTP_STATUS.BAD_REQUEST);
    }

    const user = await this.authService.verifyEmail(token);

    if (!user) {
      throw new AppError('Invalid or expired verification token', HTTP_STATUS.BAD_REQUEST);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          isVerified: user.isVerified,
        },
      },
    });
  });

  // Resend verification email
  resendVerification = catchAsync(async (req: any, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
    }

    if (req.user.isVerified) {
      throw new AppError('Email is already verified', HTTP_STATUS.BAD_REQUEST);
    }

    const verificationToken = await this.authService.generateVerificationToken(req.user);
    
    await sendEmail({
      to: req.user.email,
      subject: 'Verify Your ClubHub Email Address',
      template: 'email-verification',
      data: {
        firstName: req.user.firstName,
        verificationToken,
        email: req.user.email
      }
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Verification email sent',
    });
  });

  // Forgot password
  forgotPassword = catchAsync(async (req: any, res: Response): Promise<void> => {
    const validationResult = forgotPasswordSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.errors.forEach((error) => {
        errors[error.path.join('.')] = error.message;
      });
      throw new AppError(JSON.stringify(errors), HTTP_STATUS.BAD_REQUEST);
    }

    const { email } = validationResult.data;

    const user = await this.userService.findByEmail(email);
    if (!user) {
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link',
      });
      return;
    }

    const resetToken = await this.authService.generatePasswordResetToken(user);

    try {
      await sendEmail({
        to: user.email,
        subject: 'Reset Your ClubHub Password',
        template: 'password-reset',
        data: {
          firstName: user.firstName,
          resetToken,
          email: user.email,
        }
      });
      logger.info(`Password reset email sent to ${user.email}`);
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      throw new AppError('Failed to send password reset email', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link',
    });
  });

  // Reset password
  resetPassword = catchAsync(async (req: any, res: Response): Promise<void> => {
    const validationResult = resetPasswordSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.errors.forEach((error) => {
        errors[error.path.join('.')] = error.message;
      });
      throw new AppError(JSON.stringify(errors), HTTP_STATUS.BAD_REQUEST);
    }

    const { token, password } = validationResult.data;

    await this.authService.resetPassword(token, password);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS,
    });
  });

  // Change password
  changePassword = catchAsync(async (req: any, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
    }

    const validationResult = changePasswordSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.errors.forEach((error) => {
        errors[error.path.join('.')] = error.message;
      });
      throw new AppError(JSON.stringify(errors), HTTP_STATUS.BAD_REQUEST);
    }

    const { currentPassword, newPassword } = validationResult.data;

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, req.user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', HTTP_STATUS.BAD_REQUEST);
    }

    await this.authService.changePassword(req.user.id, newPassword);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Password changed successfully',
    });
  });

  // Get current user
  me = catchAsync(async (req: any, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: {
        user: {
          id: req.user.id,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          studentId: req.user.studentId,
          phone: req.user.phone,
          department: req.user.department,
          yearOfStudy: req.user.yearOfStudy,
          role: req.user.role,
          isVerified: req.user.isVerified,
          profileImage: req.user.profileImage,
          totalPoints: req.user.totalPoints,
          totalVolunteerHours: req.user.totalVolunteerHours,
          createdAt: req.user.createdAt,
        },
      },
    });
  });

  // Check authentication status
  checkAuth = catchAsync(async (req: any, res: Response): Promise<void> => {
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Authentication valid',
      data: {
        authenticated: !!req.user,
        user: req.user ? {
          id: req.user.id,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          role: req.user.role,
          isVerified: req.user.isVerified,
        } : null,
      },
    });
  });
}

export const authController = new AuthController();