import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { MulterError } from 'multer';
import { HTTP_STATUS, ERROR_MESSAGES, NODE_ENV } from '@/utils/constants';

// Custom Error Class
export class AppError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation Error Response Interface
interface ErrorResponse {
  success: false;
  message: string;
  errors?: any;
  stack?: string;
  timestamp: string;
}

// Handle Zod Validation Errors
const handleZodError = (error: ZodError): AppError => {
  const errors = error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }));

  return new AppError(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST);
};

// Handle Prisma Database Errors
const handlePrismaError = (error: any): AppError => {
  switch (error.code) {
    case 'P2000':
      return new AppError('The provided value is too long for the field', HTTP_STATUS.BAD_REQUEST);
    
    case 'P2001':
      return new AppError('Record not found', HTTP_STATUS.NOT_FOUND);
    
    case 'P2002':
      const field = error.meta?.target?.[0] || 'field';
      return new AppError(`${field} already exists`, HTTP_STATUS.CONFLICT);
    
    case 'P2003':
      return new AppError('Foreign key constraint failed', HTTP_STATUS.BAD_REQUEST);
    
    case 'P2004':
      return new AppError('Database constraint failed', HTTP_STATUS.BAD_REQUEST);
    
    case 'P2005':
      return new AppError('Invalid value provided', HTTP_STATUS.BAD_REQUEST);
    
    case 'P2006':
      return new AppError('Invalid value provided', HTTP_STATUS.BAD_REQUEST);
    
    case 'P2007':
      return new AppError('Data validation error', HTTP_STATUS.BAD_REQUEST);
    
    case 'P2008':
      return new AppError('Failed to parse query', HTTP_STATUS.BAD_REQUEST);
    
    case 'P2009':
      return new AppError('Failed to validate query', HTTP_STATUS.BAD_REQUEST);
    
    case 'P2010':
      return new AppError('Raw query failed', HTTP_STATUS.BAD_REQUEST);
    
    case 'P2011':
      return new AppError('Null constraint violation', HTTP_STATUS.BAD_REQUEST);
    
    case 'P2012':
      return new AppError('Missing required value', HTTP_STATUS.BAD_REQUEST);
    
    case 'P2013':
      return new AppError('Missing required argument', HTTP_STATUS.BAD_REQUEST);
    
    case 'P2014':
      return new AppError('Required relation is missing', HTTP_STATUS.BAD_REQUEST);
    
    case 'P2015':
      return new AppError('Related record not found', HTTP_STATUS.NOT_FOUND);
    
    case 'P2016':
      return new AppError('Query interpretation error', HTTP_STATUS.BAD_REQUEST);
    
    case 'P2017':
      return new AppError('Records not connected', HTTP_STATUS.BAD_REQUEST);
    
    case 'P2018':
      return new AppError('Required connected records not found', HTTP_STATUS.NOT_FOUND);
    
    case 'P2019':
      return new AppError('Input error', HTTP_STATUS.BAD_REQUEST);
    
    case 'P2020':
      return new AppError('Value out of range', HTTP_STATUS.BAD_REQUEST);
    
    case 'P2021':
      return new AppError('Table does not exist', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    
    case 'P2022':
      return new AppError('Column does not exist', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    
    case 'P2023':
      return new AppError('Inconsistent column data', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    
    case 'P2024':
      return new AppError('Connection timeout', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    
    case 'P2025':
      return new AppError('Record not found or operation failed', HTTP_STATUS.NOT_FOUND);
    
    case 'P2026':
      return new AppError('Database query error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    
    case 'P2027':
      return new AppError('Database error during query execution', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    
    default:
      return new AppError('Database operation failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

// Handle JWT Errors
const handleJWTError = (): AppError => {
  return new AppError(ERROR_MESSAGES.INVALID_TOKEN, HTTP_STATUS.UNAUTHORIZED);
};

const handleJWTExpiredError = (): AppError => {
  return new AppError('Token expired', HTTP_STATUS.UNAUTHORIZED);
};

// Handle Multer Upload Errors
const handleMulterError = (error: MulterError): AppError => {
  switch (error.code) {
    case 'LIMIT_FILE_SIZE':
      return new AppError('File size too large', HTTP_STATUS.BAD_REQUEST);
    case 'LIMIT_FILE_COUNT':
      return new AppError('Too many files uploaded', HTTP_STATUS.BAD_REQUEST);
    case 'LIMIT_FIELD_KEY':
      return new AppError('Field name too long', HTTP_STATUS.BAD_REQUEST);
    case 'LIMIT_FIELD_VALUE':
      return new AppError('Field value too long', HTTP_STATUS.BAD_REQUEST);
    case 'LIMIT_FIELD_COUNT':
      return new AppError('Too many fields', HTTP_STATUS.BAD_REQUEST);
    case 'LIMIT_UNEXPECTED_FILE':
      return new AppError('Unexpected file field', HTTP_STATUS.BAD_REQUEST);
    default:
      return new AppError('File upload error', HTTP_STATUS.BAD_REQUEST);
  }
};

// Send Error Response in Development
const sendErrorDev = (err: AppError, res: Response): void => {
  const errorResponse: ErrorResponse = {
    success: false,
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  };

  res.status(err.statusCode).json(errorResponse);
};

// Send Error Response in Production
const sendErrorProd = (err: AppError, res: Response): void => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    const errorResponse: ErrorResponse = {
      success: false,
      message: err.message,
      timestamp: new Date().toISOString()
    };

    res.status(err.statusCode).json(errorResponse);
  } else {
    // Programming or unknown error: don't leak error details
    console.error('ERROR 💥:', err);

    const errorResponse: ErrorResponse = {
      success: false,
      message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString()
    };

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
};

// Global Error Handler Middleware
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  err.statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  err.status = err.status || 'error';

  let error = { ...err };
  error.message = err.message;

  // Handle specific error types
  if (err instanceof ZodError) {
    error = handleZodError(err);
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    error = handlePrismaError(err);
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    error = new AppError(ERROR_MESSAGES.DATABASE_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  } else if (err instanceof Prisma.PrismaClientRustPanicError) {
    error = new AppError(ERROR_MESSAGES.DATABASE_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    error = new AppError('Database connection failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    error = new AppError(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST);
  } else if (err instanceof JsonWebTokenError) {
    error = handleJWTError();
  } else if (err instanceof TokenExpiredError) {
    error = handleJWTExpiredError();
  } else if (err instanceof MulterError) {
    error = handleMulterError(err);
  } else if (err.name === 'CastError') {
    error = new AppError('Invalid ID format', HTTP_STATUS.BAD_REQUEST);
  } else if (err.code === 11000) {
    // MongoDB duplicate key error
    const field = Object.keys(err.keyValue)[0];
    error = new AppError(`${field} already exists`, HTTP_STATUS.CONFLICT);
  }

  // Log error details (you might want to use a proper logging library like Winston)
  console.error({
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  if (NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

// Catch Async Errors Wrapper
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Handle Unhandled Promise Rejections
process.on('unhandledRejection', (err: any) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle Uncaught Exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Not Found Handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const err = new AppError(`Can't find ${req.originalUrl} on this server!`, HTTP_STATUS.NOT_FOUND);
  next(err);
};

// Validation Error Creator
export const createValidationError = (message: string, field?: string): AppError => {
  const error = new AppError(message, HTTP_STATUS.BAD_REQUEST);
  if (field) {
    (error as any).field = field;
  }
  return error;
};

// Authentication Error Creator
export const createAuthError = (message: string = ERROR_MESSAGES.UNAUTHORIZED): AppError => {
  return new AppError(message, HTTP_STATUS.UNAUTHORIZED);
};

// Forbidden Error Creator
export const createForbiddenError = (message: string = ERROR_MESSAGES.FORBIDDEN): AppError => {
  return new AppError(message, HTTP_STATUS.FORBIDDEN);
};

// Not Found Error Creator
export const createNotFoundError = (resource: string): AppError => {
  return new AppError(`${resource} not found`, HTTP_STATUS.NOT_FOUND);
};

// Conflict Error Creator
export const createConflictError = (message: string): AppError => {
  return new AppError(message, HTTP_STATUS.CONFLICT);
};

// Rate Limit Error Creator
export const createRateLimitError = (message: string = 'Too many requests'): AppError => {
  return new AppError(message, HTTP_STATUS.TOO_MANY_REQUESTS);
};