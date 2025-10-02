import { PrismaClient } from '@prisma/client';

async function testConnection() {
  const prisma = new PrismaClient();

  try {
    await prisma.$connect(); // Explicitly connect
    console.log('✅ Database connected successfully!');

    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`👤 Current user count: ${userCount}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🛑 Database disconnected successfully!');
  }
}

testConnection();
