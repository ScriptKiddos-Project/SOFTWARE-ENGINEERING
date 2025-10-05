// services/fileService.ts
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

interface UploadOptions {
  folder?: string;
  width?: number;
  height?: number;
  crop?: string;
  gravity?: string;
  quality?: string | number;
  format?: string;
}

interface UploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * Upload image to Cloudinary
 */
export const uploadImage = async (
  file: Express.Multer.File,
  options: UploadOptions = {}
): Promise<UploadResult> => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder || 'uploads',
          transformation: [
            {
              width: options.width,
              height: options.height,
              crop: options.crop || 'limit',
              gravity: options.gravity,
              quality: options.quality || 'auto',
              fetch_format: options.format || 'auto'
            }
          ],
          resource_type: 'image'
        },
        (error, result) => {
          if (error) {
            reject(new Error(`Failed to upload image: ${error.message}`));
          } else if (result) {
            resolve({
              url: result.url,
              secureUrl: result.secure_url,
              publicId: result.public_id,
              format: result.format,
              width: result.width,
              height: result.height,
              bytes: result.bytes
            });
          }
        }
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  } catch (error) {
    throw new Error('Image upload failed');
  }
};

/**
 * Delete image from Cloudinary
 */
export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Failed to delete image:', error);
    throw new Error('Image deletion failed');
  }
};

/**
 * Upload multiple images
 */
export const uploadMultipleImages = async (
  files: Express.Multer.File[],
  options: UploadOptions = {}
): Promise<UploadResult[]> => {
  const uploadPromises = files.map(file => uploadImage(file, options));
  return Promise.all(uploadPromises);
};

/**
 * Get image URL with transformations
 */
export const getTransformedImageUrl = (
  publicId: string,
  options: UploadOptions = {}
): string => {
  return cloudinary.url(publicId, {
    width: options.width,
    height: options.height,
    crop: options.crop || 'limit',
    gravity: options.gravity,
    quality: options.quality || 'auto',
    fetch_format: options.format || 'auto'
  });
};