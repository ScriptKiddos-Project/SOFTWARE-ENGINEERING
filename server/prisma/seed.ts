import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@clubhub.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('Admin user already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash('AdminPassword123!', 12);

  await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash: hashedPassword,
      role: 'super_admin',
      firstName: 'Admin',
      lastName: 'User',
      isVerified: true,
      // Add any other required fields here
    },
  });

  console.log('Admin user created successfully');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
