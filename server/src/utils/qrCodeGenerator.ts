import QRCode from 'qrcode';
import crypto from 'crypto';
import { AppError } from '@/middleware/errorHandler';
import { HTTP_STATUS } from '@/utils/constants';

// QR Code configuration constants
const QR_CODE_CONFIG = {
  DEFAULT_SIZE: 256,
  MARGIN: 4,
  ERROR_CORRECTION: 'M' as const,
  QUALITY: 0.92,
  COLOR: {
    DARK: '#000000',
    LIGHT: '#FFFFFF'
  },
  VALIDITY_HOURS: 24
};

// QR Code data interfaces
interface QRCodeData {
  eventId: string;
  timestamp: number;
  signature: string;
  type: 'attendance' | 'registration' | 'verification';
  metadata?: Record<string, any>;
}

interface QRCodeGenerationOptions {
  size?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  quality?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  validityHours?: number;
}

interface QRCodeValidationResult {
  isValid: boolean;
  eventId?: string;
  type?: string;
  timestamp?: number;
  error?: string;
  metadata?: Record<string, any>;
}

export class QRCodeGenerator {
  private readonly secret: string;

  constructor() {
    this.secret = process.env.QR_CODE_SECRET || process.env.JWT_SECRET || 'default-qr-secret';
  }

  // Generate QR code data with signature
  private generateQRData(
    eventId: string, 
    type: 'attendance' | 'registration' | 'verification' = 'attendance',
    metadata?: Record<string, any>
  ): QRCodeData {
    const timestamp = Date.now();
    const payload = `${eventId}:${timestamp}:${type}`;
    
    // Create HMAC signature for security
    const signature = crypto
      .createHmac('sha256', this.secret)
      .update(payload)
      .digest('hex');

    return {
      eventId,
      timestamp,
      signature,
      type,
      metadata: metadata || {}
    };
  }

  // Validate QR code data
  private validateQRData(qrData: QRCodeData): QRCodeValidationResult {
    try {
      const { eventId, timestamp, signature, type, metadata } = qrData;
      
      // Recreate the payload and signature
      const payload = `${eventId}:${timestamp}:${type}`;
      const expectedSignature = crypto
        .createHmac('sha256', this.secret)
        .update(payload)
        .digest('hex');

      // Verify signature
      if (signature !== expectedSignature) {
        return {
          isValid: false,
          error: 'Invalid signature - QR code may be tampered with'
        };
      }

      // Check if QR code is still valid (within time window)
      const validityMs = QR_CODE_CONFIG.VALIDITY_HOURS * 60 * 60 * 1000;
      const isExpired = (Date.now() - timestamp) > validityMs;

      if (isExpired) {
        return {
          isValid: false,
          error: 'QR code has expired'
        };
      }

      return {
        isValid: true,
        eventId,
        type,
        timestamp,
        metadata
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid QR code format'
      };
    }
  }

  // Generate QR code image buffer
  async generateQRCode(
    eventId: string,
    options: QRCodeGenerationOptions = {}
  ): Promise<Buffer> {
    try {
      const qrData = this.generateQRData(eventId, 'attendance');
      const dataString = JSON.stringify(qrData);

      const qrOptions: QRCode.QRCodeToBufferOptions = {
        errorCorrectionLevel: options.errorCorrectionLevel || QR_CODE_CONFIG.ERROR_CORRECTION,
        margin: options.margin || QR_CODE_CONFIG.MARGIN,
        width: options.size || QR_CODE_CONFIG.DEFAULT_SIZE,
        color: {
          dark: options.color?.dark || QR_CODE_CONFIG.COLOR.DARK,
          light: options.color?.light || QR_CODE_CONFIG.COLOR.LIGHT,
        }
      };

      const buffer = await QRCode.toBuffer(dataString, qrOptions);
      return buffer;
    } catch (error: any) {
      throw new AppError(
        `Failed to generate QR code: ${error.message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Generate QR code as base64 string
  async generateQRCodeBase64(
    eventId: string,
    options: QRCodeGenerationOptions = {}
  ): Promise<string> {
    try {
      const qrData = this.generateQRData(eventId, 'attendance');
      const dataString = JSON.stringify(qrData);

      const qrOptions: QRCode.QRCodeToDataURLOptions = {
        errorCorrectionLevel: options.errorCorrectionLevel || QR_CODE_CONFIG.ERROR_CORRECTION,
        margin: options.margin || QR_CODE_CONFIG.MARGIN,
        width: options.size || QR_CODE_CONFIG.DEFAULT_SIZE,
        color: {
          dark: options.color?.dark || QR_CODE_CONFIG.COLOR.DARK,
          light: options.color?.light || QR_CODE_CONFIG.COLOR.LIGHT,
        }
      };

      const base64String = await QRCode.toDataURL(dataString, qrOptions);
      return base64String;
    } catch (error: any) {
      throw new AppError(
        `Failed to generate QR code: ${error.message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Generate QR code as SVG string
  async generateQRCodeSVG(
    eventId: string,
    options: QRCodeGenerationOptions = {}
  ): Promise<string> {
    try {
      const qrData = this.generateQRData(eventId, 'attendance');
      const dataString = JSON.stringify(qrData);

      const qrOptions: QRCode.QRCodeToStringOptions = {
        type: 'svg',
        errorCorrectionLevel: options.errorCorrectionLevel || QR_CODE_CONFIG.ERROR_CORRECTION,
        margin: options.margin || QR_CODE_CONFIG.MARGIN,
        width: options.size || QR_CODE_CONFIG.DEFAULT_SIZE,
        color: {
          dark: options.color?.dark || QR_CODE_CONFIG.COLOR.DARK,
          light: options.color?.light || QR_CODE_CONFIG.COLOR.LIGHT,
        }
      };

      const svgString = await QRCode.toString(dataString, qrOptions);
      return svgString;
    } catch (error: any) {
      throw new AppError(
        `Failed to generate QR code SVG: ${error.message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Generate multiple QR codes for different purposes
  async generateQRCodeSet(
    eventId: string,
    types: Array<'attendance' | 'registration' | 'verification'> = ['attendance'],
    options: QRCodeGenerationOptions = {}
  ): Promise<Record<string, string>> {
    const qrCodes: Record<string, string> = {};

    for (const type of types) {
      const qrData = this.generateQRData(eventId, type);
      const dataString = JSON.stringify(qrData);

      const qrOptions: QRCode.QRCodeToDataURLOptions = {
        errorCorrectionLevel: options.errorCorrectionLevel || QR_CODE_CONFIG.ERROR_CORRECTION,
        margin: options.margin || QR_CODE_CONFIG.MARGIN,
        width: options.size || QR_CODE_CONFIG.DEFAULT_SIZE,
        color: {
          dark: options.color?.dark || QR_CODE_CONFIG.COLOR.DARK,
          light: options.color?.light || QR_CODE_CONFIG.COLOR.LIGHT,
        }
      };

      const base64String = await QRCode.toDataURL(dataString, qrOptions);
      qrCodes[type] = base64String;
    }

    return qrCodes;
  }

  // Validate scanned QR code
  validateQRCode(qrCodeData: string): QRCodeValidationResult {
    try {
      const parsedData = JSON.parse(qrCodeData);
      return this.validateQRData(parsedData);
    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid QR code data format'
      };
    }
  }

  // Generate QR code with custom branding
  async generateBrandedQRCode(
    eventId: string,
    brandingOptions: {
      logo?: string;
      title?: string;
      subtitle?: string;
      primaryColor?: string;
      backgroundColor?: string;
    } = {},
    options: QRCodeGenerationOptions = {}
  ): Promise<string> {
    try {
      const qrBuffer = await this.generateQRCode(eventId, options);
      return `data:image/png;base64,${qrBuffer.toString('base64')}`;
    } catch (error: any) {
      throw new AppError(
        `Failed to generate branded QR code: ${error.message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Generate time-limited QR code
  async generateTimeLimitedQRCode(
    eventId: string,
    validityMinutes: number = 120,
    options: QRCodeGenerationOptions = {}
  ): Promise<{ qrCode: string; validUntil: Date }> {
    try {
      const qrCode = await this.generateQRCodeBase64(eventId, options);
      const validUntil = new Date(Date.now() + validityMinutes * 60 * 1000);
      
      return { qrCode, validUntil };
    } catch (error: any) {
      throw new AppError(
        `Failed to generate time-limited QR code: ${error.message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Extract event ID from QR code data
  extractEventId(qrCodeData: string): string | null {
    try {
      const parsedData = JSON.parse(qrCodeData);
      return parsedData.eventId || null;
    } catch {
      return null;
    }
  }

  // Check if QR code is valid for attendance
  isValidForAttendance(qrCodeData: string, eventId: string): boolean {
    const validation = this.validateQRCode(qrCodeData);
    return validation.isValid && validation.eventId === eventId;
  }
}

// Create and export singleton instance
export const qrCodeGenerator = new QRCodeGenerator();

// Export helper functions
export const generateEventQRCode = (eventId: string, options?: QRCodeGenerationOptions) => 
  qrCodeGenerator.generateQRCodeBase64(eventId, options);

export const validateEventQRCode = (qrCodeData: string) => 
  qrCodeGenerator.validateQRCode(qrCodeData);

export const extractEventIdFromQR = (qrCodeData: string) => 
  qrCodeGenerator.extractEventId(qrCodeData);