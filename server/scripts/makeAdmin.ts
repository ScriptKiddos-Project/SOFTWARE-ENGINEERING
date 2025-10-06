import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@clubhub.com'; // 👈 change this to the user's email

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log(`User with email ${email} not found.`);
    return;
  }

  const updated = await prisma.user.update({
    where: { email },
    data: {
      role: 'super_admin', // 👈 change to 'club_admin' if you want that instead
    },
  });

  console.log(`Updated user ${updated.email} to role: ${updated.role}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
