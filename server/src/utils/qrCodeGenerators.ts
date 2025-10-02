import QRCode from 'qrcode';
import * as crypto from 'crypto';
import { QR_CODE_CONFIG, HTTP_STATUS } from '@/utils/constants';
import { AppError } from '@/middleware/errorHandler';

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
  type?: 'image/png' | 'image/jpeg' | 'image/webp';
  quality?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  validityHours?: number; // now respected in validation
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
    
    const signature = crypto
      .createHmac('sha256', this.secret)
      .update(payload)
      .digest('hex');

    return { eventId, timestamp, signature, type, metadata: metadata || {} };
  }

  // Validate QR code data
  private validateQRData(
    qrData: QRCodeData, 
    validityHours: number = QR_CODE_CONFIG.VALIDITY_HOURS
  ): QRCodeValidationResult {
    try {
      const { eventId, timestamp, signature, type, metadata } = qrData;

      const payload = `${eventId}:${timestamp}:${type}`;
      const expectedSignature = crypto
        .createHmac('sha256', this.secret)
        .update(payload)
        .digest('hex');

      if (signature !== expectedSignature) {
        return { isValid: false, error: 'Invalid signature - QR code may be tampered with' };
      }

      const validityMs = validityHours * 60 * 60 * 1000;
      const isExpired = Date.now() - timestamp > validityMs;

      if (isExpired) {
        return { isValid: false, error: 'QR code has expired' };
      }

      return { isValid: true, eventId, type, timestamp, metadata };
    } catch {
      return { isValid: false, error: 'Invalid QR code format' };
    }
  }

  // --- QR Code Generators ---
  async generateQRCode(eventId: string, options: QRCodeGenerationOptions = {}): Promise<Buffer> {
    try {
      const qrData = this.generateQRData(eventId, 'attendance');
      const buffer = await QRCode.toBuffer(JSON.stringify(qrData), this.buildOptions(options));
      return buffer;
    } catch (error: any) {
      throw new AppError(`Failed to generate QR code: ${error.message}`, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  async generateQRCodeBase64(eventId: string, options: QRCodeGenerationOptions = {}): Promise<string> {
    try {
      const qrData = this.generateQRData(eventId, 'attendance');
      return await QRCode.toDataURL(JSON.stringify(qrData), this.buildOptions(options));
    } catch (error: any) {
      throw new AppError(`Failed to generate QR code: ${error.message}`, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  async generateQRCodeSVG(eventId: string, options: QRCodeGenerationOptions = {}): Promise<string> {
    try {
      const qrData = this.generateQRData(eventId, 'attendance');
      return await QRCode.toString(JSON.stringify(qrData), { type: 'svg', ...this.buildOptions(options) });
    } catch (error: any) {
      throw new AppError(`Failed to generate QR code SVG: ${error.message}`, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  // Multiple QR codes
  async generateQRCodeSet(
    eventId: string,
    types: Array<'attendance' | 'registration' | 'verification'> = ['attendance'],
    options: QRCodeGenerationOptions = {}
  ): Promise<Record<string, string>> {
    const qrCodes: Record<string, string> = {};
    for (const type of types) {
      const qrData = this.generateQRData(eventId, type);
      qrCodes[type] = await QRCode.toDataURL(JSON.stringify(qrData), this.buildOptions(options));
    }
    return qrCodes;
  }

  // Validate scanned QR code
  validateQRCode(qrCodeData: string, validityHours?: number): QRCodeValidationResult {
    try {
      const parsed = JSON.parse(qrCodeData);
      if (!parsed || typeof parsed !== 'object') {
        return { isValid: false, error: 'Invalid QR code data structure' };
      }
      return this.validateQRData(parsed as QRCodeData, validityHours ?? QR_CODE_CONFIG.VALIDITY_HOURS);
    } catch {
      return { isValid: false, error: 'Invalid QR code data format' };
    }
  }

  // Branded QR code (currently just returns base64)
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
    // Future: overlay logo/text with Canvas/Sharp
    return await this.generateQRCodeBase64(eventId, options);
  }

  // --- Internal helper ---
  private buildOptions(options: QRCodeGenerationOptions) {
    return {
      errorCorrectionLevel: options.errorCorrectionLevel || QR_CODE_CONFIG.ERROR_CORRECTION,
      type: options.type || 'image/png',
      quality: options.quality || QR_CODE_CONFIG.QUALITY,
      margin: options.margin || QR_CODE_CONFIG.MARGIN,
      color: {
        dark: options.color?.dark || QR_CODE_CONFIG.COLOR.DARK,
        light: options.color?.light || QR_CODE_CONFIG.COLOR.LIGHT,
      },
      width: options.size || QR_CODE_CONFIG.DEFAULT_SIZE,
    };
  }
}
