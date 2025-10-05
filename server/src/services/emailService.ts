// export class EmailService {
//     async sendVerificationEmail(user: any) { /* TODO: implement */ }
//     async sendPasswordResetEmail(user: any) { /* TODO: implement */ }
//   }

// services/emailService.ts
import nodemailer from 'nodemailer';


export class emailService {
  async sendVerificationEmail(user: { email: string; firstName: string; verificationLink: string }) {
    await sendEmail({
      to: user.email,
      subject: 'Verify your email address',
      template: 'email-verification',
      data: {
        firstName: user.firstName,
        verificationLink: user.verificationLink
      }
    });
  }

  async sendPasswordResetEmail(user: { email: string; firstName: string; resetLink: string }) {
    await sendEmail({
      to: user.email,
      subject: 'Reset your password',
      template: 'password-reset',
      data: {
        firstName: user.firstName,
        resetLink: user.resetLink
      }
    });
  }

  async sendPasswordChangedEmail(user: { email: string; timestamp: string }) {
    await sendEmail({
      to: user.email,
      subject: 'Your password was changed',
      template: 'password-changed',
      data: {
        timestamp: user.timestamp
      }
    });
  }

  async sendAccountDeletedEmail(user: { email: string; timestamp: string }) {
    await sendEmail({
      to: user.email,
      subject: 'Your account has been deleted',
      template: 'account-deleted',
      data: {
        timestamp: user.timestamp
      }
    });
  }

  async sendWelcomeEmail(user: { email: string; firstName: string }) {
    await sendEmail({
      to: user.email,
      subject: 'Welcome to ClubHub!',
      template: 'welcome',
      data: {
        firstName: user.firstName
      }
    });
  }
}


interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Email templates
const emailTemplates = {
  'email-verification': (data: any) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to ClubHub!</h1>
        </div>
        <div class="content">
          <h2>Hi ${data.firstName},</h2>
          <p>Thank you for registering with ClubHub. Please verify your email address to activate your account.</p>
          <p>Click the button below to verify your email:</p>
          <a href="${data.verificationLink}" class="button">Verify Email</a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #4F46E5;">${data.verificationLink}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create this account, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ClubHub. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  'password-reset': (data: any) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .warning { background: #FEF3C7; padding: 15px; border-left: 4px solid #F59E0B; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hi ${data.firstName},</h2>
          <p>We received a request to reset your password for your ClubHub account.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${data.resetLink}" class="button">Reset Password</a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #4F46E5;">${data.resetLink}</p>
          <p>This link will expire in 1 hour.</p>
          <div class="warning">
            <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email and ensure your account is secure.
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ClubHub. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  'password-changed': (data: any) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10B981; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .info { background: #DBEAFE; padding: 15px; border-left: 4px solid #3B82F6; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Changed Successfully</h1>
        </div>
        <div class="content">
          <h2>Password Update Confirmation</h2>
          <p>Your ClubHub account password was successfully changed.</p>
          <div class="info">
            <strong>Changed at:</strong> ${data.timestamp}
          </div>
          <p>If you did not make this change, please contact support immediately.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ClubHub. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  'account-deleted': (data: any) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Account Deleted</h1>
        </div>
        <div class="content">
          <h2>Your Account Has Been Deleted</h2>
          <p>Your ClubHub account was successfully deleted on ${data.timestamp}.</p>
          <p>We're sorry to see you go. If you change your mind, you can create a new account at any time.</p>
          <p>Thank you for being part of our community.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ClubHub. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  'welcome': (data: any) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to ClubHub!</h1>
        </div>
        <div class="content">
          <h2>Hi ${data.firstName},</h2>
          <p>Your email has been verified successfully! Welcome to ClubHub.</p>
          <p>You can now:</p>
          <ul>
            <li>Join clubs and communities</li>
            <li>Register for events</li>
            <li>Earn AICTE points and volunteer hours</li>
            <li>Connect with other students</li>
          </ul>
          <p>Start exploring by visiting your dashboard!</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ClubHub. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
};

// Create transporter
let transporter: nodemailer.Transporter | null = null;

const createTransporter = (): nodemailer.Transporter => {
  if (transporter) return transporter;

  const config: EmailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  };

  transporter = nodemailer.createTransport(config);
  return transporter;
};

/**
 * Send email using configured template
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transport = createTransporter();

    // Get template
    const templateFn = emailTemplates[options.template as keyof typeof emailTemplates];
    if (!templateFn) {
      throw new Error(`Email template '${options.template}' not found`);
    }

    const html = templateFn(options.data);

    // Send email
    await transport.sendMail({
      from: `"ClubHub" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html
    });

    console.log(`Email sent successfully to ${options.to}`);
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Send bulk emails
 */
export const sendBulkEmails = async (recipients: string[], options: Omit<EmailOptions, 'to'>): Promise<void> => {
  const promises = recipients.map(to => 
    sendEmail({ ...options, to }).catch(err => {
      console.error(`Failed to send email to ${to}:`, err);
      return null;
    })
  );

  await Promise.all(promises);
};

/**
 * Verify email configuration
 */
export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    const transport = createTransporter();
    await transport.verify();
    console.log('Email configuration verified successfully');
    return true;
  } catch (error) {
    console.error('Email configuration verification failed:', error);
    return false;
  }
};