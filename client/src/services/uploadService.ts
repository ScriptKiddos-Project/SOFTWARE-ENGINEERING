import api from './api';

interface UploadResponse {
  url: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  size: number;
}

interface UploadOptions {
  folder?: string;
  transformation?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
  };
  onProgress?: (progress: number) => void;
}

class UploadService {
  private maxFileSize = 5 * 1024 * 1024; // 5MB
  private allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  private allowedDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  validateImageFile(file: File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    if (!this.allowedImageTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.' 
      };
    }

    if (file.size > this.maxFileSize) {
      return { 
        valid: false, 
        error: `File size exceeds ${this.maxFileSize / (1024 * 1024)}MB limit` 
      };
    }

    return { valid: true };
  }

  validateDocumentFile(file: File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    if (!this.allowedDocumentTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Invalid file type. Only PDF and Word documents are allowed.' 
      };
    }

    if (file.size > this.maxFileSize * 2) { // 10MB for documents
      return { 
        valid: false, 
        error: `File size exceeds ${(this.maxFileSize * 2) / (1024 * 1024)}MB limit` 
      };
    }

    return { valid: true };
  }

  async uploadImage(file: File, options: UploadOptions = {}): Promise<UploadResponse> {
    const validation = this.validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const formData = new FormData();
    formData.append('file', file);
    
    if (options.folder) {
      formData.append('folder', options.folder);
    }
    
    if (options.transformation) {
      formData.append('transformation', JSON.stringify(options.transformation));
    }

    const response = await api.post<UploadResponse>('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (options.onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          options.onProgress(progress);
        }
      },
    });

    return response.data;
  }

  async uploadAvatar(file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> {
    return this.uploadImage(file, {
      folder: 'avatars',
      transformation: {
        width: 400,
        height: 400,
        crop: 'fill',
        quality: 'auto',
      },
      onProgress,
    });
  }

  async uploadClubLogo(file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> {
    return this.uploadImage(file, {
      folder: 'clubs/logos',
      transformation: {
        width: 300,
        height: 300,
        crop: 'fill',
        quality: 'auto',
      },
      onProgress,
    });
  }

  async uploadClubCover(file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> {
    return this.uploadImage(file, {
      folder: 'clubs/covers',
      transformation: {
        width: 1200,
        height: 400,
        crop: 'fill',
        quality: 'auto',
      },
      onProgress,
    });
  }

  async uploadEventImage(file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> {
    return this.uploadImage(file, {
      folder: 'events',
      transformation: {
        width: 800,
        height: 600,
        crop: 'fill',
        quality: 'auto',
      },
      onProgress,
    });
  }

  async uploadDocument(file: File, folder: string, onProgress?: (progress: number) => void): Promise<UploadResponse> {
    const validation = this.validateDocumentFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await api.post<UploadResponse>('/upload/document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  async deleteFile(publicId: string): Promise<void> {
    await api.delete(`/upload/${publicId}`);
  }

  getOptimizedImageUrl(url: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  } = {}): string {
    if (!url) return '';

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    // if (!url.includes(cloudName)) return url;

    const transformations: string[] = [];
    
    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.quality) transformations.push(`q_${options.quality}`);
    if (options.format) transformations.push(`f_${options.format}`);
    
    if (transformations.length === 0) return url;

    const transformString = transformations.join(',');
    return url.replace('/upload/', `/upload/${transformString}/`);
  }

  createImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to create preview'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

export default new UploadService();