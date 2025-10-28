// server/scripts/deleteUsers.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {

  await prisma.club.deleteMany({});
  // Delete ALL users
  const deleted = await prisma.user.deleteMany({});
  console.log(`Deleted ${deleted.count} users`);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(() => {
    prisma.$disconnect();
  });
