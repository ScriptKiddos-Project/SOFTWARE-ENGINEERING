import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { PrismaClient } from '@prisma/client';
import { BadgeService } from './services/badgeService';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize Prisma client
const prisma = new PrismaClient({
  log: NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Initialize badge service
const badgeService = new BadgeService();

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Join user to their personal room for notifications
  socket.on('join-user-room', (userId: string) => {
    socket.join(`user:${userId}`);
    console.log(`User ${userId} joined personal room`);
  });

  // Join club room for club-specific updates
  socket.on('join-club-room', (clubId: string) => {
    socket.join(`club:${clubId}`);
    console.log(`Client joined club room: ${clubId}`);
  });

  // Leave club room
  socket.on('leave-club-room', (clubId: string) => {
    socket.leave(`club:${clubId}`);
    console.log(`Client left club room: ${clubId}`);
  });

  // Handle real-time chat messages (future implementation)
  socket.on('send-message', (data) => {
    // Broadcast to club room
    socket.to(`club:${data.clubId}`).emit('new-message', data);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Make io available globally for use in controllers/services
declare global {
  var io: SocketIOServer;
}
global.io = io;

// Database connection and server startup
async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Initialize badge system
    await badgeService.initializeBadges();
    console.log('✅ Badge system initialized');

    // Start HTTP server
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${NODE_ENV}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      
      if (NODE_ENV === 'development') {
        console.log(`📊 Prisma Studio: npx prisma studio`);
        console.log(`🔍 API Documentation: http://localhost:${PORT}/api/docs`);
      }
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err: Error) => {
      console.error('❌ Unhandled Promise Rejection:', err.message);
      console.error(err.stack);
      
      // Close server gracefully
      httpServer.close(() => {
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err: Error) => {
      console.error('❌ Uncaught Exception:', err.message);
      console.error(err.stack);
      process.exit(1);
    });

    // Handle SIGTERM signal (Heroku, Railway, etc.)
    process.on('SIGTERM', () => {
      console.log('🔄 SIGTERM received, shutting down gracefully...');
      
      httpServer.close(async () => {
        console.log('🛑 HTTP server closed');
        
        // Close database connection
        await prisma.$disconnect();
        console.log('🛑 Database connection closed');
        
        process.exit(0);
      });
    });

    // Handle SIGINT signal (Ctrl+C)
    process.on('SIGINT', () => {
      console.log('🔄 SIGINT received, shutting down gracefully...');
      
      httpServer.close(async () => {
        console.log('🛑 HTTP server closed');
        
        // Close database connection
        await prisma.$disconnect();
        console.log('🛑 Database connection closed');
        
        process.exit(0);
      });
    });

    // Periodic maintenance tasks (run every hour in production)
    if (NODE_ENV === 'production') {
      setInterval(async () => {
        try {
          console.log('🔧 Running periodic maintenance...');
          
          // Placeholder for maintenance tasks (no refresh token model in schema)
          
        } catch (error) {
          console.error('❌ Maintenance task failed:', error);
        }
      }, 60 * 60 * 1000); // Run every hour
    }

    // Badge checking task (run every 30 minutes)
    setInterval(async () => {
      try {
        console.log('🏆 Running badge check for active users...');
        
        // Get users who have been active in the last 24 hours
        const activeUsers = await prisma.user.findMany({
          where: {
            updatedAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          },
          select: { id: true }
        });

        // Check and award badges for active users
        for (const user of activeUsers) {
          try {
            const newBadges = await badgeService.checkAndAwardBadges(user.id);
            
            if (newBadges.length > 0) {
              console.log(`🎖️ Awarded ${newBadges.length} badges to user ${user.id}`);
              
              // Emit badge notification to user
              io.to(`user:${user.id}`).emit('badges-awarded', {
                badges: newBadges,
                message: `Congratulations! You've earned ${newBadges.length} new badge${newBadges.length > 1 ? 's' : ''}!`
              });
            }
          } catch (error) {
            console.error(`❌ Badge check failed for user ${user.id}:`, error);
          }
        }
        
      } catch (error) {
        console.error('❌ Badge checking task failed:', error);
      }
    }, 30 * 60 * 1000); // Run every 30 minutes

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

// Export server for testing
export default httpServer;