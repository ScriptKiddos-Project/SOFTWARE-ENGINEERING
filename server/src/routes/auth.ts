import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from '../controller/authController';
import { authMiddleware, optionalAuth } from '@/middleware/auth';
import { validateSchema } from '@/middleware/validation';
import { RATE_LIMIT_CONFIG, AUTH_RATE_LIMIT } from '@/utils/constants';

const router = Router();
const authController = new AuthController();



const authRateLimit = rateLimit({
  windowMs: AUTH_RATE_LIMIT.WINDOW_MS,
  max: AUTH_RATE_LIMIT.MAX_REQUESTS,
  message: {
    success: false,
    message: AUTH_RATE_LIMIT.MESSAGE,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const emailRateLimit = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.WINDOW_MS,
  max: RATE_LIMIT_CONFIG.MAX_REQUESTS,
  message: {
    success: false,
    message: RATE_LIMIT_CONFIG.MESSAGE,
  },
  standardHeaders: true,
  legacyHeaders: false,
});


// Public routes (no authentication required)

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @body    { email, password, firstName, lastName, studentId?, phone?, department?, yearOfStudy? }
 */
router.post('/register', authRateLimit, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 * @body    { email, password, rememberMe? }
 */
router.post('/login', authRateLimit, authController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public (requires refresh token in cookie)
 */
router.post('/refresh', authController.refreshToken);

/**
 * @route   GET /api/auth/verify-email
 * @desc    Verify user email address
 * @access  Public
 * @query   { token: string }
 */
router.get('/verify-email', authController.verifyEmail);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 * @body    { email }
 */
router.post('/forgot-password', emailRateLimit, authController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using reset token
 * @access  Public
 * @body    { token, password, confirmPassword }
 */
router.post('/reset-password', authController.resetPassword);

/**
 * @route   GET /api/auth/check
 * @desc    Check authentication status
 * @access  Public (optional auth)
 */
router.get('/check', optionalAuth, authController.checkAuth);

// Protected routes (authentication required)

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (invalidate refresh token)
 * @access  Protected
 */
router.post('/logout', authMiddleware, authController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Protected
 */
router.get('/me', authMiddleware, authController.me);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification
 * @access  Protected
 */
router.post('/resend-verification', authMiddleware, emailRateLimit, authController.resendVerification);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password for authenticated user
 * @access  Protected
 * @body    { currentPassword, newPassword, confirmPassword }
 */
router.post('/change-password', authMiddleware, authController.changePassword);

export default router;