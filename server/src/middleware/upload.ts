import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { Request } from 'express';
import { AppError } from '@/middleware/errorHandler';
import { UPLOAD_CONFIG, HTTP_STATUS, ERROR_MESSAGES } from '@/utils/constants';

// Define file filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file type based on field name
  let allowedTypes: string[] = [];
  
  switch (file.fieldname) {
    case 'profileImage':
    case 'avatar':
    case 'clubLogo':
    case 'eventImage':
    case 'eventImages':
      allowedTypes = UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES;
      break;
    case 'document':
    case 'documents':
      allowedTypes = UPLOAD_CONFIG.ALLOWED_DOCUMENT_TYPES;
      break;
    default:
      allowedTypes = [...UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES, ...UPLOAD_CONFIG.ALLOWED_DOCUMENT_TYPES];
  }

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(
      `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      HTTP_STATUS.BAD_REQUEST
    ));
  }
};

// Memory storage configuration (for cloud upload)
const memoryStorage = multer.memoryStorage();

// Disk storage configuration (for local development)
const diskStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    let uploadPath = 'uploads/';
    
    switch (file.fieldname) {
      case 'profileImage':
      case 'avatar':
        uploadPath += 'profiles/';
        break;
      case 'clubLogo':
        uploadPath += 'clubs/';
        break;
      case 'eventImage':
      case 'eventImages':
        uploadPath += 'events/';
        break;
      case 'document':
      case 'documents':
        uploadPath += 'documents/';
        break;
      default:
        uploadPath += 'misc/';
    }
    
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    // Generate unique filename
    const uniqueSuffix = crypto.randomUUID();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    
    // Clean filename (remove special characters)
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${cleanName}_${uniqueSuffix}${ext}`;
    
    cb(null, filename);
  }
});

// Choose storage based on environment
const storage = process.env.NODE_ENV === 'production' ? memoryStorage : diskStorage;

// Base multer configuration
const baseUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
    files: 10, // Maximum 10 files per request
    fields: 20, // Maximum 20 fields per request
    fieldNameSize: 50, // Maximum field name size
    fieldSize: 1024 * 1024, // Maximum field value size (1MB)
  }
});

// Specific upload configurations for different use cases
export const upload = {
  // Single file upload
  single: (fieldName: string) => baseUpload.single(fieldName),
  
  // Multiple files with same field name
  array: (fieldName: string, maxCount: number = 5) => baseUpload.array(fieldName, maxCount),
  
  // Multiple files with different field names
  fields: (fields: Array<{ name: string; maxCount?: number }>) => baseUpload.fields(fields),
  
  // No file upload, just form data
  none: () => baseUpload.none(),
  
  // Any file upload
  any: () => baseUpload.any()
};

// Specific configurations for different types
export const uploadConfigs = {
  // Profile image upload
  profileImage: upload.single('profileImage'),
  
  // Club logo upload
  clubLogo: upload.single('clubLogo'),
  
  // Event image upload
  eventImage: upload.single('eventImage'),
  
  // Multiple event images
  eventImages: upload.array('eventImages', 5),
  
  // Document upload
  document: upload.single('document'),
  
  // Multiple documents
  documents: upload.array('documents', 3),
  
  // Mixed upload (profile and documents)
  mixed: upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'documents', maxCount: 3 }
  ])
};

// File validation utilities
export const validateFile = {
  // Check if file is image
  isImage: (file: Express.Multer.File): boolean => {
    return UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.mimetype);
  },
  
  // Check if file is document
  isDocument: (file: Express.Multer.File): boolean => {
    return UPLOAD_CONFIG.ALLOWED_DOCUMENT_TYPES.includes(file.mimetype);
  },
  
  // Get file extension
  getExtension: (filename: string): string => {
    return path.extname(filename).toLowerCase();
  },
  
  // Generate safe filename
  generateSafeFilename: (originalName: string): string => {
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '_');
    const uniqueSuffix = crypto.randomUUID();
    return `${cleanName}_${uniqueSuffix}${ext}`;
  },
  
  // Check file size
  validateSize: (file: Express.Multer.File, maxSize?: number): boolean => {
    const limit = maxSize || UPLOAD_CONFIG.MAX_FILE_SIZE;
    return file.size <= limit;
  }
};

// File processing utilities
export const processFile = {
  // Get file info
  getFileInfo: (file: Express.Multer.File) => {
    return {
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      extension: validateFile.getExtension(file.originalname),
      isImage: validateFile.isImage(file),
      isDocument: validateFile.isDocument(file),
      buffer: file.buffer, // Available when using memory storage
      path: file.path, // Available when using disk storage
      fieldname: file.fieldname
    };
  },
  
  // Process multiple files
  processMultipleFiles: (files: Express.Multer.File[]) => {
    return files.map(processFile.getFileInfo);
  },
  
  // Organize files by field name
  organizeFilesByField: (files: { [fieldname: string]: Express.Multer.File[] }) => {
    const organized: { [key: string]: any[] } = {};
    
    for (const [fieldName, fileArray] of Object.entries(files)) {
      organized[fieldName] = fileArray.map(processFile.getFileInfo);
    }
    
    return organized;
  }
};

// Error handling for upload middleware
export const handleUploadError = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    let message: string;
    
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = `File size too large. Maximum size is ${UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`;
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files uploaded';
        break;
      case 'LIMIT_FIELD_KEY':
        message = 'Field name too long';
        break;
      case 'LIMIT_FIELD_VALUE':
        message = 'Field value too long';
        break;
      case 'LIMIT_FIELD_COUNT':
        message = 'Too many fields';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field';
        break;
      default:
        message = 'File upload error';
    }
    
    return next(new AppError(message, HTTP_STATUS.BAD_REQUEST));
  }
  
  next(error);
};

// Clean up temporary files (for disk storage)
export const cleanupFiles = (files: Express.Multer.File | Express.Multer.File[] | undefined) => {
  if (!files) return;
  
  const fileArray = Array.isArray(files) ? files : [files];
  
  fileArray.forEach(file => {
    if (file.path && require('fs').existsSync(file.path)) {
      require('fs').unlinkSync(file.path);
    }
  });
};

// Middleware to clean up files on error
export const cleanupOnError = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  
  res.json = function(data: any) {
    if (res.statusCode >= 400) {
      // Clean up uploaded files on error
      cleanupFiles(req.file);
      cleanupFiles(req.files as Express.Multer.File[]);
    }
    return originalJson.call(this, data);
  };
  
  next();
};