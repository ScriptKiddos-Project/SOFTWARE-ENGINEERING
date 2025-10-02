import { Request, Response, NextFunction } from 'express';
import { EmailService } from '../services/emailService';
import { AuthService } from '../services/authService';
import { UserService } from '../services/userService';
import { ApiError } from '../utils/errors';
import { logger } from '../utils/logger';
import { RESPONSE_MESSAGES, HTTP_STATUS } from '../utils/constants';
import { RegisterData, LoginCredentials, ApiResponse } from '../types/auth';
import { compare } from '../utils/bcrypt';
import { validateRequest } from '../utils/validation';
import { VALIDATION_RULES } from '../utils/constants';
import { AuthRequest } from '../types/authRequest';
import { AuthUser } from '../types/auth';
import { z } from 'zod';
import { verifyToken } from '../utils/jwt';

// Validation schemas
const registerSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .min(VALIDATION_RULES.EMAIL.MIN_LENGTH, `Email must be at least ${VALIDATION_RULES.EMAIL.MIN_LENGTH} characters`)
    .max(VALIDATION_RULES.EMAIL.MAX_LENGTH, `Email must be at most ${VALIDATION_RULES.EMAIL.MAX_LENGTH} characters`),
  
  password: z
    .string()
    .min(VALIDATION_RULES.PASSWORD.MIN_LENGTH, `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters`)
    .max(VALIDATION_RULES.PASSWORD.MAX_LENGTH, `Password must be at most ${VALIDATION_RULES.PASSWORD.MAX_LENGTH} characters`)
    .regex(VALIDATION_RULES.PASSWORD.REGEX, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  firstName: z
    .string()
    .min(VALIDATION_RULES.NAME.MIN_LENGTH, `First name must be at least ${VALIDATION_RULES.NAME.MIN_LENGTH} characters`)
    .max(VALIDATION_RULES.NAME.MAX_LENGTH, `First name must be at most ${VALIDATION_RULES.NAME.MAX_LENGTH} characters`)
    .regex(VALIDATION_RULES.NAME.REGEX, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  
  lastName: z
    .string()
    .min(VALIDATION_RULES.NAME.MIN_LENGTH, `Last name must be at least ${VALIDATION_RULES.NAME.MIN_LENGTH} characters`)
    .max(VALIDATION_RULES.NAME.MAX_LENGTH, `Last name must be at most ${VALIDATION_RULES.NAME.MAX_LENGTH} characters`)
    .regex(VALIDATION_RULES.NAME.REGEX, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  
  studentId: z
    .string()
    .min(VALIDATION_RULES.STUDENT_ID.MIN_LENGTH, `Student ID must be at least ${VALIDATION_RULES.STUDENT_ID.MIN_LENGTH} characters`)
    .max(VALIDATION_RULES.STUDENT_ID.MAX_LENGTH, `Student ID must be at most ${VALIDATION_RULES.STUDENT_ID.MAX_LENGTH} characters`)
    .regex(VALIDATION_RULES.STUDENT_ID.REGEX, 'Student ID can only contain letters and numbers')
    .optional(),
  
  phone: z
    .string()
    .regex(VALIDATION_RULES.PHONE.REGEX, 'Invalid phone number format')
    .optional(),
  
  department: z.string().max(100, 'Department name too long').optional(),
  
  yearOfStudy: z
    .number()
    .int('Year of study must be an integer')
    .min(1, 'Year of study must be at least 1')
    .max(6, 'Year of study must be at most 6')
    .optional(),
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
    .min(VALIDATION_RULES.PASSWORD.MIN_LENGTH, `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters`)
    .regex(VALIDATION_RULES.PASSWORD.REGEX, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(VALIDATION_RULES.PASSWORD.MIN_LENGTH, `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters`)
    .regex(VALIDATION_RULES.PASSWORD.REGEX, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export class AuthController {
  private authService: AuthService;
  private userService: UserService;
  private emailService: EmailService;

  constructor() {
    this.authService = new AuthService();
    this.userService = new UserService();
    this.emailService = new EmailService();
  }

  // Register new user
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validationResult = registerSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errors: Record<string, string> = {};
        validationResult.error.errors.forEach((error) => {
          errors[error.path.join('.')] = error.message;
        });
        throw new ApiError(400, 'Validation failed');
      }

      const userData = validationResult.data;

      // Check if user already exists
      const existingUser = await this.userService.findByEmail(userData.email);
      if (existingUser) {
        throw new ApiError(409, 'Email already exists');
      }

      // Check if student ID already exists (if provided)
      if (userData.studentId) {
        const existingStudentId = await this.userService.findByStudentId(userData.studentId);
        if (existingStudentId) {
          throw new ApiError(409, 'Student ID already exists');
        }
      }

      // Create user
      const user = await this.authService.registerUser(userData);

      // Send verification email
      try {
        await this.emailService.sendVerificationEmail(user);
        logger.info(`Verification email sent to ${user.email}`);
      } catch (error) {
        logger.error('Failed to send verification email:', error);
        // Don't fail registration if email fails
      }

      // Generate tokens
      const tokens = await this.authService.generateTokens(user);

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      const response: ApiResponse = {
        message: RESPONSE_MESSAGES.SUCCESS.REGISTER,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isVerified: user.isVerified,
          },
          accessToken: tokens.accessToken,
        },
      };

      res.status(HTTP_STATUS.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  };

  // Login user
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validationResult = loginSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errors: Record<string, string> = {};
        validationResult.error.errors.forEach((error) => {
          errors[error.path.join('.')] = error.message;
        });
        throw new ApiError(400, 'Validation failed');
      }

      const { email, password, rememberMe }: LoginCredentials = validationResult.data;

      // Find user by email
      const user = await this.userService.findByEmail(email);
      if (!user) {
        throw new ApiError(401, 'Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new ApiError(403, 'Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid credentials');
      }

      // Update last login
      await this.userService.updateLastLogin(user.id);

      // Generate tokens
      const tokens = await this.authService.generateTokens(user, rememberMe);

      // Set refresh token in HTTP-only cookie
      const cookieMaxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000; // 30 days or 7 days
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: cookieMaxAge,
      });

      const response: ApiResponse = {
        message: RESPONSE_MESSAGES.SUCCESS.LOGIN,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isVerified: user.isVerified,
            profileImage: user.profileImage,
            totalPoints: user.totalPoints,
            totalVolunteerHours: user.totalVolunteerHours,
          },
          accessToken: tokens.accessToken,
        },
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  // Logout user
  logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken;
      
      if (refreshToken) {
        // Invalidate refresh token in database
        await this.authService.invalidateRefreshToken(refreshToken);
      }

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      const response: ApiResponse = {
        message: RESPONSE_MESSAGES.SUCCESS.LOGOUT,
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  // Refresh access token
  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken;
      
      if (!refreshToken) {
        throw new ApiError(401, 'Refresh token not provided');
      }

      // Verify and decode refresh token
      const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET!);
      
      // Find user
      const user = await this.userService.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      // Verify refresh token in database
      const isValidRefreshToken = await this.authService.verifyRefreshToken(refreshToken, user.id);
      if (!isValidRefreshToken) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      // Generate new tokens
      const tokens = await this.authService.generateTokens(user);

      // Set new refresh token in cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      const response: ApiResponse = {
        message: 'Token refreshed successfully',
        data: {
          accessToken: tokens.accessToken,
        },
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  // Verify email
  verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        throw new ApiError(400, 'Verification token is required');
      }

      const user = await this.authService.verifyEmail(token);

      const response: ApiResponse = {
        message: 'Email verified successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            isVerified: user.isVerified,
          },
        },
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  // Resend verification email
  resendVerification = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      if ((req.user as any).isVerified) {
        throw new ApiError(400, 'Email is already verified');
      }
      await this.authService.generateVerificationToken(req.user);
      await this.emailService.sendVerificationEmail(req.user);
      const response: ApiResponse = {
        message: RESPONSE_MESSAGES.SUCCESS.EMAIL_SENT,
      };
      res.status(HTTP_STATUS.OK).json(response);
      return;
    } catch (error) {
      next(error);
      return;
    }
  };

  // Forgot password
  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validationResult = forgotPasswordSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errors: Record<string, string> = {};
        validationResult.error.errors.forEach((error) => {
          errors[error.path.join('.')] = error.message;
        });
        throw new ApiError(400, 'Validation failed');
      }

      const { email } = validationResult.data;

      const user = await this.userService.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        const response: ApiResponse = {
          message: 'If an account with that email exists, we have sent a password reset link',
        };
        res.status(HTTP_STATUS.OK).json(response);
        return;
      }

      // Generate password reset token
      await this.authService.generatePasswordResetToken(user);

      // Send password reset email
      try {
        await this.emailService.sendPasswordResetEmail(user);
        logger.info(`Password reset email sent to ${user.email}`);
      } catch (error) {
        logger.error('Failed to send password reset email:', error);
        throw new ApiError(500, 'Failed to send password reset email');
      }

      const response: ApiResponse = {
        message: 'If an account with that email exists, we have sent a password reset link',
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  // Reset password
  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validationResult = resetPasswordSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errors: Record<string, string> = {};
        validationResult.error.errors.forEach((error) => {
          errors[error.path.join('.')] = error.message;
        });
        throw new ApiError(400, 'Validation failed');
      }

      const { token, password } = validationResult.data;

      await this.authService.resetPassword(token, password);

      const response: ApiResponse = {
        message: RESPONSE_MESSAGES.SUCCESS.PASSWORD_RESET,
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  // Change password (for authenticated users)
  changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const validationResult = changePasswordSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errors: Record<string, string> = {};
        validationResult.error.errors.forEach((error) => {
          errors[error.path.join('.')]=error.message;
        });
        throw new ApiError(400, 'Validation failed');
      }
      const { currentPassword, newPassword } = validationResult.data;
      const isCurrentPasswordValid = await compare(currentPassword, (req.user as any).passwordHash);
      if (!isCurrentPasswordValid) {
        throw new ApiError(400, 'Current password is incorrect');
      }
      await this.authService.changePassword(req.user.id, newPassword);
      const response: ApiResponse = {
        message: 'Password changed successfully',
      };
      res.status(HTTP_STATUS.OK).json(response);
      return;
    } catch (error) {
      next(error);
      return;
    }
  };

  // Get current user
  me = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const response: ApiResponse = {
        message: 'User profile retrieved successfully',
        data: {
          user: {
            id: (req.user as any).id,
            email: (req.user as any).email,
            firstName: (req.user as any).firstName,
            lastName: (req.user as any).lastName,
            studentId: (req.user as any).studentId,
            phone: (req.user as any).phone,
            department: (req.user as any).department,
            yearOfStudy: (req.user as any).yearOfStudy,
            role: (req.user as any).role,
            isVerified: (req.user as any).isVerified,
            profileImage: (req.user as any).profileImage,
            totalPoints: (req.user as any).totalPoints,
            totalVolunteerHours: (req.user as any).totalVolunteerHours,
            createdAt: (req.user as any).createdAt,
          },
        },
      };
      res.status(HTTP_STATUS.OK).json(response);
      return;
    } catch (error) {
      next(error);
      return;
    }
  };

  // Check authentication status
  checkAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const response: ApiResponse = {
        message: 'Authentication valid',
        data: {
          authenticated: !!req.user,
          user: (req.user as any) ? {
            id: (req.user as any).id,
            email: (req.user as any).email,
            firstName: (req.user as any).firstName,
            lastName: (req.user as any).lastName,
            role: (req.user as any).role,
            isVerified: (req.user as any).isVerified,
          } : null,
        },
      };
      res.status(HTTP_STATUS.OK).json(response);
      return;
    } catch (error) {
      next(error);
      return;
    }
  };
}

// Fix all ApiError usages to only use two arguments: statusCode and message
// Remove 'success' property from all ApiResponse objects
// Example:
// throw new ApiError(400, 'Validation failed');
// const response: ApiResponse = { message: RESPONSE_MESSAGES.SUCCESS.REGISTER, data: { ... } };