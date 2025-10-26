import { PrismaClient, RegistrationStatus, AttendanceMethod, ClubMemberRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('🗑️  Cleaning existing data...');
  await prisma.eventFeedback.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.attendanceLog.deleteMany();
  await prisma.eventQRCode.deleteMany();
  await prisma.pointsHistory.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.chatRoom.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.event.deleteMany();
  await prisma.userClub.deleteMany();
  await prisma.club.deleteMany();
  await prisma.user.deleteMany();

  // Hash password once for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // ==================== USERS ====================
  console.log('👥 Creating users...');
  
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@college.edu',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      studentId: 'ADMIN001',
      phone: '+91-9876543210',
      department: 'Administration',
      yearOfStudy: 4,
      role: 'super_admin',
      isVerified: true,
      totalPoints: 500,
      totalVolunteerHours: 20,
    },
  });

  const clubAdmins = await Promise.all([
    prisma.user.create({
      data: {
        email: 'priya.sharma@college.edu',
        passwordHash: hashedPassword,
        firstName: 'Priya',
        lastName: 'Sharma',
        studentId: 'CS2021001',
        phone: '+91-9876543211',
        department: 'Computer Science',
        yearOfStudy: 3,
        role: 'club_admin',
        isVerified: true,
        totalPoints: 850,
        totalVolunteerHours: 35,
      },
    }),
    prisma.user.create({
      data: {
        email: 'rahul.mehta@college.edu',
        passwordHash: hashedPassword,
        firstName: 'Rahul',
        lastName: 'Mehta',
        studentId: 'EC2020045',
        phone: '+91-9876543212',
        department: 'Electronics',
        yearOfStudy: 4,
        role: 'club_admin',
        isVerified: true,
        totalPoints: 720,
        totalVolunteerHours: 28,
      },
    }),
    prisma.user.create({
      data: {
        email: 'ananya.patel@college.edu',
        passwordHash: hashedPassword,
        firstName: 'Ananya',
        lastName: 'Patel',
        studentId: 'ME2021089',
        phone: '+91-9876543213',
        department: 'Mechanical',
        yearOfStudy: 3,
        role: 'club_admin',
        isVerified: true,
        totalPoints: 680,
        totalVolunteerHours: 30,
      },
    }),
  ]);

  const students = await Promise.all([
    prisma.user.create({
      data: {
        email: 'arjun.singh@college.edu',
        passwordHash: hashedPassword,
        firstName: 'Arjun',
        lastName: 'Singh',
        studentId: 'CS2022156',
        phone: '+91-9876543214',
        department: 'Computer Science',
        yearOfStudy: 2,
        role: 'student',
        isVerified: true,
        totalPoints: 420,
        totalVolunteerHours: 15,
      },
    }),
    prisma.user.create({
      data: {
        email: 'sneha.reddy@college.edu',
        passwordHash: hashedPassword,
        firstName: 'Sneha',
        lastName: 'Reddy',
        studentId: 'IT2022187',
        phone: '+91-9876543215',
        department: 'Information Technology',
        yearOfStudy: 2,
        role: 'student',
        isVerified: true,
        totalPoints: 380,
        totalVolunteerHours: 12,
      },
    }),
    prisma.user.create({
      data: {
        email: 'vikram.kumar@college.edu',
        passwordHash: hashedPassword,
        firstName: 'Vikram',
        lastName: 'Kumar',
        studentId: 'EC2023201',
        phone: '+91-9876543216',
        department: 'Electronics',
        yearOfStudy: 1,
        role: 'student',
        isVerified: true,
        totalPoints: 250,
        totalVolunteerHours: 8,
      },
    }),
    prisma.user.create({
      data: {
        email: 'diya.gupta@college.edu',
        passwordHash: hashedPassword,
        firstName: 'Diya',
        lastName: 'Gupta',
        studentId: 'CS2023245',
        phone: '+91-9876543217',
        department: 'Computer Science',
        yearOfStudy: 1,
        role: 'student',
        isVerified: true,
        totalPoints: 190,
        totalVolunteerHours: 5,
      },
    }),
    prisma.user.create({
      data: {
        email: 'karan.joshi@college.edu',
        passwordHash: hashedPassword,
        firstName: 'Karan',
        lastName: 'Joshi',
        studentId: 'ME2022167',
        phone: '+91-9876543218',
        department: 'Mechanical',
        yearOfStudy: 2,
        role: 'student',
        isVerified: true,
        totalPoints: 340,
        totalVolunteerHours: 10,
      },
    }),
    prisma.user.create({
      data: {
        email: 'ishita.verma@college.edu',
        passwordHash: hashedPassword,
        firstName: 'Ishita',
        lastName: 'Verma',
        studentId: 'CE2021134',
        phone: '+91-9876543219',
        department: 'Civil Engineering',
        yearOfStudy: 3,
        role: 'student',
        isVerified: true,
        totalPoints: 560,
        totalVolunteerHours: 22,
      },
    }),
    prisma.user.create({
      data: {
        email: 'aditya.nair@college.edu',
        passwordHash: hashedPassword,
        firstName: 'Aditya',
        lastName: 'Nair',
        studentId: 'IT2021178',
        phone: '+91-9876543220',
        department: 'Information Technology',
        yearOfStudy: 3,
        role: 'student',
        isVerified: true,
        totalPoints: 480,
        totalVolunteerHours: 18,
      },
    }),
    prisma.user.create({
      data: {
        email: 'pooja.desai@college.edu',
        passwordHash: hashedPassword,
        firstName: 'Pooja',
        lastName: 'Desai',
        studentId: 'CS2020089',
        phone: '+91-9876543221',
        department: 'Computer Science',
        yearOfStudy: 4,
        role: 'student',
        isVerified: true,
        totalPoints: 620,
        totalVolunteerHours: 25,
      },
    }),
    prisma.user.create({
      data: {
        email: 'rohan.iyer@college.edu',
        passwordHash: hashedPassword,
        firstName: 'Rohan',
        lastName: 'Iyer',
        studentId: 'EC2022134',
        phone: '+91-9876543222',
        department: 'Electronics',
        yearOfStudy: 2,
        role: 'student',
        isVerified: true,
        totalPoints: 290,
        totalVolunteerHours: 9,
      },
    }),
    prisma.user.create({
      data: {
        email: 'neha.bhatt@college.edu',
        passwordHash: hashedPassword,
        firstName: 'Neha',
        lastName: 'Bhatt',
        studentId: 'ME2023198',
        phone: '+91-9876543223',
        department: 'Mechanical',
        yearOfStudy: 1,
        role: 'student',
        isVerified: true,
        totalPoints: 150,
        totalVolunteerHours: 4,
      },
    }),
  ]);

  console.log(`✅ Created ${students.length + clubAdmins.length + 1} users\n`);

  // ==================== CLUBS ====================
  console.log('🏛️  Creating clubs...');

  const clubs = await Promise.all([
    // Technical Clubs
    prisma.club.create({
      data: {
        name: 'CodeCraft - Programming Club',
        description: 'A community of passionate programmers fostering competitive coding, hackathons, and software development. Join us to enhance your coding skills and collaborate on exciting projects!',
        category: 'technical',
        logoUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400',
        coverImageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200',
        contactEmail: 'codecraft@college.edu',
        isActive: true,
        memberCount: 0,
        createdBy: clubAdmins[0].id,
      },
    }),
    prisma.club.create({
      data: {
        name: 'AI & ML Research Society',
        description: 'Exploring the frontiers of Artificial Intelligence and Machine Learning. We conduct workshops, research projects, and competitions in deep learning, NLP, and computer vision.',
        category: 'technical',
        logoUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
        coverImageUrl: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=1200',
        contactEmail: 'aiml@college.edu',
        isActive: true,
        memberCount: 0,
        createdBy: clubAdmins[0].id,
      },
    }),
    prisma.club.create({
      data: {
        name: 'Robotics & Automation Club',
        description: 'Building intelligent machines and automated systems. From line-following robots to industrial automation, we make technology come alive through hands-on projects.',
        category: 'technical',
        logoUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
        coverImageUrl: 'https://images.unsplash.com/photo-1563207153-f403bf289096?w=1200',
        contactEmail: 'robotics@college.edu',
        isActive: true,
        memberCount: 0,
        createdBy: clubAdmins[1].id,
      },
    }),
    prisma.club.create({
      data: {
        name: 'CyberSec Warriors',
        description: 'Defending the digital frontier! Learn ethical hacking, penetration testing, cryptography, and network security through CTF competitions and security workshops.',
        category: 'technical',
        logoUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400',
        coverImageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200',
        contactEmail: 'cybersec@college.edu',
        isActive: true,
        memberCount: 0,
        createdBy: clubAdmins[1].id,
      },
    }),

    // Cultural Clubs
    prisma.club.create({
      data: {
        name: 'Rhythmica - Dance Society',
        description: 'Express yourself through movement! From classical to contemporary, hip-hop to Bollywood, we celebrate all forms of dance and perform at major college events.',
        category: 'cultural',
        logoUrl: 'https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?w=400',
        coverImageUrl: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=1200',
        contactEmail: 'rhythmica@college.edu',
        isActive: true,
        memberCount: 0,
        createdBy: clubAdmins[2].id,
      },
    }),
    prisma.club.create({
      data: {
        name: 'Melodia - Music Club',
        description: 'Where melodies meet passion. Whether you sing, play instruments, or compose music, join us for jam sessions, concerts, and music production workshops.',
        category: 'cultural',
        logoUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400',
        coverImageUrl: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=1200',
        contactEmail: 'melodia@college.edu',
        isActive: true,
        memberCount: 0,
        createdBy: clubAdmins[2].id,
      },
    }),
    prisma.club.create({
      data: {
        name: 'Theatrica - Drama Club',
        description: 'All the world\'s a stage! Join us for theatrical performances, street plays, stand-up comedy, and dramatic arts that inspire and entertain.',
        category: 'cultural',
        logoUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=400',
        coverImageUrl: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200',
        contactEmail: 'theatrica@college.edu',
        isActive: true,
        memberCount: 0,
        createdBy: superAdmin.id,
      },
    }),

    // Sports Clubs
    prisma.club.create({
      data: {
        name: 'Campus Cricket League',
        description: 'Play the gentleman\'s game! Regular matches, tournaments, coaching sessions, and inter-college competitions for cricket enthusiasts of all skill levels.',
        category: 'sports',
        logoUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400',
        coverImageUrl: 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=1200',
        contactEmail: 'cricket@college.edu',
        isActive: true,
        memberCount: 0,
        createdBy: superAdmin.id,
      },
    }),
    prisma.club.create({
      data: {
        name: 'Fitness Freaks Gym Club',
        description: 'Strength, stamina, and discipline! Join our fitness community for gym sessions, workout plans, yoga, and healthy lifestyle guidance.',
        category: 'sports',
        logoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
        coverImageUrl: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200',
        contactEmail: 'fitness@college.edu',
        isActive: true,
        memberCount: 0,
        createdBy: students[4].id,
      },
    }),

    // Academic Clubs
    prisma.club.create({
      data: {
        name: 'Mathematics Circle',
        description: 'Beauty in numbers! Explore advanced mathematics, solve challenging problems, and participate in math olympiads and competitive exams preparation.',
        category: 'academic',
        logoUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400',
        coverImageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1200',
        contactEmail: 'mathcircle@college.edu',
        isActive: true,
        memberCount: 0,
        createdBy: students[5].id,
      },
    }),
    prisma.club.create({
      data: {
        name: 'Innovators Lab',
        description: 'Where ideas become reality! Research, innovation, and product development club for students interested in patents, publications, and entrepreneurship.',
        category: 'academic',
        logoUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400',
        coverImageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200',
        contactEmail: 'innovators@college.edu',
        isActive: true,
        memberCount: 0,
        createdBy: clubAdmins[0].id,
      },
    }),

    // Social Service Clubs
    prisma.club.create({
      data: {
        name: 'Green Earth Initiative',
        description: 'Sustainability and environmental conservation. Tree plantation drives, waste management campaigns, and awareness programs for a greener tomorrow.',
        category: 'social_service',
        logoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400',
        coverImageUrl: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=1200',
        contactEmail: 'greenearth@college.edu',
        isActive: true,
        memberCount: 0,
        createdBy: students[5].id,
      },
    }),
    prisma.club.create({
      data: {
        name: 'Seva Foundation',
        description: 'Service above self. Community outreach, teaching underprivileged children, blood donation camps, and social welfare activities.',
        category: 'social_service',
        logoUrl: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400',
        coverImageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200',
        contactEmail: 'seva@college.edu',
        isActive: true,
        memberCount: 0,
        createdBy: students[5].id,
      },
    }),

    // Entrepreneurship Clubs
    prisma.club.create({
      data: {
        name: 'StartUp Incubator',
        description: 'From idea to IPO! Entrepreneurship club fostering startup culture, business planning, pitch competitions, and connections with investors.',
        category: 'entrepreneurship',
        logoUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400',
        coverImageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200',
        contactEmail: 'startup@college.edu',
        isActive: true,
        memberCount: 0,
        createdBy: clubAdmins[2].id,
      },
    }),

    // Arts Clubs
    prisma.club.create({
      data: {
        name: 'Artistry - Fine Arts Society',
        description: 'Canvas to creativity! Painting, sketching, sculpture, digital art, and exhibitions. Express your artistic vision and showcase your talent.',
        category: 'arts',
        logoUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400',
        coverImageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200',
        contactEmail: 'artistry@college.edu',
        isActive: true,
        memberCount: 0,
        createdBy: students[7].id,
      },
    }),
    prisma.club.create({
      data: {
        name: 'Shutterbugs - Photography Club',
        description: 'Capture moments, create memories. Photography workshops, photo walks, competitions, and exhibitions for amateur and professional photographers.',
        category: 'arts',
        logoUrl: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400',
        coverImageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200',
        contactEmail: 'shutterbugs@college.edu',
        isActive: true,
        memberCount: 0,
        createdBy: students[6].id,
      },
    }),

    // Other
    prisma.club.create({
      data: {
        name: 'Literary Society',
        description: 'Words have power! Creative writing, poetry, debates, book clubs, and literary festivals for language and literature enthusiasts.',
        category: 'other',
        logoUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400',
        coverImageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200',
        contactEmail: 'literary@college.edu',
        isActive: true,
        memberCount: 0,
        createdBy: students[7].id,
      },
    }),
  ]);

  console.log(`✅ Created ${clubs.length} clubs\n`);

  // ==================== CLUB MEMBERSHIPS ====================
  console.log('👤 Creating club memberships...');

  // Assign club admin roles
  await prisma.userClub.create({
    data: {
      userId: clubAdmins[0].id,
      clubId: clubs[0].id, // CodeCraft
      role: ClubMemberRole.president,
    },
  });

  await prisma.userClub.create({
    data: {
      userId: clubAdmins[0].id,
      clubId: clubs[1].id, // AI & ML
      role: ClubMemberRole.vice_president,
    },
  });

  await prisma.userClub.create({
    data: {
      userId: clubAdmins[1].id,
      clubId: clubs[2].id, // Robotics
      role: ClubMemberRole.president,
    },
  });

  await prisma.userClub.create({
    data: {
      userId: clubAdmins[1].id,
      clubId: clubs[3].id, // CyberSec
      role: ClubMemberRole.secretary,
    },
  });

  await prisma.userClub.create({
    data: {
      userId: clubAdmins[2].id,
      clubId: clubs[4].id, // Rhythmica
      role: ClubMemberRole.president,
    },
  });

  await prisma.userClub.create({
    data: {
      userId: clubAdmins[2].id,
      clubId: clubs[5].id, // Melodia
      role: ClubMemberRole.vice_president,
    },
  });

  // Add students to various clubs
  const studentClubMemberships = [
    // Student 0 - Arjun Singh (Technical clubs)
    { userId: students[0].id, clubId: clubs[0].id, role: ClubMemberRole.core_member },
    { userId: students[0].id, clubId: clubs[1].id, role: ClubMemberRole.member },
    { userId: students[0].id, clubId: clubs[3].id, role: ClubMemberRole.member },
    
    // Student 1 - Sneha Reddy (Technical + Cultural)
    { userId: students[1].id, clubId: clubs[0].id, role: ClubMemberRole.member },
    { userId: students[1].id, clubId: clubs[4].id, role: ClubMemberRole.core_member },
    { userId: students[1].id, clubId: clubs[15].id, role: ClubMemberRole.member },
    
    // Student 2 - Vikram Kumar (Technical + Sports)
    { userId: students[2].id, clubId: clubs[2].id, role: ClubMemberRole.member },
    { userId: students[2].id, clubId: clubs[7].id, role: ClubMemberRole.core_member },
    { userId: students[2].id, clubId: clubs[8].id, role: ClubMemberRole.member },
    
    // Student 3 - Diya Gupta (AI & Arts)
    { userId: students[3].id, clubId: clubs[1].id, role: ClubMemberRole.member },
    { userId: students[3].id, clubId: clubs[14].id, role: ClubMemberRole.secretary },
    { userId: students[3].id, clubId: clubs[15].id, role: ClubMemberRole.core_member },
    
    // Student 4 - Karan Joshi (Sports + Academic)
    { userId: students[4].id, clubId: clubs[8].id, role: ClubMemberRole.president },
    { userId: students[4].id, clubId: clubs[9].id, role: ClubMemberRole.member },
    { userId: students[4].id, clubId: clubs[10].id, role: ClubMemberRole.member },
    
    // Student 5 - Ishita Verma (Social Service + Academic)
    { userId: students[5].id, clubId: clubs[11].id, role: ClubMemberRole.president },
    { userId: students[5].id, clubId: clubs[12].id, role: ClubMemberRole.vice_president },
    { userId: students[5].id, clubId: clubs[9].id, role: ClubMemberRole.core_member },
    
    // Student 6 - Aditya Nair (Entrepreneurship + Technical)
    { userId: students[6].id, clubId: clubs[13].id, role: ClubMemberRole.member },
    { userId: students[6].id, clubId: clubs[0].id, role: ClubMemberRole.member },
    { userId: students[6].id, clubId: clubs[10].id, role: ClubMemberRole.treasurer },
    
    // Student 7 - Pooja Desai (Arts + Literary)
    { userId: students[7].id, clubId: clubs[14].id, role: ClubMemberRole.president },
    { userId: students[7].id, clubId: clubs[16].id, role: ClubMemberRole.president },
    { userId: students[7].id, clubId: clubs[5].id, role: ClubMemberRole.member },
    
    // Student 8 - Rohan Iyer (Multiple clubs)
    { userId: students[8].id, clubId: clubs[3].id, role: ClubMemberRole.core_member },
    { userId: students[8].id, clubId: clubs[7].id, role: ClubMemberRole.member },
    { userId: students[8].id, clubId: clubs[13].id, role: ClubMemberRole.treasurer },
    
    // Student 9 - Neha Bhatt (Cultural + Arts)
    { userId: students[9].id, clubId: clubs[4].id, role: ClubMemberRole.member },
    { userId: students[9].id, clubId: clubs[5].id, role: ClubMemberRole.member },
    { userId: students[9].id, clubId: clubs[15].id, role: ClubMemberRole.president },
  ];

  await prisma.userClub.createMany({ data: studentClubMemberships });

  // Update member counts
  for (const club of clubs) {
    const count = await prisma.userClub.count({ where: { clubId: club.id } });
    await prisma.club.update({
      where: { id: club.id },
      data: { memberCount: count },
    });
  }

  console.log(`✅ Created ${studentClubMemberships.length + 6} club memberships\n`);

  // ==================== EVENTS ====================
  console.log('📅 Creating events...');

  const now = new Date();
  const pastDate = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const futureDate = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const events = await Promise.all([
    // PAST EVENTS
    prisma.event.create({
      data: {
        title: 'Python Workshop for Beginners',
        description: 'Learn Python programming from scratch. Covered basics, data structures, and built a simple web scraper project. Perfect for first-year students!',
        clubId: clubs[0].id, // CodeCraft
        eventType: 'workshop',
        startDate: pastDate(20),
        endDate: pastDate(20),
        location: 'Computer Lab A-301',
        maxParticipants: 50,
        registrationDeadline: pastDate(22),
        pointsReward: 50,
        volunteerHours: 0,
        imageUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800',
        tags: ['python', 'programming', 'workshop', 'beginners'],
        skillAreas: ['Programming', 'Python', 'Web Scraping'],
        isPublished: true,
        requiresApproval: false,
        createdBy: clubAdmins[0].id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'HackNova 2024 - 24 Hour Hackathon',
        description: 'Our biggest hackathon of the year! Build innovative solutions, win prizes worth ₹1 Lakh. Teams competed across Web Dev, AI/ML, and IoT tracks.',
        clubId: clubs[0].id,
        eventType: 'hackathon',
        startDate: pastDate(15),
        endDate: pastDate(14),
        location: 'Innovation Center',
        maxParticipants: 120,
        registrationDeadline: pastDate(18),
        pointsReward: 150,
        volunteerHours: 0,
        imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
        tags: ['hackathon', 'coding', 'competition', 'prizes'],
        skillAreas: ['Full Stack', 'AI/ML', 'IoT', 'Problem Solving'],
        isPublished: true,
        requiresApproval: true,
        createdBy: clubAdmins[0].id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Dance Competition - Rhythm Wars',
        description: 'College-wide dance competition featuring solo, duet, and group categories. Witnessed amazing performances across various dance forms!',
        clubId: clubs[4].id, // Rhythmica
        eventType: 'competition',
        startDate: pastDate(10),
        endDate: pastDate(10),
        location: 'Main Auditorium',
        maxParticipants: 80,
        registrationDeadline: pastDate(13),
        pointsReward: 100,
        volunteerHours: 0,
        imageUrl: 'https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?w=800',
        tags: ['dance', 'competition', 'cultural', 'performance'],
        skillAreas: ['Dance', 'Performance', 'Stage Presence'],
        isPublished: true,
        requiresApproval: false,
        createdBy: clubAdmins[2].id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Tree Plantation Drive',
        description: 'Successfully planted 500+ trees in the college campus and nearby areas. Thank you to all volunteers who made this possible!',
        clubId: clubs[11].id, // Green Earth
        eventType: 'volunteering',
        startDate: pastDate(8),
        endDate: pastDate(8),
        location: 'College Campus & Nearby Park',
        maxParticipants: 100,
        registrationDeadline: pastDate(10),
        pointsReward: 30,
        volunteerHours: 4,
        imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
        tags: ['environment', 'volunteering', 'social-service', 'plantation'],
        skillAreas: ['Environmental Awareness', 'Teamwork'],
        isPublished: true,
        requiresApproval: false,
        createdBy: students[5].id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'AI in Healthcare - Guest Lecture',
        description: 'Industry expert Dr. Rajesh Malhotra discussed applications of AI/ML in medical diagnosis, drug discovery, and personalized medicine.',
        clubId: clubs[1].id, // AI & ML
        eventType: 'seminar',
        startDate: pastDate(5),
        endDate: pastDate(5),
        location: 'Seminar Hall B-101',
        maxParticipants: 150,
        registrationDeadline: pastDate(7),
        pointsReward: 40,
        volunteerHours: 0,
        imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
        tags: ['AI', 'healthcare', 'seminar', 'guest-lecture'],
        skillAreas: ['Artificial Intelligence', 'Healthcare Tech'],
        isPublished: true,
        requiresApproval: false,
        createdBy: clubAdmins[0].id,
      },
    }),

    // ONGOING/RECENT EVENTS
    prisma.event.create({
      data: {
        title: 'Inter-College Cricket Tournament',
        description: 'Annual cricket championship with teams from 8 colleges. Currently in semi-finals! Come support our team at the finals this weekend.',
        clubId: clubs[7].id, // Cricket
        eventType: 'sports_event',
        startDate: pastDate(2),
        endDate: futureDate(2),
        location: 'College Sports Ground',
        maxParticipants: 200,
        registrationDeadline: pastDate(10),
        pointsReward: 80,
        volunteerHours: 0,
        imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800',
        tags: ['cricket', 'sports', 'inter-college', 'tournament'],
        skillAreas: ['Cricket', 'Sportsmanship', 'Teamwork'],
        isPublished: true,
        requiresApproval: false,
        createdBy: superAdmin.id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Photography Exhibition - "Perspectives"',
        description: 'Showcasing the best photography work by our club members. Exhibition features landscape, portrait, wildlife, and street photography.',
        clubId: clubs[15].id, // Shutterbugs
        eventType: 'cultural_event',
        startDate: pastDate(1),
        endDate: futureDate(3),
        location: 'Art Gallery, Building C',
        maxParticipants: 300,
        registrationDeadline: null,
        pointsReward: 20,
        volunteerHours: 0,
        imageUrl: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800',
        tags: ['photography', 'exhibition', 'art', 'visual-arts'],
        skillAreas: ['Photography', 'Visual Arts'],
        isPublished: true,
        requiresApproval: false,
        createdBy: students[9].id,
      },
    }),

    // UPCOMING EVENTS
    prisma.event.create({
      data: {
        title: 'Web Development Bootcamp',
        description: 'Intensive 3-day bootcamp covering HTML, CSS, JavaScript, React, and Node.js. Build a full-stack project and deploy it live!',
        clubId: clubs[0].id, // CodeCraft
        eventType: 'workshop',
        startDate: futureDate(5),
        endDate: futureDate(7),
        location: 'Computer Lab A-301 & A-302',
        maxParticipants: 60,
        registrationDeadline: futureDate(3),
        pointsReward: 120,
        volunteerHours: 0,
        imageUrl: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=800',
        tags: ['web-development', 'bootcamp', 'react', 'nodejs', 'fullstack'],
        skillAreas: ['Web Development', 'React', 'Node.js', 'Full Stack'],
        isPublished: true,
        requiresApproval: false,
        createdBy: clubAdmins[0].id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Cybersecurity CTF Challenge',
        description: 'Capture The Flag competition! Solve challenges in cryptography, web exploitation, reverse engineering, and forensics. Prizes for top 3 teams!',
        clubId: clubs[3].id, // CyberSec
        eventType: 'competition',
        startDate: futureDate(7),
        endDate: futureDate(7),
        location: 'Online & Lab D-201',
        maxParticipants: 80,
        registrationDeadline: futureDate(5),
        pointsReward: 100,
        volunteerHours: 0,
        imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
        tags: ['cybersecurity', 'ctf', 'hacking', 'competition'],
        skillAreas: ['Cybersecurity', 'Ethical Hacking', 'Problem Solving'],
        isPublished: true,
        requiresApproval: true,
        createdBy: clubAdmins[1].id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Robotics Workshop - Line Following Robot',
        description: 'Hands-on workshop on building and programming line-following robots using Arduino. Learn sensor integration and PID control!',
        clubId: clubs[2].id, // Robotics
        eventType: 'workshop',
        startDate: futureDate(10),
        endDate: futureDate(10),
        location: 'Electronics Lab E-102',
        maxParticipants: 40,
        registrationDeadline: futureDate(8),
        pointsReward: 70,
        volunteerHours: 0,
        imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
        tags: ['robotics', 'arduino', 'workshop', 'electronics'],
        skillAreas: ['Robotics', 'Arduino', 'Electronics', 'Programming'],
        isPublished: true,
        requiresApproval: false,
        createdBy: clubAdmins[1].id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Annual Cultural Fest - "Utsav 2024"',
        description: 'Our biggest cultural extravaganza! Dance, music, drama, fashion show, and more. 3 days of non-stop entertainment and performances!',
        clubId: clubs[4].id, // Rhythmica
        eventType: 'cultural_event',
        startDate: futureDate(12),
        endDate: futureDate(14),
        location: 'Open Air Theater',
        maxParticipants: 500,
        registrationDeadline: futureDate(10),
        pointsReward: 150,
        volunteerHours: 0,
        imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
        tags: ['cultural-fest', 'dance', 'music', 'performances', 'annual-event'],
        skillAreas: ['Performance', 'Cultural Arts', 'Event Management'],
        isPublished: true,
        requiresApproval: false,
        createdBy: clubAdmins[2].id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Blood Donation Camp',
        description: 'Save lives by donating blood! Organized in partnership with City Blood Bank. All donors receive certificates and refreshments.',
        clubId: clubs[12].id, // Seva Foundation
        eventType: 'volunteering',
        startDate: futureDate(15),
        endDate: futureDate(15),
        location: 'Medical Center',
        maxParticipants: 150,
        registrationDeadline: futureDate(13),
        pointsReward: 50,
        volunteerHours: 2,
        imageUrl: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800',
        tags: ['blood-donation', 'volunteering', 'social-service', 'healthcare'],
        skillAreas: ['Social Service', 'Healthcare Awareness'],
        isPublished: true,
        requiresApproval: false,
        createdBy: students[5].id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Startup Pitch Competition',
        description: 'Present your startup ideas to investors and industry experts. Win seed funding up to ₹5 Lakhs and mentorship opportunities!',
        clubId: clubs[13].id, // StartUp Incubator
        eventType: 'competition',
        startDate: futureDate(18),
        endDate: futureDate(18),
        location: 'Conference Hall',
        maxParticipants: 50,
        registrationDeadline: futureDate(15),
        pointsReward: 120,
        volunteerHours: 0,
        imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800',
        tags: ['startup', 'entrepreneurship', 'pitch', 'competition', 'funding'],
        skillAreas: ['Entrepreneurship', 'Business Planning', 'Pitching'],
        isPublished: true,
        requiresApproval: true,
        createdBy: clubAdmins[2].id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Machine Learning Study Group',
        description: 'Weekly study sessions on ML algorithms, deep learning, and practical implementations. This week: Neural Networks from Scratch!',
        clubId: clubs[1].id, // AI & ML
        eventType: 'workshop',
        startDate: futureDate(20),
        endDate: futureDate(20),
        location: 'Lab A-305',
        maxParticipants: 35,
        registrationDeadline: futureDate(19),
        pointsReward: 30,
        volunteerHours: 0,
        imageUrl: 'https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=800',
        tags: ['machine-learning', 'AI', 'study-group', 'neural-networks'],
        skillAreas: ['Machine Learning', 'Deep Learning', 'Python'],
        isPublished: true,
        requiresApproval: false,
        createdBy: clubAdmins[0].id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Music Concert - "Melodic Nights"',
        description: 'Live performances by college bands and solo artists. Featuring rock, pop, classical, and fusion music. Open to all!',
        clubId: clubs[5].id, // Melodia
        eventType: 'cultural_event',
        startDate: futureDate(22),
        endDate: futureDate(22),
        location: 'Main Auditorium',
        maxParticipants: 400,
        registrationDeadline: null,
        pointsReward: 40,
        volunteerHours: 0,
        imageUrl: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=800',
        tags: ['music', 'concert', 'performance', 'live-music'],
        skillAreas: ['Music', 'Performance'],
        isPublished: true,
        requiresApproval: false,
        createdBy: clubAdmins[2].id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Mathematics Olympiad Preparation',
        description: 'Intensive preparation sessions for upcoming math olympiads. Problem-solving techniques and past year questions discussion.',
        clubId: clubs[9].id, // Mathematics Circle
        eventType: 'workshop',
        startDate: futureDate(25),
        endDate: futureDate(25),
        location: 'Classroom B-205',
        maxParticipants: 30,
        registrationDeadline: futureDate(23),
        pointsReward: 50,
        volunteerHours: 0,
        imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
        tags: ['mathematics', 'olympiad', 'competition-prep', 'problem-solving'],
        skillAreas: ['Mathematics', 'Problem Solving', 'Logical Thinking'],
        isPublished: true,
        requiresApproval: false,
        createdBy: students[5].id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Street Play on Social Issues',
        description: 'Theatrical street performances addressing social issues like gender equality, environmental conservation, and mental health awareness.',
        clubId: clubs[6].id, // Theatrica
        eventType: 'cultural_event',
        startDate: futureDate(28),
        endDate: futureDate(28),
        location: 'College Plaza',
        maxParticipants: 100,
        registrationDeadline: futureDate(26),
        pointsReward: 60,
        volunteerHours: 0,
        imageUrl: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800',
        tags: ['drama', 'street-play', 'social-awareness', 'theatre'],
        skillAreas: ['Acting', 'Theatre', 'Social Awareness'],
        isPublished: true,
        requiresApproval: false,
        createdBy: superAdmin.id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Innovation Summit 2024',
        description: 'Showcase your innovative projects and research! Poster presentations, product demos, and networking with faculty and industry professionals.',
        clubId: clubs[10].id, // Innovators Lab
        eventType: 'conference',
        startDate: futureDate(30),
        endDate: futureDate(30),
        location: 'Innovation Center',
        maxParticipants: 100,
        registrationDeadline: futureDate(27),
        pointsReward: 100,
        volunteerHours: 0,
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
        tags: ['innovation', 'research', 'conference', 'project-showcase'],
        skillAreas: ['Research', 'Innovation', 'Presentation'],
        isPublished: true,
        requiresApproval: true,
        createdBy: clubAdmins[0].id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Fitness Challenge - 30 Days Transformation',
        description: 'Join our 30-day fitness challenge! Daily workout sessions, diet plans, and progress tracking. Transform your lifestyle!',
        clubId: clubs[8].id, // Fitness Freaks
        eventType: 'sports_event',
        startDate: futureDate(35),
        endDate: futureDate(65),
        location: 'College Gym',
        maxParticipants: 50,
        registrationDeadline: futureDate(33),
        pointsReward: 200,
        volunteerHours: 0,
        imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
        tags: ['fitness', 'workout', 'health', 'challenge'],
        skillAreas: ['Fitness', 'Discipline', 'Health Management'],
        isPublished: true,
        requiresApproval: false,
        createdBy: students[4].id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Art Exhibition - "Colors of Imagination"',
        description: 'Annual art exhibition featuring paintings, sculptures, and digital art by talented student artists. All artworks available for sale!',
        clubId: clubs[14].id, // Artistry
        eventType: 'cultural_event',
        startDate: futureDate(40),
        endDate: futureDate(42),
        location: 'Art Gallery',
        maxParticipants: 200,
        registrationDeadline: null,
        pointsReward: 30,
        volunteerHours: 0,
        imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800',
        tags: ['art', 'exhibition', 'paintings', 'visual-arts'],
        skillAreas: ['Visual Arts', 'Creativity'],
        isPublished: true,
        requiresApproval: false,
        createdBy: students[7].id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Creative Writing Workshop',
        description: 'Learn storytelling techniques, poetry writing, and publishing your work. Session by published author and alumni Kritika Desai.',
        clubId: clubs[16].id, // Literary Society
        eventType: 'workshop',
        startDate: futureDate(45),
        endDate: futureDate(45),
        location: 'Library Seminar Room',
        maxParticipants: 40,
        registrationDeadline: futureDate(43),
        pointsReward: 60,
        volunteerHours: 0,
        imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
        tags: ['writing', 'creative-writing', 'literature', 'workshop'],
        skillAreas: ['Creative Writing', 'Storytelling', 'Literature'],
        isPublished: true,
        requiresApproval: false,
        createdBy: students[7].id,
      },
    }),
  ]);

  console.log(`✅ Created ${events.length} events\n`);

  // ==================== EVENT REGISTRATIONS ====================
  console.log('📝 Creating event registrations...');

  const registrations = [];

  // Past Event: Python Workshop - High attendance
  for (let i = 0; i < 8; i++) {
    registrations.push({
      userId: students[i].id,
      eventId: events[0].id,
      status: RegistrationStatus.attended,
      attended: true,
      attendanceMarkedBy: clubAdmins[0].id,
      attendanceMarkedAt: pastDate(20),
      attendanceMethod: AttendanceMethod.manual,
      checkInTime: pastDate(20),
      pointsAwarded: 50,
      volunteerHoursAwarded: 0,
    });
  }

  // Past Event: Hackathon - Mix of attended and no-show
  for (let i = 0; i < 7; i++) {
    registrations.push({
      userId: students[i].id,
      eventId: events[1].id,
      status: i < 5 ? RegistrationStatus.attended : RegistrationStatus.no_show,
      attended: i < 5,
      attendanceMarkedBy: clubAdmins[0].id,
      attendanceMarkedAt: pastDate(14),
      attendanceMethod: AttendanceMethod.qr_code,
      checkInTime: i < 5 ? pastDate(15) : null,
      pointsAwarded: i < 5 ? 150 : 0,
      volunteerHoursAwarded: 0,
    });
  }

  // Past Event: Dance Competition
  for (let i = 0; i < 6; i++) {
    registrations.push({
      userId: students[i].id,
      eventId: events[2].id,
      status: RegistrationStatus.attended,
      attended: true,
      attendanceMarkedBy: clubAdmins[2].id,
      attendanceMarkedAt: pastDate(10),
      attendanceMethod: AttendanceMethod.manual,
      checkInTime: pastDate(10),
      pointsAwarded: 100,
      volunteerHoursAwarded: 0,
    });
  }

  // Past Event: Tree Plantation - Volunteer hours
  for (let i = 0; i < 9; i++) {
    registrations.push({
      userId: students[i].id,
      eventId: events[3].id,
      status: RegistrationStatus.attended,
      attended: true,
      attendanceMarkedBy: students[5].id,
      attendanceMarkedAt: pastDate(8),
      attendanceMethod: AttendanceMethod.manual,
      checkInTime: pastDate(8),
      pointsAwarded: 30,
      volunteerHoursAwarded: 4,
    });
  }

  // Past Event: AI Seminar
  for (let i = 0; i < 10; i++) {
    registrations.push({
      userId: students[i].id,
      eventId: events[4].id,
      status: i < 8 ? RegistrationStatus.attended : RegistrationStatus.no_show,
      attended: i < 8,
      attendanceMarkedBy: clubAdmins[0].id,
      attendanceMarkedAt: pastDate(5),
      attendanceMethod: AttendanceMethod.qr_code,
      checkInTime: i < 8 ? pastDate(5) : null,
      pointsAwarded: i < 8 ? 40 : 0,
      volunteerHoursAwarded: 0,
    });
  }

  // Ongoing: Cricket Tournament
  for (let i = 0; i < 6; i++) {
    registrations.push({
      userId: students[i].id,
      eventId: events[5].id,
      status: RegistrationStatus.registered,
      attended: false,
      pointsAwarded: 0,
      volunteerHoursAwarded: 0,
    });
  }

  // Ongoing: Photography Exhibition
  for (let i = 0; i < 5; i++) {
    registrations.push({
      userId: students[i].id,
      eventId: events[6].id,
      status: RegistrationStatus.registered,
      attended: false,
      pointsAwarded: 0,
      volunteerHoursAwarded: 0,
    });
  }

  // Upcoming: Web Dev Bootcamp
  for (let i = 0; i < 8; i++) {
    registrations.push({
      userId: students[i].id,
      eventId: events[7].id,
      status: RegistrationStatus.registered,
      attended: false,
      pointsAwarded: 0,
      volunteerHoursAwarded: 0,
    });
  }

  // Upcoming: CTF Challenge
  for (let i = 0; i < 6; i++) {
    registrations.push({
      userId: students[i].id,
      eventId: events[8].id,
      status: RegistrationStatus.registered,
      attended: false,
      pointsAwarded: 0,
      volunteerHoursAwarded: 0,
    });
  }

  // Upcoming: Cultural Fest
  for (let i = 0; i < 10; i++) {
    registrations.push({
      userId: students[i].id,
      eventId: events[10].id,
      status: RegistrationStatus.registered,
      attended: false,
      pointsAwarded: 0,
      volunteerHoursAwarded: 0,
    });
  }

  // Upcoming: Blood Donation
  for (let i = 0; i < 7; i++) {
    registrations.push({
      userId: students[i].id,
      eventId: events[11].id,
      status: RegistrationStatus.registered,
      attended: false,
      pointsAwarded: 0,
      volunteerHoursAwarded: 0,
    });
  }

  // Add club admin registrations
  registrations.push(
    {
      userId: clubAdmins[0].id,
      eventId: events[0].id,
      status: RegistrationStatus.attended,
      attended: true,
      checkInTime: pastDate(20),
      pointsAwarded: 50,
      volunteerHoursAwarded: 0,
    },
    {
      userId: clubAdmins[1].id,
      eventId: events[8].id,
      status: RegistrationStatus.registered,
      attended: false,
      pointsAwarded: 0,
      volunteerHoursAwarded: 0,
    },
    {
      userId: clubAdmins[2].id,
      eventId: events[10].id,
      status: RegistrationStatus.registered,
      attended: false,
      pointsAwarded: 0,
      volunteerHoursAwarded: 0,
    }
  );

  await prisma.eventRegistration.createMany({ data: registrations });

  console.log(`✅ Created ${registrations.length} event registrations\n`);

  // ==================== POINTS HISTORY ====================
  console.log('🏆 Creating points history...');

  const pointsHistory = registrations
    .filter(r => r.pointsAwarded > 0)
    .map(r => ({
      userId: r.userId,
      eventId: r.eventId,
      pointsEarned: r.pointsAwarded,
      volunteerHoursEarned: r.volunteerHoursAwarded,
      reason: 'Event attendance',
      createdAt: r.checkInTime || new Date(),
    }));

  await prisma.pointsHistory.createMany({ data: pointsHistory });

  console.log(`✅ Created ${pointsHistory.length} points history records\n`);

  // ==================== BADGES ====================
  console.log('🎖️  Creating badges...');

  const badges = await Promise.all([
    prisma.badge.create({
      data: {
        name: 'Early Adopter',
        description: 'Joined the platform in the first month',
        icon: '🌟',
        criteria: JSON.stringify({ type: 'early_user', days: 30 }),
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Event Enthusiast',
        description: 'Attended 10+ events',
        icon: '🎉',
        criteria: JSON.stringify({ type: 'events_attended', count: 10 }),
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Volunteer Hero',
        description: 'Completed 20+ volunteer hours',
        icon: '❤️',
        criteria: JSON.stringify({ type: 'volunteer_hours', hours: 20 }),
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Point Master',
        description: 'Earned 500+ points',
        icon: '⭐',
        criteria: JSON.stringify({ type: 'total_points', points: 500 }),
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Club Leader',
        description: 'President or Vice President of a club',
        icon: '👑',
        criteria: JSON.stringify({ type: 'club_role', role: ['president', 'vice_president'] }),
      },
    }),
  ]);

  // Award badges to deserving users
  const userBadges = [
    { userId: clubAdmins[0].id, badgeId: badges[1].id }, // Event Enthusiast
    { userId: clubAdmins[0].id, badgeId: badges[3].id }, // Point Master
    { userId: clubAdmins[0].id, badgeId: badges[4].id }, // Club Leader
    { userId: students[5].id, badgeId: badges[2].id }, // Volunteer Hero
    { userId: students[5].id, badgeId: badges[4].id }, // Club Leader
    { userId: students[7].id, badgeId: badges[4].id }, // Club Leader
  ];

  await prisma.userBadge.createMany({ data: userBadges });

  console.log(`✅ Created ${badges.length} badges and ${userBadges.length} user badges\n`);

  // ==================== NOTIFICATIONS ====================
  console.log('🔔 Creating notifications...');

  const notifications = [];
  for (const student of students.slice(0, 5)) {
    notifications.push(
      {
        userId: student.id,
        title: 'Welcome to ClubHub!',
        message: 'Start exploring clubs and events. Join clubs that match your interests!',
        type: 'system_notification',
        isRead: true,
        createdAt: pastDate(25),
      },
      {
        userId: student.id,
        title: 'New Event: Web Development Bootcamp',
        message: 'CodeCraft is organizing a 3-day Web Development Bootcamp. Register now!',
        type: 'event_reminder',
        isRead: false,
        actionUrl: `/events/${events[7].id}`,
        createdAt: futureDate(-1),
      },
      {
        userId: student.id,
        title: 'Event Reminder: Cultural Fest Tomorrow!',
        message: 'Don\'t miss Utsav 2024 starting tomorrow. Check your registration details.',
        type: 'event_reminder',
        isRead: false,
        actionUrl: `/events/${events[10].id}`,
        createdAt: futureDate(11),
      }
    );
  }

  await prisma.notification.createMany({ data: notifications });

  console.log(`✅ Created ${notifications.length} notifications\n`);

  // ==================== EVENT FEEDBACK ====================
  console.log('💬 Creating event feedback...');

  const feedbackData = [
    {
      userId: students[0].id,
      eventId: events[0].id,
      rating: 5,
      feedback: 'Excellent workshop! The instructor explained concepts very clearly and the hands-on project was super helpful.',
      anonymous: false,
    },
    {
      userId: students[1].id,
      eventId: events[0].id,
      rating: 4,
      feedback: 'Great content, but could have been a bit longer. Would love more advanced topics next time.',
      anonymous: false,
    },
    {
      userId: students[0].id,
      eventId: events[1].id,
      rating: 5,
      feedback: 'Amazing hackathon experience! Great organization, helpful mentors, and exciting challenges.',
      anonymous: false,
    },
    {
      userId: students[2].id,
      eventId: events[1].id,
      rating: 5,
      feedback: 'Best hackathon I\'ve participated in. The prizes were great and learned a lot from other teams!',
      anonymous: true,
    },
    {
      userId: students[1].id,
      eventId: events[2].id,
      rating: 5,
      feedback: 'Fantastic performances by all participants! The energy was incredible.',
      anonymous: false,
    },
    {
      userId: students[3].id,
      eventId: events[3].id,
      rating: 4,
      feedback: 'Meaningful activity. Felt good contributing to the environment. Could have had better tools.',
      anonymous: false,
    },
    {
      userId: students[4].id,
      eventId: events[4].id,
      rating: 5,
      feedback: 'Very insightful seminar. The guest speaker shared real-world applications of AI in healthcare.',
      anonymous: true,
    },
  ];

  await prisma.eventFeedback.createMany({ data: feedbackData });

  console.log(`✅ Created ${feedbackData.length} event feedback entries\n`);

  // ==================== CHAT ROOMS & MESSAGES ====================
  console.log('💬 Creating chat rooms and messages...');

  const chatRooms = await Promise.all([
    prisma.chatRoom.create({
      data: {
        clubId: clubs[0].id,
        name: 'General Discussion',
        description: 'Main chat room for CodeCraft members',
      },
    }),
    prisma.chatRoom.create({
      data: {
        clubId: clubs[0].id,
        name: 'Hackathon Planning',
        description: 'Coordination for upcoming hackathons',
      },
    }),
    prisma.chatRoom.create({
      data: {
        clubId: clubs[4].id,
        name: 'Dance Rehearsals',
        description: 'Schedule and coordinate practice sessions',
      },
    }),
  ]);

  const chatMessages = [
    {
      chatRoomId: chatRooms[0].id,
      userId: clubAdmins[0].id,
      content: 'Hey everyone! Welcome to CodeCraft chat. Feel free to discuss projects and share resources here.',
      createdAt: pastDate(15),
    },
    {
      chatRoomId: chatRooms[0].id,
      userId: students[0].id,
      content: 'Thanks! Excited to be part of this club. Looking forward to the upcoming events.',
      createdAt: pastDate(15),
    },
    {
      chatRoomId: chatRooms[0].id,
      userId: students[1].id,
      content: 'Can someone share the Python workshop materials? I missed the last session.',
      createdAt: pastDate(14),
    },
    {
      chatRoomId: chatRooms[1].id,
      userId: clubAdmins[0].id,
      content: 'Planning meeting for HackNova tomorrow at 4 PM. All core members please attend.',
      createdAt: pastDate(17),
    },
    {
      chatRoomId: chatRooms[2].id,
      userId: clubAdmins[2].id,
      content: 'Dance practice scheduled for this Saturday at 5 PM. Don\'t be late!',
      createdAt: pastDate(12),
    },
  ];

  await prisma.chatMessage.createMany({ data: chatMessages });

  console.log(`✅ Created ${chatRooms.length} chat rooms and ${chatMessages.length} messages\n`);

  // ==================== ANNOUNCEMENTS ====================
  console.log('📢 Creating announcements...');

  const announcements = [
    {
      title: 'Welcome to ClubHub Platform!',
      content: 'We are excited to launch ClubHub - your one-stop platform for all club and event activities. Explore clubs, register for events, and track your participation!',
      type: 'general',
      isActive: true,
      createdBy: superAdmin.id,
      createdAt: pastDate(30),
    },
    {
      title: 'Cultural Fest Registration Open',
      content: 'Utsav 2024 registrations are now open! Don\'t miss our biggest cultural extravaganza. Register for events today!',
      type: 'urgent',
      isActive: true,
      createdBy: superAdmin.id,
      createdAt: pastDate(5),
    },
    {
      title: 'System Maintenance Scheduled',
      content: 'Platform maintenance scheduled for next Sunday 2 AM - 4 AM. Services may be temporarily unavailable.',
      type: 'maintenance',
      isActive: true,
      createdBy: superAdmin.id,
      createdAt: pastDate(2),
    },
  ];

  await prisma.announcement.createMany({ data: announcements });

  console.log(`✅ Created ${announcements.length} announcements\n`);

  // ==================== SUMMARY ====================
  console.log('✨ Seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   👥 Users: ${students.length + clubAdmins.length + 1}`);
  console.log(`   🏛️  Clubs: ${clubs.length}`);
  console.log(`   📅 Events: ${events.length}`);
  console.log(`   🎫 Event Registrations: ${registrations.length}`);
  console.log(`   🏆 Points History: ${pointsHistory.length}`);
  console.log(`   🎖️  Badges: ${badges.length}`);
  console.log(`   🔔 Notifications: ${notifications.length}`);
  console.log(`   💬 Feedback: ${feedbackData.length}`);
  console.log(`   💭 Chat Rooms: ${chatRooms.length}`);
  console.log(`   📢 Announcements: ${announcements.length}\n`);

  console.log('🔑 Login Credentials:');
  console.log('   Super Admin: admin@college.edu / password123');
  console.log('   Club Admin: priya.sharma@college.edu / password123');
  console.log('   Student: arjun.singh@college.edu / password123');
  console.log('   (All users have password: password123)\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });