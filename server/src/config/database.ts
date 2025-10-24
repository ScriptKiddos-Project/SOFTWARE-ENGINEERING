import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

// Extend PrismaClient with logging configuration
class DatabaseClient extends PrismaClient {
  constructor() {
    super({
      // log: [
      //   {
      //     emit: 'event',
      //     level: 'query',
      //   },
      //   {
      //     emit: 'event',
      //     level: 'error',
      //   },
      //   {
      //     emit: 'event',
      //     level: 'info',
      //   },
      //   {
      //     emit: 'event',
      //     level: 'warn',
      //   },
      // ],
      log: process.env.NODE_ENV === 'production' ? ['error'] : ['warn', 'error'],// Warnings and errors in development // Remove 'query' and 'info' to stop seeing those [DEBUG] logs
      errorFormat: 'pretty',
    });

    // Log database queries in development
    if (process.env.NODE_ENV === 'development') {
      (this as any).$on('query', (e: any) => {
        logger.debug(`Query: ${e.query}`);
        logger.debug(`Params: ${e.params}`);
        logger.debug(`Duration: ${e.duration}ms`);
      });
    }

    // Log database errors
    (this as any).$on('error', (e: any) => {
      logger.error('Database Error:', e);
    });

    // Log database info
    (this as any).$on('info', (e: any) => {
      logger.info('Database Info:', e.message);
    });

    // Log database warnings
    (this as any).$on('warn', (e: any) => {
      logger.warn('Database Warning:', e.message);
    });
  }

  // Custom method to safely disconnect
  async safeDisconnect() {
    try {
      await this.$disconnect();
      logger.info('Database connection closed successfully');
    } catch (error) {
      logger.error('Error closing database connection:', error);
    }
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }

  // Transaction helper with retry logic
  async executeWithRetry<T>(
    operation: (tx: any) => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.$transaction(operation);
      } catch (error: any) {
        lastError = error;
        logger.warn(`Transaction attempt ${attempt} failed:`, error.message);
        
        // Don't retry on certain errors
        if (error.code === 'P2002' || error.code === 'P2025') {
          throw error;
        }
        
        if (attempt === maxRetries) {
          break;
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempt - 1) * 1000)
        );
      }
    }

    throw lastError;
  }
}

// Create single instance
const prisma = new DatabaseClient();

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, closing database connection...');
  await prisma.safeDisconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, closing database connection...');
  await prisma.safeDisconnect();
  process.exit(0);
});

export default prisma;