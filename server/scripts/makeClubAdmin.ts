// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// async function makeClubAdmin() {
//   const email = process.argv[2];

//   if (!email) {
//     console.error('❌ Usage: tsx scripts/makeClubAdmin.ts <email>');
//     process.exit(1);
//   }

//   try {
//     const user = await prisma.user.findUnique({
//       where: { email },
//       select: { id: true, email: true, firstName: true, lastName: true, role: true },
//     });

//     if (!user) {
//       console.error(`❌ User with email "${email}" not found`);
//       process.exit(1);
//     }

//     if (user.role === 'club_admin') {
//       console.log(`ℹ️  User ${user.firstName} ${user.lastName} (${email}) is already a club_admin`);
//       process.exit(0);
//     }

//     await prisma.user.update({
//       where: { email },
//       data: { role: 'club_admin' },
//     });

//     console.log(`✅ Successfully promoted ${user.firstName} ${user.lastName} (${email}) to club_admin`);
//   } catch (error) {
//     console.error('❌ Error:', error);
//     process.exit(1);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// makeClubAdmin();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'rhitikavishwakarma7@gmail.com'; // 👈 change this to the user's email

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
      role: 'student', // 👈 change to 'club_admin' if you want that instead
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
