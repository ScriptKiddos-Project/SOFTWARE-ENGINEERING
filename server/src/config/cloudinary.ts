import { v2 as cloudinary } from 'cloudinary';
import { UploadApiOptions, UploadApiResponse } from 'cloudinary';
import { AppError } from '@/middleware/errorHandler';
import { HTTP_STATUS, ERROR_MESSAGES, UPLOAD_CONFIG } from '@/utils/constants';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Upload configuration interfaces
interface UploadOptions {
  folder?: string;
  public_id?: string;
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
  format?: string;
  transformation?: any[];
  tags?: string[];
  overwrite?: boolean;
  invalidate?: boolean;
}

interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  resource_type: string;
  bytes: number;
  width?: number;
  height?: number;
  folder: string;
  original_filename: string;
  created_at: string;
}

// Upload functions
class CloudinaryService {
  // Generic upload function
  async uploadFile(
    file: string | Buffer,
    options: UploadOptions = {}
  ): Promise<CloudinaryUploadResult> {
    try {
      const defaultOptions: UploadApiOptions = {
        resource_type: 'auto',
        folder: options.folder || 'clubhub',
        use_filename: true,
        unique_filename: true,
        overwrite: options.overwrite || false,
        invalidate: options.invalidate || true,
        ...options
      };

      const result = await cloudinary.uploader.upload(file as string, defaultOptions);
      
      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        url: result.url,
        format: result.format,
        resource_type: result.resource_type,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        folder: result.folder,
        original_filename: result.original_filename,
        created_at: result.created_at,
      };
    } catch (error: any) {
      console.error('Cloudinary upload error:', error);
      throw new AppError(ERROR_MESSAGES.FILE_UPLOAD_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  // Upload profile image
  async uploadProfileImage(file: Buffer, userId: string): Promise<CloudinaryUploadResult> {
    return this.uploadFile(`data:image/jpeg;base64,${file.toString('base64')}`, {
      folder: 'clubhub/profiles',
      public_id: `profile_${userId}`,
      transformation: [
        { width: UPLOAD_CONFIG.PROFILE_IMAGE_SIZE.width, height: UPLOAD_CONFIG.PROFILE_IMAGE_SIZE.height, crop: 'fill' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ],
      tags: ['profile', 'user'],
      overwrite: true
    });
  }

  // Upload club logo
  async uploadClubLogo(file: Buffer, clubId: string): Promise<CloudinaryUploadResult> {
    return this.uploadFile(`data:image/jpeg;base64,${file.toString('base64')}`, {
      folder: 'clubhub/clubs',
      public_id: `club_logo_${clubId}`,
      transformation: [
        { width: UPLOAD_CONFIG.CLUB_LOGO_SIZE.width, height: UPLOAD_CONFIG.CLUB_LOGO_SIZE.height, crop: 'fill' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
        { background: 'white', crop: 'pad' } // Add white background if needed
      ],
      tags: ['club', 'logo'],
      overwrite: true
    });
  }

  // Upload event image
  async uploadEventImage(file: Buffer, eventId: string): Promise<CloudinaryUploadResult> {
    return this.uploadFile(`data:image/jpeg;base64,${file.toString('base64')}`, {
      folder: 'clubhub/events',
      public_id: `event_${eventId}`,
      transformation: [
        { width: UPLOAD_CONFIG.EVENT_IMAGE_SIZE.width, height: UPLOAD_CONFIG.EVENT_IMAGE_SIZE.height, crop: 'fill' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ],
      tags: ['event', 'image'],
      overwrite: true
    });
  }

  // Upload multiple event images
  async uploadEventImages(files: Buffer[], eventId: string): Promise<CloudinaryUploadResult[]> {
    const uploadPromises = files.map((file, index) =>
      this.uploadFile(`data:image/jpeg;base64,${file.toString('base64')}`, {
        folder: 'clubhub/events',
        public_id: `event_${eventId}_${index + 1}`,
        transformation: [
          { width: UPLOAD_CONFIG.EVENT_IMAGE_SIZE.width, height: UPLOAD_CONFIG.EVENT_IMAGE_SIZE.height, crop: 'fill' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ],
        tags: ['event', 'gallery'],
        overwrite: true
      })
    );

    return Promise.all(uploadPromises);
  }

  // Upload document
  async uploadDocument(file: Buffer, filename: string, folder: string = 'documents'): Promise<CloudinaryUploadResult> {
    return this.uploadFile(`data:application/pdf;base64,${file.toString('base64')}`, {
      folder: `clubhub/${folder}`,
      public_id: filename.split('.')[0],
      resource_type: 'raw',
      tags: ['document'],
      overwrite: false
    });
  }

  // Delete file from Cloudinary
  async deleteFile(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error: any) {
      console.error('Cloudinary delete error:', error);
      throw new AppError('Failed to delete file', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  // Delete multiple files
  async deleteFiles(publicIds: string[]): Promise<void> {
    try {
      await cloudinary.api.delete_resources(publicIds);
    } catch (error: any) {
      console.error('Cloudinary bulk delete error:', error);
      throw new AppError('Failed to delete files', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  // Generate transformation URL
  generateTransformationUrl(publicId: string, transformation: any[]): string {
    return cloudinary.url(publicId, { transformation });
  }

  // Get optimized image URL
  getOptimizedImageUrl(publicId: string, width?: number, height?: number): string {
    const transformation = [];
    
    if (width || height) {
      transformation.push({
        width,
        height,
        crop: 'fill'
      });
    }
    
    transformation.push(
      { quality: 'auto' },
      { fetch_format: 'auto' }
    );

    return cloudinary.url(publicId, { transformation });
  }

  // Get responsive image URLs for different screen sizes
  getResponsiveImageUrls(publicId: string): Record<string, string> {
    const sizes = {
      thumbnail: 150,
      small: 300,
      medium: 600,
      large: 1200,
      xlarge: 2000
    };

    const urls: Record<string, string> = {};
    
    Object.entries(sizes).forEach(([size, width]) => {
      urls[size] = this.getOptimizedImageUrl(publicId, width);
    });

    return urls;
  }

  // Generate signed upload URL for client-side uploads
  async generateSignedUploadUrl(options: {
    folder?: string;
    tags?: string[];
    transformation?: any[];
    resource_type?: string;
  } = {}): Promise<{ url: string; signature: string; timestamp: number; api_key: string }> {
    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      
      const params = {
        timestamp,
        folder: options.folder || 'clubhub',
        resource_type: options.resource_type || 'auto',
        ...options
      };

      const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!);
      
      return {
        url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${params.resource_type}/upload`,
        signature,
        timestamp,
        api_key: process.env.CLOUDINARY_API_KEY!
      };
    } catch (error: any) {
      console.error('Cloudinary signature generation error:', error);
      throw new AppError('Failed to generate upload signature', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  // Search for resources
  async searchResources(expression: string, options: {
    resource_type?: string;
    max_results?: number;
    next_cursor?: string;
  } = {}): Promise<any> {
    try {
      return await cloudinary.search
        .expression(expression)
        .max_results(options.max_results || 30)
        .next_cursor(options.next_cursor)
        .execute();
    } catch (error: any) {
      console.error('Cloudinary search error:', error);
      throw new AppError('Failed to search resources', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  // Get resource details
  async getResourceDetails(publicId: string): Promise<any> {
    try {
      return await cloudinary.api.resource(publicId);
    } catch (error: any) {
      console.error('Cloudinary resource details error:', error);
      throw new AppError('Failed to get resource details', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  // Get usage statistics
  async getUsageStats(): Promise<any> {
    try {
      return await cloudinary.api.usage();
    } catch (error: any) {
      console.error('Cloudinary usage stats error:', error);
      throw new AppError('Failed to get usage stats', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  // Create upload presets for different use cases
  async createUploadPreset(name: string, options: any): Promise<any> {
    try {
      return await cloudinary.api.create_upload_preset({
        name,
        ...options
      });
    } catch (error: any) {
      console.error('Cloudinary create preset error:', error);
      throw new AppError('Failed to create upload preset', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  // Validate file before upload
  validateFile(file: Express.Multer.File): boolean {
    // Check file size
    if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
      throw new AppError(
        `File size too large. Maximum size is ${UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Check file type
    const allowedTypes: string[] = [
      ...UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES,
      ...UPLOAD_CONFIG.ALLOWED_DOCUMENT_TYPES
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new AppError(
        `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    return true;
  }

  // Clean up old files (for maintenance)
  async cleanupOldFiles(olderThanDays: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      
      const expression = `created_at<${cutoffDate.toISOString()} AND tags=temp`;
      const resources = await this.searchResources(expression);
      
      if (resources.resources.length > 0) {
        const publicIds = resources.resources.map((resource: any) => resource.public_id);
        await this.deleteFiles(publicIds);
        console.log(`Cleaned up ${publicIds.length} old files`);
      }
    } catch (error: any) {
      console.error('Cloudinary cleanup error:', error);
    }
  }
}

// Create and export service instance
export const cloudinaryService = new CloudinaryService();

// Export Cloudinary instance for direct access if needed
export { cloudinary };

// Helper functions for common transformations
export const transformations = {
  profileImage: [
    { width: UPLOAD_CONFIG.PROFILE_IMAGE_SIZE.width, height: UPLOAD_CONFIG.PROFILE_IMAGE_SIZE.height, crop: 'fill' },
    { quality: 'auto', fetch_format: 'auto' },
    { radius: 'max' } // Make it circular
  ],
  
  clubLogo: [
    { width: UPLOAD_CONFIG.CLUB_LOGO_SIZE.width, height: UPLOAD_CONFIG.CLUB_LOGO_SIZE.height, crop: 'fit' },
    { quality: 'auto', fetch_format: 'auto' },
    { background: 'white', crop: 'pad' }
  ],
  
  eventImage: [
    { width: UPLOAD_CONFIG.EVENT_IMAGE_SIZE.width, height: UPLOAD_CONFIG.EVENT_IMAGE_SIZE.height, crop: 'fill' },
    { quality: 'auto', fetch_format: 'auto' }
  ],
  
  thumbnail: [
    { width: 150, height: 150, crop: 'fill' },
    { quality: 'auto', fetch_format: 'auto' }
  ]
};