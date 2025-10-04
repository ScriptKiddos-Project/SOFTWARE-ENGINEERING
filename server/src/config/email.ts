import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';
import { EMAIL_CONFIG } from '../utils/constants';

// Email configuration interface
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Email template interface
interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

// Email data interface
interface EmailData {
  to: string | string[];
  subject: string;
  template?: string;
  html?: string;
  text?: string;
  data?: Record<string, any>;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer;
    contentType?: string;
  }>;
}

class EmailService {
  private transporter!: nodemailer.Transporter;
  private isConfigured: boolean = false;

  constructor() {
    this.setupTransporter();
  }

  private setupTransporter(): void {
    try {
      const emailConfig: EmailConfig = {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_PORT === '465', // Use TLS if port is 587, SSL if 465
        auth: {
          user: process.env.EMAIL_USER || '',
          pass: process.env.EMAIL_PASS || '',
        },
      };

      // Validate required email configuration
      if (!emailConfig.host || !emailConfig.auth.user || !emailConfig.auth.pass) {
        logger.warn('Email configuration incomplete. Email service disabled.');
        return;
      }

      this.transporter = nodemailer.createTransport({
        ...emailConfig,
        // Additional Gmail-specific configuration
        service: emailConfig.host === 'smtp.gmail.com' ? 'gmail' : undefined,
        tls: {
          rejectUnauthorized: process.env.NODE_ENV === 'production',
        },
        // Connection timeout
        connectionTimeout: 60000, // 1 minute
        greetingTimeout: 30000, // 30 seconds
        socketTimeout: 60000, // 1 minute
      });

      this.isConfigured = true;
      logger.info('Email service configured successfully');
    } catch (error) {
      logger.error('Failed to configure email service:', error);
      this.isConfigured = false;
    }
  }

  // Verify email configuration
  async verifyConnection(): Promise<boolean> {
    if (!this.isConfigured) {
      return false;
    }

    try {
      await this.transporter.verify();
      logger.info('Email connection verified successfully');
      return true;
    } catch (error) {
      logger.error('Email connection verification failed:', error);
      return false;
    }
  }

  // Send email
  async sendEmail(emailData: EmailData): Promise<boolean> {
    if (!this.isConfigured) {
      logger.warn('Email service not configured. Cannot send email.');
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || `"ClubHub" <${process.env.EMAIL_USER}>`,
        to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        attachments: emailData.attachments,
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${emailData.to}. Message ID: ${result.messageId}`);
      return true;
    } catch (error) {
      logger.error('Failed to send email:', error);
      return false;
    }
  }

  // Send email using template
  async sendTemplateEmail(to: string | string[], templateName: string, data: Record<string, any>): Promise<boolean> {
    const template = this.getEmailTemplate(templateName, data);
    if (!template) {
      logger.error(`Email template '${templateName}' not found`);
      return false;
    }

    return await this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Get email template
  private getEmailTemplate(templateName: string, data: Record<string, any>): EmailTemplate | null {
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const supportEmail = 'support@clubhub.com';
    
    switch (templateName) {
      case EMAIL_CONFIG.TEMPLATES.WELCOME:
        return {
          subject: 'Welcome to ClubHub!',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Welcome to ClubHub</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
                .footer { background: #f8fafc; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none; font-size: 14px; color: #6b7280; }
                .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                .highlight { color: #3B82F6; font-weight: bold; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Welcome to ClubHub!</h1>
                <p>Your gateway to campus life awaits</p>
              </div>
              <div class="content">
                <h2>Hi ${data.firstName}!</h2>
                <p>Welcome to ClubHub, your one-stop platform for college club and event management. We're excited to have you join our community!</p>
                
                <p>With ClubHub, you can:</p>
                <ul>
                  <li><strong>Discover Events:</strong> Find workshops, seminars, competitions, and more</li>
                  <li><strong>Join Clubs:</strong> Connect with like-minded students</li>
                  <li><strong>Earn Points:</strong> Get AICTE points for your participation</li>
                  <li><strong>Track Progress:</strong> Monitor your volunteer hours and achievements</li>
                </ul>

                <p>Ready to get started? ${data.isVerified ? 'Your account is ready to use!' : 'Please verify your email to get started:'}</p>
                
                ${!data.isVerified ? `<a href="${baseUrl}/verify-email?token=${data.verificationToken}" class="button">Verify Email</a>` : ''}
                
                <p>Need help? Check out our <a href="${baseUrl}/help">Help Center</a> or contact us at <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
              </div>
              <div class="footer">
                <p>&copy; 2024 ClubHub. All rights reserved.</p>
                <p>This email was sent to ${Array.isArray(data.email) ? data.email[0] : data.email}</p>
              </div>
            </body>
            </html>
          `,
          text: `Welcome to ClubHub!\n\nHi ${data.firstName}!\n\nWelcome to ClubHub, your one-stop platform for college club and event management. We're excited to have you join our community!\n\nWith ClubHub, you can discover events, join clubs, earn AICTE points, and track your progress.\n\n${!data.isVerified ? `Please verify your email: ${baseUrl}/verify-email?token=${data.verificationToken}\n\n` : ''}Need help? Contact us at ${supportEmail}.\n\nBest regards,\nThe ClubHub Team`
        };

      case EMAIL_CONFIG.TEMPLATES.EMAIL_VERIFICATION:
        return {
          subject: 'Verify Your ClubHub Email Address',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Verify Your Email</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #3B82F6; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
                .footer { background: #f8fafc; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none; font-size: 14px; color: #6b7280; }
                .button { display: inline-block; background: #10B981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
                .warning { background: #fef3cd; border: 1px solid #fde68a; padding: 15px; border-radius: 6px; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>📧 Verify Your Email</h1>
              </div>
              <div class="content">
                <h2>Hello ${data.firstName}!</h2>
                <p>Thanks for signing up for ClubHub! To complete your registration and start exploring campus events and clubs, please verify your email address.</p>
                
                <div style="text-align: center;">
                  <a href="${baseUrl}/verify-email?token=${data.verificationToken}" class="button">Verify Email Address</a>
                </div>
                
                <p>Or copy and paste this link into your browser:</p>
                <p style="background: #f3f4f6; padding: 10px; border-radius: 4px; word-break: break-all; font-family: monospace; font-size: 14px;">
                  ${baseUrl}/verify-email?token=${data.verificationToken}
                </p>
                
                <div class="warning">
                  <p><strong>⚠️ Security Notice:</strong> This link will expire in 24 hours. If you didn't create an account with ClubHub, please ignore this email.</p>
                </div>
                
                <p>After verification, you'll be able to:</p>
                <ul>
                  <li>Register for events and earn AICTE points</li>
                  <li>Join clubs and connect with students</li>
                  <li>Access your personalized dashboard</li>
                  <li>Receive important notifications</li>
                </ul>
              </div>
              <div class="footer">
                <p>Need help? Contact us at <a href="mailto:${supportEmail}">${supportEmail}</a></p>
                <p>&copy; 2024 ClubHub. All rights reserved.</p>
              </div>
            </body>
            </html>
          `,
          text: `Verify Your ClubHub Email Address\n\nHello ${data.firstName}!\n\nThanks for signing up for ClubHub! Please verify your email address by clicking this link:\n\n${baseUrl}/verify-email?token=${data.verificationToken}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account with ClubHub, please ignore this email.\n\nBest regards,\nThe ClubHub Team`
        };

      case EMAIL_CONFIG.TEMPLATES.PASSWORD_RESET:
        return {
          subject: 'Reset Your ClubHub Password',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Reset Your Password</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #EF4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
                .footer { background: #f8fafc; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none; font-size: 14px; color: #6b7280; }
                .button { display: inline-block; background: #EF4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
                .warning { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 20px 0; }
                .security-tips { background: #f0f9ff; border: 1px solid #bae6fd; padding: 15px; border-radius: 6px; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>🔒 Password Reset</h1>
              </div>
              <div class="content">
                <h2>Hello ${data.firstName}!</h2>
                <p>We received a request to reset your ClubHub account password. If you made this request, click the button below to set a new password:</p>
                
                <div style="text-align: center;">
                  <a href="${baseUrl}/reset-password?token=${data.resetToken}" class="button">Reset Password</a>
                </div>
                
                <p>Or copy and paste this link into your browser:</p>
                <p style="background: #f3f4f6; padding: 10px; border-radius: 4px; word-break: break-all; font-family: monospace; font-size: 14px;">
                  ${baseUrl}/reset-password?token=${data.resetToken}
                </p>
                
                <div class="warning">
                  <p><strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons. If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
                </div>
                
                <div class="security-tips">
                  <p><strong>💡 Security Tips:</strong></p>
                  <ul>
                    <li>Use a strong password with at least 8 characters</li>
                    <li>Include uppercase, lowercase, numbers, and symbols</li>
                    <li>Don't reuse passwords from other accounts</li>
                    <li>Consider using a password manager</li>
                  </ul>
                </div>
                
                <p>If you continue to have problems, please contact our support team at <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
              </div>
              <div class="footer">
                <p>This password reset was requested from IP: ${data.ipAddress || 'Unknown'}</p>
                <p>&copy; 2024 ClubHub. All rights reserved.</p>
              </div>
            </body>
            </html>
          `,
          text: `Reset Your ClubHub Password\n\nHello ${data.firstName}!\n\nWe received a request to reset your ClubHub account password. If you made this request, use this link to set a new password:\n\n${baseUrl}/reset-password?token=${data.resetToken}\n\nThis link will expire in 1 hour for security reasons.\n\nIf you didn't request a password reset, please ignore this email.\n\nBest regards,\nThe ClubHub Team`
        };

      case EMAIL_CONFIG.TEMPLATES.EVENT_REGISTRATION:
        return {
          subject: `Registration Confirmed: ${data.eventTitle}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Event Registration Confirmed</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #10B981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
                .footer { background: #f8fafc; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none; font-size: 14px; color: #6b7280; }
                .event-card { background: #f8fafc; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
                .points { background: #10B981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: bold; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>✅ Registration Confirmed!</h1>
              </div>
              <div class="content">
                <h2>Hello ${data.firstName}!</h2>
                <p>Great news! Your registration for the following event has been confirmed:</p>
                
                <div class="event-card">
                  <h3>${data.eventTitle}</h3>
                  <p><strong>📅 Date:</strong> ${new Date(data.eventDate).toLocaleDateString()}</p>
                  <p><strong>🕒 Time:</strong> ${new Date(data.eventDate).toLocaleTimeString()}</p>
                  <p><strong>📍 Location:</strong> ${data.eventLocation || 'TBA'}</p>
                  <p><strong>🏛️ Club:</strong> ${data.clubName}</p>
                  ${data.pointsReward ? `<p><strong>🏆 Points:</strong> <span class="points">${data.pointsReward} AICTE Points</span></p>` : ''}
                  ${data.volunteerHours ? `<p><strong>⏰ Volunteer Hours:</strong> ${data.volunteerHours} hours</p>` : ''}
                </div>
                
                <p><strong>What's next?</strong></p>
                <ul>
                  <li>Mark your calendar for the event date</li>
                  <li>Arrive on time to ensure attendance is recorded</li>
                  <li>Bring any required materials mentioned in the event description</li>
                  <li>Points and volunteer hours will be awarded after attendance confirmation</li>
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${baseUrl}/events/${data.eventId}" class="button">View Event Details</a>
                  <a href="${baseUrl}/profile/events" class="button">My Registrations</a>
                </div>
                
                <p><strong>Need to cancel?</strong> You can cancel your registration up to 2 hours before the event starts through your dashboard.</p>
                
                <p>We look forward to seeing you at the event!</p>
              </div>
              <div class="footer">
                <p>Event organized by ${data.clubName}</p>
                <p>&copy; 2024 ClubHub. All rights reserved.</p>
              </div>
            </body>
            </html>
          `,
          text: `Registration Confirmed: ${data.eventTitle}\n\nHello ${data.firstName}!\n\nYour registration has been confirmed for:\n\n${data.eventTitle}\nDate: ${new Date(data.eventDate).toLocaleDateString()}\nTime: ${new Date(data.eventDate).toLocaleTimeString()}\nLocation: ${data.eventLocation || 'TBA'}\nClub: ${data.clubName}\n\n${data.pointsReward ? `Points: ${data.pointsReward} AICTE Points\n` : ''}${data.volunteerHours ? `Volunteer Hours: ${data.volunteerHours} hours\n` : ''}\nView details: ${baseUrl}/events/${data.eventId}\n\nBest regards,\nThe ClubHub Team`
        };

      case EMAIL_CONFIG.TEMPLATES.EVENT_REMINDER:
        return {
          subject: `Reminder: ${data.eventTitle} is tomorrow!`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Event Reminder</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #F59E0B; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
                .footer { background: #f8fafc; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none; font-size: 14px; color: #6b7280; }
                .event-card { background: #fffbeb; border: 1px solid #fbbf24; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .button { display: inline-block; background: #F59E0B; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
                .countdown { text-align: center; font-size: 18px; font-weight: bold; color: #F59E0B; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>⏰ Event Reminder</h1>
              </div>
              <div class="content">
                <h2>Hello ${data.firstName}!</h2>
                <p>This is a friendly reminder that you're registered for an upcoming event:</p>
                
                <div class="event-card">
                  <h3>${data.eventTitle}</h3>
                  <div class="countdown">📅 ${data.timeUntilEvent}</div>
                  <p><strong>🕒 Time:</strong> ${new Date(data.eventDate).toLocaleTimeString()}</p>
                  <p><strong>📍 Location:</strong> ${data.eventLocation || 'Check event details'}</p>
                  <p><strong>🏛️ Club:</strong> ${data.clubName}</p>
                </div>
                
                <p><strong>📋 Before you attend:</strong></p>
                <ul>
                  <li>Check the exact location and room number</li>
                  <li>Arrive 10-15 minutes early</li>
                  <li>Bring any materials mentioned in the event requirements</li>
                  <li>Ensure your ClubHub profile is updated for attendance tracking</li>
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${baseUrl}/events/${data.eventId}" class="button">View Event Details</a>
                  <a href="${baseUrl}/events/${data.eventId}/cancel" class="button" style="background: #EF4444;">Cancel Registration</a>
                </div>
                
                <p>Looking forward to seeing you there!</p>
              </div>
              <div class="footer">
                <p>Event organized by ${data.clubName}</p>
                <p>&copy; 2024 ClubHub. All rights reserved.</p>
              </div>
            </body>
            </html>
          `,
          text: `Event Reminder: ${data.eventTitle}\n\nHello ${data.firstName}!\n\nThis is a reminder that you're registered for:\n\n${data.eventTitle}\nTime until event: ${data.timeUntilEvent}\nTime: ${new Date(data.eventDate).toLocaleTimeString()}\nLocation: ${data.eventLocation || 'Check event details'}\nClub: ${data.clubName}\n\nPlease arrive 10-15 minutes early and bring any required materials.\n\nView details: ${baseUrl}/events/${data.eventId}\n\nSee you there!\nThe ClubHub Team`
        };

      case EMAIL_CONFIG.TEMPLATES.ATTENDANCE_CONFIRMATION:
        return {
          subject: `Attendance Confirmed: ${data.eventTitle}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Attendance Confirmed</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
                .footer { background: #f8fafc; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none; font-size: 14px; color: #6b7280; }
                .achievement { background: #ecfdf5; border: 1px solid #a7f3d0; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
                .points { background: #10B981; color: white; padding: 8px 16px; border-radius: 25px; font-size: 18px; font-weight: bold; margin: 10px; display: inline-block; }
                .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>🎉 Attendance Confirmed!</h1>
                <p>Great job on attending the event!</p>
              </div>
              <div class="content">
                <h2>Congratulations ${data.firstName}!</h2>
                <p>Your attendance has been confirmed for <strong>${data.eventTitle}</strong>. Thank you for being an active member of the ClubHub community!</p>
                
                <div class="achievement">
                  <h3>🏆 You've Earned:</h3>
                  ${data.pointsAwarded ? `<div class="points">+${data.pointsAwarded} AICTE Points</div>` : ''}
                  ${data.volunteerHoursAwarded ? `<div class="points">+${data.volunteerHoursAwarded} Volunteer Hours</div>` : ''}
                  
                  <p><strong>Your Total Progress:</strong></p>
                  <p>📊 Total Points: ${data.totalPoints || 0}</p>
                  <p>⏱️ Total Volunteer Hours: ${data.totalVolunteerHours || 0}</p>
                </div>
                
                ${data.certificateAvailable ? `
                <p><strong>🎓 Certificate Available!</strong><br>
                Your participation certificate is now available for download.</p>
                ` : ''}
                
                <p><strong>What's next?</strong></p>
                <ul>
                  <li>Check out more events from ${data.clubName}</li>
                  <li>Share your experience with friends</li>
                  <li>Leave feedback to help improve future events</li>
                  <li>Track your progress on your dashboard</li>
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${baseUrl}/profile" class="button">View Dashboard</a>
                  <a href="${baseUrl}/events" class="button">Find More Events</a>
                  ${data.feedbackUrl ? `<a href="${data.feedbackUrl}" class="button" style="background: #8B5CF6;">Leave Feedback</a>` : ''}
                </div>
                
                <p>Keep up the great work in building your campus involvement!</p>
              </div>
              <div class="footer">
                <p>Event organized by ${data.clubName}</p>
                <p>Points and hours updated on ${new Date().toLocaleDateString()}</p>
                <p>&copy; 2024 ClubHub. All rights reserved.</p>
              </div>
            </body>
            </html>
          `,
          text: `Attendance Confirmed: ${data.eventTitle}\n\nCongratulations ${data.firstName}!\n\nYour attendance has been confirmed for ${data.eventTitle}.\n\nYou've earned:\n${data.pointsAwarded ? `+${data.pointsAwarded} AICTE Points\n` : ''}${data.volunteerHoursAwarded ? `+${data.volunteerHoursAwarded} Volunteer Hours\n` : ''}\nYour totals:\nTotal Points: ${data.totalPoints || 0}\nTotal Volunteer Hours: ${data.totalVolunteerHours || 0}\n\nView your dashboard: ${baseUrl}/profile\n\nThanks for being an active member!\nThe ClubHub Team`
        };

      default:
        logger.error(`Unknown email template: ${templateName}`);
        return null;
    }
  }

  // Send bulk emails
  async sendBulkEmail(
    recipients: Array<{ email: string; data: Record<string, any> }>,
    templateName: string
  ): Promise<{ successful: number; failed: number; errors: string[] }> {
    const results = { successful: 0, failed: 0, errors: [] as string[] };

    for (const recipient of recipients) {
      try {
        const success = await this.sendTemplateEmail(recipient.email, templateName, recipient.data);
        if (success) {
          results.successful++;
        } else {
          results.failed++;
          results.errors.push(`Failed to send to ${recipient.email}`);
        }
        
        // Add delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        results.failed++;
        results.errors.push(`Error sending to ${recipient.email}: ${error}`);
      }
    }

    logger.info(`Bulk email completed: ${results.successful} successful, ${results.failed} failed`);
    return results;
  }
}

// Create and export singleton instance
export const emailService = new EmailService();
export default emailService;